import { BALANCING } from '../config/balancing'
import type {
  BusinessAuthorizationStatus,
  BusinessCompanyId,
  BusinessServiceModelId,
  EconomicActorId,
  LocalBusinessCapacityRule,
  LocalBusinessRegistryState,
  OperatingAreaId,
  RegisteredBusinessIdentity,
} from '../types/business'
import {
  BUSINESS_AUTHORIZATION_STATUSES,
  BUSINESS_SERVICE_MODEL_IDS,
} from '../types/business'
import type { PersonalCapabilityId, PersonalProgressionState } from '../types/game'

export interface BusinessServiceModelDefinition {
  id: BusinessServiceModelId
  label: string
  minimumFormationResources: number
  requiredCapabilityIds: readonly PersonalCapabilityId[]
}

export const BUSINESS_SERVICE_MODEL_DEFINITIONS: readonly BusinessServiceModelDefinition[] = [
  {
    id: 'LocalCourier',
    label: 'Local Courier',
    minimumFormationResources: BALANCING.LOCAL_COURIER_COMPANY_FORMATION_MIN_RESOURCES,
    requiredCapabilityIds: ['WalkingCourierFundamentals'],
  },
] as const

export const createInitialLocalBusinessRegistryState = (): LocalBusinessRegistryState => ({ companies: [] })

export const createLocalEconomicActorId = (sequence: number): EconomicActorId => {
  if (!Number.isSafeInteger(sequence) || sequence < 1) throw new Error('Local actor sequence must be a positive safe integer.')
  return `actor:local:${String(sequence).padStart(6, '0')}`
}

