import { done, fail, type Result } from "./Result";

export type None = { readonly $: "None" };
export type Some<T> = { readonly $: "Some"; readonly value: T };
export type Option<T> = None | Some<T>;

export const Option = {
  // Constructors
  none: <T>(): Option<T> => ({ $: "None" }),
  some: <T>(value: T): Option<T> => ({ $: "Some", value }),
  new: <T>(value: T): Option<T> =>
    value === undefined || value === null
      ? ({ $: "None" } as None)
      : ({ $: "Some", value } as Some<T>),

  // Guards
  isSome: <T>(option: Option<T>): option is Some<T> => option.$ === "Some",
  isNone: <T>(option: Option<T>): option is None => option.$ === "None",

  // Conversions
  fromNullable: <T>(value: T | null | undefined): Option<T> =>
    value == null ? Option.none() : Option.some(value),
  fromPredicate: <T>(value: T, predicate: (value: T) => boolean): Option<T> =>
    predicate(value) ? Option.some(value) : Option.none(),
  fromThrowable: <T>(fn: () => T): Option<T> => {
    try {
      return Option.some(fn());
    } catch {
      return Option.none();
    }
  },
  fromPromise: async <T>(promise: Promise<T>): Promise<Option<T>> => {
    try {
      const value = await promise;
      return Option.some(value);
    } catch {
      return Option.none();
    }
  },

  // Ops
  map: <T, U>(option: Option<T>, fn: (value: T) => U): Option<U> =>
    option.$ === "Some" ? Option.some(fn(option.value)) : Option.none(),
  flatMap: <T, U>(option: Option<T>, fn: (value: T) => Option<U>): Option<U> =>
    option.$ === "Some" ? fn(option.value) : Option.none(),
  filter: <T>(
    option: Option<T>,
    predicate: (value: T) => boolean,
  ): Option<T> =>
    option.$ === "Some" && predicate(option.value) ? option : Option.none(),
  match: <T, U>(
    option: Option<T>,
    matcher: { some: (value: T) => U; none: () => U },
  ): U => (option.$ === "Some" ? matcher.some(option.value) : matcher.none()),

  // Extract
  getOrElse: <T>(option: Option<T>, defaultValue: T): T =>
    option.$ === "Some" ? option.value : defaultValue,
  getOrUndefined: <T>(option: Option<T>): T | undefined =>
    option.$ === "Some" ? option.value : undefined,
  getOrThrow: <T>(option: Option<T>, error: Error): T => {
    if (option.$ === "Some") return option.value;
    throw error;
  },

  // Combine
  zip: <T, U>(a: Option<T>, b: Option<U>): Option<[T, U]> =>
    a.$ === "Some" && b.$ === "Some"
      ? Option.some([a.value, b.value])
      : Option.none(),
  apply: <T, U>(fn: Option<(value: T) => U>, opt: Option<T>): Option<U> =>
    fn.$ === "Some" && opt.$ === "Some"
      ? Option.some(fn.value(opt.value))
      : Option.none(),
  orElse: <T>(opt: Option<T>, other: Option<T>): Option<T> =>
    opt.$ === "Some" ? opt : other,

  // Convert
  toResult: <T, E>(option: Option<T>, error: E): Result<T, E> =>
    option.$ === "Some" ? done(option.value) : fail(error),
};

export const none = Option.none;
export const some = Option.some;

declare global {
  interface Array<T> {
    firstOption(): Option<T>;
  }
}

Array.prototype.firstOption = function <T>(this: T[]): Option<T> {
  return this[0] ? some(this[0]) : none();
};
