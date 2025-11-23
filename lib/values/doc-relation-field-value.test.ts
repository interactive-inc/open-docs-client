import { expect, test } from "bun:test"
import { DocRelationFieldValue } from "./doc-relation-field-value"

test("リレーションフィールドの基本プロパティを取得できる", () => {
  const field = new DocRelationFieldValue({
    fieldName: "author",
    filePath: "users/authors",
    isArray: false,
  })

  expect(field.fieldName).toBe("author")
  expect(field.relationPath).toBe("users/authors")
  expect(field.isArray).toBe(false)
  expect(field.isSingle).toBe(true)
  expect(field.isMultiple).toBe(false)
})

test("配列型のリレーションフィールドを作成できる", () => {
  const field = new DocRelationFieldValue({
    fieldName: "tags",
    filePath: "metadata/tags",
    isArray: true,
  })

  expect(field.isArray).toBe(true)
  expect(field.isSingle).toBe(false)
  expect(field.isMultiple).toBe(true)
})

test("ターゲットディレクトリ名を取得できる", () => {
  const field = new DocRelationFieldValue({
    fieldName: "category",
    filePath: "products/categories",
    isArray: false,
  })

  expect(field.targetDirectoryName).toBe("categories")
})

test("空のパスの場合、空のディレクトリ名を返す", () => {
  const field = new DocRelationFieldValue({
    fieldName: "empty",
    filePath: "",
    isArray: false,
  })

  expect(field.targetDirectoryName).toBe("")
})

test("完全なリレーションパスを生成できる", () => {
  const field = new DocRelationFieldValue({
    fieldName: "author",
    filePath: "users/authors",
    isArray: false,
  })

  expect(field.fullPath("/docs")).toBe("/docs/users/authors")
})

test("絶対パスの場合はそのまま返す", () => {
  const field = new DocRelationFieldValue({
    fieldName: "author",
    filePath: "/users/authors",
    isArray: false,
  })

  expect(field.fullPath("/docs")).toBe("/users/authors")
})

test("等価性を判定できる", () => {
  const field1 = new DocRelationFieldValue({
    fieldName: "author",
    filePath: "users/authors",
    isArray: false,
  })

  const field2 = new DocRelationFieldValue({
    fieldName: "author",
    filePath: "users/authors",
    isArray: false,
  })

  const field3 = new DocRelationFieldValue({
    fieldName: "author",
    filePath: "users/authors",
    isArray: true,
  })

  expect(field1.equals(field2)).toBe(true)
  expect(field1.equals(field3)).toBe(false)
})

test("fromメソッドでインスタンスを生成できる", () => {
  const field = DocRelationFieldValue.from({
    fieldName: "author",
    filePath: "users/authors",
    isArray: false,
  })

  expect(field.fieldName).toBe("author")
  expect(field.relationPath).toBe("users/authors")
})

test("fromPropsメソッドでインスタンスを生成できる", () => {
  const field = DocRelationFieldValue.fromProps({
    fieldName: "tags",
    filePath: "metadata/tags",
    isArray: true,
  })

  expect(field.fieldName).toBe("tags")
  expect(field.isArray).toBe(true)
})

test("JSON形式に変換できる", () => {
  const field = new DocRelationFieldValue({
    fieldName: "author",
    filePath: "users/authors",
    isArray: false,
  })

  const json = field.toJson()
  expect(json).toEqual({
    fieldName: "author",
    filePath: "users/authors",
    isArray: false,
  })
})

test("無効なデータでエラーが発生する", () => {
  expect(() => {
    new DocRelationFieldValue({
      fieldName: "",
      filePath: "users/authors",
      isArray: "not-boolean" as never,
    })
  }).toThrow()
})
