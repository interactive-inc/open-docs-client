import { test } from "bun:test"
import type { DocFileMdEntity } from "../entities/doc-file-md-entity"
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

  // モックのfileSystemとpathSystem
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

  // 型が正しく推論されることを確認
  expectType<DocFileMdReference<TestSchema>>(ref)
})

test("updateFrontMatter - 型安全な更新", () => {
  type TestSchema = {
    title: { type: "text"; required: true }
    count: { type: "number"; required: false }
    isPublished: { type: "boolean"; required: true }
    tags: { type: "multi-text"; required: false }
  }

  // 型レベルのテスト
  type UpdateTest1 = Parameters<
    DocFileMdReference<TestSchema>["updateFrontMatter"]
  >
  // 第1引数は TestSchema のキー
  type Key = UpdateTest1[0]
  assertType<Equals<Key, keyof TestSchema>>()

  // 第2引数は対応する値の型
  // title: string, count: number | null, tags: string[] | null に対応
})

test("read メソッドの戻り値の型", () => {
  type TestSchema = {
    title: { type: "text"; required: true }
    description: { type: "text"; required: false }
  }

  // read の戻り値の型をテスト
  type ReadResult = Awaited<ReturnType<DocFileMdReference<TestSchema>["read"]>>

  // DocFileMdEntity<TestSchema> または Error
  assertType<Equals<ReadResult, DocFileMdEntity<TestSchema> | Error>>()
})

test("readFrontMatter メソッドの戻り値の型", () => {
  type TestSchema = {
    author: { type: "text"; required: true }
    tags: { type: "multi-text"; required: false }
  }

  // readFrontMatter の戻り値の型をテスト
  type ReadFrontMatterResult = Awaited<
    ReturnType<DocFileMdReference<TestSchema>["readFrontMatter"]>
  >

  // DocFileMdMetaValue<TestSchema> または Error
  assertType<
    Equals<ReadFrontMatterResult, DocFileMdMetaValue<TestSchema> | Error>
  >()
})

test("relation メソッドの型推論", () => {
  type TestSchema = {
    author: { type: "relation"; required: true }
    reviewer: { type: "relation"; required: false }
    tags: { type: "multi-text"; required: false }
  }

  // relation メソッドの戻り値の型
  type RelationResult = Awaited<
    ReturnType<DocFileMdReference<TestSchema>["relation"]>
  >

  // DocFileMdReference<DocCustomSchema> | Error | null (デフォルトのスキーマ)
  assertType<
    Equals<RelationResult, DocFileMdReference<DocCustomSchema> | Error | null>
  >()
})

test("relations メソッドの型推論", () => {
  type TestSchema = {
    relatedItems: { type: "multi-relation"; required: true }
    tags: { type: "multi-text"; required: false }
  }

  // relations メソッドの戻り値の型
  type RelationsResult = Awaited<
    ReturnType<DocFileMdReference<TestSchema>["relations"]>
  >

  // DocFileMdReference<DocCustomSchema>[] (デフォルトのスキーマを持つ参照の配列)
  assertType<Equals<RelationsResult, DocFileMdReference<DocCustomSchema>[]>>()
})

test("directory メソッドの型推論", () => {
  type TestSchema = {
    title: { type: "text"; required: true }
  }

  // directory メソッドの戻り値の型
  type _DirectoryResult = ReturnType<
    DocFileMdReference<TestSchema>["directory"]
  >
})

test("directoryIndex メソッドの型推論", () => {
  type TestSchema = {
    content: { type: "text"; required: true }
  }

  // directoryIndex メソッドの戻り値の型
  type _DirectoryIndexResult = Awaited<
    ReturnType<DocFileMdReference<TestSchema>["directoryIndex"]>
  >
})

test("archive と restore メソッドの型保持", () => {
  type TestSchema = {
    title: { type: "text"; required: true }
    archived: { type: "boolean"; required: false }
  }

  // archive メソッドの戻り値の型
  type ArchiveResult = Awaited<
    ReturnType<DocFileMdReference<TestSchema>["archive"]>
  >

  // 同じスキーマを持つ新しい参照を返す
  assertType<Equals<ArchiveResult, DocFileMdReference<TestSchema>>>()

  // restore メソッドの戻り値の型
  type RestoreResult = Awaited<
    ReturnType<DocFileMdReference<TestSchema>["restore"]>
  >

  // 同じスキーマを持つ新しい参照を返す
  assertType<Equals<RestoreResult, DocFileMdReference<TestSchema>>>()
})

test("複雑なスキーマでの型安全性", () => {
  type _ComplexSchema = {
    // 基本フィールド
    id: { type: "text"; required: true }
    title: { type: "text"; required: true }
    description: { type: "text"; required: false }

    // 数値と真偽値
    viewCount: { type: "number"; required: true }
    rating: { type: "number"; required: false }
    isPublished: { type: "boolean"; required: true }
    isFeatured: { type: "boolean"; required: false }

    // 選択フィールド
    status: { type: "select-text"; required: true }
    priority: { type: "select-number"; required: false }

    // リレーション
    author: { type: "relation"; required: true }
    reviewer: { type: "relation"; required: false }

    // 複数値フィールド
    tags: { type: "multi-text"; required: true }
    categories: { type: "multi-text"; required: false }
    scores: { type: "multi-number"; required: false }
    relatedPosts: { type: "multi-relation"; required: true }
    statuses: { type: "multi-select-text"; required: false }
    priorities: { type: "multi-select-number"; required: false }
  }
})
