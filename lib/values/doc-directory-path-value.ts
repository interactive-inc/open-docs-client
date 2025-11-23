import type { DocPathSystem } from "../modules/path-system/doc-path-system"
import { DocFilePathValue } from "./doc-file-path-value"

type Value = {
  path: string
  name: string
  fullPath: string
}

/**
 * Value object representing a directory path
 */
export class DocDirectoryPathValue {
  constructor(
    private readonly value: Value,
    private readonly pathSystem: DocPathSystem,
  ) {
    Object.freeze(this)
  }

  /**
   * Relative directory path
   */
  get path(): string {
    return this.value.path
  }

  /**
   * Directory name
   */
  get name(): string {
    return this.value.name
  }

  /**
   * Get parent directory path
   */
  get parent(): DocDirectoryPathValue | null {
    if (this.path === "." || this.path === "") {
      return null
    }
    const parentPath = this.pathSystem.dirname(this.path)
    const parentName =
      parentPath === "." ? "" : this.pathSystem.basename(parentPath)
    return new DocDirectoryPathValue(
      {
        path: parentPath,
        name: parentName,
        fullPath: this.pathSystem.dirname(this.fullPath),
      },
      this.pathSystem,
    )
  }

  /**
   * Parent directory path
   */
  get parentPath(): string {
    return this.pathSystem.dirname(this.path)
  }

  /**
   * Depth (number of directory levels)
   */
  get depth(): number {
    if (this.path === "." || this.path === "") {
      return 0
    }
    return this.path.split(this.pathSystem.separator).filter(Boolean).length
  }

  /**
   * Path segments (array of directories)
   */
  get segments(): string[] {
    return this.path.split(this.pathSystem.separator).filter(Boolean)
  }

  /**
   * Relative path from root (without leading slash)
   */
  get normalizedPath(): string {
    return this.path.replace(/^\/+/, "")
  }

  /**
   * Whether this is an archive directory (directory name is "_")
   */
  get isArchived(): boolean {
    return this.name === "_"
  }

  /**
   * Whether this is a hidden directory
   */
  get isHidden(): boolean {
    return this.name.startsWith(".")
  }

  /**
   * Whether this is the root directory
   */
  get isRoot(): boolean {
    return this.path === "." || this.path === ""
  }

  /**
   * Absolute path
   */
  get fullPath(): string {
    return this.value.fullPath
  }

  /**
   * Get index file path
   */
  get indexFile(): DocFilePathValue {
    return DocFilePathValue.fromPathWithSystem(
      this.pathSystem.join(this.path, "index.md"),
      this.pathSystem,
      this.pathSystem.dirname(this.fullPath),
    )
  }

  /**
   * Create file path
   */
  file(fileName: string): DocFilePathValue {
    return DocFilePathValue.fromPathWithSystem(
      this.pathSystem.join(this.path, fileName),
      this.pathSystem,
      this.pathSystem.dirname(this.fullPath),
    )
  }

  /**
   * Create subdirectory path
   */
  subdirectory(directoryName: string): DocDirectoryPathValue {
    const subPath = this.pathSystem.join(this.path, directoryName)
    return new DocDirectoryPathValue(
      {
        path: subPath,
        name: directoryName,
        fullPath: this.pathSystem.join(this.fullPath, directoryName),
      },
      this.pathSystem,
    )
  }

  /**
   * Create instance from relative path (DI support)
   */
  static fromPathWithSystem(
    dirPath: string,
    basePath: string,
    pathSystem: DocPathSystem,
  ): DocDirectoryPathValue {
    const name = dirPath === "." ? "" : pathSystem.basename(dirPath)
    const fullPath =
      dirPath === "." ? basePath : pathSystem.join(basePath, dirPath)

    return new DocDirectoryPathValue(
      {
        path: dirPath,
        name,
        fullPath,
      },
      pathSystem,
    )
  }

  /**
   * Export as JSON format
   */
  toJson(): Value {
    return this.value
  }

  /**
   * Check if paths are equal
   */
  equals(other: DocDirectoryPathValue): boolean {
    return this.path === other.path
  }

  /**
   * Check if specified directory is a descendant of this directory
   */
  contains(other: DocDirectoryPathValue): boolean {
    const relative = this.pathSystem.relative(this.path, other.path)
    return !relative.startsWith("..") && relative !== ""
  }
}
