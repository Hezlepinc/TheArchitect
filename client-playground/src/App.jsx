import React, { useMemo, useState } from "react";
import ChatUI from "./components/ChatUI.jsx";
import FeedbackPanel from "./components/FeedbackPanel.jsx";
import FeedbackDashboard from "./components/FeedbackDashboard.jsx";

export default function App() {
  const [sessionId] = useState(() => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`);
  const [brand, setBrand] = useState("incharge");
  const [region, setRegion] = useState("us-tx");
  const [persona, setPersona] = useState("customer");
  const [messages, setMessages] = useState([]);
  const chatPairs = useMemo(() => messages.filter(m => m.role === "assistant").length, [messages]);
  const [view, setView] = useState("chat");

  return (
    <div className="flex h-screen">
      <div className="flex-1 border-r flex flex-col">
        <div className="p-2 border-b bg-gray-100 flex gap-4 items-center">
          <div>
            <label className="text-sm font-medium mr-1">Brand:</label>
            <select className="border rounded px-2 py-1" value={brand} onChange={(e) => setBrand(e.target.value)}>
              <option value="incharge">InCharge</option>
              <option value="lenhart">Lenhart</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mr-1">Region:</label>
            <select className="border rounded px-2 py-1" value={region} onChange={(e) => setRegion(e.target.value)}>
              <option value="us-tx">US-TX</option>
              <option value="us-fl">US-FL</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mr-1">Persona:</label>
            <select className="border rounded px-2 py-1" value={persona} onChange={(e) => setPersona(e.target.value)}>
              <option value="customer">Customer</option>
            </select>
          </div>
        </div>
        <div className="p-2 flex gap-2">
          <button className={`px-3 py-1 rounded ${view === "chat" ? "bg-blue-600 text-white" : "bg-gray-200"}`} onClick={() => setView("chat")}>Chat</button>
          <button className={`px-3 py-1 rounded ${view === "dashboard" ? "bg-blue-600 text-white" : "bg-gray-200"}`} onClick={() => setView("dashboard")}>Feedback Dashboard</button>
        </div>
        {view === "chat" ? (
          <ChatUI
            sessionId={sessionId}
            brand={brand}
            region={region}
            persona={persona}
            messages={messages}
            setMessages={setMessages}
          />
        ) : (
          <FeedbackDashboard brand={brand} region={region} persona={persona} />
        )}
      </div>
      <div className="w-96 p-4 bg-gray-100 overflow-y-auto">
        <FeedbackPanel
          sessionId={sessionId}
          brand={brand}
          region={region}
          persona={persona}
          messages={messages}
          chatPairs={chatPairs}
        />
      </div>
    </div>
  );
}


