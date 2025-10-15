# lite-fp

Tiny, zero‑dependency FP helpers for TypeScript.

- Algebraic data types: `Option`, `Either`, `Result`
- Product types: `Pair`, `Triple`
- Small, predictable API with discriminated unions
- ESM and CJS builds, first‑class TypeScript types

## Install

```sh
npm i lite-fp
# or
pnpm add lite-fp
```

## Import

```ts
// ESM
import {
  Option,
  Either,
  Result,
  Pair,
  Triple,
  some,
  none,
  right,
  left,
} from "lite-fp";

// CJS
const {
  Option,
  Either,
  Result,
  Pair,
  Triple,
  some,
  none,
  right,
  left,
} = require("lite-fp");
```

## Quick Start

### Option

```ts
import { Option, some, none } from "lite-fp";

const o1 = Option.fromNullable("hello"); // Some("hello")
const o2 = Option.fromNullable(null); // None

const upper = Option.map(o1, s => s.toUpperCase()); // Some("HELLO")

const value = Option.getOrElse(o2, "fallback"); // "fallback"

// Convert
import { done, fail } from "lite-fp";
const asResult = Option.toResult(o1, new Error("missing")); // Done("hello")
```

### Either (A | B)

```ts
import { Either, left, right } from "lite-fp";

type Err = { message: string };

const parseJson = (s: string) =>
  Either.fromThrowable(
    () => JSON.parse(s),
    e => ({ message: String(e) }) as Err,
  );

const e1 = parseJson('{"a":1}'); // Right({ a: 1 })
const e2 = parseJson("invalid"); // Left({ message: "..." })

const msg = Either.fold(
  e2,
  l => `err: ${l.message}`,
  r => `ok: ${Object.keys(r).length}`,
); // => "err: ..."
```

Promise helper

```ts
// Adds Promise.prototype.toEither(onError)
const user = await fetch("/api/user")
  .then(r => r.json())
  .toEither(e => new Error(String(e))); // Either<Error, User>
```

### Result (Done | Fail)

```ts
import { Result } from "lite-fp";

const r1 = Result.fromNullable("data", "nope"); // Done("data")
const r2 = await Result.fromPromise(
  Promise.reject("x"),
  e => new Error(String(e)),
);

const safe = Result.recover(r2, () => "default"); // Done("default")
```

### Pair / Triple

```ts
import { Pair, Triple, pair, triple } from "lite-fp";

const p = pair(1, "a"); // Pair<number, string>
const p2 = Pair.map(
  p,
  x => x + 1,
  s => s.toUpperCase(),
); // [2, "A"]

const t = triple(1, 2, 3);
const t2 = Triple.map(
  t,
  x => x + 1,
  y => y * 2,
  z => z - 1,
); // [2, 4, 2]
```

## API Overview

- Option
  - Constructors: `none`, `some`, `new`, `fromNullable`, `fromPredicate`, `fromThrowable`, `fromPromise`
  - Type guards: `isSome`, `isNone`
  - Ops: `map`, `flatMap`, `filter`, `match`
  - Extract: `getOrElse`, `getOrUndefined`, `getOrThrow`
  - Combine: `zip`, `apply`, `orElse`
  - Convert: `toResult`

- Either
  - Constructors: `left`, `right`, `new`, `fromNullable`, `fromThrowable`, `fromPromise`
  - Type guards: `isLeft`, `isRight`
  - Ops: `map`, `mapLeft`, `bimap`, `flatMap`, `chain`, `fold`, `match`, `getOrElse`, `zip`, `apply`, `tap`, `tapLeft`

- Result
  - Constructors: `done`, `fail`, `new`, `fromNullable`, `fromThrowable`, `fromPromise`
  - Type guards: `isDone`, `isFail`
  - Ops: `map`, `mapError`, `flatMap`, `match`, `recover`, `getOrElse`, `getOrThrow`, `zip`, `apply`
  - Convert: `toOption`

- Pair / Triple
  - `pair`, `triple`, and utilities to map, zip, convert to/from arrays/objects.

See `src/` for the full, well‑typed surface.

## Notes

- Prototype additions
  - `Promise.prototype.toEither(onError)` is provided when `Either` is imported.
  - `Promise.prototype.toResult(onError)` is provided when `Result` is imported.
  - `Array.prototype.firstOption()` is provided when `Option` is imported.
- No runtime dependencies. Fully typed. Tree‑shakeable.

## License

MIT
