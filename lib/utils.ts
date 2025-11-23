import type { DocCustomSchema } from "./types"

/**
 * Function that only performs type checking (does nothing at runtime)
 */
export function expectType<T>(_value: T): void {}

/**
 * Type-level assertion
 * Compiles only when Equals<T, U> is true
 */
export function assertType<_T extends true>(): void {}

/**
 * Default configuration for tests
 */
export const defaultTestConfig = {
  defaultIndexIcon: "📁",
  indexFileName: "index.md",
  archiveDirectoryName: "_",
  defaultDirectoryName: "Directory",
  indexMetaIncludes: [],
  directoryExcludes: [".vitepress"],
}

/**
 * Helper function for defining schemas
 * Enables type completion while defining schemas
 *
 * @example
 * const mySchema = defineSchema({
 *   title: { type: "text", required: true },
 *   priority: { type: "select-text", required: false },
 *   features: { type: "multi-relation", required: true }
 * })
 *
 * type MyDoc = InferDocFileMd<typeof mySchema>
 */
export function defineSchema<T extends DocCustomSchema>(schema: T): T {
  return schema
}

/**
 * Helper functions for field definitions
 * Use when finer control is needed
 */
export const docCustomSchemaField = {
  text(required: boolean) {
    return {
      type: "text" as const,
      required,
    }
  },
  number(required: boolean) {
    return {
      type: "number" as const,
      required,
    }
  },
  boolean(required: boolean) {
    return {
      type: "boolean" as const,
      required,
    }
  },
  relation(required: boolean, path: string) {
    return {
      type: "relation" as const,
      required,
      title: null,
      description: null,
      path,
    }
  },
  multiRelation(required: boolean, path: string) {
    return {
      type: "multi-relation" as const,
      required,
      title: null,
      description: null,
      path,
    }
  },
  selectText(required: boolean) {
    return {
      type: "select-text" as const,
      required,
    }
  },
  selectNumber(required: boolean) {
    return {
      type: "select-number" as const,
      required,
    }
  },
  multiText(required: boolean) {
    return {
      type: "multi-text" as const,
      required,
    }
  },
  multiNumber(required: boolean) {
    return {
      type: "multi-number" as const,
      required,
    }
  },
  multiSelectText(required: boolean) {
    return {
      type: "multi-select-text" as const,
      required,
    }
  },
  multiSelectNumber(required: boolean) {
    return {
      type: "multi-select-number" as const,
      required,
    }
  },
} as const
