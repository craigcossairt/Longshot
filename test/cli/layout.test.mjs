import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { inflateSync } from "node:zlib";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after, describe, it } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { capture } from "../../cli/playwright-adapter.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const channel = process.env.LONGSHOT_CHANNEL || "chrome";
const tmp = mkdtempSync(join(tmpdir(), "longshot-layout-"));

after(() => rmSync(tmp, { recursive: true, force: true }));

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

function decodePng(buf) {
  let offset = 8;
  let width = 0;
  let height = 0;
  const idats = [];
  while (offset < buf.length) {
    const length = buf.readUInt32BE(offset);
    const type = buf.toString("ascii", offset + 4, offset + 8);
    const data = buf.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
    } else if (type === "IDAT") idats.push(data);
    else if (type === "IEND") break;
    offset += 12 + length;
  }
  const raw = inflateSync(Buffer.concat(idats));
  const stride = width * 4;
  const out = Buffer.alloc(height * stride);
  let src = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[src++];
    const row = out.subarray(y * stride, (y + 1) * stride);
    const prev = y === 0 ? Buffer.alloc(stride) : out.subarray((y - 1) * stride, y * stride);
    for (let i = 0; i < stride; i++) {
      const value = raw[src++];
      const left = i >= 4 ? row[i - 4] : 0;
      const up = prev[i];
      const upLeft = i >= 4 ? prev[i - 4] : 0;
      if (filter === 0) row[i] = value;
      else if (filter === 1) row[i] = (value + left) & 255;
      else if (filter === 2) row[i] = (value + up) & 255;
      else if (filter === 3) row[i] = (value + ((left + up) >> 1)) & 255;
      else row[i] = (value + paeth(left, up, upLeft)) & 255;
    }
  }
  return { width, height, data: out };
}

function pixel(png, x, y) {
  const i = (y * png.width + x) * 4;
  return [png.data[i], png.data[i + 1], png.data[i + 2], png.data[i + 3]];
}

function near(actual, expected, slack = 16) {
  return actual.every((channel, i) => Math.abs(channel - expected[i]) <= slack);
}

function opts(url, out, width, height) {
  return {
    url,
    fullPage: true,
    engine: "tiled",
    overflow: true,
    device: "desktop",
    width,
    height,
    scale: 1,
    format: "png",
    maxBytes: 0,
    out,
    channel,
    headed: false,
    selector: null,
    region: null,
    wait: 200,
    cdp: null,
    viewport: { width, height, scale: 1 },
  };
}

describe("full-page layout", { timeout: 180000 }, () => {
  it("keeps a fixed side nav through the whole capture", async () => {
    const url = pathToFileURL(join(root, "test/fixtures/sidebar.html")).href;
    const result = await capture(opts(url, join(tmp, "sidebar.png"), 800, 600));
    const png = decodePng(readFileSync(result.path));
    assert.ok(png.height > 1000, `expected a tall page, got ${png.height}`);
    assert.ok(near(pixel(png, 20, 30), [196, 85, 74, 255]), `top of nav ${pixel(png, 20, 30)}`);
    assert.ok(
      near(pixel(png, 20, png.height - 30), [196, 85, 74, 255]),
      `bottom of nav ${pixel(png, 20, png.height - 30)}`,
    );
    assert.ok(
      near(pixel(png, 400, png.height - 30), [61, 110, 168, 255]),
      `page end ${pixel(png, 400, png.height - 30)}`,
    );
  });

  it("captures a scrolling modal without a transparent hole", async () => {
    const url = pathToFileURL(join(root, "test/fixtures/modal.html")).href;
    const result = await capture(opts(url, join(tmp, "modal.png"), 900, 700));
    const png = decodePng(readFileSync(result.path));
    assert.equal(png.width, 900);
    assert.ok(png.height > 700, `modal content should extend the shot, got ${png.height}`);
    const edge = pixel(png, png.width - 8, 40);
    assert.equal(edge[3], 255, `right edge is transparent ${edge}`);
    assert.ok(near(edge, [32, 48, 64, 255]), `right edge ${edge}`);
    let sawFirst = false;
    let sawLast = false;
    const x = Math.round(png.width / 2);
    for (let y = 0; y < png.height; y += 4) {
      const sample = pixel(png, x, y);
      if (near(sample, [210, 75, 64, 255])) sawFirst = true;
      if (sawFirst && near(sample, [47, 111, 79, 255])) sawLast = true;
    }
    assert.equal(sawFirst, true, "dialog start row missing");
    assert.equal(sawLast, true, "dialog end row missing");
  });

  it("keeps a sticky modal footer once, at the bottom of the dialog", async () => {
    const url = pathToFileURL(join(root, "test/fixtures/modal-footer.html")).href;
    const result = await capture(opts(url, join(tmp, "modal-footer.png"), 900, 700));
    const png = decodePng(readFileSync(result.path));
    const x = Math.round(png.width / 2);
    const gold = [220, 170, 30, 255];
    const blue = [20, 30, 140, 255];
    let goldY = -1;
    let bands = 0;
    let inBand = false;
    let blueY = -1;
    for (let y = 0; y < png.height; y++) {
      const sample = pixel(png, x, y);
      if (goldY < 0 && near(sample, gold)) goldY = y;
      const hit = near(sample, blue);
      if (hit) {
        if (!inBand) bands += 1;
        inBand = true;
        blueY = y;
      } else inBand = false;
    }
    assert.ok(goldY >= 0, "content under the sticky footer was not captured");
    assert.equal(bands, 1, `sticky footer should appear once, saw ${bands} bands`);
    assert.ok(blueY > goldY, `footer at ${blueY} should sit below the revealed content at ${goldY}`);
  });
});