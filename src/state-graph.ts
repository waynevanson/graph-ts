import { eq } from "fp-ts"
import { Graph, Edge } from "./graph"
import * as SRO from "./state-reader-option"
import * as RO from "./reader-option"

export interface GraphData<E, N> {
  readonly graph: Graph
  readonly edges: Array<E>
  readonly nodes: Array<N>
}

export interface GraphTransformers<N, E> {
  edge: (edge: Edge) => (data: E) => string
  node: (node: N) => string
}

/**
 * Syncs state with the graph.
 */
export interface StateGraph<E, N, A>
  extends SRO.StateReaderOption<GraphData<E, N>, GraphTransformers<N, E>, A> {}

declare function addNode<I extends string, E, N>(
  edge: E,
  nodes: [N, N]
): StateGraph<I, E, N, void>
