import { expect, test } from "bun:test"
import { DocTreeFileNodeValue } from "./doc-tree-file-node-value"

test("ファイルノードの基本プロパティを取得できる", () => {
  const node = new DocTreeFileNodeValue({
    name: "overview",
    path: "docs/overview.md",
    icon: "📄",
    title: "概要",
  })

  expect(node.name).toBe("overview")
  expect(node.path).toBe("docs/overview.md")
  expect(node.icon).toBe("📄")
  expect(node.title).toBe("概要")
  expect(node.type).toBe("file")
})

test("fromメソッドでインスタンスを生成できる", () => {
  const node = DocTreeFileNodeValue.from({
    name: "readme",
    path: "readme.md",
    icon: "📝",
    title: "README",
  })

  expect(node.name).toBe("readme")
  expect(node.path).toBe("readme.md")
  expect(node.icon).toBe("📝")
  expect(node.title).toBe("README")
})

test("JSON形式に変換できる", () => {
  const node = new DocTreeFileNodeValue({
    name: "config",
    path: "docs/config.md",
    icon: "⚙️",
    title: "設定",
  })

  const json = node.toJson()
  expect(json).toEqual({
    name: "config",
    path: "docs/config.md",
    type: "file",
    icon: "⚙️",
    title: "設定",
  })
})

test("JSONからインスタンスを生成できる", () => {
  const json = {
    name: "api-reference",
    path: "docs/api/reference.md",
    type: "file",
    icon: "🔗",
    title: "APIリファレンス",
  }

  const node = DocTreeFileNodeValue.fromJson(json)

  expect(node.name).toBe("api-reference")
  expect(node.path).toBe("docs/api/reference.md")
  expect(node.icon).toBe("🔗")
  expect(node.title).toBe("APIリファレンス")
  expect(node.type).toBe("file")
})

test("異なるアイコンやタイトルでノードを作成できる", () => {
  const nodes = [
    new DocTreeFileNodeValue({
      name: "guide",
      path: "docs/guide.md",
      icon: "📖",
      title: "ガイド",
    }),
    new DocTreeFileNodeValue({
      name: "changelog",
      path: "changelog.md",
      icon: "📅",
      title: "変更履歴",
    }),
    new DocTreeFileNodeValue({
      name: "license",
      path: "license.md",
      icon: "📜",
      title: "ライセンス",
    }),
  ]

  expect(nodes[0].icon).toBe("📖")
  expect(nodes[1].icon).toBe("📅")
  expect(nodes[2].icon).toBe("📜")
})

test("パスに深いディレクトリ構造を持つファイルも作成できる", () => {
  const node = new DocTreeFileNodeValue({
    name: "deep-file",
    path: "docs/products/client/features/auth/login.md",
    icon: "🔐",
    title: "ログイン機能",
  })

  expect(node.path).toBe("docs/products/client/features/auth/login.md")
  expect(node.name).toBe("deep-file")
})

test("無効なJSONでエラーが発生する", () => {
  expect(() => {
    DocTreeFileNodeValue.fromJson({
      // nameが欠けている
      path: "test.md",
      type: "file",
      icon: "📄",
      title: "テスト",
    })
  }).toThrow()

  expect(() => {
    DocTreeFileNodeValue.fromJson({
      name: "test",
      // pathが欠けている
      type: "file",
      icon: "📄",
      title: "テスト",
    })
  }).toThrow()
})
