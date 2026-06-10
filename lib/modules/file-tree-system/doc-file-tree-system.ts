import { DocFileIndexReference } from "../../references/doc-file-index-reference"
import { DocFileMdReference } from "../../references/doc-file-md-reference"
import type { DocClientConfig, DocCustomSchema } from "../../types"
import { DocTreeDirectoryNodeValue } from "../../values/doc-tree-directory-node-value"
import { DocTreeFileNodeValue } from "../../values/doc-tree-file-node-value"
import type { DocTreeNodeValue } from "../../values/doc-tree-node-value"
import type { DocFileSystemInterface } from "../file-system/doc-file-system.interface"
import type { DocPathSystem } from "../path-system/doc-path-system"

type Props = {
  fileSystem: DocFileSystemInterface
  pathSystem: DocPathSystem
  indexFileName: string
  archiveDirectoryName: string
  config: DocClientConfig
}

/**
 * File tree building system
 */
export class DocFileTreeSystem {
  private readonly config: DocClientConfig

  constructor(private readonly props: Props) {
    this.config = props.config
    Object.freeze(this)
  }

  /**
   * Build file tree recursively
   */
  async buildFileTree(directoryPath = ""): Promise<DocTreeNodeValue[] | Error> {
    const fileNames = await this.props.fileSystem.readDirectoryFileNames(directoryPath)

    if (fileNames instanceof Error) {
      return fileNames
    }

    const results: DocTreeNodeValue[] = []

    for (const fileName of fileNames) {
      if (fileName === this.props.archiveDirectoryName) continue

      // Skip directories in exclusion list
      if (this.config.directoryExcludes.includes(fileName)) continue

      // Skip .meta.json file
      const metaFileName = this.config.metaFileName ?? ".meta.json"
      if (fileName === metaFileName) continue

      const filePath = directoryPath
        ? this.props.pathSystem.join(directoryPath, fileName)
        : fileName

      const isDirectory = await this.props.fileSystem.isDirectory(filePath)

      if (!isDirectory) {
        const fileNode = await this.createFileNode(fileName, filePath)
        if (fileNode instanceof Error) {
          return fileNode
        }
        results.push(fileNode)
        continue
      }

      const directoryNode = await this.createDirectoryNode(fileName, filePath, false)
      if (directoryNode instanceof Error) {
        return directoryNode
      }
      results.push(directoryNode)
    }

    return results
  }

  /**
   * Create file node
   */
  private async createFileNode(
    fileName: string,
    filePath: string,
  ): Promise<DocTreeFileNodeValue | Error> {
    const title = await this.readFileTitle(fileName, filePath)

    return DocTreeFileNodeValue.from({
      name: fileName,
      path: filePath,
      icon: "📄",
      title,
    })
  }

  /**
   * Read title from a file
   */
  private async readFileTitle(fileName: string, filePath: string): Promise<string> {
    if (!fileName.endsWith(".md")) {
      return fileName
    }

    const mdFile = this.createMdFileReference(filePath)

    if (!(await mdFile.exists())) {
      return fileName
    }

    try {
      const entity = await mdFile.read()
      return entity.value.content.title || fileName
    } catch {
      return fileName
    }
  }

  /**
   * Create directory node
   */
  private async createDirectoryNode(
    fileName: string,
    filePath: string,
    directoryOnly: boolean,
  ): Promise<DocTreeDirectoryNodeValue | Error> {
    const indexInfo = await this.readDirectoryIndexInfo(fileName, filePath)

    if (indexInfo instanceof Error) {
      return indexInfo
    }

    const children = directoryOnly
      ? await this.buildDirectoryTree(filePath)
      : await this.buildFileTree(filePath)

    if (children instanceof Error) {
      return children
    }

    return DocTreeDirectoryNodeValue.from({
      name: fileName,
      path: filePath,
      icon: indexInfo.icon,
      title: indexInfo.title,
      children,
    })
  }

  /**
   * Read title and icon from directory index file
   */
  private async readDirectoryIndexInfo(
    fileName: string,
    filePath: string,
  ): Promise<{ title: string; icon: string } | Error> {
    const indexFile = this.createIndexFileReference(filePath)

    if (!(await indexFile.exists())) {
      return { title: fileName, icon: this.config.defaultIndexIcon }
    }

    try {
      const entity = await indexFile.read()
      const title = entity.value.content.title || fileName
      const frontMatter = entity.content.meta()
      const icon = frontMatter?.icon || this.config.defaultIndexIcon
      return { title, icon }
    } catch (error) {
      return error instanceof Error ? error : new Error(String(error))
    }
  }

  /**
   * Create index file reference
   */
  private createIndexFileReference(directoryPath: string): DocFileIndexReference<DocCustomSchema> {
    const indexPath =
      directoryPath === ""
        ? this.props.indexFileName
        : `${directoryPath}/${this.props.indexFileName}`

    return new DocFileIndexReference<DocCustomSchema>({
      path: indexPath,
      fileSystem: this.props.fileSystem,
      pathSystem: this.props.pathSystem,
      customSchema: {},
      config: this.config,
    })
  }

  /**
   * Create MD file reference
   */
  private createMdFileReference(path: string): DocFileMdReference<DocCustomSchema> {
    return new DocFileMdReference({
      path,
      fileSystem: this.props.fileSystem,
      pathSystem: this.props.pathSystem,
      customSchema: {},
      config: this.config,
    })
  }

  /**
   * Build directory tree recursively (directories only)
   */
  async buildDirectoryTree(directoryPath = ""): Promise<DocTreeDirectoryNodeValue[] | Error> {
    const fileNames = await this.props.fileSystem.readDirectoryFileNames(directoryPath)

    if (fileNames instanceof Error) {
      return fileNames
    }

    const results: DocTreeDirectoryNodeValue[] = []

    for (const fileName of fileNames) {
      if (fileName === this.props.archiveDirectoryName) continue

      // Skip directories in exclusion list
      if (this.config.directoryExcludes.includes(fileName)) continue

      // Skip .meta.json file
      const metaFileName = this.config.metaFileName ?? ".meta.json"
      if (fileName === metaFileName) continue

      const filePath = directoryPath
        ? this.props.pathSystem.join(directoryPath, fileName)
        : fileName
      const isDirectory = await this.props.fileSystem.isDirectory(filePath)
      if (!isDirectory) continue
      const directoryNode = await this.createDirectoryNode(fileName, filePath, true)
      if (directoryNode instanceof Error) {
        return directoryNode
      }
      results.push(directoryNode)
    }

    return results
  }
}
