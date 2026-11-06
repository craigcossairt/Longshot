import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { compositeModal } from "../../extension/core/modal.js";
import { stitch } from "../../extension/core/stitch.js";

function bufferCanvas(width, height, fill) {
  const data = new Uint8ClampedArray(width * height * 4);
  if (fill) {
    for (let i = 0; i < data.length; i += 4) {
      data[i] = fill[0];
      data[i + 1] = fill[1];
      data[i + 2] = fill[2];
      data[i + 3] = fill[3];
    }
  }
  const canvas = {
    width,
    height,
    data,
    getContext() {
      return {
        fillStyle: "#000",
        drawImage(src, dx, dy, sw, sh, dx2, dy2, dw, dh) {
          const blit = arguments.length >= 8;
          const destX = blit ? dx2 : dx;
          const destY = blit ? dy2 : dy;
          const srcX = blit ? dx : 0;
          const srcY = blit ? dy : 0;
          const copyW = blit ? dw : src.width;
          const copyH = blit ? dh : src.height;
          const fromX = blit ? srcX : 0;
          const fromY = blit ? srcY : 0;
          const srcData = src.data;
          const srcW = src.width;
          for (let y = 0; y < copyH; y++) {
            for (let x = 0; x < copyW; x++) {
              const tx = destX + x;
              const ty = destY + y;
              if (tx < 0 || ty < 0 || tx >= width || ty >= height) continue;
              const si = ((fromY + y) * srcW + (fromX + x)) * 4;
              const di = (ty * width + tx) * 4;
              data[di] = srcData[si];
              data[di + 1] = srcData[si + 1];
              data[di + 2] = srcData[si + 2];
              data[di + 3] = srcData[si + 3];
            }
          }
        },
        fillRect(x, y, w, h) {
          const m = String(this.fillStyle).match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
          const color = m
            ? [Number(m[1]), Number(m[2]), Number(m[3]), m[4] == null ? 255 : Math.round(Number(m[4]) * 255)]
            : [0, 0, 0, 255];
          for (let yy = y; yy < y + h; yy++) {
            for (let xx = x; xx < x + w; xx++) {
              if (xx < 0 || yy < 0 || xx >= width || yy >= height) continue;
              const di = (yy * width + xx) * 4;
              data[di] = color[0];
              data[di + 1] = color[1];
              data[di + 2] = color[2];
              data[di + 3] = color[3];
            }
          }
        },
        getImageData(x, y) {
          const di = (y * width + x) * 4;
          return { data: data.slice(di, di + 4) };
        },
      };
    },
  };
  return canvas;
}

function solid(w, h, color) {
  return bufferCanvas(w, h, color);
}

describe("stitch", () => {
  it("lets the earlier tile keep fixed chrome in the overlap", async () => {
    const images = {
      a: solid(2, 2, [9, 0, 0, 255]),
      b: solid(2, 2, [1, 0, 0, 255]),
    };
    const canvas = await stitch(
      [
        { x: 0, y: 0, dataUrl: "a" },
        { x: 0, y: 1, dataUrl: "b" },
      ],
      { fullW: 2, fullH: 3, dpr: 1 },
      {
        decode: async (id) => images[id],
        createCanvas: (w, h) => bufferCanvas(w, h),
      },
    );
    assert.equal(canvas.data[0], 9);
    assert.equal(canvas.data[(1 * 2) * 4], 9);
    assert.equal(canvas.data[(2 * 2) * 4], 1);
  });
});

describe("compositeModal", () => {
  it("keeps the viewport width and places the dialog column at its on-screen x", () => {
    const base = solid(10, 6, [32, 48, 64, 255]);
    const column = solid(4, 8, [210, 75, 64, 255]);
    const out = compositeModal(base, column, { x: 3, y: 1, w: 4, h: 4 }, 1, (w, h) => bufferCanvas(w, h));
    assert.equal(out.width, 10);
    assert.equal(out.height, 10);
    const right = (y) => out.data[(y * 10 + 9) * 4];
    assert.equal(right(0), 32);
    assert.equal(right(9), 32);
    assert.equal(out.data[(2 * 10 + 4) * 4], 210);
  });
});
