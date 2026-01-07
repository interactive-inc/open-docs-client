import { zDocClientConfig } from "./models"
import type { DocFileSystemInterface } from "./modules/file-system/doc-file-system.interface"
import { DocFileTreeSystem } from "./modules/file-tree-system/doc-file-tree-system"
import { DocMarkdownSystem } from "./modules/markdown-system/doc-markdown-system"
import { DocPathSystem } from "./modules/path-system/doc-path-system"
import { DocDirectoryReference } from "./references/doc-directory-reference"
import { DocFileIndexReference } from "./references/doc-file-index-reference"
import { DocFileMdReference } from "./references/doc-file-md-reference"
import { DocFileUnknownReference } from "./references/doc-file-unknown-reference"
import type {
  DocClientConfig,
  DocCustomSchema,
  DocTreeDirectoryNode,
  DocTreeNode,
  InferReference,
} from "./types"

type Props = {
  fileSystem: DocFileSystemInterface
  pathSystem?: DocPathSystem
  markdownSystem?: DocMarkdownSystem
  fileTreeSystem?: DocFileTreeSystem
  /**
   * Configuration
   */
  config?: DocClientConfig
}

export class DocClient {
  readonly fileSystem: DocFileSystemInterface
  readonly pathSystem: DocPathSystem
  readonly markdownSystem: DocMarkdownSystem
  readonly fileTreeSystem: DocFileTreeSystem
  readonly config: DocClientConfig

  constructor(props: Props) {
    this.fileSystem = props.fileSystem
    this.pathSystem = props.pathSystem ?? new DocPathSystem()
    this.markdownSystem = props.markdownSystem ?? new DocMarkdownSystem()

    // Apply defaults to config
    const defaultConfig: DocClientConfig = {
      defaultIndexIcon: "📃",
      indexFileName: "index.md",
      archiveDirectoryName: "_",
      defaultDirectoryName: "Directory",
      indexMetaIncludes: [],
      directoryExcludes: [".vitepress"],
      metaFileName: ".meta.json",
    }

    this.config = props.config
      ? zDocClientConfig.parse(props.config)
      : defaultConfig

    const fileTreeSystem = new DocFileTreeSystem({
      fileSystem: this.fileSystem,
      pathSystem: this.pathSystem,
      indexFileName: this.config.indexFileName,
      archiveDirectoryName: this.config.archiveDirectoryName,
      config: this.config,
    })

    this.fileTreeSystem = props.fileTreeSystem ?? fileTreeSystem
  }

  basePath(): string {
    return this.fileSystem.getBasePath()
  }

  file<Path extends string>(
    relativePath: Path,
  ): InferReference<Path, DocCustomSchema>

  file<Path extends string, T extends DocCustomSchema>(
    relativePath: Path,
    customSchema: T,
  ): InferReference<Path, T>

  /**
   * Get file reference
   */
  file<Path extends string, T extends DocCustomSchema>(
    relativePath: Path,
    customSchema?: T,
  ) {
    // Check if it's index.md
    const fileName = this.pathSystem.basename(relativePath)
    if (fileName === this.config.indexFileName) {
      const dirPath = this.pathSystem.dirname(relativePath)
      return this.indexFile(dirPath === "." ? "" : dirPath, customSchema as T)
    }

    // Check if it's a markdown file
    if (relativePath.endsWith(".md")) {
      if (customSchema === undefined) {
        return this.mdFile(relativePath)
      }
      return this.mdFile<T>(relativePath, customSchema)
    }

    // Unknown file type
    return new DocFileUnknownReference({
      path: relativePath,
      fileSystem: this.fileSystem,
      pathSystem: this.pathSystem,
      config: this.config,
      customSchema: {},
    })
  }

  mdFile(relativePath: string): DocFileMdReference<DocCustomSchema>

  mdFile<T extends DocCustomSchema>(
    relativePath: string,
    customSchema: T,
  ): DocFileMdReference<T>

  /**
   * Markdown file reference
   */
  mdFile<T extends DocCustomSchema>(relativePath: string, customSchema?: T) {
    const normalizedPath = relativePath.endsWith(".md")
      ? relativePath
      : `${relativePath}.md`

    if (customSchema === undefined) {
      return new DocFileMdReference<DocCustomSchema>({
        path: normalizedPath,
        fileSystem: this.fileSystem,
        pathSystem: this.pathSystem,
        customSchema: {},
        config: this.config,
      })
    }

    return new DocFileMdReference({
      path: normalizedPath,
      fileSystem: this.fileSystem,
      pathSystem: this.pathSystem,
      customSchema: customSchema,
      config: this.config,
    })
  }

  indexFile(relativePath: string): DocFileIndexReference<DocCustomSchema>

  indexFile<T extends DocCustomSchema>(
    relativePath: string,
    customSchema: T,
  ): DocFileIndexReference<T>

  /**
   * Index file reference
   */
  indexFile<T extends DocCustomSchema>(relativePath: string, customSchema?: T) {
    const indexPath =
      relativePath === ""
        ? this.config.indexFileName
        : `${relativePath}/${this.config.indexFileName}`

    if (customSchema === undefined) {
      return new DocFileIndexReference<DocCustomSchema>({
        path: indexPath,
        fileSystem: this.fileSystem,
        pathSystem: this.pathSystem,
        customSchema: {},
        config: this.config,
      })
    }

    return new DocFileIndexReference<T>({
      path: indexPath,
      fileSystem: this.fileSystem,
      pathSystem: this.pathSystem,
      customSchema: customSchema,
      config: this.config,
    })
  }

  directory(relativePath: string): DocDirectoryReference<DocCustomSchema>

  directory<T extends DocCustomSchema>(
    relativePath: string,
    customSchema: T,
  ): DocDirectoryReference<T>

  /**
   * Directory reference
   */
  directory<T extends DocCustomSchema>(relativePath: string, customSchema?: T) {
    if (customSchema === undefined) {
      return new DocDirectoryReference<DocCustomSchema>({
        customSchema: {},
        path: relativePath,
        indexFileName: this.config.indexFileName,
        archiveDirectoryName: this.config.archiveDirectoryName,
        fileSystem: this.fileSystem,
        pathSystem: this.pathSystem,
        config: this.config,
      })
    }

    return new DocDirectoryReference<T>({
      customSchema: customSchema,
      path: relativePath,
      indexFileName: this.config.indexFileName,
      archiveDirectoryName: this.config.archiveDirectoryName,
      fileSystem: this.fileSystem,
      pathSystem: this.pathSystem,
      config: this.config,
    })
  }

  async fileTree(directoryPath = ""): Promise<DocTreeNode[]> {
    const results = await this.fileTreeSystem.buildFileTree(directoryPath)
    if (results instanceof Error) {
      throw results
    }
    return results.map((node) => node.toJson())
  }

  async directoryTree(directoryPath = ""): Promise<DocTreeDirectoryNode[]> {
    const results = await this.fileTreeSystem.buildDirectoryTree(directoryPath)
    if (results instanceof Error) {
      throw results
    }
    return results.map((node) => node.toJson())
  }
}
