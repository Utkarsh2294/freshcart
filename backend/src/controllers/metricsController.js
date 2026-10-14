import { getCookThisMetrics } from "./cookThisController.js";
import { getRequestMetrics } from "../middleware/requestMetrics.js";

function label(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export function getPrometheusMetrics(req, res) {
  const lines = [
    "# HELP freshcart_http_requests_total Completed HTTP requests.",
    "# TYPE freshcart_http_requests_total counter",
  ];
  for (const metric of getRequestMetrics()) {
    const route = label(metric.route);
    lines.push(
      `freshcart_http_requests_total{route="${route}"} ${metric.count}`,
    );
    lines.push(
      `freshcart_http_request_duration_ms_sum{route="${route}"} ${metric.duration_ms.toFixed(3)}`,
    );
    lines.push(
      `freshcart_http_errors_total{route="${route}"} ${metric.errors}`,
    );
  }

  const { groq, recipe_cache: cache } = getCookThisMetrics();
  lines.push(`freshcart_groq_calls_total ${groq.calls}`);
  lines.push(`freshcart_groq_failures_total ${groq.failures}`);
  lines.push(`freshcart_groq_reported_cost_total ${groq.reported_cost}`);
  lines.push(`freshcart_recipe_cache_hits_total ${cache.hits}`);
  lines.push(`freshcart_recipe_cache_misses_total ${cache.misses}`);
  lines.push(`freshcart_recipe_cache_hit_ratio ${cache.hit_rate}`);

  res.type("text/plain; version=0.0.4").send(`${lines.join("\n")}\n`);
}
