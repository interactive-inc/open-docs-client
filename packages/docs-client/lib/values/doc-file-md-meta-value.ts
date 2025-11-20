import { parse, stringify } from "yaml"
import {
  zDocFileMdMeta,
  zDocFileMdMetaInput,
  zDocMetaFieldBoolean,
  zDocMetaFieldMultiNumber,
  zDocMetaFieldMultiRelation,
  zDocMetaFieldMultiText,
  zDocMetaFieldNumber,
  zDocMetaFieldRelation,
  zDocMetaFieldText,
} from "@/models"
import type {
  BaseFieldValueType,
  DocCustomSchema,
  DocMetaFieldBoolean,
  DocMetaFieldMultiNumber,
  DocMetaFieldMultiRelation,
  DocMetaFieldMultiText,
  DocMetaFieldNumber,
  DocMetaFieldRelation,
  DocMetaFieldText,
  ExtractFieldType,
  ExtractRequired,
  FieldValueType,
  GetValueType,
  SchemaToValueType,
} from "@/types"
import { DocCustomSchemaFieldFactory } from "@/values/doc-custom-schema-field/doc-custom-schema-field-factory"
import { DocMetaFieldFactory } from "@/values/doc-meta-field/doc-meta-field-factory"

/**
 * Meta
 */
export class DocFileMdMetaValue<T extends DocCustomSchema> {
  constructor(
    readonly value: SchemaToValueType<T>,
    readonly customSchema: T,
  ) {
    this.validateValue(value, customSchema)
    Object.freeze(this)
  }

  get keys(): Array<keyof T> {
    return Object.keys(this.value) as Array<keyof T>
  }

  /**
   * Return a new instance with a single property updated
   */
  withProperty<K extends keyof T>(
    key: K,
    value: BaseFieldValueType<ExtractFieldType<T[K]>>,
  ): DocFileMdMetaValue<T> {
    const schemaField = this.schemaField(key)

    if (schemaField === undefined) {
      throw new Error(`Field "${key as never}" does not exist in schema.`)
    }

    const factory = new DocMetaFieldFactory()

    const field = factory.fromType(key, schemaField.type, value)

    return new DocFileMdMetaValue<T>(
      { ...this.value, [key]: field.value } as SchemaToValueType<T>,
      this.customSchema,
    )
  }

  schemaField<K extends keyof T>(key: K): T[K] {
    const field = this.customSchema[key]

    if (field === undefined) {
      throw new Error(`Field "${key as never}" does not exist in schema.`)
    }

    return field
  }

  field<K extends keyof T>(
    key: K,
  ): FieldValueType<ExtractFieldType<T[K]>, ExtractRequired<T[K]>> {
    const schemaField = this.schemaField(key)

    const hasKey = key in this.value

    if (hasKey === false && schemaField.required) {
      throw new Error(`Field "${key as never}" does not exist in value.`)
    }

    if (hasKey === false) {
      return null as FieldValueType<
        ExtractFieldType<T[K]>,
        ExtractRequired<T[K]>
      >
    }

    const value = this.getValueField(this.value, key)

    const factory = new DocMetaFieldFactory()

    const field = factory.fromType(key, schemaField.type, value)

    const nullable = field.value ?? null

    return nullable as FieldValueType<
      ExtractFieldType<T[K]>,
      ExtractRequired<T[K]>
    >
  }

  relation(key: keyof T): DocMetaFieldRelation {
    if (this.hasKey(key) === false) {
      return null
    }

    return zDocMetaFieldRelation.parse(this.value[key])
  }

  multiRelation(key: keyof T): DocMetaFieldMultiRelation {
    if (this.hasKey(key) === false) {
      return []
    }

    return zDocMetaFieldMultiRelation.parse(this.value[key])
  }

  text(key: keyof T): DocMetaFieldText {
    if (this.hasKey(key) === false) {
      return null
    }

    return zDocMetaFieldText.parse(this.value[key])
  }

  number(key: keyof T): DocMetaFieldNumber {
    if (this.hasKey(key) === false) {
      return null
    }

    return zDocMetaFieldNumber.parse(this.value[key])
  }

