import { expect, test } from "bun:test"
import { DocSchemaFieldTextValue } from "./doc-schema-field-text-value"

test("単一テキスト型フィールドの基本プロパティを取得できる", () => {
  const field = new DocSchemaFieldTextValue("title", {
    type: "text",
    required: true,
    title: "タイトル",
    description: "記事のタイトル",
    default: "無題",
  })

  expect(field.key).toBe("title")
  expect(field.type).toBe("text")
  expect(field.required).toBe(true)
  expect(field.title).toBe("タイトル")
  expect(field.description).toBe("記事のタイトル")
  expect(field.default).toBe("無題")
})

test("型判定メソッドが正しく動作する", () => {
  const field = new DocSchemaFieldTextValue("name", {
    type: "text",
    required: false,
    title: null,
    description: null,
    default: null,
  })

  expect(field.isArray).toBe(false)
  expect(field.isSingle).toBe(true)
  expect(field.isText).toBe(true)
})

test("値の検証メソッドが正しく動作する", () => {
  const field = new DocSchemaFieldTextValue("description", {
    type: "text",
    required: true,
    title: null,
    description: null,
    default: null,
  })

  expect(field.validate("テキスト")).toBe(true)
  expect(field.validate("")).toBe(true)
  expect(field.validate("123")).toBe(true)

  expect(field.validate(123)).toBe(false)
  expect(field.validate(true)).toBe(false)
  expect(field.validate(null)).toBe(false)
  expect(field.validate(undefined)).toBe(false)
  expect(field.validate([])).toBe(false)
  expect(field.validate({})).toBe(false)
})

test("オプショナルなプロパティがundefinedでも動作する", () => {
  const field = new DocSchemaFieldTextValue("note", {
    type: "text",
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
  const field = new DocSchemaFieldTextValue("author", {
    type: "text",
    required: false,
    title: "著者名",
    description: null,
    default: "匿名",
  })

  const json = field.toJson()
  expect(json).toEqual({
    type: "text",
    required: false,
    title: "著者名",
    description: null,
    default: "匿名",
  })
})
