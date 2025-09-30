import React, { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { submitFeedback } from "../utils/api.js";

export default function FeedbackPanel({ brand, region, persona, sessionId, conversation }) {
  const [feedback, setFeedback] = useState("");
  const [status, setStatus] = useState("idle");
  const [showModal, setShowModal] = useState(false);

  const turns = Array.isArray(conversation) ? conversation.length : 0;
  // Testing-only: reduce to 2 to enable faster feedback cycles during QA
  const minTurns = 2;
  const minChars = 100; // can be tuned 100-150
  const maxChars = 1000;
  const remaining = Math.max(0, maxChars - feedback.length);
  const meetsTurnReq = turns >= minTurns;
  const meetsCharReq = feedback.trim().length >= minChars;
  const disabled = !meetsTurnReq || !meetsCharReq || status === "submitting";

  useEffect(() => {
    if (meetsTurnReq) {
      const el = document.querySelector(".feedback-textarea");
      if (el) {
        el.classList.add("unlock-highlight");
        const t = setTimeout(() => el.classList.remove("unlock-highlight"), 1200);
        return () => clearTimeout(t);
      }
    }
  }, [meetsTurnReq]);

  const transcript = useMemo(() => {
    return (conversation || []).map((m) => ({ role: m.sender === "ai" ? "assistant" : "user", text: m.text }));
  }, [conversation]);

  async function handleSubmit() {
    if (disabled) return;
    setStatus("submitting");
    try {
      const payload = {
        sessionId: sessionId || "unknown",
        conversationLength: turns,
        conversationTranscript: transcript,
        feedback: feedback.trim().slice(0, maxChars),
        charCount: feedback.trim().length,
      };
      const res = await submitFeedback(brand, region, persona, payload);
      if (res?.ok) {
        setStatus("success");
        setShowModal(true);
        setFeedback("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    } finally {
      setTimeout(() => setStatus("idle"), 1000);
    }
  }

  return (
    <Card className={cn("max-w-xl w-full")}> 
      <CardHeader>
        <CardTitle>Feedback</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-600 mb-2">
          {meetsTurnReq ? `You're eligible to leave feedback.` : `Chat ${minTurns}+ turns to unlock feedback.`}
        </div>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value.slice(0, maxChars))}
          placeholder={meetsTurnReq ? "Tell us what you think..." : `Locked until ${minTurns}+ turns`}
          className={cn("feedback-textarea w-full h-28 border rounded-md p-2 outline-none focus:ring focus:ring-blue-200", !meetsTurnReq ? "opacity-60" : "")}
          disabled={!meetsTurnReq}
        />
        <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
          <span>{remaining} characters remaining</span>
          {!meetsCharReq && meetsTurnReq && (
            <span className="text-amber-600">Consider adding more detail to help improve the assistant.</span>
          )}
        </div>
        {status === "success" && (
          <p className="text-green-600 text-sm mt-2">Thanks! Feedback sent.</p>
        )}
        {status === "error" && (
          <p className="text-red-600 text-sm mt-2">Something went wrong.</p>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} disabled={disabled}>
          {status === "submitting" ? "Sending..." : "Send Feedback"}
        </Button>
      </CardFooter>
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-white rounded-md p-4 w-[320px] shadow">
            <div className="text-green-700 mb-2">✅ Thanks for your feedback. Your full conversation has been logged for review.</div>
            <div className="flex items-center justify-end gap-2">
              {sessionId && (
                <button
                  className="text-sm underline"
                  onClick={() => navigator.clipboard?.writeText(sessionId)}
                >
                  Copy session ID
                </button>
              )}
              <button className="bg-gray-900 text-white rounded px-3 py-1" onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
