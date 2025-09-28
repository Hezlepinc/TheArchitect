import React from "react";
import { createRoot } from "react-dom/client";
import ChatWidget from "./components/ChatWidget.jsx";
import FeedbackPanel from "./components/FeedbackPanel.jsx";
import DevNotesPanel from "./components/DevNotesPanel.jsx";
import "./index.css";

const root = createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <div style={{ padding: 16 }}>
      <h1 style={{ marginBottom: 12 }}>TheArchitect Playground</h1>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <FeedbackPanel />
        <DevNotesPanel />
      </div>
      {/* ChatWidget floats at top-right by default; adjust with floating={false} to inline */}
      <ChatWidget brand="incharge" region="us-tx" persona="customer" />
    </div>
  </React.StrictMode>
);
