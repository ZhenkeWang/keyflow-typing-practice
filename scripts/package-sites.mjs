import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

mkdirSync("dist/.openai", { recursive: true });
writeFileSync("dist/.openai/hosting.json", readFileSync(".openai/hosting.json"));
