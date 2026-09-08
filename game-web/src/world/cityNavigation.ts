import type { WorldRectLayout } from './worldLayout'
import { projectOnSegment, distanceToSegment } from './worldSurfaces'

export interface RoadPoint { x: number; y: number }
export interface RoadNode extends RoadPoint { id: string }
export interface RoadEdge { from: string; to: string; distance: number; roadId: string }
export interface RoadNetwork {
  nodes: readonly RoadNode[]
  edges: readonly RoadEdge[]
}
export interface RoadRoute { distance: number; points: readonly RoadPoint[] }

const key = (point: RoadPoint): string => `${point.x},${point.y}`
const manhattan = (a: RoadPoint, b: RoadPoint): number => Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
const finite = (point: RoadPoint): boolean => Number.isFinite(point.x) && Number.isFinite(point.y)

/** Finite centerline graph: intersections and real entrances split road segments. */
export const buildRoadNetwork = (
  roads: readonly WorldRectLayout[], entrances: readonly RoadPoint[] = [],
  isNavigable: (x: number, y: number) => boolean = () => true,
): RoadNetwork => {
  if (roads.some(road => road.centerline)) return buildSourceStreetNetwork(roads, entrances, isNavigable)
  const nodes = new Map<string, RoadNode>()
  const edges: RoadEdge[] = []
  const addNode = (point: RoadPoint): string => {
    const id = key(point)
    nodes.set(id, { ...point, id })
    return id
  }
  const addEdge = (a: RoadPoint, b: RoadPoint, roadId: string): void => {
    const distance = manhattan(a, b)
    if (distance === 0) return
    const steps = Math.ceil(distance / 8)
    for (let step = 0; step <= steps; step++) {
      if (!isNavigable(a.x + (b.x - a.x) * step / steps, a.y + (b.y - a.y) * step / steps)) return
    }
    edges.push({ from: addNode(a), to: addNode(b), distance, roadId })
  }
  const segments = roads.filter(road => finite(road) && Number.isFinite(road.width) &&
    Number.isFinite(road.height) && road.width >= 20 && road.height >= 20).map(road => {
    const horizontal = road.width >= road.height
    const start = horizontal ? { x: road.x - road.width / 2, y: road.y } : { x: road.x, y: road.y - road.height / 2 }
    const end = horizontal ? { x: road.x + road.width / 2, y: road.y } : { x: road.x, y: road.y + road.height / 2 }
    if (!isNavigable(start.x, start.y)) {
      if (horizontal) start.x += 10
      else start.y += 10
    }
    if (!isNavigable(end.x, end.y)) {
      if (horizontal) end.x -= 10
      else end.y -= 10
    }
    return { road, horizontal, start, end, points: [start, end] }
  })
  for (let i = 0; i < segments.length; i++) {
    const a = segments[i]
    for (const b of segments.slice(i + 1)) {
      if (a.horizontal !== b.horizontal) {
        const horizontal = a.horizontal ? a : b
        const vertical = a.horizontal ? b : a
        const intersection = { x: vertical.start.x, y: horizontal.start.y }
        if (intersection.x >= horizontal.start.x && intersection.x <= horizontal.end.x &&
            intersection.y >= vertical.start.y && intersection.y <= vertical.end.y) {
          a.points.push(intersection)
          b.points.push(intersection)
        }
      } else {
        // Shared centerlines also connect at the ends of overlapping lanes.
        for (const point of [a.start, a.end, b.start, b.end]) {
          if (point.x >= Math.max(a.start.x, b.start.x) && point.x <= Math.min(a.end.x, b.end.x) &&
              point.y >= Math.max(a.start.y, b.start.y) && point.y <= Math.min(a.end.y, b.end.y)) {
            a.points.push(point)
            b.points.push(point)
          }
        }
      }
    }
  }
  for (const entrance of entrances) {
    if (!finite(entrance) || !isNavigable(entrance.x, entrance.y)) continue
    for (const segment of segments) {
      const { road, horizontal } = segment
      if (Math.abs(entrance.x - road.x) > road.width / 2 ||
          Math.abs(entrance.y - road.y) > road.height / 2) continue
      const projection = horizontal ? { x: entrance.x, y: road.y } : { x: road.x, y: entrance.y }
      segment.points.push(projection)
      addNode(entrance)
      addEdge(entrance, projection, road.id)
    }
  }
  for (const segment of segments) {
    const sorted = [...new Map(segment.points.map(point => [key(point), point])).values()]
      .sort((a, b) => segment.horizontal ? a.x - b.x : a.y - b.y)
    sorted.filter(point => isNavigable(point.x, point.y)).forEach(addNode)
    for (let i = 1; i < sorted.length; i++) addEdge(sorted[i - 1], sorted[i], segment.road.id)
  }
  return { nodes: [...nodes.values()], edges }
}

