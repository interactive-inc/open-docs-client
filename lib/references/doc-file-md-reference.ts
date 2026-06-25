import { META_FILE_NAME } from "../constants"
import { createSafeProxy, type Safe } from "../create-safe-proxy"
import { DocFileMdEntity } from "../entities/doc-file-md-entity"
import type { DocFileSystemInterface } from "../modules/file-system/doc-file-system.interface"
import type { DocPathSystem } from "../modules/path-system/doc-path-system"
import type {
  BaseFieldValueType,
  DocClientConfig,
  DocCustomSchema,
  ExtractFieldType,
  MultiRelationKeys,
  RelationKeys,
} from "../types"
import { DocFileMdContentValue } from "../values/doc-file-md-content-value"
import type { DocFileMdMetaValue } from "../values/doc-file-md-meta-value"
import { DocFilePathValue } from "../values/doc-file-path-value"
import { DocDirectoryReference } from "./doc-directory-reference"
import { DocFileIndexReference } from "./doc-file-index-reference"

type Props<T extends DocCustomSchema> = {
  path: string
  fileSystem: DocFileSystemInterface
  pathSystem: DocPathSystem
  customSchema: T
  config: DocClientConfig
}

/**
 * File reference
 */
export class DocFileMdReference<T extends DocCustomSchema> {
  private readonly pathSystem: DocPathSystem

  private readonly customSchema: T

  constructor(private readonly props: Props<T>) {
    this.pathSystem = props.pathSystem
    this.customSchema = props.customSchema
    Object.freeze(this)
  }

  get safe(): Safe<this> {
    return createSafeProxy(this)
  }

  get fileSystem(): DocFileSystemInterface {
    return this.props.fileSystem
  }

  get basePath(): string {
    return this.fileSystem.getBasePath()
  }

  get path(): string {
    return this.props.path
  }

  get fullPath(): string {
    return this.pathSystem.join(this.basePath, this.path)
  }

  get directoryPath(): string {
    return this.pathSystem.dirname(this.path)
  }

  get archivedPath(): string {
    return this.pathSystem.join(this.directoryPath, "_", this.nameWithExtension)
  }

  get name(): string {
    return this.pathSystem.basename(this.path, ".md")
  }

  get nameWithExtension(): string {
    return `${this.name}.md`
  }

  async exists(): Promise<boolean> {
    if (await this.fileSystem.exists(this.path)) {
      return true
    }

    const dirPath = this.pathSystem.dirname(this.path)

    const fileName = this.pathSystem.basename(this.path)

    const archivePath = this.pathSystem.join(dirPath, "_", fileName)

    return this.fileSystem.exists(archivePath)
  }

  async read(): Promise<DocFileMdEntity<T>> {
    const content = await this.fileSystem.readFile(this.path)

    if (content instanceof Error) {
      throw content
    }

    const actualPath = this.path

    if (content === null) {
      const archivedContent = await this.fileSystem.readFile(this.archivedPath)

      if (archivedContent instanceof Error) {
        throw archivedContent
      }

      if (archivedContent !== null) {
        const contentValue = DocFileMdContentValue.fromMarkdown(archivedContent, this.customSchema)
        // アーカイブの実ファイル位置で pathValue を構築する。
        // 非アーカイブパスのままだと entity の isArchived フラグと矛盾する
        const pathValue = DocFilePathValue.fromPathWithSystem(
          this.archivedPath,
          this.pathSystem,
          this.basePath,
        )
        return new DocFileMdEntity<T>(
          {
            type: "markdown",
            content: contentValue.value,
            path: pathValue.value,
            isArchived: true,
          },
          this.customSchema,
        )
      }
    }

    if (content === null) {
      throw new Error(`File not found at ${this.path} or in archive.`)
    }

    const contentValue = DocFileMdContentValue.fromMarkdown(content, this.customSchema)

    const pathValue = DocFilePathValue.fromPathWithSystem(
      actualPath,
      this.pathSystem,
      this.basePath,
    )

    const isInArchiveDir = this.path.includes("/_/") || this.path.startsWith("_/")

    return new DocFileMdEntity<T>(
      {
        type: "markdown",
        content: contentValue.value,
        path: pathValue.value,
        isArchived: isInArchiveDir,
      },
      this.customSchema,
    )
  }

  async readText(): Promise<string> {
    const entity = await this.read()
    return entity.value.content.body
  }

  /**
   * Create empty DocFileMdEntity
   */
  empty(): DocFileMdEntity<T> {
    const contentValue = DocFileMdContentValue.empty("", this.customSchema)

    const pathValue = DocFilePathValue.fromPathWithSystem(this.path, this.pathSystem, this.basePath)

    return new DocFileMdEntity<T>(
      {
        type: "markdown",
        content: contentValue.value,
        path: pathValue.value,
        isArchived: false,
      },
      this.customSchema,
    )
  }

