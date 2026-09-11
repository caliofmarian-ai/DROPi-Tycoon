import type {
  BusinessCompanyId,
  BusinessAuthorizationStatus,
  EconomicActorId,
  OperatingAreaId,
  RegisteredBusinessIdentity,
} from '../types/business'
import type { EquityHoldingState } from '../types/equity'
import type { CompanyState, EmployeeState, HQDepartmentId, OwnedVehicleState } from '../types/game'
import type { OwnershipEconomyState } from '../types/ownershipEconomy'

export const COMPANY_PHYSICAL_CAPABILITY_IDS = [
  'CoreOperations',
  'MaintenanceWorkshop',
] as const
export type CompanyPhysicalCapabilityId = (typeof COMPANY_PHYSICAL_CAPABILITY_IDS)[number]

/**
 * Explicit operational-membership projection. It is deliberately separate from
 * employment records and equity holdings. The current legacy bridge reads active
 * member eligibility from the existing equity authority until a coordinated
 * membership persistence migration is assigned.
 *
 * Membership is not ownership. Founder history is not ownership either.
 */
export interface CompanyOperationalMembershipRecord {
  companyId: BusinessCompanyId
  actorId: EconomicActorId
  relationship: 'InternalMember'
}

/**
 * Existing physical-startup fact consumed by this read model.
 *
 * DT-20 does not synthesize this binding from authorization, membership, money,
 * fleet, a phone action, or the legacy Core default. A future owning world/facility
 * authority must establish the legitimate physical association before it is passed
 * here. This contract only validates and consumes that fact.
 */
export interface CompanyPhysicalStartupBinding {
  companyId: BusinessCompanyId
  operatingAreaId: OperatingAreaId
  hqDepartmentId: 'Core'
}

export interface CompanyPhysicalFootprintProjection {
  companyId: BusinessCompanyId
  operatingAreaId: OperatingAreaId
  authorizationStatus: BusinessAuthorizationStatus
  startupBinding: CompanyPhysicalStartupBinding | null
  constructedHqDepartmentIds: HQDepartmentId[]
}

/**
 * Read-only composition contract for company operations. Source authorities remain
 * where they already live; this aggregate must not become another ledger, employee
 * store, equity store, fleet store, HQ progression store, capability writer, or
 * persistence writer.
 */
export interface CompanyOperationalAggregate {
  companyId: BusinessCompanyId
  identity: RegisteredBusinessIdentity
  membership: CompanyOperationalMembershipRecord[]
  employment: {
    employees: EmployeeState[]
  }
  ownershipInvestment: {
    holdings: EquityHoldingState[]
  }
  treasury: {
    companyMoney: number
  }
  physicalFacilities: CompanyPhysicalFootprintProjection
  fleet: {
    vehicles: OwnedVehicleState[]
  }
  /** DT-20 physical capabilities only. People/qualification capability remains DT-06 authority. */
  physicalCapabilityIds: CompanyPhysicalCapabilityId[]
}

export type CompanyOperationalCompositionBlockReason =
  | 'CompanyIdentityMismatch'
  | 'FounderIdentityMismatch'
  | 'PhysicalStartupBindingMismatch'
  | 'PhysicalStartupFacilityMissing'

export type CompanyOperationalCompositionResult =
  | { composed: true; aggregate: CompanyOperationalAggregate }
  | { composed: false; reason: CompanyOperationalCompositionBlockReason }

export interface CompanyOperationalCompositionInput {
  identity: RegisteredBusinessIdentity
  runtimeCompany: CompanyState
  ownershipEconomy: OwnershipEconomyState
  /** Existing physical fact; never materialized by this composition system. */
  physicalStartupBinding?: CompanyPhysicalStartupBinding
}

const cloneEmployee = (employee: EmployeeState): EmployeeState => ({ ...employee })
const cloneVehicle = (vehicle: OwnedVehicleState): OwnedVehicleState => ({ ...vehicle })
const cloneHolding = (holding: EquityHoldingState): EquityHoldingState => ({ ...holding })

