import express from "express";
import { z } from "zod";
import { chatOrchestrator } from "../core/orchestrator/chatOrchestrator.js";
import { loadAssistantConfig } from "../core/utils/configLoader.js";
import { logger } from "../core/utils/logger.js";

const router = express.Router();

const ChatBodySchema = z.object({
  message: z.string().trim().min(1, "message is required").max(4096, "message too long"),
  sessionId: z.string().optional()
});

// Backward-compatible path-param route (supports optional region in future)
router.post("/:brand/:region?/:persona", async (req, res) => {
  try {
    const { brand, region, persona } = req.params;
    const parse = ChatBodySchema.safeParse(req.body || {});
    if (!parse.success) {
      const issue = parse.error.issues?.[0];
      const status = issue?.message === "message too long" ? 413 : 400;
      return res.status(status).json({ error: issue?.message || "invalid payload" });
    }

    let config;
    try {
      // Support both (brand, region, persona) and (brand, persona)
      config = region ? loadAssistantConfig(brand, region, persona) : loadAssistantConfig(brand, persona);
    } catch (e) {
      logger.warn("Config not found", { brand, region, persona });
      return res.status(404).json({ error: "assistant config not found" });
    }

    const result = await chatOrchestrator(parse.data.message, config);
    return res.json({
      text: result.text,
      provider: result.provider || "unknown",
      via: result.via || "unknown",
      rag: Boolean(result.rag)
    });
  } catch (err) {
    logger.error("ChatRouter error", { error: err?.message });
    res.status(500).json({ error: "Chat processing failed" });
  }
});

// JSON body route: POST /api/chat with { brand, region, persona, message, sessionId }
const BodyWithRoutingSchema = ChatBodySchema.extend({
  brand: z.string().trim().min(1),
  region: z.string().trim().optional(),
  persona: z.string().trim().min(1)
});

router.post("/", async (req, res) => {
  try {
    const parse = BodyWithRoutingSchema.safeParse(req.body || {});
    if (!parse.success) {
      const issue = parse.error.issues?.[0];
      const status = issue?.message === "message too long" ? 413 : 400;
      return res.status(status).json({ error: issue?.message || "invalid payload" });
    }
    const { brand, region, persona, message } = parse.data;
    let config;
    try {
      config = region ? loadAssistantConfig(brand, region, persona) : loadAssistantConfig(brand, persona);
    } catch (e) {
      logger.warn("Config not found", { brand, region, persona });
      return res.status(404).json({ error: "assistant config not found" });
    }
    const result = await chatOrchestrator(message, config);
    return res.json({
      text: result.text,
      provider: result.provider || "unknown",
      via: result.via || "unknown",
      rag: Boolean(result.rag)
    });
  } catch (err) {
    logger.error("ChatRouter body route error", { error: err?.message });
    res.status(500).json({ error: "Chat processing failed" });
  }
});

export default router;