  async write(entity: DocFileMdEntity<T>): Promise<void> {
    const content = entity.content().toText()
    const writeResult = await this.fileSystem.writeFile(this.path, content)

    if (writeResult instanceof Error) {
      throw writeResult
    }
  }

  async writeText(text: string): Promise<void> {
    const writeResult = await this.fileSystem.writeFile(this.path, text)

    if (writeResult instanceof Error) {
      throw writeResult
    }
  }

  async writeDefault(): Promise<void> {
    const fileName = this.pathSystem.basename(this.path, ".md")
    const defaultContent = [`# ${fileName}`, "", "Write your content here."].join("\n")
    const writeResult = await this.fileSystem.writeFile(this.path, defaultContent)

    if (writeResult instanceof Error) {
      throw writeResult
    }
  }

  async delete(): Promise<void> {
    const deleteResult = await this.fileSystem.deleteFile(this.path)

    if (deleteResult instanceof Error) {
      throw deleteResult
    }
  }

  async copyTo(destinationPath: string): Promise<void> {
    const copyResult = await this.fileSystem.copyFile(this.path, destinationPath)

    if (copyResult instanceof Error) {
      throw copyResult
    }
  }

  async moveTo(destinationPath: string): Promise<void> {
    const moveResult = await this.fileSystem.moveFile(this.path, destinationPath)

    if (moveResult instanceof Error) {
      throw moveResult
    }
  }

  async archive(
    archiveDirectoryName = this.props.config.archiveDirectoryName,
  ): Promise<DocFileMdReference<T>> {
    const dirPath = this.pathSystem.dirname(this.path)

    const fileName = this.pathSystem.basename(this.path)

    const archivePath = this.pathSystem.join(dirPath, archiveDirectoryName, fileName)

    await this.moveTo(archivePath)

    return new DocFileMdReference({
      path: archivePath,
      fileSystem: this.fileSystem,
      pathSystem: this.pathSystem,
      customSchema: this.customSchema,
      config: this.props.config,
    })
  }

  async restore(
    archiveDirectoryName = this.props.config.archiveDirectoryName,
  ): Promise<DocFileMdReference<T>> {
    const dirPath = this.pathSystem.dirname(this.path)

    const parentDirName = this.pathSystem.basename(dirPath)

    if (parentDirName !== archiveDirectoryName) {
      throw new Error(`File is not in archive directory: ${this.path}`)
    }

    const fileName = this.pathSystem.basename(this.path)

    const restorePath = this.pathSystem.join(this.pathSystem.dirname(dirPath), fileName)

    await this.moveTo(restorePath)

    return new DocFileMdReference({
      path: restorePath,
      fileSystem: this.fileSystem,
      pathSystem: this.pathSystem,
      customSchema: this.customSchema,
      config: this.props.config,
    })
  }

  async size(): Promise<number> {
    const fileSize = await this.fileSystem.getFileSize(this.path)

    if (fileSize instanceof Error) {
      throw fileSize
    }

    return fileSize
  }

  async lastModified(): Promise<Date> {
    const updatedTime = await this.fileSystem.getFileUpdatedTime(this.path)

    if (updatedTime instanceof Error) {
      throw updatedTime
    }

    return updatedTime
  }

  async createdAt(): Promise<Date> {
    const createdTime = await this.fileSystem.getFileCreatedTime(this.path)

    if (createdTime instanceof Error) {
      throw createdTime
    }

    return createdTime
  }

  directory(): DocDirectoryReference<T> {
    const paths = this.directoryPath.split(this.pathSystem.separator)

    if (paths[paths.length - 1] === this.props.config.archiveDirectoryName) {
      const path = paths.slice(0, -1).join(this.pathSystem.separator)
      return new DocDirectoryReference<T>({
        archiveDirectoryName: this.props.config.archiveDirectoryName,
        indexFileName: this.props.config.indexFileName,
        fileSystem: this.fileSystem,
        path: path,
        pathSystem: this.pathSystem,
        customSchema: this.customSchema,
        config: this.props.config,
      })
    }

    return new DocDirectoryReference<T>({
      archiveDirectoryName: this.props.config.archiveDirectoryName,
      indexFileName: this.props.config.indexFileName,
      fileSystem: this.fileSystem,
      path: this.directoryPath,
      pathSystem: this.pathSystem,
      customSchema: this.customSchema,
      config: this.props.config,
    })
  }

  async relation(key: RelationKeys<T>): Promise<DocFileMdReference<DocCustomSchema> | null>

  async relation<U extends DocCustomSchema>(
    key: RelationKeys<T>,
    targetSchema: U,
  ): Promise<DocFileMdReference<U> | null>

