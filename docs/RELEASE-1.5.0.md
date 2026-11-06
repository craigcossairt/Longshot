# Longshot 1.5.0

Captures and editable documents stay on your device. This release improves the
extension editor, capture reliability, and the headless CLI.

## Added

- Annotations and applied crops save automatically and reopen for editing.
- Saved-state feedback, multiline text rendering, and consistent crop undo/redo.
- Scrolling modal capture with its surrounding backdrop and preserved footers.
- Transactional, per-capture history storage with migration of existing captures.

## Fixed

- Switching tabs or navigating cancels captures instead of including another page.
- Cancelled area selections and scroll operations clean up the captured page.
- Hidden overlays and decorative backgrounds no longer truncate full-page captures.
- Overlapping tiles preserve headers and complete final footers, including pages
  only one pixel taller than the viewport.
- Percentage scaling applies once; accepted JPEG/WebP compression is retained.
- Custom-folder downloads use unique filenames, including concurrent exports.
- Images, clipboard copies, and PDFs exclude editor handles and crop guides.
- Saved thumbnails and image format metadata match edited captures.
- Concurrent edits cannot overwrite another saved revision or resurrect deletions.
- Failed feedback submissions retain their draft for retry.
- CLI baselines are read before capture and protected from output collisions.
- CLI CDP sessions disconnect while leaving the external browser and tabs open.
- Strict-CSP pages capture over CDP without disabling their CSP.
- Unmet CLI byte budgets fail explicitly, including PDF overhead.

Includes the tall-page, clipboard, and large-export fixes from 1.4.1.

## Install

**Extension:** download `longshot-extension.zip`, extract it, and load the
extracted folder unpacked in Chrome or Brave. Existing installations can replace
their extension files and reload. No Chrome Web Store listing is published.

**CLI:** `npm install -g @craigcossairt/longshot@1.5.0`

The GitHub release also includes the npm tarball and SHA-256 checksums.

## Validation

123 tests passed across core, CLI, and Chromium extension checks. The npm
tarball was installed and exercised independently of the source checkout;
desktop and mobile editor screenshots were inspected.
