import { parseProvider, callProvider } from "../tools/index.js";
import { logger } from "../utils/logger.js";

export async function chatOrchestrator(message, config) {
  const primaryStr = process.env.CHAT_PRIMARY || "openai:gpt-4o-mini";
  const fallbackStr = process.env.CHAT_FALLBACK || "anthropic:claude-3-5-sonnet-20240620";
  const primary = parseProvider(primaryStr, "openai:gpt-4o-mini");
  const fallback = parseProvider(fallbackStr, "anthropic:claude-3-5-sonnet-20240620");

  const systemPrompt = buildSystemPrompt(config);

  try {
    const text = await callProvider({ provider: primary.provider, model: primary.model, systemPrompt, userMessage: message });
    if (text && text.length) return text;
    throw new Error("Empty response from primary");
  } catch (err) {
    logger.warn("Primary provider failed", { error: err?.message });
    try {
      const text = await callProvider({ provider: fallback.provider, model: fallback.model, systemPrompt, userMessage: message });
      if (text && text.length) return text;
      throw new Error("Empty response from fallback");
    } catch (err2) {
      logger.error("Fallback provider failed", { error: err2?.message });
      // Safe mock to keep UX responsive in local/dev
      return `Hello from ${config.assistantName}! You said: "${message}"`;
    }
  }
}

function buildSystemPrompt(cfg) {
  const parts = [];
  parts.push(`You are ${cfg.assistantName}, an AI assistant for brand ${cfg.brand}.`);
  parts.push(`Region: ${cfg.region}. Persona: ${cfg.persona}.`);
  if (cfg.greeting) parts.push(`Greet users consistently in your brand voice. Greeting: "${cfg.greeting}".`);
  parts.push("Be concise, friendly, and helpful. If unsure, ask a clarifying question.");
  return parts.join("\n");
}
