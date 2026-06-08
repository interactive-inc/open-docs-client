import { expect, test } from "bun:test"
import { defaultTestConfig } from "../utils"
import { DocFileIndexContentValue } from "./doc-file-index-content-value"

test("DocFileContentIndexValue - 基本的な作成とプロパティアクセス", () => {
  const value = new DocFileIndexContentValue(
    {
      type: "markdown-index",
      body: "# タイトル\n\n説明文\n\n本文",
      title: "タイトル",
      description: "説明文",
      meta: {
        type: "index-meta",
        icon: "📁",
        schema: {
          name: {
            type: "text" as const,
            required: true,
            title: "名前",
            description: "項目の名前",
            default: "",
          },
        },
      },
    },
    {
      name: { type: "text", required: true },
    },
    defaultTestConfig,
  )

  expect(value.body).toBe("# タイトル\n\n説明文\n\n本文")
  expect(value.title).toBe("タイトル")
  expect(value.description).toBe("説明文")
  expect(value.meta().icon).toBe("📁")
})

test("DocFileContentIndexValue - frontMatter getterが値オブジェクトを返す", () => {
  const value = new DocFileIndexContentValue(
    {
      type: "markdown-index",
      body: "",
      title: "",
      description: "",
      meta: {
        type: "index-meta",
        icon: "📁",
        schema: {
          name: {
            type: "text" as const,
            required: true,
            title: null,
            description: null,
            default: null,
          },
        },
      },
    },
    {
      name: { type: "text", required: true },
    },
    defaultTestConfig,
  )

  const frontMatter = value.meta()
  expect(frontMatter.value.type).toBe("index-meta")
  expect(frontMatter.icon).toBe("📁")
})

test("DocFileContentIndexValue - withTitleで新しいインスタンスを作成", () => {
  const value = new DocFileIndexContentValue(
    {
      type: "markdown-index",
      body: "# 古いタイトル\n\n説明文",
      title: "古いタイトル",
      description: "説明文",
      meta: {
        type: "index-meta",
        icon: "",
        schema: {
          name: {
            type: "text" as const,
            required: true,
            title: null,
            description: null,
            default: null,
          },
        },
      },
    },
    {
      name: { type: "text", required: true },
    },
    defaultTestConfig,
  )

  const newValue = value.withTitle("新しいタイトル")

  expect(newValue).not.toBe(value) // 新しいインスタンス
  expect(newValue.title).toBe("新しいタイトル")
  expect(newValue.body).toContain("# 新しいタイトル")
  expect(value.title).toBe("古いタイトル") // 元は変更されない
})

test("DocFileContentIndexValue - withDescriptionで新しいインスタンスを作成", () => {
  const value = new DocFileIndexContentValue(
    {
      type: "markdown-index",
      body: "# タイトル\n\n古い説明",
      title: "タイトル",
      description: "古い説明",
      meta: {
        type: "index-meta",
        icon: "",
        schema: {
          name: {
            type: "text" as const,
            required: true,
            title: null,
            description: null,
            default: null,
          },
        },
      },
    },
    {
      name: { type: "text", required: true },
    },
    defaultTestConfig,
  )

  const newValue = value.withDescription("新しい説明")

  expect(newValue).not.toBe(value)
  expect(newValue.description).toBe("新しい説明")
  expect(newValue.body).toContain("新しい説明")
})

test("DocFileContentIndexValue - withContentで新しいインスタンスを作成", () => {
  const value = new DocFileIndexContentValue(
    {
      type: "markdown-index",
      body: "古い内容",
      title: "タイトル",
      description: "説明",
      meta: {
        type: "index-meta",
        icon: "",
        schema: {
          name: {
            type: "text" as const,
            required: true,
            title: null,
            description: null,
            default: null,
          },
        },
      },
    },
    {
      name: { type: "text", required: true },
    },
    defaultTestConfig,
  )

  const newValue = value.withBody("新しい内容")

  expect(newValue).not.toBe(value)
  expect(newValue.body).toBe("新しい内容")
  // タイトルは新しい内容から解析される
  expect(newValue.title).toBe("")
  expect(newValue.description).toBe("")
})

test("DocFileContentIndexValue - withFrontMatterで新しいインスタンスを作成", () => {
  const value = new DocFileIndexContentValue(
    {
      type: "markdown-index",
      body: "# タイトル",
      title: "タイトル",
      description: "",
      meta: {
        type: "index-meta",
        icon: "📁",
        schema: {
          name: {
            type: "text" as const,
            required: true,
            title: null,
            description: null,
            default: null,
          },
        },
      },
    },
    {
      name: { type: "text", required: true },
    },
    defaultTestConfig,
  )

  const newFrontMatter = {
    type: "index-meta" as const,
    icon: "📂",
    schema: {
      name: {
        type: "text" as const,
        required: true,
        title: null,
        description: null,
        default: null,
      },
    },
  }

  const newValue = value.withMeta(newFrontMatter)

  expect(newValue).not.toBe(value)
  expect(newValue.meta().icon).toBe("📂")
  expect(value.meta().icon).toBe("📁") // 元は変更されない
})

