import { zDocDirectoryMeta } from "@/models"
import type { DocClientConfig, DocDirectoryMeta } from "@/types"

/**
 * Directory meta value (.meta.json)
 */
export class DocDirectoryMetaValue {
  constructor(
    readonly value: DocDirectoryMeta,
    private readonly config: DocClientConfig,
  ) {
    zDocDirectoryMeta.parse(value)
    Object.freeze(this)
  }

  /**
   * Icon
   */
  get icon(): string | null {
    return this.value.icon ?? this.config.defaultIndexIcon
  }

  /**
   * Schema
   */
  get schema(): Record<string, unknown> {
    return this.value.schema ?? {}
  }

  /**
   * Parse from JSON string
   */
  static fromJson(
    jsonText: string,
    config: DocClientConfig,
  ): DocDirectoryMetaValue | null {
    const parsed = JSON.parse(jsonText)
    const result = zDocDirectoryMeta.safeParse(parsed)

    if (result.success === false) {
      return null
    }

    return new DocDirectoryMetaValue(result.data, config)
  }

  /**
   * Parse from JSON object
   */
  static fromRecord(
    record: Record<string, unknown>,
    config: DocClientConfig,
  ): DocDirectoryMetaValue | null {
    const result = zDocDirectoryMeta.safeParse(record)

    if (result.success === false) {
      return null
    }

    return new DocDirectoryMetaValue(result.data, config)
  }
}
