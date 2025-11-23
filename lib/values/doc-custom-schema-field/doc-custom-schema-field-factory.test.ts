import { expect, test } from "bun:test"
import { assertType } from "../../utils"
import { DocCustomSchemaFieldBooleanValue } from "./doc-custom-schema-field-boolean-value"
import { DocCustomSchemaFieldFactory } from "./doc-custom-schema-field-factory"
import { DocCustomSchemaFieldMultiNumberValue } from "./doc-custom-schema-field-multi-number-value"
import { DocCustomSchemaFieldMultiRelationValue } from "./doc-custom-schema-field-multi-relation-value"
import { DocCustomSchemaFieldMultiSelectNumberValue } from "./doc-custom-schema-field-multi-select-number-value"
import { DocCustomSchemaFieldMultiSelectTextValue } from "./doc-custom-schema-field-multi-select-text-value"
import { DocCustomSchemaFieldMultiTextValue } from "./doc-custom-schema-field-multi-text-value"
import { DocCustomSchemaFieldNumberValue } from "./doc-custom-schema-field-number-value"
import { DocCustomSchemaFieldRelationValue } from "./doc-custom-schema-field-relation-value"
import { DocCustomSchemaFieldSelectNumberValue } from "./doc-custom-schema-field-select-number-value"
import { DocCustomSchemaFieldSelectTextValue } from "./doc-custom-schema-field-select-text-value"
import { DocCustomSchemaFieldTextValue } from "./doc-custom-schema-field-text-value"

test("DocCustomSchemaFieldFactory - fromType メソッドの型推論", () => {
  const factory = new DocCustomSchemaFieldFactory()

  // text フィールド
  const textField = factory.fromType("title", {
    type: "text",
    required: true,
  })
  expect(textField).toBeInstanceOf(DocCustomSchemaFieldTextValue)
  // union 型から特定の型を抽出
  assertType<
    DocCustomSchemaFieldTextValue<"title"> extends typeof textField
      ? true
      : false
  >()

  // number フィールド
  const numberField = factory.fromType("count", {
    type: "number",
    required: false,
  })
  expect(numberField).toBeInstanceOf(DocCustomSchemaFieldNumberValue)
  // union 型から特定の型を抽出
  assertType<
    DocCustomSchemaFieldNumberValue<"count"> extends typeof numberField
      ? true
      : false
  >()

  // boolean フィールド
  const booleanField = factory.fromType("isActive", {
    type: "boolean",
    required: true,
  })
  expect(booleanField).toBeInstanceOf(DocCustomSchemaFieldBooleanValue)
  // union 型から特定の型を抽出
  assertType<
    DocCustomSchemaFieldBooleanValue<"isActive"> extends typeof booleanField
      ? true
      : false
  >()
})

test("DocCustomSchemaFieldFactory - 選択フィールドの型推論", () => {
  const factory = new DocCustomSchemaFieldFactory()

  // select-text フィールド
  const selectTextField = factory.fromType("category", {
    type: "select-text",
    required: true,
  })
  expect(selectTextField).toBeInstanceOf(DocCustomSchemaFieldSelectTextValue)
  // union 型から特定の型を抽出
  assertType<
    DocCustomSchemaFieldSelectTextValue<"category"> extends typeof selectTextField
      ? true
      : false
  >()

  // select-number フィールド
  const selectNumberField = factory.fromType("priority", {
    type: "select-number",
    required: false,
  })
  expect(selectNumberField).toBeInstanceOf(
    DocCustomSchemaFieldSelectNumberValue,
  )
  // union 型から特定の型を抽出
  assertType<
    DocCustomSchemaFieldSelectNumberValue<"priority"> extends typeof selectNumberField
      ? true
      : false
  >()
})

test("DocCustomSchemaFieldFactory - リレーションフィールドの型推論", () => {
  const factory = new DocCustomSchemaFieldFactory()

  // relation フィールド
  const relationField = factory.fromType("author", {
    type: "relation",
    required: true,
  })
  expect(relationField).toBeInstanceOf(DocCustomSchemaFieldRelationValue)
  // union 型から特定の型を抽出
  assertType<
    DocCustomSchemaFieldRelationValue<"author"> extends typeof relationField
      ? true
      : false
  >()
})

