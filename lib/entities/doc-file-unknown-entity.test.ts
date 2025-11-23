import { expect, test } from "bun:test"
import { DocFileUnknownEntity } from "./doc-file-unknown-entity"

test("DocFileUnknownEntity - 基本的な作成とプロパティアクセス", () => {
  const entity = new DocFileUnknownEntity({
    type: "unknown",
    content: "これはテキストファイルの内容です。",
    path: {
      path: "docs/example.txt",
      name: "example",
      fullPath: "/Users/test/docs/example.txt",
      nameWithExtension: "example.txt",
    },
    extension: ".txt",
    isArchived: false,
  })

  expect(entity.value.type).toBe("unknown")
  expect(entity.value.isArchived).toBe(false)
  expect(entity.value.content).toBe("これはテキストファイルの内容です。")
})

test("DocFileUnknownEntity - content getterが文字列を返す", () => {
  const entity = new DocFileUnknownEntity({
    type: "unknown",
    content: "プレーンテキスト",
    path: {
      path: "docs/test.txt",
      name: "test",
      fullPath: "/Users/test/docs/test.txt",
      nameWithExtension: "test.txt",
    },
    extension: ".txt",
    isArchived: false,
  })

  expect(entity.content).toBe("プレーンテキスト")
  expect(typeof entity.content).toBe("string")
})

test("DocFileUnknownEntity - path getterが値オブジェクトを返す", () => {
  const entity = new DocFileUnknownEntity({
    type: "unknown",
    content: "",
    path: {
      path: "docs/test.txt",
      name: "test",
      fullPath: "/Users/test/docs/test.txt",
      nameWithExtension: "test.txt",
    },
    extension: ".txt",
    isArchived: false,
  })

  const path = entity.path
  expect(path.name).toBe("test")
  expect(path.path).toBe("docs/test.txt")
  expect(path.fullPath).toBe("/Users/test/docs/test.txt")
  expect(path.nameWithExtension).toBe("test.txt")
})

test("DocFileUnknownEntity - withContentで新しいインスタンスを作成", () => {
  const entity = new DocFileUnknownEntity({
    type: "unknown",
    content: "古い内容",
    path: {
      path: "docs/test.txt",
      name: "test",
      fullPath: "/Users/test/docs/test.txt",
      nameWithExtension: "test.txt",
    },
    extension: ".txt",
    isArchived: false,
  })

  const newEntity = entity.withContent("新しい内容")

  expect(newEntity).not.toBe(entity) // 新しいインスタンス
  expect(newEntity.content).toBe("新しい内容")
  expect(entity.content).toBe("古い内容") // 元は変更されない
})

test("DocFileUnknownEntity - withPathで新しいインスタンスを作成", () => {
  const entity = new DocFileUnknownEntity({
    type: "unknown",
    content: "内容",
    path: {
      path: "docs/old.txt",
      name: "old",
      fullPath: "/Users/test/docs/old.txt",
      nameWithExtension: "old.txt",
    },
    extension: ".txt",
    isArchived: false,
  })

  const newPath = {
    path: "docs/new.txt",
    name: "new",
    fullPath: "/Users/test/docs/new.txt",
    nameWithExtension: "new.txt",
  }
  const newEntity = entity.withPath(newPath)

  expect(newEntity).not.toBe(entity) // 新しいインスタンス
  expect(newEntity.path.path).toBe("docs/new.txt")
  expect(newEntity.path.name).toBe("new")
  expect(entity.path.path).toBe("docs/old.txt") // 元は変更されない
})

test("DocFileUnknownEntity - withPath関数オーバーロードで新しいインスタンスを作成", () => {
  const entity = new DocFileUnknownEntity({
    type: "unknown",
    content: "内容",
    path: {
      path: "docs/old.txt",
      name: "old",
      fullPath: "/Users/test/docs/old.txt",
      nameWithExtension: "old.txt",
    },
    extension: ".txt",
    isArchived: false,
  })

  // 関数を使ったパスの更新
  const newEntity = entity.withPath((path) => ({
    ...path,
    path: "docs/updated.txt",
    name: "updated",
    nameWithExtension: "updated.txt",
  }))

  expect(newEntity).not.toBe(entity) // 新しいインスタンス
  expect(newEntity.path.path).toBe("docs/updated.txt")
  expect(newEntity.path.name).toBe("updated")
  expect(entity.path.path).toBe("docs/old.txt") // 元は変更されない
})

test("DocFileUnknownEntity - toJsonで元のデータ構造を返す", () => {
  const data = {
    type: "unknown" as const,
    content: "ファイルの内容",
    path: {
      path: "docs/test.txt",
      name: "test",
      fullPath: "/Users/test/docs/test.txt",
      nameWithExtension: "test.txt",
    },
    extension: ".txt",
    isArchived: false,
  }

  const entity = new DocFileUnknownEntity(data)
  expect(entity.toJson()).toEqual(data)
})

test("DocFileUnknownEntity - 不変性の確認", () => {
  const entity = new DocFileUnknownEntity({
    type: "unknown",
    content: "内容",
    path: {
      path: "docs/test.txt",
      name: "test",
      fullPath: "/Users/test/docs/test.txt",
      nameWithExtension: "test.txt",
    },
    extension: ".txt",
    isArchived: false,
  })

  expect(() => {
    // @ts-expect-error - 不変性のテスト
    entity.value = {}
  }).toThrow()
})
