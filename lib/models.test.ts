import { expect, test } from "bun:test"
import type { z } from "zod"
import {
  zDocClientConfig,
  zDocCustomSchema,
  zDocCustomSchemaField,
  zDocFile,
  zDocFileIndexContent,
  zDocFileIndexSchema,
  zDocFileMdContent,
  zDocFilePath,
  zDocMetaFieldMultiText,
  zDocMetaFieldNumber,
  zDocMetaFieldText,
  zDocMetaFieldType,
} from "./models"
import type { Equals } from "./types"
import { assertType } from "./utils"

test("zDocFilePath - ファイルパス情報の構造", () => {
  const validPath = {
    name: "test",
    path: "/docs/test.md",
    fullPath: "/Users/project/docs/test.md",
    nameWithExtension: "test.md",
  }

  // バリデーション成功
  expect(() => zDocFilePath.parse(validPath)).not.toThrow()

  // 型推論のテスト
  type PathType = z.infer<typeof zDocFilePath>
  assertType<
    Equals<
      PathType,
      {
        name: string
        path: string
        fullPath: string
        nameWithExtension: string
      }
    >
  >()
})

test("zDocMetaFieldType - すべてのフィールドタイプ", () => {
  const allFieldTypes = [
    "text",
    "number",
    "boolean",
    "select-text",
    "select-number",
    "relation",
    "multi-text",
    "multi-number",
    "multi-relation",
    "multi-select-text",
    "multi-select-number",
  ]

  // すべて有効
  for (const fieldType of allFieldTypes) {
    expect(() => zDocMetaFieldType.parse(fieldType)).not.toThrow()
  }

  // 無効な型
  expect(() => zDocMetaFieldType.parse("invalid-type")).toThrow()

  // 型推論のテスト
  type FieldType = z.infer<typeof zDocMetaFieldType>
  assertType<
    Equals<
      FieldType,
      | "text"
      | "number"
      | "boolean"
      | "select-text"
      | "select-number"
      | "relation"
      | "multi-text"
      | "multi-number"
      | "multi-relation"
      | "multi-select-text"
      | "multi-select-number"
    >
  >()
})

test("zDocMetaFieldText - テキストフィールドの構造", () => {
  // zDocMetaFieldText は単純な nullable string
  const validTextField = "テスト文字列"
  const nullTextField = null

  expect(() => zDocMetaFieldText.parse(validTextField)).not.toThrow()
  expect(() => zDocMetaFieldText.parse(nullTextField)).not.toThrow()

  // 型推論のテスト
  type TextFieldType = z.infer<typeof zDocMetaFieldText>
  assertType<Equals<TextFieldType, string | null>>()
})

test("zDocMetaFieldNumber - 数値フィールドの構造", () => {
  // zDocMetaFieldNumber は単純な nullable number
  const validNumberField = 42
  const nullNumberField = null

  expect(() => zDocMetaFieldNumber.parse(validNumberField)).not.toThrow()
  expect(() => zDocMetaFieldNumber.parse(nullNumberField)).not.toThrow()

  // 型推論のテスト
  type NumberFieldType = z.infer<typeof zDocMetaFieldNumber>
  assertType<Equals<NumberFieldType, number | null>>()
})

test("zDocMetaFieldMultiText - 複数テキストフィールドの構造", () => {
  // zDocMetaFieldMultiText は string[]
  const validMultiTextField = ["tag1", "tag2", "tag3"]
  const emptyArray: string[] = []

  expect(() => zDocMetaFieldMultiText.parse(validMultiTextField)).not.toThrow()
  expect(() => zDocMetaFieldMultiText.parse(emptyArray)).not.toThrow()

  // 型推論のテスト
  type MultiTextFieldType = z.infer<typeof zDocMetaFieldMultiText>
  assertType<Equals<MultiTextFieldType, string[]>>()
})

test("zDocCustomSchemaField - カスタムスキーマフィールドの構造", () => {
  const validSchemaField = {
    type: "text",
    required: true,
    title: "タイトル",
    description: "説明文",
    default: "デフォルト値",
  }

  expect(() => zDocCustomSchemaField.parse(validSchemaField)).not.toThrow()

  // nullableフィールド
  const nullableField = {
    type: "number",
    required: false,
    title: null,
    description: null,
    default: null,
  }

  expect(() => zDocCustomSchemaField.parse(nullableField)).not.toThrow()

  // 型推論のテスト
  // zDocCustomSchemaField はunion型なので、各フィールドには type と required プロパティがある
  // 型の構造をコメントで確認
})

test("zDocCustomSchema - カスタムスキーマ全体の構造", () => {
  const validSchema = {
    title: { type: "text" as const, required: true },
    description: { type: "text" as const, required: false },
    viewCount: { type: "number" as const, required: true },
    tags: { type: "multi-text" as const, required: false },
    author: { type: "relation" as const, required: true },
  }

  // バリデーション成功
  const parsed = zDocCustomSchema.parse(validSchema)
  expect(parsed).toEqual(validSchema)

  // 型推論のテスト
  type CustomSchemaType = z.infer<typeof zDocCustomSchema>
  type CustomSchemaFieldType = z.infer<typeof zDocCustomSchemaField>
  // Record<string, zDocCustomSchemaField> として推論される
  assertType<Equals<CustomSchemaType, Record<string, CustomSchemaFieldType>>>()
})

