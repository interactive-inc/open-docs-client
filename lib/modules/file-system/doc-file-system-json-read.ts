import { z } from "zod"
import type { DocFileSystemReadInterface } from "@/modules/file-system/doc-file-system-read.interface"
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
  data: JsonDocumentData | unknown
  basePath?: string
  pathSystem?: DocPathSystem
}

/**
 * JSON-based read-only file system implementation
 */
export class DocFileSystemJsonRead implements DocFileSystemReadInterface {
  private readonly data: JsonDocumentData
  private readonly basePath: string
  private readonly pathSystem: DocPathSystem

  constructor(props: Props) {
    // Parse and validate JSON data
    const parsed = parseJsonDocumentData(props.data)
    if (parsed instanceof Error) {
      throw parsed
    }

    this.data = parsed
    this.basePath = props.basePath ?? "docs"
    this.pathSystem = props.pathSystem ?? new DocPathSystem()
    Object.freeze(this)
  }

  /**
   * Read file content from JSON data
   */
  async readFile(relativePath: string): Promise<string | null | Error> {
    try {
      const normalizedPath = this.normalizePath(relativePath)
      const content = this.data[normalizedPath]
      return content ?? null
    } catch (error) {
      return error instanceof Error
        ? error
        : new Error(`Failed to read file at ${relativePath}`)
    }
  }

  /**
   * Get file name from path
   */
  readFileName(relativePath: string): string {
    return this.pathSystem.basename(relativePath)
  }

  /**
   * Get file extension from path
   */
  readFileExtension(relativePath: string): string {
    return this.pathSystem.extname(relativePath)
  }

  /**
   * Get directory path where the file exists
   */
  readFileDirectory(relativePath: string): string {
    return this.pathSystem.dirname(relativePath)
  }

  /**
   * Get list of file names in directory
   */
  async readDirectoryFileNames(relativePath = ""): Promise<string[] | Error> {
    try {
      const normalizedDir = this.normalizePath(relativePath)
      const fileNames = new Set<string>()

      for (const filePath of Object.keys(this.data)) {
        if (this.isFileInDirectory(filePath, normalizedDir)) {
          const relativePart = this.getRelativePartFromDirectory(
            filePath,
            normalizedDir,
          )
          const segments = relativePart.split("/").filter(Boolean)
          if (segments.length > 0) {
            fileNames.add(segments[0])
          }
        }
      }

      return Array.from(fileNames).sort()
    } catch (error) {
      return error instanceof Error
        ? error
        : new Error(`Failed to read directory at ${relativePath}`)
    }
  }

  /**
   * Get list of file paths in directory
   */
  async readDirectoryFilePaths(
    relativePath: string,
  ): Promise<string[] | Error> {
    try {
      const fileNames = await this.readDirectoryFileNames(relativePath)

      if (fileNames instanceof Error) {
        return fileNames
      }

      return fileNames.map((fileName) =>
        this.pathSystem.join(relativePath, fileName),
      )
    } catch (error) {
      return error instanceof Error
        ? error
        : new Error(`Failed to read directory file paths at ${relativePath}`)
    }
  }

  /**
   * Check if path is a directory
   */
  async isDirectory(relativePath: string): Promise<boolean> {
    try {
      const normalizedPath = this.normalizePath(relativePath)

      // Check if any file starts with this path + "/"
      for (const filePath of Object.keys(this.data)) {
        if (filePath.startsWith(`${normalizedPath}/`)) {
          return true
        }
      }

      return false
    } catch {
      return false
    }
  }

  /**
   * Check if path is a file
   */
  async isFile(relativePath: string): Promise<boolean> {
    try {
      const normalizedPath = this.normalizePath(relativePath)
      return normalizedPath in this.data
    } catch {
      return false
    }
  }

  /**
   * Check if file or directory exists
   */
  async exists(relativePath: string): Promise<boolean> {
    const isFile = await this.isFile(relativePath)
    if (isFile) return true

    const isDir = await this.isDirectory(relativePath)
    return isDir
  }

  /**
   * Check if directory exists
   */
  async directoryExists(relativePath: string): Promise<boolean> {
    return this.isDirectory(relativePath)
  }

  /**
   * Check if file exists
   */
  async fileExists(relativePath: string): Promise<boolean> {
    return this.isFile(relativePath)
  }

  /**
   * Get base path
   */
  getBasePath(): string {
    return this.basePath
  }

  /**
   * Convert relative path to absolute path
   */
  resolve(relativePath: string): string {
    return this.pathSystem.join(this.basePath, relativePath)
  }

  /**
   * Get file size in bytes
   */
  async getFileSize(relativePath: string): Promise<number | Error> {
    try {
      const content = await this.readFile(relativePath)

      if (content instanceof Error) {
        return content
      }

      if (content === null) {
        return new Error(`File not found: ${relativePath}`)
      }

      return Buffer.byteLength(content, "utf8")
    } catch (error) {
      return error instanceof Error
        ? error
        : new Error(`Failed to get file size at ${relativePath}`)
    }
  }

  /**
   * Get file last modified time (not available for JSON data)
   */
  async getFileUpdatedTime(_relativePath: string): Promise<Date | Error> {
    return new Error("File modified time not available for JSON data")
  }

  /**
   * Get file creation time (not available for JSON data)
   */
  async getFileCreatedTime(_relativePath: string): Promise<Date | Error> {
    return new Error("File creation time not available for JSON data")
  }

  /**
   * Get all file paths in the JSON data
   */
  getAllFilePaths(): string[] {
    return Object.keys(this.data)
  }

  /**
   * Get the raw JSON data
   */
  getRawData(): JsonDocumentData {
    return { ...this.data }
  }

  /**
   * Normalize path by removing leading/trailing slashes
   */
  private normalizePath(path: string): string {
    return path.replace(/^\/+|\/+$/g, "")
  }

  /**
   * Check if a file path is within a directory
   */
  private isFileInDirectory(filePath: string, dirPath: string): boolean {
    if (dirPath === "") {
      return true // Root directory contains all files
    }
    return filePath.startsWith(`${dirPath}/`) || filePath === dirPath
  }

  /**
   * Get the relative part of a file path from a directory
   */
  private getRelativePartFromDirectory(
    filePath: string,
    dirPath: string,
  ): string {
    if (dirPath === "") {
      return filePath
    }

    if (filePath.startsWith(`${dirPath}/`)) {
      return filePath.slice(dirPath.length + 1)
    }

    return ""
  }
}
