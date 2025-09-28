import { openaiChat } from "./openai.js";
import { anthropicChat } from "./anthropic.js";

export function parseProvider(modelString, fallbackDefault) {
  const value = (modelString || fallbackDefault || "").trim();
  const [provider, ...rest] = value.split(":");
  return { provider: provider || "", model: rest.join(":") };
}

export async function callProvider({ provider, model, systemPrompt, userMessage }) {
  if (provider === "openai") {
    const text = await openaiChat({ apiKey: process.env.OPENAI_API_KEY, model, systemPrompt, userMessage });
    return { text, provider: "openai" };
  }
  if (provider === "anthropic") {
    const text = await anthropicChat({ apiKey: process.env.ANTHROPIC_API_KEY, model, systemPrompt, userMessage });
    return { text, provider: "anthropic" };
  }
  throw new Error(`Unknown provider: ${provider}`);
}
