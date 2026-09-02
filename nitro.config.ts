import { cpSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { defineConfig } from "nitro";

function copyTslib(destRoot: string) {
  const src = join(process.cwd(), "node_modules", "tslib");
  if (!existsSync(src) || !existsSync(destRoot)) return;
  const dest = join(destRoot, "node_modules", "tslib");
  mkdirSync(join(destRoot, "node_modules"), { recursive: true });
  cpSync(src, dest, { recursive: true });
}

function functionDirs(dir: string, found: string[] = []) {
  if (!existsSync(dir)) return found;
  for (const name of readdirSync(dir)) {
    const next = join(dir, name);
    if (!statSync(next).isDirectory()) continue;
    if (name.endsWith(".func")) found.push(next);
    else functionDirs(next, found);
  }
  return found;
}

export function stampTslib(nitro?: { options?: { output?: { dir?: string; serverDir?: string } } }) {
  const output = nitro?.options?.output;
  if (output?.serverDir) copyTslib(output.serverDir);
  if (output?.dir) copyTslib(output.dir);
  copyTslib(join(process.cwd(), ".output", "server"));
  for (const dir of functionDirs(join(process.cwd(), ".vercel", "output", "functions"))) {
    copyTslib(dir);
    copyTslib(join(dir, "_libs"));
  }
}

export default defineConfig({
  noExternals: true,
  traceDeps: ["tslib*"],
  hooks: {
    compiled(nitro) {
      stampTslib(nitro);
    },
    close() {
      stampTslib();
    },
  },
});
