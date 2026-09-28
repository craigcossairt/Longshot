## 1.4.1

Bug fixes for the extension and the CLI. No new settings.

### Fixed
- Tall pages on high-DPI screens are captured whole. Pages past the canvas
  size limit used to come out cut off or blank; tiles are now scaled while
  they are stitched (extension and CLI). The CLI's `--engine native` shoots
  very tall pages in slices
- Skip-the-editor copy to the clipboard works. It writes from the captured
  tab (or the popup) instead of a background document that never had focus
- A capture no longer hangs, blocking later captures, when an editor tab is
  open and you capture another extension page
- A capture that fails part-way no longer leaves hidden scrollbars or resized
  frames on the page
- AVIF: when the browser cannot encode it (current Chrome), you get an error
  instead of a PNG named `.avif`
- Editor and Files downloads save directly, so very large captures and PDFs
  export, and a failed export shows an error
- Long captures no longer hit the extension's 10 MB storage quota
- PDF titles ending in `\` no longer produce a malformed PDF
- CLI `--cdp` opens its own tab instead of taking over your first tab
- CLI `--max-bytes` keeps the aspect ratio when it has to shrink the image;
  native, selector, and region captures respect the max width/height limits

### Changed
- Removed the `offscreen` permission; added `unlimitedStorage` (no install
  prompt)
- Feedback no longer tries a local development endpoint
- PRIVACY.md explains the all-sites permission

### Install

**Extension:** load the `extension/` folder unpacked in Chrome or Brave
(Developer mode). The Chrome Web Store listing is not published yet.

**CLI:**

```
npm install -g @craigcossairt/longshot
longshot --url https://example.com --full-page --out capture.png
```

From a clone: `npm install` then `npx longshot --url …`.
