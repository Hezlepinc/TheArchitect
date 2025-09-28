import { getPineconeIndex } from "../memory/pineconeClient.js";

export async function retrieveSnippets({ brandId, query, topK = 5 }) {
  const index = getPineconeIndex();
  const apiKey = process.env.OPENAI_API_KEY;
  if (!index || !apiKey) return [];

  // Embed via OpenAI REST to avoid extra SDK
  const eresp = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({ model: "text-embedding-3-small", input: query })
  });
  if (!eresp.ok) return [];
  const edata = await eresp.json().catch(() => null);
  const vector = edata?.data?.[0]?.embedding;
  if (!Array.isArray(vector)) return [];

  const results = await index.query({
    namespace: brandId,
    vector,
    topK,
    includeMetadata: true
  });
  const matches = results?.matches || [];
  return matches.map((m) => ({
    score: m.score,
    text: m.metadata?.text || "",
    title: m.metadata?.title || "",
    url: m.metadata?.url || ""
  }));
}
