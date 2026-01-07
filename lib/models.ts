import { z } from "zod"

/**
 * File path information
 */
export const zDocFilePath = z.object({
  name: z.string(),
  path: z.string(),
  fullPath: z.string(),
  nameWithExtension: z.string(),
})

export const zDocMetaFieldTypeText = z.literal("text")

export const zDocMetaFieldTypeNumber = z.literal("number")

export const zDocMetaFieldTypeBoolean = z.literal("boolean")

export const zDocMetaFieldTypeSelectText = z.literal("select-text")

export const zDocMetaFieldTypeSelectNumber = z.literal("select-number")

export const zDocMetaFieldTypeRelation = z.literal("relation")

export const zDocMetaFieldTypeMultiText = z.literal("multi-text")

export const zDocMetaFieldTypeMultiNumber = z.literal("multi-number")

export const zDocMetaFieldTypeMultiRelation = z.literal("multi-relation")

export const zDocMetaFieldTypeMultiSelectText = z.literal("multi-select-text")

export const zDocMetaFieldTypeMultiSelectNumber = z.literal(
  "multi-select-number",
)

/**
 * Available types for schema fields
 */
export const zDocMetaFieldType = z.union([
  zDocMetaFieldTypeText,
  zDocMetaFieldTypeNumber,
  zDocMetaFieldTypeBoolean,
  zDocMetaFieldTypeMultiText,
  zDocMetaFieldTypeMultiNumber,
  zDocMetaFieldTypeRelation,
  zDocMetaFieldTypeMultiRelation,
  zDocMetaFieldTypeSelectText,
  zDocMetaFieldTypeSelectNumber,
  zDocMetaFieldTypeMultiSelectText,
  zDocMetaFieldTypeMultiSelectNumber,
])

/**
 * Text field
 */
