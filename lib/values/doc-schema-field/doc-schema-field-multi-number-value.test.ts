import { expect, test } from "bun:test"
import { DocSchemaFieldMultiNumberValue } from "./doc-schema-field-multi-number-value"

test("複数数値型フィールドの基本プロパティを取得できる", () => {
  const field = new DocSchemaFieldMultiNumberValue("scores", {
    type: "multi-number",
    required: true,
    title: "スコアリスト",
    description: "複数のスコア",
    default: [10, 20, 30],
  })

  expect(field.key).toBe("scores")
  expect(field.type).toBe("multi-number")
  expect(field.required).toBe(true)
  expect(field.title).toBe("スコアリスト")
  expect(field.description).toBe("複数のスコア")
  expect(field.default).toEqual([10, 20, 30])
})

test("型判定メソッドが正しく動作する", () => {
  const field = new DocSchemaFieldMultiNumberValue("values", {
    type: "multi-number",
    required: false,
    title: null,
    description: null,
    default: null,
  })

  expect(field.isArray).toBe(true)
  expect(field.isSingle).toBe(false)
  expect(field.isNumber).toBe(true)
})

test("値の検証メソッドが正しく動作する", () => {
  const field = new DocSchemaFieldMultiNumberValue("measurements", {
    type: "multi-number",
    required: true,
    title: null,
    description: null,
    default: null,
  })

  expect(field.validate([1, 2, 3])).toBe(true)
  expect(field.validate([])).toBe(true)
  expect(field.validate([0])).toBe(true)
  expect(field.validate([-1, -2, -3])).toBe(true)
  expect(field.validate([1.5, 2.5, 3.5])).toBe(true)

  expect(field.validate(123)).toBe(false)
  expect(field.validate(["1", "2", "3"])).toBe(false)
  expect(field.validate([1, "2", 3])).toBe(false)
  expect(field.validate([true, false])).toBe(false)
  expect(field.validate(null)).toBe(false)
  expect(field.validate(undefined)).toBe(false)
  expect(field.validate({})).toBe(false)
})

test("オプショナルなプロパティがundefinedでも動作する", () => {
  const field = new DocSchemaFieldMultiNumberValue("numbers", {
    type: "multi-number",
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
  const field = new DocSchemaFieldMultiNumberValue("coordinates", {
    type: "multi-number",
    required: false,
    title: "座標",
    description: null,
    default: [0, 0],
  })

  const json = field.toJson()
  expect(json).toEqual({
    type: "multi-number",
    required: false,
    title: "座標",
    description: null,
    default: [0, 0],
  })
})
