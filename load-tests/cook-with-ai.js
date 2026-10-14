import http from "k6/http";
import { check, sleep } from "k6";
import { Trend } from "k6/metrics";

export const options = {
  scenarios: {
    cooking: { executor: "constant-vus", vus: 10, duration: "60s" },
  },
  thresholds: {
    http_req_failed: ["rate<0.05"],
    kimi_latency: ["p(95)<15000"],
    matching_latency: ["p(95)<1500"],
  },
};

const base = __ENV.BASE_URL || "http://localhost:4000/api";
const kimiLatency = new Trend("kimi_latency");
const matchingLatency = new Trend("matching_latency");

export function setup() {
  const response = http.post(
    `${base}/auth/login`,
    JSON.stringify({
      email: __ENV.TEST_EMAIL || "customer@freshcart.local",
      password: __ENV.TEST_PASSWORD || "password123",
    }),
    { headers: { "Content-Type": "application/json" } },
  );
  return { token: response.json("accessToken") };
}

export default function ({ token }) {
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  const dishes = ["dal tadka", "poha", "lemon rice", "chole", "veg pulao"];
  const dish = dishes[(__VU + __ITER) % dishes.length];

  const generated = http.post(
    `${base}/ai/cook-this/generate`,
    JSON.stringify({ dish_name: dish, servings: 4 }),
    { headers },
  );
  kimiLatency.add(generated.timings.duration);
  check(generated, {
    "recipe generated or cached": (response) => response.status === 200,
  });
  if (generated.status !== 200) return;

  const matched = http.post(
    `${base}/ai/cook-this/match`,
    JSON.stringify({
      ingredients: generated.json("ingredients"),
      servings: 4,
    }),
    { headers },
  );
  matchingLatency.add(matched.timings.duration);
  check(matched, {
    "ingredients matched": (response) => response.status === 200,
  });
  sleep(1);
}
