import type { ActiveTransport, CompanyState } from '../types/game'

// Replaceable Tycoon tuning in world pixels/game cost units, not real DROPi specifications.
export const TRANSPORT_PROFILES = {
  walking: { speed: 150, range: 1800, cargoCapacity: 1, operatingCost: 0, roadOnly: false },
  bicycle: { speed: 230, range: 3200, cargoCapacity: 3, operatingCost: 1, roadOnly: false },
  scooter: { speed: 260, range: 4000, cargoCapacity: 4, operatingCost: 3, roadOnly: true },
  motorcycle: { speed: 300, range: 5500, cargoCapacity: 6, operatingCost: 5, roadOnly: true },
  car: { speed: 280, range: 6500, cargoCapacity: 12, operatingCost: 7, roadOnly: true },
  van: { speed: 250, range: 7500, cargoCapacity: 24, operatingCost: 8, roadOnly: true },
} as const

export type GroundTransport = keyof typeof TRANSPORT_PROFILES

export const resolveActiveTransport = (company: CompanyState, requested: unknown): ActiveTransport => {
  const level = company.purchasedUpgradeLevels.Bicycle
  const ownsBicycle = (Number.isSafeInteger(level) && level > 0) ||
    company.vehicles.some((vehicle) => vehicle.typeId === 'Bicycle')
  return requested === 'bicycle' && ownsBicycle ? 'bicycle' : 'walking'
}

export interface WorldPoint { x: number; y: number }
export interface Parcel { parcelId: string; orderId: string; cargoUnits: number }
export interface CargoLoad { capacity: number; parcels: readonly Parcel[] }
export type CargoResult =
  | { ok: true; cargo: CargoLoad }
  | { ok: false; reason: 'invalid-cargo' | 'invalid-parcel' | 'duplicate' | 'capacity' | 'not-found' }

export const DRONE_STATES = ['AVAILABLE', 'IN_FLIGHT', 'CHARGING', 'MAINTENANCE'] as const
export type DroneState = (typeof DRONE_STATES)[number]
export type HumanCarrier =
  | { kind: 'player'; playerId: string }
  | { kind: 'operator'; employeeId: string }
export interface DroneCarrier { kind: 'drone'; droneId: string; state: DroneState }

export type HumanWorldActor = HumanCarrier & { position: WorldPoint; mobility: 'ground' }
export type DroneWorldActor = DroneCarrier & { position: WorldPoint; mobility: 'aerial'; batteryCharge: number }

export interface LaunchControlPoint {
  kind: 'hq' | 'control-point'
  controlId: string
  position: WorldPoint
  interactionRadius: number
  status: 'operational' | 'offline'
  authorizedCarriers: readonly HumanCarrier[]
  droneportIds: readonly string[]
}

export const DRONE_LAUNCH_BALANCING = { padRadius: 32, minimumBatteryCharge: 0.25 } as const

interface LegBase { legId: string; from: string; to: string; parcelIds: readonly string[] }
export type DeliveryLeg =
  | (LegBase & { mode: 'terrestrial' | 'fallback'; carrier: HumanCarrier; transport: GroundTransport })
  | (LegBase & { mode: 'droneport-transfer'; carrier: HumanCarrier; droneportId: string })
  | (LegBase & { mode: 'drone'; carrier: DroneCarrier })
  | (LegBase & { mode: 'customer-pickup'; carrier: { kind: 'customer'; customerId: string } })
export interface DeliveryMission {
  missionId: string
  orderId: string
  parcels: readonly Parcel[]
  legs: readonly DeliveryLeg[]
}

export interface DroneportCapabilities {
  droneSlots: number
  batterySlots: number
  lockerSlots: number
  chargingThroughput: number
  employeeSlots: number
}

interface DroneportBase {
  droneportId: string
  position: WorldPoint
  coverageRadius: number
  capacity: number
  occupiedSlots: number
  status: 'operational' | 'offline' | 'maintenance'
  capabilities: DroneportCapabilities
}
export type Droneport =
  | (DroneportBase & { kind: 'fixed'; siteId: string })
  | (DroneportBase & { kind: 'mobile'; vehicleId: string })
  | (DroneportBase & { kind: 'hq'; hqId: string })

