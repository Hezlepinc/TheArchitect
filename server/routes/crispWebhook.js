import express from "express";
import { loadAssistantConfig } from "../core/utils/configLoader.js";
import { chatOrchestrator } from "../core/orchestrator/chatOrchestrator.js";
import { logger } from "../core/utils/logger.js";

// Minimal Crisp webhook router
// Assumptions:
// - If CRISP_WEBSITE_MAP is set (JSON), will map website_id -> { brand, region, persona }
// - Otherwise falls back to CRISP_DEFAULT_BRAND/REGION/PERSONA
// - We do not hardcode brand/region/persona; always resolved and loaded via configLoader

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
  // defaults
  const brand = process.env.CRISP_DEFAULT_BRAND || "incharge";
  const region = process.env.CRISP_DEFAULT_REGION || "us-tx";
  const persona = process.env.CRISP_DEFAULT_PERSONA || "customer";
  return { brand, region, persona };
}

const router = express.Router();

router.post("/webhook", async (req, res) => {
  try {
    const body = req.body || {};
    const event = body.event;
    const data = body.data || {};

    if (event !== "message:send") {
      // Ack quickly for events we don't handle yet
      return res.sendStatus(200);
    }

    const websiteId = data.website_id;
    const sessionId = data.session_id;
    const content = (data.content || "").toString();

    if (!content.trim()) {
      return res.sendStatus(200);
    }

    // Resolve assistant routing and load config
    const { brand, region, persona } = resolveAssistantRouting(websiteId);
    let config;
    try {
      config = region
        ? loadAssistantConfig(brand, region, persona)
        : loadAssistantConfig(brand, persona);
    } catch (e) {
      logger.warn("Crisp webhook: assistant config not found", { brand, region, persona });
      return res.sendStatus(200);
    }

    // Orchestrate AI reply
    let aiText = "";
    try {
      const result = await chatOrchestrator(content, config);
      aiText = (result?.text || "").toString().slice(0, 4000) || "Sorry, I had trouble processing that.";
    } catch (e) {
      logger.error("Crisp webhook: orchestrator error", { error: e?.message });
      aiText = "Sorry, I had trouble processing that.";
    }

    // Send reply back to Crisp (best-effort)
    try {
      const id = process.env.CRISP_IDENTIFIER;
      const key = process.env.CRISP_KEY;
      if (!id || !key) {
        logger.warn("Crisp webhook: missing CRISP_IDENTIFIER or CRISP_KEY");
      } else {
        const auth = Buffer.from(`${id}:${key}`).toString("base64");
        const url = `https://api.crisp.chat/v1/website/${websiteId}/conversation/${sessionId}/message`;
        const resp = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${auth}`,
          },
          body: JSON.stringify({
            type: "text",
            from: "operator",
            origin: "chat",
            content: aiText,
          }),
        });
        if (!resp.ok) {
          const t = await resp.text().catch(() => "");
          logger.warn("Crisp API send failed", { status: resp.status, body: t?.slice(0, 500) });
        }
      }
    } catch (e) {
      logger.error("Crisp webhook: send back failed", { error: e?.message });
    }

    return res.sendStatus(200);
  } catch (err) {
    logger.error("Crisp webhook error", { error: err?.message });
    return res.sendStatus(200);
  }
});

export default router;


