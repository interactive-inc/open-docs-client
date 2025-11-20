import type { z } from "zod"
import type {
  zDocClientConfig,
  zDocFileIndex,
  zDocFileIndexSchemaField,
  zDocFileMd,
  zDocFilePath,
  zDocFileUnknown,
  zDocMetaField,
  zDocMetaFieldBoolean,
  zDocMetaFieldMultiNumber,
  zDocMetaFieldMultiRelation,
  zDocMetaFieldMultiSelectNumber,
  zDocMetaFieldMultiSelectText,
  zDocMetaFieldMultiText,
  zDocMetaFieldNumber,
  zDocMetaFieldRelation,
  zDocMetaFieldSelectNumber,
  zDocMetaFieldSelectText,
  zDocMetaFieldText,
  zDocMetaFieldType,
  zDocMetaFieldTypeBoolean,
  zDocMetaFieldTypeNumber,
  zDocMetaFieldTypeRelation,
  zDocMetaFieldTypeSelectNumber,
  zDocMetaFieldTypeSelectText,
  zDocMetaFieldTypeText,
  zDocRelation,
  zDocRelationField,
  zDocRelationFile,
  zDocSchemaFieldBoolean,
  zDocSchemaFieldMultiNumber,
  zDocSchemaFieldMultiRelation,
  zDocSchemaFieldMultiSelectNumber,
  zDocSchemaFieldMultiSelectText,
  zDocSchemaFieldMultiText,
  zDocSchemaFieldNumber,
  zDocSchemaFieldRelation,
  zDocSchemaFieldSelectNumber,
  zDocSchemaFieldSelectText,
  zDocSchemaFieldText,
} from "./models"
import type { DocFileIndexReference } from "./references/doc-file-index-reference"
import type { DocFileMdReference } from "./references/doc-file-md-reference"
import type { DocFileUnknownReference } from "./references/doc-file-unknown-reference"

/**
 * Generic updater function type that takes a value and returns the same type
 */
export type UpdateFunction<T> = (current: T) => T

/**
 * Text field type
 */
export type DocSchemaFieldText = z.infer<typeof zDocSchemaFieldText>

/**
 * Number field type
 */
export type DocSchemaFieldNumber = z.infer<typeof zDocSchemaFieldNumber>

/**
 * Boolean field type
 */
export type DocSchemaFieldBoolean = z.infer<typeof zDocSchemaFieldBoolean>

/**
 * Multi-text field type
 */
export type DocSchemaFieldMultiText = z.infer<typeof zDocSchemaFieldMultiText>

/**
 * Multi-number field type
 */
export type DocSchemaFieldMultiNumber = z.infer<
  typeof zDocSchemaFieldMultiNumber
>

/**
 * Relation field type
 */
export type DocSchemaFieldRelation = z.infer<typeof zDocSchemaFieldRelation>

/**
 * Multi-relation field type
 */
export type DocSchemaFieldMultiRelation = z.infer<
  typeof zDocSchemaFieldMultiRelation
>

/**
 * Select text field type
 */
export type DocSchemaFieldSelectText = z.infer<typeof zDocSchemaFieldSelectText>

/**
 * Select number field type
 */
export type DocSchemaFieldSelectNumber = z.infer<
  typeof zDocSchemaFieldSelectNumber
>

/**
 * Multi-select text field type
 */
export type DocSchemaFieldMultiSelectText = z.infer<
  typeof zDocSchemaFieldMultiSelectText
>

/**
 * Multi-select number field type
 */
export type DocSchemaFieldMultiSelectNumber = z.infer<
  typeof zDocSchemaFieldMultiSelectNumber
>

export type DocMetaField = z.infer<typeof zDocMetaField>

export type DocMetaFieldText = z.infer<typeof zDocMetaFieldText>

export type DocMetaFieldNumber = z.infer<typeof zDocMetaFieldNumber>

export type DocMetaFieldBoolean = z.infer<typeof zDocMetaFieldBoolean>

export type DocMetaFieldSelectText = z.infer<typeof zDocMetaFieldSelectText>

