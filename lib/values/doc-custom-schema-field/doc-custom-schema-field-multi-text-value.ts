import {
  zDocCustomSchemaFieldMultiText,
  zDocMetaFieldMultiText,
} from "@/models"
import type {
  DocCustomSchemaFieldMultiText,
  DocMetaFieldMultiText,
  RecordKey,
} from "@/types"

export class DocCustomSchemaFieldMultiTextValue<K extends RecordKey> {
  constructor(
    readonly key: K,
    readonly value: DocCustomSchemaFieldMultiText,
  ) {
    zDocCustomSchemaFieldMultiText.parse(value)
    Object.freeze(this)
  }

  static from<K extends RecordKey>(
    key: K,
    required: boolean,
  ): DocCustomSchemaFieldMultiTextValue<K> {
    return new DocCustomSchemaFieldMultiTextValue<K>(key, {
      type: "multi-text",
      required,
    })
  }

  validate(value: unknown): DocMetaFieldMultiText {
    try {
      return zDocMetaFieldMultiText.parse(value)
    } catch {
      if (this.value.required) {
        throw new Error(
          `required field "${this.key.toString()}" is missing or invalid`,
        )
      }
      return DocCustomSchemaFieldMultiTextValue.defaultValue()
    }
  }

  defaultValue(): DocMetaFieldMultiText {
    return []
  }

  static defaultValue(): DocMetaFieldMultiText {
    return []
  }
}