  async relation(
    key: RelationKeys<T>,
    targetSchema?: DocCustomSchema,
  ): Promise<DocFileMdReference<DocCustomSchema> | null> {
    const file = await this.read()

    const relationValue = file.content().meta().relation(key)

    if (relationValue === null) {
      return null
    }

    const indexRef = await this.directoryIndex()

    if (!indexRef) {
      return null
    }

    const indexFile = await indexRef.read()

    const schemaValue = indexFile.content.meta().schema()
    const fieldValue = schemaValue.value[String(key)]

    if (!fieldValue || fieldValue.type !== "relation") {
      return null
    }

    const relationField = schemaValue.relation(key)
    const resolvedPath = this.resolveRelationDirectory(relationField.path)

    const fullPath = this.pathSystem.join(resolvedPath, `${relationValue}.md`)

    return new DocFileMdReference<DocCustomSchema>({
      path: fullPath,
      fileSystem: this.fileSystem,
      pathSystem: this.pathSystem,
      customSchema: targetSchema ?? {},
      config: this.props.config,
    })
  }

  /**
   * スキーマで定義された relation の path を解決する。
   * ".." 始まりの相対パスはファイルのディレクトリ基準で正規化する
   */
  private resolveRelationDirectory(schemaPath: string): string {
    if (schemaPath.startsWith("..")) {
      return this.pathSystem.normalize(this.pathSystem.join(this.directoryPath, schemaPath))
    }

    return schemaPath
  }

  async directoryIndex(): Promise<DocFileIndexReference<T> | null> {
    const indexFileName = this.props.config.indexFileName
    const archiveDirectoryName = this.props.config.archiveDirectoryName
    const metaFileName = this.props.config.metaFileName ?? META_FILE_NAME

    const indexPath = this.pathSystem.join(this.directoryPath, indexFileName)

    const exists = await this.fileSystem.exists(indexPath)

    if (exists) {
      return new DocFileIndexReference({
        path: indexPath,
        fileSystem: this.fileSystem,
        pathSystem: this.pathSystem,
        customSchema: this.customSchema,
        config: this.props.config,
      })
    }

    // index.md が無くても .meta.json があればスキーマを解決できるため index 参照を返す
    const metaPath = this.pathSystem.join(this.directoryPath, metaFileName)

    const metaExists = await this.fileSystem.exists(metaPath)

    if (metaExists) {
      return new DocFileIndexReference({
        path: indexPath,
        fileSystem: this.fileSystem,
        pathSystem: this.pathSystem,
        customSchema: this.customSchema,
        config: this.props.config,
      })
    }

    const archivedIndexPath = this.pathSystem.join(
      this.directoryPath,
      archiveDirectoryName,
      indexFileName,
    )

    const archivedExists = await this.fileSystem.exists(archivedIndexPath)

    if (archivedExists) {
      return new DocFileIndexReference({
        path: archivedIndexPath,
        fileSystem: this.fileSystem,
        pathSystem: this.pathSystem,
        customSchema: this.customSchema,
        config: this.props.config,
      })
    }

    return null
  }

  async relations(key: MultiRelationKeys<T>): Promise<DocFileMdReference<DocCustomSchema>[]>

  async relations<U extends DocCustomSchema>(
    key: MultiRelationKeys<T>,
    customSchema: U,
  ): Promise<DocFileMdReference<U>[]>

  async relations(
    key: MultiRelationKeys<T>,
    customSchema?: DocCustomSchema,
  ): Promise<DocFileMdReference<DocCustomSchema>[]> {
    const file = await this.read()

    const fileNames = file.content().meta().multiRelation(key)

    if (fileNames === null) {
      return []
    }

    const indexRef = await this.directoryIndex()

    if (indexRef === null) {
      return []
    }

    const indexFile = await indexRef.read()

    // relation() と同様に index スキーマから型を判定する。
    // md 自身のスキーマを見ると未定義キーで throw しうるため避ける
    const indexSchema = indexFile.content.meta().schema()
    const fieldValue = indexSchema.value[String(key)]

    if (!fieldValue || fieldValue.type !== "multi-relation") {
      return []
    }

    const indexSchemaField = indexSchema.multiRelation(key)
    const resolvedPath = this.resolveRelationDirectory(indexSchemaField.path)

    return fileNames.map((fileName: string) => {
      const fullPath = this.pathSystem.join(resolvedPath, `${fileName}.md`)
      return new DocFileMdReference<DocCustomSchema>({
        path: fullPath,
        fileSystem: this.fileSystem,
        pathSystem: this.pathSystem,
        customSchema: customSchema ?? {},
        config: this.props.config,
      })
    })
  }

  async readFrontMatter(): Promise<DocFileMdMetaValue<T>> {
    const entity = await this.read()
    return entity.content().meta()
  }

  async updateFrontMatter<K extends keyof T>(
    key: K,
    value: BaseFieldValueType<ExtractFieldType<T[K]>>,
  ): Promise<this> {
    const entity = await this.read()

    const frontMatter = entity.content().meta()

    const draftFrontMatter = frontMatter.withProperty(key, value)

    const draftContent = entity.content().withMeta(draftFrontMatter)

    const draftEntity = entity.withContent(draftContent)

    await this.write(draftEntity)

    return this
  }
}
