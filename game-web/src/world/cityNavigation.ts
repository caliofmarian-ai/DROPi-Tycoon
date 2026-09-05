import type { WorldRectLayout } from './worldLayout'

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

/** Returns actual connected street waypoints, never a cross-block distance shortcut. */
export const findRoadRoute = (
  network: RoadNetwork, from: RoadPoint, to: RoadPoint,
): RoadRoute | null => {
  if (!finite(from) || !finite(to)) return null
  const nodes = new Map(network.nodes.map(node => [node.id, node]))
  const start = key(from)
  const finish = key(to)
  if (!nodes.has(start) || !nodes.has(finish)) return null
  const neighbors = new Map<string, { id: string; distance: number }[]>()
  for (const edge of network.edges) {
    if (!nodes.has(edge.from) || !nodes.has(edge.to) || !Number.isFinite(edge.distance) || edge.distance < 0) continue
    neighbors.set(edge.from, [...neighbors.get(edge.from) ?? [], { id: edge.to, distance: edge.distance }])
    neighbors.set(edge.to, [...neighbors.get(edge.to) ?? [], { id: edge.from, distance: edge.distance }])
  }
  const distance = new Map<string, number>([[start, 0]])
  const previous = new Map<string, string>()
  const pending = new Set(nodes.keys())
  while (pending.size > 0) {
    let current: string | undefined
    let best = Infinity
    for (const id of pending) {
      const candidate = distance.get(id) ?? Infinity
      if (candidate < best) { best = candidate; current = id }
    }
    if (current === undefined) return null
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
    pending.delete(current)
    for (const neighbor of neighbors.get(current) ?? []) {
      if (pending.has(neighbor.id) && best + neighbor.distance < (distance.get(neighbor.id) ?? Infinity)) {
        distance.set(neighbor.id, best + neighbor.distance)
        previous.set(neighbor.id, current)
      }
    }
  }
  return null
}
