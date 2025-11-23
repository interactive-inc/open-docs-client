import { expect, test } from "bun:test"
import { DocSchemaFieldSelectNumberValue } from "./doc-schema-field-select-number-value"

test("単一選択数値型フィールドの基本プロパティを取得できる", () => {
  const field = new DocSchemaFieldSelectNumberValue("priority", {
    type: "select-number",
    required: true,
    title: "優先度",
    description: "タスクの優先度",
    default: 1,
    options: [1, 2, 3, 4, 5],
  })

  expect(field.key).toBe("priority")
  expect(field.type).toBe("select-number")
  expect(field.required).toBe(true)
  expect(field.title).toBe("優先度")
  expect(field.description).toBe("タスクの優先度")
  expect(field.default).toBe(1)
  expect(field.options).toEqual([1, 2, 3, 4, 5])
})

test("型判定メソッドが正しく動作する", () => {
  const field = new DocSchemaFieldSelectNumberValue("rating", {
    type: "select-number",
    required: false,
    title: null,
    description: null,
    options: [0, 25, 50, 75, 100],
    default: null,
  })

  expect(field.isArray).toBe(false)
  expect(field.isSingle).toBe(true)
  expect(field.isSelect).toBe(true)
  expect(field.isNumberSelect).toBe(true)
})

test("値の検証メソッドが正しく動作する", () => {
  const field = new DocSchemaFieldSelectNumberValue("score", {
    type: "select-number",
    required: true,
    title: null,
    description: null,
    options: [10, 20, 30],
    default: null,
  })

  expect(field.validate(10)).toBe(true)
  expect(field.validate(20)).toBe(true)
  expect(field.validate(0)).toBe(true)
  expect(field.validate(-5)).toBe(true)

  expect(field.validate("10")).toBe(false)
  expect(field.validate(true)).toBe(false)
  expect(field.validate(null)).toBe(false)
  expect(field.validate(undefined)).toBe(false)
  expect(field.validate([])).toBe(false)
  expect(field.validate({})).toBe(false)
})

test("オプショナルなプロパティがundefinedでも動作する", () => {
  const field = new DocSchemaFieldSelectNumberValue("level", {
    type: "select-number",
    required: true,
    options: [1, 2, 3],
    title: null,
    description: null,
    default: null,
  })

  expect(field.title).toBe("")
  expect(field.description).toBe("")
  expect(field.default).toBeNull()
})

test("空のオプション配列でも動作する", () => {
  const field = new DocSchemaFieldSelectNumberValue("empty", {
    type: "select-number",
    required: false,
    title: null,
    description: null,
    options: [],
    default: null,
  })

  expect(field.options).toEqual([])
})

test("JSON形式に変換できる", () => {
  const field = new DocSchemaFieldSelectNumberValue("month", {
    type: "select-number",
    required: false,
    title: "月",
    description: null,
    default: 1,
    options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  })

  const json = field.toJson()
  expect(json).toEqual({
    type: "select-number",
    required: false,
    title: "月",
    description: null,
    default: 1,
    options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  })
})
