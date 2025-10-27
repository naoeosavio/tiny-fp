export type Done<T> = { readonly $: "Done"; readonly value: T };
export type Fail<E> = { readonly $: "Fail"; readonly error: E };
export type Result<T, E> = Done<T> | Fail<E>;

export const done = <T>(value: T): Done<T> => ({ $: "Done", value });
export const fail = <E>(error: E): Fail<E> => ({ $: "Fail", error });
export const make = <T, E = unknown>(value: T, error: E): Result<T, E> =>
  value == null ? { $: "Fail", error } : { $: "Done", value };

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

export const fromPromise = <T, E = unknown>(
  promise: Promise<T>,
  onError: (e: unknown) => E,
): Promise<Result<T, E>> => promise.then(done, (e) => fail(onError(e)));

export const map = <T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U,
): Result<U, E> => (result.$ === "Done" ? done(fn(result.value)) : result);

export const mapError = <T, E, F>(
  result: Result<T, E>,
  fn: (error: E) => F,
): Result<T, F> => (result.$ === "Fail" ? fail(fn(result.error)) : result);

export const bimap = <T, E, U, F>(
  result: Result<T, E>,
  onDone: (value: T) => U,
  onFail: (error: E) => F,
): Result<U, F> =>
  result.$ === "Done" ? done(onDone(result.value)) : fail(onFail(result.error));

export const flatMap = <T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>,
): Result<U, E> => (result.$ === "Done" ? fn(result.value) : result);

export const match = <T, E, U>(
  result: Result<T, E>,
  matcher: { done: (value: T) => U; fail: (error: E) => U },
): U =>
  result.$ === "Done" ? matcher.done(result.value) : matcher.fail(result.error);

export const fold = <T, E, U>(
  result: Result<T, E>,
  onFail: (error: E) => U,
  onDone: (value: T) => U,
): U => (result.$ === "Done" ? onDone(result.value) : onFail(result.error));

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
): Result<[A, B], E> => {
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

export const orElse = <T, E>(a: Result<T, E>, b: Result<T, E>): Result<T, E> =>
  a.$ === "Done" ? a : b;

export const filter = <T, E>(
  result: Result<T, E>,
  predicate: (value: T) => boolean,
  onFalse: E,
): Result<T, E> =>
  result.$ === "Done"
    ? predicate(result.value)
      ? result
      : fail(onFalse)
    : result;

export const tap = <T, E>(
  result: Result<T, E>,
  f: (value: T) => void,
): Result<T, E> => {
  if (result.$ === "Done") f(result.value);
  return result;
};

export const tapError = <T, E>(
  result: Result<T, E>,
  f: (error: E) => void,
): Result<T, E> => {
  if (result.$ === "Fail") f(result.error);
  return result;
};

// Backwards-compatible namespace-style object
export const Result = {
  done,
  fail,
  new: make,
  isDone,
  isFail,
  fromNullable,
  fromThrowable,
  fromPromise,
  map,
  mapError,
  bimap,
  flatMap,
  match,
  fold,
  recover,
  getOrElse,
  getOrThrow,
  zip,
  apply,
  orElse,
  filter,
  tap,
  tapError,
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
