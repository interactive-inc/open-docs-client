import { expect, test } from "bun:test"
import type { DocFileSystemInterface } from "../modules/file-system/doc-file-system.interface"
import { DocPathSystem } from "../modules/path-system/doc-path-system"
import { expectType } from "../utils"
import type { DocRelationFileValue } from "../values/doc-relation-file-value"
import type { DocRelationValue } from "../values/doc-relation-value"
import { DocFileRelationReference } from "./doc-file-relation-reference"

// モックファイルシステムの作成
function createMockFileSystem() {
  const files = new Map<string, string>()
  const directories = new Set<string>()

  return {
    getBasePath: () => "/test/base",
    exists: async (path: string) => {
      return files.has(path) || directories.has(path)
    },
    readFile: async (path: string) => {
      return files.get(path) || null
    },
    readDirectoryFilePaths: async (path: string) => {
      const filesInDir: string[] = []
      for (const [filePath] of files) {
        if (
          filePath.startsWith(`${path}/`) &&
          !filePath.includes("/", path.length + 1)
        ) {
          filesInDir.push(filePath)
        }
      }
      return filesInDir
    },
    addFile: (path: string, content: string) => {
      files.set(path, content)
      // ディレクトリも追加
      const dir = path.substring(0, path.lastIndexOf("/"))
      if (dir) directories.add(dir)
    },
    addDirectory: (path: string) => {
      directories.add(path)
    },
  } as DocFileSystemInterface & {
    addFile: (path: string, content: string) => void
    addDirectory: (path: string) => void
  }
}

test("DocFileRelationReference - 基本的な作成とプロパティアクセス", () => {
  const fileSystem = createMockFileSystem()
  const pathSystem = new DocPathSystem()

  const ref = new DocFileRelationReference({
    filePath: "relations/authors",
    fileSystem,
    pathSystem,
  })

  expect(ref.path).toBe("relations/authors")
  expect(ref.basePath).toBe("/test/base")
  expect(ref.fullPath).toBe("/test/base/relations/authors")
})

test("DocFileRelationReference - ファイルシステムへのアクセス", () => {
  const fileSystem = createMockFileSystem()
  const pathSystem = new DocPathSystem()

  const ref = new DocFileRelationReference({
    filePath: "relations/categories",
    fileSystem,
    pathSystem,
  })

  expect(ref.fileSystem).toBe(fileSystem)
})

test("DocFileRelationReference - 空のリレーションディレクトリの読み込み", async () => {
  const fileSystem = createMockFileSystem()
  const pathSystem = new DocPathSystem()

  const ref = new DocFileRelationReference({
    filePath: "relations/empty",
    fileSystem,
    pathSystem,
  })

  const files = await ref.readFiles()
  expect(files).toEqual([])

  const relation = await ref.read()
  expect(relation).not.toBe(null)
  if (relation instanceof Error) {
    throw relation
  }
  expect(relation?.value.path).toBe("relations/empty")
  expect(relation?.value.files).toEqual([])

  const count = await ref.count()
  expect(count).toBe(0)

  const isEmpty = await ref.isEmpty()
  expect(isEmpty).toBe(true)
})

test("DocFileRelationReference - リレーションファイルの読み込み", async () => {
  const fileSystem = createMockFileSystem()
  const pathSystem = new DocPathSystem()

  // リレーションディレクトリとファイルを追加
  fileSystem.addDirectory("relations/authors")
  fileSystem.addFile(
    "relations/authors/john.md",
    `# John Doe

著者の説明`,
  )
  fileSystem.addFile(
    "relations/authors/jane.md",
    `# Jane Smith

著者の説明`,
  )

  const ref = new DocFileRelationReference({
    filePath: "relations/authors",
    fileSystem,
    pathSystem,
  })

  const files = await ref.readFiles()
  if (files instanceof Error) {
    throw files
  }
  expect(files).toHaveLength(2)
  expect(files[0].id).toBe("john")
  expect(files[0].label).toBe("John Doe")
  expect(files[1].id).toBe("jane")
  expect(files[1].label).toBe("Jane Smith")

  const relation = await ref.read()
  expect(relation).not.toBe(null)
  if (relation instanceof Error) {
    throw relation
  }
  expect(relation?.value.path).toBe("relations/authors")
  expect(relation?.value.files).toHaveLength(2)
})

test("DocFileRelationReference - index.md ファイルの除外", async () => {
  const fileSystem = createMockFileSystem()
  const pathSystem = new DocPathSystem()

  fileSystem.addDirectory("relations/categories")
  fileSystem.addFile("relations/categories/index.md", `# カテゴリー一覧`)
  fileSystem.addFile("relations/categories/tech.md", `# テクノロジー`)

  const ref = new DocFileRelationReference({
    filePath: "relations/categories",
    fileSystem,
    pathSystem,
  })

  const files = await ref.readFiles()
  if (files instanceof Error) {
    throw files
  }
  expect(files).toHaveLength(1)
  expect(files[0].id).toBe("tech")
})

