import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";

process.env.NODE_ENV = "production";
const { default: app } = await import("../backend/src/app.js");
const { pool } = await import("../backend/src/config/database.js");
const server = app.listen(0, "127.0.0.1");
await new Promise((resolve) => server.once("listening", resolve));
const origin = `http://127.0.0.1:${server.address().port}`;

try {
  for (const path of ["/", "/search", "/cook-this", "/orders/1"]) {
    const response = await fetch(`${origin}${path}`);
    assert.equal(response.status, 200, `SPA route ${path}`);
    assert.match(response.headers.get("cache-control"), /no-cache/);
    assert.match(await response.text(), /<title>Freshcart<\/title>/);
  }
  for (const path of ["/sw.js", "/registerSW.js", "/manifest.webmanifest"]) {
    const response = await fetch(`${origin}${path}`);
    assert.equal(response.status, 200, path);
    assert.equal(response.headers.get("cache-control"), "no-cache", path);
  }
  const files = await readdir(
    new URL("../frontend/dist/assets/", import.meta.url),
  );
  const script = files.find(
    (file) => file.startsWith("index-") && file.endsWith(".js"),
  );
  assert(script, "Hashed entry script exists");
  const asset = await fetch(`${origin}/assets/${script}`);
  assert.match(asset.headers.get("cache-control"), /immutable/);
  assert.match(
    asset.headers.get("content-security-policy"),
    /img-src 'self' data: https:/,
  );
  for (const file of files.filter((file) => file.endsWith(".js"))) {
    const source = await readFile(
      new URL(`../frontend/dist/assets/${file}`, import.meta.url),
      "utf8",
    );
    assert(
      !source.includes("UI stress fixtures"),
      "Developer fixtures excluded",
    );
    assert(
      !source.includes("GROQ_API_KEY"),
      "No Groq secret variable in browser bundle",
    );
  }
  const admin = await fetch(`${origin}/api/admin/products`);
  assert.equal(admin.status, 401, "Admin API requires a session");
  console.log(
    "Production serving OK: SPA routes, PWA revalidation, immutable assets, CSP, admin authentication, and excluded developer fixtures/secrets.",
  );
} finally {
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
  await pool.end();
}
