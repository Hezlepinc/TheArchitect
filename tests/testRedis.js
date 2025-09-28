// tests/testRedis.js
import dotenv from "dotenv";
import path from "path";
import { redisPing, redisSetJson, redisGetJson } from "../server/core/memory/redisClient.js";

// Load env from root .env
dotenv.config({ path: path.resolve(".env") });

async function main() {
  console.log("🔎 Debugging env vars...");
  console.log("UPSTASH_REDIS_REST_URL:", process.env.UPSTASH_REDIS_REST_URL || "❌ MISSING");
  console.log("UPSTASH_REDIS_REST_TOKEN:", process.env.UPSTASH_REDIS_REST_TOKEN ? "✅ SET" : "❌ MISSING");

  console.log("🔌 Pinging Redis...");
  const ping = await redisPing();
  console.log("Ping:", ping);

  console.log("📝 Setting key...");
  await redisSetJson("test:key", { hello: "world" }, 30);

  console.log("📖 Getting key...");
  const val = await redisGetJson("test:key");
  console.log("Value:", val);
}

main();