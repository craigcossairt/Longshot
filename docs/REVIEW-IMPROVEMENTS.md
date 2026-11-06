# Capture, editing, and CLI reliability

## Capture and export

- Stop interrupted captures when the target tab changes or navigates.
- Recognize foreground dialogs without treating decorative fixed backgrounds
  or hidden overlays as dialogs.
- Preserve header and footer pixels at overlapping tile boundaries.
- Apply percentage scaling once, while retaining safe tall-image allocation.
- Keep the encoded result that satisfies the requested file-size budget.
- Save custom-folder exports with unique names, including concurrent exports
  from multiple editor tabs.
- Exclude selection handles, crop guides, and other interaction graphics from
  exported images, clipboard copies, and PDFs.

## Editing and history

- Preserve editable annotations and crop state across navigation and reload.
- Keep undo/redo and saved history consistent.
- Store captures individually in IndexedDB, migrate existing history, and make
  changes transactional so concurrent edits cannot replace the entire library.
- Keep thumbnails, image bytes, and format metadata consistent after editing.

## CLI and verification

- Read baselines before capture and reject sidecar collisions to prevent a
  capture from overwriting its own baseline and falsely passing comparison.
- Release CDP connections without closing the user's external browser.
- Cover strict CSP pages over CDP and report unmet output byte budgets.
- Add regression coverage for capture interruption, overlap, scaling, encoding,
  editor exports and persistence, concurrent history, and custom folders.
- Verify that the npm tarball installs and captures outside the source tree.

The development contract is extension/CLI-only; the former website is retired.
