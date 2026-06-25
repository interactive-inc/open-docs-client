type SafeMethod<F> = F extends (...args: infer A) => Promise<infer R>
  ? (...args: A) => Promise<R | Error>
  : F

/**
 * All async methods return T | Error instead of throwing.
 *
 * Promise を返すメソッドのみ T | Error に変換される。AsyncGenerator を返すメソッド
 * （filesGenerator など）は変換されないため、安全に列挙したい場合は配列を返す
 * files()/mdFiles() を .safe 経由で使うこと
 */
export type Safe<T> = {
  [K in keyof T as K extends "safe" ? never : K]: SafeMethod<T[K]>
}

function isAsyncIterator(value: unknown): boolean {
  return (
    value !== null &&
    typeof value === "object" &&
    Symbol.asyncIterator in (value as Record<symbol, unknown>)
  )
}

export function createSafeProxy<T extends object>(target: T): Safe<T> {
  return new Proxy(target, {
    get(obj, prop, receiver) {
      if (prop === "safe") return receiver

      const value = Reflect.get(obj, prop, receiver)

      if (typeof value !== "function") return value

      return (...args: unknown[]) => {
        const callResult = value.apply(obj, args)

        if (callResult instanceof Promise) {
          return callResult.catch((error: unknown) => {
            return error instanceof Error ? error : new Error(String(error))
          })
        }

        // AsyncGenerator は Promise ではないため throw を T | Error に変換できない。
        // 反復中の例外を Error として yield するジェネレータでラップする
        if (isAsyncIterator(callResult)) {
          return safeAsyncIterator(callResult as AsyncIterable<unknown>)
        }

        return callResult
      }
    },
  }) as Safe<T>
}

async function* safeAsyncIterator(
  iterable: AsyncIterable<unknown>,
): AsyncGenerator<unknown, void, unknown> {
  const iterator = iterable[Symbol.asyncIterator]()

  while (true) {
    let next: IteratorResult<unknown>

    try {
      next = await iterator.next()
    } catch (error) {
      yield error instanceof Error ? error : new Error(String(error))
      return
    }

    if (next.done) return

    yield next.value
  }
}
