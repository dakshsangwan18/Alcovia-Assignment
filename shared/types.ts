export type OperationType =
  | "FOCUS_STARTED"
  | "FOCUS_COMPLETED"
  | "FOCUS_FAILED"
  | "TASK_CREATED"
  | "TASK_STATUS_CHANGED"
  | "TASK_DELETED";

export interface Operation {
  readonly operationId: string;
  readonly deviceId: string;
  readonly lamportTimestamp: number;
  readonly entityId: string;
  readonly type: OperationType;
  readonly payload: Record<string, unknown>;
  readonly clientTimestamp: string;
}

export interface FocusSession {
  readonly id: string;
  readonly targetDuration: number;
  readonly startedAt: string;
  readonly status: "active" | "success" | "failed";
  readonly failReason?: "give_up" | "app_switch";
  readonly completedAt?: string;
  readonly failedAt?: string;
}

export interface Task {
  readonly id: string;
  readonly subjectId: string;
  readonly chapterId: string;
  readonly subjectName: string;
  readonly chapterName: string;
  readonly title: string;
  readonly status: "not_started" | "in_progress" | "done";
  readonly isDeleted: boolean;
}

export interface StudentStats {
  readonly focusStreak: number;
  readonly coins: number;
  readonly todayFocusMinutes: number;
  readonly totalSuccessfulSessions: number;
}

export interface SubjectProgress {
  readonly id: string;
  readonly name: string;
  readonly progress: number;
  readonly chapters: ChapterProgress[];
}

export interface ChapterProgress {
  readonly id: string;
  readonly name: string;
  readonly progress: number;
  readonly tasks: Task[];
}

export interface RebuiltState {
  readonly sessions: Map<string, FocusSession>;
  readonly tasks: Map<string, Task>;
  readonly stats: StudentStats;
}

export interface ActiveSessionMetadata {
  readonly sessionId: string;
  readonly targetDuration: number;
  readonly startedAt: string;
  readonly remainingSeconds: number;
  readonly deviceId: string;
  readonly backgroundedAt: string | null;
}

export interface ServerOperation extends Operation {
  serverSeqNo: number;
  studentId: string;
}

export type NotificationOutboxStatus = "pending" | "sent" | "failed";

export interface NotificationPayload {
  readonly sessionId: string;
  readonly studentId: string;
  readonly streak: number;
  readonly coins: number;
  readonly idempotencyKey: string;
}

export interface NotificationOutboxEntry {
  sessionId: string;
  studentId: string;
  status: NotificationOutboxStatus;
  attemptCount: number;
  lastAttemptAt: string | null;
  payload: NotificationPayload;
}

export interface NotificationEntry {
  readonly sessionId: string;
  readonly studentId: string;
  readonly message: string;
  readonly timestamp: string;
}

export interface SyncRequest {
  readonly studentId: string;
  readonly deviceId: string;
  readonly lastPulledSeqNo: number;
  readonly operations: Operation[];
}

export interface SyncResponse {
  readonly operations: ServerOperation[];
  readonly currentSeqNo: number;
}

export interface DedupCheckResponse {
  readonly alreadyNotified: boolean;
}

export interface NotificationLogRequest {
  readonly sessionId: string;
  readonly studentId: string;
  readonly message: string;
}

export interface SeedSubject {
  readonly subjectId: string;
  readonly subjectName: string;
  readonly chapters: SeedChapter[];
}

export interface SeedChapter {
  readonly chapterId: string;
  readonly chapterName: string;
  readonly tasks: SeedTask[];
}

export interface SeedTask {
  readonly taskId: string;
  readonly title: string;
}