const bindingMatchesIdentity = (
  binding: CompanyPhysicalStartupBinding,
  identity: RegisteredBusinessIdentity,
): boolean => binding.companyId === identity.companyId &&
  binding.operatingAreaId === identity.operatingAreaId &&
  binding.hqDepartmentId === 'Core'

/**
 * Project only source HQ facts that are actually present. In particular, this read
 * model deliberately does not call normalizeHQProgression(), because normalization
 * can supply the legacy Core default and therefore must not be used as evidence that
 * a legitimate physical startup was materialized.
 */
const projectConstructedHqDepartmentIds = (company: CompanyState): HQDepartmentId[] => {
  const projected: HQDepartmentId[] = []
  for (const departmentId of company.hq.constructedDepartments) {
    if ((departmentId === 'Core' || departmentId === 'Maintenance') && !projected.includes(departmentId)) {
      projected.push(departmentId)
    }
  }
  return projected
}

/**
 * Compose one truthful operational view from existing single-writer authorities.
 * No source state is mutated and no missing authority is synthesized.
 */
export const composeCompanyOperationalAggregate = (
  input: CompanyOperationalCompositionInput,
): CompanyOperationalCompositionResult => {
  const { identity, runtimeCompany, ownershipEconomy, physicalStartupBinding } = input

  if (
    ownershipEconomy.companyId !== identity.companyId ||
    ownershipEconomy.equity.companyId !== identity.companyId
  ) {
    return { composed: false, reason: 'CompanyIdentityMismatch' }
  }

  // This compares founder-history identity only; it does not infer or grant ownership.
  if (ownershipEconomy.equity.founderActorId !== identity.founderActorId) {
    return { composed: false, reason: 'FounderIdentityMismatch' }
  }

  if (physicalStartupBinding && !bindingMatchesIdentity(physicalStartupBinding, identity)) {
    return { composed: false, reason: 'PhysicalStartupBindingMismatch' }
  }

  const constructedHqDepartmentIds = projectConstructedHqDepartmentIds(runtimeCompany)
  if (
    physicalStartupBinding &&
    !constructedHqDepartmentIds.includes(physicalStartupBinding.hqDepartmentId)
  ) {
    return { composed: false, reason: 'PhysicalStartupFacilityMissing' }
  }

  const membership: CompanyOperationalMembershipRecord[] = ownershipEconomy.equity.activeMemberActorIds.map(actorId => ({
    companyId: identity.companyId,
    actorId,
    relationship: 'InternalMember',
  }))

  const physicalCapabilityIds: CompanyPhysicalCapabilityId[] = []
  if (physicalStartupBinding && identity.authorizationStatus === 'Authorized') {
    physicalCapabilityIds.push('CoreOperations')
    if (constructedHqDepartmentIds.includes('Maintenance')) {
      physicalCapabilityIds.push('MaintenanceWorkshop')
    }
  }

  return {
    composed: true,
    aggregate: {
      companyId: identity.companyId,
      identity: { ...identity },
      membership,
      employment: {
        employees: runtimeCompany.employees.map(cloneEmployee),
      },
      ownershipInvestment: {
        holdings: ownershipEconomy.equity.holdings.map(cloneHolding),
      },
      treasury: {
        companyMoney: runtimeCompany.money,
      },
      physicalFacilities: {
        companyId: identity.companyId,
        operatingAreaId: identity.operatingAreaId,
        authorizationStatus: identity.authorizationStatus,
        startupBinding: physicalStartupBinding ? { ...physicalStartupBinding } : null,
        constructedHqDepartmentIds,
      },
      fleet: {
        vehicles: runtimeCompany.vehicles.map(cloneVehicle),
      },
      physicalCapabilityIds,
    },
  }
}