export type DocMetaFieldSelectNumber = z.infer<typeof zDocMetaFieldSelectNumber>

export type DocMetaFieldRelation = z.infer<typeof zDocMetaFieldRelation>

export type DocMetaFieldMultiText = z.infer<typeof zDocMetaFieldMultiText>

export type DocMetaFieldMultiNumber = z.infer<typeof zDocMetaFieldMultiNumber>

export type DocMetaFieldMultiSelectText = z.infer<
  typeof zDocMetaFieldMultiSelectText
>

export type DocMetaFieldMultiSelectNumber = z.infer<
  typeof zDocMetaFieldMultiSelectNumber
>

export type DocMetaFieldMultiRelation = z.infer<
  typeof zDocMetaFieldMultiRelation
>

export type DocFileMdMeta<T extends RecordKey> = Record<T, DocMetaField>

export type DocFileMdMetaAny = DocFileMdMeta<RecordKey>

export type DocMetaFieldTypeText = z.infer<typeof zDocMetaFieldTypeText>

export type DocMetaFieldTypeNumber = z.infer<typeof zDocMetaFieldTypeNumber>

export type DocMetaFieldTypeBoolean = z.infer<typeof zDocMetaFieldTypeBoolean>

export type DocMetaFieldTypeSelectText = z.infer<
  typeof zDocMetaFieldTypeSelectText
>

export type DocMetaFieldTypeSelectNumber = z.infer<
  typeof zDocMetaFieldTypeSelectNumber
>

export type DocMetaFieldTypeRelation = z.infer<typeof zDocMetaFieldTypeRelation>

/**
 * Schema field type
 */
export type DocMetaFieldType = z.infer<typeof zDocMetaFieldType>

export type DocCustomSchemaFieldText = {
  type: "text"
  required: boolean
}

export type DocCustomSchemaFieldNumber = {
  type: "number"
  required: boolean
}

export type DocCustomSchemaFieldBoolean = {
  type: "boolean"
  required: boolean
}

export type DocCustomSchemaFieldRelation = {
  type: "relation"
  required: boolean
}

export type DocCustomSchemaFieldSelectText = {
  type: "select-text"
  required: boolean
}

export type DocCustomSchemaFieldSelectNumber = {
  type: "select-number"
  required: boolean
}

export type DocCustomSchemaFieldMultiText = {
  type: "multi-text"
  required: boolean
}

export type DocCustomSchemaFieldMultiNumber = {
  type: "multi-number"
  required: boolean
}

export type DocCustomSchemaFieldMultiRelation = {
  type: "multi-relation"
  required: boolean
}

export type DocCustomSchemaFieldMultiSelectText = {
  type: "multi-select-text"
  required: boolean
}

export type DocCustomSchemaFieldMultiSelectNumber = {
  type: "multi-select-number"
  required: boolean
}

/**
 * Schema field type
 */
export type DocFileIndexSchemaField = z.infer<typeof zDocFileIndexSchemaField>

/**
 * Schema definition type
 */
export type DocFileIndexSchema<T extends RecordKey = string> = Record<
  T,
  DocFileIndexSchemaField
>

/**
 * Schema field to override
 * ex: { xxx: { type: "text", required: true } }
 */
export type DocCustomSchemaField =
  | DocCustomSchemaFieldText
  | DocCustomSchemaFieldNumber
  | DocCustomSchemaFieldBoolean
  | DocCustomSchemaFieldRelation
  | DocCustomSchemaFieldSelectText
  | DocCustomSchemaFieldSelectNumber
  | DocCustomSchemaFieldMultiText
  | DocCustomSchemaFieldMultiNumber
  | DocCustomSchemaFieldMultiRelation
  | DocCustomSchemaFieldMultiSelectText
  | DocCustomSchemaFieldMultiSelectNumber

/**
 * Type literal for field types
 */
export type DocFieldTypeLiteral =
  | "text"
  | "number"
  | "boolean"
  | "relation"
  | "multi-text"
  | "multi-number"
  | "multi-relation"
  | "select-text"
  | "select-number"
  | "multi-select-text"
  | "multi-select-number"

