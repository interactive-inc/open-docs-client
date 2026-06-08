import { createSafeProxy, type Safe } from "../create-safe-proxy"
import { zDocDirectoryMeta } from "../models"
import { DocFileIndexEntity } from "../entities/doc-file-index-entity"
import type { DocFileSystemInterface } from "../modules/file-system/doc-file-system.interface"
import type { DocPathSystem } from "../modules/path-system/doc-path-system"
import type {
  DocClientConfig,
  DocCustomSchema,
  DocDirectoryMeta,
  DocFileIndexSchema,
  RecordKey,
} from "../types"
import { DocFileIndexContentValue } from "../values/doc-file-index-content-value"
import { DocFilePathValue } from "../values/doc-file-path-value"
import type { DocRelationValue } from "../values/doc-relation-value"
import { DocFileRelationReference } from "./doc-file-relation-reference"

type Props<T extends DocCustomSchema> = {
  customSchema: T
  path: string
  fileSystem: DocFileSystemInterface
  pathSystem: DocPathSystem
  config: DocClientConfig
}

/**
 * File reference class
 */
export class DocFileIndexReference<T extends DocCustomSchema> {
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

  get filePath(): string {
    return this.props.path
  }

  get fileFullPath(): string {
    return this.pathSystem.join(this.basePath, this.filePath)
  }

  get directoryPath(): string {
    return this.pathSystem.dirname(this.filePath)
  }

  async read(): Promise<DocFileIndexEntity<T>> {
    const directoryMeta = await this.readDirectoryMeta()

    const content = await this.fileSystem.readFile(this.filePath)

    if (content instanceof Error) {
      throw content
    }

    if (content === null) {
      const dirPath = this.pathSystem.dirname(this.filePath)
      const dirName = this.pathSystem.basename(dirPath)
      const pathValue = DocFilePathValue.fromPathWithSystem(
        this.filePath,
        this.pathSystem,
        this.fileSystem.getBasePath(),
      )

      const contentValue = directoryMeta
        ? DocFileIndexContentValue.emptyWithDirectoryMeta(
            dirName,
            this.customSchema,
            this.props.config,
            directoryMeta,
          )
        : DocFileIndexContentValue.empty(dirName, this.customSchema, this.props.config)

      return new DocFileIndexEntity(
        {
          type: "index",
          path: pathValue.toJson(),
          content: contentValue.toJson(),
          isArchived: false,
        },
        this.customSchema,
      )
    }

    const pathValue = DocFilePathValue.fromPathWithSystem(
      this.filePath,
      this.pathSystem,
      this.fileSystem.getBasePath(),
    )

    const contentValue = directoryMeta
      ? DocFileIndexContentValue.fromMarkdownWithDirectoryMeta(
          content,
          this.customSchema,
          this.props.config,
          directoryMeta,
        )
      : DocFileIndexContentValue.fromMarkdown(content, this.customSchema, this.props.config)

    return new DocFileIndexEntity(
      {
        type: "index",
        path: pathValue.toJson(),
        content: contentValue.toJson(),
        isArchived: false,
      },
      this.customSchema,
    )
  }

  private async readDirectoryMeta(): Promise<DocDirectoryMeta | null> {
    const metaFileName = this.props.config.metaFileName ?? ".meta.json"
    const metaPath = this.pathSystem.join(this.directoryPath, metaFileName)

    const metaContent = await this.fileSystem.readFile(metaPath)

    if (metaContent instanceof Error) {
      return null
    }

    if (metaContent === null || metaContent === "") {
      return null
    }

    let parsed: unknown

    try {
      parsed = JSON.parse(metaContent)
    } catch {
      return null
    }

    const parseResult = zDocDirectoryMeta.safeParse(parsed)

    if (parseResult.success === false) {
      return null
    }

    return parseResult.data
  }

  async readSchemaValue(): Promise<DocFileIndexSchema<RecordKey>> {
    try {
      const indexFile = await this.read()
      return indexFile.content.meta().schema().value
    } catch {
      return {}
    }
  }

  async readContent(): Promise<string> {
    const entity = await this.read()
    return entity.value.content.body
  }

  /**
   * Create empty DocFileIndexEntity
   */
  empty(): DocFileIndexEntity<T> {
    const dirPath = this.pathSystem.dirname(this.filePath)

    const dirName = this.pathSystem.basename(dirPath) || "/"

    const pathValue = DocFilePathValue.fromPathWithSystem(
      this.filePath,
      this.pathSystem,
      this.basePath,
    )

    const contentValue = DocFileIndexContentValue.empty(
      dirName,
      this.customSchema,
      this.props.config,
    )

    return new DocFileIndexEntity<T>(
      {
        type: "index",
        path: pathValue.toJson(),
        content: contentValue.toJson(),
        isArchived: false,
      },
      this.customSchema,
    )
  }

