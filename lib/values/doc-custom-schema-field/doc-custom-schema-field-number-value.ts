import { zDocCustomSchemaFieldNumber, zDocMetaFieldNumber } from "@/models"
import type {
  DocCustomSchemaFieldNumber,
  DocMetaFieldNumber,
  RecordKey,
} from "@/types"

export class DocCustomSchemaFieldNumberValue<K extends RecordKey> {
  constructor(
    readonly key: K,
    readonly value: DocCustomSchemaFieldNumber,
  ) {
    zDocCustomSchemaFieldNumber.parse(value)
    Object.freeze(this)
  }

  static from<K extends RecordKey>(
    key: K,
    required: boolean,
  ): DocCustomSchemaFieldNumberValue<K> {
    return new DocCustomSchemaFieldNumberValue<K>(key, {
      type: "number",
      required,
    })
  }

  validate(value: unknown): DocMetaFieldNumber {
    try {
      return zDocMetaFieldNumber.parse(value)
    } catch {
      if (this.value.required) {
        throw new Error(
          `required field "${this.key.toString()}" is missing or invalid`,
        )
      }
      return DocCustomSchemaFieldNumberValue.defaultValue()
    }
  }

  defaultValue(): DocMetaFieldNumber {
    return 0
  }

  static defaultValue(): DocMetaFieldNumber {
    return 0
  }
}
