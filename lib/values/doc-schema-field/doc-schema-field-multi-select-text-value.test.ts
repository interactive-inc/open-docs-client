import { expect, test } from "bun:test"
import { DocSchemaFieldMultiSelectTextValue } from "./doc-schema-field-multi-select-text-value"

test("複数選択テキスト型フィールドの基本プロパティを取得できる", () => {
  const field = new DocSchemaFieldMultiSelectTextValue("tags", {
    type: "multi-select-text",
    required: true,
    title: "タグ",
    description: "記事のタグ",
    default: ["tech", "news"],
    options: ["tech", "news", "opinion", "tutorial"],
  })

  expect(field.key).toBe("tags")
  expect(field.type).toBe("multi-select-text")
  expect(field.required).toBe(true)
  expect(field.title).toBe("タグ")
  expect(field.description).toBe("記事のタグ")
  expect(field.default).toEqual(["tech", "news"])
  expect(field.options).toEqual(["tech", "news", "opinion", "tutorial"])
})

test("型判定メソッドが正しく動作する", () => {
  const field = new DocSchemaFieldMultiSelectTextValue("categories", {
    type: "multi-select-text",
    required: false,
    title: null,
    description: null,
    options: ["A", "B", "C"],
    default: null,
  })

  expect(field.isArray).toBe(true)
  expect(field.isSingle).toBe(false)
  expect(field.isSelect).toBe(true)
  expect(field.isTextSelect).toBe(true)
})

test("値の検証メソッドが正しく動作する", () => {
  const field = new DocSchemaFieldMultiSelectTextValue("skills", {
    type: "multi-select-text",
    required: true,
    title: null,
    description: null,
    options: ["JavaScript", "TypeScript", "React"],
    default: null,
  })

  expect(field.validate(["JavaScript", "React"])).toBe(true)
  expect(field.validate([])).toBe(true)
  expect(field.validate(["JavaScript"])).toBe(true)

  expect(field.validate("JavaScript")).toBe(false)
  expect(field.validate([123, 456])).toBe(false)
  expect(field.validate(["JavaScript", 123])).toBe(false)
  expect(field.validate(null)).toBe(false)
  expect(field.validate(undefined)).toBe(false)
  expect(field.validate({})).toBe(false)
})

test("オプショナルなプロパティがundefinedでも動作する", () => {
  const field = new DocSchemaFieldMultiSelectTextValue("items", {
    type: "multi-select-text",
    required: true,
    options: ["X", "Y", "Z"],
    title: null,
    description: null,
    default: null,
  })

  expect(field.title).toBe("")
  expect(field.description).toBe("")
  expect(field.default).toBeNull()
})

test("JSON形式に変換できる", () => {
  const field = new DocSchemaFieldMultiSelectTextValue("permissions", {
    type: "multi-select-text",
    required: false,
    title: "権限",
    description: null,
    default: ["read"],
    options: ["read", "write", "delete"],
  })

  const json = field.toJson()
  expect(json).toEqual({
    type: "multi-select-text",
    required: false,
    title: "権限",
    description: null,
    default: ["read"],
    options: ["read", "write", "delete"],
  })
})
