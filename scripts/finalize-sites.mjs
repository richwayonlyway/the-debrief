import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const workerOutput = resolve(root, "dist", "the_debrief");
const serverOutput = resolve(root, "dist", "server");

await mkdir(serverOutput, { recursive: true });
await copyFile(
  resolve(workerOutput, "index.mjs"),
  resolve(serverOutput, "index.js"),
);

const wrangler = JSON.parse(
  await readFile(resolve(workerOutput, "wrangler.json"), "utf8"),
);
wrangler.main = "index.js";
wrangler.assets = { directory: "../client" };
await writeFile(
  resolve(serverOutput, "wrangler.json"),
  `${JSON.stringify(wrangler, null, 2)}\n`,
);
