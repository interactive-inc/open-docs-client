import { expect, test } from "bun:test"
import { DocMarkdownSystem } from "./doc-markdown-system"

// 基本的な解析機能
test("Markdownの基本構造を解析できる", () => {
  const markdown = `---
title: "Test"
---

# タイトル

これは説明文です。

本文の内容です。`

  const system = new DocMarkdownSystem()

  expect(system.extractFrontMatter(markdown)).toBe(`title: "Test"`)
  expect(system.extractBody(markdown)).toBe(`# タイトル

これは説明文です。

本文の内容です。`)
  expect(system.extractTitle(markdown)).toBe("タイトル")
  expect(system.extractDescription(markdown)).toBe("これは説明文です。")
})

// エッジケース: FrontMatterなし
test("FrontMatterがなくても正常に動作する", () => {
  const markdown = `# タイトル

説明文です。`

  const system = new DocMarkdownSystem()

  expect(system.extractFrontMatter(markdown)).toBeNull()
  expect(system.extractBody(markdown)).toBe(markdown)
  expect(system.extractTitle(markdown)).toBe("タイトル")
  expect(system.extractDescription(markdown)).toBe("説明文です。")
})

// エッジケース: 変則的なFrontMatter区切り
test("異なる長さのFrontMatter区切り線を認識する", () => {
  const markdown = `-----
title: "Test"
-----

# タイトル`

  const system = new DocMarkdownSystem()

  expect(system.extractFrontMatter(markdown)).toBe(`title: "Test"`)
  expect(system.extractBody(markdown)).toBe("# タイトル")
})

// エッジケース: タイトルや説明の欠落
test("タイトルや説明が欠けている場合の処理", () => {
  const system = new DocMarkdownSystem()

  expect(system.extractTitle("本文のみ")).toBeNull()
  expect(system.extractDescription("本文のみ")).toBeNull()

  const markdownNoDesc = "# タイトル\n\n## サブタイトル"
  expect(system.extractTitle(markdownNoDesc)).toBe("タイトル")
  expect(system.extractDescription(markdownNoDesc)).toBeNull()
})

// タイトル更新の主要ケース
test("タイトルの更新と追加", () => {
  const system = new DocMarkdownSystem()

  // 既存タイトルの更新
  const markdown1 = "# 古いタイトル\n\n説明文"
  const updated1 = system.updateTitle(markdown1, "新しいタイトル")
  expect(system.extractBody(updated1)).toBe("# 新しいタイトル\n\n説明文")
  expect(system.extractTitle(updated1)).toBe("新しいタイトル")

  // タイトルの新規追加
  const markdown2 = "説明文のみ"
  const updated2 = system.updateTitle(markdown2, "新規タイトル")
  expect(system.extractBody(updated2)).toBe("# 新規タイトル\n\n説明文のみ")
  expect(system.extractTitle(updated2)).toBe("新規タイトル")
})

// 説明更新の主要ケース
test("説明の更新と追加", () => {
  const system = new DocMarkdownSystem()

  // 既存説明の更新
  const markdown1 = "# タイトル\n\n古い説明\n\n本文"
  const updated1 = system.updateDescription(
    markdown1,
    "新しい説明",
    "デフォルト",
  )
  expect(system.extractDescription(updated1)).toBe("新しい説明")

  // 説明の新規追加（タイトルあり）
  const markdown2 = "# タイトル\n\n## サブタイトル"
  const updated2 = system.updateDescription(
    markdown2,
    "新しい説明",
    "デフォルト",
  )
  expect(system.extractBody(updated2)).toBe(
    "# タイトル\n\n新しい説明\n\n## サブタイトル",
  )

  // タイトルも説明もない場合
  const markdown3 = "本文のみ"
  const updated3 = system.updateDescription(markdown3, "説明", "新規タイトル")
  expect(system.extractBody(updated3)).toBe(
    "# 新規タイトル\n\n説明\n\n本文のみ",
  )
  expect(system.extractTitle(updated3)).toBe("新規タイトル")
  expect(system.extractDescription(updated3)).toBe("説明")
})

// FrontMatter保持の確認
test("更新操作でFrontMatterが保持される", () => {
  const markdown = `---
title: "Test"
description: "Test Description"
---

# 古いタイトル

古い説明`

  const system = new DocMarkdownSystem()
  const updated = system.updateTitle(markdown, "新しいタイトル")

  expect(system.extractFrontMatter(updated)).toBe(`title: "Test"
description: "Test Description"`)
  expect(updated).toContain('---\ntitle: "Test"')
  expect(updated).toContain("# 新しいタイトル")
})

// 静的メソッドのテスト
test("from メソッドでMarkdownを生成", () => {
  expect(DocMarkdownSystem.from("タイトル", "説明", "本文")).toBe(
    "# タイトル\n\n説明\n\n本文",
  )

  expect(DocMarkdownSystem.from("", "説明", "本文")).toBe("説明\n\n本文")

  expect(DocMarkdownSystem.from("タイトル", "", "本文")).toBe(
    "# タイトル\n\n本文",
  )
})

// 空行スキップのエッジケース
test("複数の空行を正しく処理する", () => {
  const markdown = `# タイトル


説明文です。`

  const system = new DocMarkdownSystem()
  expect(system.extractDescription(markdown)).toBe("説明文です。")
})
