import { describe, expect, it } from 'vitest'
import { createInitialCompanyState } from '../src/state/gameState'
import { VEHICLE_TYPE_IDS } from '../src/types/game'
import {
  TRANSPORT_PROFILES, DRONE_STATES, resolveActiveTransport, isCargoLoad, loadParcel, unloadParcel,
  isHumanCarrier, isDroneCarrier, isDeliveryLeg, isDeliveryMission, isDroneport, canServeDroneport,
  eligibleFallbackDroneports, isLocker, isEmployeeWorldAssignment,
  createFixedDroneport, createMobileDroneport, createHqDroneport, DRONEPORT_DEFAULTS,
  isDroneportCapabilities, isHumanWorldActor, isDroneWorldActor, isLaunchControlPoint, canLaunchDrone,
  type DroneLaunchRequest,
  type CargoLoad, type DeliveryLeg, type DeliveryMission, type Droneport, type Parcel,
} from '../src/systems/urbanLogistics'

const parcel: Parcel = { parcelId: 'parcel-1', orderId: 'order-1', cargoUnits: 1 }
const leg: DeliveryLeg = {
  legId: 'leg-1', from: 'merchant', to: 'hq', parcelIds: [parcel.parcelId],
  mode: 'terrestrial', carrier: { kind: 'player', playerId: 'player' }, transport: 'walking',
}
const mission: DeliveryMission = { missionId: 'mission-1', orderId: 'order-1', parcels: [parcel], legs: [leg] }
const port: Droneport = {
  kind: 'fixed', siteId: 'site', droneportId: 'port',
  position: { x: 0, y: 0 }, coverageRadius: 10, capacity: 2, occupiedSlots: 0, status: 'operational',
  capabilities: { ...DRONEPORT_DEFAULTS.fixed.capabilities },
}
const malformed = [null, undefined, [], '', 1, true, {}, { kind: 'unknown' }]

describe('urban Tycoon transport tuning', () => {
  it('keeps all terrestrial families in architecture without changing stable fleet IDs', () => {
    expect(Object.keys(TRANSPORT_PROFILES)).toEqual(['walking', 'bicycle', 'scooter', 'motorcycle', 'car', 'van'])
    expect(TRANSPORT_PROFILES.walking.speed).toBe(150)
    expect(TRANSPORT_PROFILES.bicycle.speed).toBe(230)
    expect(TRANSPORT_PROFILES.walking.roadOnly).toBe(false)
    expect(TRANSPORT_PROFILES.bicycle.roadOnly).toBe(false)
    for (const transport of ['scooter', 'motorcycle', 'car', 'van'] as const) {
      expect(TRANSPORT_PROFILES[transport].roadOnly).toBe(true)
    }
    for (const profile of Object.values(TRANSPORT_PROFILES)) {
      expect(profile.range).toBeGreaterThan(0)
      expect(profile.cargoCapacity).toBeGreaterThan(0)
      expect(profile.operatingCost).toBeGreaterThanOrEqual(0)
    }
    expect(VEHICLE_TYPE_IDS).toEqual(['Bicycle', 'ElectricScooter', 'Motorcycle', 'DeliveryVan'])
  })

  it('only activates an owned bicycle; accepts either historical upgrade or fleet', () => {
    const company = createInitialCompanyState()
    expect(resolveActiveTransport(company, 'bicycle')).toBe('walking')
    company.purchasedUpgradeLevels.Bicycle = 1
    expect(resolveActiveTransport(company, 'bicycle')).toBe('bicycle')
    for (const invalid of [...malformed, 'car', 'drone', 'Bicycle', 'constructor']) {
      expect(resolveActiveTransport(company, invalid)).toBe('walking')
    }
    expect(resolveActiveTransport(company, 'walking')).toBe('walking')
    company.purchasedUpgradeLevels.Bicycle = NaN
    expect(resolveActiveTransport(company, 'bicycle')).toBe('walking')
    company.vehicles = [{ vehicleId: 'owned-bike', typeId: 'Bicycle' }]
    expect(resolveActiveTransport(company, 'bicycle')).toBe('bicycle')
  })
})

