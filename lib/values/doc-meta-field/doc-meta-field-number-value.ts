import { zDocMetaFieldNumber } from "@/models"
import type { DocMetaFieldNumber, RecordKey } from "@/types"

/**
 * Single number type schema field
 */
export class DocMetaFieldNumberValue<K extends RecordKey> {
  readonly type = "number" as const

  constructor(
    readonly key: K,
    readonly value: DocMetaFieldNumber,
  ) {
    zDocMetaFieldNumber.parse(value)
    Object.freeze(this)
  }

  static from<K extends RecordKey>(
    key: K,
    value: unknown,
  ): DocMetaFieldNumberValue<K> {
    return new DocMetaFieldNumberValue<K>(key, zDocMetaFieldNumber.parse(value))
  }

  static default<K extends RecordKey>(key: K): DocMetaFieldNumberValue<K> {
    return new DocMetaFieldNumberValue(key, 0)
  }

  static defaultValue(): number {
    return 0
  }
}
