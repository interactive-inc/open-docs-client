import { expect, test } from "bun:test"
import type { Equals } from "../types"
import { assertType, expectType } from "../utils"
import { DocFileMdContentValue } from "../values/doc-file-md-content-value"
import { DocFileMdEntity } from "./doc-file-md-entity"

test("DocFileMdEntity - 基本的な作成とプロパティアクセス", () => {
  const entity = new DocFileMdEntity(
    {
      type: "markdown",
      content: {
        type: "markdown-content",
        body: "# タイトル\n\n説明文\n\n本文",
        title: "タイトル",
        description: "説明文",
        meta: {
          title: "メタタイトル",
          tags: ["tag1", "tag2"],
        },
      },
      path: {
        path: "docs/example.md",
        name: "example",
        fullPath: "/Users/test/docs/example.md",
        nameWithExtension: "example.md",
      },
      isArchived: false,
    },
    {
      title: { type: "text", required: false },
      tags: { type: "multi-text", required: false },
    },
  )

  expect(entity.value.type).toBe("markdown")
  expect(entity.value.isArchived).toBe(false)
})

test("DocFileMdEntity - content getterが値オブジェクトを返す", () => {
  const entity = new DocFileMdEntity(
    {
      type: "markdown",
      content: {
        type: "markdown-content",
        body: "# タイトル\n\n説明文",
        title: "タイトル",
        description: "説明文",
        meta: {
          title: "FrontMatterタイトル",
          tags: ["tag1", "tag2"],
        },
      },
      path: {
        path: "docs/test.md",
        name: "test",
        fullPath: "/Users/test/docs/test.md",
        nameWithExtension: "test.md",
      },
      isArchived: false,
    },
    {
      title: { type: "text", required: false },
      tags: { type: "multi-text", required: false },
    },
  )

  const content = entity.content()
  expect(content).toBeInstanceOf(DocFileMdContentValue)
  expect(content.title).toBe("タイトル")
  expect(content.description).toBe("説明文")
  expect(content.body).toBe("# タイトル\n\n説明文")
})

test("DocFileMdEntity - path getterが値オブジェクトを返す", () => {
  const entity = new DocFileMdEntity(
    {
      type: "markdown",
      content: {
        type: "markdown-content",
        body: "",
        title: "",
        description: "",
        meta: {
          title: "メタタイトル",
          tags: ["tag1", "tag2"],
        },
      },
      path: {
        path: "docs/test.md",
        name: "test",
        fullPath: "/Users/test/docs/test.md",
        nameWithExtension: "test.md",
      },
      isArchived: false,
    },
    {
      title: { type: "text", required: false },
      tags: { type: "multi-text", required: false },
    },
  )

  const path = entity.path
  expect(path.name).toBe("test")
  expect(path.path).toBe("docs/test.md")
  expect(path.fullPath).toBe("/Users/test/docs/test.md")
  expect(path.nameWithExtension).toBe("test.md")
})

test("DocFileMdEntity - withContentで新しいインスタンスを作成", () => {
  const entity = new DocFileMdEntity(
    {
      type: "markdown",
      content: {
        type: "markdown-content",
        body: "# 古いタイトル",
        title: "古いタイトル",
        description: "",
        meta: {
          title: "古いタイトル",
          tags: [],
        },
      },
      path: {
        path: "docs/test.md",
        name: "test",
        fullPath: "/Users/test/docs/test.md",
        nameWithExtension: "test.md",
      },
      isArchived: false,
    },
    {
      title: { type: "text", required: false },
      tags: { type: "multi-text", required: false },
    },
  )

  const newContent = entity.content().withTitle("新しいタイトル")
  const newEntity = entity.withContent(newContent)

  expect(newEntity).not.toBe(entity) // 新しいインスタンス
  expect(newEntity.content().title).toBe("新しいタイトル")
  expect(entity.content().title).toBe("古いタイトル") // 元は変更されない
})

