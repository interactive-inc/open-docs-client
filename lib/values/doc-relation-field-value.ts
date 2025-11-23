import { zDocRelationField } from "@/models"
import type { DocRelationField } from "@/types"

/**
 * Relation field
 */
export class DocRelationFieldValue {
  constructor(private readonly value: DocRelationField) {
    zDocRelationField.parse(value)
    Object.freeze(this)
  }

  /**
   * Get field name
   */
  get fieldName() {
    return this.value.fieldName
  }

  /**
   * Get relation target path
   */
  get relationPath() {
    return this.value.filePath
  }

  /**
   * Get whether it's an array type
   */
  get isArray() {
    return this.value.isArray
  }

  /**
   * Check if it's a single relation
   */
  get isSingle() {
    return !this.value.isArray
  }

  /**
   * Check if it's a multiple relation
   */
  get isMultiple() {
    return this.value.isArray
  }

  /**
   * Get target directory name
   */
  get targetDirectoryName() {
    const parts = this.value.filePath.split("/")
    return parts[parts.length - 1] || ""
  }

  /**
   * Generate full relation path
   */
  fullPath(basePath: string): string {
    if (this.value.filePath.startsWith("/")) {
      return this.value.filePath
    }
    return `${basePath}/${this.value.filePath}`
  }

  /**
   * Check equality
   */
  equals(other: DocRelationFieldValue): boolean {
    return (
      this.fieldName === other.fieldName &&
      this.relationPath === other.relationPath &&
      this.isArray === other.isArray
    )
  }

  /**
   * Convert to JSON format
   */
  toJson(): DocRelationField {
    return { ...this.value }
  }

  /**
   * Create from data
   */
  static from(data: unknown): DocRelationFieldValue {
    const validated = zDocRelationField.parse(data)
    return new DocRelationFieldValue(validated)
  }

  /**
   * Create from properties
   */
  static fromProps(props: {
    fieldName: string
    filePath: string
    isArray: boolean
  }): DocRelationFieldValue {
    return new DocRelationFieldValue(props)
  }
}