test("DocFileContentIndexValue - fromMarkdownでMarkdownから生成", () => {
  const markdown = `---
title: "メタタイトル"
description: "メタ説明"
icon: "📁"
schema: {}
---

# ドキュメントタイトル

これは説明文です。

本文の内容`

  const value = DocFileIndexContentValue.fromMarkdown(markdown, {}, defaultTestConfig)

  expect(value.title).toBe("ドキュメントタイトル")
  expect(value.description).toBe("これは説明文です。")
  expect(value.body).toContain("# ドキュメントタイトル")
  expect(value.meta().icon).toBe("📁")
})

test("DocFileContentIndexValue - emptyでデフォルトコンテンツを生成", () => {
  const value = DocFileIndexContentValue.empty("テストディレクトリ", {}, defaultTestConfig)

  expect(value.title).toBe("テストディレクトリ")
  expect(value.meta().icon).toBe("")
  expect(value.meta().schema().toJson()).toEqual({})
  expect(value.body).toContain("# テストディレクトリ")
})

test("DocFileContentIndexValue - toTextでFrontMatter付きテキストを生成", () => {
  const value = new DocFileIndexContentValue(
    {
      type: "markdown-index",
      body: "# タイトル\n\n本文",
      title: "タイトル",
      description: "",
      meta: {
        type: "index-meta",
        icon: "📁",
        schema: {
          name: {
            type: "text" as const,
            required: true,
            title: null,
            description: null,
            default: null,
          },
        },
      },
    },
    {
      name: { type: "text", required: true },
    },
    defaultTestConfig,
  )

  const text = value.toText()

  expect(text).toContain("---")
  expect(text).toContain("icon: 📁")
  expect(text).toContain("# タイトル")
  expect(text).toContain("本文")
})

test("DocFileContentIndexValue - bodyでコンテンツのみを取得", () => {
  const value = new DocFileIndexContentValue(
    {
      type: "markdown-index",
      body: "既存の本文",
      title: "タイトル",
      description: "説明",
      meta: {
        type: "index-meta",
        icon: "",
        schema: {
          name: {
            type: "text" as const,
            required: true,
            title: null,
            description: null,
            default: null,
          },
        },
      },
    },
    {
      name: { type: "text", required: true },
    },
    defaultTestConfig,
  )

  const text = value.body

  expect(text).toBe("既存の本文")
  expect(text).not.toContain("---") // FrontMatterは含まない
})

test("DocFileContentIndexValue - toJsonで元のデータ構造を返す", () => {
  const data = {
    type: "markdown-index" as const,
    body: "# タイトル",
    title: "タイトル",
    description: "説明",
    meta: {
      type: "index-meta" as const,
      icon: "📁",
      schema: {
        name: {
          type: "text" as const,
          required: true,
          title: null,
          description: null,
          default: null,
        },
      },
    },
  }

  const value = new DocFileIndexContentValue(
    data,
    { name: { type: "text", required: true } },
    defaultTestConfig,
  )
  expect(value.toJson()).toEqual(data)
})

test("DocFileIndexContentValue - toJsonでmetaのschemaが空のcustomSchemaでも含まれる", () => {
  const markdown = `---
icon: 📄
schema:
  isDone:
    type: boolean
    title: 完了
---

# 機能

テスト用のコンテンツ`

  const contentValue = DocFileIndexContentValue.fromMarkdown(
    markdown,
    {}, // 空のcustomSchema
    defaultTestConfig,
  )

  const json = contentValue.toJson()

  // metaが含まれることを確認
  expect(json.meta).toBeDefined()
  expect(json.meta.type).toBe("index-meta")
  expect(json.meta.icon).toBe("📄")

  // schemaが含まれることを確認
  expect(json.meta.schema).toBeDefined()
  expect(Object.keys(json.meta.schema)).toContain("isDone")

  // isDoneフィールドの詳細を確認
  if ("isDone" in json.meta.schema) {
    expect(json.meta.schema.isDone).toMatchObject({
      type: "boolean",
      title: "完了",
      required: false,
    })
  }
})

