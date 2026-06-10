import type { ServerState } from "./store.js";
import { persistState } from "./store.js";

const N8N_URL =
  process.env.N8N_WEBHOOK_URL || "http://localhost:5678/webhook/focus-complete";
const MAX_ATTEMPTS = 5;

export async function processOutbox(state: ServerState): Promise<void> {
  let changed = false;
  for (const entry of state.notificationOutbox) {
    if (entry.status !== "pending") continue;

    entry.attemptCount++;
    entry.lastAttemptAt = new Date().toISOString();
    changed = true;

    try {
      const res = await fetch(N8N_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry.payload),
        signal: AbortSignal.timeout(5_000),
      });
      if (res.ok) {
        entry.status = "sent";
      } else if (entry.attemptCount >= MAX_ATTEMPTS) {
        entry.status = "failed";
        console.error(`Notification for ${entry.sessionId} failed after ${MAX_ATTEMPTS} attempts`);
      }
    } catch {
      if (entry.attemptCount >= MAX_ATTEMPTS) {
        entry.status = "failed";
        console.error(`Notification for ${entry.sessionId} failed after ${MAX_ATTEMPTS} attempts`);
      }
    }
  }
  if (changed) persistState(state);
}

export function triggerOutboxProcessing(state: ServerState): void {
  processOutbox(state).catch((err) =>
    console.error("Outbox processing error:", err),
  );
}

export function startOutboxProcessor(state: ServerState): void {
  setInterval(() => triggerOutboxProcessing(state), 10_000);
}
