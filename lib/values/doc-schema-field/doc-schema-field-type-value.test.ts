import { expect, test } from "bun:test"
import { DocSchemaFieldTypeValue } from "./doc-schema-field-type-value"

test("各種フィールドタイプを正しく判定できる", () => {
  const textType = new DocSchemaFieldTypeValue("text")
  expect(textType.isText).toBe(true)
  expect(textType.isNumber).toBe(false)
  expect(textType.isBoolean).toBe(false)
  expect(textType.isSelect).toBe(false)
  expect(textType.isRelation).toBe(false)

  const numberType = new DocSchemaFieldTypeValue("number")
  expect(numberType.isNumber).toBe(true)
  expect(numberType.isText).toBe(false)

  const booleanType = new DocSchemaFieldTypeValue("boolean")
  expect(booleanType.isBoolean).toBe(true)
  expect(booleanType.isText).toBe(false)
})

test("選択型を正しく判定できる", () => {
  const selectText = new DocSchemaFieldTypeValue("select-text")
  expect(selectText.isSelect).toBe(true)
  expect(selectText.isText).toBe(false)

  const selectNumber = new DocSchemaFieldTypeValue("select-number")
  expect(selectNumber.isSelect).toBe(true)
  expect(selectNumber.isNumber).toBe(false)
})

test("リレーション型を正しく判定できる", () => {
  const relation = new DocSchemaFieldTypeValue("relation")
  expect(relation.isRelation).toBe(true)
  expect(relation.isArray).toBe(false)

  const multiRelation = new DocSchemaFieldTypeValue("multi-relation")
  expect(multiRelation.isRelation).toBe(true)
  expect(multiRelation.isArray).toBe(true)
})

test("配列型を正しく判定できる", () => {
  const multiText = new DocSchemaFieldTypeValue("multi-text")
  expect(multiText.isArray).toBe(true)
  expect(multiText.isSingle).toBe(false)

  const multiNumber = new DocSchemaFieldTypeValue("multi-number")
  expect(multiNumber.isArray).toBe(true)

  const multiSelectText = new DocSchemaFieldTypeValue("multi-select-text")
  expect(multiSelectText.isArray).toBe(true)

  const multiSelectNumber = new DocSchemaFieldTypeValue("multi-select-number")
  expect(multiSelectNumber.isArray).toBe(true)
})

test("単一値型を正しく判定できる", () => {
  const text = new DocSchemaFieldTypeValue("text")
  expect(text.isSingle).toBe(true)
  expect(text.isArray).toBe(false)

  const number = new DocSchemaFieldTypeValue("number")
  expect(number.isSingle).toBe(true)
})

test("基本型を正しく取得できる", () => {
  expect(new DocSchemaFieldTypeValue("multi-text").baseType).toBe("text")
  expect(new DocSchemaFieldTypeValue("multi-number").baseType).toBe("number")
  expect(new DocSchemaFieldTypeValue("select-text").baseType).toBe("text")
  expect(new DocSchemaFieldTypeValue("select-number").baseType).toBe("number")
  expect(new DocSchemaFieldTypeValue("text").baseType).toBe("text")
  expect(new DocSchemaFieldTypeValue("relation").baseType).toBe("relation")
})

test("デフォルト値を正しく取得できる", () => {
  expect(new DocSchemaFieldTypeValue("text").getDefaultValue()).toBe("")
  expect(new DocSchemaFieldTypeValue("number").getDefaultValue()).toBe(0)
  expect(new DocSchemaFieldTypeValue("boolean").getDefaultValue()).toBe(false)
  expect(new DocSchemaFieldTypeValue("relation").getDefaultValue()).toBe("")
  expect(new DocSchemaFieldTypeValue("multi-text").getDefaultValue()).toEqual(
    [],
  )
  expect(new DocSchemaFieldTypeValue("multi-number").getDefaultValue()).toEqual(
    [],
  )
})

test("値の検証が正しく動作する", () => {
  const textType = new DocSchemaFieldTypeValue("text")
  expect(textType.validateValue("hello")).toBe(true)
  expect(textType.validateValue(123)).toBe(false)

  const numberType = new DocSchemaFieldTypeValue("number")
  expect(numberType.validateValue(123)).toBe(true)
  expect(numberType.validateValue("123")).toBe(false)

  const booleanType = new DocSchemaFieldTypeValue("boolean")
  expect(booleanType.validateValue(true)).toBe(true)
  expect(booleanType.validateValue(1)).toBe(false)

  const multiTextType = new DocSchemaFieldTypeValue("multi-text")
  expect(multiTextType.validateValue(["a", "b"])).toBe(true)
  expect(multiTextType.validateValue([1, 2])).toBe(false)
  expect(multiTextType.validateValue("not array")).toBe(false)

  const multiNumberType = new DocSchemaFieldTypeValue("multi-number")
  expect(multiNumberType.validateValue([1, 2, 3])).toBe(true)
  expect(multiNumberType.validateValue(["1", "2"])).toBe(false)
})

test("fromメソッドでインスタンスを生成できる", () => {
  const type = DocSchemaFieldTypeValue.from("text")
  expect(type.type).toBe("text")
  expect(type.isText).toBe(true)
})

test("JSON形式に変換できる", () => {
  const type = new DocSchemaFieldTypeValue("multi-relation")
  expect(type.toJson()).toBe("multi-relation")
})

test("無効なタイプでエラーが発生する", () => {
  expect(() => {
    new DocSchemaFieldTypeValue("invalid-type" as never)
  }).toThrow()
})
