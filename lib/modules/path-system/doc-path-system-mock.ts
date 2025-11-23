import { DocPathSystem } from "./doc-path-system"

/**
 * Mock path system for testing
 */
export class DocPathSystemMock extends DocPathSystem {
  private readonly _separator: string

  constructor(separator = "/") {
    super()
    this._separator = separator
    Object.freeze(this)
  }

  override join(...paths: string[]): string {
    return paths
      .filter((path) => path !== "")
      .join(this._separator)
      .replace(new RegExp(`${this._separator}+`, "g"), this._separator)
  }

  override basename(path: string, ext?: string): string {
    const normalizedPath = path.replace(/\\/g, "/")
    const lastSlashIndex = normalizedPath.lastIndexOf("/")
    let base =
      lastSlashIndex === -1
        ? normalizedPath
        : normalizedPath.slice(lastSlashIndex + 1)

    if (ext && base.endsWith(ext)) {
      base = base.slice(0, -ext.length)
    }

    return base
  }

  override dirname(path: string): string {
    const normalizedPath = path.replace(/\\/g, "/")
    const lastSlashIndex = normalizedPath.lastIndexOf("/")

    if (lastSlashIndex === -1) {
      return "."
    }

    if (lastSlashIndex === 0) {
      return "/"
    }

    return normalizedPath.slice(0, lastSlashIndex)
  }

  override extname(path: string): string {
    const base = this.basename(path)
    const lastDotIndex = base.lastIndexOf(".")

    if (lastDotIndex === -1 || lastDotIndex === 0) {
      return ""
    }

    return base.slice(lastDotIndex)
  }

  override relative(from: string, to: string): string {
    const fromParts = from.split("/").filter(Boolean)
    const toParts = to.split("/").filter(Boolean)

    let commonLength = 0
    for (let i = 0; i < Math.min(fromParts.length, toParts.length); i++) {
      if (fromParts[i] === toParts[i]) {
        commonLength++
      } else {
        break
      }
    }

    const upLevels = fromParts.length - commonLength
    const downParts = toParts.slice(commonLength)

    const result = Array(upLevels).fill("..").concat(downParts)

    return result.length === 0 ? "." : result.join("/")
  }

  override resolve(...paths: string[]): string {
    let resolved = ""
    let isAbsolute = false

    for (let i = paths.length - 1; i >= 0 && !isAbsolute; i--) {
      const path = paths[i]
      if (path) {
        resolved = path + (resolved ? `/${resolved}` : "")
        isAbsolute = path.startsWith("/")
      }
    }

    if (!isAbsolute) {
      resolved = `/mock-cwd/${resolved}`
    }

    return this.normalize(resolved)
  }

  override normalize(path: string): string {
    if (!path) return "."

    const isAbsolute = path.startsWith("/")
    const parts = path.split("/").filter(Boolean)
    const normalizedParts: string[] = []

    for (const part of parts) {
      if (part === "..") {
        if (
          normalizedParts.length > 0 &&
          normalizedParts[normalizedParts.length - 1] !== ".."
        ) {
          normalizedParts.pop()
        } else if (!isAbsolute) {
          normalizedParts.push("..")
        }
      } else if (part !== ".") {
        normalizedParts.push(part)
      }
    }

    const result = (isAbsolute ? "/" : "") + normalizedParts.join("/")
    return result || (isAbsolute ? "/" : ".")
  }

  override isAbsolute(path: string): boolean {
    return path.startsWith("/")
  }

  get sep(): string {
    return this._separator
  }

  /**
   * Set custom separator for testing
   */
  static createWithSeparator(separator: string): DocPathSystemMock {
    return new DocPathSystemMock(separator)
  }
}
