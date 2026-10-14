import { execFileSync, spawnSync } from "node:child_process";
import { join } from "node:path";

const base = process.env.FORMAT_BASE || process.argv[2] || "HEAD~1";
const output = execFileSync(
  "git",
  ["diff", "--name-only", "--diff-filter=ACM", base, "HEAD"],
  {
    encoding: "utf8",
  },
);
const supported = /\.(?:js|jsx|json|md|ya?ml|css)$/i;
const files = output
  .split(/\r?\n/)
  .filter(
    (file) =>
      file && supported.test(file) && !file.endsWith("package-lock.json"),
  );

if (!files.length) {
  console.log("No changed Prettier-supported files.");
  process.exit(0);
}

const prettierCli = join(
  process.cwd(),
  "node_modules",
  "prettier",
  "bin",
  "prettier.cjs",
);
const result = spawnSync(process.execPath, [prettierCli, "--check", ...files], {
  stdio: "inherit",
});
process.exit(result.status ?? 1);
