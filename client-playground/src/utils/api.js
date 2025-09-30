// client-playground/src/utils/api.js

export async function sendMessageToAPI(message, brand = "incharge", persona = "customer", sessionId = "default-session") {
  try {
    // Derive region via config discipline: map brand to region for playground only.
    // Inline assumption: incharge→us-tx, lenhart→us-fl. Adjust if config changes.
    const brandToRegion = { incharge: "us-tx", lenhart: "us-fl" };
    const region = brandToRegion[String(brand).toLowerCase()] || "us-tx";

    const url = `${import.meta.env.VITE_API_BASE}/api/chat/${brand}/${region}/${persona}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, message }),
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();
    return data.text || "⚠️ No reply from assistant.";
  } catch (err) {
    console.error("Error sending message:", err);
    return "⚠️ No reply received.";
  }
}