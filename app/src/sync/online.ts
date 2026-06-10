import type { createSyncEngine } from "./engine";

type SyncEngine = ReturnType<typeof createSyncEngine>;

export function createOnlineManager(engine: SyncEngine, onOp: () => void) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let override: boolean | null = null;

  window.addEventListener("online", () => {
    if (override === null) engine.sync();
  });

  const interval = setInterval(() => {
    if (isOnline()) engine.sync();
  }, 30_000);

  function onOperation(): void {
    if (!isOnline()) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => engine.sync(), 1_000);
  }

  function isOnline(): boolean {
    if (override !== null) return override;
    return navigator.onLine;
  }

  function setOnline(v: boolean): void {
    override = v;
    engine.setOnline(v);
  }

  function destroy(): void {
    clearInterval(interval);
    if (timer) clearTimeout(timer);
  }

  return { onOperation, isOnline, setOnline, destroy };
}
