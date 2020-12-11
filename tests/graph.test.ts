import { option as O } from "fp-ts"
import { pipe } from "fp-ts/lib/function"
import * as G from "../src/graph"

describe("graph", () => {
  describe(G.addVertex, () => {
    test("leaves vertex in place if it already exists", () => {
      const fa: G.Graph = { "1": [] }
      const result = pipe(fa, G.addVertex("1"))
      expect(result).toMatchObject(fa)
    })

    test("adds a vertex if it does not exist", () => {
      const fa = G.empty
      const result = pipe(fa, G.addVertex("1"))
      expect(result).toMatchObject({ "1": [] })
    })
  })

  describe(G.edgeExists, () => {
    test("returns false when vertex exists but edge does not", () => {
      const fa = { "1": [] }
      const result = pipe(fa, G.edgeExists("1", "2"))
      expect(result).toBe(false)
    })

    test("returns false when vertex does not exist", () => {
      const fa = {}
      const result = pipe(fa, G.edgeExists("1", "2"))
      expect(result).toBe(false)
    })

    test("returns true when vertex and edge exist", () => {
      const fa = { "1": ["2"] }
      const result = pipe(fa, G.edgeExists("1", "2"))
      expect(result).toBe(true)
    })
  })

  describe(G.nodeExists, () => {
    test("returns false when node does not exist", () => {
      const one = "1"
      const fa = {}
      const result = pipe(fa, G.nodeExists(one))
      expect(result).toBe(false)
    })

    test("returns false when node does not exist", () => {
      const one = "1"
      const fa = { [one]: [] }
      const result = pipe(fa, G.nodeExists(one))
      expect(result).toBe(true)
    })
  })

  describe(G.addEdge, () => {
    // note, ensure that both vertices exist before actually setting it up.
    test("returns None when 'from' does not exist", () => {
      const from = "1"
      const to = "2"
      const fa = { [to]: [] }
      const result = pipe(fa, G.addEdge(from, to))
      expect(result).toMatchObject(O.none)
    })

    test("returns None when 'to' does not exist", () => {
      const from = "1"
      const to = "2"
      const fa = { [from]: [] }
      const result = pipe(fa, G.addEdge(from, to))
      expect(result).toMatchObject(O.none)
    })

    test("returns None when both verticies do not exist", () => {
      const from = "1"
      const to = "2"
      const fa = {}
      const result = pipe(fa, G.addEdge(from, to))
      expect(result).toMatchObject(O.none)
    })

    test("returns Some when both verticies exist and edges do not exist", () => {
      const from = "1"
      const to = "2"
      const fa = { [from]: [], [to]: [] }
      const result = pipe(fa, G.addEdge(from, to))
      expect(result).toMatchObject(O.some({ [from]: [to], [to]: [] }))
    })

    test("returns Some when both verticies exist and edges exist", () => {
      const from = "1"
      const to = "2"
      const fa = { [from]: [to], [to]: [] }

      const result = pipe(fa, G.addEdge(from, to))
      expect(result).toMatchObject(O.some(fa))
    })
  })

  describe(G.unidirectionalJoin, () => {
    // join both edges, returning None when the nodes do not exist
    test("returns Some when nodes exist and edges don't", () => {
      const from = "1"
      const to = "2"
      const fa = { [from]: [], [to]: [] }

      const result = pipe(fa, G.unidirectionalJoin(from, to))
      expect(result).toMatchObject(O.some({ [from]: [to], [to]: [from] }))
    })

    test("returns Some when nodes exist and edges do", () => {
      const from = "1"
      const to = "2"
      const fa = { [from]: [to], [to]: [from] }

      const result = pipe(fa, G.unidirectionalJoin(from, to))
      expect(result).toMatchObject(O.some(fa))
    })
  })

  describe(G.unidirectionalEdgeExists, () => {
    describe("returns false", () => {
      test("vertices do not exist", () => {
        const one = "1"
        const two = "2"
        const result = pipe({}, G.unidirectionalEdgeExists(one, two))
        expect(result).toBe(false)
      })

      test("vertex one exists but vertex two does not", () => {
        const one = "1"
        const two = "2"
        const fa = {
          [one]: [],
        }
        const result = pipe(fa, G.unidirectionalEdgeExists(one, two))
        expect(result).toBe(false)
      })

      test("vertex two exists but vertex one does not", () => {
        const one = "1"
        const two = "2"
        const fa = {
          [two]: [],
        }
        const result = pipe(fa, G.unidirectionalEdgeExists(one, two))
        expect(result).toBe(false)
      })

      test("both vertices exist and both have no edges", () => {
        const one = "1"
        const two = "2"
        const fa = {
          [one]: [],
          [two]: [],
        }
        const result = pipe(fa, G.unidirectionalEdgeExists(one, two))
        expect(result).toBe(false)
      })

      test("both vertices exist and only vertex one contains an edge", () => {
        const one = "1"
        const two = "2"
        const fa = {
          [one]: [two],
          [two]: [],
        }
        const result = pipe(fa, G.unidirectionalEdgeExists(one, two))
        expect(result).toBe(false)
      })

      test("both vertices exist and only vertex two contains an edge", () => {
        const one = "1"
        const two = "2"
        const fa = {
          [one]: [],
          [two]: [one],
        }
        const result = pipe(fa, G.unidirectionalEdgeExists(one, two))
        expect(result).toBe(false)
      })
    })

    describe("returns true", () => {
      test("both vertices exist and both have edges", () => {
        const one = "1"
        const two = "2"
        const fa = {
          [one]: [two],
          [two]: [one],
        }
        const result = pipe(fa, G.unidirectionalEdgeExists(one, two))
        expect(result).toBe(true)
      })
    })
  })

  describe(G.removeEdge, () => {
    test("leaves graph in place when vertex does not exist", () => {
      const one = "1"
      const two = "2"
      const fa = {}
      const result = pipe(fa, G.removeEdge(one, two))
      expect(result).toMatchObject(fa)
    })

    test("removes edge when vertex and edge exist", () => {
      const one = "1"
      const two = "2"
      const fa = { [one]: [two] }
      const result = pipe(fa, G.removeEdge(one, two))
      expect(result).toMatchObject({ [one]: [] })
    })

    test("leaves graph in place when vertext exists but the edge does not", () => {
      const one = "1"
      const two = "2"
      const fa = { [one]: [] }
      const result = pipe(fa, G.removeEdge(one, two))
      expect(result).toMatchObject(fa)
    })
  })

  describe(G.removeVertex, () => {
    test("removes a vertex when it exists", () => {
      const one = "1"
      const two = "2"
      const three = "3"
      const fa = { [one]: [], [two]: [three] }
      const result = pipe(fa, G.removeVertex(one))
      expect(result).toMatchObject({ [two]: [three] })
    })

    test("leaves graph in place when a vertex does not exist", () => {
      const one = "1"
      const two = "2"
      const three = "3"
      const fa = { [two]: [three] }
      const result = pipe(fa, G.removeVertex(one))
      expect(result).toMatchObject(fa)
    })

    test("removes edges when vertex does not exist", () => {
      const one = "1"
      const two = "2"
      const three = "3"
      const fa = { [two]: [one, three] }
      const result = pipe(fa, G.removeVertex(one))
      expect(result).toMatchObject({ [two]: [three] })
    })

    test("removes edges and vertex when vertex exists", () => {
      const one = "1"
      const two = "2"
      const three = "3"
      const fa = { [one]: [], [two]: [one, three] }
      const result = pipe(fa, G.removeVertex(one))
      expect(result).toMatchObject({ [two]: [three] })
    })
  })
})
