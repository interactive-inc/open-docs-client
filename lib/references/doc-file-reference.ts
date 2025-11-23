import type { DocFileIndexReference } from "@/references/doc-file-index-reference"
import type { DocFileMdReference } from "@/references/doc-file-md-reference"
import type { DocFileUnknownReference } from "@/references/doc-file-unknown-reference"
import type { DocCustomSchema } from "@/types"

export type DocFileReference<T extends DocCustomSchema> =
  | DocFileIndexReference<T>
  | DocFileMdReference<T>
  | DocFileUnknownReference<T>

export type DocFileDirectoryReference<T extends DocCustomSchema> =
  | DocFileMdReference<T>
  | DocFileUnknownReference<T>
