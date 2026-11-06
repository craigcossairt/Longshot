# Longshot 1.5.0

Captures and editable documents stay on your device. This release improves the
extension editor, capture reliability, and the headless CLI.

## Added

- Annotations and applied crops save automatically and reopen for editing.
- Saved-state feedback, multiline text rendering, and consistent crop undo/redo.
- Scrolling modal capture on both axes with its surrounding backdrop and preserved footers.
- Transactional, per-capture history storage with migration of existing captures.

## Fixed

- Switching tabs or navigating cancels captures instead of including another page.
- Iframe refreshes no longer cancel captures of an unchanged main page.
- Cancelled area selections and scroll operations clean up the captured page.
- Hidden overlays and decorative backgrounds no longer truncate full-page captures.
- Non-modal cookie banners do not truncate the page, and scrolling absolute
  content remains visible across tile boundaries.
- Overlapping tiles preserve headers and complete final footers, including pages
  only one pixel taller than the viewport.
- Percentage scaling applies once; accepted JPEG/WebP compression is retained.
- Browser-bar text and controls scale with the captured image.
- Small modal overflows and headers/footers spanning several tile columns are
  captured completely. Rounded image dimensions stay within canvas limits.
- Custom-folder downloads use unique filenames, including concurrent exports.
- Images, clipboard copies, and PDFs exclude editor handles and crop guides.
- Saved thumbnails and image format metadata match edited captures.
- Concurrent edits cannot overwrite another saved revision or resurrect deletions.
- Failed saves can be retried, and failed crop-image loads recover after undo.
- Editor changes avoid repeatedly serializing annotations during drawing; the
  Files view retains lightweight capture summaries.
- Failed feedback submissions retain their draft for retry.
- CLI baselines are read before capture and protected from output collisions.
- Baseline protection detects hard links and case-insensitive filename aliases.
- Existing output paths are rejected when the filesystem cannot establish that
  they are distinct from the baseline.
- CLI CDP sessions disconnect while leaving the external browser and tabs open.
- Strict-CSP pages capture over CDP without disabling their CSP.
- Unmet CLI byte budgets fail explicitly, including PDF overhead.
- PDF fitting includes wrapper bytes, and images already within budget retain
  their original encoding.

Includes the tall-page, clipboard, and large-export fixes from 1.4.1.

## Install

**Extension:** download `longshot-extension.zip`, extract it, and load the
extracted folder unpacked in Chrome or Brave. To upgrade, replace the files in
your existing extension directory and reload that installation. Keep its current
directory and do not remove the installation, so saved captures remain accessible.
No Chrome Web Store listing is published.

**CLI:** `npm install -g @craigcossairt/longshot@1.5.0`

The GitHub release also includes the npm tarball and SHA-256 checksums.

## Validation

Core, CLI, and Chromium extension regression checks passed. The npm
tarball was installed and exercised independently of the source checkout;
desktop and mobile editor screenshots were inspected.
