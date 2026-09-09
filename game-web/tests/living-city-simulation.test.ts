import { describe, expect, it } from 'vitest'
import {
  DEFAULT_CROSSING_CONTROL_PLAN,
  resolveCrossingControlState,
} from '../src/simulation/crossings/crossingControl'
import {
  canPedestrianEnterRoad,
  validatePedestrianRoute,
  type PedestrianRoutePlan,
} from '../src/simulation/pedestrians/pedestrianRules'
import {
  HIGH_FOOTFALL_POLICIES,
  resolveLivingCityActorBudget,
  type HighFootfallKind,
} from '../src/simulation/pedestrians/footfall'
import { resolveVehicleCrossingDecision } from '../src/simulation/traffic/trafficRules'
import {
  AMBIENT_ACTOR_LIMIT,
  buildAmbientRoutes,
  sampleAmbientRoute,
  type AmbientPose,
} from '../src/world/ambientCity'
import {
  CENTRAL_CONTROLLED_CROSSING,
  CONTROLLED_CROSSINGS,
  sampleControlledCrossingPedestrian,
} from '../src/world/cityTrafficRules'
import { WORLD_ROADS } from '../src/world/worldLayout'
import { surfaceContains } from '../src/world/worldSurfaces'

const roadContains = (x: number, y: number): boolean => WORLD_ROADS.some(road => surfaceContains(road, x, y))

