import { DocPathSystem } from "../path-system/doc-path-system"
import type { DocFileSystemInterface } from "./doc-file-system.interface"

type FileData = {
  content: string
  modifiedTime: Date
  createdTime: Date
  size: number
}

// 仮想ディレクトリ構造
const mockDirectoryData = {
  "docs/index.md": `---
icon: 📚
---

# Documentation

Welcome to the documentation!`,
  "docs/guide/index.md": `---
icon: 📖
---

# Guide

This is a guide.`,
  "docs/guide/getting-started.md": `# Getting Started

Let's get started!`,
  "docs/guide/advanced.md": `# Advanced

Advanced topics here.`,
  "docs/api/index.md": `---
icon: 🔧
---

# API

API documentation.`,
  "docs/api/reference.md": `# API Reference

Complete API reference.`,
}

/**
 * In-memory file system for testing
 */
export class DocFileSystemMock implements DocFileSystemInterface {
  private files: Map<string, FileData> = new Map()
  private readonly pathSystem: DocPathSystem
  private readonly basePath: string

  constructor(props: {
    basePath: string
    pathSystem?: DocPathSystem
    skipDefaultFiles?: boolean
  }) {
    this.pathSystem = props.pathSystem ?? new DocPathSystem()

    this.basePath = props.basePath.endsWith("/")
      ? props.basePath.slice(0, -1)
      : props.basePath

    // skipDefaultFilesがtrueでない場合のみmockDirectoryDataでfilesを初期化
    if (!props.skipDefaultFiles) {
      this.setupTestFiles(mockDirectoryData)
    }

    Object.freeze(this)
  }

