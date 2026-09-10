#!/usr/bin/env node
import { EXIT, helpText, parseArgs } from "./args.mjs";

function emit(payload) {
  process.stdout.write(`${JSON.stringify(payload)}\n`);
}

function fail(code, error) {
  emit({ ok: false, error, code });
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
  });
} catch (error) {
  const message = String(error?.message || error);
  let code = [EXIT.CAPTURE, EXIT.ARGS, EXIT.TARGET, EXIT.BROWSER].includes(error?.code)
    ? error.code
    : EXIT.CAPTURE;
  if (/Cannot find package 'playwright'|browserType\.launch|connectOverCDP/i.test(message)) {
    code = EXIT.BROWSER;
  }
  fail(code, message);
}
