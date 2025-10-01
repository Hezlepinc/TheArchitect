import express from "express";
import { logger } from "../core/utils/logger.js";

const router = express.Router();

// Plugin install callback (optional)
router.post("/callback", (req, res) => {
  logger.info("Crisp plugin callback", { body: req.body });
  res.json({ status: "ok" });
});

// Plugin settings UI (optional placeholder)
router.get("/settings", (_req, res) => {
  res.json({ message: "Crisp plugin settings placeholder" });
});

// Simple dev/prod hooks for testing (optional)
router.post("/dev-hook", (req, res) => {
  logger.info("Crisp dev-hook", { body: req.body });
  res.json({ status: "ok" });
});

router.post("/prod-hook", (req, res) => {
  logger.info("Crisp prod-hook", { body: req.body });
  res.json({ status: "ok" });
});

export default router;


