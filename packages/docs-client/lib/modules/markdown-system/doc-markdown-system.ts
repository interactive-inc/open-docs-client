/**
 * Markdown parsing and processing system
 */
export class DocMarkdownSystem {
  private readonly frontMatterSeparator = "---"

  constructor() {
    Object.freeze(this)
  }

  /**
   * Detect FrontMatter separator line
   */
  private detectFrontMatterSeparator(text: string): string {
    const firstLine = text.split("\n")[0]

    if (firstLine?.match(/^-{3,}$/)) {
      return firstLine
    }

    return this.frontMatterSeparator
  }

  /**
   * Extract FrontMatter
   */
  extractFrontMatter(text: string): string | null {
    const separator = this.detectFrontMatterSeparator(text)

    if (!text.startsWith(separator)) {
      return null
    }

    const endIndex = text.indexOf(`\n${separator}`, separator.length)

    if (endIndex === -1) {
      return null
    }

    return text
      .slice(0, endIndex + separator.length + 1)
      .replaceAll(separator, "")
      .trim()
  }

  /**
   * Extract body without FrontMatter (includes title and description)
   */
  extractBody(text: string): string {
    const separator = this.detectFrontMatterSeparator(text)

    if (!text.startsWith(separator)) {
      return text
    }

    const endIndex = text.indexOf(`\n${separator}`, separator.length)

    if (endIndex === -1) {
      return text
    }

    return text.slice(endIndex + separator.length + 2).trim()
  }

  /**
   * Extract title
   */
  extractTitle(text: string): string | null {
    const body = this.extractBody(text)
    const titleMatch = body.match(/^#\s+(.+)$/m)
    return titleMatch?.[1] ?? null
  }

  /**
   * Extract description (first paragraph after title)
   */
  extractDescription(text: string): string | null {
    const title = this.extractTitle(text)
    if (!title) {
      return null
    }

    const body = this.extractBody(text)
    const lines = body.split("\n")
    const titleIndex = lines.findIndex((line) => line.match(/^#\s+/))
    if (titleIndex === -1) {
      return null
    }

    const descIndex = this.skipEmptyLines(lines, titleIndex + 1)
    if (descIndex < lines.length && !lines[descIndex]?.startsWith("#")) {
      return lines[descIndex] ?? null
    }

    return null
  }

  /**
   * Update title in body (returns body only, without FrontMatter)
   */
  updateTitle(text: string, newTitle: string): string {
    // textはbodyのみを想定（FrontMatterは含まない）
    const lines = text.split("\n")

    const titleIndex = lines.findIndex((line) => line.match(/^#\s+/))

    if (titleIndex !== -1) {
      lines[titleIndex] = `# ${newTitle}`
    } else {
      lines.unshift(`# ${newTitle}`, "")
    }

    return lines.join("\n")
  }

  /**
   * Update description in body (returns body only, without FrontMatter)
   */
  updateDescription(
    text: string,
    newDescription: string,
    defaultTitle: string,
  ): string {
    // textはbodyのみを想定（FrontMatterは含まない）
    const lines = text.split("\n")
    const titleIndex = lines.findIndex((line) => line.match(/^#\s+/))

    if (titleIndex === -1) {
      return `# ${defaultTitle}\n\n${newDescription}\n\n${text}`.trim()
    } else {
      const descIndex = this.skipEmptyLines(lines, titleIndex + 1)

      if (
        descIndex < lines.length &&
        lines[descIndex] &&
        !lines[descIndex].startsWith("#")
      ) {
        lines[descIndex] = newDescription
      } else {
        lines.splice(titleIndex + 1, 0, "", newDescription)
      }
      return lines.join("\n")
    }
  }

  /**
   * Skip empty lines
   */
  private skipEmptyLines(lines: string[], startIndex: number): number {
    let index = startIndex
    while (index < lines.length) {
      const line = lines[index]
      if (line === undefined || line.trim() !== "") {
        break
      }
      index++
    }
    return index
  }

  /**
   * Generate Markdown text (title + description + body)
   */
  static from(title: string, description: string, body: string): string {
    const parts: string[] = []

    if (title) {
      parts.push(`# ${title}`)
    }

    if (description) {
      if (title) parts.push("")
      parts.push(description)
    }

    if (body) {
      if (title || description) parts.push("")
      parts.push(body)
    }

    return parts.join("\n")
  }
}
