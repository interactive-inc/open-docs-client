import { zDocMetaFieldText } from "@/models"
import type { DocMetaFieldText, RecordKey } from "@/types"

/**
 * Single text type schema field
 */
export class DocMetaFieldTextValue<K extends RecordKey> {
  readonly type = "text" as const

  constructor(
    readonly key: K,
    readonly value: DocMetaFieldText,
  ) {
    zDocMetaFieldText.parse(value)
    Object.freeze(this)
  }

  static from<K extends RecordKey>(
    key: K,
    value: unknown,
  ): DocMetaFieldTextValue<K> {
    return new DocMetaFieldTextValue<K>(key, zDocMetaFieldText.parse(value))
  }

  static default<K extends RecordKey>(key: K): DocMetaFieldTextValue<K> {
    return new DocMetaFieldTextValue(key, "")
  }

  static defaultValue(): string {
    return ""
  }
}