test("zDocFileMdContent - Markdownコンテンツの構造", () => {
  const validMdContent = {
    type: "markdown-content",
    body: "# 見出し\n\n本文",
    title: "タイトル",
    description: "説明",
    meta: {
      author: "著者名",
      tags: ["tag1", "tag2"],
    },
  }

  expect(() => zDocFileMdContent.parse(validMdContent)).not.toThrow()

  // 型推論のテスト
  type MdContentType = z.infer<typeof zDocFileMdContent>
  assertType<Equals<MdContentType["type"], "markdown-content">>()
  assertType<Equals<MdContentType["body"], string>>()
  assertType<Equals<MdContentType["title"], string>>()
  assertType<Equals<MdContentType["description"], string>>()
  // frontMatter の型は実際にはより複雑な構造を持つ
})

test("zDocFileIndexContent - Indexコンテンツの構造", () => {
  const validIndexContent = {
    type: "markdown-index", // 正しい型に修正
    body: "# インデックス",
    title: "インデックスタイトル",
    description: "インデックス説明",
    meta: {
      type: "index-meta",
      icon: "📁",
      schema: {
        name: {
          type: "text",
          required: true,
          title: "名前",
          description: "項目の名前",
          default: "",
        },
      },
    },
  }

  expect(() => zDocFileIndexContent.parse(validIndexContent)).not.toThrow()

  // 型推論のテスト
  type IndexContentType = z.infer<typeof zDocFileIndexContent>
  assertType<Equals<IndexContentType["type"], "markdown-index">>()
  assertType<Equals<IndexContentType["body"], string>>()
  type FrontMatterType = IndexContentType["meta"]
  assertType<Equals<FrontMatterType["type"], "index-meta">>()
  assertType<Equals<FrontMatterType["icon"], string | null>>()
  // schema の型は実際にはより複雑な構造を持つ
})

test("zDocFile - ファイル全体の構造", () => {
  // Markdownファイル
  const validMdFile = {
    type: "markdown",
    path: {
      name: "test",
      path: "/docs/test.md",
      fullPath: "/Users/project/docs/test.md",
      nameWithExtension: "test.md",
    },
    content: {
      type: "markdown-content",
      body: "本文",
      title: "タイトル",
      description: "説明",
      meta: {},
    },
    isArchived: false,
  }

  expect(() => zDocFile.parse(validMdFile)).not.toThrow()

  // Indexファイル
  const validIndexFile = {
    type: "index",
    path: {
      name: "index",
      path: "/docs/index.md",
      fullPath: "/Users/project/docs/index.md",
      nameWithExtension: "index.md",
    },
    content: {
      type: "markdown-index", // 正しい型に修正
      body: "本文",
      title: "タイトル",
      description: "説明",
      meta: {
        type: "index-meta",
        icon: "📁",
        schema: {},
      },
    },
    isArchived: false,
  }

  expect(() => zDocFile.parse(validIndexFile)).not.toThrow()

  // 型推論のテスト
  type FileType = z.infer<typeof zDocFile>
  assertType<Equals<FileType["type"], "markdown" | "index" | "unknown">>()
  assertType<Equals<FileType["isArchived"], boolean>>()
  assertType<Equals<FileType["path"], z.infer<typeof zDocFilePath>>>()
})

test("zDocClientConfig - クライアント設定の構造", () => {
  const validConfig = {
    defaultIndexIcon: "📂",
    indexFileName: "index.md",
    archiveDirectoryName: "_",
    defaultDirectoryName: "Directory",
    indexMetaIncludes: [],
    directoryExcludes: [".vitepress"],
  }

  expect(() => zDocClientConfig.parse(validConfig)).not.toThrow()

  // 必須フィールドが足りない場合はエラー
  expect(() => zDocClientConfig.parse({})).toThrow()

  // 型推論のテスト
  type ConfigType = z.infer<typeof zDocClientConfig>
  assertType<
    Equals<
      ConfigType,
      {
        defaultIndexIcon: string
        indexFileName: string
        archiveDirectoryName: string
        defaultDirectoryName: string
        indexMetaIncludes: string[]
        directoryExcludes: string[]
      }
    >
  >()
})

test("zDocFileIndexSchema - Indexスキーマの高度な型推論", () => {
  const validIndexSchema = {
    name: {
      type: "text",
      required: true,
      title: "名前",
      description: "項目名",
      default: "",
    },
    items: {
      type: "multi-relation",
      required: false,
      path: "../items",
      title: "関連項目",
      description: null,
      default: [],
    },
  }

  expect(() => zDocFileIndexSchema.parse(validIndexSchema)).not.toThrow()

  // 型推論のテスト
  // Record<string, unknown> として推論される
  // IndexSchemaType の型は実際にはより複雑な構造を持つ
})