export const DRONEPORT_DEFAULTS = {
  fixed: { capacity: 12, coverageRadius: 600, capabilities: { droneSlots: 3, batterySlots: 6, lockerSlots: 12, chargingThroughput: 2, employeeSlots: 4 } },
  mobile: { capacity: 8, coverageRadius: 450, capabilities: { droneSlots: 2, batterySlots: 2, lockerSlots: 0, chargingThroughput: 1, employeeSlots: 2 } },
  hq: { capacity: 24, coverageRadius: 800, capabilities: { droneSlots: 4, batterySlots: 8, lockerSlots: 24, chargingThroughput: 3, employeeSlots: 6 } },
} as const

const droneportDefaults = (kind: Droneport['kind'], droneportId: string, position: WorldPoint): DroneportBase => ({
  ...DRONEPORT_DEFAULTS[kind],
  capabilities: { ...DRONEPORT_DEFAULTS[kind].capabilities },
  droneportId,
  position: { ...position },
  occupiedSlots: 0,
  status: 'operational',
})

export const createFixedDroneport = (droneportId: string, position: WorldPoint, siteId: string): Droneport =>
  ({ ...droneportDefaults('fixed', droneportId, position), kind: 'fixed', siteId })
export const createMobileDroneport = (droneportId: string, position: WorldPoint, vehicleId: string): Droneport =>
  ({ ...droneportDefaults('mobile', droneportId, position), kind: 'mobile', vehicleId })
export const createHqDroneport = (droneportId: string, position: WorldPoint, hqId: string): Droneport =>
  ({ ...droneportDefaults('hq', droneportId, position), kind: 'hq', hqId })

export interface Locker {
  lockerId: string
  position: WorldPoint
  status: 'planned' | 'simulated'
  capacity: number
  occupiedSlots: number
}

export type EmployeeWorldAssignment =
  | { kind: 'site'; employeeId: string; siteId: string; duty: 'dispatch' | 'loading' | 'drone-operation' }
  | { kind: 'delivery'; employeeId: string; missionId: string; transport: GroundTransport }

const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
const id = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)
const positiveUnits = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value > 0
const point = (value: unknown): value is WorldPoint => record(value) && finite(value.x) && finite(value.y)
const groundTransport = (value: unknown): value is GroundTransport =>
  typeof value === 'string' && Object.hasOwn(TRANSPORT_PROFILES, value)
const slots = (value: Record<string, unknown>): boolean =>
  positiveUnits(value.capacity) && typeof value.occupiedSlots === 'number' &&
  Number.isSafeInteger(value.occupiedSlots) && value.occupiedSlots >= 0 && value.occupiedSlots <= value.capacity

export const isParcel = (value: unknown): value is Parcel =>
  record(value) && id(value.parcelId) && id(value.orderId) && positiveUnits(value.cargoUnits)

export const isCargoLoad = (value: unknown): value is CargoLoad => {
  if (!record(value) || !positiveUnits(value.capacity) || !Array.isArray(value.parcels)) return false
  if (!value.parcels.every(isParcel)) return false
  return new Set(value.parcels.map((parcel) => parcel.parcelId)).size === value.parcels.length &&
    value.parcels.reduce((sum, parcel) => sum + parcel.cargoUnits, 0) <= value.capacity
}

export const loadParcel = (cargo: CargoLoad, parcel: Parcel): CargoResult => {
  if (!isCargoLoad(cargo)) return { ok: false, reason: 'invalid-cargo' }
  if (!isParcel(parcel)) return { ok: false, reason: 'invalid-parcel' }
  if (cargo.parcels.some((entry) => entry.parcelId === parcel.parcelId)) return { ok: false, reason: 'duplicate' }
  if (cargo.parcels.reduce((sum, entry) => sum + entry.cargoUnits, parcel.cargoUnits) > cargo.capacity) {
    return { ok: false, reason: 'capacity' }
  }
  return { ok: true, cargo: { capacity: cargo.capacity, parcels: [...cargo.parcels, parcel].map((entry) => ({ ...entry })) } }
}

