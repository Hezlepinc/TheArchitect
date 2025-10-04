import express from "express";
import { loadAssistantConfig } from "../core/utils/configLoader.js";
import { chatOrchestrator } from "../core/orchestrator/chatOrchestrator.js";
import { logger } from "../core/utils/logger.js";
import { sendCrispMessage } from "../core/utils/crispClient.js";

function resolveAssistantRouting(websiteId) {
  try {
    const raw = process.env.CRISP_WEBSITE_MAP;
    if (raw) {
      const map = JSON.parse(raw);
      const entry = map?.[websiteId];
      if (entry && typeof entry === "object") {
        const brand = String(entry.brand || "");
        const region = entry.region ? String(entry.region) : undefined;
        const persona = String(entry.persona || "customer");
        if (brand && persona) return { brand, region, persona };
      }
    }
  } catch (e) {
    logger.warn("Invalid CRISP_WEBSITE_MAP JSON", { error: e?.message });
  }
  const brand = process.env.CRISP_DEFAULT_BRAND || "incharge";
  const region = process.env.CRISP_DEFAULT_REGION || "us-tx";
  const persona = process.env.CRISP_DEFAULT_PERSONA || "customer";
  return { brand, region, persona };
}

// sendReplyToCrisp is now centralized in crispClient.sendCrispMessage

const router = express.Router();

// Crisp Plugin Action URL
router.post("/action", async (req, res) => {
  try {
    const evt = req.body || {};
    const websiteId = evt.website_id;
    const sessionId = evt.session_id;
    const message = evt.message || {};
    const eventType = evt.event;

    if (!(eventType === "message:send" && message.from === "user" && typeof message.content === "string")) {
      return res.json({ status: "ignored" });
    }

    const userText = message.content;

    const { brand, region, persona } = resolveAssistantRouting(websiteId);
    let config;
    try {
      config = region ? loadAssistantConfig(brand, region, persona) : loadAssistantConfig(brand, persona);
    } catch (e) {
      logger.warn("Crisp action: assistant config not found", { brand, region, persona });
      return res.json({ status: "no-config" });
    }

    let aiText = "";
    try {
      const result = await chatOrchestrator(userText, config);
      aiText = (result?.text || "").toString().slice(0, 4000) || "Sorry, I had trouble processing that.";
    } catch (e) {
      logger.error("Crisp action: orchestrator error", { error: e?.message });
      aiText = "Sorry, I had trouble processing that.";
    }

    try {
      await sendCrispMessage({ websiteId, sessionId, text: aiText, from: "operator", origin: "plugin" });
    } catch (e) {
      logger.error("Crisp action: reply failed", { error: e?.message });
    }

    return res.json({ status: "ok" });
  } catch (err) {
    logger.error("Crisp action error", { error: err?.message });
    return res.status(200).json({ status: "error" });
  }
});

// Minimal GET to verify wiring without requiring POST
router.get("/action", (_req, res) => {
  res.status(200).send("✅ Crisp action endpoint active");
});

export default router;


