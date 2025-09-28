import { openaiChat } from "./openai.js";
import { anthropicChat } from "./anthropic.js";

export function parseProvider(modelString, fallbackDefault) {
  const value = (modelString || fallbackDefault || "").trim();
  // formats: "openai:gpt-4o-mini", "anthropic:claude-3-5-sonnet-20240620"
  const [provider, ...rest] = value.split(":");
  return { provider: provider || "", model: rest.join(":") };
}

export async function callProvider({ provider, model, systemPrompt, userMessage }) {
  if (provider === "openai") {
    return openaiChat({ apiKey: process.env.OPENAI_API_KEY, model, systemPrompt, userMessage });
  }
  if (provider === "anthropic") {
    return anthropicChat({ apiKey: process.env.ANTHROPIC_API_KEY, model, systemPrompt, userMessage });
  }
  throw new Error(`Unknown provider: ${provider}`);
}
