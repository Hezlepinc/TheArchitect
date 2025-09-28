import express from "express";
import { z } from "zod";
import { getCollection } from "../core/memory/mongoClient.js";
import { loadAssistantConfig } from "../core/utils/configLoader.js";
import { logger } from "../core/utils/logger.js";

const router = express.Router();

const TranscriptItemSchema = z.object({
  role: z.enum(["user", "assistant"]),
  text: z.string().trim().min(1).max(8192),
});

const FeedbackBodySchema = z.object({
  sessionId: z.string().trim().min(1),
  conversationLength: z.number().int().nonnegative(),
  conversationTranscript: z.array(TranscriptItemSchema).min(1),
  feedback: z.string().trim().min(1).max(8192),
  charCount: z.number().int().nonnegative(),
});

// Accept JSON body with brand/persona (and optional region)
const FeedbackBodyWithRoutingSchema = FeedbackBodySchema.extend({
  brand: z.string().trim().min(1),
  persona: z.string().trim().min(1),
  region: z.string().trim().optional(),
});

router.post("/", async (req, res) => {
  try {
    if (!process.env.MONGODB_URI) {
      return res.status(503).json({ error: "database not configured" });
    }
    const parsed = FeedbackBodyWithRoutingSchema.safeParse(req.body || {});
    if (!parsed.success) {
      const issue = parsed.error.issues?.[0];
      return res.status(400).json({ error: issue?.message || "invalid payload" });
    }
    const { brand, region, persona } = parsed.data;
    try {
      region ? loadAssistantConfig(brand, region, persona) : loadAssistantConfig(brand, persona);
    } catch {
      return res.status(404).json({ error: "assistant config not found" });
    }
    const col = await getCollection("FeedbackLog");
    const doc = {
      brand,
      region,
      persona,
      sessionId: parsed.data.sessionId,
      conversationLength: parsed.data.conversationLength,
      conversationTranscript: parsed.data.conversationTranscript,
      feedback: parsed.data.feedback,
      charCount: parsed.data.charCount,
      createdAt: new Date(),
    };
    const result = await col.insertOne(doc);
    return res.json({ ok: true, id: result.insertedId });
  } catch (err) {
    logger.error("Feedback save failed (body)", { error: err?.message });
    res.status(500).json({ error: "Failed to save feedback" });
  }
});

router.post("/:brand/:region/:persona", async (req, res) => {
  try {
    const { brand, region, persona } = req.params;

    if (!process.env.MONGODB_URI) {
      return res.status(503).json({ error: "database not configured" });
    }

    // Validate assistant exists via config loader
    try {
      loadAssistantConfig(brand, region, persona);
    } catch {
      return res.status(404).json({ error: "assistant config not found" });
    }

    const parsed = FeedbackBodySchema.safeParse(req.body || {});
    if (!parsed.success) {
      const issue = parsed.error.issues?.[0];
      return res.status(400).json({ error: issue?.message || "invalid payload" });
    }

    const col = await getCollection("FeedbackLog");
    const doc = {
      brand,
      region,
      persona,
      sessionId: parsed.data.sessionId,
      conversationLength: parsed.data.conversationLength,
      conversationTranscript: parsed.data.conversationTranscript,
      feedback: parsed.data.feedback,
      charCount: parsed.data.charCount,
      createdAt: new Date(),
    };
    const result = await col.insertOne(doc);
    return res.json({ ok: true, id: result.insertedId });
  } catch (err) {
    logger.error("Feedback save failed", { error: err?.message });
    res.status(500).json({ error: "Failed to save feedback" });
  }
});

// Brand + persona without region
router.post("/:brand/:persona", async (req, res) => {
  try {
    const { brand, persona } = req.params;
    if (!process.env.MONGODB_URI) {
      return res.status(503).json({ error: "database not configured" });
    }
    try {
      loadAssistantConfig(brand, persona);
    } catch {
      return res.status(404).json({ error: "assistant config not found" });
    }
    const parsed = FeedbackBodySchema.safeParse(req.body || {});
    if (!parsed.success) {
      const issue = parsed.error.issues?.[0];
      return res.status(400).json({ error: issue?.message || "invalid payload" });
    }
    const col = await getCollection("FeedbackLog");
    const doc = {
      brand,
      persona,
      sessionId: parsed.data.sessionId,
      conversationLength: parsed.data.conversationLength,
      conversationTranscript: parsed.data.conversationTranscript,
      feedback: parsed.data.feedback,
      charCount: parsed.data.charCount,
      createdAt: new Date(),
    };
    const result = await col.insertOne(doc);
    return res.json({ ok: true, id: result.insertedId });
  } catch (err) {
    logger.error("Feedback save failed (brand+persona)", { error: err?.message });
    res.status(500).json({ error: "Failed to save feedback" });
  }
});

// Minimal admin listing for future dashboard (optional for now)
router.get("/list", async (req, res) => {
  try {
    const adminKey = req.headers["x-admin-key"];
    if (process.env.ADMIN_KEY && adminKey !== process.env.ADMIN_KEY) {
      return res.status(403).json({ error: "forbidden" });
    }
    const { brand, region, persona, limit } = req.query;
    const q = {};
    if (brand) q.brand = String(brand);
    if (region) q.region = String(region);
    if (persona) q.persona = String(persona);
    const lim = Math.min(Math.max(parseInt(limit || "50", 10) || 50, 1), 500);
    const col = await getCollection("FeedbackLog");
    const items = await col
      .find(q, { projection: { conversationTranscript: { $slice: 5 } } })
      .sort({ createdAt: -1 })
      .limit(lim)
      .toArray();
    res.json({ items });
  } catch (err) {
    logger.error("Feedback list failed", { error: err?.message });
    res.status(500).json({ error: "Failed to list feedback" });
  }
});

export default router;


