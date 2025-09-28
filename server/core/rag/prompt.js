export function buildPrompt({ systemPrompt, snippets = [], history = [], userText }) {
  const contextBlock = snippets.length
    ? "Relevant info:\n" + snippets.map((s, i) => `(${i + 1}) ${s.text}`).join("\n\n")
    : "";
  const msgs = [
    { role: "system", content: systemPrompt },
    ...(contextBlock ? [{ role: "system", content: contextBlock }] : []),
    ...history,
    { role: "user", content: userText }
  ];
  return msgs;
}
