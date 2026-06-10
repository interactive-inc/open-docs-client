- 日本語で応答してください。

# Overview

Markdown ベースのドキュメントを型安全に管理するクライアントライブラリ。Zod スキーマによるバリデーション、複数ストレージバックエンド、FrontMatter メタデータ管理を提供する。npm パッケージ `@interactive-inc/docs-client` として公開。

## Directory Structure

- `lib/doc-client.ts` - メインファサード
- `lib/create-safe-proxy.ts` - `.safe` プロキシパターン
- `lib/models.ts` - Zod スキーマ定義
- `lib/types.ts` - 型定義（`z.infer` による生成）
- `lib/utils.ts` - `defineSchema`, `docCustomSchemaField` ヘルパー
- `lib/entities/` - 不変ドキュメントエンティティ
- `lib/modules/` - コアモジュール（file-system, file-tree-system, markdown-system, path-system）
- `lib/values/` - 不変値オブジェクト
- `lib/references/` - ファイル/ディレクトリへの遅延参照

## Technical Features

- TypeScript, Bun, Zod, Octokit
- ESM のみ、tsup でビルド

## Decoupled Design

- FileSystem の Read/Write を別クラスに分離（Strategy パターン）
- ストレージバックエンド（Node.js, JSON, Octokit, Mock）は差し替え可能

## Core Location

- `lib/doc-client.ts` がファサードとして全機能へのアクセスを提供
- `lib/create-safe-proxy.ts` がエラーハンドリングの `.safe` プロキシを実装

## System Independence

- entities, values は FileSystem に依存しない純粋なデータ層
- references は FileSystem に依存する I/O 層
- modules は基盤（ファイルI/O、パス操作、Markdown パース）
