import { expect, test } from "bun:test"
import { expectType } from "../utils"
import { DocFileIndexSchemaValue } from "./doc-file-index-schema-value"
import { DocSchemaFieldTextValue } from "./doc-schema-field/doc-schema-field-text-value"

test("スキーマの基本プロパティを取得できる", () => {
  const schema = new DocFileIndexSchemaValue(
    {
      title: {
        type: "text",
        required: true,
        title: null,
        description: null,
        default: null,
      },
      author: {
        type: "relation",
        required: false,
        path: "users/authors",
        title: null,
        description: null,
        default: null,
      },
    },
    {
      title: { type: "text", required: true },
      author: { type: "relation", required: false },
    },
  )

  expect(schema.fieldNames).toEqual(["title", "author"])
})

test("フィールドを名前で取得できる", () => {
  const schema = new DocFileIndexSchemaValue(
    {
      title: {
        type: "text",
        required: true,
        title: "タイトル",
        description: null,
        default: null,
      },
    },
    {
      title: { type: "text", required: true },
    },
  )

  const field = schema.field("title")
  expect(field).toBeInstanceOf(DocSchemaFieldTextValue)
  expect(field.key).toBe("title")
  expect(field.title).toBe("タイトル")
})

test("存在しないフィールドの場合エラーをthrowする", () => {
  const schema = new DocFileIndexSchemaValue({}, {})
  expect(() => schema.field("nonexistent" as never)).toThrow()
})

test("空のスキーマを作成できる", () => {
  const schema = DocFileIndexSchemaValue.empty()
  expect(schema.fieldNames).toEqual([])
})

test("JSON形式に変換できる", () => {
  const schemaData = {
    field1: {
      type: "text" as const,
      required: true,
      title: null,
      description: null,
      default: null,
    },
    field2: {
      type: "number" as const,
      required: false,
      title: null,
      description: null,
      default: null,
    },
  }

  const schema = new DocFileIndexSchemaValue(schemaData, {
    field1: { type: "text", required: true },
    field2: { type: "number", required: false },
  })
  const json = schema.toJson()

  expect(json).toEqual(schemaData)
})

test("field()メソッドの型推論が正しく動作する", () => {
  // テスト用のカスタムスキーマ
  type TestSchema = {
    features: { type: "multi-text"; required: true }
    author: { type: "relation"; required: false }
    count: { type: "number"; required: true }
  }

  const schema = new DocFileIndexSchemaValue(
    {
      features: {
        type: "multi-text",
        required: true,
        title: null,
        description: null,
        default: [],
      },
      author: {
        type: "relation",
        required: false,
        path: "authors",
        title: null,
        description: null,
        default: null,
      },
      count: {
        type: "number",
        required: true,
        title: null,
        description: null,
        default: 0,
      },
    },
    {
      features: { type: "multi-text", required: true },
      author: { type: "relation", required: false },
      count: { type: "number", required: true },
    } as TestSchema,
  )

  // 型推論のテスト
  const featuresField = schema.field("features")
  expectType<"multi-text">(featuresField.type)
  expect(featuresField.type).toBe("multi-text")

  const authorField = schema.field("author")
  expectType<"relation">(authorField.type)
  expect(authorField.type).toBe("relation")

  const countField = schema.field("count")
  expectType<"number">(countField.type)
  expect(countField.type).toBe("number")
})
