import { expect, test } from "bun:test"
import { defaultTestConfig } from "../utils"
import { DocFileIndexMetaValue } from "./doc-file-index-meta-value"
import { DocFileIndexSchemaValue } from "./doc-file-index-schema-value"

test("DocFrontMatterIndexValue - 基本的な作成とプロパティアクセス", () => {
  const value = new DocFileIndexMetaValue(
    {
      type: "index-meta",
      icon: "📁",
      schema: {
        name: {
          type: "text",
          required: true,
          title: "名前",
          description: "項目の名前",
          default: "",
        },
        age: {
          type: "number",
          required: false,
          title: "年齢",
          description: "年齢の数値",
          default: 0,
        },
      },
    },
    {
      name: { type: "text", required: true },
      age: { type: "number", required: false },
    },
    defaultTestConfig,
  )

  expect(value.icon).toBe("📁")
  const schema = value.schema().toJson()
  expect(schema.name?.type).toBe("text")
  expect(schema.name?.required).toBe(true)
  expect(schema.age?.type).toBe("number")
  expect(schema.age?.required).toBe(false)
})

test("DocFrontMatterIndexValue - 空のschemaの場合", () => {
  const value = new DocFileIndexMetaValue(
    {
      type: "index-meta",
      icon: "",
      schema: {
        name: {
          type: "text",
          required: true,
          title: null,
          description: null,
          default: "",
        },
        age: {
          type: "number",
          required: false,
          title: null,
          description: null,
          default: 0,
        },
      },
    },
    {
      name: { type: "text", required: true },
      age: { type: "number", required: false },
    },
    defaultTestConfig,
  )

  expect(value.icon).toBe("")
  expect(value.schema().toJson()).toMatchObject({
    name: expect.objectContaining({ type: "text" }),
    age: expect.objectContaining({ type: "number" }),
  })
})

test("DocFrontMatterIndexValue - toYamlでYAML文字列を生成", () => {
  const value = new DocFileIndexMetaValue(
    {
      type: "index-meta",
      icon: "📂",
      schema: {
        name: {
          type: "text",
          required: true,
          title: "名前",
          description: "項目の名前",
          default: "",
        },
        age: {
          type: "number",
          required: false,
          title: "年齢",
          description: "年齢の数値",
          default: 0,
        },
      },
    },
    {
      name: { type: "text", required: true },
      age: { type: "number", required: false },
    },
    defaultTestConfig,
  )

  const yaml = value.toYaml()

  expect(yaml).toContain("icon: 📂")
  expect(yaml).toContain("schema:")
  expect(yaml).toContain("name:")
  expect(yaml).toContain("type: text")
  expect(yaml).toContain("required: true")
})

test("DocFrontMatterIndexValue - 空のiconとschemaでtoYaml", () => {
  const value = new DocFileIndexMetaValue(
    {
      type: "index-meta",
      icon: "",
      schema: {
        name: {
          type: "text",
          required: true,
          title: null,
          description: null,
          default: "",
        },
        age: {
          type: "number",
          required: false,
          title: null,
          description: null,
          default: 0,
        },
      },
    },
    {
      name: { type: "text", required: true },
      age: { type: "number", required: false },
    },
    defaultTestConfig,
  )

  const yaml = value.toYaml()

  expect(yaml).toContain('icon: ""')
  expect(yaml).toContain("schema:")
  expect(yaml).toContain("name:")
  expect(yaml).toContain("age:")
})

test("DocFrontMatterIndexValue - toJsonで元のデータ構造を返す", () => {
  const data = {
    type: "index-meta" as const,
    icon: "📁",
    schema: {
      name: {
        type: "text" as const,
        required: true,
        title: "名前",
        description: "項目の名前",
        default: "",
      },
    },
  }

  const value = new DocFileIndexMetaValue(
    data,
    {
      name: { type: "text", required: true },
    },
    defaultTestConfig,
  )
  expect(value.toJson()).toEqual(data)
})

test("DocFrontMatterIndexValue - 不変性の確認", () => {
  const value = new DocFileIndexMetaValue(
    {
      type: "index-meta",
      icon: "📁",
      schema: {
        name: {
          type: "text",
          required: true,
          title: null,
          description: null,
          default: "",
        },
        age: {
          type: "number",
          required: false,
          title: null,
          description: null,
          default: 0,
        },
      },
    },
    {
      name: { type: "text", required: true },
      age: { type: "number", required: false },
    },
    defaultTestConfig,
  )

  expect(() => {
    // @ts-expect-error - 不変性のテスト
    value.value = {}
  }).toThrow()
})

test("DocFrontMatterIndexValue - schemaメソッドでスキーマを取得", () => {
  const value = new DocFileIndexMetaValue(
    {
      type: "index-meta",
      icon: "📁",
      schema: {
        name: {
          type: "text",
          required: true,
          title: null,
          description: null,
          default: "",
        },
        age: {
          type: "number",
          required: false,
          title: null,
          description: null,
          default: 0,
        },
      },
    },
    {
      name: { type: "text", required: true },
      age: { type: "number", required: false },
    },
    defaultTestConfig,
  )

  const schema = value.schema()
  expect(schema).toBeInstanceOf(DocFileIndexSchemaValue)
  expect(schema.toJson()).toEqual({
    name: {
      type: "text",
      required: true,
      title: null,
      description: null,
      default: "",
    },
    age: {
      type: "number",
      required: false,
      title: null,
      description: null,
      default: 0,
    },
  })
})

