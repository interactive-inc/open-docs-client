import {
  zDocCustomSchemaFieldMultiSelectNumber,
  zDocMetaFieldMultiSelectNumber,
} from "@/models"
import type {
  DocCustomSchemaFieldMultiSelectNumber,
  DocMetaFieldMultiSelectNumber,
  RecordKey,
} from "@/types"

export class DocCustomSchemaFieldMultiSelectNumberValue<K extends RecordKey> {
  constructor(
    readonly key: K,
    readonly value: DocCustomSchemaFieldMultiSelectNumber,
  ) {
    zDocCustomSchemaFieldMultiSelectNumber.parse(value)
    Object.freeze(this)
  }

  static from<K extends RecordKey>(
    key: K,
    required: boolean,
  ): DocCustomSchemaFieldMultiSelectNumberValue<K> {
    return new DocCustomSchemaFieldMultiSelectNumberValue<K>(key, {
      type: "multi-select-number",
      required,
    })
  }

  validate(value: unknown): DocMetaFieldMultiSelectNumber {
    try {
      return zDocMetaFieldMultiSelectNumber.parse(value)
    } catch {
      if (this.value.required) {
        throw new Error(
          `required field "${this.key.toString()}" is missing or invalid`,
        )
      }
      return DocCustomSchemaFieldMultiSelectNumberValue.defaultValue()
    }
  }

  defaultValue(): DocMetaFieldMultiSelectNumber {
    return []
  }

  static defaultValue(): DocMetaFieldMultiSelectNumber {
    return []
  }
}
