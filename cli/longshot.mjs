#!/usr/bin/env node
import { writeFileSync } from "node:fs";
import { EXIT, helpText, parseArgs } from "./args.mjs";
import { buildVerdict, compareVerdict, readBaselineFile, verdictPath } from "./verdict.mjs";

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
  // Read once before capture can write either the image or its sidecar.
  const previous = parsed.options.baseline ? readBaselineFile(parsed.options.baseline) : null;
  if (previous?.error) fail(EXIT.DIFF, previous.error, { reasons: [previous.error] });
  const { capture } = await import("./playwright-adapter.mjs");
  const result = await capture(parsed.options);
  const verdict = buildVerdict(result);
  const verdictFile = verdictPath(result.path);
  writeFileSync(verdictFile, `${JSON.stringify(verdict, null, 2)}\n`);
  if (parsed.options.baseline) {
    const cmp = compareVerdict(verdict, previous.baseline);
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
