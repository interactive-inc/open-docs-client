import { expect, test } from "bun:test"
import { DocSchemaFieldBooleanValue } from "./doc-schema-field-boolean-value"

test("単一ブール型フィールドの基本プロパティを取得できる", () => {
  const field = new DocSchemaFieldBooleanValue("isPublished", {
    type: "boolean",
    required: true,
    title: "公開状態",
    description: "記事が公開されているかどうか",
    default: false,
  })

  expect(field.key).toBe("isPublished")
  expect(field.type).toBe("boolean")
  expect(field.required).toBe(true)
  expect(field.title).toBe("公開状態")
  expect(field.description).toBe("記事が公開されているかどうか")
  expect(field.default).toBe(false)
})

test("配列判定メソッドが正しく動作する", () => {
  const field = new DocSchemaFieldBooleanValue("active", {
    type: "boolean",
    required: false,
    title: null,
    description: null,
    default: null,
  })

  expect(field.isArray).toBe(false)
  expect(field.isSingle).toBe(true)
  expect(field.isBoolean).toBe(true)
})

test("オプショナルなプロパティがundefinedでも動作する", () => {
  const field = new DocSchemaFieldBooleanValue("flag", {
    type: "boolean",
    required: true,
    title: null,
    description: null,
    default: null,
  })

  expect(field.title).toBe("")
  expect(field.description).toBe("")
  expect(field.default).toBe(null)
})

test("値の検証メソッドが正しく動作する", () => {
  const field = new DocSchemaFieldBooleanValue("enabled", {
    type: "boolean",
    required: true,
    title: null,
    description: null,
    default: null,
  })

  expect(field.validate(true)).toBe(true)
  expect(field.validate(false)).toBe(true)
  expect(field.validate("true")).toBe(false)
  expect(field.validate(1)).toBe(false)
  expect(field.validate(null)).toBe(false)
  expect(field.validate(undefined)).toBe(false)
})

test("JSON形式に変換できる", () => {
  const field = new DocSchemaFieldBooleanValue("featured", {
    type: "boolean",
    required: false,
    title: "注目記事",
    description: null,
    default: false,
  })

  const json = field.toJson()
  expect(json).toEqual({
    type: "boolean",
    required: false,
    title: "注目記事",
    description: null,
    default: false,
  })
})