export const zDocSchemaFieldText = z.object({
  type: zDocMetaFieldTypeText,
  required: z.boolean(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  default: z.string().nullable(),
})

/**
 * Number field
 */
export const zDocSchemaFieldNumber = z.object({
  type: zDocMetaFieldTypeNumber,
  required: z.boolean(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  default: z.number().nullable(),
})

/**
 * Boolean field
 */
export const zDocSchemaFieldBoolean = z.object({
  type: zDocMetaFieldTypeBoolean,
  required: z.boolean(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  default: z.boolean().nullable(),
})

/**
 * Multi-text field
 */
export const zDocSchemaFieldMultiText = z.object({
  type: zDocMetaFieldTypeMultiText,
  required: z.boolean(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  default: z.array(z.string()).nullable(),
})

/**
 * Multi-number field
 */
export const zDocSchemaFieldMultiNumber = z.object({
  type: zDocMetaFieldTypeMultiNumber,
  required: z.boolean(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  default: z.array(z.number()).nullable(),
})

/**
 * Relation field
 */
export const zDocSchemaFieldRelation = z.object({
  type: zDocMetaFieldTypeRelation,
  required: z.boolean(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  path: z.string().min(1),
  default: z.string().nullable(),
})

/**
 * Multi-relation field
 */
export const zDocSchemaFieldMultiRelation = z.object({
  type: zDocMetaFieldTypeMultiRelation,
  required: z.boolean(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  path: z.string().min(1),
  default: z.array(z.string()).nullable(),
})

/**
 * Select text field
 */
export const zDocSchemaFieldSelectText = z.object({
  type: zDocMetaFieldTypeSelectText,
  required: z.boolean(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  options: z.array(z.string()),
  default: z.string().nullable(),
})

/**
 * Select number field
 */
export const zDocSchemaFieldSelectNumber = z.object({
  type: zDocMetaFieldTypeSelectNumber,
  required: z.boolean(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  options: z.array(z.number()),
  default: z.number().nullable(),
})

/**
 * Multi-select text field
 */
export const zDocSchemaFieldMultiSelectText = z.object({
  type: zDocMetaFieldTypeMultiSelectText,
  required: z.boolean(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  options: z.array(z.string()),
  default: z.array(z.string()).nullable(),
})

/**
 * Multi-select number field
 */
export const zDocSchemaFieldMultiSelectNumber = z.object({
  type: zDocMetaFieldTypeMultiSelectNumber,
  required: z.boolean(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  options: z.array(z.number()),
  default: z.array(z.number()).nullable(),
})

/**
 * Union type for schema fields
 */
export const zDocFileIndexSchemaField = z.union([
  zDocSchemaFieldText,
  zDocSchemaFieldNumber,
  zDocSchemaFieldBoolean,
  zDocSchemaFieldMultiText,
  zDocSchemaFieldMultiNumber,
  zDocSchemaFieldRelation,
  zDocSchemaFieldMultiRelation,
  zDocSchemaFieldSelectText,
  zDocSchemaFieldSelectNumber,
  zDocSchemaFieldMultiSelectText,
  zDocSchemaFieldMultiSelectNumber,
])

export const zDocMetaFieldText = z.string().nullable()

export const zDocMetaFieldBoolean = z.boolean().nullable()

export const zDocMetaFieldNumber = z.number().nullable()

export const zDocMetaFieldSelectText = z.string().nullable()

export const zDocMetaFieldSelectNumber = z.number().nullable()

export const zDocMetaFieldRelation = z.string().nullable()

export const zDocMetaFieldMultiText = z.string().array()

export const zDocMetaFieldMultiNumber = z.number().array()

export const zDocMetaFieldMultiSelectText = z.string().array()

export const zDocMetaFieldMultiSelectNumber = z.number().array()

export const zDocMetaFieldMultiRelation = z.string().array()

export const zDocMetaField = z.union([
  zDocMetaFieldText,
  zDocMetaFieldBoolean,
  zDocMetaFieldNumber,
  zDocMetaFieldSelectText,
  zDocMetaFieldSelectNumber,
  zDocMetaFieldRelation,
  zDocMetaFieldMultiText,
  zDocMetaFieldMultiNumber,
  zDocMetaFieldMultiSelectText,
  zDocMetaFieldMultiSelectNumber,
  zDocMetaFieldMultiRelation,
])

/**
 * FrontMatter schema (internal use - only nullable)
 */
export const zDocFileMdMeta = z.record(z.string(), zDocMetaField)

/**
 * FrontMatter input schema (allows undefined for external APIs)
 * Transforms undefined to null for internal consistency
 */
export const zDocFileMdMetaInput = z.record(
  z.string(),
  zDocMetaField.or(z.undefined()),
)

/**
 * Schema definition
 * Mapping of field names to schema fields
 */
export const zDocFileIndexSchema = z.record(
  z.string(),
  zDocFileIndexSchemaField,
)

/**
 * Schema definition input (allows undefined for external APIs)
 */
export const zDocFileIndexSchemaInput = z.record(
  z.string(),
  zDocFileIndexSchemaField.or(z.undefined()),
)

export const zDocCustomSchemaFieldText = z.object({
  type: zDocMetaFieldTypeText,
  required: z.boolean(),
})

export const zDocCustomSchemaFieldNumber = z.object({
  type: zDocMetaFieldTypeNumber,
  required: z.boolean(),
})

export const zDocCustomSchemaFieldBoolean = z.object({
  type: zDocMetaFieldTypeBoolean,
  required: z.boolean(),
})

export const zDocCustomSchemaFieldRelation = z.object({
  type: zDocMetaFieldTypeRelation,
  required: z.boolean(),
})

export const zDocCustomSchemaFieldSelectText = z.object({
  type: zDocMetaFieldTypeSelectText,
  required: z.boolean(),
})

export const zDocCustomSchemaFieldSelectNumber = z.object({
  type: zDocMetaFieldTypeSelectNumber,
  required: z.boolean(),
})

export const zDocCustomSchemaFieldMultiText = z.object({
  type: zDocMetaFieldTypeMultiText,
  required: z.boolean(),
})

export const zDocCustomSchemaFieldMultiNumber = z.object({
  type: zDocMetaFieldTypeMultiNumber,
  required: z.boolean(),
})

export const zDocCustomSchemaFieldMultiRelation = z.object({
  type: zDocMetaFieldTypeMultiRelation,
  required: z.boolean(),
})

export const zDocCustomSchemaFieldMultiSelectText = z.object({
  type: zDocMetaFieldTypeMultiSelectText,
  required: z.boolean(),
})

export const zDocCustomSchemaFieldMultiSelectNumber = z.object({
  type: zDocMetaFieldTypeMultiSelectNumber,
  required: z.boolean(),
})

/**
 * For dynamic schema generation
 */
export const zDocCustomSchemaField = z.union([
  zDocCustomSchemaFieldText,
  zDocCustomSchemaFieldNumber,
  zDocCustomSchemaFieldBoolean,
  zDocCustomSchemaFieldRelation,
  zDocCustomSchemaFieldSelectText,
  zDocCustomSchemaFieldSelectNumber,
  zDocCustomSchemaFieldMultiText,
  zDocCustomSchemaFieldMultiNumber,
  zDocCustomSchemaFieldMultiRelation,
  zDocCustomSchemaFieldMultiSelectText,
  zDocCustomSchemaFieldMultiSelectNumber,
])

/**
 * Minimal schema definition
 * For dynamic validation
 */
export const zDocCustomSchema = z.record(z.string(), zDocCustomSchemaField)

/**
 * FrontMatter schema for index.md files
 * Contains only icon and schema fields
 */
export const zDocFileIndexMeta = z.object({
  type: z.literal("index-meta"),
  icon: z.string().nullable(),
  schema: zDocFileIndexSchema,
})

/**
 * FrontMatter input schema for index.md files (allows undefined for external APIs)
 */
export const zDocFileIndexMetaInput = z.object({
  type: z.literal("index-meta"),
  icon: z.string().nullable().or(z.undefined()),
  schema: zDocFileIndexSchemaInput,
})

/**
 * Relation field
 */
export const zDocRelationField = z.object({
  fieldName: z.string(),
  filePath: z.string(),
  isArray: z.boolean(),
})

/**
 * Relation options
 */
export const zDocRelationFile = z.object({
  name: z.string(),
  label: z.string().nullable(),
  value: z.string().nullable(),
  path: z.string().nullable(),
})

/**
 * Relation group
 */
export const zDocRelation = z.object({
  path: z.string(),
  files: z.array(zDocRelationFile),
})

/**
 * Markdown content information (for regular MD files) - internal use
 */
export const zDocFileMdContent = z.object({
  type: z.literal("markdown-content"),
  body: z.string(),
  title: z.string(),
  description: z.string(),
  meta: zDocFileMdMeta,
})

/**
 * Markdown content input (allows undefined in meta) - for external APIs
 */
export const zDocFileMdContentInput = z.object({
  type: z.literal("markdown-content"),
  body: z.string(),
  title: z.string(),
  description: z.string(),
  meta: zDocFileMdMetaInput,
})

/**
 * Markdown content information (for index files)
 */
export const zDocFileIndexContent = z.object({
  type: z.literal("markdown-index"),
  body: z.string(),
  title: z.string(),
  description: z.string(),
  meta: zDocFileIndexMeta,
})

/**
 * index.md file
 */
export const zDocFileIndex = z.object({
  type: z.literal("index"),
  path: zDocFilePath,
  content: zDocFileIndexContent,
  isArchived: z.boolean(),
})

/**
 * Other files (non-markdown)
 */
export const zDocFileUnknown = z.object({
  type: z.literal("unknown"),
  path: zDocFilePath,
  content: z.string(),
  extension: z.string(),
  isArchived: z.boolean(),
})

/**
 * Markdown file (excluding index.md) - internal use
 */
export const zDocFileMd = z.object({
  type: z.literal("markdown"),
  path: zDocFilePath,
  content: zDocFileMdContent,
  isArchived: z.boolean(),
})

/**
 * Markdown file input (allows undefined in meta) - for external APIs
 */
export const zDocFileMdInput = z.object({
  type: z.literal("markdown"),
  path: zDocFilePath,
  content: zDocFileMdContentInput,
  isArchived: z.boolean(),
})

/**
 * File union type (index.md, regular md, other)
 */
export const zDocFile = z.union([zDocFileIndex, zDocFileMd, zDocFileUnknown])

export const zDocFileDirectory = z.union([zDocFileMd, zDocFileUnknown])

/**
 * File node (for files only)
 */
export const zDocTreeFileNode = z.object({
  type: z.literal("file"),
  name: z.string(),
  path: z.string(),
  icon: z.string(),
  title: z.string(),
})

/**
 * Directory node (for directories only)
 */
export const zDocTreeDirectoryNode: z.ZodSchema = z.lazy(() => {
  return z.object({
    type: z.literal("directory"),
    name: z.string(),
    path: z.string(),
    icon: z.string(),
    title: z.string(),
    children: z.array(z.union([zDocTreeFileNode, zDocTreeDirectoryNode])),
  })
})

/**
 * Unified tree node type
 */
export const zDocTreeNode = z.union([zDocTreeFileNode, zDocTreeDirectoryNode])

/**
 * DocClient configuration
 */
export const zDocClientConfig = z.object({
  defaultIndexIcon: z.string(),
  indexFileName: z.string(),
  archiveDirectoryName: z.string(),
  defaultDirectoryName: z.string(),
  indexMetaIncludes: z.array(z.string()),
  directoryExcludes: z.array(z.string()),
  metaFileName: z.string().optional(),
})

/**
 * Directory meta (.meta.json)
 */
export const zDocDirectoryMeta = z.object({
  icon: z.string().nullable().optional(),
  schema: zDocFileIndexSchema.optional(),
})
