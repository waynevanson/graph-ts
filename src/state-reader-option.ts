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
  fromM: fromReader,
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

export const stateReader: Profunctor3<URI> & Monad3<URI> & Category3<URI> = {
  URI,
  ...Monad,
  ...Profunctor,
  ...Category,
}

export const { id } = Category

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
} = pipeable.pipeable(stateReader)

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
  fromReader,
  fromState,
  get,
  gets,
  put,
  modify,
  compose,
}
