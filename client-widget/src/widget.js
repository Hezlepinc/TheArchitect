import React from "react";
import { createRoot } from "react-dom/client";
import ChatWidget from "./components/ChatWidget.jsx";
import { setApiBase } from "./utils/api.js";
import "./index.css";

export function mountChatWidget(target, props = {}) {
  const el = typeof target === "string" ? document.querySelector(target) : target;
  if (!el) throw new Error("mountChatWidget: target element not found");
  if (props.apiBase) setApiBase(props.apiBase);
  const root = createRoot(el);
  root.render(
    <React.StrictMode>
      <ChatWidget {...props} />
    </React.StrictMode>
  );
  return () => root.unmount();
}
