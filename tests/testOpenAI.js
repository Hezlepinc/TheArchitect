// tests/testOpenAI.js
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(".env") });

async function testOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ OPENAI_API_KEY missing in .env");
    return;
  }

  console.log("🔌 Testing OpenAI...");

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // or "gpt-4o"
        messages: [{ role: "user", content: "Hello from TheArchitect test!" }],
        max_tokens: 50,
      }),
    });

    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const data = await res.json();
    console.log("✅ OpenAI Response:", data.choices[0].message.content);
  } catch (err) {
    console.error("❌ OpenAI test failed:", err.message);
  }
}

testOpenAI();