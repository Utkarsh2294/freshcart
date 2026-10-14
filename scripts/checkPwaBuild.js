import { readFile } from "node:fs/promises";

const [serviceWorker, manifest] = await Promise.all([
  readFile("frontend/dist/sw.js", "utf8"),
  readFile("frontend/dist/manifest.webmanifest", "utf8").then(JSON.parse),
]);

if (!/assets\/index-[A-Za-z0-9_-]+\.(?:js|css)/.test(serviceWorker)) {
  throw new Error(
    "Service worker does not contain cache-busted hashed assets.",
  );
}
if (!serviceWorker.includes("revision")) {
  throw new Error("Service worker precache entries have no revision metadata.");
}
for (const size of ["192x192", "512x512"]) {
  if (!manifest.icons?.some((icon) => icon.sizes === size))
    throw new Error(`PWA icon ${size} is missing.`);
}

console.log(
  "PWA build OK: hashed assets and revisioned precache entries are present.",
);
