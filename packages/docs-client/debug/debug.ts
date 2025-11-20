import { DocClient } from "@/doc-client"
import { DocFileSystemNode } from "@/modules/file-system/doc-file-system-node"
import { defineSchema, docCustomSchemaField } from "@/utils"

const fileSystem = new DocFileSystemNode({ basePath: "tmp" })

const client = new DocClient({ fileSystem })

// Setup test files
await fileSystem.createDirectory("docs-studio/pages")

await fileSystem.createDirectory("docs-studio/files")

const pagesIndexContent = `---
icon: 📄
schema:
  features:
    type: multi-relation
    required: true
    title: null
    description: null
    path: docs-studio/pages
---

# Pages

All pages in the documentation.`

const documentEditorContent = `---
features:
  - edit-document-content
  - delete-document
---

# Document Editor

This is the document editor page.`

const featureEditContent = `---
is-done: true
---

# Edit Document Content

Feature to edit document content.`

const featureDeleteContent = `---
is-done: false
---

# Delete Document

Feature to delete documents.`

const fileAContent = `---
feature:
  - feature-1
priority: high
---

# File A

This is file A.`

await fileSystem.writeFile("docs-studio/pages/index.md", pagesIndexContent)
await fileSystem.writeFile(
  "docs-studio/pages/document-editor.md",
  documentEditorContent,
)
await fileSystem.writeFile(
  "docs-studio/pages/edit-document-content.md",
  featureEditContent,
)
await fileSystem.writeFile(
  "docs-studio/pages/delete-document.md",
  featureDeleteContent,
)
await fileSystem.writeFile("docs-studio/files/a.md", fileAContent)

// Method 1: Using defineSchema (recommended)
const pageSchema = defineSchema({
  features: docCustomSchemaField.multiRelation(true, "docs-studio/pages"),
})

console.log("pageSchema:", JSON.stringify(pageSchema, null, 2))

const pagesRef = client.directory("docs-studio").directory("pages", pageSchema)

const mdFileRef = pagesRef.file("document-editor.md")

const mdFile = await mdFileRef.read()

if (mdFile instanceof Error) {
  throw mdFile
}

const _features = mdFile.content().meta().field("features")

mdFile.content().withMeta((meta) => {
  return meta.withProperty("features", [
    "edit-document-content",
    "delete-document",
    "foo",
  ])
})

// Method 2: Using field helpers
const featureSchema = defineSchema({
  "is-done": docCustomSchemaField.boolean(true),
})

const relations = await mdFileRef.relations("features", featureSchema)

const file = await relations[0].read()

if (file instanceof Error) {
  throw file
}

// Method 3: Using defineSchema with multiple fields
const fileSchema = defineSchema({
  feature: docCustomSchemaField.multiRelation(true, "docs-studio/files"),
  priority: docCustomSchemaField.text(false),
})

const filesRef = client.directory("docs-studio/files", fileSchema)

const fileA = filesRef.mdFile("a")

const fileAResult = await fileA.read()

if (fileAResult instanceof Error) {
  throw fileAResult
}

const featureField = fileAResult.content().meta().field("feature")

console.log("feature field:", featureField)
