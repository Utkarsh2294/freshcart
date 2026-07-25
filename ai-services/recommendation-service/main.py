"""
recommendation-service  (Phase 2)

Self-hosted user-affinity scorer. No third-party AI.
Reads order history from Postgres, computes per-product
affinity scores using purchase frequency + recency weighting,
and writes them back to the product_scores table.

Endpoints
---------
POST /score          {user_id: int}  -> {scored: int}
GET  /top            ?user_id=&limit=  -> {product_ids: list[int]}
GET  /health         -> {status: "ok"}
"""

import os, math, psycopg2, psycopg2.extras
from contextlib import contextmanager
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Freshcart Recommendation Service", version="2.0.0")

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://freshcart:freshcart_pass@localhost:5433/freshcart")


@contextmanager
def get_conn():
    conn = psycopg2.connect(DATABASE_URL)
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def recency_weight(days_ago: float) -> float:
    """Exponential decay: full weight at 0 days, ~37% at 30 days."""
    return math.exp(-days_ago / 30.0)


class ScoreRequest(BaseModel):
    user_id: int


@app.post("/score")
def score_user(body: ScoreRequest):
    """
    Compute affinity scores for all products a user has ever ordered,
    then upsert into product_scores. Products not in order history keep
    their existing score (or the default 0.5 from the migration).
    """
    with get_conn() as conn:
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        # Fetch purchase history with recency
        cur.execute("""
            SELECT
                oi.product_id,
                COUNT(*)::float                           AS freq,
                EXTRACT(EPOCH FROM (NOW() - MAX(o.created_at)))/86400.0 AS days_ago
            FROM orders o
            JOIN order_items oi ON oi.order_id = o.id
            WHERE o.user_id = %s
            GROUP BY oi.product_id
        """, (body.user_id,))
        rows = cur.fetchall()

        if not rows:
            return {"scored": 0}

        max_freq = max(r["freq"] for r in rows) or 1.0
        scored = 0

        for row in rows:
            norm_freq = row["freq"] / max_freq          # 0..1
            recency   = recency_weight(row["days_ago"])  # 0..1
            score     = round(0.6 * norm_freq + 0.4 * recency, 4)
            score     = min(1.0, max(0.0, score))

            cur.execute("""
                INSERT INTO product_scores (product_id, final_score, updated_at)
                VALUES (%s, %s, NOW())
                ON CONFLICT (product_id)
                DO UPDATE SET final_score = EXCLUDED.final_score, updated_at = NOW()
            """, (row["product_id"], score))
            scored += 1

    return {"scored": scored}


@app.get("/top")
def top_products(user_id: int = Query(...), limit: int = Query(10, ge=1, le=50)):
    """
    Return the top-scoring product IDs for a user, ordered by affinity score.
    Only returns products the user has actually purchased (from product_scores).
    """
    with get_conn() as conn:
        cur = conn.cursor()
        cur.execute("""
            SELECT ps.product_id
            FROM product_scores ps
            JOIN order_items oi ON oi.product_id = ps.product_id
            JOIN orders o ON o.id = oi.order_id
            WHERE o.user_id = %s AND ps.final_score > 0
            GROUP BY ps.product_id, ps.final_score
            ORDER BY ps.final_score DESC
            LIMIT %s
        """, (user_id, limit))
        ids = [row[0] for row in cur.fetchall()]
    return {"product_ids": ids}


@app.get("/health")
def health():
    return {"status": "ok", "service": "recommendation-service"}