describe('immutable multi-parcel cargo', () => {
  it('loads and unloads without mutating or aliasing parcel rows', () => {
    const cargo: CargoLoad = { capacity: 3, parcels: [parcel] }
    const second = { ...parcel, parcelId: 'parcel-2', cargoUnits: 2 }
    const loaded = loadParcel(cargo, second)
    expect(loaded.ok).toBe(true)
    if (!loaded.ok) return
    expect(cargo.parcels).toEqual([parcel])
    expect(loaded.cargo.parcels).toEqual([parcel, second])
    expect(loaded.cargo.parcels[0]).not.toBe(parcel)
    expect(loaded.cargo.parcels[1]).not.toBe(second)
    const unloaded = unloadParcel(loaded.cargo, parcel.parcelId)
    expect(unloaded).toEqual({ ok: true, cargo: { capacity: 3, parcels: [second] } })
    expect(loaded.cargo.parcels).toHaveLength(2)
  })

  it('rejects overflow, duplicates, unknown IDs and malformed capacities/units', () => {
    const cargo = { capacity: 1, parcels: [parcel] }
    expect(loadParcel(cargo, parcel)).toEqual({ ok: false, reason: 'duplicate' })
    expect(loadParcel(cargo, { ...parcel, parcelId: 'other' })).toEqual({ ok: false, reason: 'capacity' })
    expect(unloadParcel(cargo, 'missing')).toEqual({ ok: false, reason: 'not-found' })
    for (const invalid of [0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, '2']) {
      expect(isCargoLoad({ ...cargo, capacity: invalid })).toBe(false)
      const invalidParcel = { ...parcel, cargoUnits: invalid } as Parcel
      expect(loadParcel({ capacity: 3, parcels: [] }, invalidParcel)).toEqual({ ok: false, reason: 'invalid-parcel' })
      expect(loadParcel({ capacity: 3, parcels: [invalidParcel] }, parcel)).toEqual({ ok: false, reason: 'invalid-cargo' })
    }
    expect(isCargoLoad({ capacity: 3, parcels: [parcel, parcel] })).toBe(false)
    expect(unloadParcel({ capacity: -1, parcels: [] }, 'parcel')).toEqual({ ok: false, reason: 'invalid-cargo' })
  })
})