test("DocFileMdEntity - withContent関数オーバーロードで新しいインスタンスを作成", () => {
  const entity = new DocFileMdEntity(
    {
      type: "markdown",
      content: {
        type: "markdown-content",
        body: "# 古いタイトル\n\n古い本文",
        title: "古いタイトル",
        description: "古い説明",
        meta: {
          title: "古いタイトル",
          tags: ["old"],
        },
      },
      path: {
        path: "docs/test.md",
        name: "test",
        fullPath: "/Users/test/docs/test.md",
        nameWithExtension: "test.md",
      },
      isArchived: false,
    },
    {
      title: { type: "text", required: false },
      tags: { type: "multi-text", required: false },
    },
  )

  // 関数を使ったコンテンツの更新
  const newEntity = entity.withContent((content) =>
    content.withTitle("更新されたタイトル").withDescription("更新された説明"),
  )

  expect(newEntity).not.toBe(entity) // 新しいインスタンス
  expect(newEntity.content().title).toBe("更新されたタイトル")
  expect(newEntity.content().description).toBe("更新された説明")
  expect(entity.content().title).toBe("古いタイトル") // 元は変更されない
  expect(entity.content().description).toBe("古い説明") // 元は変更されない

  // チェーンされた更新も可能
  const chainedEntity = entity
    .withContent((content) => content.withTitle("チェーン1"))
    .withContent((content) => content.withDescription("チェーン2"))

  expect(chainedEntity.content().title).toBe("チェーン1")
  expect(chainedEntity.content().description).toBe("チェーン2")
})

test("DocFileMdEntity - withPath関数オーバーロードで新しいインスタンスを作成", () => {
  const entity = new DocFileMdEntity(
    {
      type: "markdown",
      content: {
        type: "markdown-content",
        body: "",
        title: "",
        description: "",
        meta: {
          tags: [],
          title: "タイトル",
        },
      },
      path: {
        path: "docs/old.md",
        name: "old",
        fullPath: "/Users/test/docs/old.md",
        nameWithExtension: "old.md",
      },
      isArchived: false,
    },
    {
      title: { type: "text", required: false },
      tags: { type: "multi-text", required: false },
    },
  )

  // 関数を使ったパスの更新
  const newEntity = entity.withPath((path) => ({
    ...path,
    path: "docs/updated.md",
    name: "updated",
    nameWithExtension: "updated.md",
  }))

  expect(newEntity).not.toBe(entity) // 新しいインスタンス
  expect(newEntity.path.path).toBe("docs/updated.md")
  expect(newEntity.path.name).toBe("updated")
  expect(entity.path.path).toBe("docs/old.md") // 元は変更されない
})

test("DocFileMdEntity - withMeta関数オーバーロードで新しいインスタンスを作成", () => {
  const entity = new DocFileMdEntity(
    {
      type: "markdown",
      content: {
        type: "markdown-content",
        body: "本文",
        title: "タイトル",
        description: "説明",
        meta: {
          title: "元のタイトル",
          tags: ["old"],
          priority: 1,
        },
      },
      path: {
        path: "docs/test.md",
        name: "test",
        fullPath: "/Users/test/docs/test.md",
        nameWithExtension: "test.md",
      },
      isArchived: false,
    },
    {
      title: { type: "text", required: false },
      tags: { type: "multi-text", required: false },
      priority: { type: "number", required: false },
    },
  )

  // 関数を使ったメタデータの更新
  const newEntity = entity.withMeta((meta) =>
    meta.withProperty("tags", ["new", "updated"]).withProperty("priority", 5),
  )

  expect(newEntity).not.toBe(entity) // 新しいインスタンス
  const newMeta = newEntity.content().meta()
  expect(newMeta.multiText("tags")).toEqual(["new", "updated"])
  expect(newMeta.number("priority")).toBe(5)

  const oldMeta = entity.content().meta()
  expect(oldMeta.multiText("tags")).toEqual(["old"]) // 元は変更されない
  expect(oldMeta.number("priority")).toBe(1) // 元は変更されない
})

