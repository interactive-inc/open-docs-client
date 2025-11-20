import * as fs from "node:fs/promises"
import type { DocFileSystemReadInterface } from "@/modules/file-system/doc-file-system-read.interface"
import { DocPathSystem } from "../path-system/doc-path-system"

type Props = {
  basePath: string
  pathSystem?: DocPathSystem
}

/**
 * Read-only file system implementation
 */
export class DocFileSystemNodeRead implements DocFileSystemReadInterface {
  protected readonly basePath: string
  protected readonly pathSystem: DocPathSystem

  constructor(props: Props) {
    this.basePath = props.basePath
    this.pathSystem = props.pathSystem ?? new DocPathSystem()
  }

  /**
   * Read file content at the specified path
   */
  async readFile(relativePath: string): Promise<string | null | Error> {
    try {
      const exists = await this.exists(relativePath)

      if (!exists) return null

      const fullPath = this.pathSystem.join(this.basePath, relativePath)
      return await fs.readFile(fullPath, "utf-8")
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
   * Get list of entries in directory
   */
  async readDirectoryFileNames(relativePath = ""): Promise<string[] | Error> {
    try {
      const fullPath = this.pathSystem.join(this.basePath, relativePath)
      return await fs.readdir(fullPath)
    } catch (error) {
      return error instanceof Error
        ? error
        : new Error(`Failed to read directory at ${relativePath}`)
    }
  }

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
      const fullPath = this.pathSystem.join(this.basePath, relativePath)
      const stats = await fs.stat(fullPath)
      return stats.isDirectory()
    } catch {
      return false
    }
  }

  /**
   * Check if path is a file
   */
  async isFile(relativePath: string): Promise<boolean> {
    try {
      const fullPath = this.pathSystem.join(this.basePath, relativePath)
      const stats = await fs.stat(fullPath)
      return stats.isFile()
    } catch {
      return false
    }
  }

  /**
   * Check if file or directory exists
   */
  async exists(relativePath: string): Promise<boolean> {
    try {
      const fullPath = this.pathSystem.join(this.basePath, relativePath)
      await fs.access(fullPath)
      return true
    } catch {
      return false
    }
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
      const fullPath = this.pathSystem.join(this.basePath, relativePath)
      const stats = await fs.stat(fullPath)
      return stats.size
    } catch (error) {
      return error instanceof Error
        ? error
        : new Error(`Failed to get file size at ${relativePath}`)
    }
  }

  /**
   * Get file last modified time
   */
  async getFileUpdatedTime(relativePath: string): Promise<Date | Error> {
    try {
      const fullPath = this.pathSystem.join(this.basePath, relativePath)
      const stats = await fs.stat(fullPath)
      return stats.mtime
    } catch (error) {
      return error instanceof Error
        ? error
        : new Error(`Failed to get file modified time at ${relativePath}`)
    }
  }

  /**
   * Get file creation time
   */
  async getFileCreatedTime(relativePath: string): Promise<Date | Error> {
    try {
      const fullPath = this.pathSystem.join(this.basePath, relativePath)
      const stats = await fs.stat(fullPath)
      return stats.birthtime
    } catch (error) {
      return error instanceof Error
        ? error
        : new Error(`Failed to get file created time at ${relativePath}`)
    }
  }
}
