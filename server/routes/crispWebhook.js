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

function extractInbound(body) {
  // Shape A: Crisp webhook { event: "message:send", data: { website_id, session_id, content } }
  if (body && body.event === "message:send" && body.data) {
    const d = body.data;
    const content = (d.content || "").toString();
    if (content.trim()) {
      return { websiteId: d.website_id, sessionId: d.session_id, content };
    }
  }
  // Shape B: Crisp Workflow "Send Webhook"
  // { website_id, session_id, message: { from, content } }
  if (body && body.website_id && body.session_id && body.message && body.message.from === "user") {
    const content = (body.message.content || "").toString();
    if (content.trim()) {
      return { websiteId: body.website_id, sessionId: body.session_id, content };
    }
  }
  // Shape C: minimal { website_id, session_id, content }
  if (body && body.website_id && body.session_id && typeof body.content === "string") {
    const content = body.content.toString();
    if (content.trim()) {
      return { websiteId: body.website_id, sessionId: body.session_id, content };
    }
  }
  return null;
}

router.post("/webhook", async (req, res) => {
  try {
    const inbound = extractInbound(req.body || {});
    if (!inbound) return res.sendStatus(200);
    const { websiteId, sessionId, content } = inbound;

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
      const pluginToken = process.env.CRISP_PLUGIN_TOKEN;
      const id = process.env.CRISP_IDENTIFIER;
      const key = process.env.CRISP_KEY;
      const url = `https://api.crisp.chat/v1/website/${websiteId}/conversation/${sessionId}/message`;
      const headers = { "Content-Type": "application/json" };
      if (pluginToken) headers.Authorization = `Bearer ${pluginToken}`;
      else if (id && key) headers.Authorization = `Basic ${Buffer.from(`${id}:${key}`).toString("base64")}`;
      else logger.warn("Crisp webhook: missing auth (CRISP_PLUGIN_TOKEN or IDENTIFIER/KEY)");

      const resp = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({ type: "text", from: "operator", origin: "chat", content: aiText }),
      });
      if (!resp.ok) {
        const t = await resp.text().catch(() => "");
        logger.warn("Crisp API send failed", { status: resp.status, body: t?.slice(0, 500) });
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


