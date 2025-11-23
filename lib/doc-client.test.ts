import { expect, test } from "bun:test"
import { DocClient } from "./doc-client"
import { DocFileSystemMock } from "./modules/file-system/doc-file-system-mock"
import { DocMarkdownSystem } from "./modules/markdown-system/doc-markdown-system"
import { DocPathSystem } from "./modules/path-system/doc-path-system"

// 共通のMockインスタンスを作成（自動的にmockDirectoryDataが読み込まれる）
const fileSystemMock = DocFileSystemMock.create()

test("DocClient - デフォルト値でインスタンスを作成", () => {
  const client = new DocClient({ fileSystem: fileSystemMock })

  expect(client.fileSystem).toBe(fileSystemMock)
  expect(client.pathSystem).toBeInstanceOf(DocPathSystem)
  expect(client.markdownSystem).toBeInstanceOf(DocMarkdownSystem)
  expect(client.config.indexFileName).toBe("index.md")
  expect(client.config.archiveDirectoryName).toBe("_")
})

test("DocClient - カスタム値でインスタンスを作成", () => {
  const markdownSystem = new DocMarkdownSystem()

  const client = new DocClient({
    fileSystem: fileSystemMock,
    pathSystem: fileSystemMock.getPathSystem(),
    markdownSystem,
    config: {
      defaultIndexIcon: "📃",
      indexFileName: "README.md",
      archiveDirectoryName: ".archive",
      defaultDirectoryName: "Directory",
      indexMetaIncludes: [],
      directoryExcludes: [".vitepress"],
    },
  })

  expect(client.fileSystem).toBe(fileSystemMock)
  expect(client.pathSystem).toBe(fileSystemMock.getPathSystem())
  expect(client.markdownSystem).toBe(markdownSystem)
  expect(client.config.indexFileName).toBe("README.md")
  expect(client.config.archiveDirectoryName).toBe(".archive")
})

test("DocClient - basePathを取得", () => {
  // 別のbasePathでテストするため、新しいインスタンスを作成
  const customFileSystem = new DocFileSystemMock({
    basePath: "/test/docs",
    pathSystem: new DocPathSystem(),
  })
  const client = new DocClient({ fileSystem: customFileSystem })

  expect(client.basePath()).toBe("/test/docs")
})

test("DocClient - mdFileで.md拡張子を自動補完", () => {
  const client = new DocClient({ fileSystem: fileSystemMock })

  // .md拡張子がない場合は自動で補完される
  const fileWithoutExt = client.mdFile("foo")
  expect(fileWithoutExt.path).toBe("foo.md")

  // .md拡張子がある場合はそのまま
  const fileWithExt = client.mdFile("bar.md")
  expect(fileWithExt.path).toBe("bar.md")
})

test("DocClient - file()メソッドが自動的にファイルタイプを判定", () => {
  const client = new DocClient({ fileSystem: fileSystemMock })

  // index.mdを判定
  const indexRef = client.file("docs/index.md")
  expect(indexRef.constructor.name).toBe("DocFileIndexReference")

  // 通常のmarkdownファイルを判定
  const mdRef = client.file("docs/guide.md")
  expect(mdRef.constructor.name).toBe("DocFileMdReference")

  // 不明なファイルタイプを判定
  const unknownRef = client.file("docs/data.json")
  expect(unknownRef.constructor.name).toBe("DocFileUnknownReference")
})

test("DocClient - file()メソッドがサブディレクトリのindex.mdを正しく判定", () => {
  const client = new DocClient({ fileSystem: fileSystemMock })

  const indexRef = client.file("docs/posts/index.md")
  expect(indexRef.constructor.name).toBe("DocFileIndexReference")
})

test("DocClient - file()メソッドがカスタムスキーマを受け取る", () => {
  const client = new DocClient({ fileSystem: fileSystemMock })

  const schema = {
    title: { type: "text" as const, required: true },
  }

  const indexRef = client.file("docs/index.md", schema)
  expect(indexRef.constructor.name).toBe("DocFileIndexReference")

  const mdRef = client.file("docs/guide.md", schema)
  expect(mdRef.constructor.name).toBe("DocFileMdReference")
})

test("DocClient - Mockを使用した統合テスト", async () => {
  // 統合テスト用に独立したMockインスタンスを作成
  const integrationFileSystem = DocFileSystemMock.createWithFiles({
    fileContents: {
      "docs/index.md": `---
icon: 📚
---

# Documentation

Welcome to the documentation!`,
      "docs/guide/index.md": `---
icon: 📖
---

# Guide

This is a guide.`,
      "docs/guide/getting-started.md": `# Getting Started

Let's get started!`,
      "docs/guide/advanced.md": `# Advanced

Advanced topics here.`,
      "docs/api/reference.md": `# API Reference

API documentation.`,
    },
  })

  const client = new DocClient({ fileSystem: integrationFileSystem })

  // ディレクトリの取得
  const docsDir = client.directory("docs")
  const dirNames = await docsDir.directoryNames()
  expect(dirNames).toEqual(["api", "guide"])

  // index.mdファイルの存在確認
  const indexFileExists = await docsDir.indexFile().exists()
  expect(indexFileExists).toBe(true)

  // ガイドディレクトリの探索
  const guideDir = docsDir.directory("guide")
  const guideFiles = await guideDir.mdFiles()
  if (guideFiles instanceof Error) {
    throw guideFiles
  }
  expect(guideFiles.length).toBe(2) // getting-started.md, advanced.md（index.mdは除外）

  // ファイルの作成
  const newFile = await guideDir.createMdFile("new-page.md")
  expect(newFile.path).toBe("docs/guide/new-page.md")

  // ファイルの存在確認
  expect(integrationFileSystem.getFileCount()).toBe(6) // createWithFilesで作成した5ファイル + 新規ファイル(1)
})

test("DocClient - 事前定義された仮想ディレクトリ構造を使用", async () => {
  const client = new DocClient({ fileSystem: fileSystemMock })

  // 事前定義されたディレクトリ構造を使用
  const docsDir = client.directory("docs")
  const dirNames = await docsDir.directoryNames()
  expect(dirNames).toEqual(["api", "guide"]) // 事前定義された構造

  // API ディレクトリのテスト
  const apiDir = docsDir.directory("api")
  const apiFiles = await apiDir.mdFiles()
  if (apiFiles instanceof Error) {
    throw apiFiles
  }
  expect(apiFiles.length).toBe(1) // reference.mdのみ（index.mdは除外）

  // Guide ディレクトリのテスト
  const guideDir = docsDir.directory("guide")
  const guideFiles = await guideDir.mdFiles()
  if (guideFiles instanceof Error) {
    throw guideFiles
  }
  expect(guideFiles.length).toBe(2) // getting-started.md, advanced.md（index.mdは除外）

  // ファイルの存在確認
  expect(await docsDir.indexFile().exists()).toBe(true)
  expect(await apiDir.indexFile().exists()).toBe(true)
  expect(await guideDir.indexFile().exists()).toBe(true)

  // 特定ファイルの確認
  const gettingStartedFile = guideDir.file("getting-started.md")
  expect(await gettingStartedFile.exists()).toBe(true)
})
