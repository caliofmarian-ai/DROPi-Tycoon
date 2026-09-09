import { describe, expect, it } from 'vitest'
import type { PlayerWorkActivityId } from '../src/capabilities/playerEconomyWorkAccess'
import {
  bindProducerLogisticsOpportunityToCitywideDelivery,
  createCitywideDeliverySelectionHistoryRecord,
  selectCitywideDeliveryOpportunity,
  type CitywideDeliveryDistributionAuthorityPort,
  type CitywideDeliveryOpportunity,
  type CitywideDeliverySelectionHistoryRecord,
  type CitywideRouteClass,
} from '../src/missions/citywideDeliveryDistribution'
import type { DeliveryMission } from '../src/systems/urbanLogistics'
import type { LogisticsOpportunity } from '../src/trade/regionalSupplyDemand'

const WORLD_ID = 'world:braila:test'

const deliveryMission = (input: {
  key: string
  originEndpointId: string
  destinationEndpointId: string
  transport?: 'walking' | 'bicycle' | 'car' | 'van'
}): DeliveryMission => {
  const orderId = `order:${input.key}`
  const parcelId = `parcel:${input.key}`
  return {
    missionId: `delivery:${input.key}`,
    orderId,
    parcels: [{ parcelId, orderId, cargoUnits: 1 }],
    legs: [{
      legId: `leg:${input.key}`,
      mode: 'terrestrial',
      carrier: { kind: 'player', playerId: 'hero:test' },
      transport: input.transport ?? 'walking',
      from: input.originEndpointId,
      to: input.destinationEndpointId,
      parcelIds: [parcelId],
    }],
  }
}

const routeClassFor = (originDistrictId: string, destinationDistrictId: string): CitywideRouteClass => {
  if (originDistrictId === destinationDistrictId) return 'local'
  const adjacent = new Set(['district:core->district:north', 'district:north->district:core'])
  return adjacent.has(`${originDistrictId}->${destinationDistrictId}`) ? 'adjacent-district' : 'cross-city'
}

const candidate = (input: {
  key: string
  originDistrictId: string
  destinationDistrictId: string
  originAreaId?: string
  destinationAreaId?: string
  authorityPriority?: number
  activityIds?: readonly PlayerWorkActivityId[]
  transport?: 'walking' | 'bicycle' | 'car' | 'van'
}): { opportunity: CitywideDeliveryOpportunity; mission: DeliveryMission } => {
  const originEndpointId = `node:${input.key}:origin`
  const destinationEndpointId = `node:${input.key}:destination`
  const mission = deliveryMission({
    key: input.key,
    originEndpointId,
    destinationEndpointId,
    transport: input.transport,
  })
  return {
    mission,
    opportunity: {
      opportunityId: `opportunity:${input.key}`,
      causeRef: `cause:${input.key}`,
      worldInstanceId: WORLD_ID,
      delivery: {
        deliveryMissionId: mission.missionId,
        orderId: mission.orderId,
        parcelIds: mission.parcels.map(parcel => parcel.parcelId),
      },
      origin: {
        endpointId: originEndpointId,
        districtId: input.originDistrictId,
        ...(input.originAreaId ? { areaId: input.originAreaId } : {}),
      },
      destination: {
        endpointId: destinationEndpointId,
        districtId: input.destinationDistrictId,
        ...(input.destinationAreaId ? { areaId: input.destinationAreaId } : {}),
      },
      authorityPriority: input.authorityPriority ?? 1,
      compatibleWorkActivityIds: input.activityIds ?? ['walking-light-document-delivery'],
    },
  }
}

const authority = (input: {
  missions: readonly DeliveryMission[]
  eligibleActivities?: readonly PlayerWorkActivityId[]
  routeOverride?: CitywideDeliveryDistributionAuthorityPort['classifyRoute']
}): CitywideDeliveryDistributionAuthorityPort => {
  const missions = new Map(input.missions.map(mission => [mission.missionId, mission]))
  const orders = new Set(input.missions.map(mission => mission.orderId))
  const eligibleActivities = new Set(input.eligibleActivities ?? ['walking-light-document-delivery'])
  return {
    hasOrder: orderId => orders.has(orderId),
    resolveDeliveryMission: missionId => missions.get(missionId),
    classifyRoute: input.routeOverride ?? (spatial =>
      routeClassFor(spatial.origin.districtId, spatial.destination.districtId)),
    isWorkActivityEligible: activityId => eligibleActivities.has(activityId),
  }
}

