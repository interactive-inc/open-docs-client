import { zDocFilePath } from "@/models"
import type { DocFilePath } from "@/types"
import type { DocPathSystem } from "../modules/path-system/doc-path-system"

/**
 * Value object for file path information
 */
export class DocFilePathValue {
  private readonly pathSystem: DocPathSystem

  constructor(
    readonly value: DocFilePath,
    pathSystem: DocPathSystem,
  ) {
    zDocFilePath.parse(value)
    this.pathSystem = pathSystem
    Object.freeze(this)
  }

  /**
   * File name without extension
   */
  get name(): string {
    return this.value.name
  }

  /**
   * File path (relative path)
   */
  get path(): string {
    return this.value.path
  }

  /**
   * File name with extension
   */
  get nameWithExtension(): string {
    return this.value.nameWithExtension
  }

  /**
   * Full path (absolute path)
   */
  get fullPath(): string {
    return this.value.fullPath
  }

  /**
   * Directory path
   */
  get directoryPath(): string {
    return this.pathSystem.dirname(this.path)
  }

  /**
   * Extension
   */
  get extension(): string {
    return this.pathSystem.extname(this.nameWithExtension)
  }

  /**
   * Whether the file is archived
   */
  get isArchived(): boolean {
    return this.path.includes("/.archive/")
  }

  /**
   * Export as JSON format
   */
  toJson(): DocFilePath {
    return this.value
  }

  /**
   * Create instance from relative path (DI support)
   */
  static fromPathWithSystem(
    filePath: string,
    pathSystem: DocPathSystem,
    basePath?: string,
  ): DocFilePathValue {
    const nameWithExtension = pathSystem.basename(filePath)
    let name = pathSystem.basename(filePath, pathSystem.extname(filePath))

    if (name === "index" && filePath.includes("/")) {
      const parentDir = pathSystem.dirname(filePath)
      name = pathSystem.basename(parentDir)
    }

    const fullPath = basePath
      ? pathSystem.join(basePath, filePath)
      : pathSystem.resolve(filePath)

    return new DocFilePathValue(
      {
        name,
        path: filePath,
        fullPath,
        nameWithExtension,
      },
      pathSystem,
    )
  }
}
