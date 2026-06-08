import { expect, test } from "bun:test"
import type { DocFileSystemInterface } from "../modules/file-system/doc-file-system.interface"
import { DocPathSystem } from "../modules/path-system/doc-path-system"
import { expectType } from "../utils"
import type { DocRelationFileValue } from "../values/doc-relation-file-value"
import type { DocRelationValue } from "../values/doc-relation-value"
import { DocFileRelationReference } from "./doc-file-relation-reference"

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
        if (filePath.startsWith(`${path}/`) && !filePath.includes("/", path.length + 1)) {
          filesInDir.push(filePath)
        }
      }
      return filesInDir
    },
    addFile: (path: string, content: string) => {
      files.set(path, content)
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
  expect(relation?.value.path).toBe("relations/empty")
  expect(relation?.value.files).toEqual([])

  const fileCount = await ref.count()
  expect(fileCount).toBe(0)

  const empty = await ref.isEmpty()
  expect(empty).toBe(true)
})

test("DocFileRelationReference - リレーションファイルの読み込み", async () => {
  const fileSystem = createMockFileSystem()
  const pathSystem = new DocPathSystem()

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
  expect(files).toHaveLength(2)
  expect(files[0].id).toBe("john")
  expect(files[0].label).toBe("John Doe")
  expect(files[1].id).toBe("jane")
  expect(files[1].label).toBe("Jane Smith")

  const relation = await ref.read()
  expect(relation).not.toBe(null)
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
  fileSystem.addFile("relations/users/index.md", "# Users")

  const ref = new DocFileRelationReference({
    filePath: "relations/users",
    fileSystem,
    pathSystem,
  })

  const fileCount = await ref.count()
  expect(fileCount).toBe(3)

  const empty = await ref.isEmpty()
  expect(empty).toBe(false)
})

test("DocFileRelationReference - 型の推論（throwパターン）", async () => {
  const fileSystem = createMockFileSystem()
  const pathSystem = new DocPathSystem()

  const ref = new DocFileRelationReference({
    filePath: "relations/test",
    fileSystem,
    pathSystem,
  })

  const files = await ref.readFiles()
  expectType<DocRelationFileValue[]>(files)

  const relation = await ref.read()
  expectType<DocRelationValue | null>(relation)

  const slugs = await ref.readSlugs()
  expectType<string[]>(slugs)

  const fileCount = await ref.count()
  expectType<number>(fileCount)

  const empty = await ref.isEmpty()
  expectType<boolean>(empty)

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