test("DocFileRelationReference - ファイルの存在確認", async () => {
  const fileSystem = createMockFileSystem()
  const pathSystem = new DocPathSystem()

  fileSystem.addDirectory("relations/tags")
  fileSystem.addFile("relations/tags/typescript.md", `# TypeScript`)

  const ref = new DocFileRelationReference({
    filePath: "relations/tags",
    fileSystem,
    pathSystem,
  })

  const exists1 = await ref.exists("typescript")
  expect(exists1).toBe(true)

  const exists2 = await ref.exists("javascript")
  expect(exists2).toBe(false)
})

test("DocFileRelationReference - スラッグの読み込み", async () => {
  const fileSystem = createMockFileSystem()
  const pathSystem = new DocPathSystem()

  fileSystem.addDirectory("relations/products")
  fileSystem.addFile("relations/products/product-a.md", "# Product A")
  fileSystem.addFile("relations/products/product-b.md", "# Product B")
  fileSystem.addFile("relations/products/product-c.md", "# Product C")

  const ref = new DocFileRelationReference({
    filePath: "relations/products",
    fileSystem,
    pathSystem,
  })

  const slugs = await ref.readSlugs()
  expect(slugs).toEqual(["product-a", "product-b", "product-c"])
})

test("DocFileRelationReference - ファイル数のカウント", async () => {
  const fileSystem = createMockFileSystem()
  const pathSystem = new DocPathSystem()

  fileSystem.addDirectory("relations/users")
  fileSystem.addFile("relations/users/user1.md", "# User 1")
  fileSystem.addFile("relations/users/user2.md", "# User 2")
  fileSystem.addFile("relations/users/user3.md", "# User 3")
  fileSystem.addFile("relations/users/index.md", "# Users") // 除外される

  const ref = new DocFileRelationReference({
    filePath: "relations/users",
    fileSystem,
    pathSystem,
  })

  const count = await ref.count()
  expect(count).toBe(3)

  const isEmpty = await ref.isEmpty()
  expect(isEmpty).toBe(false)
})

test("DocFileRelationReference - 型の推論", async () => {
  const fileSystem = createMockFileSystem()
  const pathSystem = new DocPathSystem()

  const ref = new DocFileRelationReference({
    filePath: "relations/test",
    fileSystem,
    pathSystem,
  })

  // readFiles の戻り値の型
  const files = await ref.readFiles()
  expectType<DocRelationFileValue[] | Error>(files)

  // read の戻り値の型
  const relation = await ref.read()
  expectType<DocRelationValue | Error | null>(relation)

  // readSlugs の戻り値の型
  const slugs = await ref.readSlugs()
  expectType<string[] | Error>(slugs)

  // count の戻り値の型
  const count = await ref.count()
  expectType<number | Error>(count)

  // isEmpty の戻り値の型
  const isEmpty = await ref.isEmpty()
  expectType<boolean | Error>(isEmpty)

  // exists の戻り値の型
  const exists = await ref.exists("test")
  expectType<boolean>(exists)
})

test("DocFileRelationReference - 不変性の確認", () => {
  const fileSystem = createMockFileSystem()
  const pathSystem = new DocPathSystem()

  const ref = new DocFileRelationReference({
    filePath: "relations/immutable",
    fileSystem,
    pathSystem,
  })

  expect(() => {
    // @ts-expect-error - 不変性のテスト
    ref.props = {}
  }).toThrow()
})

test("DocFileRelationReference - 単一ファイルの読み込み", async () => {
  const fileSystem = createMockFileSystem()
  const pathSystem = new DocPathSystem()

  fileSystem.addFile(
    "relations/authors/specific.md",
    `# Specific Author

詳細な説明`,
  )

  const ref = new DocFileRelationReference({
    filePath: "relations/authors",
    fileSystem,
    pathSystem,
  })

  const file = await ref.readFile("relations/authors/specific.md")
  expect(file).not.toBe(null)
  if (file instanceof Error) {
    throw file
  }
  expect(file?.id).toBe("specific")
  expect(file?.label).toBe("Specific Author")
})

test("DocFileRelationReference - 存在しないファイルの読み込み", async () => {
  const fileSystem = createMockFileSystem()
  const pathSystem = new DocPathSystem()

  const ref = new DocFileRelationReference({
    filePath: "relations/missing",
    fileSystem,
    pathSystem,
  })

  const file = await ref.readFile("relations/missing/notfound.md")
  expect(file).toBe(null)
})
