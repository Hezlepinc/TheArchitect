import express from "express";
import { loadAssistantConfig } from "../core/utils/configLoader.js";
import { logger } from "../core/utils/logger.js";

const router = express.Router();

router.get("/:brand/:region/:persona", (req, res) => {
  try {
    const { brand, region, persona } = req.params;
    if (!brand || !region || !persona) {
      return res.status(400).json({ error: "brand, region, persona are required" });
    }
    const config = loadAssistantConfig(brand, region, persona);
    res.json(config);
  } catch (err) {
    logger.error("Config error", { error: err?.message });
    res.status(404).json({ error: "Config not found" });
  }
});

export default router;