  /**
   * PathSystem accessor (for testing)
   */
  getPathSystem() {
    return this.pathSystem
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
   * Normalize path using basePath
   */
  private normalizePath(filePath: string): string {
    // basePathが既に含まれている場合はそのまま返す
    if (filePath.startsWith(this.basePath)) {
      return filePath
    }

    // Remove leading slash if present
    const cleanPath = filePath.startsWith("/") ? filePath.slice(1) : filePath

    return `${this.basePath}/${cleanPath}`
  }

  /**
   * Create instance (mock data is automatically loaded)
   */
  static create(basePath = "/test"): DocFileSystemMock {
    return new DocFileSystemMock({ basePath })
  }

  /**
   * Factory method for testing
   */
  static createWithFiles(props: {
    basePath?: string
    fileContents?: Record<string, string>
  }): DocFileSystemMock {
    const basePath = props.basePath ?? "/test"
    // skipDefaultFiles: true を渡してデフォルトファイルをスキップ
    const fileSystem = new DocFileSystemMock({
      basePath,
      skipDefaultFiles: true,
    })

    if (props.fileContents) {
      const now = new Date()
      for (const [path, content] of Object.entries(props.fileContents)) {
        // basePathを使って正規化
        const cleanPath = path.startsWith("/") ? path.slice(1) : path
        const normalizedPath = path.startsWith(basePath)
          ? path
          : `${basePath}/${cleanPath}`
        fileSystem.files.set(normalizedPath, {
          content,
          modifiedTime: now,
          createdTime: now,
          size: new TextEncoder().encode(content).length,
        })
      }
    }

    return fileSystem
  }

  async readFile(filePath: string): Promise<string | null | Error> {
    try {
      const normalizedPath = this.normalizePath(filePath)
      const file = this.files.get(normalizedPath)
      return file ? file.content : null
    } catch (error) {
      return error instanceof Error
        ? error
        : new Error(`Failed to read file at ${filePath}`)
    }
  }

  async writeFile(filePath: string, content: string): Promise<Error | null> {
    try {
      const normalizedPath = this.normalizePath(filePath)
      const now = new Date()
      const existing = this.files.get(normalizedPath)

      this.files.set(normalizedPath, {
        content,
        modifiedTime: now,
        createdTime: existing?.createdTime ?? now,
        size: new TextEncoder().encode(content).length,
      })
      return null
    } catch (error) {
      return error instanceof Error
        ? error
        : new Error(`Failed to write file at ${filePath}`)
    }
  }

  async deleteFile(filePath: string): Promise<Error | null> {
    try {
      const normalizedPath = this.normalizePath(filePath)
      this.files.delete(normalizedPath)
      return null
    } catch (error) {
      return new Error(`Failed to delete file at ${filePath}: ${error}`)
    }
  }

  async exists(filePath: string): Promise<boolean> {
    const normalizedPath = this.normalizePath(filePath)

    if (this.files.has(normalizedPath)) {
      return true
    }

    const dirPath = normalizedPath.endsWith("/")
      ? normalizedPath
      : `${normalizedPath}/`
    for (const path of this.files.keys()) {
      if (path.startsWith(dirPath)) {
        return true
      }
    }

    return false
  }

  async copyFile(source: string, destination: string): Promise<Error | null> {
    try {
      const normalizedSource = this.normalizePath(source)
      const normalizedDest = this.normalizePath(destination)

      const file = this.files.get(normalizedSource)
      if (!file) {
        return new Error(`Source file not found: ${normalizedSource}`)
      }

      this.files.set(normalizedDest, {
        ...file,
        createdTime: new Date(),
      })
      return null
    } catch (error) {
      return error instanceof Error
        ? error
        : new Error(`Failed to copy file from ${source} to ${destination}`)
    }
  }

  async moveFile(source: string, destination: string): Promise<Error | null> {
    try {
      const normalizedSource = this.normalizePath(source)
      const normalizedDest = this.normalizePath(destination)

      const file = this.files.get(normalizedSource)
      if (!file) {
        return new Error(`Source file not found: ${normalizedSource}`)
      }

      this.files.set(normalizedDest, file)
      this.files.delete(normalizedSource)
      return null
    } catch (error) {
      return error instanceof Error
        ? error
        : new Error(`Failed to move file from ${source} to ${destination}`)
    }
  }

  async readDirectory(directoryPath: string): Promise<string[]> {
    const dirPath = directoryPath.endsWith("/")
      ? directoryPath
      : `${directoryPath}/`
    const entries = new Set<string>()

    for (const path of this.files.keys()) {
      if (path.startsWith(dirPath)) {
        const relativePath = path.slice(dirPath.length)
        const firstSegment = relativePath.split("/")[0]
        if (firstSegment) {
          entries.add(firstSegment)
        }
      }
    }

    return Array.from(entries).sort()
  }

  async readDirectoryRecursive(directoryPath: string): Promise<string[]> {
    const dirPath = directoryPath.endsWith("/")
      ? directoryPath
      : `${directoryPath}/`
    const files: string[] = []

    for (const path of this.files.keys()) {
      if (path.startsWith(dirPath)) {
        files.push(path)
      }
    }

    return files.sort()
  }

  async readDirectoryFilePaths(
    directoryPath: string,
  ): Promise<string[] | Error> {
    try {
      const normalizedDir = this.normalizePath(directoryPath)
      const dirPath = normalizedDir.endsWith("/")
        ? normalizedDir
        : `${normalizedDir}/`
      const files: string[] = []

      for (const path of this.files.keys()) {
        if (
          path.startsWith(dirPath) &&
          !path.slice(dirPath.length).includes("/")
        ) {
          // basePathを除去して相対パスにして返す
          const relativePath = path.startsWith(`${this.basePath}/`)
            ? path.slice(this.basePath.length + 1)
            : path
          files.push(relativePath)
        }
      }

      return files.sort()
    } catch (error) {
      return error instanceof Error
        ? error
        : new Error(`Failed to read directory file paths at ${directoryPath}`)
    }
  }

  async createEmptyDirectory(_directoryPath: string): Promise<Error | null> {
    // No directory creation needed in in-memory file system
    return null
  }

  async deleteDirectory(directoryPath: string): Promise<void> {
    const dirPath = directoryPath.endsWith("/")
      ? directoryPath
      : `${directoryPath}/`

    for (const path of this.files.keys()) {
      if (path.startsWith(dirPath)) {
        this.files.delete(path)
      }
    }
  }

  async getFileSize(filePath: string): Promise<number | Error> {
    try {
      const normalizedPath = this.normalizePath(filePath)
      const file = this.files.get(normalizedPath)
      if (!file) {
        return new Error(`File not found: ${normalizedPath}`)
      }
      return file.size
    } catch (error) {
      return error instanceof Error
        ? error
        : new Error(`Failed to get file size at ${filePath}`)
    }
  }

  async getFileUpdatedTime(filePath: string): Promise<Date | Error> {
    try {
      const normalizedPath = this.normalizePath(filePath)
      const file = this.files.get(normalizedPath)
      if (!file) {
        return new Error(`File not found: ${normalizedPath}`)
      }
      return file.modifiedTime
    } catch (error) {
      return error instanceof Error
        ? error
        : new Error(`Failed to get file modified time at ${filePath}`)
    }
  }

  async getFileCreatedTime(filePath: string): Promise<Date | Error> {
    try {
      const normalizedPath = this.normalizePath(filePath)
      const file = this.files.get(normalizedPath)
      if (!file) {
        return new Error(`File not found: ${normalizedPath}`)
      }
      return file.createdTime
    } catch (error) {
      return error instanceof Error
        ? error
        : new Error(`Failed to get file created time at ${filePath}`)
    }
  }

  async isDirectory(relativePath: string): Promise<boolean> {
    // In memory system doesn't track directories explicitly
    // Check if any files exist with this prefix
    const normalizedPath = this.normalizePath(relativePath)
    const dirPath = normalizedPath.endsWith("/")
      ? normalizedPath
      : `${normalizedPath}/`
    for (const path of this.files.keys()) {
      if (path.startsWith(dirPath)) {
        return true
      }
    }
    return false
  }

  async isFile(relativePath: string): Promise<boolean> {
    const normalizedPath = this.normalizePath(relativePath)
    return this.files.has(normalizedPath)
  }

  /**
   * Get list of entries in directory
   */
  async readDirectoryFileNames(directoryPath = ""): Promise<string[] | Error> {
    try {
      const normalizedDir =
        directoryPath === "" ? this.basePath : this.normalizePath(directoryPath)
      const dirPath = normalizedDir.endsWith("/")
        ? normalizedDir
        : `${normalizedDir}/`
      const entries = new Set<string>()

      for (const path of this.files.keys()) {
        if (path.startsWith(dirPath)) {
          const relativePath = path.slice(dirPath.length)
          const firstSegment = relativePath.split("/")[0]
          if (firstSegment) {
            entries.add(firstSegment)
          }
        }
      }

      return Array.from(entries).sort()
    } catch (error) {
      return error instanceof Error
        ? error
        : new Error(`Failed to read directory at ${directoryPath}`)
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
   * Create directory if it doesn't exist
   */
  async createDirectory(_relativePath: string): Promise<Error | null> {
    // No directory creation needed in in-memory file system
    return null
  }

  /**
   * Clear all files
   */
  clear(): void {
    this.files.clear()
  }

  /**
   * Check file existence (for testing)
   */
  hasFile(filePath: string): boolean {
    const normalizedPath = this.normalizePath(filePath)
    return this.files.has(normalizedPath)
  }

  /**
   * Get file content (sync version, for testing)
   */
  getFileContent(filePath: string): string | undefined {
    const normalizedPath = this.normalizePath(filePath)
    return this.files.get(normalizedPath)?.content
  }

  /**
   * Get all file paths (for testing)
   */
  getAllFilePaths(): string[] {
    return Array.from(this.files.keys())
      .map((path) => {
        // basePathを除去して相対パスにして返す
        return path.startsWith(`${this.basePath}/`)
          ? path.slice(this.basePath.length + 1)
          : path
      })
      .sort()
  }

  /**
   * Get file count (for testing)
   */
  getFileCount(): number {
    return this.files.size
  }

  /**
   * Setup test data
   */
  setupTestFiles(files: Record<string, string>): void {
    const now = new Date()
    for (const [path, content] of Object.entries(files)) {
      const normalizedPath = this.normalizePath(path)
      this.files.set(normalizedPath, {
        content,
        modifiedTime: now,
        createdTime: now,
        size: new TextEncoder().encode(content).length,
      })
    }
  }
}
