// server/core/memory/pineconeClient.js

function ensureConfigured() {
  return Boolean(process.env.PINECONE_API_KEY && process.env.PINECONE_HOST && process.env.PINECONE_INDEX);
}

export async function pineconeUpsert(vectors, namespace = "default") {
  if (!ensureConfigured()) throw new Error("Pinecone not configured");

  const url = `${process.env.PINECONE_HOST}/vectors/upsert`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Api-Key": process.env.PINECONE_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ vectors, namespace }),
  });

  if (!res.ok) throw new Error(`Upsert failed: ${res.status} ${res.statusText}`);
  return res.json();
}

export async function pineconeQuery(vector, topK = 3, namespace = "default") {
  if (!ensureConfigured()) throw new Error("Pinecone not configured");

  const url = `${process.env.PINECONE_HOST}/query`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Api-Key": process.env.PINECONE_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      vector,
      topK,
      namespace,
      includeMetadata: true,
    }),
  });

  if (!res.ok) throw new Error(`Query failed: ${res.status} ${res.statusText}`);
  return res.json();
}

export async function pineconePing() {
  if (!ensureConfigured()) return { ok: false, error: "not_configured" };

  try {
    const url = `${process.env.PINECONE_HOST}/describe_index_stats`;
    const res = await fetch(url, { headers: { "Api-Key": process.env.PINECONE_API_KEY } });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const data = await res.json();
    return { ok: true, index: data };
  } catch (e) {
    return { ok: false, error: e?.message };
  }
}