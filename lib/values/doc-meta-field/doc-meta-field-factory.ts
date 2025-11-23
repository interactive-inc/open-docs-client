import type { DocMetaFieldType, RecordKey } from "@/types"
import { DocMetaFieldBooleanValue } from "@/values/doc-meta-field/doc-meta-field-boolean-value"
import { DocMetaFieldMultiNumberValue } from "@/values/doc-meta-field/doc-meta-field-multi-number-value"
import { DocMetaFieldMultiRelationValue } from "@/values/doc-meta-field/doc-meta-field-multi-relation-value"
import { DocMetaFieldMultiSelectNumberValue } from "@/values/doc-meta-field/doc-meta-field-multi-select-number-value"
import { DocMetaFieldMultiSelectTextValue } from "@/values/doc-meta-field/doc-meta-field-multi-select-text-value"
import { DocMetaFieldMultiTextValue } from "@/values/doc-meta-field/doc-meta-field-multi-text-value"
import { DocMetaFieldNumberValue } from "@/values/doc-meta-field/doc-meta-field-number-value"
import { DocMetaFieldRelationValue } from "@/values/doc-meta-field/doc-meta-field-relation-value"
import { DocMetaFieldSelectNumberValue } from "@/values/doc-meta-field/doc-meta-field-select-number-value"
import { DocMetaFieldSelectTextValue } from "@/values/doc-meta-field/doc-meta-field-select-text-value"
import { DocMetaFieldTextValue } from "@/values/doc-meta-field/doc-meta-field-text-value"
import type { DocMetaFieldValue } from "@/values/doc-meta-field/doc-meta-field-value"

export class DocMetaFieldFactory {
  fromType<K extends RecordKey, T extends DocMetaFieldType>(
    key: K,
    type: T,
    value: unknown,
  ): DocMetaFieldValue<K> {
    if (type === "text") {
      return DocMetaFieldTextValue.from(key, value)
    }

    if (type === "number") {
      return DocMetaFieldNumberValue.from(key, value)
    }

    if (type === "boolean") {
      return DocMetaFieldBooleanValue.from(key, value)
    }

    if (type === "select-text") {
      return DocMetaFieldSelectTextValue.from(key, value)
    }

    if (type === "select-number") {
      return DocMetaFieldSelectNumberValue.from(key, value)
    }

    if (type === "relation") {
      return DocMetaFieldRelationValue.from(key, value)
    }

    if (type === "multi-text") {
      return DocMetaFieldMultiTextValue.from(key, value)
    }

    if (type === "multi-number") {
      return DocMetaFieldMultiNumberValue.from(key, value)
    }

    if (type === "multi-select-text") {
      return DocMetaFieldMultiSelectTextValue.from(key, value)
    }

    if (type === "multi-select-number") {
      return DocMetaFieldMultiSelectNumberValue.from(key, value)
    }

    if (type === "multi-relation") {
      return DocMetaFieldMultiRelationValue.from(key, value)
    }

    throw new Error(`Unknown field type: ${type}`)
  }

  defaultValue(type: DocMetaFieldType) {
    if (type === "text") {
      return DocMetaFieldTextValue.defaultValue()
    }

    if (type === "number") {
      return DocMetaFieldNumberValue.defaultValue()
    }

    if (type === "boolean") {
      return DocMetaFieldBooleanValue.defaultValue()
    }

    if (type === "select-text") {
      return DocMetaFieldSelectTextValue.defaultValue()
    }

    if (type === "select-number") {
      return DocMetaFieldSelectNumberValue.defaultValue()
    }

    if (type === "relation") {
      return DocMetaFieldRelationValue.defaultValue()
    }

    if (type === "multi-text") {
      return DocMetaFieldMultiTextValue.defaultValue()
    }

    if (type === "multi-number") {
      return DocMetaFieldMultiNumberValue.defaultValue()
    }

    if (type === "multi-select-text") {
      return DocMetaFieldMultiSelectTextValue.defaultValue()
    }

    if (type === "multi-select-number") {
      return DocMetaFieldMultiSelectNumberValue.defaultValue()
    }

    if (type === "multi-relation") {
      return DocMetaFieldMultiRelationValue.defaultValue()
    }

    throw new Error(`Unknown field type: ${type}`)
  }
}
