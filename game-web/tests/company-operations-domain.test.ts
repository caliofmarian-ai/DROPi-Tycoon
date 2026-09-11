import { describe, expect, it } from 'vitest'
import { createInitialCompanyState } from '../src/state/gameState'
import {
  LOCAL_PLAYER_ACTOR_ID,
  LOCAL_PLAYER_COMPANY_ID,
  createInitialOwnershipEconomyState,
} from '../src/systems/ownershipEconomySystem'
import { composeCompanyOperationalAggregate } from '../src/systems/companyOperationsSystem'
import type { CompanyPhysicalStartupBinding } from '../src/systems/companyOperationsSystem'
import type { RegisteredBusinessIdentity } from '../src/types/business'

const AREA_ID = 'area:local:test'

const companyIdentity = (
  authorizationStatus: RegisteredBusinessIdentity['authorizationStatus'] = 'Authorized',
): RegisteredBusinessIdentity => ({
  companyId: LOCAL_PLAYER_COMPANY_ID,
  founderActorId: LOCAL_PLAYER_ACTOR_ID,
  displayName: 'Local Courier Company',
  serviceModelId: 'LocalCourier',
  operatingAreaId: AREA_ID,
  authorizationStatus,
  foundedAtSequence: 1,
})

const existingCoreBinding = (): CompanyPhysicalStartupBinding => ({
  companyId: LOCAL_PLAYER_COMPANY_ID,
  operatingAreaId: AREA_ID,
  hqDepartmentId: 'Core',
})

