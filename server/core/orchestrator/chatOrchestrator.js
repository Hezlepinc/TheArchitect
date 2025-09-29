import { generateReply } from "../llm/llmClient.js";
import { logger } from "../utils/logger.js";

function sanitizeReply(text, config) {
  if (!text) return text;
  let out = String(text).trim();
  const greeting = (config?.greeting || "").trim();
  if (greeting) {
    const g = greeting.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const rx = new RegExp(`^(?:${g})\s*`, "i");
    out = out.replace(rx, "").trim();
  }
  // Generic safety: drop common welcome/openers if they lead the reply
  out = out.replace(/^welcome to [^.!?]+[.!?]\s*/i, "");
  out = out.replace(/^hello[,!]?\s*/i, "");
  return out.trim();
}

export async function chatOrchestrator(message, config) {
  try {
    const res = await generateReply({ message, config, primaryModel: process.env.CHAT_PRIMARY, fallbackModel: process.env.CHAT_FALLBACK });
    if (res?.text) {
      const cleaned = sanitizeReply(res.text, config);
      return { ...res, text: cleaned };
    }
  } catch (err) {
    logger.warn("LLM generate failed", { error: err?.message });
  }
  const fallback = `Thanks for the details. Could you share a bit more so I can help?`;
  return { text: fallback, provider: "mock", via: "mock" };
}
