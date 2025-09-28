import express from "express";
import { loadAssistantConfig } from "../core/utils/configLoader.js";

const router = express.Router();

router.get("/:brand/:region/:persona", (req, res) => {
  try {
    const { brand, region, persona } = req.params;
    const config = loadAssistantConfig(brand, region, persona);
    res.json(config);
  } catch (err) {
    console.error("Config error:", err);
    res.status(404).json({ error: "Config not found" });
  }
});

export default router;
