import type Phaser from 'phaser'
import {
  DEFAULT_AMBIENT_SECTOR_POLICY,
  resolveAmbientSectorTransition,
  type AmbientSectorActivation,
  type AmbientSectorPoint,
} from '../simulation/ambient/sectorActivation'
import { createPlayerVisual, type PlayerVisual } from './playerVisual'
import { ensureNeighborAtlas, NEIGHBOR_ANCHOR, NEIGHBOR_CELL } from './cityArt'
import { courierAnimationFrame, getCourierPose } from './courierPose'
import { isUrbanWalkable, type UrbanFacing, type UrbanPoint } from './urbanWorld'
import { PLAYER_START, WORLD_ROADS } from './worldLayout'
import { surfaceContains } from './worldSurfaces'
import {
  CENTRAL_CONTROLLED_CROSSING,
  crossingPoint,
  CONTROLLED_CROSSINGS,
  pedestrianHasCrossingPriority,
  sampleControlledCrossingPedestrian,
  yieldHorizontalTrafficAtCrossing,
  type ControlledCrossing,
} from './cityTrafficRules'

export interface AmbientRoute {
  id: string
  kind: 'pedestrian' | 'car' | 'van'
  start: UrbanPoint
  end: UrbanPoint
  speed: number
  phase: number
  controlledCrossingId?: string
}
export interface AmbientPose extends UrbanPoint { facing: UrbanFacing; moving: boolean }
export const AMBIENT_ACTOR_LIMIT = 22
export const AMBIENT_PEDESTRIAN_SCALE = 0.72

const crossingById = (id: string | undefined) =>
  id ? CONTROLLED_CROSSINGS.find(crossing => crossing.id === id) : undefined

const clearRoute = (start: UrbanPoint, end: UrbanPoint, roadOnly: boolean): boolean => {
  const steps = Math.ceil(Math.hypot(end.x - start.x, end.y - start.y) / 12)
  for (let step = 0; step <= steps; step++) {
    const fraction = step / Math.max(1, steps)
    if (!isUrbanWalkable(start.x + (end.x - start.x) * fraction, start.y + (end.y - start.y) * fraction, roadOnly, 6)) return false
  }
  return true
}

/**
 * Ambient pedestrian routes are materialized once, then cached. Pixel-cadence validation is
 * deliberately stricter than runtime pose cadence so no interpolation point can cut a corner,
 * leave pavement, or enter a road surface outside an explicit controlled crossing.
 */
const clearPedestrianRoute = (start: UrbanPoint, end: UrbanPoint): boolean => {
  const steps = Math.max(1, Math.ceil(Math.hypot(end.x - start.x, end.y - start.y)))
  for (let step = 0; step <= steps; step++) {
    const fraction = step / steps
    const x = start.x + (end.x - start.x) * fraction
    const y = start.y + (end.y - start.y) * fraction
    if (!isUrbanWalkable(x, y, false, 6)) return false
    if (WORLD_ROADS.some(road => surfaceContains(road, x, y))) return false
  }
  return true
}

interface AmbientRoadSegment {
  sourceIndex: number
  road: (typeof WORLD_ROADS)[number]
  a: UrbanPoint
  b: UrbanPoint
  midpoint: UrbanPoint
}

const squaredDistance = (a: UrbanPoint, b: UrbanPoint): number => {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return dx * dx + dy * dy
}

/**
 * Keeps the tiny candidate population spatially representative instead of filling every slot
 * from the HQ/start neighborhood. The first seed preserves opening-area life, then farthest-point
 * sampling spreads the remaining bounded loops across the governed road surface.
 */
