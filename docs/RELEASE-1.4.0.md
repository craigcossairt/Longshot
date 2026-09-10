## 1.4.0

Full-page screenshots that stay on your machine. The CLI is now an npm package
and the extension version matches it.

### Added
- npm package `@craigcossairt/longshot` (command: `longshot`), published from
  the repo root so `cli/` and `extension/core/` ship in one tarball
- `--baseline <path.json>` visual-diff mode. Every capture writes
  `<out>.verdict.json`. Exit 5 means the capture succeeded and the page changed
- Overflow-pane capture, keyboard shortcut Alt+Shift+L, and a headless CLI
  that reuses the extension core (from 1.3.x)

### Fixed
- CLI captures of pages with a restrictive CSP (`default-src 'self'`, and
  logged-in pages whose `connect-src` omits `data:`). Launched browsers set
  `bypassCSP` for `addStyleTag`; image tiles are passed as Blobs so `--cdp`
  does not have to override the attached browser's CSP
- `--max-bytes` now runs a real encode so the JPEG quality ladder can meet the
  budget without shrinking the image
- Tests cover the `hideable` path that actually runs during capture, not only
  the unused `shouldHide` export

### Install

**Extension:** load the `extension/` folder unpacked in Chrome or Brave
(Developer mode). The Chrome Web Store listing is not published yet.

**CLI:**

```
npm install -g @craigcossairt/longshot
longshot --url https://example.com --full-page --out capture.png
```

From a clone: `npm install` then `npx longshot --url …`.
