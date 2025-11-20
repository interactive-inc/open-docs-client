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
  const value = DocDirectoryPathValue.fromPathWithSystem(
    ".",
    "/Users/project",
    pathSystem,
  )

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
