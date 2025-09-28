export async function openaiChat({ apiKey, model, systemPrompt, userMessage }) {
  if (!apiKey) {
    return `MOCK(OpenAI:${model}) â†’ ${userMessage}`;
  }
  const body = {
    model,
    messages: [
      systemPrompt ? { role: "system", content: systemPrompt } : null,
      { role: "user", content: userMessage }
    ].filter(Boolean)
  };
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`OpenAI error ${res.status}: ${errText}`);
  }
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content || "";
  return text || "";
}