const spreadAmbientSegments = (
  segments: readonly AmbientRoadSegment[],
  limit: number,
): readonly AmbientRoadSegment[] => {
  if (segments.length <= 1 || limit <= 1) return segments.slice(0, Math.max(0, limit))
  const selected: AmbientRoadSegment[] = []
  const remaining = new Set(segments.map(segment => segment.sourceIndex))
  const byIndex = new Map(segments.map(segment => [segment.sourceIndex, segment] as const))

  let seed = segments[0]
  let seedDistance = squaredDistance(seed.midpoint, PLAYER_START)
  for (const segment of segments.slice(1)) {
    const distance = squaredDistance(segment.midpoint, PLAYER_START)
    if (distance < seedDistance || (distance === seedDistance && segment.sourceIndex < seed.sourceIndex)) {
      seed = segment
      seedDistance = distance
    }
  }
  selected.push(seed)
  remaining.delete(seed.sourceIndex)

  while (remaining.size > 0 && selected.length < limit) {
    let best: AmbientRoadSegment | undefined
    let bestSeparation = Number.NEGATIVE_INFINITY
    for (const sourceIndex of remaining) {
      const candidate = byIndex.get(sourceIndex)!
      const separation = selected.reduce(
        (minimum, existing) => Math.min(minimum, squaredDistance(candidate.midpoint, existing.midpoint)),
        Number.POSITIVE_INFINITY,
      )
      if (separation > bestSeparation
        || (separation === bestSeparation && (best === undefined || candidate.sourceIndex < best.sourceIndex))) {
        best = candidate
        bestSeparation = separation
      }
    }
    if (!best) break
    selected.push(best)
    remaining.delete(best.sourceIndex)
  }
  return selected
}

/** Bounded loops follow safe segments across the active city plan without a center-only bias. */
let cachedRoutes: readonly AmbientRoute[] | undefined
export const buildAmbientRoutes = (): readonly AmbientRoute[] => {
  if (cachedRoutes) return cachedRoutes
  const crossing = CENTRAL_CONTROLLED_CROSSING
  const sidewalkRoutes: AmbientRoute[] = []
  const trafficRoutes: AmbientRoute[] = [{
    id: `traffic-${crossing.id}`, kind: 'car',
    start: crossingPoint(crossing, -80, 0), end: crossingPoint(crossing, 80, 0),
    speed: 74, phase: 0, controlledCrossingId: crossing.id,
  }]
  let sourceIndex = 0
  const segments: AmbientRoadSegment[] = WORLD_ROADS.flatMap(road => (road.centerline ?? []).slice(1).map((b, i) => {
    const a = road.centerline![i]
    const segment = {
      sourceIndex: sourceIndex++,
      road,
      a,
      b,
      midpoint: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
    }
    return segment
  }))
    .filter(({ a, b }) => Math.hypot(b.x - a.x, b.y - a.y) > 90)
  const spreadSegments = spreadAmbientSegments(segments, Math.min(segments.length, 128))

  for (const { sourceIndex: segmentIndex, road, a, b } of spreadSegments) {
    const length = Math.hypot(b.x - a.x, b.y - a.y), dx = (b.x - a.x) / length, dy = (b.y - a.y) / length
    const routeLength = Math.min(260, length - 24)
    for (const side of [-1, 1]) {
      const offset = side * ((road.roadWidth ?? 32) / 2 + 6)
      const start = { x: a.x + dx * 12 - dy * offset, y: a.y + dy * 12 + dx * offset }
      const end = { x: start.x + dx * routeLength, y: start.y + dy * routeLength }
      if (sidewalkRoutes.length < AMBIENT_ACTOR_LIMIT - 5 && clearPedestrianRoute(start, end)) sidewalkRoutes.push({
        id: `neighbor-${segmentIndex}-${side}`, kind: 'pedestrian', start, end,
        speed: 24 + segmentIndex % 4 * 3, phase: segmentIndex * 2.3,
      })
    }
    if (trafficRoutes.length < 4 && Math.hypot(a.x - crossing.x, a.y - crossing.y) > 300) {
      const start = { x: a.x + dx * 12 - dy * 4, y: a.y + dy * 12 + dx * 4 }
      const end = { x: start.x + dx * routeLength, y: start.y + dy * routeLength }
      if (clearRoute(start, end, true)) trafficRoutes.push({
        id: `traffic-${segmentIndex}`, kind: trafficRoutes.length % 2 ? 'van' : 'car', start, end,
        speed: 74 + segmentIndex % 4 * 7, phase: segmentIndex * 3,
      })
    }
    if (trafficRoutes.length === 4 && sidewalkRoutes.length === AMBIENT_ACTOR_LIMIT - 5) break
  }
  const crossingRoute: AmbientRoute = {
    id: `neighbor-${crossing.id}`, kind: 'pedestrian',
    start: crossingPoint(crossing, 0, -crossing.halfLength),
    end: crossingPoint(crossing, 0, crossing.halfLength),
    speed: crossing.halfLength * 2 / 3, phase: 0, controlledCrossingId: crossing.id,
  }
  cachedRoutes = [...sidewalkRoutes, crossingRoute, ...trafficRoutes]
  return cachedRoutes
}

