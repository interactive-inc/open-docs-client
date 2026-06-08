import { expect, test } from "bun:test"
import { createSafeProxy } from "./create-safe-proxy"

class TestTarget {
  constructor() {
    Object.freeze(this)
  }

  get name(): string {
    return "test"
  }

  async succeed(): Promise<string> {
    return "ok"
  }

  async fail(): Promise<string> {
    throw new Error("boom")
  }

  async failWithNonError(): Promise<string> {
    throw "string error"
  }

  syncMethod(): number {
    return 42
  }
}

test("createSafeProxy - 成功時は値をそのまま返す", async () => {
  const target = new TestTarget()
  const proxy = createSafeProxy(target)

  const safeResult = await proxy.succeed()
  expect(safeResult).toBe("ok")
})

test("createSafeProxy - throwをErrorとして返す", async () => {
  const target = new TestTarget()
  const proxy = createSafeProxy(target)

  const safeResult = await proxy.fail()
  expect(safeResult).toBeInstanceOf(Error)

  if (safeResult instanceof Error) {
    expect(safeResult.message).toBe("boom")
  }
})

test("createSafeProxy - 非Errorのthrowをwrapする", async () => {
  const target = new TestTarget()
  const proxy = createSafeProxy(target)

  const safeResult = await proxy.failWithNonError()
  expect(safeResult).toBeInstanceOf(Error)
})

test("createSafeProxy - 同期メソッドはそのまま返す", () => {
  const target = new TestTarget()
  const proxy = createSafeProxy(target)

  const syncResult = proxy.syncMethod()
  expect(syncResult).toBe(42)
})

test("createSafeProxy - getterはそのまま返す", () => {
  const target = new TestTarget()
  const proxy = createSafeProxy(target)

  expect(proxy.name).toBe("test")
})

test("createSafeProxy - frozenオブジェクトでも動作する", async () => {
  const target = new TestTarget()
  const proxy = createSafeProxy(target)

  const successResult = await proxy.succeed()
  expect(successResult).toBe("ok")

  const failResult = await proxy.fail()
  expect(failResult).toBeInstanceOf(Error)
})
