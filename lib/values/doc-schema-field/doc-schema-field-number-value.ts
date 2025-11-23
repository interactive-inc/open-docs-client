import type {
  DocFileIndexSchemaField,
  DocSchemaFieldNumber,
  RecordKey,
} from "@/types"

/**
 * Single number type schema field
 */
export class DocSchemaFieldNumberValue<T extends RecordKey> {
  constructor(
    readonly key: T,
    readonly value: DocSchemaFieldNumber,
  ) {
    Object.freeze(this)
  }

  get type(): "number" {
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

  get default(): number | null {
    return this.value.default
  }

  readonly isArray = false

  readonly isSingle = true

  readonly isNumber = true

  toJson(): DocFileIndexSchemaField {
    return { ...this.value }
  }

  /**
   * Validate value type
   */
  validate(value: unknown): boolean {
    return typeof value === "number"
  }

  static empty(key: RecordKey): DocSchemaFieldNumberValue<RecordKey> {
    return new DocSchemaFieldNumberValue(key, {
      type: "number",
      required: false,
      title: null,
      description: null,
      default: null,
    })
  }

  static from(
    key: RecordKey,
    record: Record<RecordKey, unknown>,
  ): DocSchemaFieldNumberValue<RecordKey> {
    const value = record as DocSchemaFieldNumber
    return new DocSchemaFieldNumberValue(key, {
      type: value.type,
      required: value.required ?? false,
      title: value.title ?? null,
      description: value.description ?? null,
      default: value.default ?? null,
    })
  }
}
