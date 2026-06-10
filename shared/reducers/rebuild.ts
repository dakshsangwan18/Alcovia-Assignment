import type { FocusSession, Operation, RebuiltState, StudentStats, SubjectProgress, Task } from "../types";
import { focusSessionReducer } from "./focus";
import { taskReducer } from "./task";

const TZ = "Asia/Kolkata";

function sortByLamport(a: Operation, b: Operation): number {
  const d = a.lamportTimestamp - b.lamportTimestamp;
  if (d !== 0) return d;
  if (a.deviceId < b.deviceId) return -1;
  if (a.deviceId > b.deviceId) return 1;
  if (a.operationId < b.operationId) return -1;
  if (a.operationId > b.operationId) return 1;
  return 0;
}

function istDate(d: Date): string {
  return d.toLocaleDateString("en-CA", { timeZone: TZ });
}

export function rebuildState(operations: Operation[]): RebuiltState {
  const sorted = [...operations].sort(sortByLamport);
  const sessions = new Map<string, FocusSession>();
  const tasks = new Map<string, Task>();

  for (const op of sorted) {
    if (op.type.startsWith("FOCUS_")) {
      const cur = sessions.get(op.entityId) ?? null;
      const next = focusSessionReducer(cur, op);
      if (next !== null) sessions.set(op.entityId, next);
      else sessions.delete(op.entityId);
    } else {
      const cur = tasks.get(op.entityId) ?? null;
      const next = taskReducer(cur, op);
      if (next !== null) tasks.set(op.entityId, next);
      else tasks.delete(op.entityId);
    }
  }

  return { sessions, tasks, stats: computeStats(sessions) };
}

export function computeStats(sessions: Map<string, FocusSession>): StudentStats {
  const success = [...sessions.values()].filter((s) => s.status === "success");
  const coins = success.length * 50;

  const today = istDate(new Date());
  const todayMins = success
    .filter((s) => s.completedAt && istDate(new Date(s.completedAt)) === today)
    .reduce((sum, s) => sum + s.targetDuration, 0);

  const daySet = new Set<string>();
  for (const s of success) {
    if (s.completedAt) daySet.add(istDate(new Date(s.completedAt)));
  }

  let streak = 0;
  const now = Date.now();
  for (let d = 0; d < 365; d++) {
    const check = new Date(now - d * 86400000);
    if (daySet.has(istDate(check))) streak++;
    else break;
  }

  return { focusStreak: streak, coins, todayFocusMinutes: todayMins, totalSuccessfulSessions: success.length };
}

export function computeProgress(tasksMap: Map<string, Task>): SubjectProgress[] {
  const subjects = new Map<string, { name: string; chapters: Map<string, { name: string; tasks: Task[] }> }>();

  for (const t of tasksMap.values()) {
    if (t.isDeleted) continue;
    let subj = subjects.get(t.subjectId);
    if (!subj) { subj = { name: t.subjectName, chapters: new Map() }; subjects.set(t.subjectId, subj); }
    let ch = subj.chapters.get(t.chapterId);
    if (!ch) { ch = { name: t.chapterName, tasks: [] }; subj.chapters.set(t.chapterId, ch); }
    ch.tasks.push(t);
  }

  return [...subjects].map(([sid, subj]) => {
    const chs = [...subj.chapters].map(([cid, ch]) => {
      const total = ch.tasks.length;
      const done = ch.tasks.filter((t) => t.status === "done").length;
      const p = total ? Math.round((done / total) * 100) : 0;
      return { id: cid, name: ch.name, progress: p, tasks: ch.tasks };
    });
    const sp = chs.length ? Math.round(chs.reduce((s, c) => s + c.progress, 0) / chs.length) : 0;
    return { id: sid, name: subj.name, progress: sp, chapters: chs };
  });
}
