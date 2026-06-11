# Alcovia Offline-First Study App

Offline-first focus sessions and syllabus progress with two-device sync, Express backend, and n8n notification automation.

## Stack

TypeScript, React Native (Expo web), Express, n8n, Dexie.js

## Quick Start

### 1. Server

```bash
cd server
npm install
npm run dev
```

Runs on http://localhost:3001

### 2. App (two clients)

Open two terminal tabs:

```bash
cd app
npm install
npm run web
```

Open these in your browser:
- Device A: http://localhost:8081/?client=device-A
- Device B: Open an incognito window and go to http://localhost:8081/?client=device-B

### 3. n8n

```bash
bash scripts/start-n8n-dev.sh
```

Open http://localhost:5678. Import `n8n/n8n-workflow.json`. Activate the workflow.

For TLS in production: `bash scripts/start-n8n.sh` (requires `brew install mkcert nss && mkcert -install`).

## Architecture

- **Event-sourced operation log** — every mutation is an immutable operation
- **Deterministic reducers** — state rebuilt from operations, same input = same output
- **Lamport clocks** — conflict resolution ordering across devices
- **serverSeqNo watermark** — monotonic, unique, safe pull watermark
- **Delete-always-wins** — deleted tasks stay deleted
- **Outbox pattern** — at-least-once notification delivery with retry
- **IST timezone** — streak and today's focus minutes in Asia/Kolkata

## Conflict Cases Handled

| Scenario | Resolution |
|---|---|
| Same task, different status on two devices | Higher Lamport wins |
| Task edited on one device, deleted on another | Delete always wins |
| Duplicate sync message | operationId dedup |
| Out-of-order delivery | Reducer sorts by Lamport, not arrival |
| Same FOCUS_COMPLETED from both devices | rewardedSessions dedup |

## API

| Endpoint | Description |
|---|---|
| POST /api/sync | Push/pull operations |
| GET /api/state/:studentId | Debug state |
| GET /api/notification-log | View notifications |
| POST /api/notification-log | Log notification (mock sink) |
| GET /api/dedup-check?sessionId=... | Check if already notified |

## Dev Panel

Switch to the Dev tab in the app to:
- Toggle online/offline
- Manual sync
- View pending/synced operation counts, Lamport clock, sync cursor
- Inspect operation log and current state
