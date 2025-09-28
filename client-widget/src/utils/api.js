export let API_BASE = "";
export function setApiBase(base) {
  API_BASE = (base || "").replace(/\/$/, "");
}

export async function sendMessage(brand, region, persona, message) {
  const res = await fetch(
    `${API_BASE}/api/chat/${brand}/${region}/${persona}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    }
  );
  return res.json();
}

export async function getAssistantConfig(brand, region, persona) {
  const res = await fetch(`${API_BASE}/api/widget-config/${brand}/${region}/${persona}`);
  if (!res.ok) throw new Error("Failed to load assistant config");
  return res.json();
}
