import {
  zDocCustomSchemaFieldSelectNumber,
  zDocMetaFieldSelectNumber,
} from "@/models"
import type {
  DocCustomSchemaFieldSelectNumber,
  DocMetaFieldSelectNumber,
  RecordKey,
} from "@/types"

export class DocCustomSchemaFieldSelectNumberValue<K extends RecordKey> {
  constructor(
    readonly key: K,
    readonly value: DocCustomSchemaFieldSelectNumber,
  ) {
    zDocCustomSchemaFieldSelectNumber.parse(value)
    Object.freeze(this)
  }

  static from<K extends RecordKey>(
    key: K,
    required: boolean,
  ): DocCustomSchemaFieldSelectNumberValue<K> {
    return new DocCustomSchemaFieldSelectNumberValue<K>(key, {
      type: "select-number",
      required,
    })
  }

  validate(value: unknown): DocMetaFieldSelectNumber {
    try {
      return zDocMetaFieldSelectNumber.parse(value)
    } catch {
      if (this.value.required) {
        throw new Error(
          `required field "${this.key.toString()}" is missing or invalid`,
        )
      }
      return DocCustomSchemaFieldSelectNumberValue.defaultValue()
    }
  }

  defaultValue(): DocMetaFieldSelectNumber {
    return null
  }

  static defaultValue(): DocMetaFieldSelectNumber {
    return null
  }
}
