# DECISIONS.md

## Data/Sync Model

Event-sourced operation log. Every mutation is an immutable operation identified by a globally unique operationId (UUID). State is derived via deterministic reducers applied to the sorted operation log.

Operations are the source of truth. FocusSession and Task are projections of the operation log, recomputed on every change. Sync exchanges operations, not entities.

## Why Event Sourcing

Entity sync with version numbers was considered and rejected.

Rejected because:
- Harder idempotency: version numbers don't prevent duplicate processing. Operations with unique operationIds make dedup trivial at every layer.
- Harder conflict debugging: entity overwrites lose mutation history. Operations preserve every mutation.
- No audit trail: entity sync tells you the current state. Operations tell you how you got there.
- Harder convergence reasoning: version conflicts require reasoning about merge semantics. Operations reduce to: same set + same sort + same function = same state.

Chosen: immutable operation log + deterministic replay.
- Each operation has a unique operationId — dedup is a set lookup.
- Reducers are pure functions — same input always produces same output.
- Operations are never mutated — no in-place updates that could race.

## Sync Watermark

Monotonic server sequence number (serverSeqNo), not Lamport timestamp.

Lamport timestamps are not unique — multiple operations can share the same value, causing boundary misses in pull. serverSeqNo is assigned by the server on first acceptance, guaranteeing uniqueness and monotonicity. Client tracks lastPulledSeqNo and requests operations with serverSeqNo > lastPulledSeqNo.

Lamport timestamps determine conflict resolution ordering. serverSeqNo is purely a sync watermark.

## Conflict Resolution

Operations sorted by (lamportTimestamp ASC, deviceId ASC) and applied by the reducer in this order. Higher Lamport timestamp wins. Equal Lamport timestamps tiebreak by deviceId lexicographic order.

### Delete-always-wins

Once TASK_DELETED sets isDeleted=true, no subsequent TASK_STATUS_CHANGED can clear it. The reducer ignores status changes to deleted tasks.

Why: simpler mental model, no zombie tasks reappearing after sync, outcome independent of Lamport ordering. A deleted task stays deleted regardless of operation arrival order.

Sacrifice: edits on one device lost if another device deletes. For a study app where deletion is intentional and rare, this is acceptable.

## Why Two Devices Converge

1. Operations are immutable — created once, never modified.
2. Operations are uniquely identified — operationId enables dedup at every layer.
3. Devices eventually receive the same operation set — server stores the union, each device pulls until it has the full set.
4. Reducers are deterministic — same sorted operations produce same state.
5. Therefore: same operation set + deterministic reducer = identical state on every device.

## Idempotency

| Layer | Mechanism |
|---|---|
| Client pull | operationId dedup |
| Server push | operationId dedup |
| Server reward | rewardedSessions Set keyed by sessionId |
| Server outbox | pending/sent/failed status per entry, 5 retries |
| n8n dedup | GET /api/dedup-check checks notificationLog |

Notification delivery uses outbox pattern for at-least-once delivery. n8n dedup provides at-most-once processing. Combined: exactly-once notification delivery.

## Focus Session Validation

A session is rewarded only if the server computes its state via the shared reducer and confirms status === "success":
- FOCUS_STARTED exists
- FOCUS_COMPLETED exists
- No FOCUS_FAILED with higher Lamport timestamp
- Not already in rewardedSessions

Invalid completions are silently ignored.

## Focus Session Restart Behavior

On restart, active sessions are NOT auto-completed. They are auto-failed with "app_switch." We cannot verify focus after a crash. Same for backgrounding: >5 seconds → auto-fail with "app_switch."

## Timezone

Day boundaries for streak and today's focus minutes are computed in IST (Asia/Kolkata). Hardcoded for the single student demo.

## Seed Data

Server-owned. Determined on first startup. Clients receive syllabus only through sync. TASK_CREATED operations have deterministic operationIds ("seed-*") and entityIds, preventing duplication.

## Server Persistence

Single JSON file, written atomically (temp file + rename) after every sync transaction. Prevents double-reward and lost notifications on server crash.

## Sync Triggers

Automatic: network return (navigator.onLine), after every local operation (debounced 1s), periodic polling (30s). Manual: dev panel button.

## Notification Delivery

Outbox pattern. Server retries pending notifications up to 5 times. On success, marks sent. On failure after 5 attempts, marks failed. n8n dedup as defense-in-depth.

## Shared Reducers

Both client and server import from shared/. Prevents reducer drift. Server validates sessions with the same reducers the client uses for state reconstruction.

## Tradeoff: Operation Log vs Entity Sync

Benefits: natural idempotency, audit trail, atomic sync units, simple convergence proof.
Costs: unbounded log growth (needs compaction for production), slightly more complex reducers.

## Tradeoff: Delete Always Wins

Benefits: no zombie tasks, outcome independent of ordering, simpler convergence.
Costs: edits silently lost when another device deletes. Acceptable for a study app.
