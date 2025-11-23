import { zDocMetaFieldType } from "@/models"
import type { DocMetaFieldType, RecordKey } from "@/types"

/**
 * Schema field type
 */
export class DocSchemaFieldTypeValue<_T extends RecordKey> {
  constructor(private readonly value: DocMetaFieldType) {
    zDocMetaFieldType.parse(value)
    Object.freeze(this)
  }

  /**
   * Get the type value
   */
  get type(): DocMetaFieldType {
    return this.value
  }

  /**
   * Check if text type
   */
  get isText(): boolean {
    return this.value === "text"
  }

  /**
   * Check if number type
   */
  get isNumber(): boolean {
    return this.value === "number"
  }

  /**
   * Check if boolean type
   */
  get isBoolean(): boolean {
    return this.value === "boolean"
  }

  /**
   * Check if select type (single)
   */
  get isSelect(): boolean {
    return this.value === "select-text" || this.value === "select-number"
  }

  /**
   * Check if relation type
   */
  get isRelation(): boolean {
    return this.value === "relation" || this.value === "multi-relation"
  }

  /**
   * Check if array type
   */
  get isArray(): boolean {
    return (
      this.value === "multi-text" ||
      this.value === "multi-number" ||
      this.value === "multi-relation" ||
      this.value === "multi-select-text" ||
      this.value === "multi-select-number"
    )
  }

  /**
   * Check if single value type
   */
  get isSingle(): boolean {
    return !this.isArray
  }

  /**
   * Get base type (e.g., text for multi-text)
   */
  get baseType(): string {
    if (this.value.startsWith("multi-")) {
      return this.value.replace("multi-", "")
    }
    if (this.value.startsWith("select-")) {
      return this.value.replace("select-", "")
    }
    return this.value
  }

  /**
   * Get default value
   */
  getDefaultValue(): unknown {
    if (this.isArray) return []
    if (this.isText) return ""
    if (this.isNumber) return 0
    if (this.isBoolean) return false
    if (this.isRelation) return ""
    return ""
  }

  /**
   * Validate value
   */
  validateValue(value: unknown): boolean {
    if (this.isArray) {
      if (!Array.isArray(value)) return false
      const baseType = this.baseType
      return value.every((item) => {
        if (baseType === "text") return typeof item === "string"
        if (baseType === "number") return typeof item === "number"
        if (baseType === "boolean") return typeof item === "boolean"
        return true
      })
    }

    if (this.isText) return typeof value === "string"
    if (this.isNumber) return typeof value === "number"
    if (this.isBoolean) return typeof value === "boolean"
    if (this.isRelation) return typeof value === "string"

    return true
  }

  /**
   * Create from string
   */
  static from<_T>(type: string): DocSchemaFieldTypeValue<string> {
    const validatedType = zDocMetaFieldType.parse(type)
    return new DocSchemaFieldTypeValue(validatedType)
  }

  /**
   * Convert to JSON format
   */
  toJson(): DocMetaFieldType {
    return this.value
  }
}
