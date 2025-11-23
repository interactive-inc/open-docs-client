import { expect, test } from "bun:test"
import { DocSchemaFieldMultiRelationValue } from "./doc-schema-field-multi-relation-value"

test("複数リレーション型フィールドの基本プロパティを取得できる", () => {
  const field = new DocSchemaFieldMultiRelationValue("tags", {
    type: "multi-relation",
    required: true,
    title: "タグ",
    description: "記事のタグ",
    default: ["tech", "news"],
    path: "metadata/tags",
  })

  expect(field.key).toBe("tags")
  expect(field.type).toBe("multi-relation")
  expect(field.required).toBe(true)
  expect(field.title).toBe("タグ")
  expect(field.description).toBe("記事のタグ")
  expect(field.default).toEqual(["tech", "news"])
  expect(field.path).toBe("metadata/tags")
})

test("型判定メソッドが正しく動作する", () => {
  const field = new DocSchemaFieldMultiRelationValue("authors", {
    type: "multi-relation",
    required: false,
    title: null,
    description: null,
    path: "users/authors",
    default: null,
  })

  expect(field.isArray).toBe(true)
  expect(field.isSingle).toBe(false)
  expect(field.isRelation).toBe(true)
})

test("値の検証メソッドが正しく動作する", () => {
  const field = new DocSchemaFieldMultiRelationValue("members", {
    type: "multi-relation",
    required: true,
    title: null,
    description: null,
    path: "users/members",
    default: null,
  })

  expect(field.validate(["user1", "user2"])).toBe(true)
  expect(field.validate([])).toBe(true)
  expect(field.validate(["single"])).toBe(true)

  expect(field.validate("string")).toBe(false)
  expect(field.validate([123, 456])).toBe(false)
  expect(field.validate(["valid", 123])).toBe(false)
  expect(field.validate(null)).toBe(false)
  expect(field.validate(undefined)).toBe(false)
  expect(field.validate({})).toBe(false)
})

test("オプショナルなプロパティがundefinedでも動作する", () => {
  const field = new DocSchemaFieldMultiRelationValue("related", {
    type: "multi-relation",
    required: true,
    path: "related",
    title: null,
    description: null,
    default: null,
  })

  expect(field.title).toBe("")
  expect(field.description).toBe("")
  expect(field.default).toBeNull()
})

test("JSON形式に変換できる", () => {
  const field = new DocSchemaFieldMultiRelationValue("categories", {
    type: "multi-relation",
    required: false,
    title: "カテゴリ",
    description: null,
    default: ["tech"],
    path: "metadata/categories",
  })

  const json = field.toJson()
  expect(json).toEqual({
    type: "multi-relation",
    required: false,
    title: "カテゴリ",
    description: null,
    default: ["tech"],
    path: "metadata/categories",
  })
})
