#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const ext = join(root, "extension");
const manifestPath = join(ext, "manifest.json");

function referencedStrings(value, acc = []) {
  if (typeof value === "string") acc.push(value);
  else if (Array.isArray(value)) value.forEach((item) => referencedStrings(item, acc));
  else if (value && typeof value === "object") {
    Object.values(value).forEach((item) => referencedStrings(item, acc));
  }
  return acc;
}

function looksLikeFile(value) {
  return /\.(js|mjs|html|css|png|jpg|jpeg|svg|json|woff2?)$/i.test(value);
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
if (manifest.manifest_version !== 3) {
  console.error("manifest_version must be 3");
  process.exit(1);
}

const missing = [];
for (const value of referencedStrings(manifest)) {
  if (!looksLikeFile(value)) continue;
  const filePath = join(ext, value);
  if (!existsSync(filePath)) missing.push(value);
}

const background = readFileSync(join(ext, "background.js"), "utf8");
for (const match of background.matchAll(/importScripts\(([^)]+)\)/g)) {
  for (const inner of match[1].matchAll(/"([^"]+)"/g)) {
    if (!existsSync(join(ext, inner[1]))) missing.push(inner[1]);
  }
}
for (const match of background.matchAll(/import\("(\.\/[^"]+)"\)/g)) {
  const rel = match[1].replace(/^\.\//, "");
  if (!existsSync(join(ext, rel))) missing.push(match[1]);
}
if (!existsSync(join(ext, "content.js"))) missing.push("content.js");
if (!existsSync(join(ext, "core/index.js"))) missing.push("core/index.js");

if (missing.length) {
  console.error(`Missing files referenced by the extension:\n${missing.map((f) => `  ${f}`).join("\n")}`);
  process.exit(1);
}

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, acc);
    else acc.push(full);
  }
  return acc;
}

const files = walk(ext);
console.log(
  JSON.stringify(
    {
      ok: true,
      version: manifest.version,
      files: files.length,
    },
    null,
    2,
  ),
);