test("DocFileMdEntity - withPathで新しいインスタンスを作成", () => {
  const entity = new DocFileMdEntity(
    {
      type: "markdown",
      content: {
        type: "markdown-content",
        body: "",
        title: "",
        description: "",
        meta: {
          tags: [],
          title: "タイトル",
        },
      },
      path: {
        path: "docs/old.md",
        name: "old",
        fullPath: "/Users/test/docs/old.md",
        nameWithExtension: "old.md",
      },
      isArchived: false,
    },
    {
      title: { type: "text", required: false },
      tags: { type: "multi-text", required: false },
    },
  )

  const newPath = {
    path: "docs/new.md",
    name: "new",
    fullPath: "/Users/test/docs/new.md",
    nameWithExtension: "new.md",
  }
  const newEntity = entity.withPath(newPath)

  expect(newEntity).not.toBe(entity) // 新しいインスタンス
  expect(newEntity.path.path).toBe("docs/new.md")
  expect(newEntity.path.name).toBe("new")
  expect(entity.path.path).toBe("docs/old.md") // 元は変更されない
})

test("DocFileMdEntity - toJsonで元のデータ構造を返す", () => {
  const data = {
    type: "markdown" as const,
    content: {
      type: "markdown-content" as const,
      body: "# タイトル\n\n本文",
      title: "タイトル",
      description: "説明",
      meta: {
        date: "2024-01-01",
        author: "作者",
      },
    },
    path: {
      path: "docs/test.md",
      name: "test",
      fullPath: "/Users/test/docs/test.md",
      nameWithExtension: "test.md",
    },
    isArchived: false,
  }

  const entity = new DocFileMdEntity(data, {
    date: { type: "text", required: false },
    author: { type: "text", required: false },
  })
  expect(entity.toJson()).toEqual(data)
})

test("DocFileMdEntity - 不変性の確認", () => {
  const entity = new DocFileMdEntity(
    {
      type: "markdown",
      content: {
        type: "markdown-content",
        body: "",
        title: "",
        description: "",
        meta: {
          tags: [],
          title: "タイトル",
        },
      },
      path: {
        path: "docs/test.md",
        name: "test",
        fullPath: "/Users/test/docs/test.md",
        nameWithExtension: "test.md",
      },
      isArchived: false,
    },
    {
      title: { type: "text", required: false },
      tags: { type: "multi-text", required: false },
    },
  )

  expect(() => {
    // @ts-expect-error - 不変性のテスト
    entity.value = {}
  }).toThrow()
})

test("DocFileMdEntity - ジェネリック型パラメータの推論", () => {
  type TestSchema = {
    title: { type: "text"; required: true }
    tags: { type: "multi-text"; required: false }
    publishedAt: { type: "text"; required: true }
    author: { type: "relation"; required: false }
  }

  const entity = new DocFileMdEntity<TestSchema>(
    {
      type: "markdown",
      content: {
        type: "markdown-content",
        body: "本文",
        title: "タイトル",
        description: "説明",
        meta: {
          title: "記事タイトル",
          publishedAt: "2024-01-01",
          tags: ["tech", "typescript"],
          author: "作者名",
        },
      },
      path: {
        path: "posts/article.md",
        name: "article",
        fullPath: "/Users/test/posts/article.md",
        nameWithExtension: "article.md",
      },
      isArchived: false,
    },
    {
      title: { type: "text", required: true },
      tags: { type: "multi-text", required: false },
      publishedAt: { type: "text", required: true },
      author: { type: "relation", required: false },
    },
  )

  // 型が正しく推論されることを確認
  expectType<DocFileMdEntity<TestSchema>>(entity)

  // content の型も正しく推論される
  const content = entity.content()
  expectType<DocFileMdContentValue<TestSchema>>(content)
})

