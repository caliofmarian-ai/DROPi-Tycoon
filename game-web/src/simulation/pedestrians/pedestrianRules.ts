export type PedestrianSurface = 'sidewalk' | 'promenade' | 'crossing' | 'road'

export interface PedestrianRouteNode {
  id: string
  x: number
  y: number
  surface: PedestrianSurface
  crossingId?: string
}

export interface PedestrianRoutePlan {
  id: string
  nodes: readonly PedestrianRouteNode[]
}

export interface PedestrianRouteValidation {
  legal: boolean
  invalidNodeIds: readonly string[]
}

const finiteCoordinate = (value: number): boolean => Number.isFinite(value)

export const canPedestrianEnterRoad = (
  surface: PedestrianSurface,
  crossingId: string | undefined,
  validCrossingIds: ReadonlySet<string>,
): boolean => surface === 'crossing' && crossingId !== undefined && validCrossingIds.has(crossingId)

export const isLegalPedestrianRouteNode = (
  node: PedestrianRouteNode,
  validCrossingIds: ReadonlySet<string>,
): boolean => {
  if (!finiteCoordinate(node.x) || !finiteCoordinate(node.y)) return false
  if (node.surface === 'road') return false
  if (node.surface === 'crossing') {
    return canPedestrianEnterRoad(node.surface, node.crossingId, validCrossingIds)
  }
  return node.crossingId === undefined
}

export const validatePedestrianRoute = (
  route: PedestrianRoutePlan,
  validCrossingIds: ReadonlySet<string>,
): PedestrianRouteValidation => {
  if (route.nodes.length < 2) return { legal: false, invalidNodeIds: route.nodes.map(node => node.id) }
  const invalidNodeIds = route.nodes
    .filter(node => !isLegalPedestrianRouteNode(node, validCrossingIds))
    .map(node => node.id)
  return { legal: invalidNodeIds.length === 0, invalidNodeIds }
}
