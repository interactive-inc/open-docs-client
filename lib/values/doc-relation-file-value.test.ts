import { expect, test } from "bun:test"
import { DocRelationFileValue } from "./doc-relation-file-value"

test("リレーションファイルの基本プロパティを取得できる", () => {
  const file = new DocRelationFileValue({
    name: "user-001",
    label: "田中太郎",
    value: null,
    path: null,
  })

  expect(file.id).toBe("user-001")
  expect(file.slug).toBe("user-001")
  expect(file.label).toBe("田中太郎")
})

test("ラベルが未指定の場合はnameを使用する", () => {
  const file = new DocRelationFileValue({
    name: "category-tech",
    label: null,
    value: null,
    path: null,
  })

  expect(file.label).toBe("category-tech")
})

test("fromメソッドでファイルパスとタイトルから生成できる", () => {
  const file = DocRelationFileValue.from("docs/users/tanaka.md", "田中太郎")

  expect(file.id).toBe("tanaka")
  expect(file.label).toBe("田中太郎")
})

test("fromメソッドでタイトルがnullの場合はファイル名を使用する", () => {
  const file = DocRelationFileValue.from("docs/categories/technology.md", null)

  expect(file.id).toBe("technology")
  expect(file.label).toBe("technology")
})

test("深いディレクトリ構造からもファイル名を抽出できる", () => {
  const file = DocRelationFileValue.from(
    "docs/products/client/features/login.md",
    "ログイン機能",
  )

  expect(file.id).toBe("login")
  expect(file.label).toBe("ログイン機能")
})

test("拡張子なしのファイルパスも処理できる", () => {
  const file = DocRelationFileValue.from("docs/users/admin", "管理者")

  expect(file.id).toBe("admin")
  expect(file.label).toBe("管理者")
})

test("ファイル名のみのパスも処理できる", () => {
  const file = DocRelationFileValue.from("config.md", "設定")

  expect(file.id).toBe("config")
  expect(file.label).toBe("設定")
})

test("空のファイルパスの場合は元のパスを返す", () => {
  const file = DocRelationFileValue.from("", "ラベル")

  expect(file.id).toBe("")
  expect(file.label).toBe("ラベル")
})

test("JSON形式に変換できる", () => {
  const file = new DocRelationFileValue({
    name: "feature-001",
    label: "ログイン機能",
    value: null,
    path: null,
  })

  const json = file.toJson()
  expect(json).toEqual({
    name: "feature-001",
    label: "ログイン機能",
    value: null,
    path: null,
  })
})

test("無効なデータでエラーが発生する", () => {
  expect(() => {
    new DocRelationFileValue({
      name: 123 as never,
      label: "ラベル",
      value: null,
      path: null,
    })
  }).toThrow()
})
