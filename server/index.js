import express from "express";
import cors from "cors";
import chatRouter from "./routes/chatRouter.js";
import widgetConfigRouter from "./routes/widgetConfigRouter.js";
import { logger } from "./core/utils/logger.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

app.use("/api/chat", chatRouter);
app.use("/api/widget-config", widgetConfigRouter);

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use((err, _req, res, _next) => {
  logger.error("Unhandled error", { error: err?.message });
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
});
