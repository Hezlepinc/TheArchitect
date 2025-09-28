import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function FeedbackPanel() {
  const [feedback, setFeedback] = useState("");
  const [status, setStatus] = useState("idle");

  async function handleSubmit() {
    if (!feedback.trim()) return;
    setStatus("submitting");
    try {
      await new Promise((r) => setTimeout(r, 600));
      setStatus("success");
      setFeedback("");
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
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Tell us what you think..."
          className="w-full h-28 border rounded-md p-2 outline-none focus:ring focus:ring-blue-200"
        />
        {status === "success" && (
          <p className="text-green-600 text-sm mt-2">Thanks! Feedback sent.</p>
        )}
        {status === "error" && (
          <p className="text-red-600 text-sm mt-2">Something went wrong.</p>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} disabled={status === "submitting" || !feedback.trim()}>
          {status === "submitting" ? "Sending..." : "Send Feedback"}
        </Button>
      </CardFooter>
    </Card>
  );
}
