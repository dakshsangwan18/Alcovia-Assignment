import Dexie, { type Table } from "dexie";
import type { Operation } from "@shared/types";
import { getClientId } from "../constants";

interface StoredOp extends Operation {
  synced: boolean;
}

interface MetaEntry {
  key: string;
  value: unknown;
}

class AlcoviaDB extends Dexie {
  operations!: Table<StoredOp, string>;
  metadata!: Table<MetaEntry, string>;

  constructor(clientId: string) {
    super(`alcovia_${clientId}`);
    this.version(1).stores({
      operations: "operationId, synced, entityId, lamportTimestamp",
      metadata: "key",
    });
  }
}

const clientId = getClientId();
const db = new AlcoviaDB(clientId);

export { db, clientId };
export type { StoredOp, MetaEntry };
