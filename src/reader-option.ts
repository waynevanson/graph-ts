import { option as O, reader, readerT } from "fp-ts"
import { Applicative2 } from "fp-ts/lib/Applicative"
import { Category2 } from "fp-ts/lib/Category"
import { flow } from "fp-ts/lib/function"
import { Functor2 } from "fp-ts/lib/Functor"
import { Monad2 } from "fp-ts/lib/Monad"
import { pipeable } from "fp-ts/lib/pipeable"
import { Profunctor2 } from "fp-ts/lib/Profunctor"

const M = readerT.getReaderM(O.Monad)

export const URI = "ReaderOption"
export type URI = typeof URI

export interface ReaderOption<R, A> {
  (r: R): O.Option<A>
}

declare module "fp-ts/HKT" {
  export interface URItoKind2<E, A> {
    readonly [URI]: ReaderOption<E, A>
  }
}

const { fromM: fromOption, ask, asks, local, fromReader, ..._M } = M

export const Functor: Functor2<URI> = {
  URI,
  map: _M.map,
}
export const Applicative: Applicative2<URI> = {
  ...Functor,
  ap: _M.ap,
  of: _M.of,
}

export const Monad: Monad2<URI> = {
  ...Applicative,
  chain: _M.chain,
}

export const Category: Category2<URI> = {
  URI,
  id: () => O.some,
  compose: (bc, ab) => flow(ab, O.chain(bc)),
}

export const Profunctor: Profunctor2<URI> = {
  ...Functor,
  promap: (fea, f, g) => reader.Profunctor.promap(fea, f, O.map(g)),
}

export const readerOption: Monad2<URI> & Profunctor2<URI> & Category2<URI> = {
  ...Monad,
  ...Profunctor,
  ...Category,
}

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
} = pipeable(readerOption)

export {
  ap,
  apFirst,
  apSecond,
  chain,
  chainFirst,
  flatten,
  map,
  fromOption,
  ask,
  asks,
  local,
  fromReader,
  promap,
  compose,
}