export const createLocalBusinessCompanyId = (sequence: number): BusinessCompanyId => {
  if (!Number.isSafeInteger(sequence) || sequence < 1) throw new Error('Local company sequence must be a positive safe integer.')
  return `company:local:${String(sequence).padStart(6, '0')}`
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0

const isBusinessServiceModelId = (value: unknown): value is BusinessServiceModelId =>
  typeof value === 'string' && BUSINESS_SERVICE_MODEL_IDS.some(id => id === value)

const isBusinessAuthorizationStatus = (value: unknown): value is BusinessAuthorizationStatus =>
  typeof value === 'string' && BUSINESS_AUTHORIZATION_STATUSES.some(status => status === value)

export const sanitizeLocalBusinessRegistry = (
  value: unknown,
): { businessRegistry: LocalBusinessRegistryState; repaired: boolean } => {
  if (value === undefined) return { businessRegistry: createInitialLocalBusinessRegistryState(), repaired: false }
  if (!isRecord(value) || !Array.isArray(value.companies)) {
    return { businessRegistry: createInitialLocalBusinessRegistryState(), repaired: true }
  }

  const companies: RegisteredBusinessIdentity[] = []
  const seenCompanyIds = new Set<string>()
  let repaired = false

  value.companies.forEach(raw => {
    if (!isRecord(raw)) { repaired = true; return }
    const companyId = isNonEmptyString(raw.companyId) ? raw.companyId.trim() : null
    const founderActorId = isNonEmptyString(raw.founderActorId) ? raw.founderActorId.trim() : null
    const displayName = isNonEmptyString(raw.displayName) ? raw.displayName.trim() : null
    const serviceModelId = isBusinessServiceModelId(raw.serviceModelId) ? raw.serviceModelId : null
    const operatingAreaId = isNonEmptyString(raw.operatingAreaId) ? raw.operatingAreaId.trim() : null
    const authorizationStatus = isBusinessAuthorizationStatus(raw.authorizationStatus) ? raw.authorizationStatus : null
    const foundedAtSequence = typeof raw.foundedAtSequence === 'number' && Number.isSafeInteger(raw.foundedAtSequence) && raw.foundedAtSequence >= 0
      ? raw.foundedAtSequence
      : null

    if (
      companyId === null || founderActorId === null || displayName === null || serviceModelId === null ||
      operatingAreaId === null || authorizationStatus === null || foundedAtSequence === null || seenCompanyIds.has(companyId)
    ) {
      repaired = true
      return
    }

    seenCompanyIds.add(companyId)
    companies.push({
      companyId,
      founderActorId,
      displayName,
      serviceModelId,
      operatingAreaId,
      authorizationStatus,
      foundedAtSequence,
    })
  })

  return { businessRegistry: { companies }, repaired }
}

export const cloneLocalBusinessRegistry = (state: LocalBusinessRegistryState): LocalBusinessRegistryState => ({
  companies: state.companies.map(company => ({ ...company })),
})

export const hasBusinessRegistryActivity = (state: LocalBusinessRegistryState): boolean => state.companies.length > 0

export const getBusinessServiceModelDefinition = (id: BusinessServiceModelId): BusinessServiceModelDefinition => {
  const definition = BUSINESS_SERVICE_MODEL_DEFINITIONS.find(item => item.id === id)
  if (!definition) throw new Error(`Missing business service model definition: ${id}`)
  return definition
}

const OCCUPYING_AUTHORIZATION_STATUSES = new Set<BusinessAuthorizationStatus>(['Pending', 'Authorized', 'Suspended'])
const ACTIVE_FOUNDER_STATUSES = OCCUPYING_AUTHORIZATION_STATUSES

export const countCapacityOccupants = (
  registry: LocalBusinessRegistryState,
  operatingAreaId: OperatingAreaId,
  serviceModelId: BusinessServiceModelId,
): number => registry.companies.filter(company =>
  company.operatingAreaId === operatingAreaId &&
  company.serviceModelId === serviceModelId &&
  OCCUPYING_AUTHORIZATION_STATUSES.has(company.authorizationStatus),
).length

export const findCapacityRule = (
  rules: readonly LocalBusinessCapacityRule[],
  operatingAreaId: OperatingAreaId,
  serviceModelId: BusinessServiceModelId,
): LocalBusinessCapacityRule | undefined => rules.find(rule =>
  rule.operatingAreaId === operatingAreaId && rule.serviceModelId === serviceModelId,
)

export const isIndependentEconomicActor = (
  registry: LocalBusinessRegistryState,
  actorId: EconomicActorId,
): boolean => !registry.companies.some(company =>
  company.founderActorId === actorId && ACTIVE_FOUNDER_STATUSES.has(company.authorizationStatus),
)

export const historicalFounderCompanyIds = (
  registry: LocalBusinessRegistryState,
  actorId: EconomicActorId,
): BusinessCompanyId[] => registry.companies
  .filter(company => company.founderActorId === actorId)
  .map(company => company.companyId)

export const BUSINESS_FORMATION_BLOCK_REASONS = [
  'InvalidCompanyName',
  'CompanyIdCollision',
  'AlreadyActiveFounder',
  'MissingEntrepreneurship',
  'MissingServiceCapability',
  'InsufficientResources',
  'LocalCapacityFull',
] as const
export type BusinessFormationBlockReason = (typeof BUSINESS_FORMATION_BLOCK_REASONS)[number]

export interface LocalBusinessFormationRequest {
  applicantActorId: EconomicActorId
  proposedCompanyId: BusinessCompanyId
  proposedDisplayName: string
  serviceModelId: BusinessServiceModelId
  operatingAreaId: OperatingAreaId
  foundedAtSequence: number
}

export interface LocalBusinessFormationContext {
  personalProgression: PersonalProgressionState
  availableGameResources: number
  registry: LocalBusinessRegistryState
  capacityRules: readonly LocalBusinessCapacityRule[]
}

export interface LocalBusinessFormationEvaluation {
  eligible: boolean
  blockReasons: BusinessFormationBlockReason[]
  missingCapabilityIds: PersonalCapabilityId[]
  resourceShortfall: number
  capacity: {
    occupied: number
    maximum: number | null
    available: boolean
  }
}

export const evaluateLocalBusinessFormation = (
  request: LocalBusinessFormationRequest,
  context: LocalBusinessFormationContext,
): LocalBusinessFormationEvaluation => {
  const definition = getBusinessServiceModelDefinition(request.serviceModelId)
  const blockReasons: BusinessFormationBlockReason[] = []
  const missingCapabilityIds: PersonalCapabilityId[] = []

  if (request.proposedDisplayName.trim().length === 0) blockReasons.push('InvalidCompanyName')
  if (context.registry.companies.some(company => company.companyId === request.proposedCompanyId)) {
    blockReasons.push('CompanyIdCollision')
  }
  if (!isIndependentEconomicActor(context.registry, request.applicantActorId)) {
    blockReasons.push('AlreadyActiveFounder')
  }

  if (!context.personalProgression.learnedCapabilityIds.includes('Entrepreneurship')) {
    blockReasons.push('MissingEntrepreneurship')
    missingCapabilityIds.push('Entrepreneurship')
  }

  const missingServiceCapabilities = definition.requiredCapabilityIds
    .filter(id => !context.personalProgression.learnedCapabilityIds.includes(id))
  if (missingServiceCapabilities.length > 0) {
    blockReasons.push('MissingServiceCapability')
    missingCapabilityIds.push(...missingServiceCapabilities)
  }

  const availableResources = Number.isFinite(context.availableGameResources) ? Math.max(0, context.availableGameResources) : 0
  const resourceShortfall = Math.max(0, definition.minimumFormationResources - availableResources)
  if (resourceShortfall > 0) blockReasons.push('InsufficientResources')

  const capacityRule = findCapacityRule(context.capacityRules, request.operatingAreaId, request.serviceModelId)
  const occupied = countCapacityOccupants(context.registry, request.operatingAreaId, request.serviceModelId)
  const maximum = capacityRule?.maxActiveCompanies ?? null
  const capacityAvailable = maximum === null || occupied < maximum
  if (!capacityAvailable) blockReasons.push('LocalCapacityFull')

  return {
    eligible: blockReasons.length === 0,
    blockReasons,
    missingCapabilityIds: [...new Set(missingCapabilityIds)],
    resourceShortfall,
    capacity: { occupied, maximum, available: capacityAvailable },
  }
}

export type SubmitLocalBusinessFormationResult =
  | { submitted: true; registry: LocalBusinessRegistryState; company: RegisteredBusinessIdentity }
  | { submitted: false; registry: LocalBusinessRegistryState; evaluation: LocalBusinessFormationEvaluation }

export const submitLocalBusinessFormation = (
  request: LocalBusinessFormationRequest,
  context: LocalBusinessFormationContext,
): SubmitLocalBusinessFormationResult => {
  const evaluation = evaluateLocalBusinessFormation(request, context)
  if (!evaluation.eligible) return { submitted: false, registry: context.registry, evaluation }

  const company: RegisteredBusinessIdentity = {
    companyId: request.proposedCompanyId,
    founderActorId: request.applicantActorId,
    displayName: request.proposedDisplayName.trim(),
    serviceModelId: request.serviceModelId,
    operatingAreaId: request.operatingAreaId,
    authorizationStatus: 'Pending',
    foundedAtSequence: request.foundedAtSequence,
  }
  return {
    submitted: true,
    company,
    registry: { companies: [...context.registry.companies.map(item => ({ ...item })), company] },
  }
}

const AUTHORIZATION_TRANSITIONS: Readonly<Record<BusinessAuthorizationStatus, readonly BusinessAuthorizationStatus[]>> = {
  Pending: ['Authorized', 'Denied', 'Closed'],
  Authorized: ['Suspended', 'Closed'],
  Suspended: ['Authorized', 'Closed'],
  Denied: [],
  Closed: [],
}

export type BusinessAuthorizationTransitionResult =
  | { changed: true; registry: LocalBusinessRegistryState; company: RegisteredBusinessIdentity }
  | { changed: false; registry: LocalBusinessRegistryState; reason: 'CompanyNotFound' | 'InvalidTransition' }

export const transitionBusinessAuthorization = (
  registry: LocalBusinessRegistryState,
  companyId: BusinessCompanyId,
  nextStatus: BusinessAuthorizationStatus,
): BusinessAuthorizationTransitionResult => {
  const index = registry.companies.findIndex(company => company.companyId === companyId)
  if (index < 0) return { changed: false, registry, reason: 'CompanyNotFound' }
  const current = registry.companies[index]
  if (!AUTHORIZATION_TRANSITIONS[current.authorizationStatus].includes(nextStatus)) {
    return { changed: false, registry, reason: 'InvalidTransition' }
  }

  const company = { ...current, authorizationStatus: nextStatus }
  const companies = registry.companies.map((item, itemIndex) => itemIndex === index ? company : { ...item })
  return { changed: true, registry: { companies }, company }
}
