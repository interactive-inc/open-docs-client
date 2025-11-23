import type { RecordKey } from "@/types"
import type { DocMetaFieldBooleanValue } from "@/values/doc-meta-field/doc-meta-field-boolean-value"
import type { DocMetaFieldMultiNumberValue } from "@/values/doc-meta-field/doc-meta-field-multi-number-value"
import type { DocMetaFieldMultiRelationValue } from "@/values/doc-meta-field/doc-meta-field-multi-relation-value"
import type { DocMetaFieldMultiSelectNumberValue } from "@/values/doc-meta-field/doc-meta-field-multi-select-number-value"
import type { DocMetaFieldMultiSelectTextValue } from "@/values/doc-meta-field/doc-meta-field-multi-select-text-value"
import type { DocMetaFieldMultiTextValue } from "@/values/doc-meta-field/doc-meta-field-multi-text-value"
import type { DocMetaFieldNumberValue } from "@/values/doc-meta-field/doc-meta-field-number-value"
import type { DocMetaFieldRelationValue } from "@/values/doc-meta-field/doc-meta-field-relation-value"
import type { DocMetaFieldSelectNumberValue } from "@/values/doc-meta-field/doc-meta-field-select-number-value"
import type { DocMetaFieldSelectTextValue } from "@/values/doc-meta-field/doc-meta-field-select-text-value"
import type { DocMetaFieldTextValue } from "@/values/doc-meta-field/doc-meta-field-text-value"

export type DocMetaFieldValue<K extends RecordKey> =
  | DocMetaFieldTextValue<K>
  | DocMetaFieldNumberValue<K>
  | DocMetaFieldBooleanValue<K>
  | DocMetaFieldMultiTextValue<K>
  | DocMetaFieldMultiNumberValue<K>
  | DocMetaFieldRelationValue<K>
  | DocMetaFieldMultiRelationValue<K>
  | DocMetaFieldSelectTextValue<K>
  | DocMetaFieldSelectNumberValue<K>
  | DocMetaFieldMultiSelectTextValue<K>
  | DocMetaFieldMultiSelectNumberValue<K>
