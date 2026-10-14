import http from "k6/http";
import { check, sleep } from "k6";
import { Trend } from "k6/metrics";

export const options = {
  scenarios: {
    commerce: { executor: "constant-vus", vus: 50, duration: "60s" },
  },
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<750"],
  },
};

const base = __ENV.BASE_URL || "http://localhost:4000/api";
const browseLatency = new Trend("commerce_browse_latency");

export function setup() {
  const response = http.post(
    `${base}/auth/login`,
    JSON.stringify({
      email: __ENV.TEST_EMAIL || "customer@freshcart.local",
      password: __ENV.TEST_PASSWORD || "password123",
    }),
    { headers: { "Content-Type": "application/json" } },
  );
  check(response, { "login succeeds": (result) => result.status === 200 });
  return { token: response.json("accessToken") };
}

export default function ({ token }) {
  const headers = { Authorization: `Bearer ${token}` };
  const started = Date.now();
  const responses = http.batch([
    ["GET", `${base}/products?limit=24`, null, { headers }],
    ["GET", `${base}/search/suggest?q=milk`, null, { headers }],
    ["GET", `${base}/cart`, null, { headers }],
  ]);
  browseLatency.add(Date.now() - started);
  check(responses[0], {
    "catalog succeeds": (response) => response.status === 200,
  });
  check(responses[1], {
    "search succeeds": (response) => response.status === 200,
  });
  check(responses[2], {
    "cart succeeds": (response) => response.status === 200,
  });
  sleep(1);
}
