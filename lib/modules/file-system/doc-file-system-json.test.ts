import { describe, expect, test } from "bun:test"
import { DocFileSystemJson } from "./doc-file-system-json"

describe("DocFileSystemJson", () => {
  test("コンストラクタでインスタンス化できる", () => {
    const fileSystem = new DocFileSystemJson({ data: { "a.md": "hello" } })

    expect(fileSystem).toBeInstanceOf(DocFileSystemJson)
  })

  test("空データでもインスタンス化できる", () => {
    const fileSystem = new DocFileSystemJson()

    expect(fileSystem).toBeInstanceOf(DocFileSystemJson)
  })

  test("fromDocsToJson でインスタンス化できる", () => {
    const fileSystem = DocFileSystemJson.fromDocsToJson({ "a.md": "x" })

    expect(fileSystem).toBeInstanceOf(DocFileSystemJson)
  })

  test("writeFile した内容を readFile で読み戻せる", async () => {
    const fileSystem = new DocFileSystemJson({ data: {} })

    await fileSystem.writeFile("b.md", "world")

    expect(await fileSystem.readFile("b.md")).toBe("world")
  })

  test("writeFile が getData / getRawData の両方に反映される", async () => {
    const fileSystem = new DocFileSystemJson({ data: {} })

    await fileSystem.writeFile("c.md", "z")

    expect(fileSystem.getData()).toEqual({ "c.md": "z" })
    expect(fileSystem.getRawData()).toEqual({ "c.md": "z" })
  })

  test("deleteFile した後 readFile は null を返す", async () => {
    const fileSystem = new DocFileSystemJson({ data: { "a.md": "x" } })

    await fileSystem.deleteFile("a.md")

    expect(await fileSystem.readFile("a.md")).toBe(null)
  })

  test("writeFile したファイルが readDirectoryFileNames に現れる", async () => {
    const fileSystem = new DocFileSystemJson({ data: {}, basePath: "docs" })

    await fileSystem.writeFile("dir/x.md", "1")

    expect(await fileSystem.readDirectoryFileNames("dir")).toEqual(["x.md"])
  })

  test("copyFile が writer の変更を reader に反映する", async () => {
    const fileSystem = new DocFileSystemJson({ data: { "src.md": "content" } })

    await fileSystem.copyFile("src.md", "dst.md")

    expect(await fileSystem.readFile("dst.md")).toBe("content")
    expect(await fileSystem.readFile("src.md")).toBe("content")
  })

  test("moveFile が writer の変更を reader に反映する", async () => {
    const fileSystem = new DocFileSystemJson({ data: { "src.md": "content" } })

    await fileSystem.moveFile("src.md", "dst.md")

    expect(await fileSystem.readFile("dst.md")).toBe("content")
    expect(await fileSystem.readFile("src.md")).toBe(null)
  })

  test("setData がインスタンス全体に反映される", async () => {
    const fileSystem = new DocFileSystemJson({ data: { "old.md": "x" } })

    fileSystem.setData({ "new.md": "y" })

    expect(await fileSystem.readFile("old.md")).toBe(null)
    expect(await fileSystem.readFile("new.md")).toBe("y")
  })

  test("clear が reader / writer の両方を空にする", async () => {
    const fileSystem = new DocFileSystemJson({ data: { "a.md": "x" } })

    fileSystem.clear()

    expect(await fileSystem.readFile("a.md")).toBe(null)
    expect(fileSystem.getAllFilePaths()).toEqual([])
  })
})