describe('DT-20 company operational aggregate contract', () => {
  it('does not turn a pending registration plus legacy Core state into an operational physical startup', () => {
    const identity = companyIdentity('Pending')
    const result = composeCompanyOperationalAggregate({
      identity,
      runtimeCompany: createInitialCompanyState(),
      ownershipEconomy: createInitialOwnershipEconomyState(),
    })

    expect(result.composed).toBe(true)
    if (!result.composed) throw new Error('Expected company composition')
    expect(result.aggregate.physicalFacilities.startupBinding).toBeNull()
    expect(result.aggregate.physicalFacilities.constructedHqDepartmentIds).toContain('Core')
    expect(result.aggregate.physicalCapabilityIds).toEqual([])
  })

  it('consumes an explicit existing Core binding without materializing physical state from authorization', () => {
    const identity = companyIdentity('Authorized')
    const binding = existingCoreBinding()
    const first = composeCompanyOperationalAggregate({
      identity,
      runtimeCompany: createInitialCompanyState(),
      ownershipEconomy: createInitialOwnershipEconomyState(),
      physicalStartupBinding: binding,
    })
    const repeated = composeCompanyOperationalAggregate({
      identity,
      runtimeCompany: createInitialCompanyState(),
      ownershipEconomy: createInitialOwnershipEconomyState(),
      physicalStartupBinding: binding,
    })

    expect(first).toEqual(repeated)
    expect(first.composed).toBe(true)
    if (!first.composed) throw new Error('Expected company composition')
    expect(first.aggregate.physicalFacilities.startupBinding).toEqual(binding)
    expect(first.aggregate.physicalCapabilityIds).toEqual(['CoreOperations'])
    expect(first.aggregate.fleet.vehicles).toEqual([])
  })

  it('fails closed when a startup binding claims a Core facility absent from source physical state', () => {
    const company = createInitialCompanyState()
    company.hq.constructedDepartments = []

    const result = composeCompanyOperationalAggregate({
      identity: companyIdentity('Authorized'),
      runtimeCompany: company,
      ownershipEconomy: createInitialOwnershipEconomyState(),
      physicalStartupBinding: existingCoreBinding(),
    })

    expect(result).toEqual({ composed: false, reason: 'PhysicalStartupFacilityMissing' })
  })

  it('keeps an existing physical footprint after authorization suspension while disabling operational capabilities', () => {
    const binding = existingCoreBinding()
    const result = composeCompanyOperationalAggregate({
      identity: companyIdentity('Suspended'),
      runtimeCompany: createInitialCompanyState(),
      ownershipEconomy: createInitialOwnershipEconomyState(),
      physicalStartupBinding: binding,
    })

    expect(result.composed).toBe(true)
    if (!result.composed) throw new Error('Expected suspended company composition')
    expect(result.aggregate.physicalFacilities.startupBinding).toEqual(binding)
    expect(result.aggregate.physicalFacilities.authorizationStatus).toBe('Suspended')
    expect(result.aggregate.physicalCapabilityIds).toEqual([])
  })

  it('keeps membership, employment, ownership/investment, treasury, fleet and physical capability distinct', () => {
    const identity = companyIdentity()
    const company = createInitialCompanyState()
    company.money = 1_250
    company.employees = [{
      employeeId: 'employee:local:000001',
      name: 'Courier One',
      role: 'Courier',
      status: 'Active',
      salaryPerCycle: 25,
    }]
    company.vehicles = [{
      vehicleId: 'vehicle:local:000001',
      typeId: 'Bicycle',
    }]
    company.hq.constructedDepartments = ['Core', 'Maintenance']

    const ownership = createInitialOwnershipEconomyState()
    const secondMember = 'actor:local:000002'
    const externalInvestor = 'actor:local:000003'
    ownership.equity.activeMemberActorIds = [LOCAL_PLAYER_ACTOR_ID, secondMember]
    ownership.equity.holdings = [{
      actorId: externalInvestor,
      poolId: 'ExternalMarket',
      units: 100,
    }]

    const result = composeCompanyOperationalAggregate({
      identity,
      runtimeCompany: company,
      ownershipEconomy: ownership,
      physicalStartupBinding: existingCoreBinding(),
    })

    expect(result.composed).toBe(true)
    if (!result.composed) throw new Error('Expected company composition')

    expect(result.aggregate.membership).toEqual([
      { companyId: LOCAL_PLAYER_COMPANY_ID, actorId: LOCAL_PLAYER_ACTOR_ID, relationship: 'InternalMember' },
      { companyId: LOCAL_PLAYER_COMPANY_ID, actorId: secondMember, relationship: 'InternalMember' },
    ])
    expect(result.aggregate.employment.employees.map(employee => employee.employeeId)).toEqual(['employee:local:000001'])
    expect(result.aggregate.ownershipInvestment.holdings).toEqual([
      { actorId: externalInvestor, poolId: 'ExternalMarket', units: 100 },
    ])
    expect(result.aggregate.treasury.companyMoney).toBe(1_250)
    expect(result.aggregate.fleet.vehicles.map(vehicle => vehicle.vehicleId)).toEqual(['vehicle:local:000001'])
    expect(result.aggregate.physicalCapabilityIds).toEqual(['CoreOperations', 'MaintenanceWorkshop'])

    expect(result.aggregate.membership.some(member => member.actorId === externalInvestor)).toBe(false)
    expect(result.aggregate.ownershipInvestment.holdings.some(holding => holding.actorId === LOCAL_PLAYER_ACTOR_ID)).toBe(false)
  })

  it('fails closed when business identity and ownership authority point at different companies', () => {
    const ownership = createInitialOwnershipEconomyState()
    ownership.companyId = 'company:local:999999'

    const result = composeCompanyOperationalAggregate({
      identity: companyIdentity(),
      runtimeCompany: createInitialCompanyState(),
      ownershipEconomy: ownership,
    })

    expect(result).toEqual({ composed: false, reason: 'CompanyIdentityMismatch' })
  })

  it('fails closed when founder history disagrees across identity records without treating founder as owner', () => {
    const ownership = createInitialOwnershipEconomyState()
    ownership.equity.founderActorId = 'actor:local:999999'

    const result = composeCompanyOperationalAggregate({
      identity: companyIdentity(),
      runtimeCompany: createInitialCompanyState(),
      ownershipEconomy: ownership,
    })

    expect(result).toEqual({ composed: false, reason: 'FounderIdentityMismatch' })
  })

  it('rejects a physical startup binding copied from another company or operating area', () => {
    const result = composeCompanyOperationalAggregate({
      identity: companyIdentity(),
      runtimeCompany: createInitialCompanyState(),
      ownershipEconomy: createInitialOwnershipEconomyState(),
      physicalStartupBinding: {
        companyId: LOCAL_PLAYER_COMPANY_ID,
        operatingAreaId: 'area:local:other',
        hqDepartmentId: 'Core',
      },
    })

    expect(result).toEqual({ composed: false, reason: 'PhysicalStartupBindingMismatch' })
  })
})
