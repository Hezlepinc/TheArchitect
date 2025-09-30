import React from "react";
import { createRoot } from "react-dom/client";
import ChatWidget from "./components/ChatWidget.jsx";
import "./index.css";

const root = createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <div style={{ padding: 16 }}>
      <h1 style={{ marginBottom: 12 }}>AI Playground</h1>
      {/* ChatWidget floats at top-right by default; adjust with floating={false} to inline */}
      <ChatWidget brand="incharge" region="us-tx" persona="customer" />
    </div>
  </React.StrictMode>
);

