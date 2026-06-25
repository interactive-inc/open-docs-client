import { z } from "zod"
import type { DocPathSystem } from "../path-system/doc-path-system"
import { DocFileSystem } from "./doc-file-system"
import { DocFileSystemJsonRead } from "./doc-file-system-json-read"
import { DocFileSystemJsonStore } from "./doc-file-system-json-store"
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
    // Shared mutable store: reader と writer が同一データを参照する
    const store = new DocFileSystemJsonStore({ data: props.data })

    // Create JSON read implementation
    const reader = new DocFileSystemJsonRead({
      store,
      basePath: props.basePath,
      pathSystem: props.pathSystem,
    })

    // Create JSON write implementation with reader
    const writer = new DocFileSystemJsonWrite({
      store,
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
