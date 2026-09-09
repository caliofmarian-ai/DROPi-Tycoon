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
  maxActivationFocuses?: number
}

interface NormalizedAmbientSectorPolicy {
  sectorSize: number
  activeRadius: number
  maxActiveActors: number
  maxActivationFocuses: number
}

export interface AmbientSectorActivation {
  centerSectorId: string
  activeSectorIds: readonly string[]
  activeActorIds: readonly string[]
  inactiveActorIds: readonly string[]
  candidateCount: number
  simulatedActorCount: number
}

export interface AmbientSectorTransition {
  activation: AmbientSectorActivation
  retainedActorIds: readonly string[]
  activatedActorIds: readonly string[]
  deactivatedActorIds: readonly string[]
  transitionActorCount: number
}

export const DEFAULT_AMBIENT_SECTOR_POLICY: Readonly<AmbientSectorPolicy> = {
  sectorSize: 512,
  activeRadius: 1,
  maxActiveActors: 22,
  maxActivationFocuses: 3,
}

const finiteCoordinate = (value: number): number => Number.isFinite(value) ? value : 0
const boundedInteger = (value: number, fallback: number): number =>
  Number.isFinite(value) ? Math.max(0, Math.floor(value)) : fallback

const normalizePolicy = (policy: AmbientSectorPolicy): NormalizedAmbientSectorPolicy => ({
  sectorSize: Number.isFinite(policy.sectorSize) && policy.sectorSize > 0
    ? policy.sectorSize
    : DEFAULT_AMBIENT_SECTOR_POLICY.sectorSize,
  activeRadius: boundedInteger(policy.activeRadius, DEFAULT_AMBIENT_SECTOR_POLICY.activeRadius),
  maxActiveActors: boundedInteger(policy.maxActiveActors, DEFAULT_AMBIENT_SECTOR_POLICY.maxActiveActors),
  maxActivationFocuses: Math.max(1, boundedInteger(
    policy.maxActivationFocuses ?? DEFAULT_AMBIENT_SECTOR_POLICY.maxActivationFocuses ?? 3,
    DEFAULT_AMBIENT_SECTOR_POLICY.maxActivationFocuses ?? 3,
  )),
})

const sectorCoordinate = (value: number, sectorSize: number): number =>
  Math.floor(finiteCoordinate(value) / sectorSize)

const pointIsFinite = (point: AmbientSectorPoint): boolean =>
  Number.isFinite(point.x) && Number.isFinite(point.y)

const normalizeFocuses = (
  focuses: readonly AmbientSectorPoint[],
  policy: NormalizedAmbientSectorPolicy,
): readonly AmbientSectorPoint[] => {
  const accepted: AmbientSectorPoint[] = []
  for (const focus of focuses) {
    if (!pointIsFinite(focus)) continue
    accepted.push({ x: focus.x, y: focus.y })
    if (accepted.length >= policy.maxActivationFocuses) break
  }
  return accepted.length > 0 ? accepted : [{ x: 0, y: 0 }]
}

export const ambientSectorId = (
  point: AmbientSectorPoint,
  sectorSize = DEFAULT_AMBIENT_SECTOR_POLICY.sectorSize,
): string => {
  const safeSectorSize = Number.isFinite(sectorSize) && sectorSize > 0
    ? sectorSize
    : DEFAULT_AMBIENT_SECTOR_POLICY.sectorSize
  return `${sectorCoordinate(point.x, safeSectorSize)}:${sectorCoordinate(point.y, safeSectorSize)}`
}

const sectorIdsForFocus = (
  center: AmbientSectorPoint,
  policy: NormalizedAmbientSectorPolicy,
): readonly string[] => {
  const centerX = sectorCoordinate(center.x, policy.sectorSize)
  const centerY = sectorCoordinate(center.y, policy.sectorSize)
  const ids: string[] = []
  for (let y = centerY - policy.activeRadius; y <= centerY + policy.activeRadius; y += 1) {
    for (let x = centerX - policy.activeRadius; x <= centerX + policy.activeRadius; x += 1) {
      ids.push(`${x}:${y}`)
    }
  }
  return ids
}

export const resolveActiveAmbientSectorIdsForFocuses = (
  focuses: readonly AmbientSectorPoint[],
  policy: AmbientSectorPolicy = DEFAULT_AMBIENT_SECTOR_POLICY,
): readonly string[] => {
  const normalized = normalizePolicy(policy)
  const acceptedFocuses = normalizeFocuses(focuses, normalized)
  const ids = new Set<string>()
  for (const focus of acceptedFocuses) {
    for (const id of sectorIdsForFocus(focus, normalized)) ids.add(id)
  }
  return [...ids]
}

export const resolveActiveAmbientSectorIds = (
  center: AmbientSectorPoint,
  policy: AmbientSectorPolicy = DEFAULT_AMBIENT_SECTOR_POLICY,
): readonly string[] => resolveActiveAmbientSectorIdsForFocuses([center], policy)

