# 📂 Project Sitemap

- .cursorrules
- .env
- .gitignore
 
- docs
  - architecture.md
  - assistants.md
  - deployment.md
  - research.md
- nodemon.json
- package-lock.json
- package.json
- PROJECT_SITEMAP.md
- README.md
- render.yaml
- scripts
  - db
    - createIndexes.mjs
  - generateSitemap.js
  - generateSitemap.mjs
  - runApiChecks.mjs
  - start-all.ps1
- server
  - config
    - assistants
      - incharge
        - us-tx

      - lenhart
        - us-fl

  - core
    - llm
      - llmClient.js
    - memory
      - memoryRouter.js
      - mongoClient.js
      - pineconeClient.js
      - redisClient.js
    - orchestrator
      - chatOrchestrator.js
    - prompts
      - examples
        - incharge

        - lenhart

      - templates
        - incharge

        - lenhart

    - rag
      - prompt.js
      - retrieve.js
    - tools
      - anthropic.js
      - index.js
      - openai.js
    - utils
      - configLoader.js
      - logger.js
  - index.js
  - package.json
  - routes
    - chatRouter.js
    - feedbackRouter.js
    - widgetConfigRouter.js
- sitemap.xml
- tests
  - health.http
  - incharge.http
  - lenhart.http
  - negative.http
  - testAnthropic.js
  - testFeedback.js
  - testMongo.js
  - testOpenAI.js
  - testPinecone.js
  - testRag.js
  - testRedis.js