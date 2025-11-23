import {
  zDocCustomSchemaField,
  zDocMetaFieldBoolean,
  zDocMetaFieldMultiNumber,
  zDocMetaFieldMultiRelation,
  zDocMetaFieldMultiSelectNumber,
  zDocMetaFieldMultiSelectText,
  zDocMetaFieldMultiText,
  zDocMetaFieldNumber,
  zDocMetaFieldRelation,
  zDocMetaFieldSelectNumber,
  zDocMetaFieldSelectText,
  zDocMetaFieldText,
} from "@/models"
import type { DocCustomSchemaField } from "@/types"
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

export class DocCustomSchemaFieldValue<T extends DocCustomSchemaField> {
  constructor(readonly value: T) {
    zDocCustomSchemaField.parse(value)
    Object.freeze(this)
  }

  validate(value: unknown) {
    if (this.value.type === "text") {
      try {
        return zDocMetaFieldText.parse(value)
      } catch {
        if (this.value.required) {
          return DocMetaFieldTextValue.defaultValue()
        }
        return null
      }
    }

    if (this.value.type === "number") {
      try {
        return zDocMetaFieldNumber.parse(value)
      } catch {
        if (this.value.required) {
          return DocMetaFieldNumberValue.defaultValue()
        }
        return null
      }
    }

    if (this.value.type === "boolean") {
      try {
        return zDocMetaFieldBoolean.parse(value)
      } catch {
        if (this.value.required) {
          return DocMetaFieldBooleanValue.defaultValue()
        }
        return null
      }
    }

    if (this.value.type === "select-text") {
      try {
        return zDocMetaFieldSelectText.parse(value)
      } catch {
        if (this.value.required) {
          return DocMetaFieldSelectTextValue.defaultValue()
        }
        return null
      }
    }

    if (this.value.type === "select-number") {
      try {
        return zDocMetaFieldSelectNumber.parse(value)
      } catch {
        if (this.value.required) {
          return DocMetaFieldSelectNumberValue.defaultValue()
        }
        return null
      }
    }

    if (this.value.type === "relation") {
      try {
        return zDocMetaFieldRelation.parse(value)
      } catch {
        if (this.value.required) {
          return DocMetaFieldRelationValue.defaultValue()
        }
        return null
      }
    }

    if (this.value.type === "multi-text") {
      try {
        return zDocMetaFieldMultiText.parse(value)
      } catch {
        if (this.value.required) {
          return DocMetaFieldMultiTextValue.defaultValue()
        }
        return null
      }
    }

    if (this.value.type === "multi-number") {
      try {
        return zDocMetaFieldMultiNumber.parse(value)
      } catch {
        if (this.value.required) {
          return DocMetaFieldMultiNumberValue.defaultValue()
        }
        return null
      }
    }

    if (this.value.type === "multi-select-text") {
      try {
        return zDocMetaFieldMultiSelectText.parse(value)
      } catch {
        if (this.value.required) {
          return DocMetaFieldMultiSelectTextValue.defaultValue()
        }
        return null
      }
    }

    if (this.value.type === "multi-select-number") {
      try {
        return zDocMetaFieldMultiSelectNumber.parse(value)
      } catch {
        if (this.value.required) {
          return DocMetaFieldMultiSelectNumberValue.defaultValue()
        }
        return null
      }
    }

    if (this.value.type === "multi-relation") {
      try {
        return zDocMetaFieldMultiRelation.parse(value)
      } catch {
        if (this.value.required) {
          return DocMetaFieldMultiRelationValue.defaultValue()
        }
        return null
      }
    }

    throw new Error("Unknown field type")
  }
}
