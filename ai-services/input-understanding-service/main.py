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

import re
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Freshcart Input Understanding Service", version="3.0.0")

# ---------------------------------------------------------------------------
# Keyword maps (no ML — deterministic, zero latency, fully self-hosted)
# ---------------------------------------------------------------------------

RECIPE_TRIGGERS = [
    r"\b(cook|make|prepare|bake|recipe for|how to make|i want to make|i need to cook)\b",
    r"\b(ingredients for|ingredient for)\b",
    r"\b(for dinner|for lunch|for breakfast|tonight|tonight's meal)\b",
]

CATEGORY_MAP = {
    "fruits": "Fruits & Vegetables",
    "vegetable": "Fruits & Vegetables",
    "vegetables": "Fruits & Vegetables",
    "veggies": "Fruits & Vegetables",
    "dairy": "Dairy & Eggs",
    "milk": "Dairy & Eggs",
    "cheese": "Dairy & Eggs",
    "eggs": "Dairy & Eggs",
    "snack": "Snacks & Branded Foods",
    "snacks": "Snacks & Branded Foods",
    "chips": "Snacks & Branded Foods",
    "biscuit": "Snacks & Branded Foods",
    "biscuits": "Snacks & Branded Foods",
    "beverage": "Beverages",
    "beverages": "Beverages",
    "drink": "Beverages",
    "juice": "Beverages",
    "cold drink": "Beverages",
    "staple": "Staples",
    "staples": "Staples",
    "rice": "Staples",
    "flour": "Staples",
    "atta": "Staples",
    "personal care": "Personal Care",
    "shampoo": "Personal Care",
    "soap": "Personal Care",
    "home care": "Home Care",
    "cleaning": "Home Care",
    "detergent": "Home Care",
}


def detect_recipe_intent(text: str) -> bool:
    lower = text.lower()
    return any(re.search(pattern, lower) for pattern in RECIPE_TRIGGERS)


def detect_category_hint(text: str) -> str | None:
    lower = text.lower()
    # Longest-match first
    for keyword in sorted(CATEGORY_MAP, key=len, reverse=True):
        if keyword in lower:
            return CATEGORY_MAP[keyword]
    return None


def extract_recipe_dish(text: str) -> str:
    """Strip trigger words, return likely dish name."""
    cleaned = re.sub(
        r"\b(cook|make|prepare|bake|recipe for|how to make|i want to make|i need to cook|ingredients for|ingredient for)\b",
        "",
        text.lower(),
        flags=re.IGNORECASE,
    ).strip()
    return cleaned or text


class UnderstandRequest(BaseModel):
    query: str


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
