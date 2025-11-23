import { DOC_NODE_TYPE_DIRECTORY } from "@/constants"
import { zDocTreeDirectoryNode, zDocTreeNode } from "@/models"
import type { DocTreeDirectoryNode, DocTreeNode } from "@/types"
import { DocTreeFileNodeValue } from "./doc-tree-file-node-value"
import type { DocTreeNodeValue } from "./doc-tree-node-value"

type Props = {
  name: string
  path: string
  icon: string
  title: string
  children: DocTreeNodeValue[]
}

/**
 * Tree directory node value object
 */
export class DocTreeDirectoryNodeValue {
  constructor(private readonly props: Props) {
    Object.freeze(this)
    Object.freeze(this.props)
    Object.freeze(this.props.children)
  }

  get name() {
    return this.props.name
  }

  get path() {
    return this.props.path
  }

  get icon() {
    return this.props.icon
  }

  get title() {
    return this.props.title
  }

  get children() {
    return this.props.children
  }

  get type(): typeof DOC_NODE_TYPE_DIRECTORY {
    return DOC_NODE_TYPE_DIRECTORY
  }

  /**
   * Convert to plain object
   */
  toJson(): DocTreeDirectoryNode {
    return {
      name: this.name,
      path: this.path,
      type: DOC_NODE_TYPE_DIRECTORY,
      icon: this.icon,
      title: this.title,
      children: this.children.map((child) => child.toJson()),
    }
  }

  /**
   * Create from properties
   */
  static from(props: Props): DocTreeDirectoryNodeValue {
    return new DocTreeDirectoryNodeValue(props)
  }

  /**
   * Create from JSON object
   */
  static fromJson(json: unknown): DocTreeDirectoryNodeValue {
    const parsed = zDocTreeDirectoryNode.parse(json) as DocTreeDirectoryNode

    return new DocTreeDirectoryNodeValue({
      name: parsed.name,
      path: parsed.path,
      icon: parsed.icon,
      title: parsed.title,
      children: parsed.children.map((child: unknown) => {
        // Validate child type
        const parsedChild = zDocTreeNode.parse(child) as DocTreeNode

        if (parsedChild.type === "file") {
          return DocTreeFileNodeValue.fromJson(parsedChild)
        }
        return DocTreeDirectoryNodeValue.fromJson(parsedChild)
      }),
    })
  }
}
