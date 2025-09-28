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

