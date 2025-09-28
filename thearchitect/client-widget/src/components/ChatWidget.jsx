import React, { useState } from "react";
import { sendMessage } from "../utils/api.js";

export default function ChatWidget({ brand, region, persona, config }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input) return;
    setMessages([...messages, { sender: "user", text: input }]);

    const res = await sendMessage(brand, region, persona, input);
    setMessages((prev) => [...prev, { sender: "ai", text: res.text }]);
    setInput("");
  };

  return (
    <div className="chat-widget">
      <div className="messages">
        {messages.map((m, idx) => (
          <div key={idx} className={m.sender}>
            {m.text}
          </div>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}
