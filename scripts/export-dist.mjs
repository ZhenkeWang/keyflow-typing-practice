import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

if (!existsSync("out")) {
  throw new Error("Next.js static export was not created.");
}

rmSync("dist", { recursive: true, force: true });

function copyTree(source, target) {
  mkdirSync(target, { recursive: true });
  for (const entry of readdirSync(source)) {
    const from = join(source, entry);
    const to = join(target, entry);
    if (statSync(from).isDirectory()) copyTree(from, to);
    else writeFileSync(to, readFileSync(from));
  }
}

copyTree("out", "dist");
