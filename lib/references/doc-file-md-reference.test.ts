import { expect, test } from "bun:test"
import type { DocFileMdEntity } from "../entities/doc-file-md-entity"
import { DocFileSystemMock } from "../modules/file-system/doc-file-system-mock"
import type { DocFileSystemInterface } from "../modules/file-system/doc-file-system.interface"
import type { DocPathSystem } from "../modules/path-system/doc-path-system"
import type { DocCustomSchema, Equals } from "../types"
import { assertType, defaultTestConfig, expectType } from "../utils"
import type { DocFileMdMetaValue } from "../values/doc-file-md-meta-value"
import { DocFileMdReference } from "./doc-file-md-reference"

test("DocFileMdReference - ジェネリック型が正しく推論される", () => {
  type TestSchema = {
    title: { type: "text"; required: true }
    tags: { type: "multi-text"; required: false }
    author: { type: "relation"; required: true }
  }

  const mockFileSystem = {
    getBasePath: () => "/base",
    readFile: async () => null,
    exists: async () => false,
  } as unknown as DocFileSystemInterface

  const mockPathSystem = {
    join: (...parts: string[]) => parts.join("/"),
    dirname: (path: string) => path.split("/").slice(0, -1).join("/"),
    basename: (path: string) => path.split("/").pop() || "",
    normalize: (path: string) => path,
  } as unknown as DocPathSystem

  const ref = new DocFileMdReference<TestSchema>({
    path: "/test.md",
    fileSystem: mockFileSystem,
    pathSystem: mockPathSystem,
    customSchema: {
      title: { type: "text", required: true },
      tags: { type: "multi-text", required: false },
      author: { type: "relation", required: true },
    },
    config: defaultTestConfig,
  })

  expectType<DocFileMdReference<TestSchema>>(ref)
})

test("updateFrontMatter - 型安全な更新", () => {
  type TestSchema = {
    title: { type: "text"; required: true }
    count: { type: "number"; required: false }
    isPublished: { type: "boolean"; required: true }
    tags: { type: "multi-text"; required: false }
  }

  type UpdateTest1 = Parameters<DocFileMdReference<TestSchema>["updateFrontMatter"]>
  type Key = UpdateTest1[0]
  assertType<Equals<Key, keyof TestSchema>>()
})

test("read メソッドの戻り値の型 - throwする（Errorを含まない）", () => {
  type TestSchema = {
    title: { type: "text"; required: true }
    description: { type: "text"; required: false }
  }

  type ReadResult = Awaited<ReturnType<DocFileMdReference<TestSchema>["read"]>>

  assertType<Equals<ReadResult, DocFileMdEntity<TestSchema>>>()
})

test("readFrontMatter メソッドの戻り値の型 - throwする", () => {
  type TestSchema = {
    author: { type: "text"; required: true }
    tags: { type: "multi-text"; required: false }
  }

  type ReadFrontMatterResult = Awaited<
    ReturnType<DocFileMdReference<TestSchema>["readFrontMatter"]>
  >

  assertType<Equals<ReadFrontMatterResult, DocFileMdMetaValue<TestSchema>>>()
})

test("relation メソッドの型推論 - null | T（Errorなし）", () => {
  type TestSchema = {
    author: { type: "relation"; required: true }
    reviewer: { type: "relation"; required: false }
    tags: { type: "multi-text"; required: false }
  }

  type RelationResult = Awaited<ReturnType<DocFileMdReference<TestSchema>["relation"]>>

  assertType<Equals<RelationResult, DocFileMdReference<DocCustomSchema> | null>>()
})

test("relations メソッドの型推論", () => {
  type TestSchema = {
    relatedItems: { type: "multi-relation"; required: true }
    tags: { type: "multi-text"; required: false }
  }

  type RelationsResult = Awaited<ReturnType<DocFileMdReference<TestSchema>["relations"]>>

  assertType<Equals<RelationsResult, DocFileMdReference<DocCustomSchema>[]>>()
})

test("directory メソッドの型推論", () => {
  type TestSchema = {
    title: { type: "text"; required: true }
  }

  type _DirectoryResult = ReturnType<DocFileMdReference<TestSchema>["directory"]>
})

test("directoryIndex メソッドの型推論", () => {
  type TestSchema = {
    content: { type: "text"; required: true }
  }

  type _DirectoryIndexResult = Awaited<ReturnType<DocFileMdReference<TestSchema>["directoryIndex"]>>
})

test("archive と restore メソッドの型 - throwする（Errorなし）", () => {
  type TestSchema = {
    title: { type: "text"; required: true }
    archived: { type: "boolean"; required: false }
  }

  type ArchiveResult = Awaited<ReturnType<DocFileMdReference<TestSchema>["archive"]>>
  assertType<Equals<ArchiveResult, DocFileMdReference<TestSchema>>>()

  type RestoreResult = Awaited<ReturnType<DocFileMdReference<TestSchema>["restore"]>>
  assertType<Equals<RestoreResult, DocFileMdReference<TestSchema>>>()
})

