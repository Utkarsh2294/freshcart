"""
input-understanding-service  (Phase 3)

Self-hosted deterministic text-intent parser. No third-party AI.
Parses natural language grocery queries into structured intents.

Intents
-------
product_search    - direct product lookup
category_browse   - user wants a category section
recipe_suggestion - user wants to cook something (-> Cook-with-AI)

Endpoint
--------
POST /understand  {query: str}  -> {intent, query, category_hint}
GET  /health      -> {status: "ok"}
"""

from fastapi import FastAPI
from pydantic import BaseModel
from models.nlu import detect_category_hint, detect_recipe_intent, extract_recipe_dish, extract_servings

app = FastAPI(title="Freshcart Input Understanding Service", version="3.0.0")

class UnderstandRequest(BaseModel):
    query: str


@app.post("/parse-text")
def parse_text(body: UnderstandRequest):
    query = body.query.strip()
    dish_name = extract_recipe_dish(query) if query else ""
    return {
        "dish_name": dish_name,
        "servings": extract_servings(query),
        "confidence": 0.95 if dish_name and detect_recipe_intent(query) else 0.8 if dish_name else 0.0,
    }


@app.post("/understand")
def understand(body: UnderstandRequest):
    q = body.query.strip()
    if not q:
        return {"intent": "product_search", "query": "", "category_hint": None}

    if detect_recipe_intent(q):
        dish = extract_recipe_dish(q)
        return {
            "intent": "recipe_suggestion",
            "query": dish,
            "category_hint": None,
        }

    category_hint = detect_category_hint(q)
    if category_hint:
        return {
            "intent": "category_browse",
            "query": q,
            "category_hint": category_hint,
        }

    return {"intent": "product_search", "query": q, "category_hint": None}


@app.get("/health")
def health():
    return {"status": "ok", "service": "input-understanding-service"}
