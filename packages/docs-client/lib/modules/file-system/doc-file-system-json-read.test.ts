import { describe, expect, test } from "bun:test"
import { DocFileSystemJsonRead } from "./doc-file-system-json-read"

describe("DocFileSystemJsonRead", () => {
  // サンプルJSONデータ
  const sampleJsonData = {
    "README.md": "# Project Title\n\nThis is the main README file.",
    "docs/getting-started.md":
      "# Getting Started\n\nWelcome to the documentation.",
    "docs/api/index.md": "# API Reference\n\nAPI documentation here.",
    "docs/api/authentication.md": "# Authentication\n\nHow to authenticate.",
    "docs/guides/tutorial.md": "# Tutorial\n\nStep by step tutorial.",
    "src/index.ts": "// TypeScript source file\nexport const hello = 'world';",
    "package.json": '{"name": "test-project", "version": "1.0.0"}',
  }

  test("should create instance with valid JSON data", () => {
    const fileSystem = new DocFileSystemJsonRead({
      data: sampleJsonData,
    })

    expect(fileSystem).toBeDefined()
    expect(fileSystem.getBasePath()).toBe("docs")
  })

  test("should create instance with custom base path", () => {
    const fileSystem = new DocFileSystemJsonRead({
      data: sampleJsonData,
      basePath: "/custom/path",
    })

    expect(fileSystem.getBasePath()).toBe("/custom/path")
  })

  test("should throw error with invalid JSON data", () => {
    expect(() => {
      new DocFileSystemJsonRead({
        data: "invalid data",
      })
    }).toThrow()

    expect(() => {
      new DocFileSystemJsonRead({
        data: { key: 123 }, // Invalid: value should be string
      })
    }).toThrow()
  })

  describe("readFile", () => {
    const fileSystem = new DocFileSystemJsonRead({
      data: sampleJsonData,
    })

    test("should read existing file content", async () => {
      const content = await fileSystem.readFile("README.md")
      expect(content).toBe("# Project Title\n\nThis is the main README file.")
    })

    test("should read nested file content", async () => {
      const content = await fileSystem.readFile("docs/getting-started.md")
      expect(content).toBe("# Getting Started\n\nWelcome to the documentation.")
    })

    test("should return null for non-existing file", async () => {
      const content = await fileSystem.readFile("non-existing.md")
      expect(content).toBeNull()
    })

    test("should handle leading/trailing slashes", async () => {
      const content1 = await fileSystem.readFile("/README.md")
      const content2 = await fileSystem.readFile("README.md/")
      const content3 = await fileSystem.readFile("/README.md/")

      expect(content1).toBe("# Project Title\n\nThis is the main README file.")
      expect(content2).toBe("# Project Title\n\nThis is the main README file.")
      expect(content3).toBe("# Project Title\n\nThis is the main README file.")
    })
  })

  describe("file path operations", () => {
    const fileSystem = new DocFileSystemJsonRead({
      data: sampleJsonData,
    })

    test("should get file name from path", () => {
      expect(fileSystem.readFileName("docs/getting-started.md")).toBe(
        "getting-started.md",
      )
      expect(fileSystem.readFileName("README.md")).toBe("README.md")
    })

    test("should get file extension from path", () => {
      expect(fileSystem.readFileExtension("docs/getting-started.md")).toBe(
        ".md",
      )
      expect(fileSystem.readFileExtension("src/index.ts")).toBe(".ts")
      expect(fileSystem.readFileExtension("package.json")).toBe(".json")
    })

    test("should get directory path from file path", () => {
      expect(fileSystem.readFileDirectory("docs/getting-started.md")).toBe(
        "docs",
      )
      expect(fileSystem.readFileDirectory("README.md")).toBe(".")
      expect(fileSystem.readFileDirectory("docs/api/index.md")).toBe("docs/api")
    })
  })

  describe("directory operations", () => {
    const fileSystem = new DocFileSystemJsonRead({
      data: sampleJsonData,
    })

    test("should read root directory file names", async () => {
      const fileNames = await fileSystem.readDirectoryFileNames("")
      expect(fileNames).toEqual(["README.md", "docs", "package.json", "src"])
    })

    test("should read docs directory file names", async () => {
      const fileNames = await fileSystem.readDirectoryFileNames("docs")
      expect(fileNames).toEqual(["api", "getting-started.md", "guides"])
    })

    test("should read docs/api directory file names", async () => {
      const fileNames = await fileSystem.readDirectoryFileNames("docs/api")
      expect(fileNames).toEqual(["authentication.md", "index.md"])
    })

    test("should read directory file paths", async () => {
      const filePaths = await fileSystem.readDirectoryFilePaths("docs")
      expect(filePaths).toEqual([
        "docs/api",
        "docs/getting-started.md",
        "docs/guides",
      ])
    })

    test("should return empty array for non-existing directory", async () => {
      const fileNames = await fileSystem.readDirectoryFileNames("non-existing")
      expect(fileNames).toEqual([])
    })
  })

  describe("file/directory checks", () => {
    const fileSystem = new DocFileSystemJsonRead({
      data: sampleJsonData,
    })

    test("should check if path is a file", async () => {
      expect(await fileSystem.isFile("README.md")).toBe(true)
      expect(await fileSystem.isFile("docs/getting-started.md")).toBe(true)
      expect(await fileSystem.isFile("docs")).toBe(false)
      expect(await fileSystem.isFile("non-existing.md")).toBe(false)
    })

    test("should check if path is a directory", async () => {
      expect(await fileSystem.isDirectory("docs")).toBe(true)
      expect(await fileSystem.isDirectory("docs/api")).toBe(true)
      expect(await fileSystem.isDirectory("src")).toBe(true)
      expect(await fileSystem.isDirectory("README.md")).toBe(false)
      expect(await fileSystem.isDirectory("non-existing")).toBe(false)
    })

    test("should check if file exists", async () => {
      expect(await fileSystem.fileExists("README.md")).toBe(true)
      expect(await fileSystem.fileExists("docs/getting-started.md")).toBe(true)
      expect(await fileSystem.fileExists("non-existing.md")).toBe(false)
    })

    test("should check if directory exists", async () => {
      expect(await fileSystem.directoryExists("docs")).toBe(true)
      expect(await fileSystem.directoryExists("docs/api")).toBe(true)
      expect(await fileSystem.directoryExists("non-existing")).toBe(false)
    })

    test("should check if path exists (file or directory)", async () => {
      expect(await fileSystem.exists("README.md")).toBe(true)
      expect(await fileSystem.exists("docs")).toBe(true)
      expect(await fileSystem.exists("docs/getting-started.md")).toBe(true)
      expect(await fileSystem.exists("non-existing")).toBe(false)
    })
  })

  describe("resolve path", () => {
    test("should resolve relative path to absolute", () => {
      const fileSystem = new DocFileSystemJsonRead({
        data: sampleJsonData,
        basePath: "/project",
      })

      expect(fileSystem.resolve("README.md")).toBe("/project/README.md")
      expect(fileSystem.resolve("docs/api/index.md")).toBe(
        "/project/docs/api/index.md",
      )
    })

    test("should resolve with default base path", () => {
      const fileSystem = new DocFileSystemJsonRead({
        data: sampleJsonData,
      })

      expect(fileSystem.resolve("README.md")).toBe("docs/README.md")
      expect(fileSystem.resolve("docs/api/index.md")).toBe(
        "docs/docs/api/index.md",
      )
    })
  })

  describe("file size", () => {
    const fileSystem = new DocFileSystemJsonRead({
      data: sampleJsonData,
    })

    test("should get file size in bytes", async () => {
      const size = await fileSystem.getFileSize("README.md")
      expect(size).toBe(
        Buffer.byteLength(
          "# Project Title\n\nThis is the main README file.",
          "utf8",
        ),
      )
    })

    test("should return error for non-existing file", async () => {
      const size = await fileSystem.getFileSize("non-existing.md")
      expect(size).toBeInstanceOf(Error)
      if (size instanceof Error) {
        expect(size.message).toContain("File not found")
      }
    })
  })

  describe("file timestamps", () => {
    const fileSystem = new DocFileSystemJsonRead({
      data: sampleJsonData,
    })

    test("should return error for modified time (not available)", async () => {
      const modifiedTime = await fileSystem.getFileUpdatedTime("README.md")
      expect(modifiedTime).toBeInstanceOf(Error)
      if (modifiedTime instanceof Error) {
        expect(modifiedTime.message).toContain("not available")
      }
    })

    test("should return error for created time (not available)", async () => {
      const createdTime = await fileSystem.getFileCreatedTime("README.md")
      expect(createdTime).toBeInstanceOf(Error)
      if (createdTime instanceof Error) {
        expect(createdTime.message).toContain("not available")
      }
    })
  })

  describe("utility methods", () => {
    const fileSystem = new DocFileSystemJsonRead({
      data: sampleJsonData,
    })

    test("should get all file paths", () => {
      const allPaths = fileSystem.getAllFilePaths()
      expect(allPaths).toContain("README.md")
      expect(allPaths).toContain("docs/getting-started.md")
      expect(allPaths).toContain("docs/api/index.md")
      expect(allPaths).toHaveLength(7)
    })

    test("should get raw data copy", () => {
      const rawData = fileSystem.getRawData()
      expect(rawData).toEqual(sampleJsonData)

      // データがコピーであることを確認
      rawData["test.md"] = "test content"
      const rawData2 = fileSystem.getRawData()
      expect(rawData2["test.md"]).toBeUndefined()
    })
  })

  describe("edge cases", () => {
    test("should handle empty JSON data", async () => {
      const fileSystem = new DocFileSystemJsonRead({
        data: {},
      })

      expect(await fileSystem.readFile("any.md")).toBeNull()
      expect(await fileSystem.readDirectoryFileNames("")).toEqual([])
      expect(await fileSystem.isFile("any.md")).toBe(false)
      expect(await fileSystem.isDirectory("any")).toBe(false)
    })

    test("should handle complex nested structure", async () => {
      const complexData = {
        "a/b/c/d/e/file.md": "Deep nested file",
        "a/b/other.md": "Other file",
      }

      const fileSystem = new DocFileSystemJsonRead({
        data: complexData,
      })

      expect(await fileSystem.readFile("a/b/c/d/e/file.md")).toBe(
        "Deep nested file",
      )
      expect(await fileSystem.isDirectory("a")).toBe(true)
      expect(await fileSystem.isDirectory("a/b")).toBe(true)
      expect(await fileSystem.isDirectory("a/b/c")).toBe(true)
      expect(await fileSystem.isDirectory("a/b/c/d")).toBe(true)
      expect(await fileSystem.isDirectory("a/b/c/d/e")).toBe(true)
    })
  })
})
