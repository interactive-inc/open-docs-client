/**
 * Write-only file system interface for document operations
 */
export interface DocFileSystemWriteInterface {
  /**
   * Write content to file at the specified path (creates directory if needed)
   */
  writeFile(relativePath: string, content: string): Promise<Error | null>

  /**
   * Delete file at the specified path
   */
  deleteFile(relativePath: string): Promise<Error | null>

  /**
   * Create directory
   */
  createEmptyDirectory(relativePath: string): Promise<Error | null>

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
}
