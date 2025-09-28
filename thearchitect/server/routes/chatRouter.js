import express from "express";
import { loadAssistantConfig } from "../core/utils/configLoader.js";
import { chatOrchestrator } from "../core/orchestrator/chatOrchestrator.js";

const router = express.Router();

router.post("/:brand/:region/:persona", async (req, res) => {
  try {
    const { brand, region, persona } = req.params;
    const config = loadAssistantConfig(brand, region, persona);
    const reply = await chatOrchestrator(req.body.message, config);
    res.json({ text: reply });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "Chat failed" });
  }
});

export default router;