  async writeContent(content: string): Promise<void> {
    const writeResult = await this.fileSystem.writeFile(this.filePath, content)

    if (writeResult instanceof Error) {
      throw writeResult
    }
  }

  async write(entity: DocFileIndexEntity<T>): Promise<void> {
    const content = entity.content.toText()
    const writeResult = await this.fileSystem.writeFile(this.filePath, content)

    if (writeResult instanceof Error) {
      throw writeResult
    }
  }

  async writeDefault(): Promise<void> {
    const dirPath = this.pathSystem.dirname(this.filePath)

    const dirName = this.pathSystem.basename(dirPath) || this.props.config.defaultDirectoryName

    const defaultContent = [
      `# ${dirName}`,
      "",
      `Please describe the overview of ${dirName} here.`,
    ].join("\n")

    const writeResult = await this.fileSystem.writeFile(this.filePath, defaultContent)

    if (writeResult instanceof Error) {
      throw writeResult
    }
  }

  async delete(): Promise<void> {
    const deleteResult = await this.fileSystem.deleteFile(this.filePath)

    if (deleteResult instanceof Error) {
      throw deleteResult
    }
  }

  async exists(): Promise<boolean> {
    return this.fileSystem.exists(this.filePath)
  }

  async relations(): Promise<DocFileRelationReference[]> {
    const indexFile = await this.read()

    const schema = indexFile.content.meta().schema()

    if (!schema) {
      return []
    }

    const refs: DocFileRelationReference[] = []

    const fieldKeys = Object.keys(schema.value) as Array<keyof T>

    for (const key of fieldKeys) {
      const fieldValue = schema.value[key]
      if (fieldValue === undefined) continue

      let path: string | null = null

      if (fieldValue.type === "relation") {
        path = schema.relation(key).path
      }

      if (fieldValue.type === "multi-relation") {
        path = schema.multiRelation(key).path
      }

      if (path === null) continue

      const fileRef = new DocFileRelationReference({
        filePath: path,
        fileSystem: this.fileSystem,
        pathSystem: this.pathSystem,
      })

      refs.push(fileRef)
    }

    return refs
  }

  async readRelations(): Promise<DocRelationValue[]> {
    const relations = await this.relations()

    const files: DocRelationValue[] = []

    for (const relation of relations) {
      try {
        const entity = await relation.read()
        if (entity === null) continue
        files.push(entity)
      } catch {
        continue
      }
    }

    return files
  }

  async size(): Promise<number> {
    const fileSize = await this.fileSystem.getFileSize(this.filePath)

    if (fileSize instanceof Error) {
      throw fileSize
    }

    return fileSize
  }

  async lastModified(): Promise<Date> {
    const updatedTime = await this.fileSystem.getFileUpdatedTime(this.filePath)

    if (updatedTime instanceof Error) {
      throw updatedTime
    }

    return updatedTime
  }

  async createdAt(): Promise<Date> {
    const createdTime = await this.fileSystem.getFileCreatedTime(this.filePath)

    if (createdTime instanceof Error) {
      throw createdTime
    }

    return createdTime
  }

  async archive(
    archiveDirectoryName = this.props.config.archiveDirectoryName,
  ): Promise<DocFileIndexReference<T>> {
    const dirPath = this.pathSystem.dirname(this.filePath)

    const fileName = this.pathSystem.basename(this.filePath)

    const archivePath = this.pathSystem.join(dirPath, archiveDirectoryName, fileName)

    const moveResult = await this.fileSystem.moveFile(this.filePath, archivePath)

    if (moveResult instanceof Error) {
      throw moveResult
    }

    return new DocFileIndexReference<T>({
      path: archivePath,
      fileSystem: this.fileSystem,
      pathSystem: this.pathSystem,
      customSchema: this.customSchema,
      config: this.props.config,
    })
  }

  async restore(
    archiveDirectoryName = this.props.config.archiveDirectoryName,
  ): Promise<DocFileIndexReference<T>> {
    const dirPath = this.pathSystem.dirname(this.filePath)

    const parentDirName = this.pathSystem.basename(dirPath)

    if (parentDirName !== archiveDirectoryName) {
      throw new Error(`File is not in archive directory: ${this.filePath}`)
    }

    const fileName = this.pathSystem.basename(this.filePath)

    const restorePath = this.pathSystem.join(this.pathSystem.dirname(dirPath), fileName)

    const moveResult = await this.fileSystem.moveFile(this.filePath, restorePath)

    if (moveResult instanceof Error) {
      throw moveResult
    }

    return new DocFileIndexReference<T>({
      path: restorePath,
      fileSystem: this.fileSystem,
      pathSystem: this.pathSystem,
      customSchema: this.customSchema,
      config: this.props.config,
    })
  }
}
