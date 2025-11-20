import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { DocClient } from "../lib/doc-client"
import { DocFileSystem } from "../lib/modules/file-system/doc-file-system"
import { DocFileSystemJsonRead } from "../lib/modules/file-system/doc-file-system-json-read"
import { DocFileSystemNodeWrite } from "../lib/modules/file-system/doc-file-system-node-write"

/**
 * Debug script for JSON file system
 */

console.log("JSON File System Debug")
console.log("======================\n")

// Load JSON data
const jsonPath = join(import.meta.dir, "sample-docs-data.json")
console.log("Loading:", jsonPath)

let jsonData: unknown
try {
  const jsonContent = await readFile(jsonPath, "utf-8")
  jsonData = JSON.parse(jsonContent)
  console.log("✅ Loaded\n")
} catch (error) {
  console.error("❌ Failed:", error)
  process.exit(1)
}

// Setup JSON reader
const jsonReader = new DocFileSystemJsonRead({
  data: jsonData,
  basePath: "docs",
})

// Setup local writer (not used)
const localWriter = new DocFileSystemNodeWrite({
  basePath: "/tmp/docs-json-output",
})

// Create file system
const fileSystem = new DocFileSystem({
  basePath: "docs",
  reader: jsonReader,
  writer: localWriter,
})

const client = new DocClient({
  fileSystem,
})

console.log("Configuration:")
console.log("- Reader: JSON (sample-docs-data.json)")
console.log("- Writer: Local (/tmp/docs-json-output)")
console.log("- Base path:", client.basePath())

// JSON data overview
console.log("\n--- Data Overview ---")
const allPaths = jsonReader.getAllFilePaths()
console.log(`Total files: ${allPaths.length}`)
console.log("\nFiles:")
allPaths.forEach((path) => {
  const ext = path.split(".").pop()
  const icon =
    ext === "md" ? "📝" : ext === "json" ? "📦" : ext === "ts" ? "📘" : "📄"
  console.log(`  ${icon} ${path}`)
})

// Root directory
console.log("\n--- Root Directory ---")
const rootDir = client.directory("")
const rootDirs = await rootDir.directoryNames()
const rootFiles = await rootDir.fileNames()

if (!(rootDirs instanceof Error)) {
  console.log("Directories:", rootDirs.join(", "))
}

if (!(rootFiles instanceof Error)) {
  console.log("Files:", rootFiles.join(", "))
}

// Docs directory
console.log("\n--- docs/ ---")
const docsDir = client.directory("docs")
const docsDirs = await docsDir.directoryNames()
const docsFiles = await docsDir.fileNames()

if (!(docsDirs instanceof Error)) {
  console.log("Subdirectories:", docsDirs.join(", "))
}

if (!(docsFiles instanceof Error)) {
  console.log("Files:", docsFiles.join(", "))
}

// Read README.md
console.log("\n--- README.md ---")
const readmeContent = await jsonReader.readFile("README.md")
if (typeof readmeContent === "string") {
  console.log(`First 200 chars: ${readmeContent.slice(0, 200)}...`)
  const size = await jsonReader.getFileSize("README.md")
  console.log(`Size: ${size} bytes`)
}

// Read and parse docs/index.md
console.log("\n--- docs/index.md ---")
const indexFile = await client.file("docs/index.md").read()
if (!(indexFile instanceof Error)) {
  console.log("Title:", indexFile.content.title)
  console.log("Description:", indexFile.content.description)
  const meta = indexFile.content.meta()
  console.log("Meta keys:", Object.keys(meta))
}

// Read docs/getting-started/installation.md
console.log("\n--- docs/getting-started/installation.md ---")
const installFile = await client
  .file("docs/getting-started/installation.md")
  .read()
if (!(installFile instanceof Error)) {
  console.log("Title:", installFile.content().title)
  const meta = installFile.content().meta()
  console.log("Meta keys:", Object.keys(meta))
}

// Path validation
console.log("\n--- Path Validation ---")

console.log("File existence:")
const filesToCheck = ["README.md", "docs/index.md", "non-existent.md"]
for (const file of filesToCheck) {
  const exists = await jsonReader.fileExists(file)
  console.log(`  ${file}: ${exists ? "✓" : "✗"}`)
}

console.log("\nDirectory existence:")
const dirsToCheck = ["docs", "docs/getting-started", "non-existent"]
for (const dir of dirsToCheck) {
  const exists = await jsonReader.directoryExists(dir)
  console.log(`  ${dir}/: ${exists ? "✓" : "✗"}`)
}

// Nested directories
console.log("\n--- docs/getting-started/ ---")
const gettingStartedDir = client.directory("docs/getting-started")
const gsFiles = await gettingStartedDir.fileNames()

if (!(gsFiles instanceof Error)) {
  console.log("Files:", gsFiles.join(", "))
}

console.log("\n--- docs/guides/ ---")
const guidesDir = client.directory("docs/guides")
const guidesFiles = await guidesDir.fileNames()

if (!(guidesFiles instanceof Error)) {
  console.log("Files:", guidesFiles.join(", "))
}

// Error cases
console.log("\n--- Error Cases ---")

const nonExistent = await jsonReader.readFile("non-existent.md")
console.log("Non-existent file:", nonExistent === null ? "null ✓" : "error")

const modTime = await jsonReader.getFileUpdatedTime("README.md")
console.log(
  "Modified time:",
  modTime instanceof Error
    ? `Error: ${modTime.message.slice(0, 50)}...`
    : "unexpected",
)

console.log("\n✅ Complete")
