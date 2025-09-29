import React, { useState } from "react";
import { sendMessageToAPI } from "../utils/api.js";

export default function ChatUI({ sessionId, brand, persona, messages, setMessages }) {
  const [input, setInput] = useState("");

  async function sendMessage() {
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setMessages((m) => [...m, userMsg]);
    setInput("");

    try {
      const text = await sendMessageToAPI(input, brand, persona, sessionId);
      setMessages((m) => [...m, { role: "assistant", content: text }]);
    } catch (err) {
      setMessages((m) => [...m, { role: "assistant", content: "❌ Error contacting server" }]);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, i) => (
          <div key={i} className={`p-2 rounded ${msg.role === "user" ? "bg-blue-100 text-right" : "bg-gray-200 text-left"}`}>
            {msg.content}
          </div>
        ))}
      </div>
      <div className="p-2 border-t flex">
        <input
          className="flex-1 border p-2 rounded mr-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          placeholder="Type a message..."
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}


