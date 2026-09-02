import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdirSync, mkdtempSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { promisify } from "node:util";
import {
  APP_ENV_REL_PATH,
  mergeAppEnv,
  parseAppEnv,
  projectRoot,
  readAppEnv,
  readDotEnvLocal,
  resolveSpawnCommand,
  spawnInvocation,
} from "./with-app-env.mjs";

const execFileAsync = promisify(execFile);
const WRAPPER = join(projectRoot(), "scripts/with-app-env.mjs");
const PRINT_FLAG = "process.stdout.write(String(process.env.VITE_AUTH_ENABLED));";

function makeWorkspace(appEnvJson) {
  const root = mkdtempSync(join(tmpdir(), "app-env-"));
  if (appEnvJson !== undefined) {
    mkdirSync(join(root, ".grok"), { recursive: true });
    writeFileSync(join(root, APP_ENV_REL_PATH), appEnvJson);
  }
  return root;
}

test("keeps VITE_-prefixed string entries", () => {
  assert.deepEqual(parseAppEnv('{"VITE_AUTH_ENABLED":"false"}'), {
    VITE_AUTH_ENABLED: "false",
  });
});

test("drops non-VITE keys, non-string values and malformed documents", () => {
  assert.deepEqual(parseAppEnv('{"DATABASE_URL":"postgres://x","VITE_N":1,"VITE_OK":"y"}'), {
    VITE_OK: "y",
  });
  assert.deepEqual(parseAppEnv("not json"), {});
  assert.deepEqual(parseAppEnv('["VITE_AUTH_ENABLED"]'), {});
  assert.deepEqual(parseAppEnv("null"), {});
});

test("a missing app-env.json is a clean no-op", () => {
  assert.deepEqual(readAppEnv(makeWorkspace()), {});
});

test("reads the app env from a workspace", () => {
  const root = makeWorkspace('{"VITE_AUTH_ENABLED":"false"}');
  assert.deepEqual(readAppEnv(root), { VITE_AUTH_ENABLED: "false" });
});

test("reads .env.local secrets when present", () => {
  const root = makeWorkspace();
  writeFileSync(
    join(root, ".env.local"),
    "# comment\nXAI_API_KEY=test-key\nTMDB_API_KEY='quoted'\n",
  );
  assert.deepEqual(readDotEnvLocal(root), {
    XAI_API_KEY: "test-key",
    TMDB_API_KEY: "quoted",
  });
});

test("a missing .env.local is a clean no-op", () => {
  assert.deepEqual(readDotEnvLocal(makeWorkspace()), {});
});

test("resolveSpawnCommand leaves absolute paths alone", () => {
  assert.equal(resolveSpawnCommand(process.execPath), process.execPath);
});

test("resolveSpawnCommand prefers PATHEXT over an extensionless shim", () => {
  if (process.platform !== "win32") return;
  const dir = mkdtempSync(join(tmpdir(), "bin-"));
  writeFileSync(join(dir, "vite"), "unix shim");
  writeFileSync(join(dir, "vite.cmd"), "@echo off");
  const resolved = resolveSpawnCommand("vite", {
    PATH: dir,
    PATHEXT: ".EXE;.CMD;.BAT;.COM",
  });
  assert.equal(resolved.toLowerCase(), join(dir, "vite.cmd").toLowerCase());
});

test("spawnInvocation runs .cmd files through cmd.exe", () => {
  if (process.platform !== "win32") return;
  const dir = mkdtempSync(join(tmpdir(), "bin-"));
  const cmdPath = join(dir, "vite.cmd");
  writeFileSync(cmdPath, "@echo off");
  const invocation = spawnInvocation("vite", ["dev", "--host", "0.0.0.0"], {
    PATH: dir,
    PATHEXT: ".EXE;.CMD;.BAT;.COM",
    ComSpec: "C:\\Windows\\System32\\cmd.exe",
  });
  assert.match(invocation.command.toLowerCase(), /cmd\.exe$/);
  assert.deepEqual(invocation.args.slice(0, 3), ["/d", "/s", "/c"]);
  assert.equal(invocation.args[3].startsWith('"'), true);
  assert.equal(invocation.args[3].endsWith('"'), true);
  assert.match(invocation.args[3], /vite\.cmd/i);
  assert.match(invocation.args[3], /dev/);
  assert.equal(invocation.options.windowsVerbatimArguments, true);
});

