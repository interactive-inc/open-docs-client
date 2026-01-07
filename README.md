# @interactive-inc/docs-client

A TypeScript library for managing Markdown-based documentation with schema validation, file operations, and multiple storage backends.

## Features

- Read, write, and manage Markdown files with FrontMatter metadata
- Type-safe schema definition with Zod validation
- Support for relations between documents
- Multiple file system backends (Node.js, GitHub, JSON, Mock)
- Archive/restore functionality for documents
- File tree generation

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

// Read a markdown file
const fileRef = client.mdFile("articles/hello.md")
const entity = await fileRef.read()

if (!(entity instanceof Error)) {
  console.log(entity.content().title)
  console.log(entity.content().body)
}
```

## Core Concepts

### DocClient

The main entry point for interacting with documents.

```typescript
const client = new DocClient({
  fileSystem,
  config: {
    defaultIndexIcon: "📁",
    indexFileName: "index.md",
    archiveDirectoryName: "_",
    defaultDirectoryName: "Directory",
    indexMetaIncludes: [],
    directoryExcludes: [".git"],
    metaFileName: ".meta.json",
  },
})
```

### References

References are handles to files or directories. They do not load content until you call `read()`.

```typescript
// File reference
const fileRef = client.mdFile("articles/hello.md")

// Directory reference
const dirRef = client.directory("articles")

// Index file reference
const indexRef = client.indexFile("articles")
```

### Entities

Entities are immutable objects containing file content and metadata.

```typescript
const entity = await fileRef.read()

if (!(entity instanceof Error)) {
  // Access content
  const title = entity.content().title
  const body = entity.content().body
  const description = entity.content().description

  // Access metadata (FrontMatter)
  const meta = entity.content().meta()

  // Create modified copy (immutable)
  const updated = entity.withTitle("New Title")
}
```

## File Operations

### Reading Files

```typescript
// Read a single file
const fileRef = client.mdFile("articles/hello.md")
const entity = await fileRef.read()

// Read all files in a directory
const dirRef = client.directory("articles")
const entities = await dirRef.readMdFiles()

// Read file as raw text
const text = await fileRef.readText()
```

### Writing Files

```typescript
// Write an entity
const entity = fileRef.empty()
const updated = entity
  .withTitle("Hello World")
  .withDescription("My first article")
await fileRef.write(updated)

// Write raw text
await fileRef.writeText("# Hello\n\nContent here")

// Create a new file with default content
await dirRef.createMdFile("new-article.md")
```

### Archive and Restore

Files can be moved to an archive directory (default: `_/`).

```typescript
// Archive a file (moves to _/ subdirectory)
const archivedRef = await fileRef.archive()

// Restore from archive
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

Define schemas to validate and type FrontMatter metadata.

### Using .meta.json (Recommended)

Create a `.meta.json` file in any directory:

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

If `.meta.json` does not exist, schema is read from `index.md`:

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

Use `defineSchema` for type-safe schema definitions:

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

// Use schema with directory
const dirRef = client.directory("articles", articleSchema)
const fileRef = dirRef.mdFile("hello")
const entity = await fileRef.read()

if (!(entity instanceof Error)) {
  // Type-safe access to metadata
  const title = entity.content().meta().field("title") // string
  const views = entity.content().meta().field("views") // number | null
}
```

### Schema Field Types

| Type | Value Type | Description |
|------|------------|-------------|
| `text` | `string` | Single text value |
| `number` | `number` | Numeric value |
| `boolean` | `boolean` | True/false |
| `select-text` | `string` | Single selection from text options |
| `select-number` | `number` | Single selection from number options |
| `multi-text` | `string[]` | Multiple text values |
| `multi-number` | `number[]` | Multiple number values |
| `multi-select-text` | `string[]` | Multiple selections from text options |
| `multi-select-number` | `number[]` | Multiple selections from number options |
| `relation` | `string` | Reference to another document |
| `multi-relation` | `string[]` | References to multiple documents |

## Relations

Relations link documents to each other.

```typescript
// Define schema with relations
const pageSchema = defineSchema({
  features: docCustomSchemaField.multiRelation(true, "features"),
})

const dirRef = client.directory("pages", pageSchema)
const pageRef = dirRef.mdFile("dashboard")
const page = await pageRef.read()

// Get related documents
const featureRefs = await pageRef.relations("features")
for (const featureRef of featureRefs) {
  const feature = await featureRef.read()
  console.log(feature.content().title)
}
```

## Directory Operations

```typescript
const dirRef = client.directory("articles")

