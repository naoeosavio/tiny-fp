import type { Pair } from "./Pair";

export type Done<T> = { readonly $: "Done"; readonly value: T };
export type Fail<E> = { readonly $: "Fail"; readonly error: E };
export type Result<T, E> = Done<T> | Fail<E>;

export const done = <T>(value: T): Done<T> => ({ $: "Done", value });
export const fail = <E>(error: E): Fail<E> => ({ $: "Fail", error });
export const make = <T, E = unknown>(value: T, error: E): Result<T, E> =>
  value === undefined || value === null
    ? { $: "Fail", error }
    : { $: "Done", value };

export const isDone = <T, E>(result: Result<T, E>): result is Done<T> =>
  result.$ === "Done";
export const isFail = <T, E>(result: Result<T, E>): result is Fail<E> =>
  result.$ === "Fail";

export const fromNullable = <T, E = unknown>(
  value: T | null | undefined,
  error: E,
): Result<T, E> => (value == null ? fail(error) : done(value));

export const fromThrowable = <T, E = unknown>(
  fn: () => T,
  onError: (e: unknown) => E,
): Result<T, E> => {
  try {
    return done(fn());
  } catch (e) {
    return fail(onError(e));
  }
};

export const fromPromise = async <T, E = unknown>(
  promise: Promise<T>,
  onError: (e: unknown) => E,
): Promise<Result<T, E>> => {
  try {
    const value = await promise;
    return done(value);
  } catch (e) {
    return fail(onError(e));
  }
};

export const map = <T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U,
): Result<U, E> => (result.$ === "Done" ? done(fn(result.value)) : result);

export const mapError = <T, E, F>(
  result: Result<T, E>,
  fn: (error: E) => F,
): Result<T, F> => (result.$ === "Fail" ? fail(fn(result.error)) : result);

export const flatMap = <T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>,
): Result<U, E> => (result.$ === "Done" ? fn(result.value) : result);

export const match = <T, E, U>(
  result: Result<T, E>,
  matcher: { done: (value: T) => U; fail: (error: E) => U },
): U =>
  result.$ === "Done" ? matcher.done(result.value) : matcher.fail(result.error);

export const recover = <T, E>(
  result: Result<T, E>,
  fn: (error: E) => T,
): Result<T, never> => (result.$ === "Fail" ? done(fn(result.error)) : result);

export const getOrElse = <T, E>(result: Result<T, E>, defaultValue: T): T =>
  result.$ === "Done" ? result.value : defaultValue;

export const getOrThrow = <T, E>(
  result: Result<T, E>,
  onError: (error: E) => never,
): T => (result.$ === "Done" ? result.value : onError(result.error));

export const zip = <A, B, E>(
  a: Result<A, E>,
  b: Result<B, E>,
): Result<Pair<A, B>, E> => {
  if (a.$ === "Fail") return a;
  if (b.$ === "Fail") return b;
  return done([a.value, b.value]);
};

export const apply = <T, U, E>(
  fn: Result<(value: T) => U, E>,
  arg: Result<T, E>,
): Result<U, E> => {
  if (fn.$ === "Fail") return fn;
  if (arg.$ === "Fail") return arg;
  return done(fn.value(arg.value));
};

declare global {
  interface Promise<T> {
    toResult<E = unknown>(onError: (e: unknown) => E): Promise<Result<T, E>>;
  }
}

Promise.prototype.toResult = function <T, E = unknown>(
  this: Promise<T>,
  onError: (e: unknown) => E,
): Promise<Result<T, E>> {
  return fromPromise(this, onError);
};
