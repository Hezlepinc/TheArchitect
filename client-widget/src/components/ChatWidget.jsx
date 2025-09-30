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
  const [isSending, setIsSending] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [unread, setUnread] = useState(0);
  const messagesRef = useRef(null);
  const prevLenRef = useRef(0);
  const sessionIdRef = useRef(null);
  const inputRef = useRef(null);

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
    setIsSending(true);
    setIsTyping(true);
    try {
      const res = await sendMessage(brand, region, persona, trimmed, sessionIdRef.current);
      if (!res || typeof res.text !== "string") {
        throw new Error("invalid response");
      }
      setMessages((prev) => [...prev, { sender: "ai", text: res.text }]);
    } catch (_e) {
      setMessages((prev) => [...prev, { sender: "system", text: "Unable to send. Please check your connection and try again." }]);
    } finally { setIsTyping(false); setIsSending(false); }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const onInputChange = (e) => {
    setInput(e.target.value);
    const el = inputRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(120, el.scrollHeight) + "px";
    }
  };

  const themeVars = config?.themeColor ? { "--brand-color": config.themeColor } : {};
  const containerClass = `chat-widget${floating ? " floating" : ""} anim-in`;

  const handleSendQuick = (text) => {
    setInput(text);
    setTimeout(handleSend, 0);
  };

  if (!isOpen) {
    return (
      <div className={(floating ? "chat-launcher floating" : "chat-launcher") + (unread > 0 ? " pulse" : "")} style={themeVars}>
        <button onClick={handleOpen} aria-label="Open chat">
          Chat
          {unread > 0 && <span className="badge" aria-label={`${unread} unread messages`}>{Math.min(unread, 9)}</span>}
        </button>
      </div>
    );
  }

  return (
    <div className={containerClass} style={themeVars}>
      <div className="chat-header gradient full-bleed">
        <div className="header-main">
          <div className="header-left">
            <span className="info-bubble large" aria-hidden="true">i</span>
            <div className="header-text">
              <div className="chat-title">{config?.assistantName || "Assistant"}</div>
              {/* subtitle removed per request */}
            </div>
          </div>
          <button className="chat-minimize far-right" onClick={() => setIsOpen(false)} aria-label="Minimize chat">-</button>
        </div>
      </div>

      <div className="messages" ref={messagesRef} aria-live="polite" aria-atomic="false">
        {messages.map((m, idx) => (
          <div key={idx} className={`message-row ${m.sender}`}>
            {m.sender === "ai" && (
              <span className="avatar ai" aria-hidden="true">{(config?.assistantName || "A").slice(0,1)}</span>
            )}
            <div className={`bubble ${m.sender}`}>
              {m.text}
              <div className="timestamp">{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
            </div>
            {m.sender === "user" && (
              <span className="avatar user" aria-hidden="true">Y</span>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="message-row ai">
            <span className="avatar ai" aria-hidden="true">{(config?.assistantName || "A").slice(0,1)}</span>
            <div className="bubble ai typing">
              {(config?.assistantName || "Assistant")} is typing <span className="typing-dots"><span></span><span></span><span></span></span>
            </div>
          </div>
        )}
      </div>

      {messages.every((m) => m.sender !== "user") && config?.greeting && (
        <div className="quick-replies">
          {(Array.isArray(config?.quickReplies) && config.quickReplies.length > 0
            ? config.quickReplies
            : ["Just playing around", "I need Support"]
          ).slice(0, 4).map((qr, i) => (
            <button key={i} onClick={() => handleSendQuick(qr)}>{qr}</button>
          ))}
        </div>
      )}

      <div className="input-row">
        <textarea
          ref={inputRef}
          rows={1}
          value={input}
          onChange={onInputChange}
          onKeyDown={onKeyDown}
          placeholder="Type your message..."
          autoFocus
          disabled={isSending}
        />
        <button onClick={handleSend} disabled={!input.trim() || isSending || isTyping}>{isSending ? "…" : "Send"}</button>
      </div>

      {config?.scheduleUrl && (
        <div className="chat-footer-cta">
          <a className="cta-primary" href={config.scheduleUrl}>Schedule</a>
          <div className="chat-byline right">AI by {config?.brand || "Your Brand"}</div>
        </div>
      )}

    </div>
  );
}

function handleSendQuickFactory(setInput, handleSend, text) {
  return () => {
    setInput(text);
    setTimeout(handleSend, 0);
  };
}