test("DocFileIndexContentValue - 複数のスキーマフィールドが空のcustomSchemaで正しく処理される", () => {
  const markdown = `---
icon: 📂
schema:
  status:
    type: select-text
    title: ステータス
    options:
      - draft
      - published
      - archived
  priority:
    type: number
    title: 優先度
    required: true
---

# テストディレクトリ

説明文`

  const contentValue = DocFileIndexContentValue.fromMarkdown(
    markdown,
    {}, // 空のcustomSchema
    defaultTestConfig,
  )

  const json = contentValue.toJson()

  expect(json.meta.schema).toBeDefined()
  expect(Object.keys(json.meta.schema)).toHaveLength(2)
  expect(Object.keys(json.meta.schema)).toContain("status")
  expect(Object.keys(json.meta.schema)).toContain("priority")

  if ("status" in json.meta.schema) {
    expect(json.meta.schema.status).toMatchObject({
      type: "select-text",
      title: "ステータス",
      options: ["draft", "published", "archived"],
    })
  }

  if ("priority" in json.meta.schema) {
    expect(json.meta.schema.priority).toMatchObject({
      type: "number",
      title: "優先度",
      required: true,
    })
  }
})

test("DocFileIndexContentValue - 全てのフィールドタイプが空のcustomSchemaで正しく処理される", () => {
  const markdown = `---
icon: 🗂️
schema:
  # 基本タイプ
  textField:
    type: text
    title: テキストフィールド
    required: true
  numberField:
    type: number
    title: 数値フィールド
    default: 0
  booleanField:
    type: boolean
    title: 真偽値フィールド
    required: false
  
  # 選択タイプ
  selectTextField:
    type: select-text
    title: テキスト選択
    options:
      - option1
      - option2
      - option3
  selectNumberField:
    type: select-number
    title: 数値選択
    options: [10, 20, 30]
  
  # リレーションタイプ  
  relationField:
    type: relation
    title: 単一リレーション
    path: /docs/other
  
  # 複数値タイプ
  multiTextField:
    type: multi-text
    title: 複数テキスト
    default: []
  multiNumberField:
    type: multi-number
    title: 複数数値
  multiRelationField:
    type: multi-relation
    title: 複数リレーション
    path: /docs/items
  
  # 複数選択タイプ
  multiSelectTextField:
    type: multi-select-text
    title: 複数テキスト選択
    options: ["A", "B", "C"]
  multiSelectNumberField:
    type: multi-select-number
    title: 複数数値選択
    options: [1, 2, 3, 4, 5]
---

# 全タイプテスト

全てのフィールドタイプのテスト`

  const contentValue = DocFileIndexContentValue.fromMarkdown(
    markdown,
    {}, // 空のcustomSchema
    defaultTestConfig,
  )

  const json = contentValue.toJson()
  const schema = json.meta.schema

  // 全11フィールドタイプが存在することを確認
  expect(Object.keys(schema)).toHaveLength(11)

  // 基本タイプのチェック
  if ("textField" in schema) {
    expect(schema.textField).toMatchObject({
      type: "text",
      title: "テキストフィールド",
      required: true,
    })
  }

  if ("numberField" in schema) {
    expect(schema.numberField).toMatchObject({
      type: "number",
      title: "数値フィールド",
      default: 0,
    })
  }

  if ("booleanField" in schema) {
    expect(schema.booleanField).toMatchObject({
      type: "boolean",
      title: "真偽値フィールド",
      required: false,
    })
  }

  // 選択タイプのチェック
  if ("selectTextField" in schema) {
    expect(schema.selectTextField).toMatchObject({
      type: "select-text",
      title: "テキスト選択",
      options: ["option1", "option2", "option3"],
    })
  }

  if ("selectNumberField" in schema) {
    expect(schema.selectNumberField).toMatchObject({
      type: "select-number",
      title: "数値選択",
      options: [10, 20, 30],
    })
  }

  // リレーションタイプのチェック
  if ("relationField" in schema) {
    expect(schema.relationField).toMatchObject({
      type: "relation",
      title: "単一リレーション",
      path: "/docs/other",
    })
  }

  // 複数値タイプのチェック
  if ("multiTextField" in schema) {
    expect(schema.multiTextField).toMatchObject({
      type: "multi-text",
      title: "複数テキスト",
      default: [],
    })
  }

  if ("multiNumberField" in schema) {
    expect(schema.multiNumberField).toMatchObject({
      type: "multi-number",
      title: "複数数値",
    })
  }

  if ("multiRelationField" in schema) {
    expect(schema.multiRelationField).toMatchObject({
      type: "multi-relation",
      title: "複数リレーション",
      path: "/docs/items",
    })
  }

  // 複数選択タイプのチェック
  if ("multiSelectTextField" in schema) {
    expect(schema.multiSelectTextField).toMatchObject({
      type: "multi-select-text",
      title: "複数テキスト選択",
      options: ["A", "B", "C"],
    })
  }

  if ("multiSelectNumberField" in schema) {
    expect(schema.multiSelectNumberField).toMatchObject({
      type: "multi-select-number",
      title: "複数数値選択",
      options: [1, 2, 3, 4, 5],
    })
  }
})
