import { defineConfig } from "nitro";

export default defineConfig({
  // Radix server chunks import tslib as a bare package. If it stays external,
  // the Vercel function 500s on boot and never reaches /api/feedback / Resend.
  noExternals: true,
  traceDeps: ["tslib*"],
});
