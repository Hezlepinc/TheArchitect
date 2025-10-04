import { logger } from "./logger.js";

/**
 * Send a text message back to a Crisp conversation.
 * Does not throw on failure; returns boolean success and logs details.
 */
export async function sendCrispMessage({ websiteId, sessionId, text, from = "operator", origin = "chat" }) {
  try {
    const url = `https://api.crisp.chat/v1/website/${websiteId}/conversation/${sessionId}/message`;
    const pluginToken = process.env.CRISP_PLUGIN_TOKEN;
    const id = process.env.CRISP_IDENTIFIER;
    const key = process.env.CRISP_KEY;

    const headers = { "Content-Type": "application/json" };
    if (pluginToken) {
      headers.Authorization = `Bearer ${pluginToken}`;
    } else if (id && key) {
      headers.Authorization = `Basic ${Buffer.from(`${id}:${key}`).toString("base64")}`;
    } else {
      logger.warn("Crisp send: missing auth (CRISP_PLUGIN_TOKEN or IDENTIFIER/KEY)");
    }

    const resp = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ type: "text", from, origin, content: text })
    });
    if (!resp.ok) {
      const body = await resp.text().catch(() => "");
      logger.warn("Crisp API send failed", { status: resp.status, body: body?.slice(0, 500) });
      return false;
    }
    return true;
  } catch (e) {
    logger.error("Crisp send: unexpected error", { error: e?.message });
    return false;
  }
}


