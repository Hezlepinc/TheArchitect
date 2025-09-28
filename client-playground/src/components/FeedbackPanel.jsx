import React, { useMemo, useState } from "react";

export default function FeedbackPanel({ sessionId, brand, region, persona, messages, chatPairs, onSubmitted }) {
  const [feedback, setFeedback] = useState("");
  const minPairs = 10;
  const minChars = 150;
  const chars = feedback.trim().length;
  const transcript = useMemo(() => (messages || []).map(m => ({ role: m.role === "user" ? "user" : "assistant", text: m.content })), [messages]);
  const canSubmit = chatPairs >= minPairs && chars >= minChars;

  async function submitFeedback() {
    if (!canSubmit) return;
    await fetch(`${import.meta.env.VITE_API_BASE}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brand, region, persona, sessionId, conversationLength: transcript.length, conversationTranscript: transcript, feedback: feedback.trim(), charCount: chars })
    });
    setFeedback("");
    alert("✅ Feedback submitted!");
    if (onSubmitted) onSubmitted();
  }

  return (
    <div>
      <h2 className="text-lg font-bold mb-2">Feedback</h2>
      <div className="text-sm text-gray-600 mb-1">Chats: {Math.min(chatPairs, minPairs)} / {minPairs}</div>
      <div className="w-full h-1 bg-gray-200 rounded mb-2"><div className="h-1 bg-blue-500 rounded" style={{ width: `${Math.min(100, (chatPairs / minPairs) * 100)}%` }} /></div>
      <textarea className="w-full border rounded p-2 mb-1" rows="5" value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="What worked well? What needs improvement?" />
      <div className="text-sm text-gray-600 mb-2">Feedback: {Math.min(chars, minChars)} / {minChars} chars</div>
      <button className={`px-4 py-2 rounded ${canSubmit ? "bg-green-600 text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`} disabled={!canSubmit} onClick={submitFeedback}>Submit</button>
    </div>
  );
}


