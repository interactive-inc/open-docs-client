import { zDocMetaFieldMultiText } from "@/models"
import type { DocMetaFieldMultiText, RecordKey } from "@/types"

/**
 * Multiple text type schema field
 */
export class DocMetaFieldMultiTextValue<K extends RecordKey> {
  readonly type = "multi-text" as const

  constructor(
    readonly key: K,
    readonly value: DocMetaFieldMultiText,
  ) {
    zDocMetaFieldMultiText.parse(value)
    Object.freeze(this)
  }

  static from<K extends RecordKey>(
    key: K,
    value: unknown,
  ): DocMetaFieldMultiTextValue<K> {
    return new DocMetaFieldMultiTextValue<K>(
      key,
      zDocMetaFieldMultiText.parse(value),
    )
  }

  static default<K extends RecordKey>(key: K): DocMetaFieldMultiTextValue<K> {
    return new DocMetaFieldMultiTextValue(key, [])
  }

  static defaultValue(): string[] {
    return []
  }
}