describe('delivery routes and disjoint human/drone roles', () => {
  it('supports a connected multimodal route plus customer pickup', () => {
    const legs: DeliveryLeg[] = [
      leg,
      { legId: 'transfer', from: 'hq', to: 'launch', parcelIds: ['parcel-1'], mode: 'droneport-transfer', droneportId: 'port', carrier: { kind: 'operator', employeeId: 'employee' } },
      { legId: 'flight', from: 'launch', to: 'locker', parcelIds: ['parcel-1'], mode: 'drone', carrier: { kind: 'drone', droneId: 'drone', state: 'IN_FLIGHT' } },
      { legId: 'pickup', from: 'locker', to: 'customer', parcelIds: ['parcel-1'], mode: 'customer-pickup', carrier: { kind: 'customer', customerId: 'customer' } },
    ]
    expect(isDeliveryMission({ ...mission, legs })).toBe(true)
    expect(isDeliveryLeg({ ...leg, mode: 'fallback', transport: 'bicycle' })).toBe(true)
    for (const state of DRONE_STATES) expect(isDroneCarrier({ kind: 'drone', droneId: 'drone', state })).toBe(true)
  })

  it('validates multiple parcels independently and rejects discontinuity and excess cargo', () => {
    const second = { ...parcel, parcelId: 'parcel-2' }
    const multi = { ...mission, parcels: [parcel, second], legs: [{ ...leg, transport: 'bicycle', parcelIds: ['parcel-1', 'parcel-2'] }] }
    expect(isDeliveryMission(multi)).toBe(true)
    expect(isDeliveryMission({ ...multi, legs: [{ ...multi.legs[0], transport: 'walking' }] })).toBe(false)
    expect(isDeliveryMission({ ...mission, legs: [leg, { ...leg, legId: 'leg-2', from: 'wrong' }] })).toBe(false)
    expect(isDeliveryMission({ ...mission, parcels: [parcel, second] })).toBe(false)
    expect(isDeliveryMission({ ...mission, parcels: [parcel, parcel] })).toBe(false)
    expect(isDeliveryMission({ ...mission, legs: [leg, leg] })).toBe(false)
    expect(isDeliveryMission({ ...mission, orderId: 'wrong' })).toBe(false)
    expect(isDeliveryMission({ ...mission, legs: [{ ...leg, parcelIds: ['unknown'] }] })).toBe(false)
    expect(isDeliveryMission({ ...mission, legs: [] })).toBe(false)
  })

  it('rejects aerial humans and hybrid identities at runtime and compile time', () => {
    expect(isDeliveryLeg({ ...leg, mode: 'drone' })).toBe(false)
    expect(isDeliveryLeg({ ...leg, transport: 'drone' })).toBe(false)
    expect(isDeliveryLeg({ ...leg, carrier: { kind: 'drone', droneId: 'd', state: 'AVAILABLE' } })).toBe(false)
    expect(isHumanCarrier({ kind: 'operator', employeeId: 'e', droneId: 'd' })).toBe(false)
    expect(isHumanCarrier({ kind: 'player', playerId: 'p', employeeId: 'e' })).toBe(false)
    expect(isDroneCarrier({ kind: 'drone', droneId: 'd', state: 'AVAILABLE', employeeId: 'e' })).toBe(false)
    expect(isDroneCarrier({ kind: 'drone', droneId: 'd', state: 'FLYING' })).toBe(false)
    // @ts-expect-error Human operators cannot be the carrier of an aerial leg.
    const humanFlight: DeliveryLeg = { ...leg, mode: 'drone', carrier: { kind: 'operator', employeeId: 'e' } }
    expect(isDeliveryLeg(humanFlight)).toBe(false)
    for (const transport of ['drone', 'constructor', '__proto__', null]) {
      expect(isDeliveryLeg({ ...leg, transport })).toBe(false)
    }
    for (const invalid of ['', null, NaN]) expect(isDeliveryLeg({ ...leg, legId: invalid })).toBe(false)
    expect(isDeliveryLeg({ ...leg, parcelIds: ['parcel-1', 'parcel-1'] })).toBe(false)
  })
})

