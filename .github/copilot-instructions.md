---
applyTo: "**"
---

# Overview

Documentation management client library for file management and processing.

## Directory Structure

### Root
- `mcp.ts` - MCP (Model Context Protocol) implementation
- `tsup.config.ts` - Build configuration
- `tsconfig.json` - TypeScript configuration
- `package.json` - Package metadata and dependencies

### lib/
Core library for documentation management

- `entities/` - Document entities (file, index, markdown)
  - `doc-file-entity.ts` - Base file entity
  - `doc-file-index-entity.ts` - Index file entity
  - `doc-file-md-entity.ts` - Markdown file entity
  - `doc-file-unknown-entity.ts` - Unknown file type entity
- `modules/` - Core modules
  - `file-system/` - File system operations
    - `doc-file-system.ts` - File system interface
    - `doc-file-system-json.ts` - JSON file system
    - `doc-file-system-node.ts` - Node.js file system
    - `doc-file-system-octokit.ts` - GitHub file system
    - `doc-file-system-mock.ts` - Mock file system for testing
  - `file-tree-system/` - File tree operations
  - `markdown-system/` - Markdown processing
  - `path-system/` - Path utilities
- `values/` - Value objects
  - `doc-custom-schema-field/` - Custom field implementations
  - `doc-meta-field/` - Meta field implementations
  - `doc-schema-field/` - Schema field implementations
  - Tree and path value objects
- `references/` - Reference implementations for directories and files

### debug/
Debug and testing utilities (not published to npm)

- `debug.ts` - Debug utilities
- `debug-file-system-json.ts` - JSON file system debugging
- `debug-file-system-octokit.ts` - GitHub file system debugging
- `sample-docs-data.json` - Sample data for testing

### docs/
VitePress documentation site
