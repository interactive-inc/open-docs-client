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
          throw new Error(`required field "${this.fieldType()}" is missing or invalid`)
        }
        return null
      }
    }

    if (this.value.type === "number") {
      try {
        return zDocMetaFieldNumber.parse(value)
      } catch {
        if (this.value.required) {
          throw new Error(`required field "${this.fieldType()}" is missing or invalid`)
        }
        return null
      }
    }

    if (this.value.type === "boolean") {
      try {
        return zDocMetaFieldBoolean.parse(value)
      } catch {
        if (this.value.required) {
          throw new Error(`required field "${this.fieldType()}" is missing or invalid`)
        }
        return null
      }
    }

    if (this.value.type === "select-text") {
      try {
        return zDocMetaFieldSelectText.parse(value)
      } catch {
        if (this.value.required) {
          throw new Error(`required field "${this.fieldType()}" is missing or invalid`)
        }
        return null
      }
    }

    if (this.value.type === "select-number") {
      try {
        return zDocMetaFieldSelectNumber.parse(value)
      } catch {
        if (this.value.required) {
          throw new Error(`required field "${this.fieldType()}" is missing or invalid`)
        }
        return null
      }
    }

    if (this.value.type === "relation") {
      try {
        return zDocMetaFieldRelation.parse(value)
      } catch {
        if (this.value.required) {
          throw new Error(`required field "${this.fieldType()}" is missing or invalid`)
        }
        return null
      }
    }

    if (this.value.type === "multi-text") {
      try {
        return zDocMetaFieldMultiText.parse(value)
      } catch {
        if (this.value.required) {
          throw new Error(`required field "${this.fieldType()}" is missing or invalid`)
        }
        return null
      }
    }

    if (this.value.type === "multi-number") {
      try {
        return zDocMetaFieldMultiNumber.parse(value)
      } catch {
        if (this.value.required) {
          throw new Error(`required field "${this.fieldType()}" is missing or invalid`)
        }
        return null
      }
    }

    if (this.value.type === "multi-select-text") {
      try {
        return zDocMetaFieldMultiSelectText.parse(value)
      } catch {
        if (this.value.required) {
          throw new Error(`required field "${this.fieldType()}" is missing or invalid`)
        }
        return null
      }
    }

    if (this.value.type === "multi-select-number") {
      try {
        return zDocMetaFieldMultiSelectNumber.parse(value)
      } catch {
        if (this.value.required) {
          throw new Error(`required field "${this.fieldType()}" is missing or invalid`)
        }
        return null
      }
    }

    if (this.value.type === "multi-relation") {
      try {
        return zDocMetaFieldMultiRelation.parse(value)
      } catch {
        if (this.value.required) {
          throw new Error(`required field "${this.fieldType()}" is missing or invalid`)
        }
        return null
      }
    }

    throw new Error("Unknown field type")
  }

  private fieldType(): string {
    return this.value.type
  }
}
