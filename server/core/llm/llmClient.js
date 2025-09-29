import { parseProvider, callProvider } from "../tools/index.js";
import { retrieveSnippets } from "../rag/retrieve.js";
import { promises as fs } from "fs";
import path from "path";

export async function generateReply({ message, config, primaryModel, fallbackModel }) {
  const primaryStr = primaryModel || process.env.CHAT_PRIMARY || "openai:gpt-4o-mini";
  const fallbackStr = fallbackModel || process.env.CHAT_FALLBACK || "anthropic:claude-3-5-sonnet-20240620";
  const primary = parseProvider(primaryStr, "openai:gpt-4o-mini");
  const fallback = parseProvider(fallbackStr, "anthropic:claude-3-5-sonnet-20240620");

  let systemPrompt = buildSystemPrompt(config);
  // Optionally enrich with persona templates/examples stored as Markdown per brand/persona
  try {
    const brandId = String(config.brand || "").toLowerCase();
    const personaId = String(config.persona || "").toLowerCase();
    const templatesDir = path.resolve("server/core/prompts/templates", brandId);
    const examplesDir = path.resolve("server/core/prompts/examples", brandId);
    const templatePath = path.join(templatesDir, `${personaId}.md`);
    const examplesPath = path.join(examplesDir, `${personaId}.md`);
    try {
      const tmpl = await fs.readFile(templatePath, "utf8");
      if (tmpl && tmpl.trim().length) {
        systemPrompt += "\n\n## Persona Details\n" + tmpl.trim();
      }
    } catch {}
    try {
      const ex = await fs.readFile(examplesPath, "utf8");
      if (ex && ex.trim().length) {
        systemPrompt += "\n\n## Examples\n" + ex.trim();
      }
    } catch {}
  } catch {}
  let usedRag = false;
  // Optional RAG enrichment if env and clients are configured
  try {
    if (process.env.PINECONE_API_KEY && process.env.PINECONE_INDEX && process.env.OPENAI_API_KEY) {
      const brandId = String(config.brand || "").toLowerCase();
      const regionId = String(config.region || "").toLowerCase();
      const personaId = String(config.persona || "").toLowerCase();
      const snippets = await retrieveSnippets({ brandId, regionId, personaId, query: message, topK: 5 });
      if (Array.isArray(snippets) && snippets.length) {
        const ctx = "Relevant info:\n" + snippets.map((s, i) => `(${i + 1}) ${s.text}`).join("\n\n");
        systemPrompt = systemPrompt + "\n" + ctx;
        usedRag = true;
      }
    }
  } catch {}

  try {
    const res = await callProvider({ provider: primary.provider, model: primary.model, systemPrompt, userMessage: message });
    if (res?.text) return { ...res, via: "primary", rag: usedRag };
    throw new Error("Empty response from primary");
  } catch {
    const res = await callProvider({ provider: fallback.provider, model: fallback.model, systemPrompt, userMessage: message });
    return { ...res, via: "fallback", rag: usedRag };
  }
}

function buildSystemPrompt(cfg) {
  const lines = [];

  // Role
  lines.push("## Role");
  lines.push(`You are ${cfg.assistantName}, an AI assistant for ${cfg.brand}.`);
  lines.push("");

  // Brand Context
  lines.push("## Brand Context");
  lines.push(`Region: ${cfg.region}`);
  lines.push(`Persona: ${cfg.persona}`);
  if (cfg.greeting) {
    lines.push(`Greeting (UI only, do not include in replies): "${cfg.greeting}"`);
  }
  lines.push("");

  // Tone & Style
  lines.push("## Tone & Style");
  lines.push("- Friendly, brief, and confident");
  lines.push("- Use plain language; avoid jargon unless user uses it");
  lines.push("- Ask a concise clarifying question if information is missing");
  lines.push("");

  // Rules
  lines.push("## Rules");
  lines.push("- Be accurate; do not invent facts");
  lines.push("- Prefer bullet points for steps or lists");
  lines.push("- Keep replies short unless user asks for detail");
  lines.push("- If context snippets are provided, ground answers in them");
  lines.push("- Do NOT repeat or restate the greeting; answer the user's request directly");

  return lines.join("\n");
}
