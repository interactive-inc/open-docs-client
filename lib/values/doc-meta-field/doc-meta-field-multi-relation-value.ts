import { zDocMetaFieldMultiRelation } from "@/models"
import type { DocMetaFieldMultiRelation, RecordKey } from "@/types"

/**
 * Multiple relation type schema field
 */
export class DocMetaFieldMultiRelationValue<K extends RecordKey> {
  readonly type = "multi-relation" as const

  constructor(
    readonly key: K,
    readonly value: DocMetaFieldMultiRelation,
  ) {
    zDocMetaFieldMultiRelation.parse(value)
    Object.freeze(this)
  }

  static from<K extends RecordKey>(
    key: K,
    value: unknown,
  ): DocMetaFieldMultiRelationValue<K> {
    return new DocMetaFieldMultiRelationValue<K>(
      key,
      zDocMetaFieldMultiRelation.parse(value),
    )
  }

  static default<K extends RecordKey>(
    key: K,
  ): DocMetaFieldMultiRelationValue<K> {
    return new DocMetaFieldMultiRelationValue(key, [])
  }

  static defaultValue(): string[] {
    return []
  }
}
