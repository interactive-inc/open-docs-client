import { expect, test } from "bun:test"
import { DocPathSystemMock } from "./doc-path-system-mock"

test("DocPathSystemMock - join: パスを結合", () => {
  const pathSystem = new DocPathSystemMock()

  expect(pathSystem.join("docs", "index.md")).toBe("docs/index.md")
  expect(pathSystem.join("docs", "guide", "intro.md")).toBe(
    "docs/guide/intro.md",
  )
  expect(pathSystem.join("", "docs", "", "file.md")).toBe("docs/file.md")
  expect(pathSystem.join("/root", "docs", "file.md")).toBe("/root/docs/file.md")
})

test("DocPathSystemMock - basename: ファイル名を取得", () => {
  const pathSystem = new DocPathSystemMock()

  expect(pathSystem.basename("docs/index.md")).toBe("index.md")
  expect(pathSystem.basename("docs/index.md", ".md")).toBe("index")
  expect(pathSystem.basename("index.md")).toBe("index.md")
  expect(pathSystem.basename("docs/")).toBe("")
  expect(pathSystem.basename("docs\\index.md")).toBe("index.md")
})

test("DocPathSystemMock - dirname: ディレクトリ名を取得", () => {
  const pathSystem = new DocPathSystemMock()

  expect(pathSystem.dirname("docs/index.md")).toBe("docs")
  expect(pathSystem.dirname("docs/guide/intro.md")).toBe("docs/guide")
  expect(pathSystem.dirname("index.md")).toBe(".")
  expect(pathSystem.dirname("/index.md")).toBe("/")
  expect(pathSystem.dirname("docs\\index.md")).toBe("docs")
})

test("DocPathSystemMock - extname: 拡張子を取得", () => {
  const pathSystem = new DocPathSystemMock()

  expect(pathSystem.extname("index.md")).toBe(".md")
  expect(pathSystem.extname("script.js")).toBe(".js")
  expect(pathSystem.extname("file")).toBe("")
  expect(pathSystem.extname(".hidden")).toBe("")
  expect(pathSystem.extname("file.")).toBe(".")
})

test("DocPathSystemMock - relative: 相対パスを計算", () => {
  const pathSystem = new DocPathSystemMock()

  expect(pathSystem.relative("docs", "docs/guide.md")).toBe("guide.md")
  expect(pathSystem.relative("docs/guide", "docs/index.md")).toBe("../index.md")
  expect(pathSystem.relative("docs", "docs")).toBe(".")
  expect(pathSystem.relative("docs/a/b", "docs/c/d")).toBe("../../c/d")
})

test("DocPathSystemMock - resolve: 絶対パスに変換", () => {
  const pathSystem = new DocPathSystemMock()

  expect(pathSystem.resolve("docs/index.md")).toBe("/mock-cwd/docs/index.md")
  expect(pathSystem.resolve("/absolute/path")).toBe("/absolute/path")
  expect(pathSystem.resolve("docs", "../other")).toBe("/mock-cwd/other")
  expect(pathSystem.resolve("/root", "docs", "file.md")).toBe(
    "/root/docs/file.md",
  )
})

test("DocPathSystemMock - normalize: パスを正規化", () => {
  const pathSystem = new DocPathSystemMock()

  expect(pathSystem.normalize("docs/./index.md")).toBe("docs/index.md")
  expect(pathSystem.normalize("docs/../other/file.md")).toBe("other/file.md")
  expect(pathSystem.normalize("/docs//guide///intro.md")).toBe(
    "/docs/guide/intro.md",
  )
  expect(pathSystem.normalize("")).toBe(".")
  expect(pathSystem.normalize("./")).toBe(".")
})

test("DocPathSystemMock - isAbsolute: 絶対パスかどうか", () => {
  const pathSystem = new DocPathSystemMock()

  expect(pathSystem.isAbsolute("/absolute/path")).toBe(true)
  expect(pathSystem.isAbsolute("relative/path")).toBe(false)
  expect(pathSystem.isAbsolute("./relative")).toBe(false)
  expect(pathSystem.isAbsolute("../relative")).toBe(false)
})

test("DocPathSystemMock - sep: セパレータ", () => {
  const pathSystem = new DocPathSystemMock()
  expect(pathSystem.sep).toBe("/")

  const windowsPathSystem = DocPathSystemMock.createWithSeparator("\\")
  expect(windowsPathSystem.sep).toBe("\\")
})

test("DocPathSystemMock - createWithSeparator: カスタムセパレータ", () => {
  const pathSystem = DocPathSystemMock.createWithSeparator("\\")

  expect(pathSystem.join("docs", "index.md")).toBe("docs\\index.md")
  expect(pathSystem.sep).toBe("\\")
})
