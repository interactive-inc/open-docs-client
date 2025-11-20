import { z } from "zod"
import type { DocFileSystemReadInterface } from "@/modules/file-system/doc-file-system-read.interface"
import type { DocFileSystemWriteInterface } from "@/modules/file-system/doc-file-system-write.interface"
import { DocPathSystem } from "../path-system/doc-path-system"

const zJsonDocumentData = z.record(z.string(), z.string())

type JsonDocumentData = z.infer<typeof zJsonDocumentData>

function parseJsonDocumentData(data: unknown): JsonDocumentData | Error {
  try {
    return zJsonDocumentData.parse(data)
  } catch (error) {
    return error instanceof Error
      ? error
      : new Error("Failed to parse JSON document data")
  }
}

type Props = {
  data?: JsonDocumentData | unknown
  basePath?: string
  pathSystem?: DocPathSystem
  reader?: DocFileSystemReadInterface
  onDataChange?: (data: JsonDocumentData) => void
}

/**
 * JSON-based write-only file system implementation
 */
export class DocFileSystemJsonWrite implements DocFileSystemWriteInterface {
  private data: JsonDocumentData
  private readonly basePath: string
  private readonly pathSystem: DocPathSystem
  private readonly reader?: DocFileSystemReadInterface
  private readonly onDataChange?: (data: JsonDocumentData) => void

  constructor(props: Props = {}) {
    // Parse and validate initial JSON data
    if (props.data !== undefined) {
      const parsed = parseJsonDocumentData(props.data)
      if (parsed instanceof Error) {
        throw parsed
      }
      this.data = parsed
    } else {
      this.data = {}
    }

    this.basePath = props.basePath ?? "docs"
    this.pathSystem = props.pathSystem ?? new DocPathSystem()
    this.reader = props.reader
    this.onDataChange = props.onDataChange
  }

  /**
   * Write content to JSON data
   */
  async writeFile(
    relativePath: string,
    content: string,
  ): Promise<Error | null> {
    try {
      const normalizedPath = this.normalizePath(relativePath)
      this.data[normalizedPath] = content
      this.notifyDataChange()
      return null
    } catch (error) {
      return error instanceof Error
        ? error
        : new Error(`Failed to write file at ${relativePath}`)
    }
  }

  /**
   * Delete file from JSON data
   */
  async deleteFile(relativePath: string): Promise<Error | null> {
    try {
      const normalizedPath = this.normalizePath(relativePath)

      if (!(normalizedPath in this.data)) {
        return new Error(`File not found: ${relativePath}`)
      }

      delete this.data[normalizedPath]
      this.notifyDataChange()
      return null
    } catch (error) {
      return error instanceof Error
        ? error
        : new Error(`Failed to delete file at ${relativePath}`)
    }
  }

  /**
   * Create directory (creates a placeholder entry)
   */
  async createEmptyDirectory(relativePath: string): Promise<Error | null> {
    try {
      const normalizedPath = this.normalizePath(relativePath)

      // Create a .gitkeep file to represent the directory
      const gitkeepPath = this.pathSystem.join(normalizedPath, ".gitkeep")
      const normalizedGitkeepPath = this.normalizePath(gitkeepPath)

      this.data[normalizedGitkeepPath] = ""
      this.notifyDataChange()
      return null
    } catch (error) {
      return error instanceof Error
        ? error
        : new Error(`Failed to create directory at ${relativePath}`)
    }
  }

  /**
   * Create directory if it doesn't exist
   */
  async createDirectory(relativePath: string): Promise<Error | null> {
    try {
      if (this.reader) {
        const exists = await this.reader.exists(relativePath)
        if (exists) {
          return null
        }
      } else {
        // Check in our own data if no reader provided
        if (await this.directoryExistsInData(relativePath)) {
          return null
        }
      }

      return await this.createEmptyDirectory(relativePath)
    } catch (error) {
      return error instanceof Error
        ? error
        : new Error(`Failed to ensure directory exists at ${relativePath}`)
    }
  }

  /**
   * Copy file within JSON data
   */
  async copyFile(
    sourcePath: string,
    destinationPath: string,
  ): Promise<Error | null> {
    try {
      const normalizedSourcePath = this.normalizePath(sourcePath)
      const normalizedDestPath = this.normalizePath(destinationPath)

      if (this.reader) {
        const content = await this.reader.readFile(sourcePath)
        if (content instanceof Error) {
          return content
        }
        if (content === null) {
          return new Error(`Source file not found: ${sourcePath}`)
        }

        this.data[normalizedDestPath] = content
      } else {
        // Fallback to internal data
        if (!(normalizedSourcePath in this.data)) {
          return new Error(`Source file not found: ${sourcePath}`)
        }

        this.data[normalizedDestPath] = this.data[normalizedSourcePath]
      }

      this.notifyDataChange()
      return null
    } catch (error) {
      return error instanceof Error
        ? error
        : new Error(
            `Failed to copy file from ${sourcePath} to ${destinationPath}`,
          )
    }
  }

  /**
   * Move file within JSON data
   */
  async moveFile(
    sourcePath: string,
    destinationPath: string,
  ): Promise<Error | null> {
    try {
      const copyResult = await this.copyFile(sourcePath, destinationPath)
      if (copyResult !== null) {
        return copyResult
      }

      return await this.deleteFile(sourcePath)
    } catch (error) {
      return error instanceof Error
        ? error
        : new Error(
            `Failed to move file from ${sourcePath} to ${destinationPath}`,
          )
    }
  }

  /**
   * Get the current JSON data
   */
  getData(): JsonDocumentData {
    return { ...this.data }
  }

  /**
   * Update the entire JSON data
   */
  setData(data: JsonDocumentData | unknown): Error | null {
    try {
      const parsed = parseJsonDocumentData(data)
      if (parsed instanceof Error) {
        return parsed
      }

      this.data = parsed
      this.notifyDataChange()
      return null
    } catch (error) {
      return error instanceof Error
        ? error
        : new Error("Failed to set JSON data")
    }
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.data = {}
    this.notifyDataChange()
  }

  /**
   * Get all file paths in the JSON data
   */
  getAllFilePaths(): string[] {
    return Object.keys(this.data)
  }

  /**
   * Normalize path by removing leading/trailing slashes
   */
  private normalizePath(path: string): string {
    return path.replace(/^\/+|\/+$/g, "")
  }

  /**
   * Check if directory exists in data
   */
  private async directoryExistsInData(relativePath: string): Promise<boolean> {
    const normalizedPath = this.normalizePath(relativePath)

    // Check if any file starts with this path + "/"
    for (const filePath of Object.keys(this.data)) {
      if (filePath.startsWith(`${normalizedPath}/`)) {
        return true
      }
    }

    return false
  }

  /**
   * Notify data change callback
   */
  private notifyDataChange(): void {
    if (this.onDataChange) {
      this.onDataChange({ ...this.data })
    }
  }
}