describe('living-city simulation authority', () => {
  it('keeps ordinary ambient pedestrians out of road lanes', () => {
    const ordinaryPedestrians = buildAmbientRoutes().filter(route =>
      route.kind === 'pedestrian' && route.controlledCrossingId === undefined)
    expect(ordinaryPedestrians.length).toBeGreaterThan(0)

    for (const route of ordinaryPedestrians) {
      for (let seconds = 0; seconds <= 60; seconds += 0.5) {
        const pose = sampleAmbientRoute(route, seconds, { x: 0, y: 0, facing: 'down', moving: false })
        expect(Number.isFinite(pose.x), route.id).toBe(true)
        expect(Number.isFinite(pose.y), route.id).toBe(true)
        expect(roadContains(pose.x, pose.y), route.id).toBe(false)
      }
    }
  })

  it('requires an explicit known crossing node before pedestrian road entry is legal', () => {
    const validCrossings = new Set(CONTROLLED_CROSSINGS.map(crossing => crossing.id))
    expect(canPedestrianEnterRoad('road', undefined, validCrossings)).toBe(false)
    expect(canPedestrianEnterRoad('crossing', 'missing-crossing', validCrossings)).toBe(false)
    expect(canPedestrianEnterRoad('crossing', CENTRAL_CONTROLLED_CROSSING.id, validCrossings)).toBe(true)

    const illegal: PedestrianRoutePlan = {
      id: 'illegal-road-shortcut',
      nodes: [
        { id: 'sidewalk-a', x: 10, y: 10, surface: 'sidewalk' },
        { id: 'road-shortcut', x: 20, y: 10, surface: 'road' },
        { id: 'sidewalk-b', x: 30, y: 10, surface: 'sidewalk' },
      ],
    }
    expect(validatePedestrianRoute(illegal, validCrossings)).toEqual({
      legal: false,
      invalidNodeIds: ['road-shortcut'],
    })

    const legal: PedestrianRoutePlan = {
      id: 'legal-crossing',
      nodes: [
        { id: 'north-curb', x: 10, y: 10, surface: 'sidewalk' },
        { id: 'zebra', x: 20, y: 10, surface: 'crossing', crossingId: CENTRAL_CONTROLLED_CROSSING.id },
        { id: 'south-curb', x: 30, y: 10, surface: 'sidewalk' },
      ],
    }
    expect(validatePedestrianRoute(legal, validCrossings)).toEqual({ legal: true, invalidNodeIds: [] })
  })

  it('stops vehicles whenever a pedestrian is occupying a controlled crossing', () => {
    const control = resolveCrossingControlState(DEFAULT_CROSSING_CONTROL_PLAN, {
      seconds: 5,
      pedestrianRequested: false,
      pedestrianPresent: true,
    })
    expect(control.signal).toBe('all-stop')
    expect(control.vehicleMayProceed).toBe(false)

    expect(resolveVehicleCrossingDecision({
      crossingState: control,
      footfallKind: 'station-terminal',
      alreadyClearedCrossing: false,
    })).toMatchObject({ action: 'yield', speedFactor: 0, reason: 'crossing-priority' })
  })

  it('uses deterministic signal transitions and supports a future traffic-officer override', () => {
    const samples = [0.5, 0.8, 1.2, 4.1, 5, 6.8, 8, 10.1, 11].map(seconds =>
      resolveCrossingControlState(DEFAULT_CROSSING_CONTROL_PLAN, {
        seconds,
        pedestrianRequested: true,
        pedestrianPresent: false,
      }).signal)
    expect(samples).toEqual([
      'vehicle-go', 'all-stop', 'pedestrian-go', 'all-stop', 'vehicle-go',
      'all-stop', 'pedestrian-go', 'all-stop', 'vehicle-go',
    ])

    const officer = resolveCrossingControlState(DEFAULT_CROSSING_CONTROL_PLAN, {
      seconds: 5,
      pedestrianRequested: true,
      pedestrianPresent: false,
      officerOverride: 'hold-vehicles',
    })
    expect(officer).toMatchObject({ signal: 'pedestrian-go', vehicleMayProceed: false, reason: 'officer-hold-vehicles' })
    expect(resolveCrossingControlState(DEFAULT_CROSSING_CONTROL_PLAN, {
      seconds: 5,
      pedestrianRequested: true,
      pedestrianPresent: false,
      officerOverride: 'hold-vehicles',
    })).toEqual(officer)
  })

  it('keeps actor budgets bounded even with extreme high-footfall configuration', () => {
    const manyZones: HighFootfallKind[] = Array.from({ length: 500 }, (_, index) =>
      index % 2 === 0 ? 'school' : 'hospital')
    const budget = resolveLivingCityActorBudget({
      basePedestrians: 13,
      footfallKinds: manyZones,
      reservedVehicles: 4,
      reservedCrossingPedestrians: 1,
      maxActors: AMBIENT_ACTOR_LIMIT,
      maxPedestrians: 18,
    })
    expect(budget.totalActors).toBeLessThanOrEqual(AMBIENT_ACTOR_LIMIT)
    expect(budget.sidewalkPedestrians + budget.crossingPedestrians).toBeLessThanOrEqual(18)
    expect(buildAmbientRoutes().length).toBeLessThanOrEqual(AMBIENT_ACTOR_LIMIT)
  })

  it('exposes school, hospital, station and marketplace semantics without inventing institutions', () => {
    for (const kind of ['school', 'hospital', 'station-terminal', 'marketplace'] as const) {
      const policy = HIGH_FOOTFALL_POLICIES[kind]
      expect(policy.requiresControlledCrossing).toBe(true)
      expect(policy.trafficOfficerEligible).toBe(true)
      expect(policy.vehicleSpeedFactor).toBeGreaterThan(0)
      expect(policy.vehicleSpeedFactor).toBeLessThan(1)
    }
    expect(CENTRAL_CONTROLLED_CROSSING.footfallKind).toBe('station-terminal')
  })

  it('never emits NaN or infinite controlled-crossing coordinates from invalid time input', () => {
    const pose = sampleControlledCrossingPedestrian(
      CENTRAL_CONTROLLED_CROSSING,
      Number.NaN,
      { x: Number.NaN, y: Number.POSITIVE_INFINITY, facing: 'down', moving: true },
    )
    expect(Number.isFinite(pose.x)).toBe(true)
    expect(Number.isFinite(pose.y)).toBe(true)

    const state = resolveCrossingControlState(DEFAULT_CROSSING_CONTROL_PLAN, {
      seconds: Number.POSITIVE_INFINITY,
      pedestrianRequested: true,
      pedestrianPresent: false,
    })
    expect(state.cycleTime).toBe(0)
    expect(Number.isFinite(state.cycleTime)).toBe(true)
  })

  it('repeats the same simulation result for identical route state and input', () => {
    const route = buildAmbientRoutes()[0]
    expect(route).toBeDefined()
    const first: AmbientPose = { x: 0, y: 0, facing: 'right', moving: false }
    const second: AmbientPose = { x: 0, y: 0, facing: 'right', moving: false }
    expect(sampleAmbientRoute(route, 37.25, first)).toEqual(sampleAmbientRoute(route, 37.25, second))
  })
})
