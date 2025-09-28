export async function sendMessage(brand, region, persona, message) {
  const res = await fetch(
    `/api/chat/${brand}/${region}/${persona}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    }
  );
  return res.json();
}
