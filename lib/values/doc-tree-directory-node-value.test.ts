import { expect, test } from "bun:test"
import { DocTreeDirectoryNodeValue } from "./doc-tree-directory-node-value"
import { DocTreeFileNodeValue } from "./doc-tree-file-node-value"

test("ディレクトリノードの基本プロパティを取得できる", () => {
  const node = new DocTreeDirectoryNodeValue({
    name: "products",
    path: "docs/products",
    icon: "📁",
    title: "製品",
    children: [],
  })

  expect(node.name).toBe("products")
  expect(node.path).toBe("docs/products")
  expect(node.icon).toBe("📁")
  expect(node.title).toBe("製品")
  expect(node.type).toBe("directory")
  expect(node.children).toEqual([])
})

test("子ノードを持つディレクトリノードを作成できる", () => {
  const fileChild = new DocTreeFileNodeValue({
    name: "overview",
    path: "docs/products/overview.md",
    icon: "📄",
    title: "概要",
  })

  const dirChild = new DocTreeDirectoryNodeValue({
    name: "features",
    path: "docs/products/features",
    icon: "⚡",
    title: "機能",
    children: [],
  })

  const node = new DocTreeDirectoryNodeValue({
    name: "products",
    path: "docs/products",
    icon: "📁",
    title: "製品",
    children: [fileChild, dirChild],
  })

  expect(node.children.length).toBe(2)
  expect(node.children[0]).toBeInstanceOf(DocTreeFileNodeValue)
  expect(node.children[1]).toBeInstanceOf(DocTreeDirectoryNodeValue)
})

test("fromメソッドでインスタンスを生成できる", () => {
  const node = DocTreeDirectoryNodeValue.from({
    name: "docs",
    path: "docs",
    icon: "📚",
    title: "ドキュメント",
    children: [],
  })

  expect(node.name).toBe("docs")
  expect(node.icon).toBe("📚")
})

test("JSON形式に変換できる", () => {
  const fileChild = new DocTreeFileNodeValue({
    name: "readme",
    path: "docs/readme.md",
    icon: "📝",
    title: "README",
  })

  const node = new DocTreeDirectoryNodeValue({
    name: "docs",
    path: "docs",
    icon: "📁",
    title: "ドキュメント",
    children: [fileChild],
  })

  const json = node.toJson()
  expect(json).toEqual({
    name: "docs",
    path: "docs",
    type: "directory",
    icon: "📁",
    title: "ドキュメント",
    children: [
      {
        name: "readme",
        path: "docs/readme.md",
        type: "file",
        icon: "📝",
        title: "README",
      },
    ],
  })
})

test("JSONからインスタンスを生成できる", () => {
  const json = {
    name: "api",
    path: "docs/api",
    type: "directory",
    icon: "🔧",
    title: "API",
    children: [
      {
        name: "endpoints",
        path: "docs/api/endpoints.md",
        type: "file",
        icon: "📄",
        title: "エンドポイント",
      },
      {
        name: "auth",
        path: "docs/api/auth",
        type: "directory",
        icon: "🔐",
        title: "認証",
        children: [],
      },
    ],
  }

  const node = DocTreeDirectoryNodeValue.fromJson(json)

  expect(node.name).toBe("api")
  expect(node.path).toBe("docs/api")
  expect(node.icon).toBe("🔧")
  expect(node.title).toBe("API")
  expect(node.children.length).toBe(2)
  expect(node.children[0]).toBeInstanceOf(DocTreeFileNodeValue)
  expect(node.children[0].name).toBe("endpoints")
  expect(node.children[1]).toBeInstanceOf(DocTreeDirectoryNodeValue)
  expect(node.children[1].name).toBe("auth")
})

test("深くネストされた構造も処理できる", () => {
  const deepChild = new DocTreeFileNodeValue({
    name: "deep-file",
    path: "docs/a/b/c/deep-file.md",
    icon: "🔍",
    title: "深いファイル",
  })

  const level3 = new DocTreeDirectoryNodeValue({
    name: "c",
    path: "docs/a/b/c",
    icon: "📁",
    title: "レベル3",
    children: [deepChild],
  })

  const level2 = new DocTreeDirectoryNodeValue({
    name: "b",
    path: "docs/a/b",
    icon: "📁",
    title: "レベル2",
    children: [level3],
  })

  const level1 = new DocTreeDirectoryNodeValue({
    name: "a",
    path: "docs/a",
    icon: "📁",
    title: "レベル1",
    children: [level2],
  })

  const level1Child = level1.children[0]
  expect(level1Child).toBeInstanceOf(DocTreeDirectoryNodeValue)

  if (level1Child instanceof DocTreeDirectoryNodeValue) {
    const level2Child = level1Child.children[0]
    expect(level2Child).toBeInstanceOf(DocTreeDirectoryNodeValue)

    if (level2Child instanceof DocTreeDirectoryNodeValue) {
      const level3Child = level2Child.children[0]
      expect(level3Child).toBeInstanceOf(DocTreeFileNodeValue)
      expect(level3Child.name).toBe("deep-file")
    }
  }
})
