# Longshot CLI

Headless captures that reuse the extension's tiling, sticky-header suppression, and byte-budget logic.

Clone this repo, then:

```
cd cli
npm install
node longshot.mjs --url https://example.com --full-page --out capture.png
```

Playwright is a devDependency. The default `--channel chrome` uses the Chrome already on the machine. It does not download a browser. Use `--channel chromium` only if you have installed Playwright's Chromium.

Progress goes to stderr. One JSON object goes to stdout:

```
node longshot.mjs --url https://example.com --full-page --out capture.png | jq -r .path
```

## Engines

- `tiled` (default) — same algorithm as the extension: scroll, hide sticky/fixed chrome from tile 2 on, stitch overlapping tiles. Slower. Applies `hideFloating()` (fixed, sticky, high-z top bars, same-origin iframes).
- `native` — Playwright `fullPage` screenshot. Faster. Fewer scroll-triggered layout shifts. Playwright's compositor often already paints a sticky header once; it does **not** run `hideFloating()`, so `position: fixed` overlays and high-z top bars can still repeat or linger.

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

`--cdp ws://127.0.0.1:9222` attaches to a Chrome started with `--remote-debugging-port=9222`. There is no native-messaging host in this release.

Launched browsers set `bypassCSP` so pages with `default-src 'self'` still capture (`addStyleTag` and in-page `data:` fetches). `--cdp` reuses the attached browser's existing context and does **not** set `bypassCSP`; CSP-restricted pages over CDP are not covered.

## URLs

`--url` accepts `http:`, `https:`, and `file:`. Local files are supported on
purpose so maintainers and agents can capture fixtures without a network
(`file:///…/test/fixtures/sticky.html`). The CLI does not upload captures and
does not restrict URLs to loopback.

## Privacy

The CLI is offline except for the `--url` you pass and an optional CDP connection. Captures are not uploaded.
