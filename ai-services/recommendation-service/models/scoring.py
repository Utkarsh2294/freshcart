import math

POSITIVE_WORDS = {
    "amazing", "best", "excellent", "fresh", "good", "great", "love",
    "nice", "perfect", "quality", "tasty",
}
NEGATIVE_WORDS = {
    "awful", "bad", "broken", "expired", "poor", "rotten", "stale",
    "terrible", "waste", "worst",
}


def recency_weight(days_ago: float) -> float:
    return math.exp(-max(days_ago, 0) / 30.0)


def affinity_score(frequency: float, max_frequency: float, days_ago: float) -> float:
    normalized_frequency = frequency / max(max_frequency, 1.0)
    return round(min(1.0, max(0.0, 0.6 * normalized_frequency + 0.4 * recency_weight(days_ago))), 4)


def sentiment_score(text: str, rating: int | None = None) -> float:
    words = {word.strip(".,!?;:'\"()[]{}").lower() for word in text.split()}
    lexical = (len(words & POSITIVE_WORDS) - len(words & NEGATIVE_WORDS)) / 3
    rating_signal = 0 if rating is None else (rating - 3) / 2
    signals = [lexical] if rating is None else [lexical, rating_signal]
    return round(min(1.0, max(-1.0, sum(signals) / len(signals))), 4)
