import { useRef, useState, useEffect, useCallback } from "react";
import { useApp } from "../../context/AppContext";
import { getActiveSession, setActiveSession, clearActiveSession } from "../../storage/metadata";

interface SessionState {
  sessionId: string;
  targetDuration: number;
  remaining: number;
  startedAt: string;
  status: "active" | "success" | "failed" | null;
  failReason?: "give_up" | "app_switch";
}

export function useFocusSession() {
  const { dispatch, state } = useApp();
  const [session, setSession] = useState<SessionState>({
    sessionId: "",
    targetDuration: 0,
    remaining: 0,
    startedAt: "",
    status: null,
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const graceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionRef = useRef(session);
  sessionRef.current = session;

  const tick = useCallback(() => {
    setSession((prev) => {
      if (prev.status !== "active") return prev;
      const next = prev.remaining - 1;
      if (next <= 0) {
        return { ...prev, remaining: 0 };
      }
      return { ...prev, remaining: next };
    });
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    timerRef.current = setInterval(tick, 1_000);
  }, [tick, stopTimer]);

  const start = useCallback(
    async (mins: number) => {
      const sessId = crypto.randomUUID();
      const started = new Date().toISOString();
      const duration = mins * 60;

      setSession({
        sessionId: sessId,
        targetDuration: mins,
        remaining: duration,
        startedAt: started,
        status: "active",
      });

      await setActiveSession({
        sessionId: sessId,
        targetDuration: duration,
        startedAt: started,
        remainingSeconds: duration,
        deviceId: "",
        backgroundedAt: null,
      });

      await dispatch("FOCUS_STARTED", sessId, {
        targetDuration: mins,
        startedAt: started,
      });

      startTimer();
    },
    [dispatch, startTimer],
  );

  const complete = useCallback(async () => {
    const s = sessionRef.current;
    if (s.status !== "active") return;
    stopTimer();
    await clearActiveSession();
    await dispatch("FOCUS_COMPLETED", s.sessionId, {
      completedAt: new Date().toISOString(),
    });
    setSession((prev) => ({ ...prev, status: "success" }));
  }, [dispatch, stopTimer]);

  const fail = useCallback(
    async (reason: "give_up" | "app_switch") => {
      const s = sessionRef.current;
      if (s.status !== "active") return;
      stopTimer();
      await clearActiveSession();
      await dispatch("FOCUS_FAILED", s.sessionId, {
        failedAt: new Date().toISOString(),
        reason,
      });
      setSession((prev) => ({ ...prev, status: "failed", failReason: reason }));
    },
    [dispatch, stopTimer],
  );

  const giveUp = useCallback(() => fail("give_up"), [fail]);

  useEffect(() => {
    if (session.status === "active" && session.remaining <= 0) {
      complete();
    }
  }, [session.remaining, session.status, complete]);

  useEffect(() => {
    const cb = () => {
      const { current: s } = sessionRef;
      if (!s || s.status !== "active") return;

      if (document.visibilityState === "hidden") {
        setActiveSession({
          ...s,
          backgroundedAt: new Date().toISOString(),
        } as any);
        graceRef.current = setTimeout(() => fail("app_switch"), 5_000);
      } else {
        if (graceRef.current) {
          clearTimeout(graceRef.current);
          graceRef.current = null;
        }
        setActiveSession({
          ...s,
          backgroundedAt: null,
        } as any);
      }
    };

    document.addEventListener("visibilitychange", cb);
    window.addEventListener("beforeunload", () => {
      const s = sessionRef.current;
      if (s.status === "active") {
        setActiveSession({
          ...s,
          backgroundedAt: new Date().toISOString(),
        } as any);
      }
    });

    return () => {
      document.removeEventListener("visibilitychange", cb);
      window.removeEventListener("beforeunload", () => {});
      stopTimer();
      if (graceRef.current) clearTimeout(graceRef.current);
    };
  }, [fail, stopTimer]);

  useEffect(() => {
    getActiveSession().then((saved) => {
      if (!saved || !saved.backgroundedAt) return;
      const sessId = saved.sessionId;
      const started = saved.startedAt;
      const reason: "app_switch" = "app_switch";

      clearActiveSession().then(() => {
        dispatch("FOCUS_FAILED", sessId, {
          failedAt: new Date().toISOString(),
          reason,
        });
      });
    });
  }, [dispatch]);

  return {
    session,
    stats: state.stats,
    start,
    giveUp,
  };
}
