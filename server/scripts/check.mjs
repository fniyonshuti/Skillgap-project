import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

function findJavaScriptFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? findJavaScriptFiles(path) : path.endsWith(".js") ? [path] : [];
  });
}

const files = [
  ...findJavaScriptFiles(fileURLToPath(new URL("../src", import.meta.url))),
  ...findJavaScriptFiles(fileURLToPath(new URL("../test", import.meta.url)))
];

for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], {
    encoding: "utf8"
  });

  if (result.status !== 0) {
    process.stderr.write(result.stderr);
    process.exit(result.status || 1);
  }
}

console.log(`Server source check passed (${files.length} files).`);
