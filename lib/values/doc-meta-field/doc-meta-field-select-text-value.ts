import { zDocMetaFieldSelectText } from "@/models"
import type { DocMetaFieldSelectText, RecordKey } from "@/types"

/**
 * Single select text type schema field
 */
export class DocMetaFieldSelectTextValue<K extends RecordKey> {
  readonly type = "select-text" as const

  constructor(
    readonly key: K,
    readonly value: DocMetaFieldSelectText,
  ) {
    zDocMetaFieldSelectText.parse(value)
    Object.freeze(this)
  }

  static from<K extends RecordKey>(
    key: K,
    value: unknown,
  ): DocMetaFieldSelectTextValue<K> {
    return new DocMetaFieldSelectTextValue<K>(
      key,
      zDocMetaFieldSelectText.parse(value),
    )
  }

  static default<K extends RecordKey>(key: K): DocMetaFieldSelectTextValue<K> {
    return new DocMetaFieldSelectTextValue(key, null)
  }

  static defaultValue(): string[] {
    return []
  }
}
