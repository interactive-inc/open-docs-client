import type { z } from "zod"
import { zDocFileMd } from "@/models"
import type {
  DocCustomSchema,
  DocFileMd,
  DocFilePath,
  UpdateFunction,
} from "@/types"
import type { DocFileMdMetaValue } from "@/values/doc-file-md-meta-value"
import { DocFileMdContentValue } from "../values/doc-file-md-content-value"

/**
 * Markdown file entity
 */
export class DocFileMdEntity<T extends DocCustomSchema> {
  constructor(
    readonly value: DocFileMd<T>,
    private readonly customSchema: T,
  ) {
    zDocFileMd.parse(value)
    Object.freeze(this)
  }

  /**
   * Content
   */
  content(): DocFileMdContentValue<T> {
    return new DocFileMdContentValue<T>(this.value.content, this.customSchema)
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
  withContent(content: DocFileMdContentValue<T>): DocFileMdEntity<T>

  withContent(
    updater: UpdateFunction<DocFileMdContentValue<T>>,
  ): DocFileMdEntity<T>

  withContent(
    contentOrUpdater:
      | DocFileMdContentValue<T>
      | UpdateFunction<DocFileMdContentValue<T>>,
  ): DocFileMdEntity<T> {
    if (typeof contentOrUpdater === "function") {
      const updatedContent = contentOrUpdater(this.content())
      return new DocFileMdEntity<T>(
        { ...this.value, content: updatedContent.value },
        this.customSchema,
      )
    }
    return new DocFileMdEntity<T>(
      { ...this.value, content: contentOrUpdater.value },
      this.customSchema,
    )
  }

  /**
   * Update path
   */
  withPath(path: DocFilePath): DocFileMdEntity<T>

  withPath(updater: UpdateFunction<DocFilePath>): DocFileMdEntity<T>

  withPath(
    pathOrUpdater: DocFilePath | UpdateFunction<DocFilePath>,
  ): DocFileMdEntity<T> {
    if (typeof pathOrUpdater === "function") {
      const updatedPath = pathOrUpdater(this.path)
      return new DocFileMdEntity<T>(
        { ...this.value, path: updatedPath },
        this.customSchema,
      )
    }
    return new DocFileMdEntity<T>(
      { ...this.value, path: pathOrUpdater },
      this.customSchema,
    )
  }

  withMeta(meta: DocFileMdMetaValue<T>): DocFileMdEntity<T>

  withMeta(updater: UpdateFunction<DocFileMdMetaValue<T>>): DocFileMdEntity<T>

  withMeta(
    metaOrUpdater:
      | DocFileMdMetaValue<T>
      | UpdateFunction<DocFileMdMetaValue<T>>,
  ): DocFileMdEntity<T> {
    if (typeof metaOrUpdater === "function") {
      const currentMeta = this.content().meta()
      const updatedMeta = metaOrUpdater(currentMeta)
      const draft = this.content().withMeta(updatedMeta)
      return new DocFileMdEntity<T>(
        {
          ...this.value,
          content: draft.value,
        },
        this.customSchema,
      )
    }
    const draft = this.content().withMeta(metaOrUpdater)
    return new DocFileMdEntity<T>(
      {
        ...this.value,
        content: draft.value,
      },
      this.customSchema,
    )
  }

  withTitle(title: string): DocFileMdEntity<T> {
    const draft = this.content().withTitle(title)
    return new DocFileMdEntity<T>(
      {
        ...this.value,
        content: draft.value,
      },
      this.customSchema,
    )
  }

  withDescription(
    description: string,
    defaultTitle?: string,
  ): DocFileMdEntity<T> {
    const draft = this.content().withDescription(description, defaultTitle)
    return new DocFileMdEntity<T>(
      {
        ...this.value,
        content: draft.value,
      },
      this.customSchema,
    )
  }

  /**
   * z.infer<typeof zDocFileMd>
   */
  toJson(): z.infer<typeof zDocFileMd> {
    return zDocFileMd.parse(this.value)
  }
}
