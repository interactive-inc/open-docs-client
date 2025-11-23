/**
 * Interface for DocFileSystem class
 * Defines all public methods available in DocFileSystem
 */
export interface DocFileSystemInterface {
  /**
   * Read file content at the specified path
   */
  readFile(relativePath: string): Promise<string | null | Error>

  /**
   * Write content to file at the specified path (creates directory if needed)
   */
  writeFile(relativePath: string, content: string): Promise<Error | null>

  /**
   * Delete file at the specified path
   */
  deleteFile(relativePath: string): Promise<Error | null>

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
   * Create directory
   */
  createEmptyDirectory(relativePath: string): Promise<Error | null>

  /**
   * Get file size in bytes
   */
  getFileSize(relativePath: string): Promise<number | Error>

  /**
   * Create directory if it doesn't exist
   */
  createDirectory(relativePath: string): Promise<Error | null>

  /**
   * Copy file
   */
  copyFile(sourcePath: string, destinationPath: string): Promise<Error | null>

  /**
   * Move file
   */
  moveFile(sourcePath: string, destinationPath: string): Promise<Error | null>

  /**
   * Get file last modified time
   */
  getFileUpdatedTime(relativePath: string): Promise<Date | Error>

  /**
   * Get file creation time
   */
  getFileCreatedTime(relativePath: string): Promise<Date | Error>
}
