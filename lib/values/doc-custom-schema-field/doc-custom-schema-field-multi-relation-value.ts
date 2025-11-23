import {
  zDocCustomSchemaFieldMultiRelation,
  zDocMetaFieldMultiRelation,
} from "@/models"
import type {
  DocCustomSchemaFieldMultiRelation,
  DocMetaFieldMultiRelation,
  RecordKey,
} from "@/types"

export class DocCustomSchemaFieldMultiRelationValue<K extends RecordKey> {
  constructor(
    readonly key: K,
    readonly value: DocCustomSchemaFieldMultiRelation,
  ) {
    zDocCustomSchemaFieldMultiRelation.parse(value)
    Object.freeze(this)
  }

  static from<K extends RecordKey>(
    key: K,
    required: boolean,
  ): DocCustomSchemaFieldMultiRelationValue<K> {
    return new DocCustomSchemaFieldMultiRelationValue<K>(key, {
      type: "multi-relation",
      required,
    })
  }

  validate(value: unknown): DocMetaFieldMultiRelation {
    try {
      return zDocMetaFieldMultiRelation.parse(value)
    } catch {
      if (this.value.required) {
        throw new Error(
          `required field "${this.key.toString()}" is missing or invalid`,
        )
      }
      return DocCustomSchemaFieldMultiRelationValue.defaultValue()
    }
  }

  defaultValue(): DocMetaFieldMultiRelation {
    return []
  }

  static defaultValue(): DocMetaFieldMultiRelation {
    return []
  }
}
