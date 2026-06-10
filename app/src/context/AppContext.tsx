import React, {
  createContext,
  useContext,
  useCallback,
  useRef,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { clientId } from "../storage/db";
import { allOps } from "../storage/operations";
import { rebuildState } from "@shared/reducers/rebuild";
import { storeOp } from "../storage/operations";
import { bumpClock } from "../storage/metadata";
import { createSyncEngine } from "../sync/engine";
import { createOnlineManager } from "../sync/online";
import type {
  FocusSession,
  Task,
  StudentStats,
  SubjectProgress,
  OperationType,
} from "@shared/types";

interface AppState {
  sessions: Map<string, FocusSession>;
  tasks: Map<string, Task>;
  stats: StudentStats;
}

interface ContextValue {
  state: AppState;
  clientId: string;
  isOnline: boolean;
  pendingOps: number;
  syncedOps: number;
  lamport: number;
  watermark: number;
  syncNow: () => void;
  setOnline: (v: boolean) => void;
  dispatch: (
    type: OperationType,
    entityId: string,
    payload: Record<string, unknown>,
  ) => Promise<void>;
}

const Ctx = createContext<ContextValue | null>(null);

export function useApp(): ContextValue {
  const c = useContext(Ctx);
  if (!c) throw new Error("useApp must be inside AppProvider");
  return c;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    sessions: new Map(),
    tasks: new Map(),
    stats: { focusStreak: 0, coins: 0, todayFocusMinutes: 0, totalSuccessfulSessions: 0 },
  });
  const [online, setOnlineState] = useState(true);
  const [pending, setPending] = useState(0);
  const [synced, setSynced] = useState(0);
  const [lamport, setLamport] = useState(0);
  const [watermark, setWatermark] = useState(0);

  const onlineRef = useRef(online);
  onlineRef.current = online;

  const rebuild = useCallback(async () => {
    const ops = await allOps();
    const { sessions, tasks, stats } = rebuildState(ops);
    setState({ sessions, tasks, stats });

    const unsynced = ops.filter((o) => !o.synced);
    setPending(unsynced.length);
    setSynced(ops.length - unsynced.length);

    const { getClock, getWatermark: getW } = await import("../storage/metadata");
    setLamport((await getClock()) ?? 0);
    setWatermark((await getW()) ?? 0);
  }, []);

  const engineRef = useRef<ReturnType<typeof createSyncEngine>>(null);
  const mgrRef = useRef<ReturnType<typeof createOnlineManager>>(null);

  useEffect(() => {
    const engine = createSyncEngine(rebuild);
    const mgr = createOnlineManager(engine, rebuild);
    engineRef.current = engine;
    mgrRef.current = mgr;
    rebuild();
    return () => mgr.destroy();
  }, [rebuild]);

  const dispatch = useCallback(
    async (
      type: OperationType,
      entityId: string,
      payload: Record<string, unknown>,
    ) => {
      const clock = await bumpClock();
      const op = await storeOp(type, entityId, payload, clientId, clock);
      await rebuild();
      if (mgrRef.current) mgrRef.current.onOperation();
    },
    [rebuild],
  );

  const setOnline = useCallback((v: boolean) => {
    setOnlineState(v);
    if (mgrRef.current) mgrRef.current.setOnline(v);
  }, []);

  const syncNow = useCallback(() => {
    if (engineRef.current) engineRef.current.sync();
  }, []);

  return (
    <Ctx.Provider
      value={{
        state,
        clientId,
        isOnline: online,
        pendingOps: pending,
        syncedOps: synced,
        lamport,
        watermark,
        syncNow,
        setOnline,
        dispatch,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
