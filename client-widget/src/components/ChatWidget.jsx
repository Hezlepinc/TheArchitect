import React, { useEffect, useRef, useState } from "react";
import { sendMessage, getAssistantConfig } from "../utils/api.js";

function getOrCreateSessionId(brand) {
  const key = `ARCH_SESSION:${(brand || "").toLowerCase()}`;
  let v = localStorage.getItem(key);
  if (!v) {
    v = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(key, v);
  }
  return v;
}

export default function ChatWidget({ brand, region, persona, floating = true }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [config, setConfig] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [unread, setUnread] = useState(0);
  const messagesRef = useRef(null);
  const prevLenRef = useRef(0);
  const sessionIdRef = useRef(null);

  useEffect(() => {
    sessionIdRef.current = getOrCreateSessionId(brand);
  }, [brand]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const cfg = await getAssistantConfig(brand, region, persona);
        if (!cancelled) setConfig(cfg);
        if (!cancelled && cfg?.greeting) {
          setMessages([{ sender: "ai", text: cfg.greeting }]);
        }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [brand, region, persona]);

  useEffect(() => {
    const el = messagesRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  useEffect(() => {
    const currentLen = messages.length;
    const prevLen = prevLenRef.current;
    if (currentLen > prevLen && !isOpen) {
      const last = messages[currentLen - 1];
      if (last?.sender === "ai") setUnread((u) => u + 1);
    }
    prevLenRef.current = currentLen;
  }, [messages, isOpen]);

  const handleOpen = () => { setIsOpen(true); setUnread(0); };

  const handleSend = async () => {
    const trimmed = (input || "").trim();
    if (!trimmed) return;
    setInput("");
    setMessages((prev) => [...prev, { sender: "user", text: trimmed }]);
    setIsTyping(true);
    try {
      const res = await sendMessage(brand, region, persona, trimmed, sessionIdRef.current);
      setMessages((prev) => [...prev, { sender: "ai", text: res.text }]);
    } finally { setIsTyping(false); }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const themeVars = config?.themeColor ? { "--brand-color": config.themeColor } : {};
  const containerClass = `chat-widget${floating ? " floating" : ""}`;

  if (!isOpen) {
    return (
      <div className={floating ? "chat-launcher floating" : "chat-launcher"} style={themeVars}>
        <button onClick={handleOpen} aria-label="Open chat">
          Chat
          {unread > 0 && <span className="badge" aria-label={`${unread} unread messages`}>{unread}</span>}
        </button>
      </div>
    );
  }

  return (
    <div className={containerClass} style={themeVars}>
      <div className="chat-header">
        {config?.logoUrl ? (
          <img src={config.logoUrl} alt={config.brand || config.assistantName || "Brand"} />
        ) : (
          <strong>{config?.assistantName || "Assistant"}</strong>
        )}
        <button className="chat-minimize" onClick={() => setIsOpen(false)} aria-label="Minimize chat">â€“</button>
      </div>

      <div className="messages" ref={messagesRef}>
        {messages.map((m, idx) => (
          <div key={idx} className={m.sender}>{m.text}</div>
        ))}
        {isTyping && (
          <div className="ai typing">{(config?.assistantName || "Assistant")} is typingâ€¦</div>
        )}
      </div>

      <div className="input-row">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={onKeyDown} placeholder="Type your message..." />
        <button onClick={handleSend}>Send</button>
      </div>

      {config && (config.scheduleUrl || config.ctaUrl || config.reviewUrl || config.textUrl) && (
        <div className="chat-footer-actions">
          {config.scheduleUrl && (<a href={config.scheduleUrl}>Schedule</a>)}
          {config.ctaUrl && (<a href={config.ctaUrl}>Contact</a>)}
          {config.reviewUrl && (<a href={config.reviewUrl} target="_blank" rel="noopener noreferrer">Reviews</a>)}
          {config.textUrl && (<a href={config.textUrl}>Text</a>)}
        </div>
      )}

    </div>
  );
}
