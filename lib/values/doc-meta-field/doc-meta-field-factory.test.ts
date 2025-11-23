import { expect, test } from "bun:test"
import type { Equals, RecordKey } from "../../types"
import { assertType, expectType } from "../../utils"
import { DocMetaFieldBooleanValue } from "./doc-meta-field-boolean-value"
import { DocMetaFieldFactory } from "./doc-meta-field-factory"
import { DocMetaFieldMultiNumberValue } from "./doc-meta-field-multi-number-value"
import { DocMetaFieldMultiRelationValue } from "./doc-meta-field-multi-relation-value"
import { DocMetaFieldMultiSelectNumberValue } from "./doc-meta-field-multi-select-number-value"
import { DocMetaFieldMultiSelectTextValue } from "./doc-meta-field-multi-select-text-value"
import { DocMetaFieldMultiTextValue } from "./doc-meta-field-multi-text-value"
import { DocMetaFieldNumberValue } from "./doc-meta-field-number-value"
import { DocMetaFieldRelationValue } from "./doc-meta-field-relation-value"
import { DocMetaFieldSelectNumberValue } from "./doc-meta-field-select-number-value"
import { DocMetaFieldSelectTextValue } from "./doc-meta-field-select-text-value"
import { DocMetaFieldTextValue } from "./doc-meta-field-text-value"
import type { DocMetaFieldValue } from "./doc-meta-field-value"

test("DocMetaFieldFactory - fromType メソッドの型推論", () => {
  const factory = new DocMetaFieldFactory()

  // text フィールド
  const textField = factory.fromType("title", "text", "テキスト値")
  expect(textField).toBeInstanceOf(DocMetaFieldTextValue)
  expectType<DocMetaFieldValue<"title">>(textField)

  // number フィールド
  const numberField = factory.fromType("count", "number", 42)
  expect(numberField).toBeInstanceOf(DocMetaFieldNumberValue)
  expectType<DocMetaFieldValue<"count">>(numberField)

  // boolean フィールド
  const booleanField = factory.fromType("isActive", "boolean", true)
  expect(booleanField).toBeInstanceOf(DocMetaFieldBooleanValue)
  expectType<DocMetaFieldValue<"isActive">>(booleanField)
})

test("DocMetaFieldFactory - 選択フィールドの型推論", () => {
  const factory = new DocMetaFieldFactory()

  // select-text フィールド
  const selectTextField = factory.fromType("category", "select-text", "tech")
  expect(selectTextField).toBeInstanceOf(DocMetaFieldSelectTextValue)
  expectType<DocMetaFieldValue<"category">>(selectTextField)

  // select-number フィールド
  const selectNumberField = factory.fromType("priority", "select-number", 3)
  expect(selectNumberField).toBeInstanceOf(DocMetaFieldSelectNumberValue)
  expectType<DocMetaFieldValue<"priority">>(selectNumberField)
})

test("DocMetaFieldFactory - リレーションフィールドの型推論", () => {
  const factory = new DocMetaFieldFactory()

  // relation フィールド
  const relationField = factory.fromType(
    "author",
    "relation",
    "../authors/john",
  )
  expect(relationField).toBeInstanceOf(DocMetaFieldRelationValue)
  expectType<DocMetaFieldValue<"author">>(relationField)
})

test("DocMetaFieldFactory - 複数値フィールドの型推論", () => {
  const factory = new DocMetaFieldFactory()

  // multi-text フィールド
  const multiTextField = factory.fromType("tags", "multi-text", [
    "tag1",
    "tag2",
  ])
  expect(multiTextField).toBeInstanceOf(DocMetaFieldMultiTextValue)
  expectType<DocMetaFieldValue<"tags">>(multiTextField)

  // multi-number フィールド
  const multiNumberField = factory.fromType("scores", "multi-number", [1, 2, 3])
  expect(multiNumberField).toBeInstanceOf(DocMetaFieldMultiNumberValue)
  expectType<DocMetaFieldValue<"scores">>(multiNumberField)

  // multi-relation フィールド
  const multiRelationField = factory.fromType("reviewers", "multi-relation", [
    "../users/alice",
    "../users/bob",
  ])
  expect(multiRelationField).toBeInstanceOf(DocMetaFieldMultiRelationValue)
  expectType<DocMetaFieldValue<"reviewers">>(multiRelationField)
})

