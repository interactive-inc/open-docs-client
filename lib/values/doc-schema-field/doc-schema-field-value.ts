import type { RecordKey } from "@/types"
import type { DocSchemaFieldBooleanValue } from "./doc-schema-field-boolean-value"
import type { DocSchemaFieldMultiNumberValue } from "./doc-schema-field-multi-number-value"
import type { DocSchemaFieldMultiRelationValue } from "./doc-schema-field-multi-relation-value"
import type { DocSchemaFieldMultiSelectNumberValue } from "./doc-schema-field-multi-select-number-value"
import type { DocSchemaFieldMultiSelectTextValue } from "./doc-schema-field-multi-select-text-value"
import type { DocSchemaFieldMultiTextValue } from "./doc-schema-field-multi-text-value"
import type { DocSchemaFieldNumberValue } from "./doc-schema-field-number-value"
import type { DocSchemaFieldRelationValue } from "./doc-schema-field-relation-value"
import type { DocSchemaFieldSelectNumberValue } from "./doc-schema-field-select-number-value"
import type { DocSchemaFieldSelectTextValue } from "./doc-schema-field-select-text-value"
import type { DocSchemaFieldTextValue } from "./doc-schema-field-text-value"

/**
 * Multiple value type fields (multi-* types)
 */
export type DocSchemaFieldMultipleTypes<T extends RecordKey> =
  | DocSchemaFieldMultiTextValue<T>
  | DocSchemaFieldMultiNumberValue<T>
  | DocSchemaFieldMultiSelectTextValue<T>
  | DocSchemaFieldMultiSelectNumberValue<T>
  | DocSchemaFieldMultiRelationValue<T>

/**
 * Single value type fields
 */
export type DocSchemaFieldSingleTypes<T extends RecordKey> =
  | DocSchemaFieldTextValue<T>
  | DocSchemaFieldNumberValue<T>
  | DocSchemaFieldBooleanValue<T>
  | DocSchemaFieldSelectTextValue<T>
  | DocSchemaFieldSelectNumberValue<T>
  | DocSchemaFieldRelationValue<T>

export type DocSchemaFieldValue<T extends RecordKey> =
  | DocSchemaFieldSingleTypes<T>
  | DocSchemaFieldMultipleTypes<T>
