import type { Request, Response } from "express";
import { rebuildState } from "../../../shared/reducers/rebuild.js";
import type { ServerState } from "../store.js";

export function stateHandler(
  req: Request,
  res: Response,
  state: ServerState,
): void {
  const ops = [...state.operations.values()];

  const { sessions: sessMap, tasks: taskMap, stats } = rebuildState(ops);

  const sessions = [...sessMap.values()];
  const tasks = [...taskMap.values()];

  res.json({
    studentId: req.params.studentId,
    operationsTotal: ops.length,
    stats,
    sessions,
    tasks,
  });
}
