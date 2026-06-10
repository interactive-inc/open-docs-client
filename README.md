# @interactive-inc/docs-client

Markdown ベースのドキュメントを型安全に管理する TypeScript ライブラリ。

## Features

- Markdown ファイルの読み書きと FrontMatter メタデータ管理
- Zod スキーマによる型安全なバリデーション
- ドキュメント間のリレーション
- 複数ストレージバックエンド（Node.js, GitHub, JSON, Mock）
- アーカイブ/リストア
- ファイルツリー生成
- `.safe` プロキシによるエラーハンドリング

## Installation

```bash
bun add @interactive-inc/docs-client
# or
npm install @interactive-inc/docs-client
```

## Quick Start

```typescript
import { DocClient } from "@interactive-inc/docs-client"
import { DocFileSystemNode } from "@interactive-inc/docs-client/file-system-node"

const fileSystem = new DocFileSystemNode({ basePath: "./docs" })
const client = new DocClient({ fileSystem })

// .safe を使うと throw の代わりに Error を返す
const entity = await client.safe.mdFile("articles/hello.md").read()

if (!(entity instanceof Error)) {
  console.log(entity.content().title)
  console.log(entity.content().body)
}

// try/catch でも使える
try {
  const entity = await client.mdFile("articles/hello.md").read()
  console.log(entity.content().title)
} catch (error) {
  console.error(error)
}
```

## Core Concepts

### DocClient

メインのエントリポイント。

```typescript
const client = new DocClient({
  fileSystem,
  config: {
    defaultIndexIcon: "📃",
    indexFileName: "index.md",
    archiveDirectoryName: "_",
    defaultDirectoryName: "Directory",
    indexMetaIncludes: [],
    directoryExcludes: [".vitepress"],
    metaFileName: ".meta.json",
  },
})
```

### References

ファイルやディレクトリへの遅延参照。`read()` を呼ぶまで I/O は発生しない。

```typescript
const fileRef = client.mdFile("articles/hello.md")

const dirRef = client.directory("articles")

const indexRef = client.indexFile("articles")
```

### Entities

読み取り後の不変データオブジェクト。

```typescript
const entity = await fileRef.read()

const title = entity.content().title
const body = entity.content().body
const description = entity.content().description

const meta = entity.content().meta()

// with*() で新しいインスタンスを作成（不変）
const updated = entity.withTitle("New Title")
```

### Error Handling - `.safe` プロキシ

Reference や DocClient のメソッドは通常 throw でエラーを伝播する。`.safe` プロキシを使うと、全 async メソッドが `T | Error` を返す。

```typescript
// throw する（try/catch が必要）
const entity = await fileRef.read()

// Error を返す（instanceof チェック）
const entity = await fileRef.safe.read()

if (entity instanceof Error) {
  console.error(entity.message)
  return
}

console.log(entity.content().title)
```

## File Operations

### Reading Files

```typescript
const fileRef = client.mdFile("articles/hello.md")
const entity = await fileRef.read()

// ディレクトリ内の全ファイルを読み取り
const dirRef = client.directory("articles")
const entities = await dirRef.readMdFiles()

// 生テキストとして読み取り
const text = await fileRef.readText()
```

### Writing Files

```typescript
const entity = fileRef.empty()
const updated = entity.withTitle("Hello World").withDescription("My first article")
await fileRef.write(updated)

// 生テキストで書き込み
await fileRef.writeText("# Hello\n\nContent here")

// デフォルトコンテンツで新規ファイル作成
await dirRef.createMdFile("new-article.md")
```

### Archive and Restore

ファイルをアーカイブディレクトリ（デフォルト: `_/`）に移動。

```typescript
const archivedRef = await fileRef.archive()

const restoredRef = await archivedRef.restore()
```

### File Information

```typescript
const exists = await fileRef.exists()
const size = await fileRef.size()
const lastModified = await fileRef.lastModified()
const createdAt = await fileRef.createdAt()
```

## Schema Definition

FrontMatter メタデータの構造をスキーマで定義する。

### Using .meta.json (Recommended)

ディレクトリに `.meta.json` を配置:

```json
{
  "icon": "📄",
  "schema": {
    "title": {
      "type": "text",
      "required": true,
      "title": "Title",
      "description": "Document title",
      "default": null
    },
    "category": {
      "type": "select-text",
      "required": false,
      "title": "Category",
      "description": null,
      "options": ["tutorial", "reference", "guide"],
      "default": null
    },
    "tags": {
      "type": "multi-text",
      "required": false,
      "title": "Tags",
      "description": null,
      "default": []
    },
    "author": {
      "type": "relation",
      "required": false,
      "title": "Author",
      "description": null,
      "path": "authors",
      "default": null
    }
  }
}
```

### Using index.md FrontMatter (Fallback)

`.meta.json` がなければ `index.md` の FrontMatter からスキーマを読み取る:

```markdown
---
icon: 📄
schema:
  title:
    type: text
    required: true
  category:
    type: select-text
    options:
      - tutorial
      - reference
---

# Articles

Directory description here.
```

### Type-Safe Schema in Code

`defineSchema` で型安全にスキーマを定義:

```typescript
import { defineSchema, docCustomSchemaField } from "@interactive-inc/docs-client"

const articleSchema = defineSchema({
  title: { type: "text", required: true },
  views: { type: "number", required: false },
  published: { type: "boolean", required: true },
  category: { type: "select-text", required: false },
  tags: { type: "multi-text", required: false },
  author: docCustomSchemaField.relation(false, "authors"),
  relatedArticles: docCustomSchemaField.multiRelation(false, "articles"),
})

// スキーマ付きでディレクトリを取得
const dirRef = client.directory("articles", articleSchema)
const fileRef = dirRef.mdFile("hello")
const entity = await fileRef.read()

// 型安全なメタデータアクセス
const title = entity.content().meta().field("title") // string
const views = entity.content().meta().field("views") // number | null
```

### Schema Field Types

| Type | Value Type | Description |
| --- | --- | --- |
| `text` | `string` | 単一テキスト |
| `number` | `number` | 数値 |
| `boolean` | `boolean` | 真偽値 |
| `select-text` | `string` | テキスト選択肢から単一選択 |
| `select-number` | `number` | 数値選択肢から単一選択 |
| `multi-text` | `string[]` | 複数テキスト |
| `multi-number` | `number[]` | 複数数値 |
| `multi-select-text` | `string[]` | テキスト選択肢から複数選択 |
| `multi-select-number` | `number[]` | 数値選択肢から複数選択 |
| `relation` | `string` | 他ドキュメントへの参照 |
| `multi-relation` | `string[]` | 他ドキュメントへの複数参照 |

## Relations

ドキュメント間のリレーション。

```typescript
const pageSchema = defineSchema({
  features: docCustomSchemaField.multiRelation(true, "features"),
})

const dirRef = client.directory("pages", pageSchema)
const pageRef = dirRef.mdFile("dashboard")

// 関連ドキュメントの参照を取得
const featureRefs = await pageRef.relations("features")
for (const featureRef of featureRefs) {
  const feature = await featureRef.read()
  console.log(feature.content().title)
}
```

## Directory Operations

```typescript
const dirRef = client.directory("articles")

// 一覧取得
const fileNames = await dirRef.fileNames()
const dirNames = await dirRef.directoryNames()

// 参照取得
const files = await dirRef.files()
const mdFiles = await dirRef.mdFiles()
const subdirs = await dirRef.directories()

// 全ファイル読み取り
const entities = await dirRef.readMdFiles()

// インデックスファイル読み取り
const indexEntity = await dirRef.readIndexFile()

// サブディレクトリ
const subDirRef = dirRef.directory("tutorials")

// 新規ファイル作成
const newFileRef = await dirRef.createMdFile("new-article.md")
```

## File Tree

ドキュメントの階層ツリー構造を生成。

```typescript
const tree = await client.fileTree()

const dirTree = await client.directoryTree()

// ツリーノードの型
type DocTreeFileNode = {
  type: "file"
  name: string
  path: string
  icon: string
  title: string
}

type DocTreeDirectoryNode = {
  type: "directory"
  name: string
  path: string
  icon: string
  title: string
  children: DocTreeNode[]
}

type DocTreeNode = DocTreeFileNode | DocTreeDirectoryNode
```

## File Systems

### Node.js File System

ローカルファイル操作用:

```typescript
import { DocFileSystemNode } from "@interactive-inc/docs-client/file-system-node"

const fileSystem = new DocFileSystemNode({ basePath: "./docs" })
```

Read/Write を個別に指定する場合:

```typescript
import { DocFileSystemNodeRead, DocFileSystemNodeWrite } from "@interactive-inc/docs-client/file-system-node"
import { DocFileSystem } from "@interactive-inc/docs-client/file-system"

const reader = new DocFileSystemNodeRead({ basePath: "./docs" })
const writer = new DocFileSystemNodeWrite({ basePath: "./docs", reader })

const fileSystem = new DocFileSystem({ basePath: "./docs", reader, writer })
```

### GitHub File System (Octokit)

GitHub リポジトリからの読み取り:

```typescript
import { DocFileSystemOctokitRead } from "@interactive-inc/docs-client/file-system-octokit"
import { DocFileSystemNodeWrite } from "@interactive-inc/docs-client/file-system-node"
import { DocFileSystem } from "@interactive-inc/docs-client/file-system"

const reader = new DocFileSystemOctokitRead({
  token: process.env.GITHUB_TOKEN,
  owner: "your-org",
  repo: "your-repo",
  basePath: "docs",
  branch: "main",
})

const writer = new DocFileSystemNodeWrite({
  basePath: "/tmp/docs-output",
})

const fileSystem = new DocFileSystem({
  basePath: "docs",
  reader,
  writer,
})
```

### JSON File System

インメモリ操作用:

```typescript
import { DocFileSystemJson } from "@interactive-inc/docs-client/file-system-json"

const fileSystem = new DocFileSystemJson({
  basePath: "docs",
  data: {
    "index.md": "# Home\n\nWelcome!",
    "articles/hello.md": "# Hello\n\nContent here.",
  },
})
```

### Mock File System

テスト用:

```typescript
import { DocFileSystemMock } from "@interactive-inc/docs-client/file-system-mock"

const fileSystem = new DocFileSystemMock({ basePath: "docs" })
```

## License

MIT