test("DocCustomSchemaFieldFactory - 複数値フィールドの型推論", () => {
  const factory = new DocCustomSchemaFieldFactory()

  // multi-text フィールド
  const multiTextField = factory.fromType("tags", {
    type: "multi-text",
    required: false,
  })
  expect(multiTextField).toBeInstanceOf(DocCustomSchemaFieldMultiTextValue)
  // union 型から特定の型を抽出
  assertType<
    DocCustomSchemaFieldMultiTextValue<"tags"> extends typeof multiTextField
      ? true
      : false
  >()

  // multi-number フィールド
  const multiNumberField = factory.fromType("scores", {
    type: "multi-number",
    required: true,
  })
  expect(multiNumberField).toBeInstanceOf(DocCustomSchemaFieldMultiNumberValue)
  // union 型から特定の型を抽出
  assertType<
    DocCustomSchemaFieldMultiNumberValue<"scores"> extends typeof multiNumberField
      ? true
      : false
  >()

  // multi-relation フィールド
  const multiRelationField = factory.fromType("reviewers", {
    type: "multi-relation",
    required: false,
  })
  expect(multiRelationField).toBeInstanceOf(
    DocCustomSchemaFieldMultiRelationValue,
  )
  // union 型から特定の型を抽出
  assertType<
    DocCustomSchemaFieldMultiRelationValue<"reviewers"> extends typeof multiRelationField
      ? true
      : false
  >()
})

test("DocCustomSchemaFieldFactory - 複数選択フィールドの型推論", () => {
  const factory = new DocCustomSchemaFieldFactory()

  // multi-select-text フィールド
  const multiSelectTextField = factory.fromType("categories", {
    type: "multi-select-text",
    required: true,
  })
  expect(multiSelectTextField).toBeInstanceOf(
    DocCustomSchemaFieldMultiSelectTextValue,
  )
  // union 型から特定の型を抽出
  assertType<
    DocCustomSchemaFieldMultiSelectTextValue<"categories"> extends typeof multiSelectTextField
      ? true
      : false
  >()

  // multi-select-number フィールド
  const multiSelectNumberField = factory.fromType("ratings", {
    type: "multi-select-number",
    required: false,
  })
  expect(multiSelectNumberField).toBeInstanceOf(
    DocCustomSchemaFieldMultiSelectNumberValue,
  )
  // union 型から特定の型を抽出
  assertType<
    DocCustomSchemaFieldMultiSelectNumberValue<"ratings"> extends typeof multiSelectNumberField
      ? true
      : false
  >()
})

test("DocCustomSchemaFieldFactory - fromType の戻り値の型", () => {
  const factory = new DocCustomSchemaFieldFactory()

  // fromType の戻り値は正しい値オブジェクトのユニオン型
  type FromTypeResult = ReturnType<typeof factory.fromType>

  // 各フィールドタイプの値オブジェクトがユニオンに含まれる
  assertType<
    DocCustomSchemaFieldTextValue<string> extends FromTypeResult ? true : false
  >()
  assertType<
    DocCustomSchemaFieldNumberValue<string> extends FromTypeResult
      ? true
      : false
  >()
  assertType<
    DocCustomSchemaFieldBooleanValue<string> extends FromTypeResult
      ? true
      : false
  >()
  assertType<
    DocCustomSchemaFieldSelectTextValue<string> extends FromTypeResult
      ? true
      : false
  >()
  assertType<
    DocCustomSchemaFieldSelectNumberValue<string> extends FromTypeResult
      ? true
      : false
  >()
  assertType<
    DocCustomSchemaFieldRelationValue<string> extends FromTypeResult
      ? true
      : false
  >()
  assertType<
    DocCustomSchemaFieldMultiTextValue<string> extends FromTypeResult
      ? true
      : false
  >()
  assertType<
    DocCustomSchemaFieldMultiNumberValue<string> extends FromTypeResult
      ? true
      : false
  >()
  assertType<
    DocCustomSchemaFieldMultiRelationValue<string> extends FromTypeResult
      ? true
      : false
  >()
  assertType<
    DocCustomSchemaFieldMultiSelectTextValue<string> extends FromTypeResult
      ? true
      : false
  >()
  assertType<
    DocCustomSchemaFieldMultiSelectNumberValue<string> extends FromTypeResult
      ? true
      : false
  >()
})

test("DocCustomSchemaFieldFactory - エラーケース", () => {
  const factory = new DocCustomSchemaFieldFactory()

  // 無効なフィールドタイプ
  expect(() => {
    factory.fromType("invalid", {
      // @ts-expect-error - 無効なtype
      type: "invalid-type",
      required: true,
    })
  }).toThrow()
})
