/**
 * Read-only file system interface for document operations
 */
export interface DocFileSystemReadInterface {
  /**
   * Read file content at the specified path
   */
  readFile(relativePath: string): Promise<string | null | Error>

  /**
   * Get file name from path
   */
  readFileName(relativePath: string): string

  /**
   * Get file extension from path
   */
  readFileExtension(relativePath: string): string

  /**
   * Get directory path where the file exists
   */
  readFileDirectory(relativePath: string): string

  /**
   * Get list of entries in directory
   */
  readDirectoryFileNames(relativePath?: string): Promise<string[] | Error>

  /**
   * Get list of file paths in directory
   */
  readDirectoryFilePaths(relativePath: string): Promise<string[] | Error>

  /**
   * Check if path is a directory
   */
  isDirectory(relativePath: string): Promise<boolean>

  /**
   * Check if path is a file
   */
  isFile(relativePath: string): Promise<boolean>

  /**
   * Check if file or directory exists
   */
  exists(relativePath: string): Promise<boolean>

  /**
   * Check if directory exists
   */
  directoryExists(relativePath: string): Promise<boolean>

  /**
   * Check if file exists
   */
  fileExists(relativePath: string): Promise<boolean>

  /**
   * Get base path
   */
  getBasePath(): string

  /**
   * Convert relative path to absolute path
   */
  resolve(relativePath: string): string

  /**
   * Get file size in bytes
   */
  getFileSize(relativePath: string): Promise<number | Error>

  /**
   * Get file last modified time
   */
  getFileUpdatedTime(relativePath: string): Promise<Date | Error>

  /**
   * Get file creation time
   */
  getFileCreatedTime(relativePath: string): Promise<Date | Error>
}
