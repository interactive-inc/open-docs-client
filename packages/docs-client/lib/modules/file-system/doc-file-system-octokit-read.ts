import { Octokit } from "@octokit/rest"
import type { DocFileSystemReadInterface } from "@/modules/file-system/doc-file-system-read.interface"
import { DocPathSystem } from "../path-system/doc-path-system"

type Props = {
  owner: string
  repo: string
  basePath: string
  branch?: string
  token: string
  pathSystem?: DocPathSystem
}

type FileCache = {
  sha: string
  content: string
  size: number
  modifiedTime?: string
}

/**
 * GitHub repository read-only file system using Octokit
 */
export class DocFileSystemOctokitRead implements DocFileSystemReadInterface {
  protected readonly octokit: Octokit
  protected readonly owner: string
  protected readonly repo: string
  protected readonly branch: string
  protected readonly pathSystem: DocPathSystem
  protected readonly basePath: string
  protected fileCache: Map<string, FileCache> = new Map()

  constructor(props: Props) {
    this.owner = props.owner
    this.repo = props.repo
    this.branch = props.branch ?? "main"
    this.basePath = props.basePath
    this.pathSystem = props.pathSystem ?? new DocPathSystem()
    this.octokit = new Octokit({ auth: props.token })
    Object.freeze(this)
  }

  /**
   * Read file content from GitHub repository
   */
  async readFile(relativePath: string): Promise<string | null | Error> {
    try {
      const fullPath = this.pathSystem.join(this.basePath, relativePath)
      const response = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path: fullPath,
        ref: this.branch,
      })

      if ("type" in response.data && response.data.type === "file") {
        const content = Buffer.from(response.data.content, "base64").toString(
          "utf-8",
        )

        this.fileCache.set(fullPath, {
          sha: response.data.sha,
          content,
          size: response.data.size,
        })

        return content
      }

      return new Error(`Path ${relativePath} is not a file`)
    } catch (error: unknown) {
      if (
        error &&
        typeof error === "object" &&
        "status" in error &&
        error.status === 404
      ) {
        return null
      }
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
      const fullPath = relativePath
        ? this.pathSystem.join(this.basePath, relativePath)
        : this.basePath
      const response = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path: fullPath,
        ref: this.branch,
      })

      if (Array.isArray(response.data)) {
        return response.data.map((item) => item.name)
      }

      return new Error(`Path ${relativePath} is not a directory`)
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
      const fullPath = this.pathSystem.join(this.basePath, relativePath)
      const response = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path: fullPath,
        ref: this.branch,
      })

      return Array.isArray(response.data)
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
      const response = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path: fullPath,
        ref: this.branch,
      })

      return !Array.isArray(response.data) && response.data.type === "file"
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
      await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path: fullPath,
        ref: this.branch,
      })
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
      const cached = this.fileCache.get(fullPath)
      if (cached) {
        return cached.size
      }

      const response = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path: fullPath,
        ref: this.branch,
      })

      if ("size" in response.data) {
        return response.data.size
      }

      return new Error(`Cannot get size for ${relativePath}`)
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
      const commits = await this.octokit.repos.listCommits({
        owner: this.owner,
        repo: this.repo,
        path: relativePath,
        sha: this.branch,
        per_page: 1,
      })

      if (commits.data.length > 0 && commits.data[0].commit.author?.date) {
        return new Date(commits.data[0].commit.author.date)
      }

      return new Error(`No commits found for ${relativePath}`)
    } catch (error) {
      return error instanceof Error
        ? error
        : new Error(`Failed to get file modified time at ${relativePath}`)
    }
  }

  /**
   * Get file creation time (first commit)
   */
  async getFileCreatedTime(relativePath: string): Promise<Date | Error> {
    try {
      const commits = await this.octokit.repos.listCommits({
        owner: this.owner,
        repo: this.repo,
        path: relativePath,
        sha: this.branch,
      })

      const lastCommit = commits.data[commits.data.length - 1]
      if (lastCommit?.commit.author?.date) {
        return new Date(lastCommit.commit.author.date)
      }

      return new Error(`No commits found for ${relativePath}`)
    } catch (error) {
      return error instanceof Error
        ? error
        : new Error(`Failed to get file created time at ${relativePath}`)
    }
  }

  /**
   * Get cached SHA for a file
   */
  getCachedSha(relativePath: string): string | undefined {
    const fullPath = this.pathSystem.join(this.basePath, relativePath)
    return this.fileCache.get(fullPath)?.sha
  }
}