/**
 * Minimal schema definition type
 */
export type DocCustomSchema<T extends RecordKey = string> = Record<
  T,
  DocCustomSchemaField
>

/**
 * Union type for relation fields
 */
export type DocSchemaRelationFieldUnion =
  | DocSchemaFieldRelation
  | DocSchemaFieldMultiRelation

/**
 * File node type (for files only)
 */
export type DocTreeFileNode = {
  type: "file"
  name: string
  path: string
  icon: string
  title: string
}

/**
 * Directory node type (for directories only)
 */
export type DocTreeDirectoryNode = {
  type: "directory"
  name: string
  path: string
  icon: string
  title: string
  children: DocTreeNode[]
}

/**
 * Unified tree node type
 */
export type DocTreeNode = DocTreeFileNode | DocTreeDirectoryNode

/**
 * Index file type
 */
export type DocFileIndex<T extends DocCustomSchema = DocCustomSchema> = {
  type: "index"
  path: DocFilePath
  isArchived: boolean
  content: DocFileIndexContent<T>
}

/**
 * Type to check if two types are equal
 */
export type Equals<T, U> = (<G>() => G extends T ? 1 : 2) extends <
  G,
>() => G extends U ? 1 : 2
  ? true
  : false

/**
 * Extract relation field keys from schema
 */
export type RelationKeys<T extends DocCustomSchema> = {
  [K in keyof T]: T[K]["type"] extends "relation" ? K : never
}[keyof T]

/**
 * Extract multi-relation field keys from schema
 */
export type MultiRelationKeys<T extends DocCustomSchema> = {
  [K in keyof T]: T[K]["type"] extends "multi-relation" ? K : never
}[keyof T]

/**
 * Markdown file type (excluding index.md)
 */
export type DocFileMd<T extends DocCustomSchema> = {
  type: "markdown"
  path: DocFilePath
  isArchived: boolean
  content: DocFileMdContent<T>
}

/**
 * Other file type (non-markdown)
 */
export type DocFileUnknown = z.infer<typeof zDocFileUnknown>

/**
 * File union type (index.md, regular md, other)
 */
export type DocFile<T extends DocCustomSchema = DocCustomSchema> =
  | DocFileIndex<T>
  | DocFileMd<T>
  | DocFileUnknown

export type DocDirectoryFile<T extends DocCustomSchema = DocCustomSchema> =
  | DocFileMd<T>
  | DocFileUnknown

export type DocFileIndexAny = z.infer<typeof zDocFileIndex>

export type DocFileMdAny = z.infer<typeof zDocFileMd>

/**
 * DocFile<DocCustomSchema<RecordKey>>
 */
export type DocFileAny = DocFileIndexAny | DocFileMdAny | DocFileUnknown

/**
 * Directory FrontMatter type
 */
export type DocFileIndexMeta<T extends DocCustomSchema = DocCustomSchema> = {
  type: "index-meta"
  icon: string | null
  schema: DocFileIndexSchema<keyof T>
}

/**
 * Relation options type
 */
export type DocRelationFile = z.infer<typeof zDocRelationFile>

/**
 * Relation information type
 */
export type DocRelation = z.infer<typeof zDocRelation>

/**
 * Relation field type
 */
export type DocRelationField = z.infer<typeof zDocRelationField>

/**
 * String literal type utilities for file path detection
 */

/**
 * Check if path ends with specific extension
 */
type EndsWith<T extends string, U extends string> = T extends `${string}${U}`
  ? true
  : false

/**
 * Extract filename from path
 */
type Basename<T extends string> = T extends `${string}/${infer U}`
  ? Basename<U>
  : T

/**
 * Check if filename is index.md
 */
type IsIndexMd<T extends string> = Basename<T> extends "index.md" ? true : false

/**
 * Detect file type from path
 */
export type DetectFileType<T extends string> = IsIndexMd<T> extends true
  ? "index"
  : EndsWith<T, ".md"> extends true
    ? "markdown"
    : "unknown"

