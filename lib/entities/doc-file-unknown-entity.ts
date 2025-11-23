import type { z } from "zod"
import { zDocFileUnknown } from "@/models"
import type { DocFilePath, DocFileUnknown, UpdateFunction } from "@/types"

/**
 * Unknown file entity
 */
export class DocFileUnknownEntity {
  constructor(readonly value: DocFileUnknown) {
    zDocFileUnknown.parse(value)
    Object.freeze(this)
  }

  /**
   * Content
   */
  get content(): string {
    return this.value.content
  }

  /**
   * Path information
   */
  get path(): DocFilePath {
    return this.value.path
  }

  /**
   * Update content
   */
  withContent(content: string): DocFileUnknownEntity {
    return new DocFileUnknownEntity({
      ...this.value,
      content: content,
    })
  }

  /**
   * Update path
   */
  withPath(path: DocFilePath): DocFileUnknownEntity

  withPath(updater: UpdateFunction<DocFilePath>): DocFileUnknownEntity

  withPath(
    pathOrUpdater: DocFilePath | UpdateFunction<DocFilePath>,
  ): DocFileUnknownEntity {
    if (typeof pathOrUpdater === "function") {
      const updatedPath = pathOrUpdater(this.path)
      return new DocFileUnknownEntity({
        ...this.value,
        path: updatedPath,
      })
    }
    return new DocFileUnknownEntity({
      ...this.value,
      path: pathOrUpdater,
    })
  }

  toJson(): z.infer<typeof zDocFileUnknown> {
    return zDocFileUnknown.parse(this.value)
  }
}
