// PostToolUse hook: runs Prettier and ESLint on files written/edited by Claude.
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const FORMAT_EXT = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".mjs",
  ".cjs",
  ".json",
  ".css",
  ".md",
]);
const LINT_EXT = new Set([".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"]);

let input = "";
for await (const chunk of process.stdin) input += chunk;

let filePath;
try {
  filePath = JSON.parse(input)?.tool_input?.file_path;
} catch {
  process.exit(0);
}
if (!filePath) process.exit(0);

const root = path.resolve(process.env.CLAUDE_PROJECT_DIR || process.cwd());
const file = path.resolve(filePath);
const rel = path.relative(root, file);

if (rel.startsWith("..") || path.isAbsolute(rel)) process.exit(0); // outside project
if (!existsSync(file)) process.exit(0);
if (/(^|[\\/])(node_modules|\.next|out|build)[\\/]/.test(rel)) process.exit(0);

const ext = path.extname(file).toLowerCase();
if (!FORMAT_EXT.has(ext)) process.exit(0);

const run = (bin, args) =>
  spawnSync(
    process.execPath,
    [path.join(root, "node_modules", bin), ...args, file],
    { cwd: root, encoding: "utf8" },
  );

const prettier = run("prettier/bin/prettier.cjs", ["--write"]);
if (prettier.status !== 0) {
  console.error(
    `Prettier failed on ${rel}:\n${prettier.stdout}${prettier.stderr}`,
  );
  process.exit(2);
}

if (LINT_EXT.has(ext)) {
  const eslint = run("eslint/bin/eslint.js", ["--fix"]);
  if (eslint.status !== 0) {
    console.error(`ESLint errors in ${rel}:\n${eslint.stdout}${eslint.stderr}`);
    process.exit(2);
  }
}
