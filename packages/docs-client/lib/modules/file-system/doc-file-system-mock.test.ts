import { expect, test } from "bun:test"
import { DocPathSystemMock } from "../path-system/doc-path-system-mock"
import { DocFileSystemMock } from "./doc-file-system-mock"

test("DocFileSystemMock - ファイルの作成と読み込み", async () => {
  const pathSystem = new DocPathSystemMock()
  const fileSystem = new DocFileSystemMock({ basePath: "/test", pathSystem })

  await fileSystem.writeFile("docs/test.md", "# Test Content")
  const content = await fileSystem.readFile("docs/test.md")

  expect(content).toBe("# Test Content")
})

test("DocFileSystemMock - createWithFilesファクトリメソッド", () => {
  const fileSystem = DocFileSystemMock.createWithFiles({
    basePath: "/mock",
    fileContents: {
      "docs/index.md": "# Index",
      "docs/guide.md": "# Guide",
    },
  })

  expect(fileSystem.getFileContent("docs/index.md")).toBe("# Index")
  expect(fileSystem.getFileContent("docs/guide.md")).toBe("# Guide")
  expect(fileSystem.getFileCount()).toBe(2) // createWithFilesはデフォルトファイルを含まない
})

test("DocFileSystemMock - ファイルの存在確認", async () => {
  const pathSystem = new DocPathSystemMock()
  const fileSystem = new DocFileSystemMock({ basePath: "/test", pathSystem })

  await fileSystem.writeFile("docs/exists.md", "content")

  expect(await fileSystem.exists("docs/exists.md")).toBe(true)
  expect(await fileSystem.exists("docs/missing.md")).toBe(false)
  expect(await fileSystem.fileExists("docs/exists.md")).toBe(true)
  expect(await fileSystem.fileExists("docs/missing.md")).toBe(false)
})

test("DocFileSystemMock - ディレクトリの確認", async () => {
  const pathSystem = new DocPathSystemMock()
  const fileSystem = new DocFileSystemMock({ basePath: "/test", pathSystem })

  await fileSystem.writeFile("docs/subdir/file.md", "content")

  expect(await fileSystem.isDirectory("docs/subdir")).toBe(true)
  expect(await fileSystem.isDirectory("docs/missing")).toBe(false)
  expect(await fileSystem.directoryExists("docs/subdir")).toBe(true)
})

test("DocFileSystemMock - ファイルのコピーと移動", async () => {
  const pathSystem = new DocPathSystemMock()
  const fileSystem = new DocFileSystemMock({ basePath: "/test", pathSystem })

  await fileSystem.writeFile("docs/source.md", "original content")
  await fileSystem.copyFile("docs/source.md", "docs/copy.md")

  expect(await fileSystem.readFile("docs/source.md")).toBe("original content")
  expect(await fileSystem.readFile("docs/copy.md")).toBe("original content")

  await fileSystem.moveFile("docs/copy.md", "docs/moved.md")

  expect(await fileSystem.readFile("docs/moved.md")).toBe("original content")
  expect(await fileSystem.readFile("docs/copy.md")).toBe(null)
})

test("DocFileSystemMock - ディレクトリの読み込み", async () => {
  const pathSystem = new DocPathSystemMock()
  const fileSystem = new DocFileSystemMock({ basePath: "/test", pathSystem })

  await fileSystem.writeFile("docs/file1.md", "content1")
  await fileSystem.writeFile("docs/file2.md", "content2")
  await fileSystem.writeFile("docs/subdir/file3.md", "content3")

  const fileNames = await fileSystem.readDirectoryFileNames("docs")
  expect(fileNames).toEqual([
    "api",
    "file1.md",
    "file2.md",
    "guide",
    "index.md",
    "subdir",
  ])

  const filePaths = await fileSystem.readDirectoryFilePaths("docs")
  expect(filePaths).toEqual(["docs/file1.md", "docs/file2.md", "docs/index.md"])
})

test("DocFileSystemMock - ファイルメタデータ", async () => {
  const pathSystem = new DocPathSystemMock()
  const fileSystem = new DocFileSystemMock({ basePath: "/test", pathSystem })

  await fileSystem.writeFile("docs/test.md", "test content")

  const size = await fileSystem.getFileSize("docs/test.md")
  expect(size).toBe(new TextEncoder().encode("test content").length)

  const modifiedTime = await fileSystem.getFileUpdatedTime("docs/test.md")
  expect(modifiedTime).toBeInstanceOf(Date)

  const createdTime = await fileSystem.getFileCreatedTime("docs/test.md")
  expect(createdTime).toBeInstanceOf(Date)
})

test("DocFileSystemMock - ファイルの削除", async () => {
  const pathSystem = new DocPathSystemMock()
  const fileSystem = new DocFileSystemMock({ basePath: "/test", pathSystem })

  await fileSystem.writeFile("docs/delete-me.md", "content")
  expect(await fileSystem.exists("docs/delete-me.md")).toBe(true)

  const result = await fileSystem.deleteFile("docs/delete-me.md")
  expect(result).toBe(null)
  expect(await fileSystem.exists("docs/delete-me.md")).toBe(false)
})

test("DocFileSystemMock - テストユーティリティメソッド", () => {
  const pathSystem = new DocPathSystemMock()
  const fileSystem = new DocFileSystemMock({ basePath: "/test", pathSystem })

  fileSystem.setupTestFiles({
    "docs/file1.md": "content1",
    "docs/file2.md": "content2",
  })

  expect(fileSystem.hasFile("docs/file1.md")).toBe(true)
  expect(fileSystem.hasFile("docs/missing.md")).toBe(false)
  expect(fileSystem.getAllFilePaths()).toEqual([
    "docs/api/index.md",
    "docs/api/reference.md",
    "docs/file1.md",
    "docs/file2.md",
    "docs/guide/advanced.md",
    "docs/guide/getting-started.md",
    "docs/guide/index.md",
    "docs/index.md",
  ])
  expect(fileSystem.getFileCount()).toBe(8)

  fileSystem.clear()
  expect(fileSystem.getFileCount()).toBe(0)
})

test("DocFileSystemMock - createファクトリメソッド", () => {
  const instance1 = DocFileSystemMock.create()
  const instance2 = DocFileSystemMock.create()

  expect(instance1).not.toBe(instance2) // 異なるインスタンス
  expect(instance1.getBasePath()).toBe("/test")
  expect(instance2.getBasePath()).toBe("/test")

  // 両方とも自動的にmockDirectoryDataがセットアップされている
  expect(instance1.getFileCount()).toBeGreaterThan(0)
  expect(instance2.getFileCount()).toBeGreaterThan(0)
  expect(instance1.getFileCount()).toBe(instance2.getFileCount())

  // カスタムbasePathでも作成可能
  const customInstance = DocFileSystemMock.create("/custom")
  expect(customInstance.getBasePath()).toBe("/custom")
  expect(customInstance.getFileCount()).toBeGreaterThan(0)
})

test("DocFileSystemMock - constructorで自動的にデータがセットアップされる", async () => {
  const instance = DocFileSystemMock.create()

  // constructorで自動的にmockDirectoryDataがセットアップされる
  const indexContent = await instance.readFile("docs/index.md")
  expect(indexContent).toContain("# Documentation")

  const guideContent = await instance.readFile("docs/guide/getting-started.md")
  expect(guideContent).toContain("# Getting Started")

  // ディレクトリ構造も正しく機能
  const docsFiles = await instance.readDirectoryFileNames("docs")
  expect(docsFiles).toContain("api")
  expect(docsFiles).toContain("guide")
  expect(docsFiles).toContain("index.md")
})