/** Shared source vertices form junctions. Crossing over a river/bridge is never inferred from bounding boxes. */
export const buildSourceStreetNetwork = (
  roads: readonly WorldRectLayout[], entrances: readonly RoadPoint[], isNavigable: (x: number, y: number) => boolean,
): RoadNetwork => {
  const nodes = new Map<string, RoadNode>(), edges: RoadEdge[] = []
  const rounded = (p: RoadPoint): RoadPoint => ({ x: Math.round(p.x * 1000) / 1000, y: Math.round(p.y * 1000) / 1000 })
  const node = (p: RoadPoint): string => { const id = key(p); nodes.set(id, { ...p, id }); return id }
  const edge = (a: RoadPoint, b: RoadPoint, roadId: string): void => {
    const distance = Math.hypot(b.x - a.x, b.y - a.y)
    if (distance === 0) return
    const steps = Math.ceil(distance / 12)
    for (let i = 0; i <= steps; i++) if (!isNavigable(a.x + (b.x - a.x) * i / steps, a.y + (b.y - a.y) * i / steps)) return
    edges.push({ from: node(a), to: node(b), distance, roadId })
  }
  const segments = roads.flatMap(road => (road.centerline ?? []).slice(1).map((b, i) =>
    ({ road, a: road.centerline![i], b, points: [road.centerline![i], b] })))
  for (const entrance of entrances) {
    if (!finite(entrance) || !isNavigable(entrance.x, entrance.y)) continue
    let best: typeof segments[number] | undefined, gap = Infinity
    for (const segment of segments) {
      const d = distanceToSegment(entrance, segment.a, segment.b)
      if (d < gap) { best = segment; gap = d }
    }
    if (!best || gap > (best.road.roadWidth ?? 32) / 2) continue
    const projection = rounded(projectOnSegment(entrance, best.a, best.b))
    best.points.push(projection)
    // Keep the exact entrance identity even when its projection rounds by a few centimetres.
    node(entrance)
    if (key(entrance) !== key(projection)) edge(entrance, projection, best.road.id)
  }
  for (const segment of segments) {
    const points = [...new Map(segment.points.map(p => [key(p), p])).values()]
      .sort((a, b) => Math.hypot(a.x - segment.a.x, a.y - segment.a.y) - Math.hypot(b.x - segment.a.x, b.y - segment.a.y))
    for (let i = 1; i < points.length; i++) edge(points[i - 1], points[i], segment.road.id)
  }
  return { nodes: [...nodes.values()], edges }
}

/** Returns actual connected street waypoints, never a cross-block distance shortcut. */
const networkIndexes = new WeakMap<RoadNetwork, {
  nodes: Map<string, RoadNode>
  neighbors: Map<string, { id: string; distance: number }[]>
}>()

export const findRoadRoute = (
  network: RoadNetwork, from: RoadPoint, to: RoadPoint,
): RoadRoute | null => {
  if (!finite(from) || !finite(to)) return null
  let index = networkIndexes.get(network)
  if (!index) {
    const nodes = new Map(network.nodes.map(node => [node.id, node]))
    const neighbors = new Map<string, { id: string; distance: number }[]>()
    for (const edge of network.edges) {
      if (!nodes.has(edge.from) || !nodes.has(edge.to) || !Number.isFinite(edge.distance) || edge.distance < 0) continue
      for (const [from, to] of [[edge.from, edge.to], [edge.to, edge.from]]) {
        const bucket = neighbors.get(from) ?? []
        bucket.push({ id: to, distance: edge.distance }); neighbors.set(from, bucket)
      }
    }
    index = { nodes, neighbors }; networkIndexes.set(network, index)
  }
  const { nodes, neighbors } = index
  const start = key(from)
  const finish = key(to)
  if (!nodes.has(start) || !nodes.has(finish)) return null
  const distance = new Map<string, number>([[start, 0]])
  const previous = new Map<string, string>()
  // Source street graphs have thousands of vertices. A binary heap avoids a full node scan
  // on every step, while retaining Dijkstra semantics for arbitrary nonnegative edge weights.
  const pending: { id: string; distance: number }[] = []
  const push = (entry: typeof pending[number]): void => {
    pending.push(entry)
    let i = pending.length - 1
    while (i > 0) {
      const parent = (i - 1) >> 1
      if (pending[parent].distance <= entry.distance) break
      pending[i] = pending[parent]; i = parent
    }
    pending[i] = entry
  }
  const pop = (): typeof pending[number] => {
    const first = pending[0], last = pending.pop()!
    if (pending.length) {
      let i = 0
      while (i * 2 + 1 < pending.length) {
        let child = i * 2 + 1
        if (child + 1 < pending.length && pending[child + 1].distance < pending[child].distance) child++
        if (pending[child].distance >= last.distance) break
        pending[i] = pending[child]; i = child
      }
      pending[i] = last
    }
    return first
  }
  push({ id: start, distance: 0 })
  while (pending.length > 0) {
    const { id: current, distance: best } = pop()
    if (best !== distance.get(current)) continue
    if (current === finish) {
      const points: RoadPoint[] = []
      let cursor: string | undefined = finish
      while (cursor !== undefined) {
        const node = nodes.get(cursor)!
        points.unshift({ x: node.x, y: node.y })
        cursor = previous.get(cursor)
      }
      return { distance: best, points }
    }
    for (const neighbor of neighbors.get(current) ?? []) {
      if (best + neighbor.distance < (distance.get(neighbor.id) ?? Infinity)) {
        distance.set(neighbor.id, best + neighbor.distance)
        previous.set(neighbor.id, current)
        push({ id: neighbor.id, distance: best + neighbor.distance })
      }
    }
  }
  return null
}
