// client-playground/src/utils/api.js

export async function sendMessageToAPI({ message, sessionId, brand, region, persona }) {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, message, brand, region, persona })
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();
    return data.text || data.reply || "⚠️ No reply from assistant.";
  } catch (err) {
    console.error("Error sending message:", err);
    return "❌ Error contacting server";
  }
}


