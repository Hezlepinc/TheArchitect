# TheArchitect

Multi-tenant AI Assistant Platform for managing **multi-brand, multi-location, multi-persona** assistants.

## Structure

- `server/` → backend APIs, orchestrator, config loader
- `client-widget/` → frontend chat widget (React)
- `config/assistants/` â†’ brand/region/persona JSON configs
- `docs/` â†’ design notes, research, deployment steps

## Getting Started

1. `npm install`
2. `npm run dev` (server)
3. `npm run dev` (client-widget)

## Health & Checks

- `GET /health` → basic OK
- `GET /health/full` → Mongo/Redis/Pinecone/provider summary
- `npm run test:api` → automated API checks

## AI Behavior & RAG

- System prompt is structured (Role, Brand Context, Tone & Style, Rules)
- Optional persona files:
  - `server/core/prompts/templates/{brand}/{persona}.md`
  - `server/core/prompts/examples/{brand}/{persona}.md`
- Responses include: `{ text, provider, via, rag }`
- RAG auto-enables when `OPENAI_API_KEY`, `PINECONE_API_KEY`, `PINECONE_INDEX` are set

## Implementation Plan

See `docs/implementation-plan.md` for deep-dive on data model, RAG, feedback loops, admin, and rollout.

## GitHub

git add .
git commit -m "your message"
git push

## Crisp Webhook Integration

1. Add a webhook in Crisp pointing to:
   - `https://<your-ngrok-id>.ngrok.io/crisp/webhook`
2. Select events:
   - message:send (required)
   - message:received (optional)
3. Create REST API credentials in Crisp and set env vars:
   - `CRISP_IDENTIFIER`, `CRISP_KEY`
4. Optionally map website IDs to assistants via `CRISP_WEBSITE_MAP`:
   - Example: `{ "<website_id>": { "brand": "incharge", "region": "us-tx", "persona": "customer" } }`

Test locally (requires ngrok):

```bash
curl -X POST http://localhost:3000/crisp/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "message:send",
    "data": {
      "website_id": "<website_id>",
      "session_id": "test-session-123",
      "content": "Hello"
    }
  }'
```

### Crisp Plugin (Action URL)

Action URL: `POST /crisp/action`

Payload example:

```json
{
  "event": "message:send",
  "website_id": "<website_id>",
  "session_id": "<session_id>",
  "message": { "from": "user", "content": "Hello" }
}
```

Test:

```bash
curl -X POST http://localhost:3000/crisp/action \
  -H "Content-Type: application/json" \
  -d '{
    "event":"message:send",
    "website_id":"<website_id>",
    "session_id":"test-session-123",
    "message": {"from":"user","content":"Hello"}
  }'
```