const selected = (result: ReturnType<typeof selectCitywideDeliveryOpportunity>) => {
  expect(result.status).toBe('selected')
  if (result.status !== 'selected') throw new Error('Expected selected opportunity')
  return result.selection
}

describe('citywide delivery distribution contract', () => {
  it('selects only exact authoritative order / DeliveryMission / parcel identities', () => {
    const valid = candidate({
      key: 'valid',
      originDistrictId: 'district:core',
      destinationDistrictId: 'district:core',
    })
    const wrongParcel: CitywideDeliveryOpportunity = {
      ...valid.opportunity,
      opportunityId: 'opportunity:wrong-parcel',
      causeRef: 'cause:wrong-parcel',
      delivery: { ...valid.opportunity.delivery, parcelIds: ['parcel:not-authoritative'] },
    }

    const result = selectCitywideDeliveryOpportunity({
      opportunities: [wrongParcel, valid.opportunity],
      authority: authority({ missions: [valid.mission] }),
    })

    expect(selected(result).opportunity.opportunityId).toBe(valid.opportunity.opportunityId)
    expect(result.evaluations.find(item => item.opportunityId === wrongParcel.opportunityId)?.rejectionCodes)
      .toContain('delivery-reference-mismatch')
  })

  it('cannot relabel a real DeliveryMission into fictional spatial endpoints', () => {
    const real = candidate({
      key: 'endpoint-binding',
      originDistrictId: 'district:core',
      destinationDistrictId: 'district:north',
    })
    const relabelled: CitywideDeliveryOpportunity = {
      ...real.opportunity,
      opportunityId: 'opportunity:endpoint-relabelled',
      causeRef: 'cause:endpoint-relabelled',
      origin: { endpointId: 'node:not-the-real-origin', districtId: 'district:south' },
    }

    const result = selectCitywideDeliveryOpportunity({
      opportunities: [relabelled],
      authority: authority({ missions: [real.mission] }),
    })

    expect(result.status).toBe('none')
    expect(result.evaluations[0]?.rejectionCodes).toContain('delivery-endpoint-mismatch')
  })

  it('fails closed when governed spatial classification is unavailable', () => {
    const local = candidate({
      key: 'unclassified',
      originDistrictId: 'district:core',
      destinationDistrictId: 'district:north',
    })
    const result = selectCitywideDeliveryOpportunity({
      opportunities: [local.opportunity],
      authority: authority({ missions: [local.mission], routeOverride: () => undefined }),
    })

    expect(result.status).toBe('none')
    expect(result.evaluations[0]?.rejectionCodes).toContain('route-unclassified')
  })

  it('uses read-only work-access eligibility and never infers transport permission', () => {
    const bicycle = candidate({
      key: 'bicycle',
      originDistrictId: 'district:core',
      destinationDistrictId: 'district:north',
      activityIds: ['bicycle-light-parcel-delivery'],
      transport: 'bicycle',
    })

    const blocked = selectCitywideDeliveryOpportunity({
      opportunities: [bicycle.opportunity],
      authority: authority({ missions: [bicycle.mission], eligibleActivities: ['walking-light-document-delivery'] }),
    })
    expect(blocked.status).toBe('none')
    expect(blocked.evaluations[0]?.rejectionCodes).toContain('work-access-ineligible')

    const allowed = selectCitywideDeliveryOpportunity({
      opportunities: [bicycle.opportunity],
      authority: authority({ missions: [bicycle.mission], eligibleActivities: ['bicycle-light-parcel-delivery'] }),
    })
    expect(selected(allowed).eligibleWorkActivityIds).toEqual(['bicycle-light-parcel-delivery'])
  })

  it('excludes already active or reserved work by authoritative stable refs', () => {
    const a = candidate({ key: 'a', originDistrictId: 'district:core', destinationDistrictId: 'district:core' })
    const b = candidate({ key: 'b', originDistrictId: 'district:core', destinationDistrictId: 'district:north' })
    const auth = authority({ missions: [a.mission, b.mission] })

    const blockedA = selectCitywideDeliveryOpportunity({
      opportunities: [a.opportunity, b.opportunity],
      exclusion: { activeDeliveryMissionIds: [a.mission.missionId] },
      authority: auth,
    })
    expect(selected(blockedA).opportunity.opportunityId).toBe(b.opportunity.opportunityId)
    expect(blockedA.evaluations.find(item => item.opportunityId === a.opportunity.opportunityId)?.rejectionCodes)
      .toContain('already-active-or-reserved')

    const blockedBoth = selectCitywideDeliveryOpportunity({
      opportunities: [a.opportunity, b.opportunity],
      exclusion: {
        activeDeliveryMissionIds: [a.mission.missionId],
        reservedOrderIds: [b.mission.orderId],
      },
      authority: auth,
    })
    expect(blockedBoth.status).toBe('none')
  })

  it('preserves higher real causal priority instead of forcing geographic variety', () => {
    const high = candidate({
      key: 'high',
      originDistrictId: 'district:core',
      destinationDistrictId: 'district:core',
      authorityPriority: 2,
    })
    const outer = candidate({
      key: 'outer',
      originDistrictId: 'district:south',
      destinationDistrictId: 'district:east',
      authorityPriority: 1,
    })
    const auth = authority({ missions: [high.mission, outer.mission] })
    const first = selected(selectCitywideDeliveryOpportunity({ opportunities: [high.opportunity, outer.opportunity], authority: auth }))
    const history = [createCitywideDeliverySelectionHistoryRecord(first, 0)]

    const second = selected(selectCitywideDeliveryOpportunity({
      opportunities: [outer.opportunity, high.opportunity],
      history,
      authority: auth,
    }))

    expect(first.opportunity.opportunityId).toBe(high.opportunity.opportunityId)
    expect(second.opportunity.opportunityId).toBe(high.opportunity.opportunityId)
  })

  it('rotates equally authoritative work through local, adjacent and cross-city surfaces without quotas', () => {
    const local = candidate({
      key: 'a-local',
      originDistrictId: 'district:core',
      destinationDistrictId: 'district:core',
      originAreaId: 'area:hq',
      destinationAreaId: 'area:commerce',
    })
    const adjacent = candidate({
      key: 'b-adjacent',
      originDistrictId: 'district:core',
      destinationDistrictId: 'district:north',
      originAreaId: 'area:station',
      destinationAreaId: 'area:north-residential',
    })
    const crossCity = candidate({
      key: 'c-cross',
      originDistrictId: 'district:south',
      destinationDistrictId: 'district:east',
      originAreaId: 'area:south-industrial',
      destinationAreaId: 'area:east-residential',
    })
    const opportunities = [local.opportunity, adjacent.opportunity, crossCity.opportunity]
    const auth = authority({ missions: [local.mission, adjacent.mission, crossCity.mission] })
    const history: CitywideDeliverySelectionHistoryRecord[] = []
    const selectedIds: string[] = []
    const selectedClasses: CitywideRouteClass[] = []

    for (let ordinal = 0; ordinal < 3; ordinal += 1) {
      const selection = selected(selectCitywideDeliveryOpportunity({ opportunities, history, authority: auth }))
      selectedIds.push(selection.opportunity.opportunityId)
      selectedClasses.push(selection.routeClass)
      history.push(createCitywideDeliverySelectionHistoryRecord(selection, ordinal))
    }

    expect(new Set(selectedIds).size).toBe(3)
    expect(new Set(selectedClasses)).toEqual(new Set<CitywideRouteClass>(['local', 'adjacent-district', 'cross-city']))
    expect(history.map(record => record.destinationDistrictId)).toContain('district:east')
    expect(history.map(record => record.destinationDistrictId)).toContain('district:north')
  })

  it('is replay-safe and independent of candidate input ordering', () => {
    const a = candidate({ key: 'order-a', originDistrictId: 'district:core', destinationDistrictId: 'district:core' })
    const b = candidate({ key: 'order-b', originDistrictId: 'district:south', destinationDistrictId: 'district:east' })
    const auth = authority({ missions: [a.mission, b.mission] })
    const beforeA = structuredClone(a.opportunity)
    const beforeB = structuredClone(b.opportunity)

    const first = selectCitywideDeliveryOpportunity({ opportunities: [a.opportunity, b.opportunity], authority: auth })
    const second = selectCitywideDeliveryOpportunity({ opportunities: [b.opportunity, a.opportunity], authority: auth })

    expect(first).toEqual(second)
    expect(a.opportunity).toEqual(beforeA)
    expect(b.opportunity).toEqual(beforeB)
  })

  it('rejects duplicate candidate identities instead of materializing the same opportunity twice', () => {
    const a = candidate({ key: 'duplicate', originDistrictId: 'district:core', destinationDistrictId: 'district:core' })
    const duplicate: CitywideDeliveryOpportunity = structuredClone(a.opportunity)
    const result = selectCitywideDeliveryOpportunity({
      opportunities: [a.opportunity, duplicate],
      authority: authority({ missions: [a.mission] }),
    })

    expect(result.status).toBe('none')
    expect(result.evaluations.every(item => item.rejectionCodes.includes('duplicate-opportunity-id'))).toBe(true)
  })

  it('fails invalid history closed rather than losing replay determinism', () => {
    const a = candidate({ key: 'history', originDistrictId: 'district:core', destinationDistrictId: 'district:core' })
    const selection = selected(selectCitywideDeliveryOpportunity({
      opportunities: [a.opportunity],
      authority: authority({ missions: [a.mission] }),
    }))
    const record = createCitywideDeliverySelectionHistoryRecord(selection, 0)
    const invalid = [{ ...record }, { ...record, selectionId: `${record.selectionId}:copy` }]

    const result = selectCitywideDeliveryOpportunity({
      opportunities: [a.opportunity],
      history: invalid,
      authority: authority({ missions: [a.mission] }),
    })
    expect(result).toEqual({ status: 'none', reason: 'invalid-history', evaluations: [] })
  })

  it('binds DT-07 producer opportunity identity and real demand pressure without a DT-09 multiplier', () => {
    const mission = deliveryMission({
      key: 'producer',
      originEndpointId: 'producer:foundry-source',
      destinationEndpointId: 'merchant:destination',
      transport: 'van',
    })
    const producerOpportunity: LogisticsOpportunity = {
      opportunityId: 'opportunity:producer:real',
      supplyId: 'supply:producer:real',
      demandId: 'demand:merchant:real',
      worldInstanceId: WORLD_ID,
      productId: 'product:paper-packaging',
      sourceNodeId: 'producer:foundry-source',
      destinationNodeId: 'merchant:destination',
      quantity: 2,
      demandPressure: 0.75,
      economicValueSignal: 1.5,
    }

    const bound = bindProducerLogisticsOpportunityToCitywideDelivery({
      opportunity: producerOpportunity,
      delivery: {
        deliveryMissionId: mission.missionId,
        orderId: mission.orderId,
        parcelIds: mission.parcels.map(parcel => parcel.parcelId),
      },
      origin: { endpointId: producerOpportunity.sourceNodeId, districtId: 'district:south', areaId: 'area:industrial' },
      destination: { endpointId: producerOpportunity.destinationNodeId, districtId: 'district:core', areaId: 'area:commerce' },
      compatibleWorkActivityIds: ['delivery-van-light-parcel-delivery'],
    })

    expect(bound.opportunityId).toBe(producerOpportunity.opportunityId)
    expect(bound.causeRef).toBe(producerOpportunity.opportunityId)
    expect(bound.authorityPriority).toBe(producerOpportunity.demandPressure)
    expect(bound.origin.endpointId).toBe(producerOpportunity.sourceNodeId)
    expect(bound.destination.endpointId).toBe(producerOpportunity.destinationNodeId)
    expect(() => bindProducerLogisticsOpportunityToCitywideDelivery({
      opportunity: producerOpportunity,
      delivery: bound.delivery,
      origin: { endpointId: 'producer:not-authoritative', districtId: 'district:south' },
      destination: bound.destination,
      compatibleWorkActivityIds: ['delivery-van-light-parcel-delivery'],
    })).toThrow('authoritative source node')
  })

  it('does not mutate or persist external authority while creating an inspectable history record', () => {
    const a = candidate({ key: 'history-record', originDistrictId: 'district:core', destinationDistrictId: 'district:north' })
    const selection = selected(selectCitywideDeliveryOpportunity({
      opportunities: [a.opportunity],
      authority: authority({ missions: [a.mission] }),
    }))
    const before = structuredClone(selection)
    const record = createCitywideDeliverySelectionHistoryRecord(selection, 7)

    expect(record).toMatchObject({
      selectionOrdinal: 7,
      opportunityId: a.opportunity.opportunityId,
      causeRef: a.opportunity.causeRef,
      deliveryMissionId: a.mission.missionId,
      orderId: a.mission.orderId,
      routeClass: 'adjacent-district',
    })
    expect(selection).toEqual(before)
    expect(() => createCitywideDeliverySelectionHistoryRecord(selection, -1)).toThrow('selection ordinal')
  })
})
