export const BUSINESS_SERVICE_MODEL_IDS = ['LocalCourier'] as const
export type BusinessServiceModelId = (typeof BUSINESS_SERVICE_MODEL_IDS)[number]

export const BUSINESS_AUTHORIZATION_STATUSES = [
  'Pending',
  'Authorized',
  'Suspended',
  'Denied',
  'Closed',
] as const
export type BusinessAuthorizationStatus = (typeof BUSINESS_AUTHORIZATION_STATUSES)[number]

/**
 * Opaque identifiers. Local single-player factories may use deterministic local prefixes,
 * while future server authority may issue different collision-safe values without changing
 * the domain meaning of these fields.
 */
export type EconomicActorId = string
export type BusinessCompanyId = string
export type OperatingAreaId = string

export interface RegisteredBusinessIdentity {
  companyId: BusinessCompanyId
  founderActorId: EconomicActorId
  displayName: string
  serviceModelId: BusinessServiceModelId
  operatingAreaId: OperatingAreaId
  authorizationStatus: BusinessAuthorizationStatus
  /** Deterministic local history/order marker; not a real-world legal timestamp. */
  foundedAtSequence: number
}

/**
 * Registry state stores company identities/history only. Capacity policy remains governed
 * configuration so balance changes do not rewrite historical company records.
 */
export interface LocalBusinessRegistryState {
  companies: RegisteredBusinessIdentity[]
}

export interface LocalBusinessCapacityRule {
  operatingAreaId: OperatingAreaId
  serviceModelId: BusinessServiceModelId
  maxActiveCompanies: number
}
