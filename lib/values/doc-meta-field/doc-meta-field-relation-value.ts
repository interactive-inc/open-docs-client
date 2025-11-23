import { zDocMetaFieldRelation } from "@/models"
import type { DocMetaFieldRelation, RecordKey } from "@/types"

/**
 * Relation type schema field
 */
export class DocMetaFieldRelationValue<K extends RecordKey> {
  readonly type = "relation" as const

  constructor(
    readonly key: K,
    readonly value: DocMetaFieldRelation,
  ) {
    zDocMetaFieldRelation.parse(value)
    Object.freeze(this)
  }

  static from<K extends RecordKey>(
    key: K,
    value: unknown,
  ): DocMetaFieldRelationValue<K> {
    return new DocMetaFieldRelationValue<K>(
      key,
      zDocMetaFieldRelation.parse(value),
    )
  }

  static default<K extends RecordKey>(key: K): DocMetaFieldRelationValue<K> {
    return new DocMetaFieldRelationValue(key, null)
  }

  static defaultValue(): string | null {
    return null
  }
}
