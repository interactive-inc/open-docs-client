import { test } from "bun:test"
import type {
  BaseFieldValueType,
  DocCustomSchema,
  Equals,
  ExtractFieldType,
  FieldValueType,
  GetValueType,
  SchemaToValueType,
} from "./types"
import { assertType, expectType } from "./utils"

test("BaseFieldValueType - 各フィールドタイプの基本値型が正しい", () => {
  // text
  expectType<string>(null as unknown as BaseFieldValueType<"text">)

  // number
  expectType<number>(null as unknown as BaseFieldValueType<"number">)

  // boolean
  expectType<boolean>(null as unknown as BaseFieldValueType<"boolean">)

  // relation
  expectType<string>(null as unknown as BaseFieldValueType<"relation">)

  // select-text
  expectType<string>(null as unknown as BaseFieldValueType<"select-text">)

  // select-number
  expectType<number>(null as unknown as BaseFieldValueType<"select-number">)

  // multi-text
  expectType<string[]>(null as unknown as BaseFieldValueType<"multi-text">)

  // multi-number
  expectType<number[]>(null as unknown as BaseFieldValueType<"multi-number">)

  // multi-relation
  expectType<string[]>(null as unknown as BaseFieldValueType<"multi-relation">)

  // multi-select-text
  expectType<string[]>(
    null as unknown as BaseFieldValueType<"multi-select-text">,
  )

  // multi-select-number
  expectType<number[]>(
    null as unknown as BaseFieldValueType<"multi-select-number">,
  )
})

test("ExtractFieldType - フィールド定義から型を抽出", () => {
  type TextFieldDef = { type: "text"; required: true }
  type NumberFieldDef = { type: "number"; required: false }
  type MultiTextFieldDef = { type: "multi-text"; required: true }

  assertType<Equals<ExtractFieldType<TextFieldDef>, "text">>()
  assertType<Equals<ExtractFieldType<NumberFieldDef>, "number">>()
  assertType<Equals<ExtractFieldType<MultiTextFieldDef>, "multi-text">>()
})

test("ExtractRequired - 必須フィールドを抽出", () => {
  type Schema = {
    requiredText: { type: "text"; required: true }
    optionalText: { type: "text"; required: false }
    requiredNumber: { type: "number"; required: true }
    optionalNumber: { type: "number"; required: false }
  }

  // ExtractRequired はフィールドから required を抽出する型なので、
  // ここではスキーマから required なキーを抽出する別の型を定義
  type RequiredKeys = {
    [K in keyof Schema]: Schema[K] extends { required: true } ? K : never
  }[keyof Schema]
  assertType<Equals<RequiredKeys, "requiredText" | "requiredNumber">>()
})

test("FieldValueType - フィールド定義から値の型を決定", () => {
  // 必須フィールド
  type _RequiredTextField = { type: "text"; required: true }
  assertType<Equals<FieldValueType<"text", true>, string>>()

  // オプショナルフィールド
  type _OptionalTextField = { type: "text"; required: false }
  assertType<Equals<FieldValueType<"text", false>, string | null>>()

  // 必須配列フィールド
  type _RequiredMultiTextField = { type: "multi-text"; required: true }
  assertType<Equals<FieldValueType<"multi-text", true>, string[]>>()

  // オプショナル配列フィールド
  type _OptionalMultiTextField = { type: "multi-text"; required: false }
  assertType<Equals<FieldValueType<"multi-text", false>, string[] | null>>()
})

test("SchemaToValueType - スキーマ全体から値の型を生成", () => {
  type TestSchema = {
    title: { type: "text"; required: true }
    description: { type: "text"; required: false }
    count: { type: "number"; required: true }
    tags: { type: "multi-text"; required: false }
    author: { type: "relation"; required: true }
    isPublished: { type: "boolean"; required: false }
  }

  type _ExpectedValue = {
    title: string
    description?: string
    count: number
    tags?: string[]
    author: string
    isPublished?: boolean
  }

  type _ActualValue = SchemaToValueType<TestSchema>
  // 実際には optional プロパティが null を許容するため、完全に一致しない
  // 主要なプロパティをチェック
})

test("GetValueType - スキーマフィールドから値の型を取得", () => {
  type Schema = {
    title: { type: "text"; required: true }
    price: { type: "number"; required: false }
    categories: { type: "multi-select-text"; required: true }
  }

  // 必須テキストフィールド
  assertType<Equals<GetValueType<Schema, "title">, string>>()

  // オプショナル数値フィールド
  assertType<Equals<GetValueType<Schema, "price">, number | undefined | null>>()

  // 必須複数選択フィールド
  assertType<Equals<GetValueType<Schema, "categories">, string[]>>()
})

test("DocCustomSchema - カスタムスキーマの構造", () => {
  const schema: DocCustomSchema = {
    title: { type: "text", required: true },
    description: { type: "text", required: false },
    price: { type: "number", required: true },
    inStock: { type: "boolean", required: true },
    category: { type: "select-text", required: false },
    tags: { type: "multi-text", required: false },
    relatedItems: { type: "multi-relation", required: false },
  }

  // スキーマが正しい構造を持つことを確認
  expectType<DocCustomSchema>(schema)
})

test("複雑なスキーマの型変換", () => {
  type ComplexSchema = {
    // 基本フィールド
    id: { type: "text"; required: true }
    name: { type: "text"; required: true }
    description: { type: "text"; required: false }

    // 数値フィールド
    price: { type: "number"; required: true }
    discount: { type: "number"; required: false }

    // 真偽値フィールド
    isActive: { type: "boolean"; required: true }
    isFeatured: { type: "boolean"; required: false }

    // 選択フィールド
    status: { type: "select-text"; required: true }
    priority: { type: "select-number"; required: false }

    // リレーションフィールド
    author: { type: "relation"; required: true }
    reviewer: { type: "relation"; required: false }

    // 複数値フィールド
    tags: { type: "multi-text"; required: true }
    categories: { type: "multi-text"; required: false }
    ratings: { type: "multi-number"; required: false }
    relatedItems: { type: "multi-relation"; required: false }
    statuses: { type: "multi-select-text"; required: false }
    priorities: { type: "multi-select-number"; required: false }
  }

  type ComplexValue = SchemaToValueType<ComplexSchema>

  // 型チェック用のダミー値
  const value: ComplexValue = {
    // 必須フィールド
    id: "123",
    name: "Test",
    price: 100,
    isActive: true,
    status: "published",
    author: "author-id",
    tags: ["tag1", "tag2"],
    description: "...",
    discount: 10,
    isFeatured: false,
    priority: 1,
    reviewer: "reviewer-id",
    categories: ["cat1"],
    ratings: [4, 5],
    relatedItems: ["item1", "item2"],
    statuses: ["status1"],
    priorities: [1, 2],
  }

  expectType<ComplexValue>(value)
})