/**
 * Map file type to reference class
 */
type FileTypeToReference<
  FileType extends string,
  Schema extends DocCustomSchema,
> = FileType extends "index"
  ? DocFileIndexReference<Schema>
  : FileType extends "markdown"
    ? DocFileMdReference<Schema>
    : DocFileUnknownReference<Schema>

/**
 * Infer reference type from path
 */
export type InferReference<
  Path extends string,
  Schema extends DocCustomSchema,
> = FileTypeToReference<DetectFileType<Path>, Schema>

/**
 * File path information type
 */
export type DocFilePath = z.infer<typeof zDocFilePath>

/**
 * Markdown content information type
 */
export type DocFileMdContent<T extends DocCustomSchema = DocCustomSchema> = {
  type: "markdown-content"
  body: string
  title: string
  description: string
  meta: SchemaToValueType<T>
}

/**
 * Index file content information type
 */
export type DocFileIndexContent<T extends DocCustomSchema = DocCustomSchema> = {
  type: "markdown-index"
  body: string
  title: string
  description: string
  meta: DocFileIndexMeta<T>
}

/**
 * Directory response type (re-export from server package)
 */
export type DocDirectory<T extends DocCustomSchema> = {
  cwd: string
  indexFile: DocFileIndex<T>
  files: DocFile<T>[]
  relations: DocRelation[]
}

export type RecordKey = PropertyKey

/**
 * DocClient configuration
 */
export type DocClientConfig = z.infer<typeof zDocClientConfig>

/**
 * Type definitions for DocFileMdMetaValue
 */
export type ExtractFieldType<T> = T extends { type: infer Type } ? Type : never

export type ExtractRequired<T> = T extends { required: infer Required }
  ? Required
  : false

export type BaseFieldValueType<Type> = Type extends "text"
  ? string
  : Type extends "number"
    ? number
    : Type extends "boolean"
      ? boolean
      : Type extends "multi-text"
        ? string[]
        : Type extends "multi-number"
          ? number[]
          : Type extends "multi-boolean"
            ? boolean[]
            : Type extends "relation"
              ? string
              : Type extends "multi-relation"
                ? string[]
                : Type extends "select-text"
                  ? string
                  : Type extends "select-number"
                    ? number
                    : Type extends "multi-select-text"
                      ? string[]
                      : Type extends "multi-select-number"
                        ? number[]
                        : never

export type FieldValueType<Type, Required> = Required extends true
  ? BaseFieldValueType<Type>
  : BaseFieldValueType<Type> | null

/**
 * Extract required field keys
 */
export type RequiredKeys<T extends DocCustomSchema> = {
  [K in keyof T]: T[K] extends { required: true } ? K : never
}[keyof T]

/**
 * Extract optional field keys
 */
export type OptionalKeys<T extends DocCustomSchema> = {
  [K in keyof T]: T[K] extends { required: true } ? never : K
}[keyof T]

/**
 * Generate expected value type from schema (considering required)
 */
export type SchemaToValueType<T extends DocCustomSchema> = {
  [K in RequiredKeys<T>]: BaseFieldValueType<ExtractFieldType<T[K]>>
} & {
  [K in OptionalKeys<T>]: BaseFieldValueType<ExtractFieldType<T[K]>> | null
}

/**
 * Helper type for type-safe property access
 */
export type GetValueType<
  T extends DocCustomSchema,
  K extends keyof T,
> = K extends RequiredKeys<T>
  ? BaseFieldValueType<ExtractFieldType<T[K]>>
  : BaseFieldValueType<ExtractFieldType<T[K]>> | undefined | null

export type GetIndexFieldType<
  Schema extends DocFileIndexSchema<RecordKey>,
  K extends keyof Schema,
> = Schema[K] extends DocFileIndexSchemaField ? Schema[K] : never

/**
 * Infers DocFileMd type from the result of defineSchema
 */
export type InferDocFileMd<T> = T extends DocCustomSchema ? DocFileMd<T> : never
