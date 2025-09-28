# TheArchitect Architecture

- **Multi-tenant** design: one backend, many brand/region/persona assistants.
- **Core orchestrator** handles AI calls and logic.
- **Configs** define brand-specific personality, tone, and branding.
- **Widget** dynamically loads correct config via API.


## LLM + Memory Flow (Planned)
- Orchestrator builds system prompts from assistant config (brand/region/persona/tone).
- llmClient routes to primary model (OpenAI) with fallback to Claude.
- memoryRouter will manage Redis (short-term), Mongo (logs), Pinecone (RAG search) per brand.
- Function calling will enable scheduling/CRM hooks.
