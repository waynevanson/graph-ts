import { pipeable, reader as R, stateT, option as O, category } from "fp-ts"
import { Applicative3 } from "fp-ts/lib/Applicative"
import { Category3 } from "fp-ts/lib/Category"
import { flow, pipe } from "fp-ts/lib/function"
import { Monad3 } from "fp-ts/lib/Monad"
import { Profunctor3 } from "fp-ts/lib/Profunctor"
import * as RO from "./reader-option"

export const URI = "StateReaderOption"
export type URI = typeof URI

declare module "fp-ts/HKT" {
  export interface URItoKind3<R, E, A> {
    readonly [URI]: StateReaderOption<R, E, A>
  }
}

export interface StateReaderOption<S, R, A> {
  (s: S): RO.ReaderOption<R, [A, S]>
}

const {
  evalState: evaluate,
  execState: execute,
  fromM: fromReaderOption,
  fromState,
  get,
  gets,
  put,
  modify,
  ..._M
} = stateT.getStateM(RO.Monad)

export const Category: Category3<URI> = {
  URI,
  id: () => (s) => (r) => O.some([r, s]),
  compose: (bc, ab) => (r) =>
    flow(
      ab(r),
      O.chain(([b, _r]) => bc(_r)(b))
    ),
}

export const Applicative: Applicative3<URI> = {
  URI,
  ap: _M.ap,
  map: _M.map,
  of: _M.of,
}

export const Monad: Monad3<URI> = {
  ...Applicative,
  chain: _M.chain,
}

export const Profunctor: Profunctor3<URI> = {
  URI,
  map: _M.map,
  promap: (fea, f, g) => (s) => (r) =>
    pipe(
      fea(s)(f(r)),
      O.map(([a, _s]) => [g(a), _s])
    ),
}

export const stateReaderOption: Profunctor3<URI> &
  Monad3<URI> &
  Category3<URI> = {
  URI,
  ...Monad,
  ...Profunctor,
  ...Category,
}

export const bindTo = <K extends string>(name: K) => <R, E, A>(
  fa: StateReaderOption<R, E, A>
) =>
  pipe(
    fa,
    map((a) => ({ [name]: a } as { [P in K]: A }))
  )

export const bind = <K extends string, R, E, A, B>(
  name: Exclude<K, keyof A>,
  f: (a: A) => StateReaderOption<R, E, B>
) => (fa: StateReaderOption<R, E, A>) =>
  pipe(
    fa,
    chain((a) =>
      pipe(
        f(a),
        map(
          (b) =>
            (Object.assign({}, a, { [name]: b }) as unknown) as {
              [P in K | keyof A]: P extends keyof A ? A[P] : B
            }
        )
      )
    )
  )

export const { id, of } = stateReaderOption

const {
  ap,
  apFirst,
  apSecond,
  chain,
  chainFirst,
  flatten,
  map,
  promap,
  compose,
} = pipeable.pipeable(stateReaderOption)

export {
  ap,
  apFirst,
  apSecond,
  chain,
  chainFirst,
  flatten,
  map,
  promap,
  // from M
  evaluate,
  execute,
  fromReaderOption,
  fromState,
  get,
  gets,
  put,
  modify,
  compose,
}
