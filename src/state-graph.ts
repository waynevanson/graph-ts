import { eq as EQ, readonlyArray as A } from "fp-ts"
import { flow, pipe } from "fp-ts/lib/function"
import { lens } from "monocle-ts"
import * as GR from "./graph"
import * as RO from "./reader-option"
import * as SRO from "./state-reader-option"

const lensId = <E, N>() => lens.id<GraphData<E, N>>()

export interface GraphData<E, N> {
  readonly graph: GR.Graph
  readonly edges: ReadonlyArray<E>
  readonly nodes: ReadonlyArray<N>
}

export interface GraphResolvers<N, E> {
  readonly fromEdger: (edge: GR.Edge) => string
  readonly fromEdge: (data: E) => string
  readonly fromNode: (data: N) => string
}

/**
 * Syncs state with the graph.
 */
export interface StateGraph<E, N, A>
  extends SRO.StateReaderOption<GraphData<E, N>, GraphResolvers<N, E>, A> {}

export const get = <E, N>(): StateGraph<E, N, GraphData<E, N>> => SRO.get()

export const gets = <E, N, B>(
  f: (s: GraphData<E, N>) => B
): StateGraph<E, N, B> => SRO.gets(f)

export const ask = <N, E>() =>
  SRO.fromReaderOption(RO.ask<GraphResolvers<N, E>>())

export const asks = <N, E, A>(f: (r: GraphResolvers<N, E>) => A) =>
  SRO.fromReaderOption(RO.asks(f))

export function addNode<E, N>(node: N): StateGraph<E, N, void> {
  return pipe(
    asks((a) => a.fromNode),
    SRO.chainFirst((nodef) =>
      SRO.modify(
        pipe(
          lensId<E, N>(),
          lens.prop("graph"),
          lens.modify(GR.addVertex(nodef(node)))
        )
      )
    ),
    SRO.chain((nodef) =>
      SRO.modify(
        pipe(
          lensId<E, N>(),
          lens.prop("nodes"),
          lens.modify(
            flow(
              A.cons(node),
              A.uniq(EQ.contramap((a: N) => nodef(a))(EQ.eqString))
            )
          )
        )
      )
    )
  )
}

export function removeNode<E, N>(id: string): StateGraph<E, N, void> {
  return pipe(
    asks((a) => a.fromNode),
    SRO.chainFirst(() =>
      SRO.modify(
        pipe(
          lensId<E, N>(),
          lens.prop("graph"),
          lens.modify(GR.removeVertex(id))
        )
      )
    ),
    SRO.chain((f) =>
      SRO.modify(
        pipe(
          lensId<E, N>(),
          lens.prop("nodes"),
          lens.modify(A.filter((a) => f(a) === id))
        )
      )
    )
  )
}