export const unloadParcel = (cargo: CargoLoad, parcelId: string): CargoResult => {
  if (!isCargoLoad(cargo)) return { ok: false, reason: 'invalid-cargo' }
  if (!cargo.parcels.some((parcel) => parcel.parcelId === parcelId)) return { ok: false, reason: 'not-found' }
  return {
    ok: true,
    cargo: { capacity: cargo.capacity, parcels: cargo.parcels.filter((parcel) => parcel.parcelId !== parcelId).map((parcel) => ({ ...parcel })) },
  }
}

export const isHumanCarrier = (value: unknown): value is HumanCarrier =>
  record(value) && !('droneId' in value) && !('state' in value) &&
  ((value.kind === 'player' && id(value.playerId) && !('employeeId' in value)) ||
    (value.kind === 'operator' && id(value.employeeId) && !('playerId' in value)))

export const isDroneCarrier = (value: unknown): value is DroneCarrier =>
  record(value) && value.kind === 'drone' && id(value.droneId) &&
  !('playerId' in value) && !('employeeId' in value) &&
  DRONE_STATES.some((state) => state === value.state)

export const isHumanWorldActor = (value: unknown): value is HumanWorldActor =>
  record(value) && value.mobility === 'ground' && point(value.position) && isHumanCarrier(value)

export const isDroneWorldActor = (value: unknown): value is DroneWorldActor =>
  record(value) && value.mobility === 'aerial' && point(value.position) &&
  finite(value.batteryCharge) && value.batteryCharge >= 0 && value.batteryCharge <= 1 && isDroneCarrier(value)

export const isLaunchControlPoint = (value: unknown): value is LaunchControlPoint =>
  record(value) && (value.kind === 'hq' || value.kind === 'control-point') &&
  id(value.controlId) && point(value.position) && finite(value.interactionRadius) && value.interactionRadius >= 0 &&
  (value.status === 'operational' || value.status === 'offline') &&
  Array.isArray(value.authorizedCarriers) && value.authorizedCarriers.every(isHumanCarrier) &&
  Array.isArray(value.droneportIds) && value.droneportIds.every(id)

export const isDeliveryLeg = (value: unknown): value is DeliveryLeg => {
  if (!record(value) || !id(value.legId) || !id(value.from) || !id(value.to) ||
    !Array.isArray(value.parcelIds) || value.parcelIds.length === 0 ||
    !value.parcelIds.every(id) || new Set(value.parcelIds).size !== value.parcelIds.length) return false
  switch (value.mode) {
    case 'terrestrial':
    case 'fallback': return isHumanCarrier(value.carrier) && groundTransport(value.transport)
    case 'droneport-transfer': return isHumanCarrier(value.carrier) && id(value.droneportId) && !('transport' in value)
    case 'drone': return isDroneCarrier(value.carrier) && !('transport' in value)
    case 'customer-pickup':
      return record(value.carrier) && value.carrier.kind === 'customer' && id(value.carrier.customerId) &&
        !('playerId' in value.carrier) && !('employeeId' in value.carrier) && !('droneId' in value.carrier) &&
        !('transport' in value)
    default: return false
  }
}

export const isDeliveryMission = (value: unknown): value is DeliveryMission => {
  if (!record(value) || !id(value.missionId) || !id(value.orderId) ||
    !Array.isArray(value.parcels) || !value.parcels.length || !value.parcels.every(isParcel) ||
    !Array.isArray(value.legs) || !value.legs.length || !value.legs.every(isDeliveryLeg)) return false
  const parcels = new Map(value.parcels.map((parcel) => [parcel.parcelId, parcel]))
  if (parcels.size !== value.parcels.length || value.parcels.some((parcel) => parcel.orderId !== value.orderId) ||
    new Set(value.legs.map((leg) => leg.legId)).size !== value.legs.length) return false
  const lastDestination = new Map<string, string>()
  for (const leg of value.legs) {
    let cargoUnits = 0
    for (const parcelId of leg.parcelIds) {
      const parcel = parcels.get(parcelId)
      if (!parcel || (lastDestination.has(parcelId) && lastDestination.get(parcelId) !== leg.from)) return false
      cargoUnits += parcel.cargoUnits
      lastDestination.set(parcelId, leg.to)
    }
    if ((leg.mode === 'terrestrial' || leg.mode === 'fallback') && cargoUnits > TRANSPORT_PROFILES[leg.transport].cargoCapacity) return false
  }
  return lastDestination.size === parcels.size
}

