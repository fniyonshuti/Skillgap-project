import { build } from "vite";

await build({
  logLevel: "error",
  build: {
    minify: false,
    sourcemap: false,
    write: false
  }
});

console.log("Client source check passed.");
