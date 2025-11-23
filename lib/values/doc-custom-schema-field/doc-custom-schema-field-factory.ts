import type { DocCustomSchemaField, RecordKey } from "@/types"
import { DocCustomSchemaFieldBooleanValue } from "./doc-custom-schema-field-boolean-value"
import { DocCustomSchemaFieldMultiNumberValue } from "./doc-custom-schema-field-multi-number-value"
import { DocCustomSchemaFieldMultiRelationValue } from "./doc-custom-schema-field-multi-relation-value"
import { DocCustomSchemaFieldMultiSelectNumberValue } from "./doc-custom-schema-field-multi-select-number-value"
import { DocCustomSchemaFieldMultiSelectTextValue } from "./doc-custom-schema-field-multi-select-text-value"
import { DocCustomSchemaFieldMultiTextValue } from "./doc-custom-schema-field-multi-text-value"
import { DocCustomSchemaFieldNumberValue } from "./doc-custom-schema-field-number-value"
import { DocCustomSchemaFieldRelationValue } from "./doc-custom-schema-field-relation-value"
import { DocCustomSchemaFieldSelectNumberValue } from "./doc-custom-schema-field-select-number-value"
import { DocCustomSchemaFieldSelectTextValue } from "./doc-custom-schema-field-select-text-value"
import { DocCustomSchemaFieldTextValue } from "./doc-custom-schema-field-text-value"

export class DocCustomSchemaFieldFactory {
  fromType<K extends RecordKey>(key: K, field: DocCustomSchemaField) {
    if (field.type === "text") {
      return new DocCustomSchemaFieldTextValue(key, field)
    }

    if (field.type === "number") {
      return new DocCustomSchemaFieldNumberValue(key, field)
    }

    if (field.type === "boolean") {
      return new DocCustomSchemaFieldBooleanValue(key, field)
    }

    if (field.type === "select-text") {
      return new DocCustomSchemaFieldSelectTextValue(key, field)
    }

    if (field.type === "select-number") {
      return new DocCustomSchemaFieldSelectNumberValue(key, field)
    }

    if (field.type === "relation") {
      return new DocCustomSchemaFieldRelationValue(key, field)
    }

    if (field.type === "multi-text") {
      return new DocCustomSchemaFieldMultiTextValue(key, field)
    }

    if (field.type === "multi-number") {
      return new DocCustomSchemaFieldMultiNumberValue(key, field)
    }

    if (field.type === "multi-select-text") {
      return new DocCustomSchemaFieldMultiSelectTextValue(key, field)
    }

    if (field.type === "multi-select-number") {
      return new DocCustomSchemaFieldMultiSelectNumberValue(key, field)
    }

    if (field.type === "multi-relation") {
      return new DocCustomSchemaFieldMultiRelationValue(key, field)
    }

    throw new Error("Unknown field type")
  }
}
