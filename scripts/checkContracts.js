import { access, readFile, readdir } from "node:fs/promises";

const contracts = {
  "best-in-category.md": [
    "ai-services/recommendation-service/main.py",
    "/best-in-category",
  ],
  "generate-recipe.md": [
    "backend/src/routes/cookThisRoutes.js",
    "/ai/cook-this/generate",
  ],
  "match-ingredients.md": [
    "backend/src/routes/cookThisRoutes.js",
    "/ai/cook-this/match",
  ],
  "score-review.md": [
    "ai-services/recommendation-service/main.py",
    "/score-review",
  ],
  "understand-input.md": [
    "ai-services/input-understanding-service/main.py",
    "/parse-text",
  ],
  "user-affinity.md": [
    "ai-services/recommendation-service/main.py",
    "/user-affinity",
  ],
};

const files = (await readdir("contracts"))
  .filter((file) => file.endsWith(".md"))
  .sort();
const expected = Object.keys(contracts).sort();
if (JSON.stringify(files) !== JSON.stringify(expected)) {
  throw new Error(
    `Every contract needs a conformance mapping. Found: ${files.join(", ")}`,
  );
}

for (const [contract, [sourcePath, endpoint]] of Object.entries(contracts)) {
  await access(`contracts/${contract}`);
  const [document, source] = await Promise.all([
    readFile(`contracts/${contract}`, "utf8"),
    readFile(sourcePath, "utf8"),
  ]);
  if (!document.includes(endpoint))
    throw new Error(`${contract} does not declare ${endpoint}`);
  if (!source.includes(endpoint))
    throw new Error(`${sourcePath} does not implement ${endpoint}`);
}

console.log(
  `Contract conformance OK: ${files.length} documents mapped to implementations.`,
);
