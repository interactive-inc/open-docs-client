import { expect, test } from "bun:test"
import type { DocFileSystemInterface } from "../modules/file-system/doc-file-system.interface"
import { DocPathSystem } from "../modules/path-system/doc-path-system"
import { defaultTestConfig } from "../utils"
import { DocDirectoryReference } from "./doc-directory-reference"

test("DocDirectoryReference - directoryNames メソッドでサブディレクトリ名を取得できる", async () => {
  const mockFileSystem = {
    getBasePath: () => "/test",
    readDirectoryFileNames: async (path: string) => {
      if (path === "docs") {
        return ["file1.md", "subdir1", "subdir2", "_archive", "file2.txt"]
      }
      return []
    },
    isDirectory: async (path: string) => {
      return ["docs/subdir1", "docs/subdir2", "docs/_archive"].includes(path)
    },
  } as unknown as DocFileSystemInterface

  const pathSystem = new DocPathSystem()
  const dirRef = new DocDirectoryReference({
    path: "docs",
    indexFileName: "index.md",
    archiveDirectoryName: "_",
    fileSystem: mockFileSystem,
    pathSystem,
    customSchema: {},
    config: defaultTestConfig,
  })

  const dirNames = await dirRef.directoryNames()
  if (dirNames instanceof Error) {
    throw dirNames
  }

  expect(dirNames.length).toBe(2) // _archiveは除外
  expect(dirNames).toContain("subdir1")
  expect(dirNames).toContain("subdir2")
  expect(dirNames).not.toContain("_archive")
  expect(dirNames).not.toContain("file1.md")
  expect(dirNames).not.toContain("file2.txt")
})

test("DocDirectoryReference - directories メソッドでサブディレクトリ参照を取得できる", async () => {
  const mockFileSystem = {
    getBasePath: () => "/test",
    readDirectoryFileNames: async (path: string) => {
      if (path === "docs") {
        return ["subdir1", "subdir2", "_archive"]
      }
      return []
    },
    isDirectory: async (path: string) => {
      return ["docs/subdir1", "docs/subdir2", "docs/_archive"].includes(path)
    },
  } as unknown as DocFileSystemInterface

  const pathSystem = new DocPathSystem()
  const dirRef = new DocDirectoryReference({
    path: "docs",
    indexFileName: "index.md",
    archiveDirectoryName: "_",
    fileSystem: mockFileSystem,
    pathSystem,
    customSchema: {},
    config: defaultTestConfig,
  })

  const directories = await dirRef.directories()
  if (directories instanceof Error) {
    throw directories
  }

  expect(directories.length).toBe(2) // _archiveは除外
  expect(directories[0]).toBeInstanceOf(DocDirectoryReference)
  expect(directories[0].relativePath).toBe("docs/subdir1")
  expect(directories[1].relativePath).toBe("docs/subdir2")
})

test("DocDirectoryReference - 空のディレクトリでも正常に動作する", async () => {
  const mockFileSystem = {
    getBasePath: () => "/test",
    readDirectoryFileNames: async (_path: string) => {
      return [] // 空のディレクトリ
    },
    isDirectory: async (_path: string) => {
      return false
    },
  } as unknown as DocFileSystemInterface

  const pathSystem = new DocPathSystem()
  const dirRef = new DocDirectoryReference({
    path: "empty",
    indexFileName: "index.md",
    archiveDirectoryName: "_",
    fileSystem: mockFileSystem,
    pathSystem,
    customSchema: {},
    config: defaultTestConfig,
  })

  const dirNames = await dirRef.directoryNames()
  if (dirNames instanceof Error) {
    throw dirNames
  }
  const directories = await dirRef.directories()
  if (directories instanceof Error) {
    throw directories
  }

  expect(dirNames.length).toBe(0)
  expect(directories.length).toBe(0)
})

test("DocDirectoryReference - directory メソッドで単一のサブディレクトリ参照を取得できる", () => {
  const mockFileSystem = {
    getBasePath: () => "/test",
  } as unknown as DocFileSystemInterface

  const pathSystem = new DocPathSystem()
  const dirRef = new DocDirectoryReference({
    path: "docs",
    indexFileName: "index.md",
    archiveDirectoryName: "_",
    fileSystem: mockFileSystem,
    pathSystem,
    customSchema: {},
    config: defaultTestConfig,
  })

  const subdir = dirRef.directory("guides")

  expect(subdir).toBeInstanceOf(DocDirectoryReference)
  expect(subdir.relativePath).toBe("docs/guides")
  expect(subdir.indexFileName).toBe("index.md")
  expect(subdir.archiveDirectoryName).toBe("_")
})

test("DocDirectoryReference - get name()でディレクトリ名を取得できる", () => {
  const mockFileSystem = {
    getBasePath: () => "/test",
  } as unknown as DocFileSystemInterface

  const pathSystem = new DocPathSystem()

  // ルートディレクトリのテスト
  const rootRef = new DocDirectoryReference({
    path: "docs",
    indexFileName: "index.md",
    archiveDirectoryName: "_",
    fileSystem: mockFileSystem,
    pathSystem,
    customSchema: {},
    config: defaultTestConfig,
  })

  expect(rootRef.name).toBe("docs")

  // ネストしたディレクトリのテスト
  const nestedRef = new DocDirectoryReference({
    path: "docs/products/features",
    indexFileName: "index.md",
    archiveDirectoryName: "_",
    fileSystem: mockFileSystem,
    pathSystem,
    customSchema: {},
    config: defaultTestConfig,
  })

  expect(nestedRef.name).toBe("features")

  // 単一階層のテスト
  const singleRef = new DocDirectoryReference({
    path: "packages",
    indexFileName: "index.md",
    archiveDirectoryName: "_",
    fileSystem: mockFileSystem,
    pathSystem,
    customSchema: {},
    config: defaultTestConfig,
  })

  expect(singleRef.name).toBe("packages")
})

test("DocDirectoryReference - directoryExcludesで指定されたディレクトリが除外される", async () => {
  const mockFileSystem = {
    getBasePath: () => "/test",
    readDirectoryFileNames: async (path: string) => {
      if (path === "docs") {
        return ["products", "terms", ".vitepress", "node_modules", "_archive"]
      }
      return []
    },
    isDirectory: async (path: string) => {
      return [
        "docs/products",
        "docs/terms",
        "docs/.vitepress",
        "docs/node_modules",
        "docs/_archive",
      ].includes(path)
    },
  } as unknown as DocFileSystemInterface

  const pathSystem = new DocPathSystem()

  // .vitepressとnode_modulesを除外する設定
  const config = {
    ...defaultTestConfig,
    directoryExcludes: [".vitepress", "node_modules"],
  }

  const ref = new DocDirectoryReference({
    path: "docs",
    indexFileName: "index.md",
    archiveDirectoryName: "_archive",
    fileSystem: mockFileSystem,
    pathSystem,
    customSchema: {},
    config,
  })

  const directoryNames = await ref.directoryNames()

  // .vitepress、node_modules、_archiveが除外され、productsとtermsのみが残る
  expect(directoryNames).toEqual(["products", "terms"])
  expect(directoryNames).not.toContain(".vitepress")
  expect(directoryNames).not.toContain("node_modules")
  expect(directoryNames).not.toContain("_archive")
})
