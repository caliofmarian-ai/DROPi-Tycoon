import {
  ACTIVE_TRANSPORTS,
  type ActiveTransport,
  type CompanyState,
  type VehicleTypeId,
} from '../types/game'
import { isVehicleTypeAvailableToPlayer } from './employeeFleetSystem'

export const ACTIVE_TRANSPORT_LABELS: Readonly<Record<ActiveTransport, string>> = {
  walking: 'Walking',
  bicycle: 'Bicycle',
  scooter: 'Electric Scooter',
  motorcycle: 'Motorcycle',
  van: 'Delivery Van',
}

export const ACTIVE_TRANSPORT_VEHICLE_TYPES: Readonly<Partial<Record<ActiveTransport, VehicleTypeId>>> = {
  bicycle: 'Bicycle',
  scooter: 'ElectricScooter',
  motorcycle: 'Motorcycle',
  van: 'DeliveryVan',
}

export const isActiveTransportOwned = (
  company: CompanyState,
  transport: ActiveTransport,
): boolean => {
  if (transport === 'walking') return true
  const typeId = ACTIVE_TRANSPORT_VEHICLE_TYPES[transport]
  return typeId !== undefined && isVehicleTypeAvailableToPlayer(company, typeId)
}

/**
 * Save/runtime guard for the currently selected terrestrial transport.
 * Invalid, unsupported, no-longer-owned or employee-assigned values always
 * fail safely to Walking.
 */
export const resolveActiveTransport = (
  company: CompanyState,
  requested: unknown,
): ActiveTransport => {
  if (typeof requested !== 'string' || !ACTIVE_TRANSPORTS.includes(requested as ActiveTransport)) {
    return 'walking'
  }
  const transport = requested as ActiveTransport
  return isActiveTransportOwned(company, transport) ? transport : 'walking'
}

/** Stable progression order used by the interim HQ selector and future HQ Fleet Bay. */
export const availableActiveTransports = (company: CompanyState): ActiveTransport[] =>
  ACTIVE_TRANSPORTS.filter((transport) => isActiveTransportOwned(company, transport))

export const nextActiveTransport = (
  company: CompanyState,
  current: unknown,
): ActiveTransport => {
  const available = availableActiveTransports(company)
  const resolved = resolveActiveTransport(company, current)
  const index = available.indexOf(resolved)
  return available[(index + 1) % available.length] ?? 'walking'
}
