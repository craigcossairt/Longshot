# Contributing

The unpacked Chrome/Brave extension is `extension/`. Load that folder in
Developer mode. After changing files there, reload the extension.

Shared capture logic lives in `extension/core/` (no `chrome.*`). The headless
CLI in `cli/` imports that core. The npm package is `@craigcossairt/longshot`,
published from the repo root so `cli/` and `extension/core/` ship together.
There is no website to run. `vercel.json` is tracked only so the leftover
Vercel project skips every deploy (`ignoreCommand: exit 0`). Do not add a
build command. Local studio leftovers (`src/`, `public/`, `scripts/`) stay on
disk and ignored.

## Tests

```
node --test test/core/*.test.mjs test/cli/*.test.mjs
node --test test/extension/*.test.mjs
node tools/check-manifest.mjs
npm run check:package
```

The CLI tests use the installed Chrome unless `LONGSHOT_CHANNEL=chromium`. The
extension tests load `extension/` into Playwright's Chromium (branded Chrome
ignores `--load-extension`), so they need `npx playwright install chromium`.

`npm run check:package` packs and installs the actual npm tarball in a temporary
directory, then captures a local fixture through its installed entry point.
It installs dependencies offline from the npm cache populated by `npm ci`.
Use the extension Playwright harness for behavioral browser checks; no website
dev server or app build is required. Save review screenshots in `screenshots/`.

Editor screenshot: `node tools/readme-shot.mjs` writes `docs/editor.png`. The
README shows `docs/Longshot Editor Example.png`, an annotated copy updated by hand.

## Pull requests

Keep changes scoped. Match the existing dark UI (cream primary, no extra
palette). Do not add accounts, analytics, or a public inbox in Settings.
Do not change capture output while extracting or sharing core code.
