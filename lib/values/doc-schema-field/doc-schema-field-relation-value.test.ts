import { expect, test } from "bun:test"
import { DocSchemaFieldRelationValue } from "./doc-schema-field-relation-value"

test("単一リレーション型フィールドの基本プロパティを取得できる", () => {
  const field = new DocSchemaFieldRelationValue("author", {
    type: "relation",
    required: true,
    title: "著者",
    description: "記事の著者",
    default: "tanaka",
    path: "users/authors",
  })

  expect(field.key).toBe("author")
  expect(field.type).toBe("relation")
  expect(field.required).toBe(true)
  expect(field.title).toBe("著者")
  expect(field.description).toBe("記事の著者")
  expect(field.default).toBe("tanaka")
  expect(field.path).toBe("users/authors")
})

test("型判定メソッドが正しく動作する", () => {
  const field = new DocSchemaFieldRelationValue("category", {
    type: "relation",
    required: false,
    title: null,
    description: null,
    path: "categories",
    default: null,
  })

  expect(field.isArray).toBe(false)
  expect(field.isSingle).toBe(true)
  expect(field.isRelation).toBe(true)
})

test("値の検証メソッドが正しく動作する", () => {
  const field = new DocSchemaFieldRelationValue("milestone", {
    type: "relation",
    required: true,
    title: null,
    description: null,
    path: "milestones",
    default: null,
  })

  expect(field.validate("2024-01")).toBe(true)
  expect(field.validate("")).toBe(true)
  expect(field.validate("user-123")).toBe(true)

  expect(field.validate(123)).toBe(false)
  expect(field.validate(true)).toBe(false)
  expect(field.validate(null)).toBe(false)
  expect(field.validate(undefined)).toBe(false)
  expect(field.validate([])).toBe(false)
  expect(field.validate({})).toBe(false)
})

test("オプショナルなプロパティがundefinedでも動作する", () => {
  const field = new DocSchemaFieldRelationValue("reference", {
    type: "relation",
    required: true,
    path: "references",
    title: null,
    description: null,
    default: null,
  })

  expect(field.title).toBe("")
  expect(field.description).toBe("")
  expect(field.default).toBeNull()
})

test("JSON形式に変換できる", () => {
  const field = new DocSchemaFieldRelationValue("parent", {
    type: "relation",
    required: false,
    title: "親カテゴリ",
    description: null,
    path: "categories/parent",
    default: null,
  })

  const json = field.toJson()
  expect(json).toEqual({
    type: "relation",
    required: false,
    title: "親カテゴリ",
    description: null,
    path: "categories/parent",
    default: null,
  })
})
