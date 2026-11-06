# Longshot CLI

Headless captures that reuse the extension's tiling, sticky-header suppression, and byte-budget logic.

Package: `@craigcossairt/longshot`. Published from the repo root so the CLI and
`extension/core/` ship in one tarball.

```
npm install -g @craigcossairt/longshot
longshot --url https://example.com --full-page --out capture.png
```

From a clone:

```
npm install
npx longshot --url https://example.com --full-page --out capture.png
```

Playwright is a runtime dependency. The default `--channel chrome` uses the Chrome already on the machine. It does not download a browser. Use `--channel chromium` only if you have installed Playwright's Chromium.

Progress goes to stderr. One JSON object goes to stdout. Exit 5 means the baseline
is missing or invalid, or the completed capture differs from it.

```
node longshot.mjs --url https://example.com --full-page --out capture.png | jq -r .path
```

## Engines

- `tiled` (default): same algorithm as the extension: scroll, hide sticky/fixed chrome from tile 2 on, stitch overlapping tiles. Slower. Applies `hideFloating()` (fixed, sticky, high-z top bars, same-origin iframes).
- `native`: Playwright `fullPage` screenshot. Faster. Pages taller than the browser's canvas limit are shot in slices and stitched. Fewer scroll-triggered layout shifts. Playwright's compositor often already paints a sticky header once; it does **not** run `hideFloating()`, so `position: fixed` overlays and high-z top bars can still repeat or linger.

Do not expect a CLI PNG to hash-equal an extension capture of the same page. The cameras differ (`captureVisibleTab` vs `page.screenshot`). Same tiling math, same hide-from-tile-2 policy.

## Sticky-header check

```
node longshot.mjs --url file://$PWD/../test/fixtures/sticky.html --full-page --out artifacts/sticky-tiled.png
node longshot.mjs --url file://$PWD/../test/fixtures/sticky.html --full-page --engine native --out artifacts/sticky-native.png
```

The tiled image should show the red header once. Native may also show it once on this simple fixture; tiled is still the extension-parity path.

## Overflow panes

Tiled captures (default `--overflow`) look for a main `overflow: auto` scroller when the document itself does not scroll. `--no-overflow` always scrolls the page, matching the extension toggle off.

```
node longshot.mjs --url file://$PWD/../test/fixtures/overflow.html --full-page --out artifacts/overflow-tiled.png
```

## Logged-in pages

`--cdp ws://127.0.0.1:9222` attaches to a Chrome started with `--remote-debugging-port=9222`. The CLI opens a temporary tab in the existing browser context and closes that tab and its CDP connection when finished. Existing tabs and the browser remain open. There is no native-messaging host in this release. Image tiles are passed into the page as `Blob`s and capture styles use an inspector stylesheet, so strict CSP pages capture without overriding that browser's CSP.

## Baseline / diff

Every capture writes `<out>.verdict.json` next to the image (dimensions, format, engine, tiles, URL, sha256, 8×8 region hashes). Compare later with `--baseline prior.verdict.json`.

Comparison is structural (size, format, engine, tiles, URL) plus region hashes. Up to 5% of blocks may differ to absorb encoder/GPU noise. Full-file sha256 is recorded but is not the pass/fail gate. A missing, unreadable, or incomplete baseline is divergence (exit 5) before a capture starts. Baselines are read before any output is written; choose a different output basename so its verdict sidecar cannot overwrite the baseline.

Exit `5` means a baseline problem or a changed page. A missing or invalid baseline
stops before capturing; a changed page still writes the new image and verdict.
Exit `1` indicates capture or export failure.

## URLs

`--url` accepts `http:`, `https:`, and `file:`. Local files are supported on
purpose so maintainers and agents can capture fixtures without a network
(`file:///…/test/fixtures/sticky.html`). The CLI does not upload captures and
does not restrict URLs to loopback.

## Privacy

The CLI is offline except for the `--url` you pass and an optional CDP connection. Captures are not uploaded.

## Byte budget

`--max-bytes` limits the final file, including a PDF wrapper. Longshot lowers quality
and then scales down when possible. If the budget cannot be met, the command exits
1 with an explicit error and does not write an oversized image or PDF.