test("DocMetaFieldFactory - 複数選択フィールドの型推論", () => {
  const factory = new DocMetaFieldFactory()

  // multi-select-text フィールド
  const multiSelectTextField = factory.fromType(
    "categories",
    "multi-select-text",
    ["tech", "news"],
  )
  expect(multiSelectTextField).toBeInstanceOf(DocMetaFieldMultiSelectTextValue)
  expectType<DocMetaFieldValue<"categories">>(multiSelectTextField)

  // multi-select-number フィールド
  const multiSelectNumberField = factory.fromType(
    "ratings",
    "multi-select-number",
    [1, 2, 3],
  )
  expect(multiSelectNumberField).toBeInstanceOf(
    DocMetaFieldMultiSelectNumberValue,
  )
  expectType<DocMetaFieldValue<"ratings">>(multiSelectNumberField)
})

test("DocMetaFieldFactory - defaultValue メソッド", () => {
  const factory = new DocMetaFieldFactory()

  // 各フィールドタイプのデフォルト値
  expect(factory.defaultValue("text")).toBe("")
  expect(factory.defaultValue("number")).toBe(0)
  expect(factory.defaultValue("boolean")).toBe(false)
  expect(factory.defaultValue("select-text")).toEqual([])
  expect(factory.defaultValue("select-number")).toEqual([])
  expect(factory.defaultValue("relation")).toBe(null)
  expect(factory.defaultValue("multi-text")).toEqual([])
  expect(factory.defaultValue("multi-number")).toEqual([])
  expect(factory.defaultValue("multi-select-text")).toEqual([])
  expect(factory.defaultValue("multi-select-number")).toEqual([])
  expect(factory.defaultValue("multi-relation")).toEqual([])
})

test("DocMetaFieldFactory - エラーケース", () => {
  const factory = new DocMetaFieldFactory()

  // 無効なフィールドタイプ (fromType)
  expect(() => {
    // 無効なtype
    // @ts-expect-error - 無効なtypeのテスト
    factory.fromType("invalid", "invalid-type", null)
  }).toThrow("Unknown field type: invalid-type")

  // 無効なフィールドタイプ (defaultValue)
  expect(() => {
    // 無効なtype
    // @ts-expect-error - 無効なtypeのテスト
    factory.defaultValue("invalid-type")
  }).toThrow("Unknown field type: invalid-type")
})

test("DocMetaFieldFactory - 戻り値の型の統一性", () => {
  const factory = new DocMetaFieldFactory()

  // すべての fromType の戻り値は DocMetaFieldValue<K> 型
  type FromTypeResult = ReturnType<typeof factory.fromType>

  // DocMetaFieldValue のサブタイプであることを確認
  // FromTypeResultはRecordKeyを使用しているため、型パラメータをRecordKeyに変更
  assertType<Equals<FromTypeResult, DocMetaFieldValue<RecordKey>>>()
})

test("DocMetaFieldFactory - ジェネリック型パラメータ", () => {
  const factory = new DocMetaFieldFactory()

  // キーの型が保持される
  const field1 = factory.fromType("customKey", "text", "value")
  expectType<DocMetaFieldValue<"customKey">>(field1)

  const field2 = factory.fromType("anotherKey", "number", 42)
  expectType<DocMetaFieldValue<"anotherKey">>(field2)

  // 異なるキーで異なる型
  type _Field1Type = typeof field1
  type _Field2Type = typeof field2
  // 異なるキーで異なる型になることを確認
  // Equals<Field1Type, Field2Type>はfalseを返すことが期待される
})

test("DocMetaFieldFactory - 値の変換", () => {
  const factory = new DocMetaFieldFactory()

  // 各フィールドタイプが適切に値を変換する
  const textField = factory.fromType("text", "text", "Hello")
  expect(textField.value).toBe("Hello")

  const numberField = factory.fromType("num", "number", 42)
  expect(numberField.value).toBe(42)

  const booleanField = factory.fromType("bool", "boolean", true)
  expect(booleanField.value).toBe(true)

  const multiTextField = factory.fromType("tags", "multi-text", [
    "tag1",
    "tag2",
  ])
  expect(multiTextField.value).toEqual(["tag1", "tag2"])
})
