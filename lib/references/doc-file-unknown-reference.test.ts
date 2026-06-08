import { expect, test } from "bun:test"
import { DocFileUnknownEntity } from "../entities/doc-file-unknown-entity"
import { DocFileSystemMock } from "../modules/file-system/doc-file-system-mock"
import { defaultTestConfig } from "../utils"
import { DocFilePathValue } from "../values/doc-file-path-value"
import { DocFileUnknownReference } from "./doc-file-unknown-reference"

test("DocFileUnknownReference - readメソッドが正しくエンティティを返す", async () => {
  const fileSystem = DocFileSystemMock.createWithFiles({
    fileContents: {
      "docs/assets/logo.png": "binary data",
      "docs/config.json": '{"version": "1.0"}',
    },
  })

  const pngRef = new DocFileUnknownReference({
    path: "docs/assets/logo.png",
    fileSystem,
    pathSystem: fileSystem.getPathSystem(),
    config: defaultTestConfig,
    customSchema: {},
  })

  const pngEntity = await pngRef.read()

  expect(pngEntity).toBeInstanceOf(DocFileUnknownEntity)
  expect(pngEntity.content).toBe("binary data")
  expect(pngEntity.path.path).toBe("docs/assets/logo.png")

  const jsonRef = new DocFileUnknownReference({
    path: "docs/config.json",
    fileSystem,
    pathSystem: fileSystem.getPathSystem(),
    config: defaultTestConfig,
    customSchema: {},
  })

  const jsonEntity = await jsonRef.read()

  expect(jsonEntity).toBeInstanceOf(DocFileUnknownEntity)
  expect(jsonEntity.content).toBe('{"version": "1.0"}')
})

test("DocFileUnknownReference - writeメソッドがファイルを書き込む", async () => {
  const fileSystem = DocFileSystemMock.createWithFiles({})

  const ref = new DocFileUnknownReference({
    path: "docs/data/output.csv",
    fileSystem,
    pathSystem: fileSystem.getPathSystem(),
    config: defaultTestConfig,
    customSchema: {},
  })

  const pathValue = DocFilePathValue.fromPathWithSystem(
    "docs/data/output.csv",
    fileSystem.getPathSystem(),
  )
  const entity = new DocFileUnknownEntity({
    type: "unknown",
    path: pathValue.value,
    content: "id,name,value\n1,item1,100\n2,item2,200",
    extension: "csv",
    isArchived: false,
  })

  await ref.write(entity)

  const writtenContent = fileSystem.getFileContent("docs/data/output.csv")
  expect(writtenContent).toBe("id,name,value\n1,item1,100\n2,item2,200")
})

test("DocFileUnknownReference - 存在しないファイルのreadがthrowする", async () => {
  const fileSystem = DocFileSystemMock.createWithFiles({})

  const ref = new DocFileUnknownReference({
    path: "docs/nonexistent.txt",
    fileSystem,
    pathSystem: fileSystem.getPathSystem(),
    config: defaultTestConfig,
    customSchema: {},
  })

  expect(async () => await ref.read()).toThrow("File not found at docs/nonexistent.txt.")
})

test("DocFileUnknownReference - safe.readが存在しないファイルでErrorを返す", async () => {
  const fileSystem = DocFileSystemMock.createWithFiles({})

  const ref = new DocFileUnknownReference({
    path: "docs/nonexistent.txt",
    fileSystem,
    pathSystem: fileSystem.getPathSystem(),
    config: defaultTestConfig,
    customSchema: {},
  })

  const safeResult = await ref.safe.read()
  expect(safeResult).toBeInstanceOf(Error)
})

test("DocFileUnknownReference - .mdファイルのread()がthrowする", async () => {
  const fileSystem = DocFileSystemMock.createWithFiles({
    fileContents: { "docs/readme.md": "# README" },
  })

  const ref = new DocFileUnknownReference({
    path: "docs/readme.md",
    fileSystem,
    pathSystem: fileSystem.getPathSystem(),
    config: defaultTestConfig,
    customSchema: {},
  })

  expect(async () => await ref.read()).toThrow("DocFileMdReference")
})

test("DocFileUnknownReference - archiveがファイルを移動する", async () => {
  const fileSystem = DocFileSystemMock.createWithFiles({
    fileContents: { "docs/data.json": '{"key": "value"}' },
  })

  const ref = new DocFileUnknownReference({
    path: "docs/data.json",
    fileSystem,
    pathSystem: fileSystem.getPathSystem(),
    config: defaultTestConfig,
    customSchema: {},
  })

  const archivedRef = await ref.archive()

  expect(archivedRef.path).toBe("docs/_/data.json")
})

test("DocFileUnknownReference - restoreがアーカイブ外でthrowする", async () => {
  const fileSystem = DocFileSystemMock.createWithFiles({
    fileContents: { "docs/data.json": '{"key": "value"}' },
  })

  const ref = new DocFileUnknownReference({
    path: "docs/data.json",
    fileSystem,
    pathSystem: fileSystem.getPathSystem(),
    config: defaultTestConfig,
    customSchema: {},
  })

  expect(async () => await ref.restore()).toThrow()
})

test("DocFileUnknownReference - safe.restoreがアーカイブ外でErrorを返す", async () => {
  const fileSystem = DocFileSystemMock.createWithFiles({
    fileContents: { "docs/data.json": '{"key": "value"}' },
  })

  const ref = new DocFileUnknownReference({
    path: "docs/data.json",
    fileSystem,
    pathSystem: fileSystem.getPathSystem(),
    config: defaultTestConfig,
    customSchema: {},
  })

  const safeResult = await ref.safe.restore()
  expect(safeResult).toBeInstanceOf(Error)
})
