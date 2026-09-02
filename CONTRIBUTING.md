# Contributing

## Extension

The unpacked Chrome/Brave extension is `extension/`. Load that folder in
Developer mode. After changing files there, reload the extension.

The install page also serves `public/longshot-extension.zip`. If you change
`extension/`, copy it into `public/longshot-extension/` and refresh the zip
before shipping.

## Studio

```
npm install
npm run dev
```

The studio is the editor and sample captures. It cannot inject into other
websites.

```
npm run typecheck
npm run build
```

## Pull requests

Keep changes scoped. Match the existing dark UI (cream primary, no extra
palette). Do not add accounts, analytics, or a public inbox in Settings.
