# Assistant Configurations

Each assistant is defined by a JSON config:
- `assistantName` → display name
- `brand` → company brand
- `region` → region code
- `persona` → customer/internal/etc.
- `greeting` → opening line
- `themeColor` → branding color

## Prompt Templates & Examples (New)
- Optional external prompt files can be added per brand/persona to refine behavior without code changes:
  - `server/core/prompts/templates/{brand}/{persona}.md` → persona background, tone, rules
  - `server/core/prompts/examples/{brand}/{persona}.md` → few‑shot examples
- The orchestrator automatically appends these sections to the system prompt when present.

## RAG (Retrieval) Toggle
- If the following env vars are set, the orchestrator enriches prompts with relevant snippets:
  - `OPENAI_API_KEY` (for embeddings)
  - `PINECONE_API_KEY`, `PINECONE_INDEX`
- Chat responses include `rag: true|false` indicating whether snippets were used.
