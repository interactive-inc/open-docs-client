import type { DocPathSystem } from "../path-system/doc-path-system"
import { DocFileSystem } from "./doc-file-system"
import { DocFileSystemNodeRead } from "./doc-file-system-node-read"
import { DocFileSystemNodeWrite } from "./doc-file-system-node-write"

type Props = {
  basePath: string
  pathSystem?: DocPathSystem
}

/**
 * Node.js file system with separate read/write components
 */
export class DocFileSystemNode extends DocFileSystem {
  constructor(props: Props) {
    // Create Node.js read implementation
    const reader = new DocFileSystemNodeRead({
      basePath: props.basePath,
      pathSystem: props.pathSystem,
    })

    // Create Node.js write implementation with reader
    const writer = new DocFileSystemNodeWrite({
      basePath: props.basePath,
      pathSystem: props.pathSystem,
      reader,
    })

    // Call parent constructor with reader and writer
    super({
      basePath: props.basePath,
      pathSystem: props.pathSystem,
      reader,
      writer,
    })
  }
}
