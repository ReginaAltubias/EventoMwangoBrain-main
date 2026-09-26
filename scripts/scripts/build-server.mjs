import { build } from "esbuild";

await build({
  entryPoints: ["server/app.ts"],
  outfile: "dist-server/app.js",
  bundle: true,
  platform: "node",
  format: "esm",
  packages: "external",
  sourcemap: true,
});

console.log("✓ Server built successfully");