import { zDocMetaFieldMultiSelectText } from "@/models"
import type { DocMetaFieldMultiSelectText, RecordKey } from "@/types"

/**
 * Multiple select text type schema field
 */
export class DocMetaFieldMultiSelectTextValue<K extends RecordKey> {
  readonly type = "multi-select-text" as const

  constructor(
    readonly key: K,
    readonly value: DocMetaFieldMultiSelectText,
  ) {
    zDocMetaFieldMultiSelectText.parse(value)
    Object.freeze(this)
  }

  static from<K extends RecordKey>(
    key: K,
    value: unknown,
  ): DocMetaFieldMultiSelectTextValue<K> {
    return new DocMetaFieldMultiSelectTextValue<K>(
      key,
      zDocMetaFieldMultiSelectText.parse(value),
    )
  }

  static default<K extends RecordKey>(
    key: K,
  ): DocMetaFieldMultiSelectTextValue<K> {
    return new DocMetaFieldMultiSelectTextValue(key, [])
  }

  static defaultValue(): string[] {
    return []
  }
}
