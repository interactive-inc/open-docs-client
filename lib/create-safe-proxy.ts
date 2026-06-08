type SafeMethod<F> = F extends (...args: infer A) => Promise<infer R>
  ? (...args: A) => Promise<R | Error>
  : F

/**
 * All async methods return T | Error instead of throwing
 */
export type Safe<T> = {
  [K in keyof T as K extends "safe" ? never : K]: SafeMethod<T[K]>
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

        return callResult
      }
    },
  }) as Safe<T>
}
