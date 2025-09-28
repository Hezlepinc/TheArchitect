import React, { useEffect, useState } from "react";

export default function FeedbackDashboard({ brand, region, persona }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        if (brand) params.set("brand", brand);
        if (region) params.set("region", region);
        if (persona) params.set("persona", persona);
        params.set("limit", "50");
        const url = `${import.meta.env.VITE_API_BASE}/feedback/list?${params.toString()}`;
        const res = await fetch(url, { headers: { "x-admin-key": import.meta.env.VITE_ADMIN_KEY || "" } });
        const data = await res.json().catch(() => ({}));
        if (!cancelled) setItems(Array.isArray(data.items) ? data.items : []);
      } catch (e) {
        if (!cancelled) setError("Failed to load feedback");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [brand, region, persona]);

  if (loading) return <div className="p-4">Loading…</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-3">Feedback Dashboard</h2>
      {items.length === 0 ? (
        <div className="text-gray-600">No feedback yet.</div>
      ) : (
        <ul className="space-y-3">
          {items.map((fb) => (
            <li key={fb._id || `${fb.sessionId}-${fb.createdAt}`} className="border rounded p-3 bg-white">
              <div className="text-gray-900 whitespace-pre-wrap">{fb.feedback}</div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Brand: {fb.brand} · Region: {fb.region} · Persona: {fb.persona}</span>
                <span>Len: {fb.conversationLength} · Chars: {fb.charCount}</span>
                <span>{fb.createdAt ? new Date(fb.createdAt).toLocaleString() : ""}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


