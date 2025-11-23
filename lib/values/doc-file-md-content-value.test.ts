import { expect, test } from "bun:test"
import { DocFileMdContentValue } from "./doc-file-md-content-value"
import { DocFileMdMetaValue } from "./doc-file-md-meta-value"

test("DocFileContentMdValue - 基本的な作成とプロパティアクセス", () => {
  const value = new DocFileMdContentValue(
    {
      type: "markdown-content",
      body: "本文です",
      title: "タイトル",
      description: "説明文",
      meta: {},
    },
    {},
  )

  expect(value.value.type).toBe("markdown-content")
  expect(value.value.body).toBe("本文です")
  expect(value.value.title).toBe("タイトル")
  expect(value.value.description).toBe("説明文")
  expect(value.body).toBe("本文です")
  expect(value.title).toBe("タイトル")
  expect(value.description).toBe("説明文")
})

test("DocFileContentMdValue - frontMatter メソッドが値オブジェクトを返す", () => {
  const value = new DocFileMdContentValue(
    {
      type: "markdown-content",
      body: "",
      title: "",
      description: "",
      meta: {
        author: "作者名",
      },
    },
    {
      author: { type: "text", required: true },
    },
  )

  const frontMatter = value.meta()
  expect(frontMatter).toBeInstanceOf(DocFileMdMetaValue)
  expect(frontMatter.value.author).toBe("作者名")
})

test("DocFileContentMdValue - withTitleで新しいインスタンスを作成", () => {
  const value = new DocFileMdContentValue(
    {
      type: "markdown-content",
      body: "# 古いタイトル\n\n説明文",
      title: "古いタイトル",
      description: "説明文",
      meta: {},
    },
    {},
  )

  const newValue = value.withTitle("新しいタイトル")

  expect(newValue).not.toBe(value)
  expect(newValue.title).toBe("新しいタイトル")
  expect(newValue.description).toBe("説明文")
  expect(value.title).toBe("古いタイトル") // 元のインスタンスは変更されない
})

test("DocFileContentMdValue - withDescriptionで新しいインスタンスを作成", () => {
  const value = new DocFileMdContentValue(
    {
      type: "markdown-content",
      body: "# タイトル\n\n古い説明文",
      title: "タイトル",
      description: "古い説明文",
      meta: {},
    },
    {},
  )

  const newValue = value.withDescription("新しい説明文")

  expect(newValue).not.toBe(value)
  expect(newValue.title).toBe("タイトル")
  expect(newValue.description).toBe("新しい説明文")
  expect(value.description).toBe("古い説明文") // 元のインスタンスは変更されない
})

test("DocFileContentMdValue - withContentで新しいインスタンスを作成", () => {
  const value = new DocFileMdContentValue(
    {
      type: "markdown-content",
      body: "古い本文",
      title: "タイトル",
      description: "説明",
      meta: { author: "作者" },
    },
    {},
  )

  const newValue = value.withContent("# 新しいタイトル\n\n新しい本文")

  expect(newValue).not.toBe(value)
  expect(newValue.body).toBe("# 新しいタイトル\n\n新しい本文")
  expect(newValue.title).toBe("新しいタイトル")
  expect(value.body).toBe("古い本文") // 元のインスタンスは変更されない
})

test("DocFileContentMdValue - withFrontMatterで新しいインスタンスを作成", () => {
  const customSchema = {
    author: { type: "text" as const, required: true },
    tags: { type: "multi-text" as const, required: false },
  }

  const value = new DocFileMdContentValue(
    {
      type: "markdown-content",
      body: "本文",
      title: "タイトル",
      description: "説明",
      meta: { author: "旧作者", tags: [] },
    },
    customSchema,
  )

  const newFrontMatter = new DocFileMdMetaValue(
    {
      author: "新作者",
      tags: ["tag1"],
    },
    customSchema,
  )
  const newValue = value.withMeta(newFrontMatter)

  expect(newValue).not.toBe(value)
  expect(newValue.meta().value.author).toBe("新作者")
  expect(newValue.meta().value.tags).toEqual(["tag1"])
  expect(value.meta().value.author).toBe("旧作者") // 元のインスタンスは変更されない
})

test("DocFileContentMdValue - fromMarkdownでMarkdownから生成", () => {
  const markdown = `# 見出し

説明文です。

本文です。`

  const value = DocFileMdContentValue.fromMarkdown(markdown, {
    title: { type: "text", required: true },
    tags: { type: "multi-text", required: false },
  })

  expect(value.title).toBe("見出し")
  expect(value.description).toBe("説明文です。")
  expect(value.body).toContain("# 見出し")
  expect(value.body).toContain("本文です。")
  // FrontMatterにデフォルト値が含まれる
  const fm = value.meta()
  expect(fm.value.title).toBe("") // デフォルト値
  expect(fm.value.tags).toEqual([]) // デフォルト値
})

test("DocFileContentMdValue - emptyでデフォルトコンテンツを生成", () => {
  const value = DocFileMdContentValue.empty("新規ドキュメント", {})

  expect(value.title).toBe("新規ドキュメント")
  expect(value.description).toBe("")
  expect(value.body).toBe("# 新規ドキュメント")
  expect(value.meta().value).toEqual({})
})

test("DocFileContentMdValue - toTextでFrontMatter付きテキストを生成", () => {
  const value = new DocFileMdContentValue(
    {
      type: "markdown-content",
      body: "# タイトル\n\n本文",
      title: "タイトル",
      description: "説明",
      meta: {
        author: "作者",
        tags: ["tag1", "tag2"],
      },
    },
    {},
  )

  const text = value.toText()

  expect(text).toContain("---")
  expect(text).toContain("author: 作者")
  expect(text).toContain("tags:")
  expect(text).toContain("  - tag1")
  expect(text).toContain("  - tag2")
  expect(text).toContain("# タイトル")
  expect(text).toContain("本文")
})

test("DocFileContentMdValue - bodyでコンテンツのみを取得", () => {
  const value = new DocFileMdContentValue(
    {
      type: "markdown-content",
      body: "既存の本文",
      title: "新タイトル",
      description: "新説明",
      meta: {},
    },
    {},
  )

  const text = value.body

  expect(text).toBe("既存の本文")
  expect(text).not.toContain("---") // FrontMatterは含まない
})

test("DocFileContentMdValue - toJsonで元のデータ構造を返す", () => {
  const data = {
    type: "markdown-content" as const,
    body: "本文",
    title: "タイトル",
    description: "説明",
    meta: { author: "作者" },
  }

  const value = new DocFileMdContentValue(data, {})

  expect(value.toJson()).toEqual(data)
})

test("DocFileContentMdValue - frontMatterメソッドでカスタムスキーマを指定", () => {
  const customSchema = {
    author: { type: "text" as const, required: true },
    published: { type: "boolean" as const, required: true },
    tags: { type: "multi-text" as const, required: false },
  }

  const value = new DocFileMdContentValue(
    {
      type: "markdown-content",
      body: "",
      title: "",
      description: "",
      meta: {
        author: "作者名",
        published: true,
        tags: ["tech", "typescript"],
      },
    },
    customSchema,
  )

  const meta = value.meta()

  // 型安全なアクセス
  expect(meta.text("author")).toBe("作者名")
  expect(meta.boolean("published")).toBe(true)
  expect(meta.multiText("tags")).toEqual(["tech", "typescript"])

  // toJsonで全体を取得
  expect(meta.toJson()).toEqual({
    author: "作者名",
    published: true,
    tags: ["tech", "typescript"],
  })
})
