import type {
  DocFileIndexSchemaField,
  DocSchemaFieldRelation,
  RecordKey,
} from "@/types"

/**
 * Single relation type schema field
 */
export class DocSchemaFieldRelationValue<T extends RecordKey> {
  constructor(
    readonly key: T,
    readonly value: DocSchemaFieldRelation,
  ) {
    Object.freeze(this)
  }

  get type(): "relation" {
    return this.value.type
  }

  get required(): boolean {
    return this.value.required
  }

  get title(): string {
    return this.value.title ?? ""
  }

  get description(): string {
    return this.value.description ?? ""
  }

  get default(): string | null {
    return this.value.default
  }

  get path(): string {
    return this.value.path
  }

  readonly isArray = false

  readonly isSingle = true

  readonly isRelation = true

  toJson(): DocFileIndexSchemaField {
    return { ...this.value }
  }

  /**
   * Validate value type
   */
  validate(value: unknown): boolean {
    return typeof value === "string"
  }

  static empty(key: RecordKey): DocSchemaFieldRelationValue<RecordKey> {
    return new DocSchemaFieldRelationValue(key, {
      type: "relation",
      required: false,
      title: null,
      description: null,
      default: null,
      path: "",
    })
  }

  static from(
    key: RecordKey,
    record: Record<RecordKey, unknown>,
  ): DocSchemaFieldRelationValue<RecordKey> {
    const value = record as DocSchemaFieldRelation
    return new DocSchemaFieldRelationValue(key, {
      type: value.type,
      required: value.required ?? false,
      title: value.title ?? null,
      description: value.description ?? null,
      default: value.default ?? null,
      path: value.path ?? "",
    })
  }
}
