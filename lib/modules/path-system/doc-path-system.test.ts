import { expect, test } from "bun:test"
import { DocPathSystem } from "./doc-path-system"

test("DocPathSystem - join: パスを結合", () => {
  const system = new DocPathSystem()

  expect(system.join("docs", "products", "index.md")).toBe(
    "docs/products/index.md",
  )
  expect(system.join("/docs", "products")).toBe("/docs/products")
  expect(system.join("docs/", "/products")).toBe("docs/products")
  expect(system.join("", "docs", "", "index.md")).toBe("docs/index.md")
  expect(system.join()).toBe(".")
})

test("DocPathSystem - basename: ファイル名を取得", () => {
  const system = new DocPathSystem()

  expect(system.basename("docs/index.md")).toBe("index.md")
  expect(system.basename("docs/index.md", ".md")).toBe("index")
  expect(system.basename("/path/to/file.txt")).toBe("file.txt")
  expect(system.basename("file")).toBe("file")
  expect(system.basename("")).toBe("")
})

test("DocPathSystem - dirname: ディレクトリ名を取得", () => {
  const system = new DocPathSystem()

  expect(system.dirname("docs/products/index.md")).toBe("docs/products")
  expect(system.dirname("docs/index.md")).toBe("docs")
  expect(system.dirname("index.md")).toBe(".")
  expect(system.dirname("/")).toBe(".")
  expect(system.dirname("")).toBe(".")
})

test("DocPathSystem - extname: 拡張子を取得", () => {
  const system = new DocPathSystem()

  expect(system.extname("index.md")).toBe(".md")
  expect(system.extname("file.test.ts")).toBe(".ts")
  expect(system.extname("README")).toBe("")
  expect(system.extname(".gitignore")).toBe("")
  expect(system.extname("file.")).toBe(".")
})

test("DocPathSystem - relative: 相対パスを計算", () => {
  const system = new DocPathSystem()

  expect(system.relative("docs/products", "docs/features")).toBe("../features")
  expect(system.relative("docs", "docs/products/app")).toBe("products/app")
  expect(system.relative("docs/products/app", "docs")).toBe("../..")
  expect(system.relative("docs", "docs")).toBe(".")
})

test("DocPathSystem - resolve: 絶対パスに変換", () => {
  const system = new DocPathSystem()

  expect(system.resolve("/docs", "products", "index.md")).toBe(
    "/docs/products/index.md",
  )
  expect(system.resolve("docs", "/products", "index.md")).toBe(
    "/products/index.md",
  )
  expect(system.resolve("", "docs")).toBe("docs")
  expect(system.resolve()).toBe(".")
})

test("DocPathSystem - normalize: パスを正規化", () => {
  const system = new DocPathSystem()

  expect(system.normalize("docs//products/../features/./index.md")).toBe(
    "docs/features/index.md",
  )
  expect(system.normalize("/docs/../products")).toBe("/products")
  expect(system.normalize("../docs/./products")).toBe("../docs/products")
  expect(system.normalize("./docs")).toBe("docs")
  expect(system.normalize(".")).toBe(".")
})

test("DocPathSystem - isAbsolute: 絶対パスかどうか", () => {
  const system = new DocPathSystem()

  expect(system.isAbsolute("/docs/index.md")).toBe(true)
  expect(system.isAbsolute("docs/index.md")).toBe(false)
  expect(system.isAbsolute("./docs")).toBe(false)
  expect(system.isAbsolute("")).toBe(false)
})

test("DocPathSystem - sep: セパレータ", () => {
  const system = new DocPathSystem()

  expect(system.separator).toBe("/")
})
