import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../src/app.js";

const db = () => globalThis.__FRESHCART_DB_AVAILABLE__;

describe("Production observability", () => {
  it("exports Prometheus metrics without authentication", async () => {
    const response = await request(app).get("/metrics").expect(200);

    expect(response.headers["content-type"]).toContain("text/plain");
    expect(response.text).toContain("freshcart_http_requests_total");
    expect(response.text).toContain("freshcart_kimi_calls_total");
    expect(response.text).toContain("freshcart_recipe_cache_hit_ratio");
  });

  it("protects detailed Cook with AI metrics", async () => {
    await request(app).get("/api/ai/cook-this/metrics").expect(401);
  });

  it.skipIf(!db())("reports database-backed health", async () => {
    const response = await request(app).get("/api/health").expect(200);
    expect(response.body).toEqual({ status: "ok" });
  });
});
