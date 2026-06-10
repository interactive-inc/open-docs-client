日本語で応答してください。

## Additional Instructions

- @.github/instructions/core.instructions.md
- @.github/instructions/ts.instructions.md

## Overview

Markdown ベースのドキュメントを型安全に管理するクライアントライブラリ。Zod スキーマによるバリデーション、複数ストレージバックエンド、FrontMatter メタデータ管理を提供する。npm パッケージ `@interactive-inc/docs-client` として公開。

## Directory Structure

- `tsup.config.ts` - ビルド設定（ESM、複数エントリポイント）
- `vite.config.ts` - Vite設定（lint/fmt）
- `tsconfig.json` - TypeScript設定
- `lib/` - コアライブラリ
  - `doc-client.ts` - メインファサード（エントリポイント）
  - `create-safe-proxy.ts` - `.safe` プロキシパターン
  - `models.ts` - Zod スキーマ定義
  - `types.ts` - `z.infer` による型定義
  - `utils.ts` - `defineSchema`, `docCustomSchemaField` ヘルパー
  - `constants.ts` - 定数
  - `entities/` - 不変ドキュメントエンティティ（DocFileMdEntity, DocFileIndexEntity, DocFileUnknownEntity）
  - `modules/` - コアモジュール
    - `file-system/` - ファイルI/O抽象レイヤー（Node.js, JSON, Octokit, Mock実装）
    - `file-tree-system/` - ツリー構造構築
    - `markdown-system/` - Markdown パース
    - `path-system/` - パス操作抽象
  - `values/` - 不変値オブジェクト群
  - `references/` - ファイル/ディレクトリへの遅延参照ハンドル

## Tech Stack

- TypeScript
- Bun（ランタイム/テスト）
- Zod（スキーマバリデーション、型生成）
- Octokit（GitHub ファイルシステムバックエンド）

## Commands

- `bun test` - テスト実行
- `bun run check` - 型チェック（tsgo）
- `bun run build` - ビルド（tsup）
- `bun run lint` / `bun run fmt` - lint と整形（vite-plus）

## Architecture

### レイヤー構成

```
DocClient（ファサード）
  → References（遅延参照。read() まで I/O しない）
    → Entities（不変データ。Zod でバリデーション済み）
      → Values（不変値オブジェクト。FrontMatter、パス情報など）
  → Modules（ファイルI/O、パス操作、Markdown パースなど基盤）
```

### エントリポイント分離

`package.json` の `exports` で用途別にサブパスを分離:

- `.` - コアAPI（DocClient, エンティティ, リファレンス, 値オブジェクト, 型）
- `./models` - Zod スキーマのみ
- `./file-system` - DocFileSystem（Read/Write 合成）
- `./file-system-node` - Node.js ファイルシステム
- `./file-system-json` - JSON インメモリ
- `./file-system-octokit` - GitHub API 経由
- `./file-system-mock` - テスト用モック

### エラーハンドリング方針

- FileSystem 層: `T | Error` を返す（throw しない）
- Reference 層: FileSystem のエラーを受けて throw する
- `.safe` プロキシ: `createSafeProxy` が全 async メソッドの throw を catch し `T | Error` に変換。`client.safe.fileTree()` のように使う

### スキーマ定義

ドキュメントのメタデータ構造を定義する2つの方法:

- `.meta.json` ファイル（優先）: ディレクトリに配置
- `index.md` の FrontMatter（フォールバック）: `.meta.json` がなければ使用

コード側では `defineSchema()` で型安全にスキーマを定義し、`DocClient.directory(path, schema)` でジェネリクスを通じて型推論が効く。

### 不変性の徹底

- 全クラスのコンストラクタで `Object.freeze(this)` を呼ぶ
- 更新は `with*()` メソッドで新インスタンスを返す
- Zod スキーマから `z.infer` で型を生成し、ランタイムバリデーションと型安全性を両立