/** Writes into a reused pose, with bounded waits at route ends and controlled crossings. */
export const sampleAmbientRoute = (route: AmbientRoute, seconds: number, target: AmbientPose): AmbientPose => {
  const crossing = crossingById(route.controlledCrossingId)
  if (route.kind === 'pedestrian' && crossing) {
    return sampleControlledCrossingPedestrian(crossing, seconds + route.phase, target)
  }

  const dx = route.end.x - route.start.x
  const dy = route.end.y - route.start.y
  const duration = Math.hypot(dx, dy) / Math.max(1, route.speed)
  const leg = duration + 1.5
  const cycle = leg * 2
  const safeSeconds = Math.max(0, Number.isFinite(seconds) ? seconds : 0)
  const time = ((safeSeconds + route.phase) % cycle + cycle) % cycle
  const returning = time >= leg
  const progress = Math.min(1, (time % leg) / Math.max(0.001, duration))
  const fraction = returning ? 1 - progress : progress
  target.x = route.start.x + dx * fraction
  target.y = route.start.y + dy * fraction
  target.facing = Math.abs(dx) >= Math.abs(dy)
    ? (dx > 0 !== returning ? 'right' : 'left')
    : (dy > 0 !== returning ? 'down' : 'up')
  target.moving = duration > 0 && progress < 1

  if (route.kind !== 'pedestrian' && crossing) {
    yieldHorizontalTrafficAtCrossing(crossing, safeSeconds, target)
  }
  return target
}

interface AmbientActor {
  route: AmbientRoute
  pose: AmbientPose
  object: Phaser.GameObjects.Container
  vehicle?: PlayerVisual
  pedestrian?: Phaser.GameObjects.Image
  frame: number
  visible: boolean
}

interface AmbientCrossingSignal {
  crossing: ControlledCrossing
  stopLamp: Phaser.GameObjects.Arc
  goLamp: Phaser.GameObjects.Arc
}

const renderControlledCrossing = (scene: Phaser.Scene, crossing: ControlledCrossing): AmbientCrossingSignal => {
  // Zebra markings and stop lines are intentionally tiny bounded Rectangle objects rather than
  // world-sized Graphics, preserving the Android culling/performance baseline.
  for (let stripe = -5; stripe <= 5; stripe += 1) {
    const p = crossingPoint(crossing, 0, stripe * (crossing.halfLength - 6) / 5)
    scene.add.rectangle(p.x, p.y, crossing.halfWidth * 2, 3, 0xf5f3e8, 0.86).setRotation(crossing.roadAngle ?? 0)
      .setDepth(2).setName(`${crossing.id}-zebra-${stripe + 5}`)
  }
  for (const direction of [-1, 1]) {
    const p = crossingPoint(crossing, direction * crossing.approachStopOffset, 0)
    scene.add.rectangle(
      p.x, p.y,
      5,
      crossing.halfLength * 2 - 12,
      0xf5f3e8,
      0.78,
    ).setRotation(crossing.roadAngle ?? 0).setDepth(2).setName(`${crossing.id}-stop-line-${direction < 0 ? 'west' : 'east'}`)
  }

  const signalX = crossing.x - crossing.approachStopOffset - 22
  const signalY = crossing.y - crossing.halfLength - 16
  scene.add.rectangle(signalX, signalY + 10, 4, 26, 0x324552, 1)
    .setDepth(4).setName(`${crossing.id}-signal-pole`)
  const stopLamp = scene.add.circle(signalX, signalY - 5, 6, 0xd74d4d, 1)
    .setDepth(4).setName(`${crossing.id}-signal-stop`)
  const goLamp = scene.add.circle(signalX, signalY + 8, 6, 0x46b96a, 1)
    .setDepth(4).setName(`${crossing.id}-signal-go`)
  return { crossing, stopLamp, goLamp }
}

/** Ambient actors never own gameplay jobs or serialized state; city-rule behavior stays deterministic. */
export class AmbientCity {
  private elapsed = 0
  private readonly routes: readonly AmbientRoute[]
  private readonly actors: AmbientActor[]
  private readonly crossingSignals: AmbientCrossingSignal[]
  private activation?: AmbientSectorActivation
  private activationFocuses: readonly AmbientSectorPoint[] = []

