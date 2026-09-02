#!/usr/bin/env node
/**
 * Run a command with `.grok/app-env.json` merged into its environment.
 *
 * `dev`, `build` and `preview` all route through this wrapper, so the dev
 * server, the built bundle and the preview server can never disagree about
 * `VITE_AUTH_ENABLED` — a divergence that only shows up as a built-output
 * mismatch long after the fact. Anything that starts Vite directly bypasses it.
 *
 * Only `VITE_`-prefixed keys are honored: the file is a build flag carrier, not
 * a secret store, and only `VITE_` vars reach the browser anyway. A real
 * `process.env` entry always wins, so an explicit override still works.
 *
 * That precedence also means the file governs this workspace only. A deployed
 * build runs with the provider's project env, where the deployer sets
 * `VITE_AUTH_ENABLED` itself (today unconditionally `"true"`), so the deployed
 * flag is the platform's, not this file's.
 *
 * Vite picks the values up because `loadEnv` prefix-matches entries already in
 * `process.env`, which is why the merge has to happen before Vite starts.
 */
import { spawn } from "node:child_process";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { constants as osConstants } from "node:os";
import { delimiter, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const APP_ENV_REL_PATH = ".grok/app-env.json";

const VITE_PREFIX = "VITE_";

/**
 * Parse an app-env document, keeping only `VITE_`-prefixed string entries.
 * Anything unparseable is an empty environment — a workspace without the file
 * must behave exactly like today (auth on, no overrides).
 */
export function parseAppEnv(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return {};
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) return {};
  const env = {};
  for (const [key, value] of Object.entries(parsed)) {
    if (!key.startsWith(VITE_PREFIX)) continue;
    if (typeof value !== "string") continue;
    env[key] = value;
  }
  return env;
}

/** The app env recorded under `root`, or `{}` when the file is absent. */
export function readAppEnv(root) {
  try {
    return parseAppEnv(readFileSync(join(root, APP_ENV_REL_PATH), "utf8"));
  } catch {
    return {};
  }
}

/**
 * Optional local secrets (`.env.local`). Absent in the grok.com sandbox; used
 * on a developer machine for `XAI_API_KEY` and similar. Never commit the file.
 */
export function readDotEnvLocal(root) {
  try {
    const text = readFileSync(join(root, ".env.local"), "utf8");
    const env = {};
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1);
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      env[key] = value;
    }
    return env;
  } catch {
    return {};
  }
}

/** File values under the process environment: an explicit override wins. */
export function mergeAppEnv(appEnv, processEnv) {
  return { ...appEnv, ...processEnv };
}

/**
 * Resolve a PATH command for `spawn()` on Windows.
 *
 * `npm run` puts `node_modules/.bin` on PATH, but `spawn("vite")` does not
 * honor PATHEXT, so `vite.cmd` is invisible. Do not use `shell: true` — that
 * splits `C:\Program Files\nodejs\node.exe` on spaces.
 */
export function resolveSpawnCommand(command, env = process.env) {
  if (process.platform !== "win32") return command;
  if (/[/\\:]/.test(command)) return command;
  const pathEnv = env.PATH || env.Path || "";
  const exts = (env.PATHEXT || ".EXE;.CMD;.BAT;.COM").split(";").filter(Boolean);
  for (const dir of pathEnv.split(delimiter)) {
    if (!dir) continue;
    // PATHEXT first: `node_modules/.bin/vite` is a Unix shim that exists() on
    // Windows but is not spawnable. Prefer `vite.cmd`.
    for (const ext of exts) {
      const candidate = join(dir, command + ext);
      if (existsSync(candidate)) return candidate;
    }
    const exact = join(dir, command);
    if (existsSync(exact)) return exact;
  }
  return command;
}

function windowsQuote(value) {
  const s = String(value);
  if (!/[\s"&<>|^()]/.test(s)) return s;
  return `"${s.replace(/"/g, '""')}"`;
}

/**
 * Node 20+ refuses to spawn `.cmd` / `.bat` without a shell (EINVAL /
 * CVE-2024-27980). Route those through `cmd.exe` with verbatim arguments so
 * paths like `C:\Users\Craig Cossairt\...` stay one token. Direct `.exe`
 * (including `node.exe`) is still spawned as-is — `shell: true` would split
 * `C:\Program Files\nodejs\node.exe`.
 */
export function spawnInvocation(command, args, env = process.env) {
  const resolved = resolveSpawnCommand(command, env);
  if (process.platform === "win32" && /\.(cmd|bat)$/i.test(resolved)) {
    const comspec = env.ComSpec || env.COMSPEC || "cmd.exe";
    const line = [resolved, ...args].map(windowsQuote).join(" ");
    // `/s` strips the first and last quote, so wrap the whole line once more
    // or a path like `C:\Users\Craig Cossairt\...` becomes `C:\Users\Craig`.
    return {
      command: comspec,
      args: ["/d", "/s", "/c", `"${line}"`],
      options: { windowsVerbatimArguments: true },
    };
  }
  return { command: resolved, args, options: {} };
}

/**
 * Translate a child's `exit` `(code, signal)` into this process's exit status.
 *
 * Do not re-raise the signal with `process.kill(process.pid, signal)`: under
 * qemu-user (amd64 image builds on an arm host) a self-directed signal is
 * routinely delivered as SIGSEGV to the wrong process, which takes down the
 * test worker and fails the image build. `128 + signo` is what a shell reports
 * for a signal-killed command, so a cancelled `vite build` is still a failure.
 */
export function exitStatusFromChild(code, signal) {
  if (signal) {
    const signo = osConstants.signals[signal];
    return 128 + (typeof signo === "number" ? signo : 1);
  }
  return code ?? 1;
}

/** The workspace root (this file lives in `<root>/scripts/`). */
export function projectRoot() {
  return dirname(dirname(fileURLToPath(import.meta.url)));
}

/**
 * Whether `moduleUrl` is the script node was asked to run.
 *
 * Both sides are resolved through symlinks: node realpaths `import.meta.url`
 * but leaves `process.argv[1]` as typed, so comparing them raw makes a CLI
 * launched through a symlinked path (`/tmp` on macOS) a silent no-op.
 */
export function isMainModule(moduleUrl) {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return realpathSync(entry) === fileURLToPath(moduleUrl);
  } catch {
    return false;
  }
}

function main(argv) {
  const [command, ...args] = argv;
  if (!command) {
    console.error("usage: node scripts/with-app-env.mjs <command> [args…]");
    process.exit(2);
  }
  const root = projectRoot();
  const env = mergeAppEnv(
    { ...readAppEnv(root), ...readDotEnvLocal(root) },
    process.env,
  );
  const invocation = spawnInvocation(command, args, env);
  const child = spawn(invocation.command, invocation.args, {
    stdio: "inherit",
    env,
    ...invocation.options,
  });
  // The dev server is long-running and is stopped by signalling this wrapper.
  for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"]) {
    process.on(signal, () => child.kill(signal));
  }
  child.on("error", (err) => {
    console.error(`[with-app-env] failed to run ${command}:`, err?.message || err);
    process.exit(127);
  });
  child.on("exit", (code, signal) => {
    process.exit(exitStatusFromChild(code, signal));
  });
}

if (isMainModule(import.meta.url)) {
  main(process.argv.slice(2));
}
