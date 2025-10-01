// server/index.js
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// ✅ Always load root .env, regardless of where process starts
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import express from "express";
import cors from "cors";
import { logger } from "./core/utils/logger.js";
import { pingMongo } from "./core/memory/mongoClient.js";
import { redisPing } from "./core/memory/redisClient.js";
import { pineconePing } from "./core/memory/pineconeClient.js";

// -----------------
// Helpers
// -----------------
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

async function safeCheck(name, fn) {
  const start = Date.now();
  try {
    const res = await fn();
    return { ok: true, latencyMs: Date.now() - start, ...res };
  } catch (e) {
    return { ok: false, latencyMs: Date.now() - start, error: e?.message };
  }
}

// -----------------
// Provider pings
// -----------------
async function pingOpenAI() {
  const res = await fetch("https://api.openai.com/v1/models", {
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
  });
  return { status: res.status };
}

async function pingAnthropic() {
  const res = await fetch("https://api.anthropic.com/v1/models", {
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
  });
  return { status: res.status };
}

// -----------------
// Routers
// -----------------
import chatRouter from "./routes/chatRouter.js";
import widgetConfigRouter from "./routes/widgetConfigRouter.js";
import feedbackDashboard from "./routes/feedbackDashboard.js";
import feedbackRouter from "./routes/feedbackRouter.js";
import crispWebhook from "./routes/crispWebhook.js";
import crispAction from "./routes/crispAction.js";
import crispPlugin from "./routes/crispPlugin.js";

const app = express();
let PORT = Number(process.env.PORT) || 3000;

app.use(cors(makeCorsOptions()));
app.use(express.json());

app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

app.use("/api/chat", chatRouter);
app.use("/api/widget-config", widgetConfigRouter);
app.use("/api/feedback", feedbackRouter);
app.use("/feedback-dashboard", feedbackDashboard);
app.use("/crisp", crispWebhook);
app.use("/crisp", crispAction);
app.use("/crisp", crispPlugin);

// -----------------
// Health endpoints
// -----------------
app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.get("/health/db", async (_req, res) => {
  const mongo = await safeCheck("mongo", pingMongo);
  res.json(mongo);
});

app.get("/health/full", async (_req, res) => {
  const out = { ts: new Date().toISOString() };

  out.mongo = await safeCheck("mongo", pingMongo);
  out.redis = await safeCheck("redis", redisPing);
  out.pinecone = await safeCheck("pinecone", pineconePing);

  out.providers = {
    openai: await safeCheck("openai", pingOpenAI),
    anthropic: await safeCheck("anthropic", pingAnthropic),
    primary: process.env.CHAT_PRIMARY || "openai:gpt-4o-mini",
    fallback: process.env.CHAT_FALLBACK || "anthropic:claude-3-5-sonnet-20240620",
  };

  res.json(out);
});

// -----------------
// Error handler
// -----------------
app.use((err, _req, res, _next) => {
  logger.error("Unhandled error", { error: err?.message });
  res.status(500).json({ error: "Internal Server Error" });
});

// -----------------
// Startup w/ port retry + health log
// -----------------
async function startServer(port) {
  const server = app.listen(port, async () => {
    logger.info(`✅ Server listening on port ${port}`);

    // Log startup health check
    const health = {
      ts: new Date().toISOString(),
      mongo: await safeCheck("mongo", pingMongo),
      redis: await safeCheck("redis", redisPing),
      pinecone: await safeCheck("pinecone", pineconePing),
      providers: {
        openai: await safeCheck("openai", pingOpenAI),
        anthropic: await safeCheck("anthropic", pingAnthropic),
        primary: process.env.CHAT_PRIMARY || "openai:gpt-4o-mini",
        fallback: process.env.CHAT_FALLBACK || "anthropic:claude-3-5-sonnet-20240620",
      },
    };
    logger.info("🔍 Startup Health Report", health);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      logger.warn(`⚠️ Port ${port} in use, trying ${port + 1}...`);
      startServer(port + 1);
    } else {
      throw err;
    }
  });
}

startServer(PORT);