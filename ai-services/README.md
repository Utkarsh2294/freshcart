# AI service boundaries

The production Compose file runs the active self-hosted services: `input-understanding-service` and `recommendation-service`. Ingredient matching and quantity-aware pack selection run deterministically in the Node API, while structured recipe generation uses the Kimi K3 client in the Node API.

The `recipe-engine-service`, `matcher-service`, `orchestrator`, and `tts-service` directories are retained only as historical prototype placeholders and are not deployment dependencies. Browser speech synthesis supplies optional cooking read-aloud, so no TTS service is required for the working site.
