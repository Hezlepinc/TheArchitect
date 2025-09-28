// client-playground/src/utils/api.js

export async function sendMessageToAPI(message, brand = "incharge", persona = "customer", sessionId = "default-session") {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, message, brand, persona }),
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();

    // chatRouter returns { text, provider, via, rag }
    return data.text || "⚠️ No reply from assistant.";
  } catch (err) {
    console.error("Error sending message:", err);
    return "⚠️ No reply received.";
  }
}