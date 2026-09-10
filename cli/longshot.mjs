#!/usr/bin/env node
import { writeFileSync } from "node:fs";
import { EXIT, helpText, parseArgs } from "./args.mjs";
import { buildVerdict, compareToBaselineFile, verdictPath } from "./verdict.mjs";

function emit(payload) {
  process.stdout.write(`${JSON.stringify(payload)}\n`);
}

function fail(code, error, extra = {}) {
  emit({ ok: false, error, code, ...extra });
  process.exit(code);
}

const parsed = parseArgs(process.argv.slice(2));
if (!parsed.ok) fail(parsed.code, parsed.error);
if (parsed.options.help) {
  process.stderr.write(helpText());
  process.exit(EXIT.OK);
}

const started = Date.now();
try {
  const { capture } = await import("./playwright-adapter.mjs");
  const result = await capture(parsed.options);
  const verdict = buildVerdict(result);
  const verdictFile = verdictPath(result.path);
  writeFileSync(verdictFile, `${JSON.stringify(verdict, null, 2)}\n`);
  if (parsed.options.baseline) {
    const cmp = compareToBaselineFile(verdict, parsed.options.baseline);
    if (cmp.divergesFromBaseline) {
      fail(EXIT.DIFF, "differs from baseline", {
        reasons: cmp.reasons,
        path: result.path,
        verdict: verdictFile,
      });
    }
  }
  emit({
    ok: true,
    path: result.path,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
    engine: result.engine,
    tiles: result.tiles,
    elapsedMs: Date.now() - started,
    verdict: verdictFile,
  });
} catch (error) {
  const message = String(error?.message || error);
  let code = EXIT.CAPTURE;
  if ([EXIT.CAPTURE, EXIT.ARGS, EXIT.TARGET, EXIT.BROWSER, EXIT.DIFF].includes(error?.code)) {
    code = error.code;
  } else if (/Cannot find package ['"]playwright['"]/.test(message)) {
    code = EXIT.BROWSER;
  }
  fail(code, message);
}
