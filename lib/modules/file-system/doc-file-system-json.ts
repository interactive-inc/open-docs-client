import { z } from "zod"
import type { DocPathSystem } from "../path-system/doc-path-system"
import { DocFileSystem } from "./doc-file-system"
import { DocFileSystemJsonRead } from "./doc-file-system-json-read"
import { DocFileSystemJsonWrite } from "./doc-file-system-json-write"

const zJsonDocumentData = z.record(z.string(), z.string())
type JsonDocumentData = z.infer<typeof zJsonDocumentData>

type JsonProps = {
  data?: JsonDocumentData | unknown
  basePath?: string
  pathSystem?: DocPathSystem
  onDataChange?: (data: JsonDocumentData) => void
}

/**
 * JSON-based file system with separate read/write components
 */
export class DocFileSystemJson extends DocFileSystem {
  private readonly jsonReader: DocFileSystemJsonRead
  private readonly jsonWriter: DocFileSystemJsonWrite

  constructor(props: JsonProps = {}) {
    // Create JSON read implementation
    const reader = new DocFileSystemJsonRead({
      data: props.data,
      basePath: props.basePath,
      pathSystem: props.pathSystem,
    })

    // Create JSON write implementation with reader
    const writer = new DocFileSystemJsonWrite({
      data: props.data,
      pathSystem: props.pathSystem,
      reader,
      onDataChange: props.onDataChange,
    })

    // Call parent constructor with reader and writer
    super({
      basePath: props.basePath ?? "docs",
      pathSystem: props.pathSystem,
      reader,
      writer,
    })

    this.jsonReader = reader
    this.jsonWriter = writer
    Object.freeze(this)
  }

  /**
   * Get the current JSON data
   */
  getData(): JsonDocumentData {
    return this.jsonWriter.getData()
  }

  /**
   * Update the entire JSON data
   */
  setData(data: JsonDocumentData | unknown): Error | null {
    return this.jsonWriter.setData(data)
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.jsonWriter.clear()
  }

  /**
   * Get all file paths in the JSON data
   */
  getAllFilePaths(): string[] {
    return this.jsonReader.getAllFilePaths()
  }

  /**
   * Get the raw JSON data (read-only copy)
   */
  getRawData(): JsonDocumentData {
    return this.jsonReader.getRawData()
  }

  /**
   * Create from docs-to-json format
   */
  static fromDocsToJson(
    data: Record<string, string> | unknown,
    options: Omit<JsonProps, "data"> = {},
  ): DocFileSystemJson {
    return new DocFileSystemJson({
      ...options,
      data,
    })
  }

  /**
   * Export to docs-to-json format
   */
  toDocsToJson(): Record<string, string> {
    return this.getData()
  }
}
