import { redisGetJson, redisSetJson } from "./redisClient.js";
import { getCollection } from "./mongoClient.js";

const SESSION_TTL_SECONDS = Number(process.env.SESSION_TTL_SECONDS || 3600);
const MAX_CONTEXT_ITEMS = Number(process.env.MAX_CONTEXT_ITEMS || 50);

function sessionKey(sessionId, brand) {
  const b = (brand || "").toLowerCase();
  return `session:${b}:${sessionId}`;
}

export async function getSessionContext(sessionId, brand) {
  const key = sessionKey(sessionId, brand);
  const ctx = (await redisGetJson(key)) || [];
  return Array.isArray(ctx) ? ctx : [];
}

export async function recordInteraction(sessionId, message, response, brand) {
  const key = sessionKey(sessionId, brand);
  const current = (await redisGetJson(key)) || [];
  const next = current.concat([
    { role: "user", text: message, ts: Date.now() },
    { role: "ai", text: response, ts: Date.now() }
  ]);
  const trimmed = next.slice(-MAX_CONTEXT_ITEMS);
  await redisSetJson(key, trimmed, SESSION_TTL_SECONDS);
  return { ok: true, length: trimmed.length };
}

export async function logChatTurnMongo({ sessionId, brand, region, persona, userMessage, aiResponse }) {
  try {
    const coll = await getCollection("chat_logs");
    const doc = {
      sessionId,
      brand,
      region,
      persona,
      userMessage,
      aiResponse,
      createdAt: new Date()
    };
    await coll.insertOne(doc);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e?.message };
  }
}
