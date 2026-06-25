import { z } from "zod"

const zJsonDocumentData = z.record(z.string(), z.string())

type JsonDocumentData = z.infer<typeof zJsonDocumentData>

function parseJsonDocumentData(data: unknown): JsonDocumentData | Error {
  try {
    return zJsonDocumentData.parse(data)
  } catch (error) {
    return error instanceof Error ? error : new Error("Failed to parse JSON document data")
  }
}

type Props = {
  data?: JsonDocumentData | unknown
}

/**
 * JSON ファイルシステムの可変データストア。reader と writer が同一インスタンスを共有し、
 * writer の変更が reader に即時反映される単一の真実の源となる
 */
export class DocFileSystemJsonStore {
  private documents: JsonDocumentData

  constructor(props: Props = {}) {
    if (props.data !== undefined) {
      const parsed = parseJsonDocumentData(props.data)
      if (parsed instanceof Error) {
        throw parsed
      }
      this.documents = parsed
    } else {
      this.documents = {}
    }
  }

  /**
   * 指定パスのドキュメント内容を取得する
   */
  get(path: string): string | undefined {
    return this.documents[path]
  }

  /**
   * 指定パスにドキュメント内容を書き込む
   */
  set(path: string, content: string): void {
    this.documents[path] = content
  }

  /**
   * 指定パスを削除する。存在すれば true を返す
   */
  delete(path: string): boolean {
    if (!(path in this.documents)) {
      return false
    }

    const nextDocuments: JsonDocumentData = {}

    for (const key of Object.keys(this.documents)) {
      if (key !== path) {
        nextDocuments[key] = this.documents[key]
      }
    }

    this.documents = nextDocuments
    return true
  }

  /**
   * 指定パスが存在するかを返す
   */
  has(path: string): boolean {
    return path in this.documents
  }

  /**
   * 全ドキュメントのパス一覧を返す
   */
  keys(): string[] {
    return Object.keys(this.documents)
  }

  /**
   * データ全体を入れ替える
   */
  replace(data: JsonDocumentData | unknown): Error | null {
    const parsed = parseJsonDocumentData(data)
    if (parsed instanceof Error) {
      return parsed
    }

    this.documents = parsed
    return null
  }

  /**
   * 全データを削除する
   */
  clear(): void {
    this.documents = {}
  }

  /**
   * 現在のデータの読み取り専用コピーを返す
   */
  toData(): JsonDocumentData {
    return { ...this.documents }
  }
}