  constructor(scene: Phaser.Scene) {
    this.crossingSignals = CONTROLLED_CROSSINGS.map(crossing => renderControlledCrossing(scene, crossing))
    this.routes = buildAmbientRoutes()
    this.actors = this.routes.map((route, index) => {
      const pose = sampleAmbientRoute(route, 0, { x: 0, y: 0, facing: 'right', moving: false })
      const vehicle = route.kind === 'pedestrian' ? undefined : createPlayerVisual(scene, pose.x, pose.y)
      vehicle?.setState(route.kind === 'van' ? 'DeliveryVan' : 'Car')
      vehicle?.setFacing(pose.facing)
      const frame = getCourierPose('Walking', pose.facing).atlasFrame
      const pedestrian = vehicle ? undefined : scene.add.image(0, 0, ensureNeighborAtlas(scene, index), frame)
        .setOrigin(NEIGHBOR_ANCHOR.x / NEIGHBOR_CELL, NEIGHBOR_ANCHOR.y / NEIGHBOR_CELL)
        .setScale(AMBIENT_PEDESTRIAN_SCALE)
      const object = vehicle?.container ?? scene.add.container(pose.x, pose.y, [pedestrian!])
      object.setName(route.id).setDepth(route.kind === 'pedestrian' ? 14 : 11)
      return { route, pose, object, vehicle, pedestrian, frame, visible: true }
    })
  }

  /**
   * Optional read-only corridor look-ahead supplied by an owning traversal/mission layer. These
   * points create no mission, demand or geography; they only let nearby governed sectors share the
   * same bounded ambient budget while the player travels a long route.
   */
  setActivationFocuses(focuses: readonly AmbientSectorPoint[]): void {
    const focusLimit = Math.max(0, (DEFAULT_AMBIENT_SECTOR_POLICY.maxActivationFocuses ?? 3) - 1)
    this.activationFocuses = focuses
      .filter(focus => Number.isFinite(focus.x) && Number.isFinite(focus.y))
      .slice(0, focusLimit)
      .map(focus => ({ x: focus.x, y: focus.y }))
  }

  update(delta: number, view: Phaser.Geom.Rectangle): void {
    this.elapsed += Math.max(0, Math.min(Number.isFinite(delta) ? delta : 0, 100)) / 1000
    for (const signal of this.crossingSignals) {
      const stop = pedestrianHasCrossingPriority(signal.crossing, this.elapsed)
      signal.stopLamp.setAlpha(stop ? 1 : 0.2)
      signal.goLamp.setAlpha(stop ? 0.2 : 1)
    }

    const width = Number.isFinite(view.width) ? view.width : view.right - view.x
    const height = Number.isFinite(view.height) ? view.height : view.bottom - view.y
    const center = { x: view.x + width / 2, y: view.y + height / 2 }
    const transition = resolveAmbientSectorTransition(
      this.routes,
      this.activation,
      [center, ...this.activationFocuses],
      { ...DEFAULT_AMBIENT_SECTOR_POLICY, maxActiveActors: AMBIENT_ACTOR_LIMIT },
    )
    this.activation = transition.activation
    const activeIds = new Set(transition.activation.activeActorIds)

    for (const actor of this.actors) {
      if (!activeIds.has(actor.route.id)) {
        if (actor.visible) {
          actor.object.setVisible(false)
          actor.visible = false
        }
        continue
      }
      // Reactivation samples the same global elapsed clock and stable route phase; actor motion never restarts at zero.
      const p = sampleAmbientRoute(actor.route, this.elapsed, actor.pose)
      const visible = p.x >= view.x - 100 && p.x <= view.right + 100 && p.y >= view.y - 100 && p.y <= view.bottom + 100
      if (visible !== actor.visible) {
        actor.object.setVisible(visible)
        actor.visible = visible
      }
      if (!visible) continue
      actor.object.setPosition(p.x, p.y)
      if (actor.vehicle) actor.vehicle.setFacing(p.facing)
      else {
        const frame = getCourierPose('Walking', p.facing,
          courierAnimationFrame((this.elapsed + actor.route.phase) * 1000, p.moving)).atlasFrame
        if (frame !== actor.frame) {
          actor.pedestrian!.setFrame(frame)
          actor.frame = frame
        }
      }
    }
  }
}
