import { describe, expect, test } from "bun:test"
import { DocFileSystemJsonWrite } from "./doc-file-system-json-write"

describe("DocFileSystemJsonWrite", () => {
  const sampleJsonData = {
    "README.md": "# Project Title",
    "docs/getting-started.md": "# Getting Started",
  }

  test("should create instance with valid JSON data", () => {
    const fileSystem = new DocFileSystemJsonWrite({
      data: sampleJsonData,
    })

    expect(fileSystem.getAllFilePaths()).toEqual(["README.md", "docs/getting-started.md"])
  })

  test("should create instance with empty data", () => {
    const fileSystem = new DocFileSystemJsonWrite()

    expect(fileSystem.getAllFilePaths()).toEqual([])
  })

  test("should throw error with invalid JSON data", () => {
    expect(() => {
      new DocFileSystemJsonWrite({
        data: { key: 123 },
      })
    }).toThrow()
  })

  describe("writeFile", () => {
    test("should write new file", async () => {
      const fileSystem = new DocFileSystemJsonWrite()

      const result = await fileSystem.writeFile("new-file.md", "# New File")

      expect(result).toBeNull()
      expect(fileSystem.getData()["new-file.md"]).toBe("# New File")
    })

    test("should overwrite existing file", async () => {
      const fileSystem = new DocFileSystemJsonWrite({ data: sampleJsonData })

      const result = await fileSystem.writeFile("README.md", "# Updated")

      expect(result).toBeNull()
      expect(fileSystem.getData()["README.md"]).toBe("# Updated")
    })

    test("should normalize leading slashes", async () => {
      const fileSystem = new DocFileSystemJsonWrite()

      await fileSystem.writeFile("/path/file.md", "content")

      expect(fileSystem.getData()["path/file.md"]).toBe("content")
    })

    test("should notify data change callback", async () => {
      const snapshots: Record<string, string>[] = []
      const fileSystem = new DocFileSystemJsonWrite({
        onDataChange: (data) => {
          snapshots.push(data)
        },
      })

      await fileSystem.writeFile("file.md", "content")

      expect(snapshots.length).toBe(1)
      expect(snapshots[0]?.["file.md"]).toBe("content")
    })
  })

  describe("deleteFile", () => {
    test("should delete existing file", async () => {
      const fileSystem = new DocFileSystemJsonWrite({ data: sampleJsonData })

      const result = await fileSystem.deleteFile("README.md")

      expect(result).toBeNull()
      expect(fileSystem.getAllFilePaths()).toEqual(["docs/getting-started.md"])
    })

    test("should return error for missing file", async () => {
      const fileSystem = new DocFileSystemJsonWrite({ data: sampleJsonData })

      const result = await fileSystem.deleteFile("missing.md")

      expect(result).toBeInstanceOf(Error)
    })

    test("should keep other files intact after delete", async () => {
      const fileSystem = new DocFileSystemJsonWrite({ data: sampleJsonData })

      await fileSystem.deleteFile("README.md")

      expect(fileSystem.getData()["docs/getting-started.md"]).toBe("# Getting Started")
    })
  })

  describe("copyFile", () => {
    test("should copy file within data", async () => {
      const fileSystem = new DocFileSystemJsonWrite({ data: sampleJsonData })

      const result = await fileSystem.copyFile("README.md", "README-copy.md")

      expect(result).toBeNull()
      expect(fileSystem.getData()["README-copy.md"]).toBe("# Project Title")
      expect(fileSystem.getData()["README.md"]).toBe("# Project Title")
    })

    test("should return error for missing source", async () => {
      const fileSystem = new DocFileSystemJsonWrite({ data: sampleJsonData })

      const result = await fileSystem.copyFile("missing.md", "dest.md")

      expect(result).toBeInstanceOf(Error)
    })
  })

  describe("moveFile", () => {
    test("should move file within data", async () => {
      const fileSystem = new DocFileSystemJsonWrite({ data: sampleJsonData })

      const result = await fileSystem.moveFile("README.md", "docs/README.md")

      expect(result).toBeNull()
      expect(fileSystem.getData()["docs/README.md"]).toBe("# Project Title")
      expect(fileSystem.getData()["README.md"]).toBeUndefined()
    })

    test("should return error for missing source", async () => {
      const fileSystem = new DocFileSystemJsonWrite({ data: sampleJsonData })

      const result = await fileSystem.moveFile("missing.md", "dest.md")

      expect(result).toBeInstanceOf(Error)
    })
  })

  describe("setData", () => {
    test("should replace entire data", () => {
      const fileSystem = new DocFileSystemJsonWrite({ data: sampleJsonData })

      const result = fileSystem.setData({ "only.md": "content" })

      expect(result).toBeNull()
      expect(fileSystem.getAllFilePaths()).toEqual(["only.md"])
    })

    test("should return error for invalid data", () => {
      const fileSystem = new DocFileSystemJsonWrite()

      const result = fileSystem.setData({ key: 123 })

      expect(result).toBeInstanceOf(Error)
    })
  })

  describe("clear", () => {
    test("should remove all data", () => {
      const fileSystem = new DocFileSystemJsonWrite({ data: sampleJsonData })

      fileSystem.clear()

      expect(fileSystem.getAllFilePaths()).toEqual([])
    })
  })
})