const routeIsFinite = (route: AmbientSectorRoute): boolean =>
  Number.isFinite(route.start.x)
  && Number.isFinite(route.start.y)
  && Number.isFinite(route.end.x)
  && Number.isFinite(route.end.y)

const routeTouchesActiveWindow = (
  route: AmbientSectorRoute,
  center: AmbientSectorPoint,
  policy: NormalizedAmbientSectorPolicy,
): boolean => {
  if (!routeIsFinite(route)) return false
  const centerSectorX = sectorCoordinate(center.x, policy.sectorSize)
  const centerSectorY = sectorCoordinate(center.y, policy.sectorSize)
  const minX = (centerSectorX - policy.activeRadius) * policy.sectorSize
  const minY = (centerSectorY - policy.activeRadius) * policy.sectorSize
  const maxX = (centerSectorX + policy.activeRadius + 1) * policy.sectorSize
  const maxY = (centerSectorY + policy.activeRadius + 1) * policy.sectorSize
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

interface AmbientRouteFocusRank {
  distanceSquared: number
  focusIndex: number
}

const routeFocusRank = (
  route: AmbientSectorRoute,
  focuses: readonly AmbientSectorPoint[],
): AmbientRouteFocusRank => {
  let distanceSquared = Number.POSITIVE_INFINITY
  let focusIndex = Number.MAX_SAFE_INTEGER
  for (let index = 0; index < focuses.length; index += 1) {
    const candidateDistanceSquared = routeDistanceSquared(route, focuses[index])
    if (candidateDistanceSquared < distanceSquared) {
      distanceSquared = candidateDistanceSquared
      focusIndex = index
    }
  }
  return { distanceSquared, focusIndex }
}

/**
 * Selects the only ambient actors that may receive full-detail simulation around one or more
 * governed local focuses. A caller may provide the camera/player focus plus bounded route
 * look-ahead points, but total simulated actors never scales with city size or route length.
 */
export const resolveAmbientSectorActivationForFocuses = (
  routes: readonly AmbientSectorRoute[],
  focuses: readonly AmbientSectorPoint[],
  policy: AmbientSectorPolicy = DEFAULT_AMBIENT_SECTOR_POLICY,
): AmbientSectorActivation => {
  const normalized = normalizePolicy(policy)
  const acceptedFocuses = normalizeFocuses(focuses, normalized)
  const activeSectorIds = resolveActiveAmbientSectorIdsForFocuses(acceptedFocuses, normalized)
  const selected = routes
    .filter(route => acceptedFocuses.some(focus => routeTouchesActiveWindow(route, focus, normalized)))
    .sort((a, b) => {
      const aRank = routeFocusRank(a, acceptedFocuses)
      const bRank = routeFocusRank(b, acceptedFocuses)
      return aRank.distanceSquared - bRank.distanceSquared
        || aRank.focusIndex - bRank.focusIndex
        || a.id.localeCompare(b.id)
    })
    .slice(0, normalized.maxActiveActors)
  const activeIds = new Set(selected.map(route => route.id))
  const inactiveActorIds = routes
    .filter(route => !activeIds.has(route.id))
    .map(route => route.id)
    .sort((a, b) => a.localeCompare(b))
  const activeActorIds = selected.map(route => route.id)

  return {
    centerSectorId: ambientSectorId(acceptedFocuses[0], normalized.sectorSize),
    activeSectorIds,
    activeActorIds,
    inactiveActorIds,
    candidateCount: routes.length,
    simulatedActorCount: activeActorIds.length,
  }
}

export const resolveAmbientSectorActivation = (
  routes: readonly AmbientSectorRoute[],
  center: AmbientSectorPoint,
  policy: AmbientSectorPolicy = DEFAULT_AMBIENT_SECTOR_POLICY,
): AmbientSectorActivation => resolveAmbientSectorActivationForFocuses(routes, [center], policy)

/**
 * Read-only transition receipt for runtime object/state continuity. Stable route IDs that remain
 * active are retained rather than recreated; actors reactivated later can still sample the same
 * global deterministic clock instead of restarting their route phase.
 */
export const resolveAmbientSectorTransition = (
  routes: readonly AmbientSectorRoute[],
  previous: AmbientSectorActivation | undefined,
  focuses: readonly AmbientSectorPoint[],
  policy: AmbientSectorPolicy = DEFAULT_AMBIENT_SECTOR_POLICY,
): AmbientSectorTransition => {
  const activation = resolveAmbientSectorActivationForFocuses(routes, focuses, policy)
  const previousIds = new Set(previous?.activeActorIds ?? [])
  const currentIds = new Set(activation.activeActorIds)
  const retainedActorIds = activation.activeActorIds.filter(id => previousIds.has(id))
  const activatedActorIds = activation.activeActorIds.filter(id => !previousIds.has(id))
  const deactivatedActorIds = [...previousIds].filter(id => !currentIds.has(id)).sort((a, b) => a.localeCompare(b))

  return {
    activation,
    retainedActorIds,
    activatedActorIds,
    deactivatedActorIds,
    transitionActorCount: activatedActorIds.length + deactivatedActorIds.length,
  }
}
