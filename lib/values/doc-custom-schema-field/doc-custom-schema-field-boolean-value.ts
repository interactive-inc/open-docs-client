import { zDocCustomSchemaFieldBoolean, zDocMetaFieldBoolean } from "@/models"
import type {
  DocCustomSchemaFieldBoolean,
  DocMetaFieldBoolean,
  RecordKey,
} from "@/types"

export class DocCustomSchemaFieldBooleanValue<K extends RecordKey> {
  constructor(
    readonly key: K,
    readonly value: DocCustomSchemaFieldBoolean,
  ) {
    zDocCustomSchemaFieldBoolean.parse(value)
    Object.freeze(this)
  }

  static from<K extends RecordKey>(
    key: K,
    required: boolean,
  ): DocCustomSchemaFieldBooleanValue<K> {
    return new DocCustomSchemaFieldBooleanValue<K>(key, {
      type: "boolean",
      required,
    })
  }

  validate(value: unknown): DocMetaFieldBoolean {
    try {
      return zDocMetaFieldBoolean.parse(value)
    } catch {
      if (this.value.required) {
        throw new Error(
          `required field "${this.key.toString()}" is missing or invalid`,
        )
      }
      return DocCustomSchemaFieldBooleanValue.defaultValue()
    }
  }

  defaultValue(): DocMetaFieldBoolean {
    return false
  }

  static defaultValue(): DocMetaFieldBoolean {
    return false
  }
}
