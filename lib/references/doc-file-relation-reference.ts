import { createSafeProxy, type Safe } from "../create-safe-proxy"
import { DocFileMdEntity } from "../entities/doc-file-md-entity"
import type { DocFileSystemInterface } from "../modules/file-system/doc-file-system.interface"
import type { DocPathSystem } from "../modules/path-system/doc-path-system"
import type { DocRelation } from "../types"
import { DocFileMdContentValue } from "../values/doc-file-md-content-value"
import { DocFilePathValue } from "../values/doc-file-path-value"
import { DocRelationFileValue } from "../values/doc-relation-file-value"
import { DocRelationValue } from "../values/doc-relation-value"

type Props = {
  filePath: string
  fileSystem: DocFileSystemInterface
  pathSystem: DocPathSystem
}

/**
 * Relation file reference
 */
export class DocFileRelationReference {
  private readonly pathSystem: DocPathSystem

  constructor(private readonly props: Props) {
    this.pathSystem = props.pathSystem
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
    return this.props.filePath
  }

  get fullPath(): string {
    return this.pathSystem.join(this.fileSystem.getBasePath(), this.props.filePath)
  }

  async read(): Promise<DocRelationValue | null> {
    const files = await this.readFiles()

    return new DocRelationValue({
      path: this.path,
      files: files.map((value) => value.toJson()),
    } satisfies DocRelation)
  }

  async readFiles(): Promise<DocRelationFileValue[]> {
    const exists = await this.fileSystem.exists(this.path)

    if (!exists) {
      return []
    }

    const filePaths = await this.fileSystem.readDirectoryFilePaths(this.path)

    if (filePaths instanceof Error) {
      throw filePaths
    }

    const files: DocRelationFileValue[] = []

    for (const filePath of filePaths) {
      const file = await this.readFile(filePath)
      if (file === null) {
        continue
      }
      files.push(file)
    }

    return files
  }

  async readFile(filePath: string): Promise<DocRelationFileValue | null> {
    if (filePath.includes("index.md")) {
      return null
    }

    if (!filePath.endsWith(".md")) {
      return null
    }

    const content = await this.fileSystem.readFile(filePath)

    if (content instanceof Error) {
      throw content
    }

    if (content === null) {
      return null
    }

    const contentValue = DocFileMdContentValue.fromMarkdown(content, {})

    const pathValue = DocFilePathValue.fromPathWithSystem(filePath, this.pathSystem, this.basePath)

    const fileEntity = new DocFileMdEntity(
      {
        type: "markdown",
        content: contentValue.value,
        path: pathValue.value,
        isArchived: false,
      },
      {},
    )

    return DocRelationFileValue.from(filePath, fileEntity.value.content.title)
  }

  async exists(slug: string): Promise<boolean> {
    const filePath = `${this.path}/${slug}.md`
    return this.fileSystem.exists(filePath)
  }

  async readSlugs(): Promise<string[]> {
    const files = await this.readFiles()
    return files.map((file) => file.id)
  }

  async count(): Promise<number> {
    const files = await this.readFiles()
    return files.length
  }

  async isEmpty(): Promise<boolean> {
    const fileCount = await this.count()
    return fileCount === 0
  }
}
