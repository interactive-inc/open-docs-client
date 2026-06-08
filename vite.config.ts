import { defineConfig } from "vite-plus"

export default defineConfig({
  fmt: {
    semi: false,
    ignorePatterns: [".next/**", "build/**", "route-tree.gen.ts"],
  },
  lint: {
    ignorePatterns: [".next/**", "build/**", "route-tree.gen.ts"],
  },
})