test("DocFileMdEntity - withContent メソッドの型安全性", () => {
  type TestSchema = {
    title: { type: "text"; required: true }
    category: { type: "select-text"; required: true }
  }

  const entity = new DocFileMdEntity<TestSchema>(
    {
      type: "markdown",
      content: {
        type: "markdown-content",
        body: "元の本文",
        title: "元のタイトル",
        description: "元の説明",
        meta: {
          title: "FMタイトル",
          category: "tech",
        },
      },
      path: {
        path: "docs/test.md",
        name: "test",
        fullPath: "/Users/test/docs/test.md",
        nameWithExtension: "test.md",
      },
      isArchived: false,
    },
    {
      title: { type: "text", required: true },
      category: { type: "select-text", required: true },
    },
  )

  // 新しいコンテンツも同じ型制約を持つ
  const newContent = new DocFileMdContentValue<TestSchema>(
    {
      type: "markdown-content",
      body: "新しい本文",
      title: "新しいタイトル",
      description: "新しい説明",
      meta: {
        title: "新FMタイトル",
        category: "news",
      },
    },
    {
      title: { type: "text", required: true },
      category: { type: "select-text", required: true },
    },
  )

  const newEntity = entity.withContent(newContent)

  // 戻り値の型が保持される
  expectType<DocFileMdEntity<TestSchema>>(newEntity)
  expect(newEntity.content().title).toBe("新しいタイトル")
})

test("DocFileMdEntity - エンティティ値の型構造", () => {
  type TestSchema = {
    tags: { type: "multi-text"; required: true }
  }

  // エンティティの値の型構造を確認
  type EntityValue = DocFileMdEntity<TestSchema>["value"]

  // 必須プロパティの確認（実際の型が期待値と異なる場合がある）
  // EntityValueには他のプロパティが含まれている可能性がある

  // type フィールドは "markdown" リテラル型
  assertType<Equals<EntityValue["type"], "markdown">>()
  assertType<Equals<EntityValue["isArchived"], boolean>>()
})

test("DocFileMdEntity - path プロパティの型", () => {
  const entity = new DocFileMdEntity(
    {
      type: "markdown",
      content: {
        type: "markdown-content",
        body: "",
        title: "",
        description: "",
        meta: {},
      },
      path: {
        path: "docs/test.md",
        name: "test",
        fullPath: "/Users/test/docs/test.md",
        nameWithExtension: "test.md",
      },
      isArchived: false,
    },
    {},
  )

  // path ゲッターの戻り値の型
  const path = entity.path
  expectType<string>(path.path)
  expectType<string>(path.name)
  expectType<string>(path.fullPath)
  expectType<string>(path.nameWithExtension)
})

test("DocFileMdEntity - frontMatter へのアクセスの型安全性", () => {
  type TestSchema = {
    title: { type: "text"; required: true }
    count: { type: "number"; required: false }
    flags: { type: "multi-text"; required: true }
  }

  const entity = new DocFileMdEntity<TestSchema>(
    {
      type: "markdown",
      content: {
        type: "markdown-content",
        body: "本文",
        title: "タイトル",
        description: "説明",
        meta: {
          title: "FMタイトル",
          count: 42,
          flags: ["important", "featured"],
        },
      },
      path: {
        path: "docs/test.md",
        name: "test",
        fullPath: "/Users/test/docs/test.md",
        nameWithExtension: "test.md",
      },
      isArchived: false,
    },
    {
      title: { type: "text", required: true },
      count: { type: "number", required: false },
      flags: { type: "multi-text", required: true },
    },
  )

  // frontMatter へのアクセス
  const fm = entity.content().meta()

  // 型安全なアクセス
  expect(fm.value.title).toBe("FMタイトル")
  expect(fm.value.count).toBe(42)
  expect(fm.value.flags).toEqual(["important", "featured"])

  // 個別フィールドへのアクセス
  expect(fm.text("title")).toBe("FMタイトル")
  expect(fm.number("count")).toBe(42)
  expect(fm.multiText("flags")).toEqual(["important", "featured"])
})
