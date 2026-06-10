import { API, STUDENT } from "../constants";
import { unsyncedOps, markSynced, hasOp } from "../storage/operations";
import { getWatermark, setWatermark, updateClock } from "../storage/metadata";
import type { Operation, SyncResponse } from "@shared/types";
import { clientId } from "../storage/db";

type OnStateChange = () => Promise<void>;

export function createSyncEngine(onChange: OnStateChange) {
  let online = true;

  async function sync(): Promise<void> {
    if (!online) return;

    const unsynced = await unsyncedOps();
    const watermark = await getWatermark();

    let res: Response;
    try {
      res = await fetch(`${API}/api/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: STUDENT,
          deviceId: clientId,
          lastPulledSeqNo: watermark,
          operations: unsynced,
        }),
      });
    } catch {
      return;
    }

    if (!res.ok) return;

    const data: SyncResponse = await res.json();

    for (const op of data.operations) {
      if (await hasOp(op.operationId)) continue;
      await dbPutOp(op);
    }

    if (data.operations.length > 0) {
      const maxLamport = data.operations.reduce(
        (m, o) => Math.max(m, o.lamportTimestamp),
        0,
      );
      await updateClock(maxLamport);
    }

    await setWatermark(data.currentSeqNo);

    for (const op of unsynced) {
      await markSynced(op.operationId);
    }

    onChange();
  }

  function setOnline(v: boolean): void {
    online = v;
    if (v) sync();
  }

  function isOnline(): boolean {
    return online;
  }

  return { sync, setOnline, isOnline };
}

async function dbPutOp(op: Operation & { serverSeqNo?: number }): Promise<void> {
  const { db } = await import("../storage/db");
  await db.operations.put({ ...op, synced: true });
}
