#!/usr/bin/env node
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve, sep } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const npmCli = process.env.npm_execpath;
if (!npmCli) throw new Error("Run this check with npm run check:package");
const temp = mkdtempSync(join(tmpdir(), "longshot-package-"));
if (!resolve(temp).startsWith(resolve(tmpdir()) + sep)) throw new Error("Unexpected temporary package path");
function run(args, cwd = temp) {
  const result = spawnSync(process.execPath, args, { cwd, encoding: "utf8", timeout: 120000 });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, `${args.join(" ")}\n${result.stdout}\n${result.stderr}`);
  return result.stdout;
}
try {
  const packed = JSON.parse(run([npmCli, "pack", "--json", "--ignore-scripts", "--pack-destination", temp], root));
  const archive = join(temp, packed[0].filename);
  writeFileSync(join(temp, "package.json"), '{"private":true}');
  const lock = JSON.parse(readFileSync(join(root, "package-lock.json"), "utf8"));
  const playwrightVersion = lock.packages["node_modules/playwright"].version;
  // Use the release's tested dependency and installed browser revision rather
  // than whichever newer compatible version happens to be in the npm cache.
  run([npmCli, "install", "--prefer-offline", "--ignore-scripts", "--no-audit", "--no-fund", archive, `playwright@${playwrightVersion}`]);
  const installed = join(temp, "node_modules", "@craigcossairt", "longshot");
  const manifest = JSON.parse(readFileSync(join(installed, "package.json"), "utf8"));
  assert.ok(existsSync(join(temp, "node_modules", ".bin", process.platform === "win32" ? "longshot.cmd" : "longshot")), "npm installs the longshot command");
  const entry = join(installed, manifest.bin.longshot);
  run([entry, "--help"]);
  // Exercise the installed package, including its shipped core modules, away
  // from the source checkout and its dependencies.
  const fixture = join(temp, "fixture.html");
  writeFileSync(fixture, '<!doctype html><title>Package smoke</title><main style="height:900px;background:#345">Installed Longshot</main>');
  const output = JSON.parse(run([entry, "--url", pathToFileURL(fixture).href, "--channel", "chromium", "--full-page", "--out", join(temp, "capture.png")]));
  assert.equal(output.ok, true);
  assert.ok(output.height >= 900);
  assert.ok(output.bytes > 0);
  console.log("Published tarball installs and captures successfully.");
} finally {
  rmSync(temp, { recursive: true, force: true });
}
