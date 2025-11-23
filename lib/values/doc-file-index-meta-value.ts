import { parse, stringify } from "yaml"
import { INDEX_META } from "@/constants"
import { zDocFileIndexMeta } from "@/models"
import type {
  DocClientConfig,
  DocCustomSchema,
  DocFileIndexMeta,
  DocFileIndexSchema,
} from "@/types"
import { DocFileIndexSchemaFieldFactory } from "@/values/doc-file-index-schema-field-factory"
import { DocFileIndexSchemaValue } from "./doc-file-index-schema-value"

/**
 * File: index.md > content > FrontMatter
 */
export class DocFileIndexMetaValue<T extends DocCustomSchema> {
  constructor(
    readonly value: DocFileIndexMeta<T>,
    readonly customSchema: T,
    private readonly config: DocClientConfig,
    private readonly additionalProperties: Record<string, unknown> = {},
  ) {
    zDocFileIndexMeta.parse(value)
    Object.freeze(this)
  }

  /**
   * Get icon
   */
  get icon(): string | null {
    return this.value.icon
  }

  /**
   * Get schema
   */
  schema(): DocFileIndexSchemaValue<T> {
    return new DocFileIndexSchemaValue(this.value.schema, this.customSchema)
  }

  /**
   * Check if schema is defined
   */
  get hasSchema(): boolean {
    return Object.keys(this.value.schema).length > 0
  }

  /**
   * Update icon field
   */
  withIcon(value: string | null): DocFileIndexMetaValue<T> {
    return new DocFileIndexMetaValue(
      { ...this.value, icon: value },
      this.customSchema,
      this.config,
      this.additionalProperties,
    )
  }

  /**
   * Update schema field
   */
  withSchema(value: DocFileIndexSchema<keyof T>): DocFileIndexMetaValue<T> {
    return new DocFileIndexMetaValue(
      { ...this.value, schema: value },
      this.customSchema,
      this.config,
      this.additionalProperties,
    )
  }

  /**
   * Return a new instance with an unknown schema
   * Allows accepting Record<string, unknown> schemas from external sources
   */
  withUnknownSchema(
    draft: Record<string, unknown>,
  ): DocFileIndexMetaValue<DocCustomSchema> {
    // Cast the unknown schema to the expected type
    const typedSchema = draft as DocFileIndexSchema<string>

    return new DocFileIndexMetaValue<DocCustomSchema>(
      {
        type: INDEX_META,
        icon: this.value.icon,
        schema: typedSchema,
      },
      {} as DocCustomSchema,
      this.config,
      this.additionalProperties,
    )
  }

  /**
   * Output in JSON format
   */
  toJson(): DocFileIndexMeta<T> {
    return this.value
  }

  /**
   * Output in YAML format
   */
  toYaml(): string {
    const json = {
      icon: this.value.icon,
      schema: this.value.schema,
      ...this.additionalProperties,
    }
    return stringify(json).trim()
  }

  /**
   * Generate from Markdown text (can process incomplete data)
   */
  static from<T extends DocCustomSchema>(
    markdownText: string,
    customSchema: T,
    config: DocClientConfig,
  ): DocFileIndexMetaValue<T> {
    if (markdownText.startsWith("---") === false) {
      return DocFileIndexMetaValue.empty(customSchema, config)
    }

    const endIndex = markdownText.indexOf("\n---", 3)

    if (endIndex === -1) {
      return DocFileIndexMetaValue.empty(customSchema, config)
    }

    const frontMatterText = markdownText.slice(4, endIndex).trim()

    const record = parse(frontMatterText) || {}

    return DocFileIndexMetaValue.fromRecord(record, customSchema, config)
  }

  /**
   * Generate directly from data (can process incomplete data)
   */
  static fromRecord<T extends DocCustomSchema>(
    record: Record<string, unknown>,
    customSchema: T,
    config: DocClientConfig,
  ): DocFileIndexMetaValue<T> {
    const icon = DocFileIndexMetaValue.extractIcon(record, config)

    const indexSchema = DocFileIndexMetaValue.extractSchema<T>(
      record,
      customSchema,
    )

    // Extract additional properties specified in indexMetaIncludes
    const additionalProperties: Record<string, unknown> = {}
    for (const key of config.indexMetaIncludes) {
      if (key in record && key !== "icon" && key !== "schema") {
        additionalProperties[key] = record[key]
      }
    }

    const indexMeta: DocFileIndexMeta<T> = {
      type: "index-meta",
      icon,
      schema: indexSchema,
    }

    return new DocFileIndexMetaValue<T>(
      indexMeta,
      customSchema,
      config,
      additionalProperties,
    )
  }

  /**
   * Generate empty FrontMatter
   */
  static empty<T extends DocCustomSchema>(
    customSchema: T,
    config: DocClientConfig,
  ): DocFileIndexMetaValue<T> {
    return new DocFileIndexMetaValue<T>(
      {
        type: "index-meta",
        icon: config.defaultIndexIcon,
        schema: DocFileIndexMetaValue.emptySchema(customSchema),
      },
      customSchema,
      config,
      {},
    )
  }

  static emptySchema<T extends DocCustomSchema>(
    customSchema: T,
  ): DocFileIndexSchema<keyof T> {
    const record = {} as DocFileIndexSchema<keyof T>

    const customSchemaKeys = Object.keys(customSchema) as Array<keyof T>

    const factory = new DocFileIndexSchemaFieldFactory()

    for (const key of customSchemaKeys) {
      const field = customSchema[key]
      const customSchemaField = factory.empty(key, field.type)
      // Ensure required field has a default value
      const normalizedValue = {
        ...customSchemaField.value,
        required: customSchemaField.value.required ?? false,
      }
      record[key] = normalizedValue
    }

    return record
  }

  private static extractIcon(
    record: Record<string, unknown>,
    config: DocClientConfig,
  ): string | null {
    if (typeof record.icon === "string") {
      return record.icon
    }
    return config.defaultIndexIcon
  }

  private static extractSchema<T extends DocCustomSchema>(
    record: Record<string, unknown>,
    customSchema: T,
  ): DocFileIndexSchema<keyof T> {
    if (
      typeof record.schema === "object" &&
      record.schema !== null &&
      !Array.isArray(record.schema)
    ) {
      const rawSchema = record.schema as Record<string, unknown>
      const normalizedSchema: Record<string, unknown> = {}

      for (const key in rawSchema) {
        const field = rawSchema[key] as Record<string, unknown>
        // Preserve all properties from the field, ensuring required defaults
        normalizedSchema[key] = {
          ...field,
          required: field.required ?? false,
          title: field.title ?? null,
          description: field.description ?? null,
          default: field.default ?? null,
        }
      }

      return normalizedSchema as DocFileIndexSchema<keyof T>
    }
    return DocFileIndexMetaValue.emptySchema(customSchema)
  }
}
