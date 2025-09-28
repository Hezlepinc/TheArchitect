export async function anthropicChat({ apiKey, model, systemPrompt, userMessage }) {
  if (!apiKey) {
    return `MOCK(Claude:${model}) â†’ ${userMessage}`;
  }
  const body = {
    model,
    max_tokens: 256,
    system: systemPrompt || undefined,
    messages: [ { role: "user", content: userMessage } ]
  };
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Anthropic error ${res.status}: ${errText}`);
  }
  const data = await res.json();
  const text = data?.content?.[0]?.text || "";
  return text || "";
}
