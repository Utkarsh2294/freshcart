import { performance } from "node:perf_hooks";

const requests = new Map();

function routeKey(method, path) {
  return `${method} ${path.replace(/\/\d+(?=\/|$)/g, "/:id")}`;
}

export function requestMetrics(req, res, next) {
  const startedAt = performance.now();
  res.on("finish", () => {
    const key = routeKey(req.method, req.path);
    const current = requests.get(key) || {
      count: 0,
      duration_ms: 0,
      errors: 0,
    };
    current.count += 1;
    current.duration_ms += performance.now() - startedAt;
    if (res.statusCode >= 500) current.errors += 1;
    requests.set(key, current);
  });
  next();
}

export function getRequestMetrics() {
  return [...requests.entries()].map(([route, values]) => ({
    route,
    ...values,
  }));
}
