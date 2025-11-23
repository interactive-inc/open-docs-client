import { zDocRelation } from "@/models"
import type { DocRelation } from "@/types"
import { DocRelationFileValue } from "./doc-relation-file-value"

/**
 * Manages relation information
 */
export class DocRelationValue {
  constructor(readonly value: DocRelation) {
    zDocRelation.parse(value)
    Object.freeze(this)
    Object.freeze(this.value)
  }

  /**
   * Relation path
   */
  get path(): string {
    return this.value.path
  }

  /**
   * Get file count
   */
  get fileCount(): number {
    return this.files().length
  }

  /**
   * Whether it's empty
   */
  get isEmpty(): boolean {
    return this.files().length === 0
  }

  /**
   * List of related files (value objects)
   */
  files(): DocRelationFileValue[] {
    return this.value.files.map((file) => new DocRelationFileValue(file))
  }

  /**
   * Export as JSON format
   */
  toJson(): DocRelation {
    return {
      path: this.path,
      files: this.files().map((file) => file.toJson()),
    }
  }

  /**
   * Create empty relation entity
   */
  static empty(path: string): DocRelationValue {
    return new DocRelationValue({
      path,
      files: [],
    })
  }
}
