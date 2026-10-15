# AI service boundaries

The active self-hosted services are `input-understanding-service` and `recommendation-service`. Ingredient matching and quantity-aware pack selection run deterministically in the Node API, while structured recipe generation uses Groq through the Node API. Browser speech synthesis supplies optional cooking read-aloud.
