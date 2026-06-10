import type { Operation, FocusSession } from "../../shared/types.js";
import { rebuildState } from "../../shared/reducers/rebuild.js";
import { focusSessionReducer } from "../../shared/reducers/focus.js";
import type { ServerState } from "./store.js";

function computeSessionState(
  state: ServerState,
  sessionId: string,
): FocusSession | null {
  const ops: Operation[] = [];
  for (const op of state.operations.values()) {
    if (op.entityId === sessionId) ops.push(op);
  }
  ops.sort(
    (a, b) =>
      a.lamportTimestamp - b.lamportTimestamp ||
      a.deviceId.localeCompare(b.deviceId),
  );

  let session: FocusSession | null = null;
  for (const op of ops) {
    session = focusSessionReducer(session, op);
  }
  return session;
}

export function processRewards(
  state: ServerState,
  newOps: Operation[],
  studentId: string,
): void {
  for (const op of newOps) {
    if (op.type !== "FOCUS_COMPLETED") continue;
    const sessionId = op.entityId;
    if (state.rewardedSessions.has(sessionId)) continue;

    const session = computeSessionState(state, sessionId);
    if (!session || session.status !== "success") continue;

    state.rewardedSessions.add(sessionId);

    const allOps = [...state.operations.values()];
    const { stats } = rebuildState(allOps);

    state.notificationOutbox.push({
      sessionId,
      studentId,
      status: "pending",
      attemptCount: 0,
      lastAttemptAt: null,
      payload: {
        sessionId,
        studentId,
        streak: stats.focusStreak,
        coins: stats.coins,
        idempotencyKey: sessionId,
      },
    });
  }
}
