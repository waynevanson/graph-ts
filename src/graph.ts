/**
 * @internal
 */
import {
  either as E,
  option as O,
  readonlyArray as A,
  readonlyRecord as RC,
} from "fp-ts"
import { eqString } from "fp-ts/lib/Eq"
import { Endomorphism, flow, identity, pipe } from "fp-ts/lib/function"
import { Monoid } from "fp-ts/lib/Monoid"
import { findIndex } from "fp-ts/lib/ReadonlyArray"

/**
 * @summary
 * A directed graph structure.
 * Constrained to a string for better performance.
 *
 * May simulate a unidirectional graph by point a -> b and b -> a
 * @category Model
 * @since 0.0.0
 */
export interface Graph
  extends RC.ReadonlyRecord<string, ReadonlyArray<string>> {}

/**
 * @category Model
 * @since 0.0.0
 */
export type Edge = [string, string]

export const monoid: Monoid<Graph> = RC.getMonoid(A.getMonoid<string>())
export const { empty } = monoid

export function nodeExists(v: string) {
  return (fa: Graph) => RC.hasOwnProperty(v, fa)
}

export function edgeExists(from: string, to: string): (fa: Graph) => boolean {
  return flow(RC.lookup(from), O.exists(A.elem(eqString)(to)))
}

export function addVertex(v: string): Endomorphism<Graph> {
  return flow(
    E.fromPredicate(nodeExists(v), identity),
    E.getOrElse(RC.insertAt(v, []))
  )
}

/**
 * add `to` as a neighbour of `from`, returning `None` if `from`
 * does not exist in the graph
 */
export function addEdge(
  from: string,
  to: string
): (fa: Graph) => O.Option<Graph> {
  return flow(
    O.fromPredicate(nodeExists(to)),
    O.chain(
      RC.modifyAt(from, (xs) =>
        pipe(
          xs,
          A.findFirst((a) => a === to),
          O.fold(
            () => A.snoc(xs, to),
            () => xs
          )
        )
      )
    )
  )
}

export function unidirectionalJoin(
  from: string,
  to: string
): (fa: Graph) => O.Option<Graph> {
  return flow(addEdge(from, to), O.chain(addEdge(to, from)))
}

export function removeEdge(from: string, to: string): Endomorphism<Graph> {
  return (fa) =>
    pipe(
      fa,
      RC.modifyAt(from, (xs) =>
        pipe(
          xs,
          findIndex((a) => a === to),
          O.chain((index) => A.deleteAt(index)(xs)),
          O.getOrElse(() => xs)
        )
      ),
      O.getOrElse(() => fa)
    )
}

export function unidirectionalEdgeExists(
  from: string,
  to: string
): (fa: Graph) => boolean {
  return (fa) =>
    pipe(
      fa,
      O.fromPredicate(edgeExists(from, to)),
      O.exists(edgeExists(to, from))
    )
}

export function removeVertex(vertex: string): Endomorphism<Graph> {
  return flow(RC.deleteAt(vertex), RC.map(A.filter((a) => a !== vertex)))
}
