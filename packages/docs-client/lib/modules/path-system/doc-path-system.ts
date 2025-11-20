/**
 * Path operations system
 */
export class DocPathSystem {
  readonly separator = "/"

  /**
   * Join paths
   */
  join(...paths: string[]): string {
    const parts: string[] = []

    for (const path of paths) {
      if (path === "") continue

      const segments = path.split(this.separator).filter(Boolean)
      parts.push(...segments)
    }

    if (parts.length === 0) {
      return "."
    }

    const isAbsolute = paths[0]?.startsWith(this.separator)
    const joined = parts.join(this.separator)

    return isAbsolute ? `${this.separator}${joined}` : joined
  }

  /**
   * Get filename with extension
   */
  basename(path: string, ext?: string): string {
    const segments = path.split(this.separator)
    const filename = segments[segments.length - 1] || ""

    if (ext && filename.endsWith(ext)) {
      return filename.slice(0, -ext.length)
    }

    return filename
  }

  /**
   * Get directory name
   */
  dirname(path: string): string {
    const segments = path.split(this.separator)

    if (segments.length <= 1) {
      return "."
    }

    segments.pop()
    const dir = segments.join(this.separator)

    return dir || "."
  }

  /**
   * Get extension
   */
  extname(path: string): string {
    const basename = this.basename(path)
    const lastDot = basename.lastIndexOf(".")

    if (lastDot <= 0) {
      return ""
    }

    return basename.slice(lastDot)
  }

  /**
   * Calculate relative path
   */
  relative(from: string, to: string): string {
    const fromSegments = from.split(this.separator).filter(Boolean)
    const toSegments = to.split(this.separator).filter(Boolean)

    let commonLength = 0
    for (let i = 0; i < Math.min(fromSegments.length, toSegments.length); i++) {
      if (fromSegments[i] === toSegments[i]) {
        commonLength++
      } else {
        break
      }
    }

    const upCount = fromSegments.length - commonLength
    const upSegments = Array(upCount).fill("..")

    const downSegments = toSegments.slice(commonLength)

    const segments = [...upSegments, ...downSegments]

    return segments.length > 0 ? segments.join(this.separator) : "."
  }

  /**
   * Convert to absolute path
   */
  resolve(...paths: string[]): string {
    let resolved = ""

    for (const path of paths) {
      if (path.startsWith(this.separator)) {
        resolved = path
      } else if (path !== "") {
        resolved = resolved ? this.join(resolved, path) : path
      }
    }

    return resolved || "."
  }

  /**
   * Normalize path
   */
  normalize(path: string): string {
    const isAbsolute = path.startsWith(this.separator)
    const segments = path.split(this.separator).filter(Boolean)
    const normalized: string[] = []

    for (const segment of segments) {
      if (segment === "..") {
        if (
          normalized.length > 0 &&
          normalized[normalized.length - 1] !== ".."
        ) {
          normalized.pop()
        } else if (!isAbsolute) {
          normalized.push("..")
        }
      } else if (segment !== ".") {
        normalized.push(segment)
      }
    }

    if (normalized.length === 0) {
      return isAbsolute ? this.separator : "."
    }

    const result = normalized.join(this.separator)
    return isAbsolute ? `${this.separator}${result}` : result
  }

  /**
   * Check if path is absolute
   */
  isAbsolute(path: string): boolean {
    return path.startsWith(this.separator)
  }
}
