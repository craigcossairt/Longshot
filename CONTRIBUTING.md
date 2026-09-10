# Contributing

The unpacked Chrome/Brave extension is `extension/`. Load that folder in
Developer mode. After changing files there, reload the extension.

Shared capture logic lives in `extension/core/` (no `chrome.*`). The headless
CLI in `cli/` imports that core. There is no website to run.

## Tests

```
node --test test/core/*.test.mjs test/cli/*.test.mjs
node tools/check-manifest.mjs
```

## Pull requests

Keep changes scoped. Match the existing dark UI (cream primary, no extra
palette). Do not add accounts, analytics, or a public inbox in Settings.
Do not change capture output while extracting or sharing core code.
