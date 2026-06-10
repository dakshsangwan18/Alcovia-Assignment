import { db } from "./db";
import type { ActiveSessionMetadata } from "@shared/types";

async function getMeta<T = unknown>(key: string): Promise<T | undefined> {
  const entry = await db.metadata.get(key);
  return entry?.value as T | undefined;
}

async function setMeta(key: string, value: unknown): Promise<void> {
  await db.metadata.put({ key, value });
}

async function removeMeta(key: string): Promise<void> {
  await db.metadata.delete(key);
}

async function getClock(): Promise<number> {
  return (await getMeta<number>("lamportClock")) ?? 0;
}

async function bumpClock(): Promise<number> {
  const next = (await getClock()) + 1;
  await setMeta("lamportClock", next);
  return next;
}

async function updateClock(maxLamport: number): Promise<void> {
  const cur = await getClock();
  if (maxLamport > cur) await setMeta("lamportClock", maxLamport);
}

async function getWatermark(): Promise<number> {
  return (await getMeta<number>("lastPulledSeqNo")) ?? 0;
}

async function setWatermark(seqNo: number): Promise<void> {
  await setMeta("lastPulledSeqNo", seqNo);
}

async function getActiveSession(): Promise<ActiveSessionMetadata | undefined> {
  return getMeta<ActiveSessionMetadata>("activeSession");
}

async function setActiveSession(s: ActiveSessionMetadata): Promise<void> {
  await setMeta("activeSession", s);
}

async function clearActiveSession(): Promise<void> {
  await removeMeta("activeSession");
}

export {
  getMeta,
  setMeta,
  removeMeta,
  getClock,
  bumpClock,
  updateClock,
  getWatermark,
  setWatermark,
  getActiveSession,
  setActiveSession,
  clearActiveSession,
};
