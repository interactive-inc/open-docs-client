import { expect, test } from "bun:test"
import { zDocCustomSchemaField } from "./models"
import { defineSchema, docCustomSchemaField } from "./utils"

test("docCustomSchemaField.text - complete structure", () => {
  const field = docCustomSchemaField.text(true)

  expect(() => zDocCustomSchemaField.parse(field)).not.toThrow()

  expect(field).toEqual({
    type: "text",
    required: true,
  })
})

test("docCustomSchemaField.number - complete structure", () => {
  const field = docCustomSchemaField.number(false)

  expect(() => zDocCustomSchemaField.parse(field)).not.toThrow()

  expect(field).toEqual({
    type: "number",
    required: false,
  })
})

test("docCustomSchemaField.boolean - complete structure", () => {
  const field = docCustomSchemaField.boolean(true)

  expect(() => zDocCustomSchemaField.parse(field)).not.toThrow()

  expect(field).toEqual({
    type: "boolean",
    required: true,
  })
})

test("docCustomSchemaField.relation - complete structure with path", () => {
  const field = docCustomSchemaField.relation(true, "docs/items")

  expect(() => zDocCustomSchemaField.parse(field)).not.toThrow()

  expect(field).toEqual({
    type: "relation",
    required: true,
    title: null,
    description: null,
    path: "docs/items",
  })
})

test("docCustomSchemaField.multiRelation - complete structure with path", () => {
  const field = docCustomSchemaField.multiRelation(true, "docs/tags")

  expect(() => zDocCustomSchemaField.parse(field)).not.toThrow()

  expect(field).toEqual({
    type: "multi-relation",
    required: true,
    title: null,
    description: null,
    path: "docs/tags",
  })
})

test("docCustomSchemaField.selectText - complete structure", () => {
  const field = docCustomSchemaField.selectText(false)

  expect(() => zDocCustomSchemaField.parse(field)).not.toThrow()

  expect(field).toEqual({
    type: "select-text",
    required: false,
  })
})

test("docCustomSchemaField.selectNumber - complete structure", () => {
  const field = docCustomSchemaField.selectNumber(true)

  expect(() => zDocCustomSchemaField.parse(field)).not.toThrow()

  expect(field).toEqual({
    type: "select-number",
    required: true,
  })
})

test("docCustomSchemaField.multiText - complete structure", () => {
  const field = docCustomSchemaField.multiText(false)

  expect(() => zDocCustomSchemaField.parse(field)).not.toThrow()

  expect(field).toEqual({
    type: "multi-text",
    required: false,
  })
})

test("docCustomSchemaField.multiNumber - complete structure", () => {
  const field = docCustomSchemaField.multiNumber(true)

  expect(() => zDocCustomSchemaField.parse(field)).not.toThrow()

  expect(field).toEqual({
    type: "multi-number",
    required: true,
  })
})

test("docCustomSchemaField.multiSelectText - complete structure", () => {
  const field = docCustomSchemaField.multiSelectText(false)

  expect(() => zDocCustomSchemaField.parse(field)).not.toThrow()

  expect(field).toEqual({
    type: "multi-select-text",
    required: false,
  })
})

test("docCustomSchemaField.multiSelectNumber - complete structure", () => {
  const field = docCustomSchemaField.multiSelectNumber(true)

  expect(() => zDocCustomSchemaField.parse(field)).not.toThrow()

  expect(field).toEqual({
    type: "multi-select-number",
    required: true,
  })
})

test("defineSchema - creates valid schema object", () => {
  const schema = defineSchema({
    title: docCustomSchemaField.text(true),
    priority: docCustomSchemaField.number(false),
    tags: docCustomSchemaField.multiRelation(true, "docs/tags"),
  })

  expect(schema).toEqual({
    title: { type: "text", required: true },
    priority: { type: "number", required: false },
    tags: {
      type: "multi-relation",
      required: true,
      title: null,
      description: null,
      path: "docs/tags",
    },
  })
})

test("defineSchema - empty schema", () => {
  const schema = defineSchema({})

  expect(schema).toEqual({})
})