export const isDroneport = (value: unknown): value is Droneport => {
  if (!record(value) || !id(value.droneportId) || !point(value.position) ||
    !finite(value.coverageRadius) || value.coverageRadius <= 0 || !slots(value) || !isDroneportCapabilities(value.capabilities) ||
    (value.status !== 'operational' && value.status !== 'offline' && value.status !== 'maintenance')) return false
  switch (value.kind) {
    case 'fixed': return id(value.siteId) && !('vehicleId' in value) && !('hqId' in value)
    case 'mobile': return id(value.vehicleId) && !('siteId' in value) && !('hqId' in value)
    case 'hq': return id(value.hqId) && !('siteId' in value) && !('vehicleId' in value)
    default: return false
  }
}

export const isDroneportCapabilities = (value: unknown): value is DroneportCapabilities =>
  record(value) && ['droneSlots', 'batterySlots', 'lockerSlots', 'employeeSlots'].every((key) =>
    typeof value[key] === 'number' && Number.isSafeInteger(value[key]) && value[key] >= 0) &&
  finite(value.chargingThroughput) && value.chargingThroughput >= 0

export const canServeDroneport = (port: unknown, destination: WorldPoint, requiredSlots = 1): port is Droneport =>
  isDroneport(port) && point(destination) && positiveUnits(requiredSlots) &&
  port.status === 'operational' && port.capacity - port.occupiedSlots >= requiredSlots &&
  Math.hypot(port.position.x - destination.x, port.position.y - destination.y) <= port.coverageRadius

export const eligibleFallbackDroneports = (
  ports: readonly unknown[], destination: WorldPoint, requiredSlots = 1,
): Droneport[] => ports.filter((port): port is Droneport => canServeDroneport(port, destination, requiredSlots))
  .sort((a, b) => Math.hypot(a.position.x - destination.x, a.position.y - destination.y) -
    Math.hypot(b.position.x - destination.x, b.position.y - destination.y) ||
    (a.droneportId < b.droneportId ? -1 : a.droneportId > b.droneportId ? 1 : 0))

export interface DroneLaunchRequest {
  human: HumanWorldActor
  drone: DroneWorldActor
  control: LaunchControlPoint
  droneport: Droneport
  destination: WorldPoint
}

export const canLaunchDrone = (value: unknown): value is DroneLaunchRequest => {
  if (!record(value) || !isHumanWorldActor(value.human) || !isDroneWorldActor(value.drone) ||
    !isLaunchControlPoint(value.control) || !point(value.destination) ||
    !canServeDroneport(value.droneport, value.destination)) return false
  const { human, drone, control, droneport } = value
  const authorized = control.authorizedCarriers.some((carrier) =>
    (carrier.kind === 'player' && human.kind === 'player' && carrier.playerId === human.playerId) ||
    (carrier.kind === 'operator' && human.kind === 'operator' && carrier.employeeId === human.employeeId))
  return authorized && control.status === 'operational' && control.droneportIds.includes(droneport.droneportId) &&
    Math.hypot(human.position.x - control.position.x, human.position.y - control.position.y) <= control.interactionRadius &&
    Math.hypot(drone.position.x - droneport.position.x, drone.position.y - droneport.position.y) <= DRONE_LAUNCH_BALANCING.padRadius &&
    drone.state === 'AVAILABLE' && drone.batteryCharge >= DRONE_LAUNCH_BALANCING.minimumBatteryCharge &&
    droneport.capabilities.droneSlots > 0 && droneport.capabilities.batterySlots > 0 && droneport.capabilities.employeeSlots > 0
}

export const isLocker = (value: unknown): value is Locker =>
  record(value) && id(value.lockerId) && point(value.position) && slots(value) &&
  (value.status === 'planned' || value.status === 'simulated')

export const isEmployeeWorldAssignment = (value: unknown): value is EmployeeWorldAssignment =>
  record(value) && id(value.employeeId) && !('droneId' in value) &&
  ((value.kind === 'site' && id(value.siteId) && !('transport' in value) &&
    (value.duty === 'dispatch' || value.duty === 'loading' || value.duty === 'drone-operation')) ||
    (value.kind === 'delivery' && id(value.missionId) && groundTransport(value.transport)))
