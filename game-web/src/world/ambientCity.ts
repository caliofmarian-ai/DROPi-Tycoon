import type Phaser from 'phaser'
import { createPlayerVisual, type PlayerVisual } from './playerVisual'
import { ensureNeighborAtlas, NEIGHBOR_ANCHOR, NEIGHBOR_CELL } from './cityArt'
import { courierAnimationFrame, getCourierPose } from './courierPose'
import { isUrbanWalkable, type UrbanFacing, type UrbanPoint } from './urbanWorld'
import { WORLD_ROADS } from './worldLayout'
import {
  CENTRAL_CONTROLLED_CROSSING,
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

/** Small authored loops, validated once against the real collision surfaces. */
export const buildAmbientRoutes = (): readonly AmbientRoute[] => {
  const sidewalkRoutes: AmbientRoute[] = []
  for (const [index, id] of ['central-vertical', 'garden-avenue'].entries()) {
    const road = WORLD_ROADS.find(candidate => candidate.id === id)
    if (!road) continue
    for (let side = 0; side < 2; side++) {
      const x = road.x + (side ? 1 : -1) * (road.width / 2 + 12)
      const start = { x, y: road.y - road.height / 2 + 100 }
      const end = { x, y: start.y + 240 }
      if (clearRoute(start, end, false)) sidewalkRoutes.push({
        id: `neighbor-${id}-${side}`, kind: 'pedestrian', start, end,
        speed: 25 + index * 3, phase: index * 5 + side * 3,
      })
    }
  }
  const laneIds = [
    'residential-lane', 'business-lane', 'storage-lane', 'company-lane',
    'canal-lane', 'quay-lane', 'foundry-lane', 'garden-lane', 'orchard-lane',
  ]
  laneIds.forEach((id, index) => {
    const road = WORLD_ROADS.find(candidate => candidate.id === id)
    if (!road) return
    for (let side = 0; side < 2; side++) {
      if (index < 4 && side === 1) continue
      const x = road.x - road.width / 2 + 120 + side * Math.min(320, road.width / 3)
      const y = road.y + (side ? 1 : -1) * (road.height / 2 + 3)
      const start = { x, y }
      const end = { x: x + 180, y }
      if (clearRoute(start, end, false)) sidewalkRoutes.push({
        id: `neighbor-${id}-${side}`, kind: 'pedestrian', start, end,
        speed: 24 + index % 4 * 3, phase: index * 2.3 + side * 4.7,
      })
    }
  })

  // One authored legal road crossing demonstrates real pedestrian/traffic priority without
  // turning every ambient actor into a pathfinding agent. Its slot is reserved so decorative
  // sidewalk density can never push the actual crossing behavior out of the mobile actor budget.
  const crossing = CENTRAL_CONTROLLED_CROSSING
  const crossingRoute: AmbientRoute = {
    id: `neighbor-${crossing.id}`,
    kind: 'pedestrian',
    start: { x: crossing.x, y: crossing.y - crossing.halfLength },
    end: { x: crossing.x, y: crossing.y + crossing.halfLength },
    speed: (crossing.halfLength * 2) / 3,
    phase: 0,
    controlledCrossingId: crossing.id,
  }

  // Preserve every authored traffic route. New pedestrian life may use the remaining mobile budget,
  // but it must never silently remove traffic variety from the city.
  const trafficRoutes: AmbientRoute[] = []
  for (const [index, id] of ['central-horizontal', 'business-lane', 'market-boulevard', 'garden-boulevard'].entries()) {
    const road = WORLD_ROADS.find(candidate => candidate.id === id)
    if (!road) continue
    const start = { x: road.x - road.width / 2 + 90, y: road.y + road.height * 0.22 }
    const end = { x: road.x + road.width / 2 - 90, y: start.y }
    if (clearRoute(start, end, true)) trafficRoutes.push({
      id: `traffic-${id}`, kind: index % 2 ? 'van' : 'car', start, end,
      speed: 74 + index * 7, phase: index * 13,
      controlledCrossingId: id === 'central-horizontal' ? crossing.id : undefined,
    })
  }
  const pedestrianBudget = Math.max(0, AMBIENT_ACTOR_LIMIT - trafficRoutes.length)
  const sidewalkBudget = Math.max(0, pedestrianBudget - 1)
  const boundedPedestrians = pedestrianBudget > 0
    ? [...sidewalkRoutes.slice(0, sidewalkBudget), crossingRoute]
    : []
  return [...boundedPedestrians, ...trafficRoutes]
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
    scene.add.rectangle(crossing.x, crossing.y + stripe * 14, crossing.halfWidth * 2, 6, 0xf5f3e8, 0.86)
      .setDepth(2).setName(`${crossing.id}-zebra-${stripe + 5}`)
  }
  for (const direction of [-1, 1]) {
    scene.add.rectangle(
      crossing.x + direction * crossing.approachStopOffset,
      crossing.y,
      5,
      92,
      0xf5f3e8,
      0.78,
    ).setDepth(2).setName(`${crossing.id}-stop-line-${direction < 0 ? 'west' : 'east'}`)
  }

  const signalX = crossing.x - crossing.approachStopOffset - 22
  const signalY = crossing.y - 72
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
  private readonly actors: AmbientActor[]
  private readonly crossingSignals: AmbientCrossingSignal[]

  constructor(scene: Phaser.Scene) {
    this.crossingSignals = CONTROLLED_CROSSINGS.map(crossing => renderControlledCrossing(scene, crossing))
    this.actors = buildAmbientRoutes().map((route, index) => {
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

  update(delta: number, view: Phaser.Geom.Rectangle): void {
    this.elapsed += Math.max(0, Math.min(Number.isFinite(delta) ? delta : 0, 100)) / 1000
    for (const signal of this.crossingSignals) {
      const stop = pedestrianHasCrossingPriority(signal.crossing, this.elapsed)
      signal.stopLamp.setAlpha(stop ? 1 : 0.2)
      signal.goLamp.setAlpha(stop ? 0.2 : 1)
    }
    for (const actor of this.actors) {
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