// List contents
const fileNames = await dirRef.fileNames()
const dirNames = await dirRef.directoryNames()

// Get references
const files = await dirRef.files()
const mdFiles = await dirRef.mdFiles()
const subdirs = await dirRef.directories()

// Read all files
const entities = await dirRef.readMdFiles()

// Access index file
const indexEntity = await dirRef.readIndexFile()

// Navigate to subdirectory
const subDirRef = dirRef.directory("tutorials")

// Create new file
const newFileRef = await dirRef.createMdFile("new-article.md")
```

## File Tree

Generate a hierarchical tree structure of documents.

```typescript
// Get full file tree
const tree = await client.fileTree()

// Get directory-only tree
const dirTree = await client.directoryTree()

// Tree node structure
type DocTreeNode = {
  type: "file" | "directory"
  name: string
  path: string
  icon: string
  title: string
  children?: DocTreeNode[] // Only for directories
}
```

## File Systems

### Node.js File System

For local file operations:

```typescript
import { DocFileSystemNode } from "@interactive-inc/docs-client/file-system-node"

const fileSystem = new DocFileSystemNode({ basePath: "./docs" })
```

### GitHub File System (Octokit)

For reading from GitHub repositories:

```typescript
import { DocFileSystem } from "@interactive-inc/docs-client/file-system"
import { DocFileSystemOctokitRead } from "@interactive-inc/docs-client/file-system-octokit"
import { DocFileSystemNodeWrite } from "@interactive-inc/docs-client/file-system-node"

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

For in-memory operations with JSON data:

```typescript
import { DocFileSystemJson } from "@interactive-inc/docs-client/file-system-json"

const fileSystem = new DocFileSystemJson({
  basePath: "docs",
  files: {
    "index.md": "# Home\n\nWelcome!",
    "articles/hello.md": "# Hello\n\nContent here.",
  },
})
```

### Mock File System

For testing:

```typescript
import { DocFileSystemMock } from "@interactive-inc/docs-client/file-system-mock"

const fileSystem = new DocFileSystemMock({ basePath: "docs" })
```

## API Reference

### DocClient

| Method | Description |
|--------|-------------|
| `file(path)` | Get reference by path (auto-detects type) |
| `mdFile(path)` | Get Markdown file reference |
| `indexFile(path)` | Get index file reference |
| `directory(path)` | Get directory reference |
| `fileTree(path?)` | Build file tree from path |
| `directoryTree(path?)` | Build directory-only tree |
| `basePath()` | Get base path |

### DocFileMdReference

| Method | Description |
|--------|-------------|
| `read()` | Read file and return entity |
| `readText()` | Read raw file content |
| `write(entity)` | Write entity to file |
| `writeText(text)` | Write raw text to file |
| `writeDefault()` | Create file with default content |
| `delete()` | Delete file |
| `exists()` | Check if file exists |
| `archive()` | Move to archive directory |
| `restore()` | Restore from archive |
| `size()` | Get file size in bytes |
| `lastModified()` | Get last modified time |
| `createdAt()` | Get creation time |
| `directory()` | Get parent directory reference |
| `relation(key)` | Get single relation reference |
| `relations(key)` | Get multi-relation references |

### DocDirectoryReference

| Method | Description |
|--------|-------------|
| `fileNames()` | List file names |
| `directoryNames()` | List subdirectory names |
| `files()` | Get all file references |
| `mdFiles()` | Get Markdown file references |
| `directories()` | Get subdirectory references |
| `file(name)` | Get file reference by name |
| `mdFile(name)` | Get Markdown file reference |
| `directory(name)` | Get subdirectory reference |
| `indexFile()` | Get index file reference |
| `readFiles()` | Read all files |
| `readMdFiles()` | Read all Markdown files |
| `readIndexFile()` | Read index file |
| `createMdFile(name?)` | Create new Markdown file |
| `exists()` | Check if directory exists |

### DocFileMdEntity

| Method | Description |
|--------|-------------|
| `content()` | Get content value object |
| `path` | Get path information |
| `withContent(content)` | Create copy with new content |
| `withTitle(title)` | Create copy with new title |
| `withDescription(desc)` | Create copy with new description |
| `withMeta(meta)` | Create copy with new metadata |
| `toJson()` | Convert to JSON |

## License

MIT
