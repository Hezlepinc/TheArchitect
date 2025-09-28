import { generateReply } from "../llm/llmClient.js";
import { logger } from "../utils/logger.js";

export async function chatOrchestrator(message, config) {
  try {
    const res = await generateReply({ message, config, primaryModel: process.env.CHAT_PRIMARY, fallbackModel: process.env.CHAT_FALLBACK });
    if (res?.text) return res;
  } catch (err) {
    logger.warn("LLM generate failed", { error: err?.message });
  }
  return { text: `Hello from ${config.assistantName}! You said: "${message}"`, provider: "mock", via: "mock" };
}
