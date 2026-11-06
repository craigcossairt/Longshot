import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { execFile } from "node:child_process";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after, describe, it } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { EXIT } from "../../cli/args.mjs";
import { capture } from "../../cli/playwright-adapter.mjs";
import { chromium } from "playwright";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const fixture = pathToFileURL(join(root, "test/fixtures/csp-bloom.html")).href;
const channel = process.env.LONGSHOT_CHANNEL || "chrome";
const tmp = mkdtempSync(join(tmpdir(), "longshot-cdp-csp-"));

after(() => rmSync(tmp, { recursive: true, force: true }));

describe("CDP + Bloom-shaped CSP", { timeout: 120000 }, () => {
  it("captures over --cdp without bypassCSP", async () => {
    const port = 9300 + Math.floor(Math.random() * 500);
    const launchOpts = {
      headless: true,
      args: [`--remote-debugging-port=${port}`],
    };
    if (channel !== "chromium") launchOpts.channel = channel;
    let browser;
    try {
      browser = await chromium.launch(launchOpts);
    } catch (error) {
      throw new Error(`browser could not launch (${channel}): ${error.message}`);
    }
    try {
      const result = await capture({
        url: fixture,
        fullPage: true,
        engine: "tiled",
        overflow: false,
        device: "desktop",
        width: 800,
        height: 600,
        scale: 1,
        format: "png",
        maxBytes: 0,
        out: join(tmp, "cdp-csp.png"),
        channel,
        headed: false,
        selector: null,
        region: null,
        wait: 200,
        cdp: `http://127.0.0.1:${port}`,
        viewport: { width: 800, height: 600, scale: 1 },
      });
      assert.ok(result.bytes > 0);
      assert.ok(result.width >= 800);
    } catch (error) {
      if (error?.code === EXIT.BROWSER) {
        throw new Error(`cdp connect failed: ${error.message}`);
      }
      throw error;
    } finally {
      await browser.close();
    }
  });
});


it("CDP subprocess exits, preserves existing tabs, and captures strict CSP without bypass", { timeout: 120000 }, async () => {
  const listener = createServer();
  await new Promise((resolve) => listener.listen(0, "127.0.0.1", resolve));
  const port = listener.address().port;
  await new Promise((resolve) => listener.close(resolve));
  const launch = { headless: true, args: [`--remote-debugging-port=${port}`] };
  if (channel !== "chromium") launch.channel = channel;
  const browser = await chromium.launch(launch);
  try {
    const existing = await browser.newPage();
    await existing.setContent('<input value="unsaved work">');
    const before = existing.url();
    const strictFixture = pathToFileURL(join(root, "test/fixtures/csp.html")).href;
    const result = await new Promise((resolve, reject) => {
      execFile(process.execPath, [join(root, "longshot.js"), "--url", strictFixture,
        "--cdp", `http://127.0.0.1:${port}`, "--full-page", "--out", join(tmp, "strict-cdp.png")],
      { timeout: 45000 }, (error, stdout, stderr) => {
        if (error) return reject(new Error(`CLI failed or did not exit: ${error.message} ${stderr}`));
        try { resolve(JSON.parse(stdout)); } catch (error) { reject(error); }
      });
    });
    assert.equal(result.ok, true);
    assert.equal(browser.isConnected(), true, "external browser remains running");
    assert.equal(existing.url(), before);
    assert.equal(await existing.locator("input").inputValue(), "unsaved work");
    const pages = browser.contexts().flatMap((context) => context.pages());
    assert.equal(pages.some((page) => page.url() === strictFixture), false, "capture tab was closed");
  } finally {
    await browser.close();
  }
});
