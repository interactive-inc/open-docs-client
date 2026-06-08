import { expect, test } from "bun:test"
import { DocFileIndexEntity } from "../entities/doc-file-index-entity"
import { DocFileSystemMock } from "../modules/file-system/doc-file-system-mock"
import { defaultTestConfig } from "../utils"
import { DocFileIndexReference } from "./doc-file-index-reference"

test("DocFileIndexReference - writeメソッドがフロントマターを含む完全なテキストを書き込む", async () => {
  const fileSystem = DocFileSystemMock.createWithFiles({
    fileContents: {
      "docs/products/features/index.md": ["# 機能", "", "機能の説明"].join("\n"),
    },
  })

  const ref = new DocFileIndexReference({
    path: "products/features/index.md",
    fileSystem,
    pathSystem: fileSystem.getPathSystem(),
    customSchema: {},
    config: defaultTestConfig,
  })

  const entity = await ref.read()
  expect(entity).toBeInstanceOf(DocFileIndexEntity)

  const updatedEntity = entity.withContent(entity.content.withTitle("新しいタイトル"))

  await ref.write(updatedEntity)

  const writtenContent = fileSystem.getFileContent("products/features/index.md")
  expect(writtenContent).toBeTruthy()
  expect(writtenContent).toContain("# 新しいタイトル")
})

test("DocFileIndexReference - readメソッドが正しくエンティティを返す", async () => {
  const fileSystem = DocFileSystemMock.createWithFiles({
    fileContents: {
      "docs/index.md": ["# ドキュメント", "", "説明文"].join("\n"),
    },
  })

  const ref = new DocFileIndexReference({
    path: "docs/index.md",
    fileSystem,
    pathSystem: fileSystem.getPathSystem(),
    customSchema: {},
    config: defaultTestConfig,
  })

  const entity = await ref.read()
  expect(entity).toBeInstanceOf(DocFileIndexEntity)

  expect(entity.content.title).toBe("ドキュメント")
  expect(entity.content.description).toBe("説明文")

  const frontMatter = entity.content.meta()
  expect(frontMatter.icon).toBe("📁")
  expect(frontMatter.schema().toJson()).toEqual({})
})

test("DocFileIndexReference - directoryPathが正しく返る", () => {
  const fileSystem = DocFileSystemMock.createWithFiles({
    fileContents: { "docs/products/index.md": "# Products" },
  })

  const ref = new DocFileIndexReference({
    path: "docs/products/index.md",
    fileSystem,
    pathSystem: fileSystem.getPathSystem(),
    customSchema: {},
    config: defaultTestConfig,
  })

  expect(ref.directoryPath).toBe("docs/products")
})

test("DocFileIndexReference - 不正なJSONの.meta.jsonを安全に処理する", async () => {
  const fileSystem = DocFileSystemMock.createWithFiles({
    fileContents: {
      "docs/index.md": "# Docs",
      "docs/.meta.json": "{ invalid json",
    },
  })

  const ref = new DocFileIndexReference({
    path: "docs/index.md",
    fileSystem,
    pathSystem: fileSystem.getPathSystem(),
    customSchema: {},
    config: defaultTestConfig,
  })

  const entity = await ref.read()
  expect(entity).toBeInstanceOf(DocFileIndexEntity)
})

test("DocFileIndexReference - 空の.meta.jsonを安全に処理する", async () => {
  const fileSystem = DocFileSystemMock.createWithFiles({
    fileContents: {
      "docs/index.md": "# Docs",
      "docs/.meta.json": "",
    },
  })

  const ref = new DocFileIndexReference({
    path: "docs/index.md",
    fileSystem,
    pathSystem: fileSystem.getPathSystem(),
    customSchema: {},
    config: defaultTestConfig,
  })

  const entity = await ref.read()
  expect(entity).toBeInstanceOf(DocFileIndexEntity)
})

test("DocFileIndexReference - archiveがファイルを移動する", async () => {
  const fileSystem = DocFileSystemMock.createWithFiles({
    fileContents: { "docs/products/index.md": "# Products" },
  })

  const ref = new DocFileIndexReference({
    path: "docs/products/index.md",
    fileSystem,
    pathSystem: fileSystem.getPathSystem(),
    customSchema: {},
    config: defaultTestConfig,
  })

  const archivedRef = await ref.archive()

  expect(archivedRef.filePath).toBe("docs/products/_/index.md")
})

test("DocFileIndexReference - restoreがファイルを復元する", async () => {
  const fileSystem = DocFileSystemMock.createWithFiles({
    fileContents: { "docs/products/_/index.md": "# Products" },
  })

  const ref = new DocFileIndexReference({
    path: "docs/products/_/index.md",
    fileSystem,
    pathSystem: fileSystem.getPathSystem(),
    customSchema: {},
    config: defaultTestConfig,
  })

  const restoredRef = await ref.restore()

  expect(restoredRef.filePath).toBe("docs/products/index.md")
})

test("DocFileIndexReference - restoreがアーカイブ外のファイルでthrowする", async () => {
  const fileSystem = DocFileSystemMock.createWithFiles({
    fileContents: { "docs/products/index.md": "# Products" },
  })

  const ref = new DocFileIndexReference({
    path: "docs/products/index.md",
    fileSystem,
    pathSystem: fileSystem.getPathSystem(),
    customSchema: {},
    config: defaultTestConfig,
  })

  expect(async () => await ref.restore()).toThrow()
})

test("DocFileIndexReference - safe.restoreがアーカイブ外でErrorを返す", async () => {
  const fileSystem = DocFileSystemMock.createWithFiles({
    fileContents: { "docs/products/index.md": "# Products" },
  })

  const ref = new DocFileIndexReference({
    path: "docs/products/index.md",
    fileSystem,
    pathSystem: fileSystem.getPathSystem(),
    customSchema: {},
    config: defaultTestConfig,
  })

  const safeResult = await ref.safe.restore()
  expect(safeResult).toBeInstanceOf(Error)
})
