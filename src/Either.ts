import { pair, Pair } from "./Pair";

export type Left<A> = { readonly $: "Left"; readonly value: A };
export type Right<B> = { readonly $: "Right"; readonly value: B };
export type Either<A, B> = Left<A> | Right<B>;

export const Either = {
  // Constructors
  left: <A>(value: A): Left<A> => ({ $: "Left", value }),
  right: <B>(value: B): Right<B> => ({ $: "Right", value }),
  new: <A, B>(rgt: B, lft: A): Either<A, B> =>
    rgt === undefined || rgt === null ? Either.left(lft) : Either.right(rgt),

  // Guards
  isLeft: <A, B>(e: Either<A, B>): e is Left<A> => e.$ === "Left",
  isRight: <A, B>(e: Either<A, B>): e is Right<B> => e.$ === "Right",

  // Conversions
  fromNullable: <A, B>(value: B | null | undefined, error: A): Either<A, B> =>
    value == null ? Either.left(error) : Either.right(value),
  fromThrowable: <A, B>(
    fn: () => B,
    onError: (e: unknown) => A,
  ): Either<A, B> => {
    try {
      return Either.right(fn());
    } catch (e) {
      return Either.left(onError(e));
    }
  },
  fromPromise: async <A, B>(
    promise: Promise<B>,
    onError: (e: unknown) => A,
  ): Promise<Either<A, B>> => {
    try {
      const value = await promise;
      return Either.right(value);
    } catch (e) {
      return Either.left(onError(e));
    }
  },

  // Ops
  map: <A, B, C>(e: Either<A, B>, fn: (r: B) => C): Either<A, C> =>
    e.$ === "Right" ? Either.right(fn(e.value)) : e,
  mapLeft: <A, B, C>(e: Either<A, B>, fn: (l: A) => C): Either<C, B> =>
    e.$ === "Left" ? Either.left(fn(e.value)) : e,
  bimap: <A, B, C, D>(
    e: Either<A, B>,
    fl: (l: A) => C,
    fr: (r: B) => D,
  ): Either<C, D> =>
    e.$ === "Left" ? Either.left(fl(e.value)) : Either.right(fr(e.value)),
  flatMap: <A, B, C>(
    e: Either<A, B>,
    fn: (value: B) => Either<A, C>,
  ): Either<A, C> => (e.$ === "Right" ? fn(e.value) : e),
  chain: <A, B, C>(
    e: Either<A, B>,
    fn: (r: B) => Either<A, C>,
  ): Either<A, C> => (e.$ === "Right" ? fn(e.value) : e),
  fold: <A, B, C>(
    e: Either<A, B>,
    onLeft: (l: A) => C,
    onRight: (r: B) => C,
  ): C => (e.$ === "Left" ? onLeft(e.value) : onRight(e.value)),
  match: <A, B, C>(
    e: Either<A, B>,
    matcher: { right: (value: B) => C; left: (value: A) => C },
  ): C => (e.$ === "Right" ? matcher.right(e.value) : matcher.left(e.value)),
  swap: <A, B>(e: Either<A, B>): Either<B, A> =>
    e.$ === "Right" ? Either.left(e.value) : Either.right(e.value),

  // Extract
  getOrElse: <A, B>(e: Either<A, B>, defaultValue: B): B =>
    e.$ === "Right" ? e.value : defaultValue,

  // Combine
  zip: <E, A, B>(a: Either<E, A>, b: Either<E, B>): Either<E, Pair<A, B>> => {
    if (a.$ === "Left") return a;
    if (b.$ === "Left") return b;
    return Either.right(pair(a.value, b.value));
  },
  apply: <E, A, B>(
    fn: Either<E, (value: A) => B>,
    arg: Either<E, A>,
  ): Either<E, B> => {
    if (fn.$ === "Left") return fn;
    if (arg.$ === "Left") return arg;
    return Either.right(fn.value(arg.value));
  },
  tap: <A, B>(e: Either<A, B>, f: (r: B) => void): Either<A, B> => {
    if (e.$ === "Right") f(e.value);
    return e;
  },
  tapLeft: <A, B>(e: Either<A, B>, f: (l: A) => void): Either<A, B> => {
    if (e.$ === "Left") f(e.value);
    return e;
  },
};

declare global {
  interface Promise<T> {
    toEither<A>(onError: (e: unknown) => A): Promise<Either<A, T>>;
  }
}

Promise.prototype.toEither = async function <T, L = unknown>(
  this: Promise<T>,
  onError: (e: unknown) => L,
): Promise<Either<L, T>> {
  try {
    const v = await this;
    return right<T>(v);
  } catch (e_1) {
    return left<L>(onError(e_1));
  }
};

export const left = Either.left;
export const right = Either.right;
