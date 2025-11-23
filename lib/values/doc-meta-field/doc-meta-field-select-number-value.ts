import { zDocMetaFieldSelectNumber } from "@/models"
import type { DocMetaFieldSelectNumber, RecordKey } from "@/types"

/**
 * Single select number type schema field
 */
export class DocMetaFieldSelectNumberValue<K extends RecordKey> {
  readonly type = "select-number" as const

  constructor(
    readonly key: K,
    readonly value: DocMetaFieldSelectNumber,
  ) {
    zDocMetaFieldSelectNumber.parse(value)
    Object.freeze(this)
  }

  static from<K extends RecordKey>(
    key: K,
    value: unknown,
  ): DocMetaFieldSelectNumberValue<K> {
    return new DocMetaFieldSelectNumberValue<K>(
      key,
      zDocMetaFieldSelectNumber.parse(value),
    )
  }

  static default<K extends RecordKey>(
    key: K,
  ): DocMetaFieldSelectNumberValue<K> {
    return new DocMetaFieldSelectNumberValue(key, null)
  }

  static defaultValue(): number[] {
    return []
  }
}
