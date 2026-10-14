"""Self-hosted Phase 2 recommendation and review-scoring service."""

import os
from contextlib import contextmanager

import psycopg
from psycopg.rows import dict_row
from dotenv import load_dotenv
from fastapi import FastAPI, Query
from pydantic import BaseModel, Field

from models.scoring import affinity_score, sentiment_score

load_dotenv()

app = FastAPI(title="Freshcart Recommendation Service", version="4.0.0")
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://freshcart:freshcart_pass@localhost:5433/freshcart",
)


@contextmanager
def get_conn():
    conn = psycopg.connect(DATABASE_URL)
    try:
        yield conn
    finally:
        conn.close()


class ScoreRequest(BaseModel):
    user_id: int = Field(gt=0)


class ReviewRequest(BaseModel):
    review_text: str = Field(min_length=1, max_length=5000)
    rating: int | None = Field(default=None, ge=1, le=5)


def affinity_rows(user_id: int, limit: int):
    with get_conn() as conn:
        cur = conn.cursor(row_factory=dict_row)
        cur.execute(
            """
            SELECT oi.product_id,
                   COUNT(*)::float AS frequency,
                   EXTRACT(EPOCH FROM (NOW() - MAX(o.created_at))) / 86400.0 AS days_ago
            FROM orders o
            JOIN order_items oi ON oi.order_id = o.id
            WHERE o.user_id = %s
            GROUP BY oi.product_id
            """,
            (user_id,),
        )
        rows = cur.fetchall()

    max_frequency = max((row["frequency"] for row in rows), default=1.0)
    scored = [
        {
            "product_id": row["product_id"],
            "score": affinity_score(row["frequency"], max_frequency, row["days_ago"]),
        }
        for row in rows
    ]
    return sorted(scored, key=lambda item: item["score"], reverse=True)[:limit]


@app.post("/score-review")
def score_review(body: ReviewRequest):
    return {"sentiment_score": sentiment_score(body.review_text, body.rating)}


@app.get("/best-in-category")
def best_in_category(category_id: int = Query(..., gt=0), limit: int = Query(4, ge=1, le=50)):
    with get_conn() as conn:
        cur = conn.cursor(row_factory=dict_row)
        cur.execute(
            """
            SELECT p.id AS product_id, p.name, p.price::float, p.unit, p.image_url,
                   b.name AS brand, COALESCE(ps.final_score, 0.55)::float AS final_score
            FROM products p
            LEFT JOIN brands b ON b.id = p.brand_id
            LEFT JOIN product_scores ps ON ps.product_id = p.id
            WHERE p.category_id = %s AND p.stock_qty > 0
            ORDER BY COALESCE(ps.final_score, 0.55) DESC, p.stock_qty DESC, p.name
            LIMIT %s
            """,
            (category_id, limit),
        )
        return {"products": cur.fetchall()}


@app.get("/user-affinity")
def user_affinity(user_id: int = Query(..., gt=0), limit: int = Query(10, ge=1, le=50)):
    return {"products": affinity_rows(user_id, limit)}


# Backward-compatible aliases used by the existing Node client.
@app.post("/score")
def score_user(body: ScoreRequest):
    return {"scored": len(affinity_rows(body.user_id, 50))}


@app.get("/top")
def top_products(user_id: int = Query(..., gt=0), limit: int = Query(10, ge=1, le=50)):
    return {"product_ids": [item["product_id"] for item in affinity_rows(user_id, limit)]}


@app.get("/health")
def health():
    return {"status": "ok", "service": "recommendation-service"}
