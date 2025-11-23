import type {
  DocFileIndexSchemaField,
  DocSchemaFieldSelectText,
  RecordKey,
} from "@/types"

/**
 * Single select text type schema field
 */
export class DocSchemaFieldSelectTextValue<T extends RecordKey> {
  constructor(
    readonly key: T,
    readonly value: DocSchemaFieldSelectText,
  ) {
    if (this.value.options) {
      Object.freeze(this.value.options)
    }
    Object.freeze(this.value)
    Object.freeze(this)
  }

  get type(): "select-text" {
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

  get options(): string[] {
    return this.value.options
  }

  readonly isArray = false

  readonly isSingle = true

  readonly isSelect = true

  readonly isTextSelect = true

  toJson(): DocFileIndexSchemaField {
    return { ...this.value }
  }

  /**
   * Validate value type
   */
  validate(value: unknown): boolean {
    return typeof value === "string"
  }

  static empty<T extends RecordKey>(key: T): DocSchemaFieldSelectTextValue<T> {
    return new DocSchemaFieldSelectTextValue(key, {
      type: "select-text",
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
  ): DocSchemaFieldSelectTextValue<RecordKey> {
    const value = record as DocSchemaFieldSelectText
    return new DocSchemaFieldSelectTextValue(key, {
      type: value.type,
      required: value.required ?? false,
      title: value.title ?? null,
      description: value.description ?? null,
      default: value.default ?? null,
      options: value.options ?? [],
    })
  }
}
