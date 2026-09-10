#!/usr/bin/env node
import { existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const ext = join(root, "extension");
const out = resolve(root, process.argv[2] || join("artifacts", "longshot-extension.zip"));

const check = spawnSync(process.execPath, [join(root, "tools", "check-manifest.mjs")], { stdio: "inherit" });
if (check.status !== 0) process.exit(check.status || 1);

function listFiles(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) listFiles(full, acc);
    else acc.push(full);
  }
  return acc;
}

const files = listFiles(ext);
mkdirSync(dirname(out), { recursive: true });

let packed = false;
if (process.platform === "win32") {
  const ps = spawnSync(
    "powershell",
    [
      "-NoProfile",
      "-Command",
      `Compress-Archive -Force -Path ${JSON.stringify(join(ext, "*"))} -DestinationPath ${JSON.stringify(out)}`,
    ],
    { stdio: "inherit" },
  );
  packed = ps.status === 0;
} else {
  const zipCmd = spawnSync("zip", ["-r", "-q", out, "."], { cwd: ext, stdio: "inherit" });
  packed = zipCmd.status === 0;
}

if (!packed || !existsSync(out)) {
  console.error(`Pack failed: ${out} was not created`);
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      path: relative(root, out).replaceAll("\\", "/"),
      files: files.length,
    },
    null,
    2,
  ),
);
