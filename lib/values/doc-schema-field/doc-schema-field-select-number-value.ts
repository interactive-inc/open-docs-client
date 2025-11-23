import type {
  DocFileIndexSchemaField,
  DocSchemaFieldSelectNumber,
  RecordKey,
} from "@/types"

/**
 * Single select number type schema field
 */
export class DocSchemaFieldSelectNumberValue<T extends RecordKey> {
  constructor(
    readonly key: T,
    readonly value: DocSchemaFieldSelectNumber,
  ) {
    Object.freeze(this)
    Object.freeze(this.value)
    Object.freeze(this.value.options)
  }

  get type(): "select-number" {
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

  get options(): number[] {
    return this.value.options
  }

  readonly isArray = false

  readonly isSingle = true

  readonly isSelect = true

  readonly isNumberSelect = true

  /**
   * Validate value
   */
  validate(value: unknown): boolean {
    return typeof value === "number"
  }

  toJson(): DocFileIndexSchemaField {
    return { ...this.value }
  }

  static empty<T extends RecordKey>(
    key: T,
  ): DocSchemaFieldSelectNumberValue<T> {
    return new DocSchemaFieldSelectNumberValue(key, {
      type: "select-number",
      required: false,
      title: null,
      description: null,
      default: null,
      options: [],
    })
  }

  static from(
    key: RecordKey,
    record: Record<RecordKey, unknown>,
  ): DocSchemaFieldSelectNumberValue<RecordKey> {
    const value = record as DocSchemaFieldSelectNumber
    return new DocSchemaFieldSelectNumberValue(key, {
      type: value.type,
      required: value.required ?? false,
      title: value.title ?? null,
      description: value.description ?? null,
      default: value.default ?? null,
      options: value.options ?? [],
    })
  }
}
