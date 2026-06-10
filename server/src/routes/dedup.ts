import type { Request, Response } from "express";
import type { ServerState } from "../store.js";

export function dedupHandler(
  req: Request,
  res: Response,
  state: ServerState,
): void {
  const sessionId = req.query.sessionId as string | undefined;
  if (!sessionId) {
    res.status(400).json({ error: "Missing sessionId query param" });
    return;
  }

  const outboxEntry = state.notificationOutbox.find(
    (e) => e.sessionId === sessionId && e.status === "sent",
  );
  if (outboxEntry) {
    res.json({ alreadyNotified: true });
    return;
  }

  const logEntry = state.notificationLog.find(
    (e) => e.sessionId === sessionId,
  );
  res.json({ alreadyNotified: !!logEntry });
}