test("複雑なスキーマでの型安全性", () => {
  type _ComplexSchema = {
    id: { type: "text"; required: true }
    title: { type: "text"; required: true }
    description: { type: "text"; required: false }
    viewCount: { type: "number"; required: true }
    rating: { type: "number"; required: false }
    isPublished: { type: "boolean"; required: true }
    isFeatured: { type: "boolean"; required: false }
    status: { type: "select-text"; required: true }
    priority: { type: "select-number"; required: false }
    author: { type: "relation"; required: true }
    reviewer: { type: "relation"; required: false }
    tags: { type: "multi-text"; required: true }
    categories: { type: "multi-text"; required: false }
    scores: { type: "multi-number"; required: false }
    relatedPosts: { type: "multi-relation"; required: true }
    statuses: { type: "multi-select-text"; required: false }
    priorities: { type: "multi-select-number"; required: false }
  }
})

test("DocFileMdReference - archiveがファイルを移動する", async () => {
  const fileSystem = DocFileSystemMock.createWithFiles({
    fileContents: { "docs/guide/intro.md": "# Intro\n\nContent here." },
  })

  const ref = new DocFileMdReference({
    path: "docs/guide/intro.md",
    fileSystem,
    pathSystem: fileSystem.getPathSystem(),
    customSchema: {},
    config: defaultTestConfig,
  })

  const archivedRef = await ref.archive()

  expect(archivedRef.path).toBe("docs/guide/_/intro.md")
})

test("DocFileMdReference - restoreがアーカイブ外でthrowする", async () => {
  const fileSystem = DocFileSystemMock.createWithFiles({
    fileContents: { "docs/guide/intro.md": "# Intro" },
  })

  const ref = new DocFileMdReference({
    path: "docs/guide/intro.md",
    fileSystem,
    pathSystem: fileSystem.getPathSystem(),
    customSchema: {},
    config: defaultTestConfig,
  })

  expect(async () => await ref.restore()).toThrow()
})

test("DocFileMdReference - safe.restoreがアーカイブ外でErrorを返す", async () => {
  const fileSystem = DocFileSystemMock.createWithFiles({
    fileContents: { "docs/guide/intro.md": "# Intro" },
  })

  const ref = new DocFileMdReference({
    path: "docs/guide/intro.md",
    fileSystem,
    pathSystem: fileSystem.getPathSystem(),
    customSchema: {},
    config: defaultTestConfig,
  })

  const safeResult = await ref.safe.restore()
  expect(safeResult).toBeInstanceOf(Error)
})

test("DocFileMdReference - restoreがアーカイブ内のファイルを復元する", async () => {
  const fileSystem = DocFileSystemMock.createWithFiles({
    fileContents: { "docs/guide/_/intro.md": "# Intro" },
  })

  const ref = new DocFileMdReference({
    path: "docs/guide/_/intro.md",
    fileSystem,
    pathSystem: fileSystem.getPathSystem(),
    customSchema: {},
    config: defaultTestConfig,
  })

  const restoredRef = await ref.restore()

  expect(restoredRef.path).toBe("docs/guide/intro.md")
})

test("DocFileMdReference - read/write ラウンドトリップ", async () => {
  const fileSystem = DocFileSystemMock.createWithFiles({
    fileContents: {
      "docs/guide/intro.md": [
        "---",
        "title: Hello",
        "---",
        "",
        "# Intro",
        "",
        "Some content.",
      ].join("\n"),
    },
  })

  const schema = {
    title: { type: "text" as const, required: true },
  }

  const ref = new DocFileMdReference({
    path: "docs/guide/intro.md",
    fileSystem,
    pathSystem: fileSystem.getPathSystem(),
    customSchema: schema,
    config: defaultTestConfig,
  })

  const entity = await ref.read()

  expect(entity.content().title).toBe("Intro")
  expect(entity.content().meta().field("title")).toBe("Hello")

  const updated = entity.withTitle("New Title")
  await ref.write(updated)

  const reread = await ref.read()

  expect(reread.content().title).toBe("New Title")
})

test("DocFileMdReference - safe.readがT|Errorを返す", async () => {
  const fileSystem = DocFileSystemMock.createWithFiles({
    fileContents: { "docs/hello.md": "# Hello" },
  })

  const ref = new DocFileMdReference({
    path: "docs/hello.md",
    fileSystem,
    pathSystem: fileSystem.getPathSystem(),
    customSchema: {},
    config: defaultTestConfig,
  })

  const safeResult = await ref.safe.read()

  if (safeResult instanceof Error) {
    throw safeResult
  }

  expect(safeResult.content().title).toBe("Hello")
})

test("DocFileMdReference - safe.readが存在しないファイルでErrorを返す", async () => {
  const fileSystem = DocFileSystemMock.createWithFiles({})

  const ref = new DocFileMdReference({
    path: "docs/missing.md",
    fileSystem,
    pathSystem: fileSystem.getPathSystem(),
    customSchema: {},
    config: defaultTestConfig,
  })

  const safeResult = await ref.safe.read()
  expect(safeResult).toBeInstanceOf(Error)
})
