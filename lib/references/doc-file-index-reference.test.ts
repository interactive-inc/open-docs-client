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

  // 既存のエンティティを読み込む
  const entity = await ref.read()
  if (entity instanceof Error) {
    throw entity
  }
  expect(entity).toBeInstanceOf(DocFileIndexEntity)

  // タイトルを更新
  const updatedEntity = entity.withContent(entity.content.withTitle("新しいタイトル"))

  // ファイルに書き込む
  await ref.write(updatedEntity)

  // ファイルの内容を確認
  const writtenContent = fileSystem.getFileContent("products/features/index.md")
  expect(writtenContent).toBeTruthy()

  // タイトルが更新されていることを確認
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
  if (entity instanceof Error) {
    throw entity
  }
  expect(entity).toBeInstanceOf(DocFileIndexEntity)

  // コンテンツの確認
  expect(entity.content.title).toBe("ドキュメント")
  expect(entity.content.description).toBe("説明文")

  const frontMatter = entity.content.meta()
  expect(frontMatter.icon).toBe("📁") // デフォルトアイコン
  expect(frontMatter.schema().toJson()).toEqual({})
})
