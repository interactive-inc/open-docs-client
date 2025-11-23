import { expect, test } from "bun:test"
import { DocSchemaFieldMultiTextValue } from "./doc-schema-field-multi-text-value"

test("複数テキスト型フィールドの基本プロパティを取得できる", () => {
  const field = new DocSchemaFieldMultiTextValue("tags", {
    type: "multi-text",
    required: true,
    title: "タグ",
    description: "記事のタグリスト",
    default: ["技術", "プログラミング"],
  })

  expect(field.key).toBe("tags")
  expect(field.type).toBe("multi-text")
  expect(field.required).toBe(true)
  expect(field.title).toBe("タグ")
  expect(field.description).toBe("記事のタグリスト")
  expect(field.default).toEqual(["技術", "プログラミング"])
})

test("型判定メソッドが正しく動作する", () => {
  const field = new DocSchemaFieldMultiTextValue("keywords", {
    type: "multi-text",
    required: false,
    title: null,
    description: null,
    default: null,
  })

  expect(field.isArray).toBe(true)
  expect(field.isSingle).toBe(false)
  expect(field.isText).toBe(true)
})

test("値の検証メソッドが正しく動作する", () => {
  const field = new DocSchemaFieldMultiTextValue("categories", {
    type: "multi-text",
    required: true,
    title: null,
    description: null,
    default: null,
  })

  expect(field.validate(["テキスト1", "テキスト2"])).toBe(true)
  expect(field.validate([])).toBe(true)
  expect(field.validate([""])).toBe(true)
  expect(field.validate(["123", "456"])).toBe(true)

  expect(field.validate("テキスト")).toBe(false)
  expect(field.validate([123, 456])).toBe(false)
  expect(field.validate([true, false])).toBe(false)
  expect(field.validate(["valid", 123])).toBe(false)
  expect(field.validate(null)).toBe(false)
  expect(field.validate(undefined)).toBe(false)
  expect(field.validate({})).toBe(false)
})

test("オプショナルなプロパティがundefinedでも動作する", () => {
  const field = new DocSchemaFieldMultiTextValue("items", {
    type: "multi-text",
    required: true,
    title: null,
    description: null,
    default: null,
  })

  expect(field.title).toBe("")
  expect(field.description).toBe("")
  expect(field.default).toBe(null)
})

test("JSON形式に変換できる", () => {
  const field = new DocSchemaFieldMultiTextValue("authors", {
    type: "multi-text",
    required: false,
    title: "著者リスト",
    description: null,
    default: ["田中", "鈴木"],
  })

  const json = field.toJson()
  expect(json).toEqual({
    type: "multi-text",
    required: false,
    title: "著者リスト",
    description: null,
    default: ["田中", "鈴木"],
  })
})
