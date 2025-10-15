import { none, some, type Option } from "./Option";
import { done, fail, type Result } from "./Result";

export type Pair<A, B> = readonly [A, B];

export const Pair = {
  fst: <A, B>(p: Pair<A, B>): A => p[0],
  snd: <A, B>(p: Pair<A, B>): B => p[1],
  new: <A, B>(fst: A, snd: B): Pair<A, B> => [fst, snd],

  fromArray: <A, B>([fst, snd]: [A, B]): Pair<A, B> => [fst, snd],
  fromObject: <A, B>(obj: { fst: A; snd: B }): Pair<A, B> => [obj.fst, obj.snd],
  curry:
    <A>(fst: A) =>
    <B>(snd: B): Pair<A, B> => [fst, snd],

  mapFirst: <A, B, C>(p: Pair<A, B>, fn: (a: A) => C): Pair<C, B> =>
    pair(fn(p[0]), p[1]),
  mapSecond: <A, B, C>(p: Pair<A, B>, fn: (b: B) => C): Pair<A, C> =>
    pair(p[0], fn(p[1])),
  map: <A, B, C, D>(
    p: Pair<A, B>,
    fnA: (a: A) => C,
    fnB: (b: B) => D,
  ): Pair<C, D> => pair(fnA(p[0]), fnB(p[1])),

  swap: <A, B>(p: Pair<A, B>): Pair<B, A> => pair(p[1], p[0]),

  apply: <A, B, C>(p: Pair<(a: A) => B, C>, value: A): Pair<B, C> =>
    pair(p[0](value), p[1]),
  apply2: <A, B, C>(
    fnPair: Pair<(a: A) => B, (b: B) => C>,
    vPair: Pair<A, B>,
  ): Pair<A, C> => pair(vPair[0], fnPair[1](vPair[1])),

  reduce: <A, B, C>(p: Pair<A, B>, fn: (a: A, b: B) => C): C => fn(p[0], p[1]),
  toArray: <A, B>(p: Pair<A, B>): [A, B] => [p[0], p[1]],
  toObject: <A, B>(p: Pair<A, B>): { fst: A; snd: B } => ({
    fst: p[0],
    snd: p[1],
  }),

  eq: <A, B>(p1: Pair<A, B>, p2: Pair<A, B>): boolean =>
    p1[0] === p2[0] && p1[1] === p2[1],
  equals: <A, B>(
    p1: Pair<A, B>,
    p2: Pair<A, B>,
    eqA: (a1: A, a2: A) => boolean,
    eqB: (b1: B, b2: B) => boolean,
  ): boolean => eqA(p1[0], p2[0]) && eqB(p1[1], p2[1]),

  traverseOption: <A, B, C>(
    p: Pair<A, Option<B>>,
    fn: (a: A, b: B) => C,
  ): Option<Pair<A, C>> =>
    p[1].$ === "Some" ? some(Pair.new(p[0], fn(p[0], p[1].value))) : none(),
  traverseResult: <A, B, C, E>(
    p: Pair<A, Result<B, E>>,
    fn: (a: A, b: B) => C,
  ): Result<Pair<A, C>, E> =>
    p[1].$ === "Done"
      ? done(Pair.new(p[0], fn(p[0], p[1].value)))
      : fail(p[1].error),

  zip: <A, B, C, D>(p1: Pair<A, B>, p2: Pair<C, D>): Pair<A & C, Pair<B, D>> =>
    pair({ ...(p1[0] as any), ...(p2[0] as any) }, pair(p1[1], p2[1])),
};

export const pair = Pair.new;
