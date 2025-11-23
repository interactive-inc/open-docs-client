import { expect, test } from "bun:test"
import { DocSchemaFieldMultiSelectNumberValue } from "./doc-schema-field-multi-select-number-value"

test("複数選択数値型フィールドの基本プロパティを取得できる", () => {
  const field = new DocSchemaFieldMultiSelectNumberValue("sizes", {
    type: "multi-select-number",
    required: true,
    title: "サイズ",
    description: "利用可能なサイズ",
    default: [100, 200],
    options: [100, 200, 300, 400, 500],
  })

  expect(field.key).toBe("sizes")
  expect(field.type).toBe("multi-select-number")
  expect(field.required).toBe(true)
  expect(field.title).toBe("サイズ")
  expect(field.description).toBe("利用可能なサイズ")
  expect(field.default).toEqual([100, 200])
  expect(field.options).toEqual([100, 200, 300, 400, 500])
})

test("型判定メソッドが正しく動作する", () => {
  const field = new DocSchemaFieldMultiSelectNumberValue("years", {
    type: "multi-select-number",
    required: false,
    title: null,
    description: null,
    options: [2020, 2021, 2022, 2023],
    default: null,
  })

  expect(field.isArray).toBe(true)
  expect(field.isSingle).toBe(false)
  expect(field.isSelect).toBe(true)
  expect(field.isNumberSelect).toBe(true)
})

test("値の検証メソッドが正しく動作する", () => {
  const field = new DocSchemaFieldMultiSelectNumberValue("scores", {
    type: "multi-select-number",
    required: true,
    title: null,
    description: null,
    options: [0, 50, 100],
    default: null,
  })

  expect(field.validate([0, 50, 100])).toBe(true)
  expect(field.validate([])).toBe(true)
  expect(field.validate([50])).toBe(true)

  expect(field.validate(50)).toBe(false)
  expect(field.validate(["50", "100"])).toBe(false)
  expect(field.validate([50, "100"])).toBe(false)
  expect(field.validate(null)).toBe(false)
  expect(field.validate(undefined)).toBe(false)
  expect(field.validate({})).toBe(false)
})

test("オプショナルなプロパティがundefinedでも動作する", () => {
  const field = new DocSchemaFieldMultiSelectNumberValue("values", {
    type: "multi-select-number",
    required: true,
    options: [10, 20, 30],
    title: null,
    description: null,
    default: null,
  })

  expect(field.title).toBe("")
  expect(field.description).toBe("")
  expect(field.default).toBeNull()
})

test("JSON形式に変換できる", () => {
  const field = new DocSchemaFieldMultiSelectNumberValue("percentages", {
    type: "multi-select-number",
    required: false,
    title: "割合",
    description: null,
    default: [25, 75],
    options: [0, 25, 50, 75, 100],
  })

  const json = field.toJson()
  expect(json).toEqual({
    type: "multi-select-number",
    required: false,
    title: "割合",
    description: null,
    default: [25, 75],
    options: [0, 25, 50, 75, 100],
  })
})
