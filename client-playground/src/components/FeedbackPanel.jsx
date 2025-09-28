import React, { useState } from "react";

export default function FeedbackPanel({ sessionId, brand, region, persona }) {
  const [feedback, setFeedback] = useState("");

  async function submitFeedback() {
    if (!feedback.trim()) return;

    await fetch(`${import.meta.env.VITE_API_BASE}/feedback/${brand}/${region}/${persona}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, conversationLength: 0, conversationTranscript: [], feedback, charCount: feedback.trim().length })
    });

    setFeedback("");
    alert("✅ Feedback submitted!");
  }

  return (
    <div>
      <h2 className="text-lg font-bold mb-2">Feedback</h2>
      <textarea className="w-full border rounded p-2 mb-2" rows="5" value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="What worked well? What needs improvement?" />
      <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={submitFeedback}>Submit</button>
    </div>
  );
}


