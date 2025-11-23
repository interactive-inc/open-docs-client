import type { DocCustomSchema } from "@/types"
import type { DocFileIndexEntity } from "./doc-file-index-entity"
import type { DocFileMdEntity } from "./doc-file-md-entity"
import type { DocFileUnknownEntity } from "./doc-file-unknown-entity"

export type DocFileEntity<T extends DocCustomSchema> =
  | DocFileMdEntity<T>
  | DocFileIndexEntity<T>
  | DocFileUnknownEntity

export type DocFileDirectoryEntity<T extends DocCustomSchema> =
  | DocFileMdEntity<T>
  | DocFileUnknownEntity
