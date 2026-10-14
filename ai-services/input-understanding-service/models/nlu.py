import re

RECIPE_TRIGGERS = [
    r"\b(cook|make|prepare|bake|recipe for|how to make|i want to make|i need to cook)\b",
    r"\b(ingredients for|ingredient for)\b",
    r"\b(for dinner|for lunch|for breakfast|tonight|tonight's meal)\b",
]

CATEGORY_MAP = {
    "fruits": "Fruits & Vegetables", "vegetable": "Fruits & Vegetables",
    "vegetables": "Fruits & Vegetables", "veggies": "Fruits & Vegetables",
    "dairy": "Dairy & Eggs", "milk": "Dairy & Eggs", "cheese": "Dairy & Eggs",
    "eggs": "Dairy & Eggs", "snack": "Snacks & Branded Foods",
    "snacks": "Snacks & Branded Foods", "chips": "Snacks & Branded Foods",
    "biscuit": "Snacks & Branded Foods", "biscuits": "Snacks & Branded Foods",
    "beverage": "Beverages", "beverages": "Beverages", "drink": "Beverages",
    "juice": "Beverages", "cold drink": "Beverages", "staple": "Staples",
    "staples": "Staples", "rice": "Staples", "flour": "Staples", "atta": "Staples",
    "personal care": "Personal Care", "shampoo": "Personal Care", "soap": "Personal Care",
    "home care": "Home Care", "cleaning": "Home Care", "detergent": "Home Care",
}

SERVING_WORDS = {
    "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
    "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
}


def detect_recipe_intent(text: str) -> bool:
    return any(re.search(pattern, text.lower()) for pattern in RECIPE_TRIGGERS)


def detect_category_hint(text: str) -> str | None:
    lower = text.lower()
    return next((CATEGORY_MAP[key] for key in sorted(CATEGORY_MAP, key=len, reverse=True) if key in lower), None)


def extract_recipe_dish(text: str) -> str:
    cleaned = re.sub(
        r"\b(cook|make|prepare|bake|recipe for|how to make|i want to make|i need to cook|ingredients for|ingredient for)\b",
        "", text.lower(), flags=re.IGNORECASE,
    ).strip()
    cleaned = re.sub(
        r"\b(?:for\s+)?(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s*(?:people|persons?|servings?|logon?)(?:\s+ke\s+liye)?\b",
        "", cleaned, flags=re.IGNORECASE,
    )
    return re.sub(r"\s+", " ", cleaned).strip(" ,.-") or text


def extract_servings(text: str) -> int | None:
    match = re.search(
        r"\b(?:for\s+)?(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s*(?:people|persons?|servings?|logon?)(?:\s+ke\s+liye)?\b",
        text, flags=re.IGNORECASE,
    )
    if not match:
        return None
    value = match.group(1).lower()
    servings = int(value) if value.isdigit() else SERVING_WORDS[value]
    return servings if 1 <= servings <= 50 else None
