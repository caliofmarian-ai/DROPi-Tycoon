export interface AmbientSectorPoint {
  x: number
  y: number
}

export interface AmbientSectorRoute {
  id: string
  start: AmbientSectorPoint
  end: AmbientSectorPoint
}

export interface AmbientSectorPolicy {
  sectorSize: number
  activeRadius: number
  maxActiveActors: number
}

export interface AmbientSectorActivation {
  centerSectorId: string
  activeSectorIds: readonly string[]
  activeActorIds: readonly string[]
  inactiveActorIds: readonly string[]
  candidateCount: number
  simulatedActorCount: number
}

export const DEFAULT_AMBIENT_SECTOR_POLICY: Readonly<AmbientSectorPolicy> = {
  sectorSize: 512,
  activeRadius: 1,
  maxActiveActors: 22,
}

const finiteCoordinate = (value: number): number => Number.isFinite(value) ? value : 0
const boundedInteger = (value: number, fallback: number): number =>
  Number.isFinite(value) ? Math.max(0, Math.floor(value)) : fallback

const normalizePolicy = (policy: AmbientSectorPolicy): AmbientSectorPolicy => ({
  sectorSize: Number.isFinite(policy.sectorSize) && policy.sectorSize > 0
    ? policy.sectorSize
    : DEFAULT_AMBIENT_SECTOR_POLICY.sectorSize,
  activeRadius: boundedInteger(policy.activeRadius, DEFAULT_AMBIENT_SECTOR_POLICY.activeRadius),
  maxActiveActors: boundedInteger(policy.maxActiveActors, DEFAULT_AMBIENT_SECTOR_POLICY.maxActiveActors),
})

const sectorCoordinate = (value: number, sectorSize: number): number =>
  Math.floor(finiteCoordinate(value) / sectorSize)

export const ambientSectorId = (
  point: AmbientSectorPoint,
  sectorSize = DEFAULT_AMBIENT_SECTOR_POLICY.sectorSize,
): string => {
  const safeSectorSize = Number.isFinite(sectorSize) && sectorSize > 0
    ? sectorSize
    : DEFAULT_AMBIENT_SECTOR_POLICY.sectorSize
  return `${sectorCoordinate(point.x, safeSectorSize)}:${sectorCoordinate(point.y, safeSectorSize)}`
}

export const resolveActiveAmbientSectorIds = (
  center: AmbientSectorPoint,
  policy: AmbientSectorPolicy = DEFAULT_AMBIENT_SECTOR_POLICY,
): readonly string[] => {
  const normalized = normalizePolicy(policy)
  const centerX = sectorCoordinate(center.x, normalized.sectorSize)
  const centerY = sectorCoordinate(center.y, normalized.sectorSize)
  const ids: string[] = []
  for (let y = centerY - normalized.activeRadius; y <= centerY + normalized.activeRadius; y += 1) {
    for (let x = centerX - normalized.activeRadius; x <= centerX + normalized.activeRadius; x += 1) {
      ids.push(`${x}:${y}`)
    }
  }
  return ids
}

const routeIsFinite = (route: AmbientSectorRoute): boolean =>
  Number.isFinite(route.start.x)
  && Number.isFinite(route.start.y)
  && Number.isFinite(route.end.x)
  && Number.isFinite(route.end.y)

const routeTouchesActiveWindow = (
  route: AmbientSectorRoute,
  center: AmbientSectorPoint,
  policy: AmbientSectorPolicy,
): boolean => {
  if (!routeIsFinite(route)) return false
  const normalized = normalizePolicy(policy)
  const centerSectorX = sectorCoordinate(center.x, normalized.sectorSize)
  const centerSectorY = sectorCoordinate(center.y, normalized.sectorSize)
  const minX = (centerSectorX - normalized.activeRadius) * normalized.sectorSize
  const minY = (centerSectorY - normalized.activeRadius) * normalized.sectorSize
  const maxX = (centerSectorX + normalized.activeRadius + 1) * normalized.sectorSize
  const maxY = (centerSectorY + normalized.activeRadius + 1) * normalized.sectorSize
  const routeMinX = Math.min(route.start.x, route.end.x)
  const routeMaxX = Math.max(route.start.x, route.end.x)
  const routeMinY = Math.min(route.start.y, route.end.y)
  const routeMaxY = Math.max(route.start.y, route.end.y)
  return routeMaxX >= minX && routeMinX < maxX && routeMaxY >= minY && routeMinY < maxY
}

const routeDistanceSquared = (route: AmbientSectorRoute, center: AmbientSectorPoint): number => {
  const midpointX = (route.start.x + route.end.x) / 2
  const midpointY = (route.start.y + route.end.y) / 2
  const dx = midpointX - finiteCoordinate(center.x)
  const dy = midpointY - finiteCoordinate(center.y)
  return dx * dx + dy * dy
}

/**
 * Selects the only ambient actors that may receive full-detail simulation for the current
 * sector window. The cap is independent of total city size, and ordering is deterministic
 * for identical route geometry and player/view position.
 */
export const resolveAmbientSectorActivation = (
  routes: readonly AmbientSectorRoute[],
  center: AmbientSectorPoint,
  policy: AmbientSectorPolicy = DEFAULT_AMBIENT_SECTOR_POLICY,
): AmbientSectorActivation => {
  const normalized = normalizePolicy(policy)
  const activeSectorIds = resolveActiveAmbientSectorIds(center, normalized)
  const selected = routes
    .filter(route => routeTouchesActiveWindow(route, center, normalized))
    .sort((a, b) => routeDistanceSquared(a, center) - routeDistanceSquared(b, center) || a.id.localeCompare(b.id))
    .slice(0, normalized.maxActiveActors)
  const activeIds = new Set(selected.map(route => route.id))
  const inactiveActorIds = routes
    .filter(route => !activeIds.has(route.id))
    .map(route => route.id)
    .sort((a, b) => a.localeCompare(b))
  const activeActorIds = selected.map(route => route.id)

  return {
    centerSectorId: ambientSectorId(center, normalized.sectorSize),
    activeSectorIds,
    activeActorIds,
    inactiveActorIds,
    candidateCount: routes.length,
    simulatedActorCount: activeActorIds.length,
  }
}
