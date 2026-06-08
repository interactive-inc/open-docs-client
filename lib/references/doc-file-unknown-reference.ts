import { createSafeProxy, type Safe } from "../create-safe-proxy"
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

  async read(): Promise<DocFileUnknownEntity> {
    if (this.path.endsWith(".md")) {
      throw new Error("Use DocFileMdReference to read Markdown files.")
    }

    const content = await this.fileSystem.readFile(this.path)

    if (content instanceof Error) {
      throw content
    }

    if (content === null) {
      throw new Error(`File not found at ${this.path}.`)
    }

    const isInArchiveDir = this.path.includes("/_/") || this.path.startsWith("_/")

    const pathValue = DocFilePathValue.fromPathWithSystem(this.path, this.pathSystem, this.basePath)

    const extension = this.pathSystem.extname(this.path).substring(1)

    return new DocFileUnknownEntity({
      type: "unknown",
      path: pathValue.value,
      content: content,
      extension: extension,
      isArchived: isInArchiveDir,
    })
  }

  async readContent(): Promise<string> {
    const entity = await this.read()
    return entity.value.content
  }

  /**
   * Create empty DocFileUnknownEntity
   */
  empty(): DocFileUnknownEntity {
    const pathValue = DocFilePathValue.fromPathWithSystem(this.path, this.pathSystem, this.basePath)
    const extension = this.pathSystem.extname(this.path).substring(1)

    return new DocFileUnknownEntity({
      type: "unknown",
      path: pathValue.value,
      content: "",
      extension: extension || "txt",
      isArchived: false,
    })
  }

  async writeContent(content: string): Promise<void> {
    const writeResult = await this.fileSystem.writeFile(this.path, content)

    if (writeResult instanceof Error) {
      throw writeResult
    }
  }

  async write(entity: DocFileUnknownEntity): Promise<void> {
    const writeResult = await this.fileSystem.writeFile(this.path, entity.value.content)

    if (writeResult instanceof Error) {
      throw writeResult
    }
  }

  async writeRaw(content: string): Promise<void> {
    const writeResult = await this.fileSystem.writeFile(this.path, content)

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

  async exists(): Promise<boolean> {
    return this.fileSystem.exists(this.path)
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

  async archive(
    archiveDirectoryName = this.props.config.archiveDirectoryName,
  ): Promise<DocFileUnknownReference<T>> {
    const dirPath = this.pathSystem.dirname(this.path)
    const fileName = this.pathSystem.basename(this.path)
    const archivePath = this.pathSystem.join(dirPath, archiveDirectoryName, fileName)

    await this.moveTo(archivePath)

    return new DocFileUnknownReference({
      path: archivePath,
      fileSystem: this.fileSystem,
      pathSystem: this.pathSystem,
      config: this.props.config,
      customSchema: this.customSchema,
    })
  }

  async restore(
    archiveDirectoryName = this.props.config.archiveDirectoryName,
  ): Promise<DocFileUnknownReference<T>> {
    const dirPath = this.pathSystem.dirname(this.path)
    const parentDirName = this.pathSystem.basename(dirPath)

    if (parentDirName !== archiveDirectoryName) {
      throw new Error(`File is not in archive directory: ${this.path}`)
    }

    const fileName = this.pathSystem.basename(this.path)
    const restorePath = this.pathSystem.join(this.pathSystem.dirname(dirPath), fileName)

    await this.moveTo(restorePath)

    return new DocFileUnknownReference({
      path: restorePath,
      fileSystem: this.fileSystem,
      pathSystem: this.pathSystem,
      config: this.props.config,
      customSchema: this.customSchema,
    })
  }
}