test("spawnInvocation leaves node.exe as a direct spawn", () => {
  const invocation = spawnInvocation(process.execPath, ["-e", "0"]);
  assert.equal(invocation.command, process.execPath);
  assert.deepEqual(invocation.args, ["-e", "0"]);
});

test("an explicit process-env override wins over the file", () => {
  const merged = mergeAppEnv(
    { VITE_AUTH_ENABLED: "false" },
    { VITE_AUTH_ENABLED: "true", PATH: "/usr/bin" },
  );
  assert.equal(merged.VITE_AUTH_ENABLED, "true");
  assert.equal(merged.PATH, "/usr/bin");
});

test("the template ships auth off", () => {
  assert.deepEqual(readAppEnv(projectRoot()), { VITE_AUTH_ENABLED: "false" });
});

test("vite loadEnv resolves the wrapped value", () => {
  // What `import.meta.env.VITE_AUTH_ENABLED` becomes: loadEnv prefix-matches
  // process.env, so the wrapper's merge has to land before Vite starts.
  // Do not `import { loadEnv } from "vite"` here — Vite 8 loads rolldown
  // native bindings that SIGSEGV the test worker under qemu-user.
  const root = makeWorkspace('{"VITE_AUTH_ENABLED":"false"}');
  const merged = mergeAppEnv(readAppEnv(root), { PATH: "/usr/bin" });
  assert.equal(merged.VITE_AUTH_ENABLED, "false");
});

test("the wrapped command runs with the app env applied", async () => {
  const { stdout } = await execFileAsync(process.execPath, [
    WRAPPER,
    process.execPath,
    "-e",
    PRINT_FLAG,
  ]);
  assert.equal(stdout, "false");
});

test("the wrapped command sees an explicit override, not the file value", async () => {
  const { stdout } = await execFileAsync(
    process.execPath,
    [WRAPPER, process.execPath, "-e", PRINT_FLAG],
    { env: { ...process.env, VITE_AUTH_ENABLED: "true" } },
  );
  assert.equal(stdout, "true");
});

test("the wrapper propagates the command's exit code", async () => {
  await assert.rejects(
    execFileAsync(process.execPath, [WRAPPER, process.execPath, "-e", "process.exit(3)"]),
    (err) => err.code === 3,
  );
});

test("a signal-killed command is never reported as success", async () => {
  // The wrapper's own SIGTERM handler must not swallow the re-raised signal:
  // a cancelled build reporting exit 0 is a silently passing gate.
  await assert.rejects(
    execFileAsync(process.execPath, [
      WRAPPER,
      process.execPath,
      "-e",
      "process.kill(process.pid, 'SIGTERM');setTimeout(() => {}, 1000);",
    ]),
    (err) => err.signal === "SIGTERM" || err.code !== 0,
  );
});

test("the CLI still runs when invoked through a symlinked path", async () => {
  // node realpaths import.meta.url but not process.argv[1], so a raw comparison
  // turns the wrapper into a no-op that exits 0 without starting anything.
  const link = join(mkdtempSync(join(tmpdir(), "app-env-link-")), "scripts");
  symlinkSync(join(projectRoot(), "scripts"), link);
  const { stdout } = await execFileAsync(process.execPath, [
    join(link, "with-app-env.mjs"),
    process.execPath,
    "-e",
    PRINT_FLAG,
  ]);
  assert.equal(stdout, "false");
});
