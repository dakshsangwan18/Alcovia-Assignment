import express from "express";
import cors from "cors";
import { loadState, persistState } from "./store.js";
import { seedIfEmpty } from "./seed.js";
import { syncHandler } from "./sync.js";
import { stateHandler } from "./routes/state.js";
import { notificationHandlers } from "./routes/notifications.js";
import { dedupHandler } from "./routes/dedup.js";
import { startOutboxProcessor } from "./outbox.js";

const PORT = Number(process.env.PORT) || 3001;

const state = loadState();
seedIfEmpty(state);
persistState(state);
startOutboxProcessor(state);

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/sync", (req, res) => syncHandler(req, res, state));
app.get("/api/state/:studentId", (req, res) => stateHandler(req, res, state));
app.get("/api/notification-log", (req, res) =>
  notificationHandlers.get(req, res, state),
);
app.post("/api/notification-log", (req, res) =>
  notificationHandlers.post(req, res, state),
);
app.get("/api/dedup-check", (req, res) => dedupHandler(req, res, state));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
