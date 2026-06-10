import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type {
  ServerOperation,
  NotificationOutboxEntry,
  NotificationEntry,
} from "../../shared/types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, "..", "..", "data");
const STATE_FILE = path.join(DATA_DIR, "state.json");
const TMP_FILE = path.join(DATA_DIR, "state.tmp.json");

export interface ServerState {
  operations: Map<string, ServerOperation>;
  operationsBySeqNo: Map<number, string>;
  currentSeqNo: number;
  rewardedSessions: Set<string>;
  notificationOutbox: NotificationOutboxEntry[];
  notificationLog: NotificationEntry[];
}

function defaultState(): ServerState {
  return {
    operations: new Map(),
    operationsBySeqNo: new Map(),
    currentSeqNo: 0,
    rewardedSessions: new Set(),
    notificationOutbox: [],
    notificationLog: [],
  };
}

function serialise(state: ServerState): string {
  return JSON.stringify({
    operations: [...state.operations.entries()],
    currentSeqNo: state.currentSeqNo,
    rewardedSessions: [...state.rewardedSessions],
    notificationOutbox: state.notificationOutbox,
    notificationLog: state.notificationLog,
  });
}

function deserialise(raw: string): ServerState {
  const data = JSON.parse(raw);
  const state = defaultState();
  if (Array.isArray(data.operations)) {
    for (const [k, v] of data.operations) {
      state.operations.set(k as string, v as ServerOperation);
      state.operationsBySeqNo.set(
        (v as ServerOperation).serverSeqNo,
        k as string,
      );
    }
  }
  if (typeof data.currentSeqNo === "number") state.currentSeqNo = data.currentSeqNo;
  if (Array.isArray(data.rewardedSessions)) {
    for (const s of data.rewardedSessions) state.rewardedSessions.add(s);
  }
  if (Array.isArray(data.notificationOutbox)) {
    state.notificationOutbox = data.notificationOutbox;
  }
  if (Array.isArray(data.notificationLog)) {
    state.notificationLog = data.notificationLog;
  }
  return state;
}

export function loadState(): ServerState {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return deserialise(fs.readFileSync(STATE_FILE, "utf-8"));
    }
  } catch (err) {
    console.error("Failed to load state, starting fresh:", err);
  }
  return defaultState();
}

export function persistState(state: ServerState): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(TMP_FILE, serialise(state), "utf-8");
  fs.renameSync(TMP_FILE, STATE_FILE);
}

export function addOperation(
  state: ServerState,
  op: ServerOperation,
): boolean {
  if (state.operations.has(op.operationId)) return false;
  state.currentSeqNo++;
  op.serverSeqNo = state.currentSeqNo;
  state.operations.set(op.operationId, op);
  state.operationsBySeqNo.set(op.serverSeqNo, op.operationId);
  return true;
}

export function getOpsSince(
  state: ServerState,
  since: number,
): ServerOperation[] {
  const ops: ServerOperation[] = [];
  for (let s = since + 1; s <= state.currentSeqNo; s++) {
    const opId = state.operationsBySeqNo.get(s);
    if (opId) ops.push(state.operations.get(opId)!);
  }
  return ops;
}
