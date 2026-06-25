import { expect, test } from "bun:test"
import { DocPathSystem } from "../modules/path-system/doc-path-system"
import { DocDirectoryPathValue } from "./doc-directory-path-value"

test("DocDirectoryPathValue - 基本的な作成とプロパティアクセス", () => {
  const pathSystem = new DocPathSystem()
  const value = new DocDirectoryPathValue(
    {
      path: "docs/features",
      name: "features",
      fullPath: "/Users/test/docs/features",
    },
    pathSystem,
  )

  expect(value.path).toBe("docs/features")
  expect(value.name).toBe("features")
  expect(value.fullPath).toBe("/Users/test/docs/features")
})

test("DocDirectoryPathValue - ルートディレクトリの場合", () => {
  const pathSystem = new DocPathSystem()
  const value = new DocDirectoryPathValue(
    {
      path: ".",
      name: "",
      fullPath: "/Users/test",
    },
    pathSystem,
  )

  expect(value.path).toBe(".")
  expect(value.name).toBe("")
  expect(value.fullPath).toBe("/Users/test")
})

test("DocDirectoryPathValue - fromPathWithSystemで相対パスから生成", () => {
  const pathSystem = new DocPathSystem()
  const value = DocDirectoryPathValue.fromPathWithSystem(
    "docs/products",
    "/Users/project",
    pathSystem,
  )

  expect(value.path).toBe("docs/products")
  expect(value.name).toBe("products")
  expect(value.fullPath).toBe("/Users/project/docs/products")
})

test("DocDirectoryPathValue - fromPathWithSystemでルートディレクトリ", () => {
  const pathSystem = new DocPathSystem()
  const value = DocDirectoryPathValue.fromPathWithSystem(".", "/Users/project", pathSystem)

  expect(value.path).toBe(".")
  expect(value.name).toBe("")
  expect(value.fullPath).toBe("/Users/project")
})

test("DocDirectoryPathValue - fromPathWithSystemでネストしたディレクトリ", () => {
  const pathSystem = new DocPathSystem()
  const value = DocDirectoryPathValue.fromPathWithSystem(
    "docs/products/app/features",
    "/Users/project",
    pathSystem,
  )

  expect(value.path).toBe("docs/products/app/features")
  expect(value.name).toBe("features")
  expect(value.fullPath).toBe("/Users/project/docs/products/app/features")
})

test("DocDirectoryPathValue - toJsonで元のデータ構造を返す", () => {
  const pathSystem = new DocPathSystem()
  const data = {
    path: "docs/test",
    name: "test",
    fullPath: "/Users/test/docs/test",
  }

  const value = new DocDirectoryPathValue(data, pathSystem)
  expect(value.toJson()).toEqual(data)
})

test("DocDirectoryPathValue - 不変性の確認", () => {
  const pathSystem = new DocPathSystem()
  const value = new DocDirectoryPathValue(
    {
      path: "docs/test",
      name: "test",
      fullPath: "/Users/test/docs/test",
    },
    pathSystem,
  )

  expect(() => {
    // @ts-expect-error - 不変性のテスト
    value.value = {}
  }).toThrow()
})

// contains() の境界（自己包含しない / ルートが子を含む）回帰テスト
test("DocDirectoryPathValue - contains: ルートは子を含む", () => {
  const pathSystem = new DocPathSystem()
  const root = DocDirectoryPathValue.fromPathWithSystem(".", "/base", pathSystem)
  const child = DocDirectoryPathValue.fromPathWithSystem("docs", "/base", pathSystem)

  expect(root.contains(child)).toBe(true)
})

test("DocDirectoryPathValue - contains: 自身は含まない", () => {
  const pathSystem = new DocPathSystem()
  const dir = DocDirectoryPathValue.fromPathWithSystem("docs", "/base", pathSystem)

  expect(dir.contains(dir)).toBe(false)
})

test("DocDirectoryPathValue - contains: 兄弟は含まない", () => {
  const pathSystem = new DocPathSystem()
  const dir = DocDirectoryPathValue.fromPathWithSystem("docs/a", "/base", pathSystem)
  const sibling = DocDirectoryPathValue.fromPathWithSystem("docs/b", "/base", pathSystem)

  expect(dir.contains(sibling)).toBe(false)
})

test("DocDirectoryPathValue - contains: 子孫を含む", () => {
  const pathSystem = new DocPathSystem()
  const dir = DocDirectoryPathValue.fromPathWithSystem("docs", "/base", pathSystem)
  const descendant = DocDirectoryPathValue.fromPathWithSystem("docs/a/b", "/base", pathSystem)

  expect(dir.contains(descendant)).toBe(true)
})

// toJson() が内部 value を参照で漏らさない（不変性の回帰テスト）
test("DocDirectoryPathValue - toJson: 出力を変更しても内部状態は不変", () => {
  const pathSystem = new DocPathSystem()
  const dir = DocDirectoryPathValue.fromPathWithSystem("docs", "/base", pathSystem)

  const json = dir.toJson()
  json.name = "changed"

  expect(dir.name).toBe("docs")
})
