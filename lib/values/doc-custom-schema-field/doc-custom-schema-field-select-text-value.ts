import {
  zDocCustomSchemaFieldSelectText,
  zDocMetaFieldSelectText,
} from "@/models"
import type {
  DocCustomSchemaFieldSelectText,
  DocMetaFieldSelectText,
  RecordKey,
} from "@/types"

export class DocCustomSchemaFieldSelectTextValue<K extends RecordKey> {
  constructor(
    readonly key: K,
    readonly value: DocCustomSchemaFieldSelectText,
  ) {
    zDocCustomSchemaFieldSelectText.parse(value)
    Object.freeze(this)
  }

  static from<K extends RecordKey>(
    key: K,
    required: boolean,
  ): DocCustomSchemaFieldSelectTextValue<K> {
    return new DocCustomSchemaFieldSelectTextValue<K>(key, {
      type: "select-text",
      required,
    })
  }

  validate(value: unknown): DocMetaFieldSelectText {
    try {
      return zDocMetaFieldSelectText.parse(value)
    } catch {
      if (this.value.required) {
        throw new Error(
          `required field "${this.key.toString()}" is missing or invalid`,
        )
      }
      return DocCustomSchemaFieldSelectTextValue.defaultValue()
    }
  }

  defaultValue(): DocMetaFieldSelectText {
    return null
  }

  static defaultValue(): DocMetaFieldSelectText {
    return null
  }
}
