import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { filename, slugify, uniquePath } from "../../extension/core/filename.js";

const createdAt = new Date(2026, 2, 15, 14, 30).getTime();

function record(extra = {}) {
  return {
    title: "Hello World",
    url: "https://example.com/path",
    width: 1200,
    height: 800,
    format: "png",
    createdAt,
    ...extra,
  };
}

describe("slugify", () => {
  it("strips unsafe characters and trims dashes", () => {
    assert.equal(slugify("Hello, World!"), "hello-world");
    assert.equal(slugify(""), "capture");
    assert.equal(slugify("***"), "");
  });
});

describe("filename", () => {
  it("fills {title}-{date} by default", () => {
    const name = filename(record(), { filenameTemplate: "{title}-{date}", downloadDirectory: "Longshot" });
    assert.equal(name, "Longshot/hello-world-2026-03-15.png");
  });

  it("fills datetime, url, width, height tokens", () => {
    const name = filename(record(), {
      filenameTemplate: "{url}-{datetime}-{width}x{height}",
      downloadDirectory: "shots",
    });
    assert.equal(name, "shots/example-com-path-2026-03-15-1430-1200x800.png");
  });

  it("uses jpg for jpeg and sanitizes the folder", () => {
    const name = filename(record({ format: "jpeg" }), {
      filenameTemplate: "{title}",
      downloadDirectory: "C:\\foo\\..\\bar",
    });
    assert.equal(name, "foo/bar/hello-world.jpg");
  });
});

describe("uniquePath", () => {
  it("returns the path when it is free", () => {
    assert.equal(uniquePath("a.png", () => false), "a.png");
  });

  it("appends (n) before the extension when the path exists", () => {
    const taken = new Set(["shot.png", "shot (1).png"]);
    assert.equal(
      uniquePath("shot.png", (p) => taken.has(p)),
      "shot (2).png",
    );
  });
});
