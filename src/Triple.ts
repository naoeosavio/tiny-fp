import { Pair } from "./Pair";

export type Triple<A, B, C> = readonly [A, B, C];

// Standalone fns
export const fst = <A, B, C>(t: Triple<A, B, C>): A => t[0];
export const snd = <A, B, C>(t: Triple<A, B, C>): B => t[1];
export const thd = <A, B, C>(t: Triple<A, B, C>): C => t[2];
export const make = <A, B, C>(a: A, b: B, c: C): Triple<A, B, C> => [a, b, c];

export const fromArray = <A, B, C>([a, b, c]: [A, B, C]): Triple<A, B, C> => [
  a,
  b,
  c,
];
export const toArray = <A, B, C>(t: Triple<A, B, C>): [A, B, C] => [
  t[0],
  t[1],
  t[2],
];

export const fromObject = <A, B, C>(obj: {
  fst: A;
  snd: B;
  thd: C;
}): Triple<A, B, C> => [obj.fst, obj.snd, obj.thd];
export const curry =
  <A>(a: A) =>
  <B>(b: B) =>
  <C>(c: C): Triple<A, B, C> => [a, b, c];

export const equals = <A, B, C>(
  t1: Triple<A, B, C>,
  t2: Triple<A, B, C>,
  eqA: (a1: A, a2: A) => boolean,
  eqB: (b1: B, b2: B) => boolean,
  eqC: (c1: C, c2: C) => boolean,
): boolean => eqA(t1[0], t2[0]) && eqB(t1[1], t2[1]) && eqC(t1[2], t2[2]);

export const map = <A, B, C, D, E, F>(
  t: Triple<A, B, C>,
  fnA: (a: A) => D,
  fnB: (b: B) => E,
  fnC: (c: C) => F,
): Triple<D, E, F> => make(fnA(t[0]), fnB(t[1]), fnC(t[2]));

export const zip = <A, B, C, D, E, F>(
  t1: Triple<A, B, C>,
  t2: Triple<D, E, F>,
): Triple<Pair<A, D>, Pair<B, E>, Pair<C, F>> =>
  make([t1[0], t2[0]], [t1[1], t2[1]], [t1[2], t2[2]]);

export const apply = <A, B, C, D>(
  t: Triple<(a: A) => B, (b: B) => C, (c: C) => D>,
  value: A,
): Triple<B, C, D> =>
  make(t[0](value), t[1](t[0](value)), t[2](t[1](t[0](value))));

export const Triple = {
  fst,
  snd,
  thd,
  new: make,
  fromArray,
  toArray,
  fromObject,
  curry,
  equals,
  map,
  zip,
  apply,
};

export const triple = make;

// Convenience namespace alias for consumers
export const TripleNS = Triple;
