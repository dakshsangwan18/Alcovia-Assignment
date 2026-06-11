import { db, type StoredOp } from "./db";
import type { Operation } from "../../shared/types";

function generateId(): string {
  return crypto.randomUUID();
}

async function storeOp(
  type: Operation["type"],
  entityId: string,
  payload: Record<string, unknown>,
  deviceId: string,
  lamport: number,
): Promise<StoredOp> {
  const op: StoredOp = {
    operationId: generateId(),
    deviceId,
    lamportTimestamp: lamport,
    entityId,
    type,
    payload,
    clientTimestamp: new Date().toISOString(),
    synced: false,
  };
  await db.operations.put(op);
  return op;
}

async function unsyncedOps(): Promise<StoredOp[]> {
  return db.operations.where({ synced: false }).toArray();
}

async function allOps(): Promise<StoredOp[]> {
  return db.operations.toArray();
}

async function markSynced(opId: string): Promise<void> {
  await db.operations.update(opId, { synced: true });
}

async function hasOp(opId: string): Promise<boolean> {
  const op = await db.operations.get(opId);
  return op !== undefined;
}

export { generateId, storeOp, unsyncedOps, allOps, markSynced, hasOp };
