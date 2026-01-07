import { stringify } from "yaml"
import { zDocFileIndexContent } from "@/models"
import type {
  DocClientConfig,
  DocCustomSchema,
  DocDirectoryMeta,
  DocFileIndexContent,
  DocFileIndexMeta,
  DocFileIndexSchema,
} from "@/types"
import { DocMarkdownSystem } from "../modules/markdown-system/doc-markdown-system"
import { DocFileIndexMetaValue } from "./doc-file-index-meta-value"

/**
 * File: index.md > content
 */
export class DocFileIndexContentValue<T extends DocCustomSchema> {
  constructor(
    readonly value: DocFileIndexContent<T>,
    private readonly customSchema: T,
    private readonly config: DocClientConfig,
  ) {
    zDocFileIndexContent.parse(value)
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
   * FrontMatter
   */
  meta(): DocFileIndexMetaValue<T> {
    return new DocFileIndexMetaValue<T>(
      this.value.meta,
      this.customSchema,
      this.config,
    )
  }

  /**
   * Update title
   */
  withTitle(title: string): DocFileIndexContentValue<T> {
    const engine = new DocMarkdownSystem()
    const updatedBody = engine.updateTitle(this.body, title)
    return new DocFileIndexContentValue<T>(
      { ...this.value, title, body: updatedBody },
      this.customSchema,
      this.config,
    )
  }

  /**
   * Update description
   */
  withDescription(
    description: string,
    defaultTitle?: string,
  ): DocFileIndexContentValue<T> {
    const engine = new DocMarkdownSystem()
    const updatedBody = engine.updateDescription(
      this.body,
      description,
      defaultTitle || this.title,
    )
    return new DocFileIndexContentValue<T>(
      {
        ...this.value,
        body: updatedBody,
        description,
      },
      this.customSchema,
      this.config,
    )
  }

  /**
   * Generate from Markdown text
   */
  static fromMarkdown<T extends DocCustomSchema>(
    markdown: string,
    customSchema: T,
    config: DocClientConfig,
  ) {
    const engine = new DocMarkdownSystem()

    const frontMatter = DocFileIndexMetaValue.from(
      markdown,
      customSchema,
      config,
    )

    return new DocFileIndexContentValue<T>(
      {
        type: "markdown-index",
        body: engine.extractBody(markdown),
        title: engine.extractTitle(markdown) || "",
        description: engine.extractDescription(markdown) || "",
        meta: frontMatter.toJson(),
      },
      customSchema,
      config,
    )
  }

  /**
   * Generate from Markdown text with .meta.json
   * FrontMatter is ignored, only body/title/description are extracted
   */
  static fromMarkdownWithDirectoryMeta<T extends DocCustomSchema>(
    markdown: string,
    customSchema: T,
    config: DocClientConfig,
    directoryMeta: DocDirectoryMeta,
  ) {
    const engine = new DocMarkdownSystem()

    const meta: DocFileIndexMeta<T> = {
      type: "index-meta",
      icon: directoryMeta.icon ?? config.defaultIndexIcon,
      schema: (directoryMeta.schema ?? {}) as DocFileIndexSchema<keyof T>,
    }

    return new DocFileIndexContentValue<T>(
      {
        type: "markdown-index",
        body: engine.extractBody(markdown),
        title: engine.extractTitle(markdown) || "",
        description: engine.extractDescription(markdown) || "",
        meta,
      },
      customSchema,
      config,
    )
  }

  /**
   * Update content
   */
  withBody(body: string): DocFileIndexContentValue<T> {
    const engine = new DocMarkdownSystem()
    return new DocFileIndexContentValue<T>(
      {
        type: "markdown-index",
        body: body,
        title: engine.extractTitle(body) || "",
        description: engine.extractDescription(body) || "",
        meta: this.value.meta,
      },
      this.customSchema,
      this.config,
    )
  }

  /**
   * @deprecated Use `withBody` instead
   */
  withContent(body: string): DocFileIndexContentValue<T> {
    return this.withBody(body)
  }

  /**
   * Update FrontMatter
   */
  withMeta(meta: DocFileIndexMeta<T>) {
    return new DocFileIndexContentValue(
      {
        type: "markdown-index",
        body: this.body,
        title: this.title,
        description: this.description,
        meta: meta,
      },
      this.customSchema,
      this.config,
    )
  }

  /**
   * Generate default index.md content
   */
  static empty<T extends DocCustomSchema = DocCustomSchema>(
    directoryName: string,
    customSchema: T,
    config: DocClientConfig,
  ): DocFileIndexContentValue<T> {
    const content = `---\ntitle: "${directoryName}"\ndescription: ""\nicon: ""\nschema: {}\n---\n\n# ${directoryName}\n`
    return DocFileIndexContentValue.fromMarkdown<T>(
      content,
      customSchema,
      config,
    )
  }

  /**
   * Generate default index.md content with .meta.json
   */
  static emptyWithDirectoryMeta<T extends DocCustomSchema = DocCustomSchema>(
    directoryName: string,
    customSchema: T,
    config: DocClientConfig,
    directoryMeta: DocDirectoryMeta,
  ): DocFileIndexContentValue<T> {
    const meta: DocFileIndexMeta<T> = {
      type: "index-meta",
      icon: directoryMeta.icon ?? config.defaultIndexIcon,
      schema: (directoryMeta.schema ?? {}) as DocFileIndexSchema<keyof T>,
    }

    return new DocFileIndexContentValue<T>(
      {
        type: "markdown-index",
        body: `# ${directoryName}\n`,
        title: directoryName,
        description: "",
        meta,
      },
      customSchema,
      config,
    )
  }

  /**
   * Generate complete text combining FrontMatter and body
   */
  toText(): string {
    const yamlData = {
      icon: this.meta().icon,
      schema: this.meta().schema().toJson(),
    }
    const yamlStr = stringify(yamlData).trim()
    const text = `---\n${yamlStr}\n---\n\n${this.body.trim()}`
    return `${text.trim()}\n`
  }

  /**
   * Output in JSON format
   */
  toJson(): DocFileIndexContent<T> {
    // Ensure meta includes the schema
    const metaValue = this.meta()
    const metaJson = metaValue.toJson()
    return {
      ...this.value,
      meta: metaJson,
    }
  }
}
