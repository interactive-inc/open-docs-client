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

  // PNGファイルの場合
  const pngRef = new DocFileUnknownReference({
    path: "docs/assets/logo.png",
    fileSystem,
    pathSystem: fileSystem.getPathSystem(),
    config: defaultTestConfig,
    customSchema: {},
  })

  const pngEntity = await pngRef.read()

  if (pngEntity instanceof Error) {
    throw pngEntity
  }

  expect(pngEntity).toBeInstanceOf(DocFileUnknownEntity)
  expect(pngEntity.content).toBe("binary data")
  expect(pngEntity.path.path).toBe("docs/assets/logo.png")

  // JSONファイルの場合
  const jsonRef = new DocFileUnknownReference({
    path: "docs/config.json",
    fileSystem,
    pathSystem: fileSystem.getPathSystem(),
    config: defaultTestConfig,
    customSchema: {},
  })

  const jsonEntity = await jsonRef.read()

  if (jsonEntity instanceof Error) {
    throw jsonEntity
  }

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

  // 新しいエンティティを作成
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

  // ファイルに書き込む
  await ref.write(entity)

  // ファイルの内容を確認
  const writtenContent = fileSystem.getFileContent("docs/data/output.csv")
  expect(writtenContent).toBe("id,name,value\n1,item1,100\n2,item2,200")
})

test("DocFileUnknownReference - 存在しないファイルを読み込もうとするとErrorを返す", async () => {
  const fileSystem = DocFileSystemMock.createWithFiles({})

  const ref = new DocFileUnknownReference({
    path: "docs/nonexistent.txt",
    fileSystem,
    pathSystem: fileSystem.getPathSystem(),
    config: defaultTestConfig,
    customSchema: {},
  })

  const result = await ref.read()
  expect(result).toBeInstanceOf(Error)

  if (result instanceof Error) {
    expect(result.message).toBe("File not found at docs/nonexistent.txt.")
  }
})
