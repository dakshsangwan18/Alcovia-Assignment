import type { FocusSession, Operation } from "../types";

export function focusSessionReducer(
  session: FocusSession | null,
  op: Operation,
): FocusSession | null {
  switch (op.type) {
    case "FOCUS_STARTED": {
      const p = op.payload;
      if (typeof p.targetDuration !== "number" || typeof p.startedAt !== "string") {
        return session;
      }
      return {
        id: op.entityId,
        targetDuration: p.targetDuration,
        startedAt: p.startedAt,
        status: "active",
      };
    }

    case "FOCUS_COMPLETED": {
      if (session === null) return null;
      const p = op.payload;
      if (typeof p.completedAt !== "string") return session;
      return { ...session, status: "success", completedAt: p.completedAt };
    }

    case "FOCUS_FAILED": {
      if (session === null) return null;
      const p = op.payload;
      if (
        typeof p.failedAt !== "string" ||
        (p.reason !== "give_up" && p.reason !== "app_switch")
      ) {
        return session;
      }
      return { ...session, status: "failed", failReason: p.reason, failedAt: p.failedAt };
    }

    default:
      return session;
  }
}