describe('droneports, lockers and employee world contracts', () => {
  it('supports operational fixed, mobile and HQ coverage without requiring a building', () => {
    const mobile = { ...port, kind: 'mobile', vehicleId: 'van' } as Record<string, unknown>
    delete mobile.siteId
    const hq = { ...port, kind: 'hq', hqId: 'hq' } as Record<string, unknown>
    delete hq.siteId
    for (const candidate of [port, mobile, hq]) {
      expect(isDroneport(candidate)).toBe(true)
      expect(canServeDroneport(candidate, { x: 6, y: 8 })).toBe(true)
      expect(canServeDroneport(candidate, { x: 6, y: 8.01 })).toBe(false)
      expect(canServeDroneport({ ...candidate, status: 'offline' }, { x: 0, y: 0 })).toBe(false)
      expect(canServeDroneport({ ...candidate, status: 'maintenance' }, { x: 0, y: 0 })).toBe(false)
      expect(canServeDroneport({ ...candidate, occupiedSlots: 2 }, { x: 0, y: 0 })).toBe(false)
    }
    expect(isDroneport({ ...mobile, siteId: 'building' })).toBe(false)
    expect(canServeDroneport(port, { x: NaN, y: 0 })).toBe(false)
    for (const invalid of [0, -1, NaN, Infinity, 0.5]) {
      expect(canServeDroneport(port, { x: 0, y: 0 }, invalid)).toBe(false)
    }
  })

  it('deterministically sorts eligible fallback ports by proximity then ID without mutating inputs', () => {
    const ports = [
      { ...port, droneportId: 'b', position: { x: 3, y: 0 } },
      { ...port, droneportId: 'offline', status: 'offline' },
      { ...port, droneportId: 'outside', position: { x: 20, y: 0 } },
      { ...port, droneportId: 'full', occupiedSlots: 2 },
      { ...port, droneportId: 'a', position: { x: -3, y: 0 } },
      { ...port, droneportId: 'closest' },
      null,
    ]
    const sorted = eligibleFallbackDroneports(ports, { x: 0, y: 0 })
    expect(sorted.map((entry) => entry.droneportId)).toEqual(['closest', 'a', 'b'])
    expect(eligibleFallbackDroneports([...ports].reverse(), { x: 0, y: 0 })).toEqual(sorted)
    expect(ports[0]?.droneportId).toBe('b')
  })

  it('validates storage bounds, droneport identity and planned/simulated locker lifecycle', () => {
    const locker = { lockerId: 'locker', position: { x: 1, y: 2 }, capacity: 3, occupiedSlots: 0, status: 'planned' }
    expect(isLocker(locker)).toBe(true)
    expect(isLocker({ ...locker, status: 'simulated' })).toBe(true)
    expect(isLocker({ ...locker, status: 'operational' })).toBe(false)
    for (const patch of [
      { capacity: 0 }, { capacity: Infinity }, { capacity: 1.2 }, { occupiedSlots: -1 },
      { occupiedSlots: 4 }, { occupiedSlots: NaN }, { occupiedSlots: 0.2 }, { position: { x: 0, y: Infinity } },
    ]) {
      expect(isLocker({ ...locker, ...patch })).toBe(false)
      expect(isDroneport({ ...port, ...patch })).toBe(false)
    }
    for (const coverageRadius of [0, -1, NaN, Infinity, '10']) expect(isDroneport({ ...port, coverageRadius })).toBe(false)
    expect(isDroneport({ ...port, status: { toString: () => 'operational' } })).toBe(false)
    expect(isDroneport({ ...port, kind: 'mobile' })).toBe(false)
    expect(isDroneport({ ...port, siteId: '' })).toBe(false)
  })

  it('assigns employee site duties or ground routes, never aerial transport', () => {
    expect(isEmployeeWorldAssignment({ kind: 'site', employeeId: 'e', siteId: 'port', duty: 'drone-operation' })).toBe(true)
    expect(isEmployeeWorldAssignment({ kind: 'delivery', employeeId: 'e', missionId: 'mission', transport: 'van' })).toBe(true)
    expect(isEmployeeWorldAssignment({ kind: 'delivery', employeeId: 'e', missionId: 'mission', transport: 'drone' })).toBe(false)
    expect(isEmployeeWorldAssignment({ kind: 'site', employeeId: 'e', siteId: 'port', duty: 'pilot', droneId: 'd' })).toBe(false)
  })

  it.each(malformed)('rejects malformed contract roots %j without throwing', (value) => {
    for (const validate of [isCargoLoad, isHumanCarrier, isDroneCarrier, isDeliveryLeg, isDeliveryMission, isDroneport, isLocker, isEmployeeWorldAssignment,
      isDroneportCapabilities, isHumanWorldActor, isDroneWorldActor, isLaunchControlPoint, canLaunchDrone]) {
      expect(validate(value)).toBe(false)
    }
  })
})

