import { expect, test } from "bun:test"
import { DocFileMdMetaValue } from "./doc-file-md-meta-value"

test("DocFileMdMetaValue - 基本的な作成とプロパティアクセス", () => {
  const value = new DocFileMdMetaValue(
    {
      title: "ドキュメントタイトル",
      description: "ドキュメントの説明",
      tags: ["tag1", "tag2"],
      author: "作者名",
    },
    {
      title: { type: "text", required: false },
      description: { type: "text", required: false },
      tags: { type: "multi-text", required: false },
      author: { type: "text", required: false },
    },
  )

  expect(value.value.title).toBe("ドキュメントタイトル")
  expect(value.value.description).toBe("ドキュメントの説明")
  expect(value.value.tags).toEqual(["tag1", "tag2"])
  expect(value.value.author).toBe("作者名")
})

test("DocFileMdMetaValue - 空のFrontMatter", () => {
  const value = new DocFileMdMetaValue({}, {})

  expect(value.value).toEqual({})
})

test("DocFileMdMetaValue - fieldメソッド", () => {
  const value = new DocFileMdMetaValue(
    {
      title: "タイトル",
      count: 42,
    },
    {
      title: { type: "text", required: false },
      count: { type: "number", required: false },
    },
  )

  expect(value.field("title")).toBe("タイトル")
  expect(value.field("count")).toBe(42)
})

test("DocFileMdMetaValue - hasKeyメソッド", () => {
  const value = new DocFileMdMetaValue(
    {
      title: "タイトル",
      description: "説明",
    },
    {
      title: { type: "text", required: false },
      description: { type: "text", required: false },
    },
  )

  expect(value.hasKey("title")).toBe(true)
  expect(value.hasKey("description")).toBe(true)
})

test("DocFileMdMetaValue - requiredフィールド", () => {
  expect(() => {
    new DocFileMdMetaValue({} as never, {
      title: { type: "text", required: true },
    })
  }).toThrow('Required field "title" is missing')
})

test("DocFileMdMetaValue - withPropertyメソッド", () => {
  const value = new DocFileMdMetaValue(
    {
      title: "元のタイトル",
    },
    {
      title: { type: "text", required: false },
    },
  )

  const updated = value.withProperty("title", "新しいタイトル")

  expect(value.value.title).toBe("元のタイトル")
  expect(updated.value.title).toBe("新しいタイトル")
})

test("DocFileMdMetaValue - 空のcustomSchemaでschemaFieldメソッドがエラーをスローする", () => {
  // 空のcustomSchemaで初期化
  const value = new DocFileMdMetaValue(
    {
      isDone: false,
      priority: 1,
      tags: ["test", "sample"],
    },
    {}, // 空のcustomSchema
  )

  // schemaFieldメソッドが存在しないフィールドに対してエラーをスローすることを確認
  expect(() => value.schemaField("isDone" as never)).toThrow(
    'Field "isDone" does not exist in schema.',
  )
})

test("DocFileMdMetaValue - 存在しないフィールドへのアクセスでエラーをスローする", () => {
  const value = new DocFileMdMetaValue(
    {
      existingField: "value",
    },
    {}, // 空のcustomSchema
  )

  // valueに存在しないフィールドへのアクセスでエラーをスローすることを確認
  expect(() => value.schemaField("nonExistent" as never)).toThrow(
    'Field "nonExistent" does not exist in schema.',
  )

  // isDoneのような特定のフィールドも同様
  expect(() => value.schemaField("isDone" as never)).toThrow(
    'Field "isDone" does not exist in schema.',
  )
})

test("DocFileMdMetaValue - relationタイプのスキーマ定義", () => {
  const value = new DocFileMdMetaValue(
    {
      relatedDoc: "docs/other.md",
      relatedDocs: ["docs/doc1.md", "docs/doc2.md"],
    },
    {
      relatedDoc: { type: "relation", required: false },
      relatedDocs: { type: "multi-relation", required: false },
    },
  )

  // 定義されたスキーマが正しく取得できることを確認
  const relatedDocField = value.schemaField("relatedDoc")
  expect(relatedDocField).toMatchObject({
    type: "relation",
    required: false,
  })

  const relatedDocsField = value.schemaField("relatedDocs")
  expect(relatedDocsField).toMatchObject({
    type: "multi-relation",
    required: false,
  })
})

test("DocFileMdMetaValue - 空配列のスキーマ定義", () => {
  const value = new DocFileMdMetaValue(
    {
      emptyArray: [],
    },
    {
      emptyArray: { type: "multi-text", required: false },
    },
  )

  // 定義されたスキーマが正しく取得できることを確認
  const emptyArrayField = value.schemaField("emptyArray")
  expect(emptyArrayField).toMatchObject({
    type: "multi-text",
    required: false,
  })
})

test("DocFileMdMetaValue - customSchemaが定義されている場合は優先される", () => {
  const value = new DocFileMdMetaValue(
    {
      status: "draft",
    },
    {
      status: { type: "select-text", required: true },
    },
  )

  // customSchemaが定義されている場合はそれが優先される
  const statusField = value.schemaField("status")
  expect(statusField).toMatchObject({
    type: "select-text",
    required: true,
  })
})
