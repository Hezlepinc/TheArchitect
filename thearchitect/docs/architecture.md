# TheArchitect Architecture

- **Multi-tenant** design: one backend, many brand/region/persona assistants.
- **Core orchestrator** handles AI calls and logic.
- **Configs** define brand-specific personality, tone, and branding.
- **Widget** dynamically loads correct config via API.
