import { zDocCustomSchemaFieldRelation, zDocMetaFieldRelation } from "@/models"
import type {
  DocCustomSchemaFieldRelation,
  DocMetaFieldRelation,
  RecordKey,
} from "@/types"

export class DocCustomSchemaFieldRelationValue<K extends RecordKey> {
  constructor(
    readonly key: K,
    readonly value: DocCustomSchemaFieldRelation,
  ) {
    zDocCustomSchemaFieldRelation.parse(value)
    Object.freeze(this)
  }

  static from<K extends RecordKey>(
    key: K,
    required: boolean,
  ): DocCustomSchemaFieldRelationValue<K> {
    return new DocCustomSchemaFieldRelationValue<K>(key, {
      type: "relation",
      required,
    })
  }

  validate(value: unknown): DocMetaFieldRelation {
    try {
      return zDocMetaFieldRelation.parse(value)
    } catch {
      if (this.value.required) {
        throw new Error(
          `required field "${this.key.toString()}" is missing or invalid`,
        )
      }
      return DocCustomSchemaFieldRelationValue.defaultValue()
    }
  }

  defaultValue(): DocMetaFieldRelation {
    return null
  }

  static defaultValue(): DocMetaFieldRelation {
    return null
  }
}
