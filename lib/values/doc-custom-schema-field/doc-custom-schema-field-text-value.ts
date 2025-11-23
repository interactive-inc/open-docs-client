import { zDocCustomSchemaFieldText, zDocMetaFieldText } from "@/models"
import type {
  DocCustomSchemaFieldText,
  DocMetaFieldText,
  RecordKey,
} from "@/types"

export class DocCustomSchemaFieldTextValue<K extends RecordKey> {
  constructor(
    readonly key: K,
    readonly value: DocCustomSchemaFieldText,
  ) {
    zDocCustomSchemaFieldText.parse(value)
    Object.freeze(this)
  }

  static from<K extends RecordKey>(
    key: K,
    required: boolean,
  ): DocCustomSchemaFieldTextValue<K> {
    return new DocCustomSchemaFieldTextValue<K>(key, {
      type: "text",
      required,
    })
  }

  validate(value: unknown): DocMetaFieldText {
    try {
      return zDocMetaFieldText.parse(value)
    } catch {
      if (this.value.required) {
        throw new Error(
          `required field "${this.key.toString()}" is missing or invalid`,
        )
      }
      return DocCustomSchemaFieldTextValue.defaultValue()
    }
  }

  defaultValue(): DocMetaFieldText {
    return ""
  }

  static defaultValue(): DocMetaFieldText {
    return ""
  }
}
