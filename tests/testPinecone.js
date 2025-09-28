// tests/testPinecone.js
import dotenv from "dotenv";
import path from "path";
import { pineconePing, pineconeUpsert, pineconeQuery } from "../server/core/memory/pineconeClient.js";

dotenv.config({ path: path.resolve(".env") });

async function main() {
  console.log("🔎 Debugging Pinecone env...");
  console.log("HOST:", process.env.PINECONE_HOST || "❌ missing");
  console.log("API KEY:", process.env.PINECONE_API_KEY ? "✅ set" : "❌ missing");

  console.log("🔌 Pinging Pinecone...");
  const ping = await pineconePing();
  console.log("Ping:", ping);

  const dim = ping.index.dimension || 1536;
  console.log(`ℹ️ Using dimension: ${dim}`);

  console.log("📝 Upserting vector...");
  const vector = {
    id: "test-vector-1",
    values: Array(dim).fill(0.1), // match index dimension
    metadata: { source: "test", text: "Hello Pinecone" },
  };
  await pineconeUpsert([vector]);

  console.log("📖 Querying vector...");
  const result = await pineconeQuery(Array(dim).fill(0.1), 1);
  console.log("Query result:", JSON.stringify(result, null, 2));
}

main();