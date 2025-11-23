import { expect, test } from "bun:test"
import { DocSchemaFieldSelectTextValue } from "./doc-schema-field-select-text-value"

test("単一選択テキスト型フィールドの基本プロパティを取得できる", () => {
  const field = new DocSchemaFieldSelectTextValue("status", {
    type: "select-text",
    required: true,
    title: "ステータス",
    description: "記事の状態",
    default: "draft",
    options: ["draft", "published", "archived"],
  })

  expect(field.key).toBe("status")
  expect(field.type).toBe("select-text")
  expect(field.required).toBe(true)
  expect(field.title).toBe("ステータス")
  expect(field.description).toBe("記事の状態")
  expect(field.default).toBe("draft")
  expect(field.options).toEqual(["draft", "published", "archived"])
})

test("型判定メソッドが正しく動作する", () => {
  const field = new DocSchemaFieldSelectTextValue("category", {
    type: "select-text",
    required: false,
    title: null,
    description: null,
    options: ["tech", "business", "lifestyle"],
    default: null,
  })

  expect(field.isArray).toBe(false)
  expect(field.isSingle).toBe(true)
  expect(field.isSelect).toBe(true)
  expect(field.isTextSelect).toBe(true)
})

test("値の検証メソッドが正しく動作する", () => {
  const field = new DocSchemaFieldSelectTextValue("priority", {
    type: "select-text",
    required: true,
    title: null,
    description: null,
    options: ["low", "medium", "high"],
    default: null,
  })

  expect(field.validate("low")).toBe(true)
  expect(field.validate("medium")).toBe(true)
  expect(field.validate("high")).toBe(true)
  expect(field.validate("")).toBe(true)

  expect(field.validate(123)).toBe(false)
  expect(field.validate(true)).toBe(false)
  expect(field.validate(null)).toBe(false)
  expect(field.validate(undefined)).toBe(false)
  expect(field.validate([])).toBe(false)
  expect(field.validate({})).toBe(false)
})

test("オプショナルなプロパティがundefinedでも動作する", () => {
  const field = new DocSchemaFieldSelectTextValue("type", {
    type: "select-text",
    required: true,
    options: ["A", "B", "C"],
    title: null,
    description: null,
    default: null,
  })

  expect(field.title).toBe("")
  expect(field.description).toBe("")
  expect(field.default).toBeNull()
})

test("空のオプション配列でも動作する", () => {
  const field = new DocSchemaFieldSelectTextValue("empty", {
    type: "select-text",
    required: false,
    title: null,
    description: null,
    options: [],
    default: null,
  })

  expect(field.options).toEqual([])
})

test("JSON形式に変換できる", () => {
  const field = new DocSchemaFieldSelectTextValue("role", {
    type: "select-text",
    required: false,
    title: "役割",
    description: null,
    default: "user",
    options: ["admin", "user", "guest"],
  })

  const json = field.toJson()
  expect(json).toEqual({
    type: "select-text",
    required: false,
    title: "役割",
    description: null,
    default: "user",
    options: ["admin", "user", "guest"],
  })
})
