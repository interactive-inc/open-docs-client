import { DocClient } from "../lib/doc-client"
import { DocFileSystem } from "../lib/modules/file-system/doc-file-system"
import { DocFileSystemNodeWrite } from "../lib/modules/file-system/doc-file-system-node-write"
import { DocFileSystemOctokitRead } from "../lib/modules/file-system/doc-file-system-octokit-read"

/**
 * Debug script for GitHub file system integration
 */

console.log("GitHub File System Debug")
console.log("========================\n")

// Check environment
if (!process.env.GITHUB_TOKEN) {
  console.error("⚠️  GITHUB_TOKEN environment variable is not set")
  console.error(
    "Set it with: export GITHUB_TOKEN=your_github_personal_access_token",
  )
  process.exit(1)
}

// Setup GitHub reader
const octokitReader = new DocFileSystemOctokitRead({
  token: process.env.GITHUB_TOKEN,
  owner: "Ryukyuinteractive",
  repo: "open-docs",
  basePath: "docs",
  branch: "main",
})

// Setup local writer (not used)
const localWriter = new DocFileSystemNodeWrite({
  basePath: "/tmp/docs-output",
})

// Create file system
const fileSystem = new DocFileSystem({
  basePath: "docs",
  reader: octokitReader,
  writer: localWriter,
})

const client = new DocClient({
  fileSystem,
})

console.log("Configuration:")
console.log("- Reader: GitHub (Ryukyuinteractive/open-docs/docs)")
console.log("- Writer: Local (/tmp/docs-output)")
console.log("- Base path:", client.basePath())

// Root directory
console.log("\n--- Root Directory ---")
const rootDir = client.directory("")
const rootDirs = await rootDir.directoryNames()
const rootFiles = await rootDir.fileNames()

if (!(rootDirs instanceof Error)) {
  console.log("Directories:", rootDirs.join(", "))
} else {
  console.error("Error:", rootDirs.message)
}

if (!(rootFiles instanceof Error)) {
  console.log("Files:", rootFiles.slice(0, 5).join(", "))
} else {
  console.error("Error:", rootFiles.message)
}

// Read index.md
console.log("\n--- index.md ---")
const indexFile = await client.file("index.md").read()
if (!(indexFile instanceof Error)) {
  console.log("Title:", indexFile.content.title)
  console.log("Description:", indexFile.content.description?.slice(0, 100))
  const meta = indexFile.content.meta()
  console.log("Icon:", meta.icon)
} else {
  console.error("Error:", indexFile.message)
}

// Studio directory
console.log("\n--- studio/ ---")
const studioDir = client.directory("studio")
const studioDirs = await studioDir.directoryNames()
const studioFiles = await studioDir.fileNames()

if (!(studioDirs instanceof Error)) {
  console.log("Subdirectories:", studioDirs.join(", "))
}

if (!(studioFiles instanceof Error)) {
  console.log("Files:", studioFiles.slice(0, 5).join(", "))
}

// Read studio/index.md
console.log("\n--- studio/index.md ---")
const studioIndexFile = await client.file("studio/index.md").read()
if (!(studioIndexFile instanceof Error)) {
  console.log("Title:", studioIndexFile.content.title)
  console.log(
    "Description:",
    studioIndexFile.content.description?.slice(0, 100),
  )
} else {
  console.error("Error:", studioIndexFile.message)
}

// Read nested file
console.log("\n--- studio/features/manage-schema.md ---")
const nestedFile = await client.file("studio/features/manage-schema.md").read()
if (!(nestedFile instanceof Error)) {
  console.log("Title:", nestedFile.content().title)
  const meta = nestedFile.content().meta()
  console.log("Meta keys:", Object.keys(meta))
} else {
  console.error("Error:", nestedFile.message)
}

// File existence check
console.log("\n--- File Existence ---")
const filesToCheck = [
  "index.md",
  "studio/index.md",
  "non-existent.md",
  "studio/features/manage-schema.md",
]

for (const filePath of filesToCheck) {
  const exists = await fileSystem.fileExists(filePath)
  console.log(`${filePath}: ${exists ? "✓" : "✗"}`)
}

// Directory existence check
console.log("\n--- Directory Existence ---")
const dirsToCheck = ["", "studio", "studio/features", "non-existent-dir"]

for (const dirPath of dirsToCheck) {
  const exists = await fileSystem.directoryExists(dirPath)
  const display = dirPath || "(root)"
  console.log(`${display}/: ${exists ? "✓" : "✗"}`)
}

console.log("\n✅ Complete")
