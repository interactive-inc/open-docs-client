import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["lib/index.ts", "lib/cli.ts"],
  outDir: "build",
  format: ["esm"],
  clean: true,
  dts: true,
  splitting: false
})
