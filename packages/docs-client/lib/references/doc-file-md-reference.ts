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

  async read(): Promise<DocFileMdEntity<T> | Error> {
    const content = await this.fileSystem.readFile(this.path)

    if (content instanceof Error) {
      return content
    }

    const actualPath = this.path

    if (content === null) {
      const archivedContent = await this.fileSystem.readFile(this.archivedPath)

      if (archivedContent instanceof Error) {
        return archivedContent
      }

      if (archivedContent !== null) {
        const contentValue = DocFileMdContentValue.fromMarkdown(
          archivedContent,
          this.customSchema,
        )
        const pathValue = DocFilePathValue.fromPathWithSystem(
          actualPath,
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
      return new Error(`File not found at ${this.path} or in archive.`)
    }

    const contentValue = DocFileMdContentValue.fromMarkdown(
      content,
      this.customSchema,
    )

    const pathValue = DocFilePathValue.fromPathWithSystem(
      actualPath,
      this.pathSystem,
      this.basePath,
    )

    const isInArchiveDir =
      this.path.includes("/_/") || this.path.startsWith("_/")

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

  /**
   * Read file content
   */
  async readText(): Promise<Error | string> {
    const entity = await this.read()
    if (entity instanceof Error) {
      return entity
    }
    return entity.value.content.body
  }

  /**
   * Create empty DocFileMdEntity
   */
  empty(): DocFileMdEntity<T> {
    const contentValue = DocFileMdContentValue.empty("", this.customSchema)

    const pathValue = DocFilePathValue.fromPathWithSystem(
      this.path,
      this.pathSystem,
      this.basePath,
    )

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

  /**
   * Write entity
   */
  async write(entity: DocFileMdEntity<T>): Promise<Error | null> {
    const content = entity.content().toText()
    const writeResult = await this.fileSystem.writeFile(this.path, content)

    if (writeResult instanceof Error) {
      return writeResult
    }

    return null
  }

  async writeText(text: string): Promise<Error | null> {
    return await this.fileSystem.writeFile(this.path, text)
  }

  /**
   * Create new file with default content
   */
  async writeDefault(): Promise<Error | null> {
    const fileName = this.pathSystem.basename(this.path, ".md")
    const defaultContent = [
      `# ${fileName}`,
      "",
      "Write your content here.",
    ].join("\n")
    return await this.fileSystem.writeFile(this.path, defaultContent)
  }

  /**
   * Delete file
   */
  async delete(): Promise<Error | null> {
    return await this.fileSystem.deleteFile(this.path)
  }

  /**
   * Copy file
   */
  async copyTo(destinationPath: string): Promise<Error | null> {
    return await this.fileSystem.copyFile(this.path, destinationPath)
  }

  /**
   * Move file
   */
  async moveTo(destinationPath: string): Promise<Error | null> {
    return await this.fileSystem.moveFile(this.path, destinationPath)
  }

  /**
   * Move file to archive and return new reference
   */
  async archive(
    archiveDirectoryName = this.props.config.archiveDirectoryName,
  ): Promise<DocFileMdReference<T>> {
    const dirPath = this.pathSystem.dirname(this.path)

    const fileName = this.pathSystem.basename(this.path)

    const archivePath = this.pathSystem.join(
      dirPath,
      archiveDirectoryName,
      fileName,
    )

    const moveResult = await this.moveTo(archivePath)
    if (moveResult instanceof Error) {
      throw moveResult
    }

    return new DocFileMdReference({
      path: archivePath,
      fileSystem: this.fileSystem,
      pathSystem: this.pathSystem,
      customSchema: this.customSchema,
      config: this.props.config,
    })
  }

  /**
   * Restore file from archive and return new reference
   */
  async restore(
    archiveDirectoryName = this.props.config.archiveDirectoryName,
  ): Promise<DocFileMdReference<T>> {
    const dirPath = this.pathSystem.dirname(this.path)

    const parentDirName = this.pathSystem.basename(dirPath)

    if (parentDirName !== archiveDirectoryName) {
      throw new Error(`File is not in archive directory: ${this.path}`)
    }

    const fileName = this.pathSystem.basename(this.path)

    const restorePath = this.pathSystem.join(
      this.pathSystem.dirname(dirPath),
      fileName,
    )

    const moveResult = await this.moveTo(restorePath)
    if (moveResult instanceof Error) {
      throw moveResult
    }

    return new DocFileMdReference({
      path: restorePath,
      fileSystem: this.fileSystem,
      pathSystem: this.pathSystem,
      customSchema: this.customSchema,
      config: this.props.config,
    })
  }

  /**
   * Get file size in bytes
   */
  async size(): Promise<number | Error> {
    return this.fileSystem.getFileSize(this.path)
  }

  /**
   * Get file last modified time
   */
  async lastModified(): Promise<Date | Error> {
    return this.fileSystem.getFileUpdatedTime(this.path)
  }

  /**
   * Get file creation time
   */
  async createdAt(): Promise<Date | Error> {
    return this.fileSystem.getFileCreatedTime(this.path)
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

  /**
   * Get relation based on schema
   */
  async relation<U extends DocCustomSchema = DocCustomSchema>(
    key: RelationKeys<T>,
    targetSchema?: U,
  ): Promise<DocFileMdReference<U> | Error | null> {
    const file = await this.read()
    if (file instanceof Error) {
      return file
    }

    const relationValue = file
      .content()
      .meta()
      .field(key as string)

    if (relationValue === null) {
      return null
    }

    const indexRef = await this.directoryIndex()

    if (!indexRef) {
      return null
    }

    const indexFile = await indexRef.read()

    if (indexFile instanceof Error) {
      return null
    }

    const schemaValue = indexFile.content.meta().schema()

    const fieldValue =
      schemaValue.value[key as string as keyof typeof schemaValue.value]
    if (!fieldValue || fieldValue.type !== "relation") {
      return null
    }

    const schemaField = schemaValue.field(
      key as string as keyof typeof schemaValue.customSchema,
    )
    const relationField = schemaField as unknown as { path: string }
    let resolvedPath = relationField.path

    if (relationField.path.startsWith("..")) {
      resolvedPath = this.pathSystem.join(
        this.directoryPath,
        relationField.path,
      )
      resolvedPath = this.pathSystem.normalize(resolvedPath)
    }

    const fullPath = this.pathSystem.join(resolvedPath, `${relationValue}.md`)

    return new DocFileMdReference<U>({
      path: fullPath,
      fileSystem: this.fileSystem,
      pathSystem: this.pathSystem,
      customSchema: targetSchema || ({} as U),
      config: this.props.config,
    })
  }

  /**
   * Get index.md in the same directory
   */
  async directoryIndex(): Promise<DocFileIndexReference<T> | null> {
    const indexPath = this.pathSystem.join(this.directoryPath, "index.md")

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

    const archivedIndexPath = this.pathSystem.join(
      this.directoryPath,
      "_",
      "index.md",
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

  /**
   * Get multiple relations based on schema
   */
  async relations<U extends DocCustomSchema = DocCustomSchema>(
    key: MultiRelationKeys<T>,
    customSchema?: U,
  ): Promise<DocFileMdReference<U>[]> {
    const file = await this.read()

    if (file instanceof Error) {
      return []
    }

    const meta = file.content().meta()

    const schemaField = meta.schemaField(key)

    if (schemaField.type !== "multi-relation") {
      return []
    }

    const fileNames = meta.multiRelation(key)

    if (fileNames === null) {
      return []
    }

    const indexRef = await this.directoryIndex()

    if (indexRef === null) {
      return []
    }

    const indexFile = await indexRef.read()

    if (indexFile instanceof Error) {
      return []
    }

    const indexSchema = indexFile.content.meta().schema()

    const indexSchemaField = indexSchema.multiRelation(key)

    return fileNames.map((fileName: string) => {
      const resolvedPath = indexSchemaField.path
      const fullPath = this.pathSystem.join(resolvedPath, `${fileName}.md`)
      return new DocFileMdReference<U>({
        path: fullPath,
        fileSystem: this.fileSystem,
        pathSystem: this.pathSystem,
        customSchema: customSchema || ({} as U),
        config: this.props.config,
      })
    })
  }

  /**
   * File: Markdown > FrontMatter
   */
  async readFrontMatter(): Promise<DocFileMdMetaValue<T> | Error> {
    const entity = await this.read()

    if (entity instanceof Error) {
      return entity
    }

    return entity.content().meta()
  }

  /**
   * File: Markdown > FrontMatter
   */
  async updateFrontMatter<K extends keyof T>(
    key: K,
    value: BaseFieldValueType<ExtractFieldType<T[K]>>,
  ): Promise<this | Error> {
    const entity = await this.read()

    if (entity instanceof Error) {
      return entity
    }

    const frontMatter = entity.content().meta()

    const draftFrontMatter = frontMatter.withProperty(key, value)

    const draftContent = entity.content().withMeta(draftFrontMatter)

    const draftEntity = entity.withContent(draftContent)

    await this.write(draftEntity)

    return this
  }
}