describe('droneport capability defaults and spatial launch authorization', () => {
  const launch: DroneLaunchRequest = {
    human: { kind: 'player', playerId: 'p', mobility: 'ground', position: { x: 380, y: 270 } },
    drone: { kind: 'drone', droneId: 'd', state: 'AVAILABLE', mobility: 'aerial', batteryCharge: 1, position: { x: 0, y: 0 } },
    control: {
      kind: 'hq', controlId: 'hq', position: { x: 380, y: 270 }, interactionRadius: 32, status: 'operational',
      authorizedCarriers: [{ kind: 'player', playerId: 'p' }], droneportIds: ['port'],
    },
    droneport: port,
    destination: { x: 6, y: 8 },
  }

  it('creates independent fixed/mobile/HQ capability profiles with no building assumption', () => {
    const position = { x: 10, y: 20 }
    const factories = [createFixedDroneport, createMobileDroneport, createHqDroneport]
    for (const create of factories) {
      const first = create('first', position, 'anchor')
      const second = create('second', position, 'anchor')
      expect(isDroneport(first)).toBe(true)
      expect(first.capabilities).toEqual(DRONEPORT_DEFAULTS[first.kind].capabilities)
      first.capabilities.droneSlots = 99
      first.position.x = 100
      expect(second.capabilities.droneSlots).not.toBe(99)
      expect(position.x).toBe(10)
    }
    expect(createMobileDroneport('mobile', position, 'van')).not.toHaveProperty('siteId')
    expect(createHqDroneport('hq', position, 'headquarters')).not.toHaveProperty('siteId')
  })

  it('validates every capability as finite nonnegative, with integral slot counts', () => {
    expect(isDroneportCapabilities({ droneSlots: 0, batterySlots: 0, lockerSlots: 0, employeeSlots: 0, chargingThroughput: 0 })).toBe(true)
    for (const key of Object.keys(port.capabilities)) {
      for (const invalid of [null, undefined, '1', -1, NaN, Infinity]) {
        const capabilities = { ...port.capabilities, [key]: invalid }
        expect(isDroneportCapabilities(capabilities)).toBe(false)
        expect(isDroneport({ ...port, capabilities })).toBe(false)
      }
      if (key !== 'chargingThroughput') expect(isDroneportCapabilities({ ...port.capabilities, [key]: 1.5 })).toBe(false)
    }
    expect(isDroneportCapabilities({ ...port.capabilities, chargingThroughput: 0.5 })).toBe(true)
  })

  it('allows a grounded authorized person at HQ/control and a separate ready drone on its launch pad', () => {
    expect(canLaunchDrone(launch)).toBe(true)
    expect(canLaunchDrone({ ...launch, droneport: createMobileDroneport('port', { x: 0, y: 0 }, 'van') })).toBe(true)
    expect(canLaunchDrone({ ...launch, droneport: createHqDroneport('port', { x: 0, y: 0 }, 'hq') })).toBe(true)
    const snapshot = structuredClone(launch)
    const operator = { kind: 'operator' as const, employeeId: 'e' }
    expect(canLaunchDrone({
      ...launch, human: { ...operator, mobility: 'ground', position: launch.control.position },
      control: { ...launch.control, kind: 'control-point', authorizedCarriers: [operator] },
    })).toBe(true)
    expect(launch).toEqual(snapshot)
    expect(isHumanWorldActor({ ...launch.human, mobility: 'aerial' })).toBe(false)
    expect(isDroneWorldActor({ ...launch.drone, mobility: 'ground' })).toBe(false)
    expect(isHumanWorldActor({ ...launch.human, position: { x: Infinity, y: 0 } })).toBe(false)
  })

  it('refuses remote/unauthorized humans, unavailable drones, closed ports and invalid destinations', () => {
    const rejected = [
      { human: { ...launch.human, position: { x: 0, y: 0 } } },
      { human: { ...launch.human, mobility: 'aerial' } },
      { control: { ...launch.control, authorizedCarriers: [] } },
      { control: { ...launch.control, authorizedCarriers: [{ kind: 'operator', employeeId: 'p' }] } },
      { control: { ...launch.control, droneportIds: ['other'] } },
      { control: { ...launch.control, status: 'offline' } },
      { control: { ...launch.control, interactionRadius: Infinity } },
      { drone: { ...launch.drone, position: { x: 33, y: 0 } } },
      { drone: { ...launch.drone, mobility: 'ground' } },
      { drone: { ...launch.drone, batteryCharge: 0.24 } },
      { drone: { ...launch.drone, batteryCharge: NaN } },
      { drone: { ...launch.drone, batteryCharge: 1.1 } },
      { drone: { ...launch.drone, employeeId: 'e' } },
      { droneport: { ...port, status: 'offline' } },
      { droneport: { ...port, occupiedSlots: port.capacity } },
      { destination: { x: 100, y: 100 } },
      ...(['IN_FLIGHT', 'CHARGING', 'MAINTENANCE'].map((state) => ({ drone: { ...launch.drone, state } }))),
      ...(['droneSlots', 'batterySlots', 'employeeSlots'].map((key) => ({
        droneport: { ...port, capabilities: { ...port.capabilities, [key]: 0 } },
      }))),
    ]
    for (const patch of rejected) expect(canLaunchDrone({ ...launch, ...patch })).toBe(false)
  })
})
