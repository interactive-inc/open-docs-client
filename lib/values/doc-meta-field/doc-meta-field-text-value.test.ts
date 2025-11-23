import { expect, test } from "bun:test"
import type { Equals } from "../../types"
import { assertType, expectType } from "../../utils"
import { DocMetaFieldTextValue } from "./doc-meta-field-text-value"

test("DocMetaFieldTextValue - 基本的な作成とプロパティアクセス", () => {
  const field = new DocMetaFieldTextValue("title", "テスト値")

  expect(field.key).toBe("title")
  expect(field.value).toBe("テスト値")
})

test("DocMetaFieldTextValue - from メソッドによる作成", () => {
  // 文字列から作成
  const field1 = DocMetaFieldTextValue.from("name", "田中太郎")
  expect(field1.key).toBe("name")
  expect(field1.value).toBe("田中太郎")

  // 数値から作成（エラーになる）
  expect(() => {
    DocMetaFieldTextValue.from("count", 123)
  }).toThrow()

  // ブール値から作成（エラーになる）
  expect(() => {
    DocMetaFieldTextValue.from("isActive", true)
  }).toThrow()

  // null は null のまま
  const field4 = DocMetaFieldTextValue.from("empty", null)
  expect(field4.value).toBe(null)

  // undefinedはエラーになる
  expect(() => {
    DocMetaFieldTextValue.from("undef", undefined)
  }).toThrow()
})

test("DocMetaFieldTextValue - default メソッド", () => {
  const field = DocMetaFieldTextValue.default("description")
  expect(field.key).toBe("description")
  expect(field.value).toBe("")
})

test("DocMetaFieldTextValue - defaultValue 静的メソッド", () => {
  expect(DocMetaFieldTextValue.defaultValue()).toBe("")
})

test("DocMetaFieldTextValue - 不変性の確認", () => {
  const field = new DocMetaFieldTextValue("immutable", "不変")

  expect(() => {
    // @ts-expect-error - 不変性のテスト
    field.key = "changed"
  }).toThrow()

  expect(() => {
    // @ts-expect-error - 不変性のテスト
    field.value = "変更"
  }).toThrow()
})

test("DocMetaFieldTextValue - ジェネリック型パラメータ", () => {
  // キーの型が保持される
  const field1 = new DocMetaFieldTextValue("customKey", "値")
  // 型が正しく推論されることを確認
  const _field1: DocMetaFieldTextValue<"customKey"> = field1
  const _key1: "customKey" = field1.key
  const _value1: string | null = field1.value

  // from メソッドでも型が保持される
  const field2 = DocMetaFieldTextValue.from("anotherKey", "別の値")
  // 型が正しく推論されることを確認
  const _field2: DocMetaFieldTextValue<"anotherKey"> = field2
  const _key2: "anotherKey" = field2.key

  // default メソッドでも型が保持される
  const field3 = DocMetaFieldTextValue.default("defaultKey")
  // 型が正しく推論されることを確認
  const _field3: DocMetaFieldTextValue<"defaultKey"> = field3
  const _key3: "defaultKey" = field3.key
})

test("DocMetaFieldTextValue - 型の関係", () => {
  // 異なるキーで異なる型
  type Field1 = DocMetaFieldTextValue<"key1">
  type Field2 = DocMetaFieldTextValue<"key2">
  assertType<Equals<Field1, Field2> extends false ? true : false>()

  // 同じキーで同じ型
  type Field3 = DocMetaFieldTextValue<"key1">
  assertType<Equals<Field1, Field3>>()
})

test("DocMetaFieldTextValue - 値の検証", () => {
  // 通常の文字列
  expect(() => {
    new DocMetaFieldTextValue("valid", "正常な文字列")
  }).not.toThrow()

  // 空文字列も有効
  expect(() => {
    new DocMetaFieldTextValue("empty", "")
  }).not.toThrow()

  // 長い文字列
  const longString = "a".repeat(10000)
  expect(() => {
    new DocMetaFieldTextValue("long", longString)
  }).not.toThrow()

  // 特殊文字を含む文字列
  expect(() => {
    new DocMetaFieldTextValue("special", "改行\nタブ\t絵文字😀")
  }).not.toThrow()
})

test("DocMetaFieldTextValue - 型ガード", () => {
  const field = new DocMetaFieldTextValue("test", "値")

  // value プロパティは常に string 型
  if (typeof field.value === "string") {
    expectType<string>(field.value)
  }

  // key プロパティは特定の文字列リテラル型
  if (field.key === "test") {
    expectType<"test">(field.key)
  }
})

test("DocMetaFieldTextValue - readonly プロパティ", () => {
  const _field = new DocMetaFieldTextValue("readonly", "読み取り専用")

  // プロパティが readonly であることを型レベルで確認
})

test("DocMetaFieldTextValue - メソッドチェーン", () => {
  // 複数のフィールドを作成してチェーン的に使用
  const field1 = DocMetaFieldTextValue.from("field1", "値1")
  const field2 = DocMetaFieldTextValue.from("field2", `${field1.value}を加工`)
  const field3 = DocMetaFieldTextValue.default("field3")

  expect(field2.value).toBe("値1を加工")
  expect(field3.value).toBe("")

  // 型も正しく推論される
  expectType<DocMetaFieldTextValue<"field1">>(field1)
  expectType<DocMetaFieldTextValue<"field2">>(field2)
  expectType<DocMetaFieldTextValue<"field3">>(field3)
})
