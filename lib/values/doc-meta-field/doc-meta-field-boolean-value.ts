import { zDocMetaFieldBoolean } from "@/models"
import type { DocMetaFieldBoolean, RecordKey } from "@/types"

/**
 * Single boolean type schema field
 */
export class DocMetaFieldBooleanValue<K extends RecordKey> {
  readonly type = "boolean" as const

  constructor(
    readonly key: K,
    readonly value: DocMetaFieldBoolean,
  ) {
    zDocMetaFieldBoolean.parse(value)
    Object.freeze(this)
  }

  static from<K extends RecordKey>(
    key: K,
    value: unknown,
  ): DocMetaFieldBooleanValue<K> {
    return new DocMetaFieldBooleanValue<K>(
      key,
      zDocMetaFieldBoolean.parse(value),
    )
  }

  static default<K extends RecordKey>(key: K): DocMetaFieldBooleanValue<K> {
    return new DocMetaFieldBooleanValue(key, false)
  }

  static defaultValue(): boolean {
    return false
  }
}
