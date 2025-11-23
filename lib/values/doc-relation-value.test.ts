import { expect, test } from "bun:test"
import { DocRelationFileValue } from "./doc-relation-file-value"
import { DocRelationValue } from "./doc-relation-value"

test("リレーションの基本プロパティを取得できる", () => {
  const relation = new DocRelationValue({
    path: "users/authors",
    files: [
      { name: "tanaka", label: "田中太郎", value: null, path: null },
      { name: "suzuki", label: "鈴木次郎", value: null, path: null },
    ],
  })

  expect(relation.path).toBe("users/authors")
  expect(relation.fileCount).toBe(2)
  expect(relation.isEmpty).toBe(false)
})

test("リレーションファイルを値オブジェクトとして取得できる", () => {
  const relation = new DocRelationValue({
    path: "categories",
    files: [
      { name: "tech", label: "技術", value: null, path: null },
      { name: "business", label: "ビジネス", value: null, path: null },
    ],
  })

  const files = relation.files()
  expect(files.length).toBe(2)
  expect(files[0]).toBeInstanceOf(DocRelationFileValue)
  expect(files[0].id).toBe("tech")
  expect(files[0].label).toBe("技術")
})

test("空のリレーションを作成できる", () => {
  const relation = DocRelationValue.empty("users/admins")

  expect(relation.path).toBe("users/admins")
  expect(relation.files()).toEqual([])
  expect(relation.fileCount).toBe(0)
  expect(relation.isEmpty).toBe(true)
})

test("JSON形式に変換できる", () => {
  const relation = new DocRelationValue({
    path: "tags",
    files: [
      { name: "javascript", label: "JavaScript", value: null, path: null },
      { name: "typescript", label: "TypeScript", value: null, path: null },
    ],
  })

  const json = relation.toJson()
  expect(json).toEqual({
    path: "tags",
    files: [
      { name: "javascript", label: "JavaScript", value: null, path: null },
      { name: "typescript", label: "TypeScript", value: null, path: null },
    ],
  })
})

test("ラベルが未定義のファイルも処理できる", () => {
  const relation = new DocRelationValue({
    path: "milestones",
    files: [
      { name: "2024-01", label: null, value: null, path: null },
      { name: "2024-02", label: "2024年2月", value: null, path: null },
    ],
  })

  const files = relation.files()
  expect(files[0].label).toBe("2024-01")
  expect(files[1].label).toBe("2024年2月")
})

test("無効なデータでエラーが発生する", () => {
  expect(() => {
    new DocRelationValue({
      path: "invalid",
      files: "not-an-array" as never,
    })
  }).toThrow()

  expect(() => {
    new DocRelationValue({
      path: 123 as never,
      files: [],
    })
  }).toThrow()
})

test("ファイルデータが無効な場合もエラーが発生する", () => {
  expect(() => {
    new DocRelationValue({
      path: "users",
      files: [
        { name: 123 as never, label: "Invalid", value: null, path: null },
      ],
    })
  }).toThrow()
})
