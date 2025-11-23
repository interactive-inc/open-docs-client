import {
  zDocCustomSchemaFieldMultiNumber,
  zDocMetaFieldMultiNumber,
} from "@/models"
import type {
  DocCustomSchemaFieldMultiNumber,
  DocMetaFieldMultiNumber,
  RecordKey,
} from "@/types"

export class DocCustomSchemaFieldMultiNumberValue<K extends RecordKey> {
  constructor(
    readonly key: K,
    readonly value: DocCustomSchemaFieldMultiNumber,
  ) {
    zDocCustomSchemaFieldMultiNumber.parse(value)
    Object.freeze(this)
  }

  static from<K extends RecordKey>(
    key: K,
    required: boolean,
  ): DocCustomSchemaFieldMultiNumberValue<K> {
    return new DocCustomSchemaFieldMultiNumberValue<K>(key, {
      type: "multi-number",
      required,
    })
  }

  validate(value: unknown): DocMetaFieldMultiNumber {
    try {
      return zDocMetaFieldMultiNumber.parse(value)
    } catch {
      if (this.value.required) {
        throw new Error(
          `required field "${this.key.toString()}" is missing or invalid`,
        )
      }
      return DocCustomSchemaFieldMultiNumberValue.defaultValue()
    }
  }

  defaultValue(): DocMetaFieldMultiNumber {
    return []
  }

  static defaultValue(): DocMetaFieldMultiNumber {
    return []
  }
}
