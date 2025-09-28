const baseUrl = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

function ensureConfigured() {
  if (!baseUrl || !token) return false;
  return true;
}

async function redisGet(key) {
  if (!ensureConfigured()) return null;
  const url = `${baseUrl}/get/${encodeURIComponent(key)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  // Upstash returns { result: string|null }
  return data?.result ?? null;
}

async function redisSet(key, value, ttlSeconds) {
  if (!ensureConfigured()) return false;
  let url = `${baseUrl}/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}`;
  if (ttlSeconds && Number(ttlSeconds) > 0) {
    url += `?EX=${Number(ttlSeconds)}`;
  }
  const res = await fetch(url, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
  return res.ok;
}

export async function redisGetJson(key) {
  const str = await redisGet(key);
  if (!str) return null;
  try { return JSON.parse(str); } catch { return null; }
}

export async function redisSetJson(key, obj, ttlSeconds) {
  try {
    const str = JSON.stringify(obj);
    return await redisSet(key, str, ttlSeconds);
  } catch {
    return false;
  }
}

export async function redisPing() {\n  if (!baseUrl || !token) return { ok: false, error: 'not_configured' };\n  try {\n    const res = await fetch(${baseUrl}/ping, { headers: { Authorization: Bearer  } });\n    return { ok: res.ok };\n  } catch (e) { return { ok: false, error: e?.message }; }\n}\n
