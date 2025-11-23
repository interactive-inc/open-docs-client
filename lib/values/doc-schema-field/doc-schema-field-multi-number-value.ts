import type {
  DocFileIndexSchemaField,
  DocSchemaFieldMultiNumber,
  RecordKey,
} from "@/types"

/**
 * Multiple number type schema field
 */
export class DocSchemaFieldMultiNumberValue<T extends RecordKey> {
  constructor(
    readonly key: T,
    readonly value: DocSchemaFieldMultiNumber,
  ) {
    Object.freeze(this)
    Object.freeze(this.value)
    if (this.value.default) {
      Object.freeze(this.value.default)
    }
  }

  get type(): "multi-number" {
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

  get default(): number[] | null {
    return this.value.default
  }

  readonly isArray = true

  readonly isSingle = false

  readonly isNumber = true

  /**
   * Validate value
   */
  validate(value: unknown): boolean {
    return Array.isArray(value) && value.every((v) => typeof v === "number")
  }

  toJson(): DocFileIndexSchemaField {
    return { ...this.value }
  }

  static empty<T extends RecordKey>(key: T): DocSchemaFieldMultiNumberValue<T> {
    return new DocSchemaFieldMultiNumberValue(key, {
      type: "multi-number",
      required: false,
      title: null,
      description: null,
      default: null,
    })
  }

  static from(
    key: RecordKey,
    record: Record<RecordKey, unknown>,
  ): DocSchemaFieldMultiNumberValue<RecordKey> {
    const value = record as DocSchemaFieldMultiNumber
    return new DocSchemaFieldMultiNumberValue(key, {
      type: value.type,
      required: value.required ?? false,
      title: value.title ?? null,
      description: value.description ?? null,
      default: value.default ?? null,
    })
  }
}
