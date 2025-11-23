import {
  zDocCustomSchemaFieldMultiSelectText,
  zDocMetaFieldMultiSelectText,
} from "@/models"
import type {
  DocCustomSchemaFieldMultiSelectText,
  DocMetaFieldMultiSelectText,
  RecordKey,
} from "@/types"

export class DocCustomSchemaFieldMultiSelectTextValue<K extends RecordKey> {
  constructor(
    readonly key: K,
    readonly value: DocCustomSchemaFieldMultiSelectText,
  ) {
    zDocCustomSchemaFieldMultiSelectText.parse(value)
    Object.freeze(this)
  }

  static from<K extends RecordKey>(
    key: K,
    required: boolean,
  ): DocCustomSchemaFieldMultiSelectTextValue<K> {
    return new DocCustomSchemaFieldMultiSelectTextValue<K>(key, {
      type: "multi-select-text",
      required,
    })
  }

  validate(value: unknown): DocMetaFieldMultiSelectText {
    try {
      return zDocMetaFieldMultiSelectText.parse(value)
    } catch {
      if (this.value.required) {
        throw new Error(
          `required field "${this.key.toString()}" is missing or invalid`,
        )
      }
      return DocCustomSchemaFieldMultiSelectTextValue.defaultValue()
    }
  }

  defaultValue(): DocMetaFieldMultiSelectText {
    return []
  }

  static defaultValue(): DocMetaFieldMultiSelectText {
    return []
  }
}
