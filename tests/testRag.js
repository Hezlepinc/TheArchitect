// tests/testRag.js
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(".env") });

async function main() {
  if (!process.env.OPENAI_API_KEY || !process.env.PINECONE_API_KEY || !process.env.PINECONE_HOST || !process.env.PINECONE_INDEX) {
    console.log("SKIP RAG test: missing OPENAI/PINECONE envs");
    process.exit(0);
  }

  const base = process.env.API_BASE || "http://localhost:3000";
  const res = await fetch(`${base}/api/chat/incharge/us-tx/customer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "What services do you offer?" })
  });
  const body = await res.json().catch(() => ({}));
  if (res.ok) {
    console.log("PASS RAG chat", { provider: body.provider, via: body.via, rag: body.rag });
    process.exit(0);
  }
  console.error("FAIL RAG chat", res.status, body);
  process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });


