import express from "express";
import { getCollection } from "../core/memory/mongoClient.js";

const router = express.Router();

function requireAuth(req, res, next) {
  const token = req.query.token || "";
  if (process.env.FEEDBACK_DASH_TOKEN && token !== process.env.FEEDBACK_DASH_TOKEN) {
    return res.status(403).send("Forbidden");
  }
  next();
}

router.get("/", requireAuth, async (req, res) => {
  const { start, end, brand, persona } = req.query || {};

  const now = new Date();
  const startDate = start ? new Date(start) : new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const endDate = end ? new Date(end) : now;

  const col = await getCollection("FeedbackLog");
  const q = { createdAt: { $gte: startDate, $lte: endDate } };
  if (brand) q.brand = String(brand);
  if (persona) q.persona = String(persona);

  const logs = await col
    .find(q)
    .sort({ createdAt: -1 })
    .limit(200)
    .toArray();

  const rows = logs
    .map(
      (log) => `
            <tr>
              <td>${(log.brand || "").toString()}</td>
              <td>${(log.persona || "").toString()}</td>
              <td>${Number(log.conversationLength ?? log.chatCount ?? 0)}</td>
              <td>${(log.feedback || "").toString().replace(/</g, "&lt;")}</td>
              <td>${log.createdAt ? new Date(log.createdAt).toLocaleString() : ""}</td>
            </tr>`
    )
    .join("");

  res.send(`
    <html>
      <head>
        <title>Feedback Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; vertical-align: top; }
          th { background: #f4f4f4; }
          form { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
          input, select, button { padding: 6px 8px; }
          .controls { display: flex; gap: 12px; align-items: center; margin-top: 8px; }
        </style>
      </head>
      <body>
        <h1>Feedback Dashboard</h1>
        <form method="get">
          <input type="hidden" name="token" value="${(req.query.token || "").toString()}" />
          <div class="controls">
            <label>Start: <input type="date" name="start" value="${start ? String(start) : ""}" /></label>
            <label>End: <input type="date" name="end" value="${end ? String(end) : ""}" /></label>
            <label>Brand: <input type="text" name="brand" value="${brand ? String(brand) : ""}" /></label>
            <label>Persona: <input type="text" name="persona" value="${persona ? String(persona) : ""}" /></label>
            <button type="submit">Filter</button>
          </div>
        </form>
        <p>Showing ${logs.length} results from ${startDate.toDateString()} to ${endDate.toDateString()}</p>
        <table>
          <tr>
            <th>Brand</th>
            <th>Persona</th>
            <th>Chats</th>
            <th>Feedback</th>
            <th>Time</th>
          </tr>
          ${rows}
        </table>
      </body>
    </html>
  `);
});

export default router;


