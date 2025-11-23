import { expect, test } from "bun:test"
import { DocPathSystem } from "../modules/path-system/doc-path-system"
import { DocFilePathValue } from "./doc-file-path-value"

test("DocFilePathValue - 基本的な作成とプロパティアクセス", () => {
  const pathSystem = new DocPathSystem()
  const value = new DocFilePathValue(
    {
      path: "docs/example.md",
      name: "example",
      fullPath: "/Users/test/docs/example.md",
      nameWithExtension: "example.md",
    },
    pathSystem,
  )

  expect(value.path).toBe("docs/example.md")
  expect(value.name).toBe("example")
  expect(value.fullPath).toBe("/Users/test/docs/example.md")
  expect(value.nameWithExtension).toBe("example.md")
})

test("DocFilePathValue - extension getterが拡張子を返す", () => {
  const pathSystem = new DocPathSystem()
  const value = new DocFilePathValue(
    {
      path: "docs/test.md",
      name: "test",
      fullPath: "/Users/test/docs/test.md",
      nameWithExtension: "test.md",
    },
    pathSystem,
  )

  expect(value.extension).toBe(".md")
})

test("DocFilePathValue - 拡張子のないファイル", () => {
  const pathSystem = new DocPathSystem()
  const value = new DocFilePathValue(
    {
      path: "docs/README",
      name: "README",
      fullPath: "/Users/test/docs/README",
      nameWithExtension: "README",
    },
    pathSystem,
  )

  expect(value.extension).toBe("")
})

test("DocFilePathValue - fromPathWithSystemで相対パスから生成", () => {
  const pathSystem = new DocPathSystem()
  const value = DocFilePathValue.fromPathWithSystem(
    "docs/test.md",
    pathSystem,
    "/Users/project",
  )

  expect(value.path).toBe("docs/test.md")
  expect(value.name).toBe("test")
  expect(value.fullPath).toBe("/Users/project/docs/test.md")
  expect(value.nameWithExtension).toBe("test.md")
})

test("DocFilePathValue - fromPathWithSystemでindex.mdの場合", () => {
  const pathSystem = new DocPathSystem()
  const value = DocFilePathValue.fromPathWithSystem(
    "docs/features/index.md",
    pathSystem,
    "/Users/project",
  )

  expect(value.path).toBe("docs/features/index.md")
  expect(value.name).toBe("features")
  expect(value.fullPath).toBe("/Users/project/docs/features/index.md")
  expect(value.nameWithExtension).toBe("index.md")
})

test("DocFilePathValue - fromPathWithSystemでルートのindex.mdの場合", () => {
  const pathSystem = new DocPathSystem()
  const value = DocFilePathValue.fromPathWithSystem(
    "index.md",
    pathSystem,
    "/Users/project",
  )

  expect(value.path).toBe("index.md")
  expect(value.name).toBe("index")
  expect(value.fullPath).toBe("/Users/project/index.md")
  expect(value.nameWithExtension).toBe("index.md")
})

test("DocFilePathValue - toJsonで元のデータ構造を返す", () => {
  const pathSystem = new DocPathSystem()
  const data = {
    path: "docs/test.md",
    name: "test",
    fullPath: "/Users/test/docs/test.md",
    nameWithExtension: "test.md",
  }

  const value = new DocFilePathValue(data, pathSystem)
  expect(value.toJson()).toEqual(data)
})

test("DocFilePathValue - 不変性の確認", () => {
  const pathSystem = new DocPathSystem()
  const value = new DocFilePathValue(
    {
      path: "docs/test.md",
      name: "test",
      fullPath: "/Users/test/docs/test.md",
      nameWithExtension: "test.md",
    },
    pathSystem,
  )

  expect(() => {
    // @ts-expect-error - 不変性のテスト
    value.value = {}
  }).toThrow()
})
