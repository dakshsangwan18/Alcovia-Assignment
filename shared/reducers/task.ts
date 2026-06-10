import type { Operation, Task } from "../types";

const VALID_STATUSES = new Set(["not_started", "in_progress", "done"]);

function isValidStatus(s: string): s is Task["status"] {
  return VALID_STATUSES.has(s);
}

export function taskReducer(task: Task | null, op: Operation): Task | null {
  switch (op.type) {
    case "TASK_CREATED": {
      const p = op.payload;
      if (
        typeof p.subjectId !== "string" ||
        typeof p.chapterId !== "string" ||
        typeof p.title !== "string"
      ) {
        return task;
      }
      return {
        id: op.entityId,
        subjectId: p.subjectId,
        chapterId: p.chapterId,
        subjectName: typeof p.subjectName === "string" ? p.subjectName : p.subjectId,
        chapterName: typeof p.chapterName === "string" ? p.chapterName : p.chapterId,
        title: p.title,
        status: typeof p.status === "string" && isValidStatus(p.status) ? p.status : "not_started",
        isDeleted: false,
      };
    }

    case "TASK_STATUS_CHANGED": {
      if (task === null) return null;
      if (task.isDeleted) return task;
      const p = op.payload;
      if (typeof p.status !== "string" || !isValidStatus(p.status)) return task;
      return { ...task, status: p.status };
    }

    case "TASK_DELETED": {
      if (task === null) return null;
      return { ...task, isDeleted: true };
    }

    default:
      return task;
  }
}
