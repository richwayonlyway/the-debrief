import { copyFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const output = resolve(root, ".sites-static");
const files = ["index.html", "content.js", "debrief.js", "debrief.css"];

await mkdir(output, { recursive: true });
await Promise.all(
  files.map((file) => copyFile(resolve(root, file), resolve(output, file))),
);
