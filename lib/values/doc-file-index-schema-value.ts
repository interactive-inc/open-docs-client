import { zDocFileIndexSchema } from "@/models"
import type { DocCustomSchema, DocFileIndexSchema } from "@/types"
import { DocSchemaFieldBooleanValue } from "@/values/doc-schema-field/doc-schema-field-boolean-value"
import { DocSchemaFieldMultiRelationValue } from "@/values/doc-schema-field/doc-schema-field-multi-relation-value"
import { DocSchemaFieldMultiSelectNumberValue } from "@/values/doc-schema-field/doc-schema-field-multi-select-number-value"
import { DocSchemaFieldMultiSelectTextValue } from "@/values/doc-schema-field/doc-schema-field-multi-select-text-value"
import { DocSchemaFieldMultiTextValue } from "@/values/doc-schema-field/doc-schema-field-multi-text-value"
import { DocSchemaFieldNumberValue } from "@/values/doc-schema-field/doc-schema-field-number-value"
import { DocSchemaFieldRelationValue } from "@/values/doc-schema-field/doc-schema-field-relation-value"
import { DocSchemaFieldSelectNumberValue } from "@/values/doc-schema-field/doc-schema-field-select-number-value"
import { DocSchemaFieldSelectTextValue } from "@/values/doc-schema-field/doc-schema-field-select-text-value"
import { DocSchemaFieldTextValue } from "@/values/doc-schema-field/doc-schema-field-text-value"
import { DocSchemaFieldMultiNumberValue } from "./doc-schema-field/doc-schema-field-multi-number-value"

/**
 * Type-safe schema value object
 */
export class DocFileIndexSchemaValue<T extends DocCustomSchema> {
  constructor(
    readonly value: DocFileIndexSchema<keyof T>,
    readonly customSchema: T,
  ) {
    zDocFileIndexSchema.parse(this.value)
    Object.freeze(this.value)
    Object.freeze(this)
  }

  /**
   * Get list of field names
   * Automatically type-safe when using Zod schema
   */
  get fieldNames(): Array<keyof T> {
    return Object.keys(this.value) as Array<keyof T>
  }

  /**
   * Get field with specified field name
   * Returns type-safe specific field Value object
   */
  field<K extends keyof T>(
    key: K,
  ): T[K]["type"] extends infer Type
    ? Type extends "text"
      ? DocSchemaFieldTextValue<K>
      : Type extends "number"
        ? DocSchemaFieldNumberValue<K>
        : Type extends "boolean"
          ? DocSchemaFieldBooleanValue<K>
          : Type extends "relation"
            ? DocSchemaFieldRelationValue<K>
            : Type extends "select-text"
              ? DocSchemaFieldSelectTextValue<K>
              : Type extends "select-number"
                ? DocSchemaFieldSelectNumberValue<K>
                : Type extends "multi-text"
                  ? DocSchemaFieldMultiTextValue<K>
                  : Type extends "multi-number"
                    ? DocSchemaFieldMultiNumberValue<K>
                    : Type extends "multi-relation"
                      ? DocSchemaFieldMultiRelationValue<K>
                      : Type extends "multi-select-text"
                        ? DocSchemaFieldMultiSelectTextValue<K>
                        : Type extends "multi-select-number"
                          ? DocSchemaFieldMultiSelectNumberValue<K>
                          : never
    : never {
    const fieldValue = this.value[key]

    if (!fieldValue) {
      throw new Error(`Field "${key as string}" not found in schema`)
    }

    if (fieldValue.type === "text") {
      return new DocSchemaFieldTextValue(key, fieldValue) as never
    }

    if (fieldValue.type === "number") {
      return new DocSchemaFieldNumberValue(key, fieldValue) as never
    }

    if (fieldValue.type === "boolean") {
      return new DocSchemaFieldBooleanValue(key, fieldValue) as never
    }

    if (fieldValue.type === "relation") {
      return new DocSchemaFieldRelationValue(key, fieldValue) as never
    }

    if (fieldValue.type === "select-text") {
      return new DocSchemaFieldSelectTextValue(key, fieldValue) as never
    }

    if (fieldValue.type === "select-number") {
      return new DocSchemaFieldSelectNumberValue(key, fieldValue) as never
    }

    if (fieldValue.type === "multi-text") {
      return new DocSchemaFieldMultiTextValue(key, fieldValue) as never
    }

    if (fieldValue.type === "multi-number") {
      return new DocSchemaFieldMultiNumberValue(key, fieldValue) as never
    }

    if (fieldValue.type === "multi-relation") {
      return new DocSchemaFieldMultiRelationValue(key, fieldValue) as never
    }

    if (fieldValue.type === "multi-select-text") {
      return new DocSchemaFieldMultiSelectTextValue(key, fieldValue) as never
    }

    if (fieldValue.type === "multi-select-number") {
      return new DocSchemaFieldMultiSelectNumberValue(key, fieldValue) as never
    }

    throw new Error("Unknown field type")
  }

  relation<K extends keyof T>(key: K): DocSchemaFieldRelationValue<K> {
    const fieldValue = this.value[key]
    if (!fieldValue) {
      throw new Error(`Field "${key as string}" not found in schema`)
    }

    if (fieldValue.type !== "relation") {
      throw new Error(`Field "${key as string}" is not a relation field.`)
    }

    return new DocSchemaFieldRelationValue(key, fieldValue)
  }

  multiRelation<K extends keyof T>(
    key: K,
  ): DocSchemaFieldMultiRelationValue<K> {
    const fieldValue = this.value[key]
    if (!fieldValue) {
      throw new Error(`Field "${key as string}" not found in schema`)
    }

    if (fieldValue.type !== "multi-relation") {
      throw new Error(`Field "${key as string}" is not a multi-relation field.`)
    }

    return new DocSchemaFieldMultiRelationValue(key, fieldValue)
  }

  toJson(): DocFileIndexSchema<keyof T> {
    return this.value
  }

  /**
   * Create empty schema entity
   * biome-ignore lint/complexity/noBannedTypes: {} as DocCustomSchema
   */
  static empty(): DocFileIndexSchemaValue<{}> {
    return new DocFileIndexSchemaValue({}, {})
  }
}
