日本語で応答してください。

## Additional Instructions

- @.github/instructions/core.instructions.md
- @.github/instructions/ts.instructions.md

## Overview

ドキュメント管理クライアントライブラリ。ファイル管理と処理を提供する。

## Directory Structure

- `mcp.ts` - MCP実装
- `tsup.config.ts` - ビルド設定
- `tsconfig.json` - TypeScript設定
- `lib/` - コアライブラリ
  - `entities/` - ドキュメントエンティティ
  - `modules/` - コアモジュール（file-system, file-tree-system, markdown-system, path-system）
  - `values/` - 値オブジェクト
  - `references/` - ディレクトリ・ファイル参照
- `debug/` - デバッグ用（npm未公開）

## Tech Stack

- TypeScript
- Bun
- Zod
- MCP SDK
- Octokit（GitHub連携）

## Architecture

- npmパッケージとして公開（@interactive-inc/docs-client）
- 複数ファイルシステム対応（Node.js、JSON、Octokit、Mock）
- スキーマ定義: `.meta.json`優先、なければindex.mdのFrontMatter使用
