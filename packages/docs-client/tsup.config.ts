import { defineConfig } from "tsup"

export default defineConfig({
  entry: [
    "lib/index.ts",
    "lib/file-system.ts",
    "lib/file-system-json.ts",
    "lib/file-system-mock.ts",
    "lib/file-system-node.ts",
    "lib/file-system-octokit.ts",
    "lib/models.ts",
  ],
  outDir: "build",
  format: ["esm"],
  clean: true,
  dts: true,
  splitting: false,
  treeshake: true,
})
