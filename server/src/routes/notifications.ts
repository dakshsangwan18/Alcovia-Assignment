import type { Request, Response } from "express";
import type { ServerState } from "../store.js";
import { persistState } from "../store.js";

function getNotifications(_req: Request, res: Response, state: ServerState): void {
  res.json(state.notificationLog);
}

function addNotification(
  req: Request,
  res: Response,
  state: ServerState,
): void {
  const { sessionId, studentId, message } = req.body;
  if (!sessionId || !studentId || !message) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const exists = state.notificationLog.find(
    (e) => e.sessionId === sessionId,
  );
  if (exists) {
    res.json({ success: true, duplicate: true });
    return;
  }

  state.notificationLog.push({
    sessionId,
    studentId,
    message,
    timestamp: new Date().toISOString(),
  });
  persistState(state);
  res.json({ success: true, duplicate: false });
}

export const notificationHandlers = { get: getNotifications, post: addNotification };
