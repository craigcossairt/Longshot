# Longshot

A Chrome and Brave extension for full-page screenshots. Capture, crop,
annotate, copy, download, or save as PDF. Everything stays on your machine.

This repository is the extension, plus an optional headless CLI that reuses
the same capture core. Load `extension/` unpacked; there is no website to run.

<p>
  <img src="extension/icons/icon128.png" alt="Longshot icon" width="96" height="96" />
</p>

## What it does

- Full page, visible viewport, or drag to select an area
- Sticky headers hidden after the first tile so they are not repeated
- Editor: crop, pen, shapes, text, stamps, undo/redo
- Export PNG, JPEG, WebP, AVIF, or PDF
- Files page for recent captures
- Optional one-click toolbar capture
- Optional skip-the-editor path that copies to the clipboard (or downloads)
- Keyboard shortcut: Alt+Shift+L captures the full page
- Optional CLI for unattended / agent captures (`cli/`)

## Install (unpacked)

Sideload is the supported install. A Chrome Web Store listing is not published.

1. Clone this repo.
2. Open `chrome://extensions` or `brave://extensions`.
3. Turn on Developer mode.
4. Load unpacked and choose the `extension/` folder.

Right-click the toolbar icon → **Options** for format, folder, one-click
capture, and skip-the-editor. If one-click is on, the icon starts a capture
instead of opening the menu.

## CLI (optional)

For scripts and agents. Clone-and-run, not published to npm.

```
cd cli
npm install
node longshot.mjs --url https://example.com --full-page --out capture.png
```

See [cli/README.md](cli/README.md) for engines, exit codes, and `--cdp`.

## Privacy

See [PRIVACY.md](PRIVACY.md). Screenshots are not uploaded. Feedback you send
from the editor goes only to the maintainer.

## License

[MIT](LICENSE)
