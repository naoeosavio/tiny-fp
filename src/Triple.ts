export type Triple<A, B, C> = readonly [A, B, C];

export const Triple = {
  fst: <A, B, C>(t: Triple<A, B, C>): A => t[0],
  snd: <A, B, C>(t: Triple<A, B, C>): B => t[1],
  thd: <A, B, C>(t: Triple<A, B, C>): C => t[2],
  new: <A, B, C>(fst: A, snd: B, thd: C): Triple<A, B, C> => [fst, snd, thd],

  fromArray: <A, B, C>([fst, snd, thd]: [A, B, C]): Triple<A, B, C> => [
    fst,
    snd,
    thd,
  ],
  toArray: <A, B, C>(t: Triple<A, B, C>): [A, B, C] => [t[0], t[1], t[2]],

  fromObject: <A, B, C>(obj: { fst: A; snd: B; thd: C }): Triple<A, B, C> => [
    obj.fst,
    obj.snd,
    obj.thd,
  ],
  curry:
    <A>(fst: A) =>
    <B>(snd: B) =>
    <C>(thd: C): Triple<A, B, C> => [fst, snd, thd],

  equals: <A, B, C>(
    t1: Triple<A, B, C>,
    t2: Triple<A, B, C>,
    eqA: (a1: A, a2: A) => boolean,
    eqB: (b1: B, b2: B) => boolean,
    eqC: (c1: C, c2: C) => boolean,
  ): boolean => eqA(t1[0], t2[0]) && eqB(t1[1], t2[1]) && eqC(t1[2], t2[2]),

  map: <A, B, C, D, E, F>(
    t: Triple<A, B, C>,
    fnA: (a: A) => D,
    fnB: (b: B) => E,
    fnC: (c: C) => F,
  ): Triple<D, E, F> => triple(fnA(t[0]), fnB(t[1]), fnC(t[2])),
  zip: <A, B, C, D, E, F>(
    t1: Triple<A, B, C>,
    t2: Triple<D, E, F>,
  ): Triple<A & D, B & E, C & F> =>
    triple(
      { ...(t1[0] as any), ...(t2[0] as any) },
      { ...(t1[1] as any), ...(t2[1] as any) },
      { ...(t1[2] as any), ...(t2[2] as any) },
    ),
  apply: <A, B, C, D>(
    t: Triple<(a: A) => B, (b: B) => C, (c: C) => D>,
    value: A,
  ): Triple<B, C, D> =>
    triple(t[0](value), t[1](t[0](value)), t[2](t[1](t[0](value)))),
};

export const triple = Triple.new;
