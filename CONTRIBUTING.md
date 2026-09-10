# Contributing

The unpacked Chrome/Brave extension is `extension/`. Load that folder in
Developer mode. After changing files there, reload the extension.

Shared capture logic lives in `extension/core/` (no `chrome.*`). The headless
CLI in `cli/` imports that core. There is no website to run. `vercel.json` is tracked only so the leftover
Vercel project skips every deploy (`ignoreCommand: exit 0`). Do not add a
build command; `package.json` at the repo root stays gitignored. Local
studio leftovers (`src/`, `public/`, `scripts/`) stay on disk and ignored.

## Tests

```
node --test test/core/*.test.mjs test/cli/*.test.mjs
node tools/check-manifest.mjs
```

README editor screenshot: `node tools/readme-shot.mjs` writes `docs/editor.png`.

## Pull requests

Keep changes scoped. Match the existing dark UI (cream primary, no extra
palette). Do not add accounts, analytics, or a public inbox in Settings.
Do not change capture output while extracting or sharing core code.
