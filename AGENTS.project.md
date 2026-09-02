# Longshot — local Grok Build (this PC)

This checkout is the GitHub export of the grok.com App Builder project. Work
happens in **Grok Build TUI on Windows**, not the Linux `/workspace` sandbox.

## Start here

- Open Grok from `C:\Users\Craig Cossairt\Longshot` so `.grok/skills/` and this
  file load.
- Dev server: `npm run dev` (binds `0.0.0.0:8080`). Do not start Vite directly;
  the npm script injects `.grok/app-env.json`.
- Local URL: http://127.0.0.1:8080
- Secrets belong in `.env.local` (gitignored). This app does not need
  `XAI_API_KEY` or a database for the capture studio.
- App sign-in stays **off**. `.grok/app-env.json` `VITE_AUTH_ENABLED` is false;
  captures live in the browser, not a server.
- Vercel project: https://vercel.com/cossairt/longshot
- Brave/Chrome extension lives in `extension/`. Load unpacked from that folder
  (Developer mode on). The install page also serves `public/longshot-extension.zip`.

## Sandbox rules that do not apply here

`AGENTS.md` is the grok.com sandbox contract. On this PC you may talk about
localhost, ports, git, and terminals; you may create `.env.local`; and you
should use `npm run dev` instead of `startup.sh` for day-to-day work.

## Product

Longshot is a full-page screenshot studio (crop, annotate, copy, download, PDF)
plus a sideloaded Brave/Chrome extension — a GoFullPage replacement you control.
Stack: TanStack Start + React 19 + Tailwind v4 + Vite 8.
