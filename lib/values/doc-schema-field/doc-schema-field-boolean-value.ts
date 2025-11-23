import type {
  DocFileIndexSchemaField,
  DocSchemaFieldBoolean,
  RecordKey,
} from "@/types"

/**
 * Single boolean type schema field
 */
export class DocSchemaFieldBooleanValue<T extends RecordKey> {
  constructor(
    readonly key: T,
    readonly value: DocSchemaFieldBoolean,
  ) {
    Object.freeze(this)
  }

  get type(): "boolean" {
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

  get default(): boolean | null {
    return this.value.default
  }

  readonly isArray = false

  readonly isSingle = true

  readonly isBoolean = true

  toJson(): DocFileIndexSchemaField {
    return { ...this.value }
  }

  /**
   * Validate value type
   */
  validate(value: unknown): boolean {
    return typeof value === "boolean"
  }

  static empty(key: RecordKey): DocSchemaFieldBooleanValue<RecordKey> {
    return new DocSchemaFieldBooleanValue(key, {
      type: "boolean",
      required: false,
      title: null,
      description: null,
      default: null,
    })
  }

  static from(
    key: RecordKey,
    record: Record<RecordKey, unknown>,
  ): DocSchemaFieldBooleanValue<RecordKey> {
    const value = record as DocSchemaFieldBoolean
    return new DocSchemaFieldBooleanValue(key, {
      type: value.type,
      required: value.required ?? false,
      title: value.title ?? null,
      description: value.description ?? null,
      default: value.default ?? null,
    })
  }
}
