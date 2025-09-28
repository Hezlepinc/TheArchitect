// server/core/memory/redisClient.js
function ensureConfigured() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

async function redisGet(key) {
  if (!ensureConfigured()) return null;
  const url = `${process.env.UPSTASH_REDIS_REST_URL}/get/${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` },
  });
  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  return data?.result ?? null;
}

async function redisSet(key, value, ttlSeconds) {
  if (!ensureConfigured()) return false;
  let url = `${process.env.UPSTASH_REDIS_REST_URL}/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}`;
  if (ttlSeconds && Number(ttlSeconds) > 0) {
    url += `?EX=${Number(ttlSeconds)}`;
  }
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` },
  });
  return res.ok;
}

export async function redisGetJson(key) {
  const str = await redisGet(key);
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

export async function redisSetJson(key, obj, ttlSeconds) {
  try {
    const str = JSON.stringify(obj);
    return await redisSet(key, str, ttlSeconds);
  } catch {
    return false;
  }
}

export async function redisPing() {
  if (!ensureConfigured()) return { ok: false, error: "not_configured" };
  try {
    const res = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/ping`, {
      headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` },
    });
    return { ok: res.ok, status: res.status };
  } catch (e) {
    return { ok: false, error: e?.message };
  }
}