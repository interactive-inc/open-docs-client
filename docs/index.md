---
layout: home
hero:
  name: "docs-client"
  text: "Markdown Document Management"
  tagline: Type-safe, schema-driven documentation for TypeScript
  actions:
    - theme: brand
      text: Get Started
      link: /guides
    - theme: alt
      text: GitHub
      link: https://github.com/interactive-inc/open-docs-client
    - theme: alt
      text: Contact
      link: https://www.inta.co.jp/contact/
features:
  - title: Type-Safe API
    details: Fully typed TypeScript API for safer development
  - title: Schema-Driven
    details: Validate frontmatter with Zod schemas
  - title: Extensible
    details: Pluggable filesystem and Markdown parser
---

## Installation

```bash
bun add @interactive-inc/docs-client
# or
npm install @interactive-inc/docs-client
```

## Quick Start

Get up and running with minimal setup. This example shows how to read a Markdown file from your documentation.

```typescript
import { DocClient, DocFileSystem } from '@interactive-inc/docs-client'

// Initialize
const fileSystem = new DocFileSystem({ basePath: './docs' })
const client = new DocClient({ fileSystem })

// Read Markdown
const file = await client.mdFile('guides/getting-started.md').read()
if (file instanceof Error) throw file

console.log(file.content.title())
console.log(file.content.body())
```

## Working with Directories

Navigate through your documentation structure easily. Directories provide methods to list, filter, and access files.

```typescript
// Get directory reference
const directory = client.directory('features')

// List all Markdown files
const files = await directory.mdFiles()

// Read specific file
const loginFeature = directory.mdFile('login.md')
const entity = await loginFeature.read()
```

## Custom Schemas

Define type-safe metadata with Zod schemas. This ensures your frontmatter follows a consistent structure across documents.

```typescript
import { DocSchemaBuilder } from '@interactive-inc/docs-client'
import { z } from 'zod'

const featureSchema = new DocSchemaBuilder()
  .addRequired('milestone', z.string())
  .addRequired('priority', z.enum(['high', 'medium', 'low']))
  .addOptional('assignee', z.string())
  .addOptional('tags', z.array(z.string()).default([]))
  .build()

// Type-safe file operations
const file = await client.mdFile('features/auth.md', featureSchema).read()
if (file instanceof Error) throw file

const meta = file.content.meta()
console.log(meta.text('milestone'))  // string
console.log(meta.text('priority'))   // 'high' | 'medium' | 'low'
console.log(meta.multiText('tags'))  // string[]
```

## File Operations

Common operations for managing your documentation files programmatically.

### Creating Files

Create new documentation files with predefined content and metadata.

```typescript
// Create new file with default content
const newFile = await directory.createMdFile('new-feature.md')

// Write custom content
const entity = newFile.create({
  title: 'New Feature',
  body: '# New Feature\n\nDescription here...'
})
await newFile.write(entity)
```

### Updating Metadata

Modify frontmatter without touching the document content.

```typescript
const file = await client.mdFile('features/login.md').read()
if (file instanceof Error) throw file

// Update frontmatter
const meta = file.content.meta()
const updated = file.withMeta(
  meta
    .withProperty('status', 'completed')
    .withProperty('updated_at', new Date().toISOString())
)

await client.mdFile('features/login.md').write(updated)
```

## Archive System

Instead of deleting files, move them to archive. This preserves document history and allows easy restoration.

```typescript
// Archive a file (moves to _/ directory)
const fileRef = client.mdFile('old-specs/deprecated.md')
await fileRef.archive()

// Access archived files
const archived = client.directory('old-specs/_').mdFile('deprecated.md')
const content = await archived.read()
```

## Advanced Usage

Powerful features for complex documentation workflows.

### File Tree Navigation

Explore your entire documentation structure programmatically.

```typescript
// Get complete file tree
const tree = await client.fileTree('products')

// Get directories only
const dirs = await client.directoryTree('products')
```

### Batch Operations

Process multiple files efficiently using async generators.

```typescript
// Process all files in directory
for await (const file of directory.mdFilesGenerator()) {
  const entity = await file.read()
  if (entity instanceof Error) continue
  
  // Process each file
  console.log(entity.title)
}
```

## Configuration

Customize the behavior of docs-client to match your project structure.

```typescript
const client = new DocClient({
  fileSystem,
  config: {
    indexFileName: 'index.md',        // Default index file
    archiveDirectoryName: '_',        // Archive directory name
    directoryExcludes: ['.git'],      // Ignore directories
    defaultIndexIcon: '📁',           // Icon for index files
  }
})
```


