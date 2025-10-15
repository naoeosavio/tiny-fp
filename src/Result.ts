import { none, some, type Option } from "./Option";
import { Pair } from "./Pair";

export type Done<T> = { readonly $: "Done"; readonly value: T };
export type Fail<E> = { readonly $: "Fail"; readonly error: E };
export type Result<T, E> = Done<T> | Fail<E>;

export const Result = {
  // Constructors
  done: <T>(value: T): Done<T> => ({ $: "Done", value }),
  fail: <E>(error: E): Fail<E> => ({ $: "Fail", error }),
  new: <T, E = unknown>(value: T, error: E): Result<T, E> =>
    value === undefined || value === null
      ? { $: "Fail", error }
      : { $: "Done", value },

  // Guards
  isDone: <T, E>(result: Result<T, E>): result is Done<T> =>
    result.$ === "Done",
  isFail: <T, E>(result: Result<T, E>): result is Fail<E> =>
    result.$ === "Fail",

  // Conversions
  fromNullable: <T, E = unknown>(
    value: T | null | undefined,
    error: E,
  ): Result<T, E> => (value == null ? Result.fail(error) : Result.done(value)),
  fromThrowable: <T, E = unknown>(
    fn: () => T,
    onError: (e: unknown) => E,
  ): Result<T, E> => {
    try {
      return Result.done(fn());
    } catch (e) {
      return Result.fail(onError(e));
    }
  },
  fromPromise: async <T, E = unknown>(
    promise: Promise<T>,
    onError: (e: unknown) => E,
  ): Promise<Result<T, E>> => {
    try {
      const value = await promise;
      return Result.done(value);
    } catch (e) {
      return Result.fail(onError(e));
    }
  },

  // Ops
  map: <T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> =>
    result.$ === "Done" ? Result.done(fn(result.value)) : result,
  mapError: <T, E, F>(
    result: Result<T, E>,
    fn: (error: E) => F,
  ): Result<T, F> =>
    result.$ === "Fail" ? Result.fail(fn(result.error)) : result,
  flatMap: <T, U, E>(
    result: Result<T, E>,
    fn: (value: T) => Result<U, E>,
  ): Result<U, E> => (result.$ === "Done" ? fn(result.value) : result),
  match: <T, E, U>(
    result: Result<T, E>,
    matcher: { done: (value: T) => U; fail: (error: E) => U },
  ): U =>
    result.$ === "Done"
      ? matcher.done(result.value)
      : matcher.fail(result.error),
  recover: <T, E>(
    result: Result<T, E>,
    fn: (error: E) => T,
  ): Result<T, never> =>
    result.$ === "Fail" ? Result.done(fn(result.error)) : result,

  // Extract
  getOrElse: <T, E>(result: Result<T, E>, defaultValue: T): T =>
    result.$ === "Done" ? result.value : defaultValue,
  getOrThrow: <T, E>(result: Result<T, E>, onError: (error: E) => never): T =>
    result.$ === "Done" ? result.value : onError(result.error),

  // Combine
  zip: <A, B, E>(a: Result<A, E>, b: Result<B, E>): Result<Pair<A, B>, E> => {
    if (a.$ === "Fail") return a;
    if (b.$ === "Fail") return b;
    return Result.done([a.value, b.value]);
  },
  apply: <T, U, E>(
    fn: Result<(value: T) => U, E>,
    arg: Result<T, E>,
  ): Result<U, E> => {
    if (fn.$ === "Fail") return fn;
    if (arg.$ === "Fail") return arg;
    return Result.done(fn.value(arg.value));
  },

  // Convert
  toOption: <T, E>(result: Result<T, E>): Option<T> =>
    result.$ === "Done" ? some(result.value) : none(),
};

export const done = Result.done;
export const fail = Result.fail;

declare global {
  interface Promise<T> {
    toResult<E = unknown>(onError?: (e: unknown) => E): Promise<Result<T, E>>;
  }
}

Promise.prototype.toResult = function <T, E = unknown>(
  this: Promise<T>,
  onError?: (e: unknown) => E,
): Promise<Result<T, E>> {
  const mapErr = (e: unknown) => (onError ? onError(e) : (e as E));
  return Result.fromPromise(this, mapErr);
};
