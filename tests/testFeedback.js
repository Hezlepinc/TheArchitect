// tests/testFeedback.js
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(".env") });

const base = process.env.API_BASE || "http://localhost:3000";

async function main() {
  if (!process.env.MONGODB_URI) {
    console.log("SKIP feedback test: MONGODB_URI not set");
    process.exit(0);
  }

  const payload = {
    sessionId: `test-session-${Date.now()}`,
    conversationLength: 12,
    conversationTranscript: [
      { role: "user", text: "Hello" },
      { role: "assistant", text: "Hi there!" },
    ],
    feedback: "Great experience. Answers were quick and precise.",
    charCount: 49,
  };

  const url = `${base}/api/feedback/incharge/us-tx/customer`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  if (res.ok && body?.ok) {
    console.log("PASS feedback insert", body.id);
    process.exit(0);
  }
  console.error("FAIL feedback insert", res.status, body);
  process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });


