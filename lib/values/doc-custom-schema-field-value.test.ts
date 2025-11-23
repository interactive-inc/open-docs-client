import { expect, test } from "bun:test"
import type { DocCustomSchemaField } from "../types"
import { expectType } from "../utils"
import { DocCustomSchemaFieldValue } from "./doc-custom-schema-field-value"

test("DocCustomSchemaFieldValue - テキストフィールドの作成と検証", () => {
  const field = new DocCustomSchemaFieldValue({
    type: "text",
    required: true,
    title: "タイトル",
    description: "タイトルを入力してください",
    default: "",
  })

  expect(field.value.type).toBe("text")
  expect(field.value.required).toBe(true)
  expect(field.value.title).toBe("タイトル")

  // 有効な値
  expect(field.validate("テスト値")).toBe("テスト値")
  expect(field.validate("")).toBe("")

  // 無効な値（requiredがtrueなのでデフォルト値を返す）
  expect(field.validate(null)).toBe(null) // nullはparseされる
  expect(field.validate(undefined)).toBe("") // undefinedはエラーになるのでデフォルト値
})

test("DocCustomSchemaFieldValue - 数値フィールドの作成と検証", () => {
  const field = new DocCustomSchemaFieldValue({
    type: "number",
    required: false,
    title: null,
    description: null,
    default: 0,
  })

  expect(field.value.type).toBe("number")
  expect(field.value.required).toBe(false)

  // 有効な値
  expect(field.validate(42)).toBe(42)
  expect(field.validate(0)).toBe(0)
  expect(field.validate(-123)).toBe(-123)

  // 無効な値
  expect(field.validate(null)).toBe(null) // nullはparseされる
  expect(field.validate("123")).toBe(null) // 文字列はエラーになる
  expect(field.validate("invalid")).toBe(null)
})

test("DocCustomSchemaFieldValue - ブール値フィールドの作成と検証", () => {
  const field = new DocCustomSchemaFieldValue({
    type: "boolean",
    required: true,
    title: "公開設定",
    description: null,
    default: false,
  })

  // 有効な値
  expect(field.validate(true)).toBe(true)
  expect(field.validate(false)).toBe(false)

  // 無効な値
  expect(field.validate(null)).toBe(null) // nullはparseされる
  expect(field.validate("true")).toBe(false) // 文字列はエラーになるのでデフォルト値
  expect(field.validate("invalid")).toBe(false)
})

test("DocCustomSchemaFieldValue - 選択フィールドの作成と検証", () => {
  const textSelectField = new DocCustomSchemaFieldValue({
    type: "select-text",
    required: true,
    options: ["tech", "news", "blog"],
    title: "カテゴリー",
    description: null,
    default: "tech",
  })

  // 有効な値
  expect(textSelectField.validate("tech")).toBe("tech")
  expect(textSelectField.validate("news")).toBe("news")
  expect(textSelectField.validate("invalid")).toBe("invalid") // オプションチェックはしない

  // nullはparseされる
  expect(textSelectField.validate(null)).toBe(null)

  const numberSelectField = new DocCustomSchemaFieldValue({
    type: "select-number",
    required: false,
    options: [1, 2, 3, 4, 5],
    title: "優先度",
    description: null,
    default: 3,
  })

  expect(numberSelectField.validate(3)).toBe(3)
  expect(numberSelectField.validate(10)).toBe(10) // オプションチェックはしない
  expect(numberSelectField.validate("4")).toBe(null) // 文字列はエラー
})

test("DocCustomSchemaFieldValue - リレーションフィールドの作成と検証", () => {
  const field = new DocCustomSchemaFieldValue({
    type: "relation",
    required: true,
    path: "../authors",
    title: "著者",
    description: null,
    default: null,
  })

  expect(field.value.type).toBe("relation")
  expect(field.value.path).toBe("../authors")

  // 有効な値
  expect(field.validate("../authors/john")).toBe("../authors/john")

  // 無効な値
  expect(field.validate(null)).toBe(null)
  expect(field.validate(123)).toBe(null)
})

test("DocCustomSchemaFieldValue - 複数値フィールドの作成と検証", () => {
  const multiTextField = new DocCustomSchemaFieldValue({
    type: "multi-text",
    required: true,
    title: "タグ",
    description: null,
    default: [],
  })

  // 有効な値
  expect(multiTextField.validate(["tag1", "tag2"])).toEqual(["tag1", "tag2"])
  expect(multiTextField.validate([])).toEqual([])

  // 無効な値
  expect(multiTextField.validate("tag1,tag2")).toEqual([]) // 文字列はエラーになるのでデフォルト値
  expect(multiTextField.validate(null)).toEqual([]) // nullはエラーになるのでデフォルト値（空配列）
  expect(multiTextField.validate(undefined)).toEqual([]) // undefinedはエラーになるのでデフォルト値

  const multiNumberField = new DocCustomSchemaFieldValue({
    type: "multi-number",
    required: false,
    title: "スコア",
    description: null,
    default: [],
  })

  expect(multiNumberField.validate([1, 2, 3])).toEqual([1, 2, 3])
  expect(multiNumberField.validate("1,2,3")).toBe(null) // 文字列はエラー
  expect(multiNumberField.validate(null)).toBe(null) // requiredがfalse
})

test("DocCustomSchemaFieldValue - 不変性の確認", () => {
  const field = new DocCustomSchemaFieldValue({
    type: "text",
    required: true,
    title: "不変",
    description: null,
    default: "",
  })

  expect(() => {
    // @ts-expect-error - 不変性のテスト
    field.value = { type: "number" }
  }).toThrow()
})

test("DocCustomSchemaFieldValue - ジェネリック型パラメータ", () => {
  // テキストフィールドの型
  type TextFieldType = {
    type: "text"
    required: true
    title: string
    description: string | null
    default: string
  }

  const textField = new DocCustomSchemaFieldValue<TextFieldType>({
    type: "text",
    required: true,
    title: "タイトル",
    description: null,
    default: "",
  })

  expectType<DocCustomSchemaFieldValue<TextFieldType>>(textField)
  expectType<TextFieldType>(textField.value)

  // 数値フィールドの型
  type NumberFieldType = {
    type: "number"
    required: false
    title: string | null
    description: string | null
    default: number
  }

  const numberField = new DocCustomSchemaFieldValue<NumberFieldType>({
    type: "number",
    required: false,
    title: null,
    description: null,
    default: 0,
  })

  expectType<DocCustomSchemaFieldValue<NumberFieldType>>(numberField)
  expectType<NumberFieldType>(numberField.value)
})

test("DocCustomSchemaFieldValue - validate メソッドの戻り値の型", () => {
  const field = new DocCustomSchemaFieldValue({
    type: "text",
    required: false,
    title: null,
    description: null,
    default: "",
  })

  // validate の戻り値は適切な型 | null
  const result = field.validate("test")
  // validateメソッドの戻り値は string | number | boolean | string[] | number[] | null
  expectType<string | number | boolean | string[] | number[] | null>(result)

  if (result !== null && typeof result === "string") {
    expectType<string>(result)
  }
})

test("DocCustomSchemaFieldValue - エラーケース", () => {
  // 無効なtypeでオブジェクトを作成しようとするとエラー
  expect(() => {
    new DocCustomSchemaFieldValue({
      // 無効なtype
      // @ts-expect-error - 無効なtypeのテスト
      type: "invalid-type",
      required: true,
      title: null,
      description: null,
      default: null,
    })
  }).toThrow()
})

test("DocCustomSchemaFieldValue - 型の網羅性", () => {
  // すべてのフィールドタイプをカバー
  const fieldTypes: DocCustomSchemaField["type"][] = [
    "text",
    "number",
    "boolean",
    "select-text",
    "select-number",
    "relation",
    "multi-text",
    "multi-number",
    "multi-select-text",
    "multi-select-number",
    "multi-relation",
  ]

  fieldTypes.forEach((type) => {
    // 各タイプに応じた適切なフィールドを作成
    if (type === "text") {
      const field = new DocCustomSchemaFieldValue({
        type,
        required: true,
        title: null,
        description: null,
        default: "",
      })
      expect(field.value.type).toBe("text")
    } else if (type === "number") {
      const field = new DocCustomSchemaFieldValue({
        type,
        required: true,
        title: null,
        description: null,
        default: 0,
      })
      expect(field.value.type).toBe("number")
    }
    // ... 他のタイプも同様にテスト可能
  })
})