  boolean(key: keyof T): DocMetaFieldBoolean {
    if (this.hasKey(key) === false) {
      return null
    }

    return zDocMetaFieldBoolean.parse(this.value[key])
  }

  multiText(key: keyof T): DocMetaFieldMultiText {
    if (this.hasKey(key) === false) {
      return []
    }

    return zDocMetaFieldMultiText.parse(this.value[key])
  }

  multiNumber(key: keyof T): DocMetaFieldMultiNumber {
    if (this.hasKey(key) === false) {
      return []
    }

    return zDocMetaFieldMultiNumber.parse(this.value[key])
  }

  hasKey(key: keyof T): boolean {
    const schemaField = this.schemaField(key)

    const hasKey = key in this.value

    if (hasKey === false && schemaField.required) {
      return false
    }

    if (hasKey === false) {
      return false
    }

    return true
  }

  toJson(): SchemaToValueType<T> {
    return this.value
  }

  toYaml(): string {
    return stringify(this.value).trim()
  }

  private validateValue(value: SchemaToValueType<T>, schema: T): void {
    // スキーマが空の場合はバリデーションをスキップ
    if (Object.keys(schema).length === 0) {
      return
    }

    const keys = Object.keys(schema) as Array<keyof T>

    for (const key of keys) {
      const schemaField = schema[key]
      const fieldValue = this.getValueField(value, key)

      // Check required fields
      if (schemaField.required && fieldValue === undefined) {
        throw new Error(`Required field "${key as string}" is missing`)
      }

      // Type check when value exists
      if (fieldValue !== undefined) {
        const factory = new DocMetaFieldFactory()
        // fromType method performs internal validation
        factory.fromType(key, schemaField.type, fieldValue)
      }
    }
  }

  private getValueField<K extends keyof T>(
    value: SchemaToValueType<T>,
    key: K,
  ): GetValueType<T, K> {
    // Access type-safely by treating as Record type
    const record = value as Record<keyof T, unknown>
    return record[key] as GetValueType<T, K>
  }

  /**
   * Generate from Markdown text
   */
  static fromYamlText<T extends DocCustomSchema>(
    yamlText: string,
    customSchema: T,
  ): DocFileMdMetaValue<T> {
    const yamlRecord = parse(yamlText)

    // Use input schema which transforms undefined to null
    const record = zDocFileMdMetaInput
      .transform((meta) => {
        const result: Record<string, unknown> = {}
        for (const [key, value] of Object.entries(meta)) {
          result[key] = value === undefined ? null : value
        }
        return zDocFileMdMeta.parse(result)
      })
      .parse(yamlRecord)

    const schemaFieldKeys = Object.keys(customSchema) as Array<keyof T>

    const factory = new DocCustomSchemaFieldFactory()

    // まずYAMLのすべてのフィールドを保持
    const validatedRecord: Record<string, unknown> = { ...record }

    // スキーマに定義されたフィールドをバリデーション
    for (const key of schemaFieldKeys) {
      const schemaField = customSchema[key]
      const customSchemaField = factory.fromType(key, schemaField)
      const value = customSchemaField.validate(record[key])
      validatedRecord[key as string] = value
    }

    return new DocFileMdMetaValue(
      validatedRecord as SchemaToValueType<T>,
      customSchema,
    )
  }

  static empty<T extends DocCustomSchema>(
    customSchema: T,
  ): DocFileMdMetaValue<T> {
    const record = {} as SchemaToValueType<T>

    const customSchemaKeys = Object.keys(customSchema) as Array<keyof T>

    const factory = new DocCustomSchemaFieldFactory()

    for (const key of customSchemaKeys) {
      const field = customSchema[key]
      const customSchemaField = factory.fromType(key, field)
      const defaultValue = customSchemaField.defaultValue()
      if (field.required || defaultValue !== null) {
        const unknownRecord = record as Record<keyof T, unknown>
        unknownRecord[key] = defaultValue
      }
    }

    return new DocFileMdMetaValue(record, customSchema)
  }
}
