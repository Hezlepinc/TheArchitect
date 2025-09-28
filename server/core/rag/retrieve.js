// server/core/rag/retrieve.js
import { pineconeQuery } from "../memory/pineconeClient.js";

export async function retrieveSnippets({ brandId, regionId, personaId, query, topK = 5 }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return [];

  // 1. Create embedding using OpenAI REST
  const eresp = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: query,
    }),
  });

  if (!eresp.ok) {
    console.error("❌ OpenAI embedding failed:", eresp.status, eresp.statusText);
    return [];
  }

  const edata = await eresp.json().catch(() => null);
  const vector = edata?.data?.[0]?.embedding;
  if (!Array.isArray(vector)) return [];

  // 2. Query Pinecone with namespace: brand/region/persona, most specific available
  let results;
  try {
    const parts = [brandId, regionId, personaId].map((p) => String(p || "").trim()).filter(Boolean);
    const namespace = parts.length ? parts.join(":") : (brandId || "default");
    results = await pineconeQuery(vector, topK, namespace);
  } catch (err) {
    console.error("❌ Pinecone query failed:", err.message);
    return [];
  }

  const matches = results?.matches || [];
  return matches.map((m) => ({
    score: m.score,
    text: m.metadata?.text || "",
    title: m.metadata?.title || "",
    url: m.metadata?.url || "",
  }));
}