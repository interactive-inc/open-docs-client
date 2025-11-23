import { zDocFileIndex } from "@/models"
import type {
  DocClientConfig,
  DocCustomSchema,
  DocFileIndex,
  DocFileIndexAny,
  DocFilePath,
  UpdateFunction,
} from "@/types"
import { DocFileIndexContentValue } from "../values/doc-file-index-content-value"

/**
 * Document directory entity
 */
export class DocFileIndexEntity<T extends DocCustomSchema> {
  constructor(
    readonly value: DocFileIndex<T>,
    private readonly customSchema: T,
    private readonly config: DocClientConfig = {
      defaultIndexIcon: "📁",
      indexFileName: "index.md",
      archiveDirectoryName: "_",
      defaultDirectoryName: "Directory",
      indexMetaIncludes: [],
      directoryExcludes: [".vitepress"],
    },
  ) {
    zDocFileIndex.parse(value)
    Object.freeze(this)
  }

  /**
   * Content
   */
  get content(): DocFileIndexContentValue<T> {
    return new DocFileIndexContentValue<T>(
      this.value.content,
      this.customSchema,
      this.config,
    )
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
  withContent(content: DocFileIndexContentValue<T>): DocFileIndexEntity<T>

  withContent(
    updater: UpdateFunction<DocFileIndexContentValue<T>>,
  ): DocFileIndexEntity<T>

  withContent(
    contentOrUpdater:
      | DocFileIndexContentValue<T>
      | UpdateFunction<DocFileIndexContentValue<T>>,
  ): DocFileIndexEntity<T> {
    if (typeof contentOrUpdater === "function") {
      const updatedContent = contentOrUpdater(this.content)
      return new DocFileIndexEntity<T>(
        { ...this.value, content: updatedContent.value },
        this.customSchema,
        this.config,
      )
    }
    return new DocFileIndexEntity<T>(
      { ...this.value, content: contentOrUpdater.value },
      this.customSchema,
      this.config,
    )
  }

  /**
   * Update path
   */
  withPath(path: DocFilePath): DocFileIndexEntity<T>

  withPath(updater: UpdateFunction<DocFilePath>): DocFileIndexEntity<T>

  withPath(
    pathOrUpdater: DocFilePath | UpdateFunction<DocFilePath>,
  ): DocFileIndexEntity<T> {
    if (typeof pathOrUpdater === "function") {
      const updatedPath = pathOrUpdater(this.path)
      return new DocFileIndexEntity<T>(
        { ...this.value, path: updatedPath },
        this.customSchema,
        this.config,
      )
    }
    return new DocFileIndexEntity<T>(
      { ...this.value, path: pathOrUpdater },
      this.customSchema,
      this.config,
    )
  }

  /**
   * z.infer<typeof zDocFileIndex>
   */
  toJson(): DocFileIndexAny {
    return this.value
  }
}