test("DocFrontMatterIndexValue - indexMetaIncludesで指定されたプロパティが保持される", () => {
  const config = {
    ...defaultTestConfig,
    indexMetaIncludes: ["layout", "hero", "features"],
  }

  const value = DocFileIndexMetaValue.fromRecord(
    {
      icon: "🏠",
      layout: "home",
      hero: {
        name: "My Project",
        text: "Welcome to my project",
      },
      features: [
        { title: "Feature 1", details: "Description 1" },
        { title: "Feature 2", details: "Description 2" },
      ],
      schema: {
        title: {
          type: "text",
          required: true,
          title: "タイトル",
          description: "ページのタイトル",
          default: "",
        },
      },
    },
    {
      title: { type: "text", required: true },
    },
    config,
  )

  // YAMLに追加プロパティが含まれることを確認
  const yaml = value.toYaml()
  expect(yaml).toContain("layout: home")
  expect(yaml).toContain("hero:")
  expect(yaml).toContain("features:")

  // 基本的なプロパティも含まれることを確認
  expect(yaml).toContain("icon: 🏠")
  expect(yaml).toContain("schema:")
})

test("DocFrontMatterIndexValue - indexMetaIncludesに含まれないプロパティは除外される", () => {
  const config = {
    ...defaultTestConfig,
    indexMetaIncludes: ["layout"], // featuresは含まない
  }

  const value = DocFileIndexMetaValue.fromRecord(
    {
      icon: "📄",
      layout: "docs",
      features: ["Feature 1", "Feature 2"], // これは除外される
      otherProp: "value", // これも除外される
      schema: {},
    },
    {},
    config,
  )

  const yaml = value.toYaml()
  expect(yaml).toContain("layout: docs")
  expect(yaml).not.toContain("features:")
  expect(yaml).not.toContain("otherProp:")
})

test("DocFrontMatterIndexValue - 空のcustomSchemaでも実際のschemaを正しく処理", () => {
  // Markdownテキストから生成（実際のindex.mdと同じ形式）
  const markdownText = `---
icon: 📄
schema:
  isDone:
    type: boolean
    title: 完了
---

# 機能

テストコンテンツ`

  // 空のcustomSchemaで生成
  const value = DocFileIndexMetaValue.from(
    markdownText,
    {}, // 空のcustomSchema
    defaultTestConfig,
  )

  // schemaが正しく抽出されることを確認
  const schema = value.schema()
  const schemaJson = schema.toJson()

  // isDoneフィールドが存在することを確認
  expect(schemaJson).toHaveProperty("isDone")
  if ("isDone" in schemaJson) {
    expect(schemaJson.isDone).toMatchObject({
      type: "boolean",
      title: "完了",
    })
  }

  // iconも正しく設定されていることを確認
  expect(value.icon).toBe("📄")
})

test("DocFrontMatterIndexValue - fromRecordで空のcustomSchemaでも実際のschemaを処理", () => {
  const record = {
    icon: "📄",
    schema: {
      milestone: {
        type: "relation",
        title: "マイルストーン",
        path: "/docs/studio/milestones",
      },
      priority: {
        type: "select-number",
        title: "優先度",
        options: [0, 1, 2],
      },
      isDone: {
        type: "boolean",
        title: "完了",
      },
    },
  }

  // 空のcustomSchemaで生成
  const value = DocFileIndexMetaValue.fromRecord(
    record,
    {}, // 空のcustomSchema
    defaultTestConfig,
  )

  const schemaJson = value.schema().toJson()

  // すべてのフィールドが正しく処理されることを確認
  expect(Object.keys(schemaJson)).toHaveLength(3)

  if ("milestone" in schemaJson) {
    expect(schemaJson.milestone).toMatchObject({
      type: "relation",
      title: "マイルストーン",
      path: "/docs/studio/milestones",
    })
  }

  if ("priority" in schemaJson) {
    expect(schemaJson.priority).toMatchObject({
      type: "select-number",
      title: "優先度",
      options: [0, 1, 2],
    })
  }

  if ("isDone" in schemaJson) {
    expect(schemaJson.isDone).toMatchObject({
      type: "boolean",
      title: "完了",
    })
  }
})

test("DocFrontMatterIndexValue - toJsonでschemaが含まれる", () => {
  const record = {
    icon: "📄",
    schema: {
      isDone: {
        type: "boolean",
        title: "完了",
      },
    },
  }

  const value = DocFileIndexMetaValue.fromRecord(
    record,
    {}, // 空のcustomSchema
    defaultTestConfig,
  )

  const json = value.toJson()

  expect(json.type).toBe("index-meta")
  expect(json.icon).toBe("📄")
  expect(json.schema).toBeDefined()
  expect(Object.keys(json.schema)).toContain("isDone")
})
