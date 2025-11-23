import { zDocMetaFieldMultiSelectNumber } from "@/models"
import type { DocMetaFieldMultiSelectNumber, RecordKey } from "@/types"

/**
 * Multiple select number type schema field
 */
export class DocMetaFieldMultiSelectNumberValue<K extends RecordKey> {
  readonly type = "multi-select-number" as const

  constructor(
    readonly key: K,
    readonly value: DocMetaFieldMultiSelectNumber,
  ) {
    zDocMetaFieldMultiSelectNumber.parse(value)
    Object.freeze(this)
  }

  static from<K extends RecordKey>(
    key: K,
    value: unknown,
  ): DocMetaFieldMultiSelectNumberValue<K> {
    return new DocMetaFieldMultiSelectNumberValue<K>(
      key,
      zDocMetaFieldMultiSelectNumber.parse(value),
    )
  }

  static default<K extends RecordKey>(
    key: K,
  ): DocMetaFieldMultiSelectNumberValue<K> {
    return new DocMetaFieldMultiSelectNumberValue(key, [])
  }

  static defaultValue(): number[] {
    return []
  }
}
