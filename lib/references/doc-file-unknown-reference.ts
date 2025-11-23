import { DocFileUnknownEntity } from "../entities/doc-file-unknown-entity"
import type { DocFileSystemInterface } from "../modules/file-system/doc-file-system.interface"
import type { DocPathSystem } from "../modules/path-system/doc-path-system"
import type { DocClientConfig, DocCustomSchema } from "../types"
import { DocFilePathValue } from "../values/doc-file-path-value"
import { DocDirectoryReference } from "./doc-directory-reference"

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
export class DocFileUnknownReference<T extends DocCustomSchema> {
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

  get directoryPath(): string {
    return this.pathSystem.dirname(this.path)
  }

  get fileFullPath(): string {
    return this.pathSystem.join(this.basePath, this.path)
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

    // 通常のファイルの場合は、同じディレクトリを返す
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

  async read(): Promise<Error | DocFileUnknownEntity> {
    const content = await this.fileSystem.readFile(this.path)

    if (content instanceof Error) {
      return content
    }

    if (content === null) {
      return new Error(`File not found at ${this.path}.`)
    }

    const isInArchiveDir =
      this.path.includes("/_/") || this.path.startsWith("_/")

    if (this.path.endsWith(".md")) {
      throw new Error("Use DocFileMdReference to read Markdown files.")
    }

    const pathValue = DocFilePathValue.fromPathWithSystem(
      this.path,
      this.pathSystem,
      this.basePath,
    )

    const extension = this.pathSystem.extname(this.path).substring(1) // Remove dot

    return new DocFileUnknownEntity({
      type: "unknown",
      path: pathValue.value,
      content: content,
      extension: extension,
      isArchived: isInArchiveDir,
    })
  }

  /**
   * Read file content
   */
  async readContent(): Promise<Error | string> {
    const entity = await this.read()
    if (entity instanceof Error) {
      return entity
    }
    return entity.value.content
  }

  /**
   * Create empty DocFileUnknownEntity
   */
  empty(): DocFileUnknownEntity {
    const pathValue = DocFilePathValue.fromPathWithSystem(
      this.path,
      this.pathSystem,
      this.basePath,
    )
    const extension = this.pathSystem.extname(this.path).substring(1) // Remove dot

    return new DocFileUnknownEntity({
      type: "unknown",
      path: pathValue.value,
      content: "",
      extension: extension || "txt",
      isArchived: false,
    })
  }

  /**
   * Write content to file
   */
  async writeContent(content: string): Promise<Error | null> {
    return await this.fileSystem.writeFile(this.path, content)
  }

  /**
   * Write entity
   */
  async write(entity: DocFileUnknownEntity): Promise<Error | null> {
    return await this.fileSystem.writeFile(this.path, entity.value.content)
  }

  /**
   * Write raw content
   */
  async writeRaw(content: string): Promise<Error | null> {
    return await this.fileSystem.writeFile(this.path, content)
  }

  /**
   * Delete file
   */
  async delete(): Promise<Error | null> {
    return await this.fileSystem.deleteFile(this.path)
  }

  /**
   * Check if file exists
   */
  async exists(): Promise<boolean> {
    return this.fileSystem.exists(this.path)
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

  /**
   * Move file to archive and return new reference
   */
  async archive(
    archiveDirectoryName = this.props.config.archiveDirectoryName,
  ): Promise<DocFileUnknownReference<T>> {
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

    return new DocFileUnknownReference({
      path: archivePath,
      fileSystem: this.fileSystem,
      pathSystem: this.pathSystem,
      config: this.props.config,
      customSchema: this.customSchema,
    })
  }

  /**
   * Restore file from archive and return new reference
   */
  async restore(
    archiveDirectoryName = this.props.config.archiveDirectoryName,
  ): Promise<DocFileUnknownReference<T>> {
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

    // Move file
    const moveResult = await this.moveTo(restorePath)
    if (moveResult instanceof Error) {
      throw moveResult
    }

    return new DocFileUnknownReference({
      path: restorePath,
      fileSystem: this.fileSystem,
      pathSystem: this.pathSystem,
      config: this.props.config,
      customSchema: this.customSchema,
    })
  }
}
