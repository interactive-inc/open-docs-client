import { zDocMetaFieldMultiNumber } from "@/models"
import type { DocMetaFieldMultiNumber, RecordKey } from "@/types"

/**
 * Multiple number type schema field
 */
export class DocMetaFieldMultiNumberValue<K extends RecordKey> {
  readonly type = "multi-number" as const

  constructor(
    readonly key: K,
    readonly value: DocMetaFieldMultiNumber,
  ) {
    zDocMetaFieldMultiNumber.parse(value)
    Object.freeze(this)
  }

  static from<K extends RecordKey>(
    key: K,
    value: unknown,
  ): DocMetaFieldMultiNumberValue<K> {
    return new DocMetaFieldMultiNumberValue<K>(
      key,
      zDocMetaFieldMultiNumber.parse(value),
    )
  }

  static default<K extends RecordKey>(key: K): DocMetaFieldMultiNumberValue<K> {
    return new DocMetaFieldMultiNumberValue(key, [])
  }

  static defaultValue(): number[] {
    return []
  }
}
