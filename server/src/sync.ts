import type { Request, Response } from "express";
import type { Operation, ServerOperation, SyncRequest, SyncResponse } from "../../shared/types.js";
import type { ServerState } from "./store.js";
import { addOperation, getOpsSince, persistState } from "./store.js";
import { processRewards } from "./rewards.js";
import { triggerOutboxProcessing } from "./outbox.js";

function validateSyncBody(body: unknown): body is SyncRequest {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.studentId === "string" &&
    typeof b.deviceId === "string" &&
    typeof b.lastPulledSeqNo === "number" &&
    Array.isArray(b.operations)
  );
}

export function syncHandler(
  req: Request,
  res: Response,
  state: ServerState,
): void {
  if (!validateSyncBody(req.body)) {
    res.status(400).json({ error: "Invalid sync request body" });
    return;
  }

  const { studentId, deviceId: _deviceId, lastPulledSeqNo, operations } = req.body;

  const newOps: Operation[] = [];
  for (const op of operations) {
    if (state.operations.has(op.operationId)) continue;
    const serverOp: ServerOperation = {
      ...op,
      serverSeqNo: 0,
      studentId,
    };
    addOperation(state, serverOp);
    newOps.push(op);
  }

  processRewards(state, newOps, studentId);

  const pullOps = getOpsSince(state, lastPulledSeqNo);

  persistState(state);

  const response: SyncResponse = {
    operations: pullOps,
    currentSeqNo: state.currentSeqNo,
  };
  res.json(response);

  triggerOutboxProcessing(state);
}
