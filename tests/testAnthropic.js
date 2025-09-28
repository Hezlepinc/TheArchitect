// tests/testAnthropic.js
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(".env") });

async function testAnthropic() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("❌ ANTHROPIC_API_KEY missing in .env");
    return;
  }

  console.log("🔌 Testing Anthropic...");

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 50,
        messages: [{ role: "user", content: "Hello from TheArchitect test!" }],
      }),
    });

    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const data = await res.json();
    console.log("✅ Anthropic Response:", data.content[0].text);
  } catch (err) {
    console.error("❌ Anthropic test failed:", err.message);
  }
}

testAnthropic();