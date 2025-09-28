import express from "express";
import cors from "cors";

function makeCorsOptions() {
  const list = (process.env.CORS_ORIGIN || "*")
    .split(/[\,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (list.includes("*")) {
    return { origin: true, credentials: true };
  }
  return {
    origin: function (origin, cb) {
      if (!origin) return cb(null, true);
      cb(null, list.includes(origin));
    },
    credentials: true,
  };
}

import chatRouter from "./routes/chatRouter.js";
import widgetConfigRouter from "./routes/widgetConfigRouter.js";
import { logger } from "./core/utils/logger.js";
import { pingMongo } from "./core/memory/mongoClient.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors(makeCorsOptions()));
app.use(express.json());

app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

app.use("/api/chat", chatRouter);
app.use("/api/widget-config", widgetConfigRouter);

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.get("/health/db", async (_req, res) => {
  try {
    await pingMongo();
    res.json({ status: "ok" });
  } catch (e) {
    res.status(500).json({ status: "error", error: e?.message });
  }
});

app.get("/health/full", async (_req, res) => {
  const out = { ts: new Date().toISOString() };
  // Mongo
  try { await pingMongo(); out.mongo = { status: "ok" }; } catch (e) { out.mongo = { status: "error", error: e?.message }; }
  // Redis
  try {
    const { redisSetJson, redisGetJson } = await import("./core/memory/redisClient.js");
    const key = "health:check";
    await redisSetJson(key, { v: 1 }, 10);
    const got = await redisGetJson(key);
    out.redis = { status: got ? "ok" : "error" };
  } catch (e) {
    out.redis = { status: "error", error: e?.message };
  }
  // Pinecone (config presence only in MVP)
  const pcKey = !!process.env.PINECONE_API_KEY;
  const pcIndex = process.env.PINECONE_INDEX || null;
  out.pinecone = pcKey && pcIndex ? { status: "configured", index: pcIndex } : { status: "missing" };
  // Providers
  out.providers = {
    openai: !!process.env.OPENAI_API_KEY,
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    primary: process.env.CHAT_PRIMARY || "openai:gpt-4o-mini",
    fallback: process.env.CHAT_FALLBACK || "anthropic:claude-3-5-sonnet-20240620"
  };
  res.json(out);
});

app.use((err, _req, res, _next) => {
  logger.error("Unhandled error", { error: err?.message });
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
});
