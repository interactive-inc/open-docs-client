import { zDocTreeFileNode } from "@/models"
import type { DocTreeFileNode } from "@/types"

type Props = {
  name: string
  path: string
  icon: string
  title: string
}

/**
 * Tree file node value object
 */
export class DocTreeFileNodeValue {
  constructor(private readonly props: Props) {
    Object.freeze(this)
  }

  get name(): string {
    return this.props.name
  }

  get path(): string {
    return this.props.path
  }

  get icon(): string {
    return this.props.icon
  }

  get title(): string {
    return this.props.title
  }

  get type(): "file" {
    return "file"
  }

  /**
   * Convert to plain object
   */
  toJson(): DocTreeFileNode {
    return {
      name: this.name,
      path: this.path,
      type: "file",
      icon: this.icon,
      title: this.title,
    }
  }

  /**
   * Create from properties
   */
  static from(props: Props): DocTreeFileNodeValue {
    return new DocTreeFileNodeValue(props)
  }

  /**
   * Create from JSON object
   */
  static fromJson(json: unknown): DocTreeFileNodeValue {
    const parsed = zDocTreeFileNode.parse(json)
    return new DocTreeFileNodeValue({
      name: parsed.name,
      path: parsed.path,
      icon: parsed.icon,
      title: parsed.title,
    })
  }
}
