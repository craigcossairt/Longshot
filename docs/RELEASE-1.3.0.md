## 1.3.0

Full-page screenshots that stay on your machine.

### Added
- Headless CLI in `cli/` that reuses the extension capture core (sticky suppression, tiling, byte budget)
- Keyboard shortcut Alt+Shift+L for a full-page capture
- Overflow-pane capture for apps that scroll an inner `overflow: auto` feed (Gmail, Notion, dashboards), with an Options toggle (on by default)
- Tests (`node --test`) and GitHub Actions CI that packs `extension/`

### Fixed
- Service worker crash: classic workers cannot `import()`. The background script is now a module.

### Install
Load the `extension/` folder unpacked in Chrome or Brave (Developer mode). The Chrome Web Store listing is not published yet.

The CLI is clone-and-run:

```
cd cli
npm install
node longshot.mjs --url https://example.com --full-page --out capture.png
```
