import { zDocFileMdContent } from "@/models"
import type {
  BaseFieldValueType,
  DocCustomSchema,
  DocFileMdContent,
  ExtractFieldType,
  UpdateFunction,
} from "@/types"
import { DocMarkdownSystem } from "../modules/markdown-system/doc-markdown-system"
import { DocFileMdMetaValue } from "./doc-file-md-meta-value"

/**
 * File: Markdown > Content
 */
export class DocFileMdContentValue<T extends DocCustomSchema> {
  constructor(
    readonly value: DocFileMdContent<T>,
    private readonly customSchema: T,
  ) {
    zDocFileMdContent.parse(value)
    Object.freeze(this)
  }

  /**
   * Content body (does not include frontMatter)
   */
  get body(): string {
    return this.value.body
  }

  /**
   * Title
   */
  get title(): string {
    return this.value.title
  }

  /**
   * Description
   */
  get description(): string {
    return this.value.description
  }

  /**
   * FrontMatter (uses constructor's Zod schema or argument schema)
   */
  meta(): DocFileMdMetaValue<T> {
    return new DocFileMdMetaValue<T>(this.value.meta, this.customSchema)
  }

  /**
   * Update title
   */
  withTitle(title: string): DocFileMdContentValue<T> {
    const fullText = this.toText()

    const engine = new DocMarkdownSystem()

    const draftText = engine.updateTitle(fullText, title)

    const draftBody = engine.extractBody(draftText)

    return new DocFileMdContentValue(
      {
        type: "markdown-content",
        body: draftBody,
        title,
        description: this.description,
        meta: this.value.meta,
      },
      this.customSchema,
    )
  }

  /**
   * Update description
   */
  withDescription(
    description: string,
    defaultTitle?: string,
  ): DocFileMdContentValue<T> {
    const fullText = this.toText()
    const engine = new DocMarkdownSystem()
    const updatedText = engine.updateDescription(
      fullText,
      description,
      defaultTitle || this.title,
    )
    const updatedBody = engine.extractBody(updatedText)
    return new DocFileMdContentValue(
      {
        type: "markdown-content",
        body: updatedBody,
        title: this.title,
        description,
        meta: this.value.meta,
      },
      this.customSchema,
    )
  }

  /**
   * Update body
   */
  withBody(body: string): DocFileMdContentValue<T> {
    const engine = new DocMarkdownSystem()
    return new DocFileMdContentValue(
      {
        type: "markdown-content",
        body: body,
        title: engine.extractTitle(body) || "",
        description: engine.extractDescription(body) || "",
        meta: this.value.meta,
      },
      this.customSchema,
    )
  }

  /**
   * @deprecated Use `withBody` instead
   */
  withContent(content: string): DocFileMdContentValue<T> {
    return this.withBody(content)
  }

  /**
   * Update FrontMatter
   */
  withMeta<U extends DocCustomSchema>(
    meta: DocFileMdMetaValue<U>,
  ): DocFileMdContentValue<U>

  withMeta(
    updater: UpdateFunction<DocFileMdMetaValue<T>>,
  ): DocFileMdContentValue<T>

  withMeta<U extends DocCustomSchema>(
    metaOrUpdater:
      | DocFileMdMetaValue<U>
      | UpdateFunction<DocFileMdMetaValue<T>>,
  ): DocFileMdContentValue<U> | DocFileMdContentValue<T> {
    if (typeof metaOrUpdater === "function") {
      const updatedMeta = metaOrUpdater(this.meta())
      return new DocFileMdContentValue(
        {
          type: "markdown-content",
          body: this.body,
          title: this.title,
          description: this.description,
          meta: updatedMeta.value,
        },
        updatedMeta.customSchema,
      )
    }
    const meta = metaOrUpdater
    return new DocFileMdContentValue(
      {
        type: "markdown-content",
        body: this.body,
        title: this.title,
        description: this.description,
        meta: meta.value,
      },
      meta.customSchema,
    )
  }

  /**
   * Update specific property of FrontMatter
   */
  withMetaProperty<K extends keyof T>(
    key: K,
    value: BaseFieldValueType<ExtractFieldType<T[K]>>,
  ): DocFileMdContentValue<T> {
    const current = this.meta()
    const draft = current.withProperty(key, value)
    return this.withMeta(draft)
  }

  /**
   * Generate from Markdown text
   */
  static fromMarkdown<T extends DocCustomSchema>(
    markdown: string,
    customSchema: T,
  ): DocFileMdContentValue<T> {
    const engine = new DocMarkdownSystem()

    const metaText = engine.extractFrontMatter(markdown)

    const frontMatter = metaText
      ? DocFileMdMetaValue.fromYamlText(metaText, customSchema)
      : DocFileMdMetaValue.empty(customSchema)

    return new DocFileMdContentValue(
      {
        type: "markdown-content",
        body: engine.extractBody(markdown),
        title: engine.extractTitle(markdown) || "",
        description: engine.extractDescription(markdown) || "",
        meta: frontMatter.value,
      },
      customSchema,
    )
  }

  /**
   * Generate complete text combining FrontMatter and body
   */
  toText(): string {
    return `---\n${this.meta().toYaml()}\n---\n\n${this.body}`
  }

  /**
   * Generate empty content
   */
  static empty<T extends DocCustomSchema = DocCustomSchema>(
    title: string,
    customSchema: T,
  ): DocFileMdContentValue<T> {
    const meta = DocFileMdMetaValue.empty(customSchema)

    return new DocFileMdContentValue(
      {
        type: "markdown-content",
        body: `# ${title}`,
        title,
        description: "",
        meta: meta.value,
      },
      customSchema,
    )
  }

  /**
   * Output in JSON format
   */
  toJson(): DocFileMdContent<T> {
    return this.value
  }
}
