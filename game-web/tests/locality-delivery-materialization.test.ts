import { describe, expect, it } from 'vitest'
import type { PlayerWorkActivityId } from '../src/capabilities/playerEconomyWorkAccess'
import {
  materializeDeliveryWorkForCurrentLocality,
  requestCanonicalDt03DeliverySettlement,
  type CanonicalDt03DeliveryEvidence,
  type CanonicalDt03SettledInteraction,
  type CanonicalDt03SourceOrder,
  type LocalityDeliveryMaterializationResult,
  type LocalityDeliveryWorkCandidate,
} from '../src/missions/localityDeliveryMaterialization'
import { applyMissionEvent, createMissionRuntimeState, type MissionDeliveryResolver } from '../src/missions/missionEngine'
import {
  BRAILA_FIRST_HOUR_AUTHORED_REFS,
  BRAILA_FIRST_HOUR_MISSION_IDS,
} from '../src/missions/brailaFirstHourAuthoredRegistry'
import type {
  MissionDefinition,
  MissionDeliveryReference,
  MissionTransitionResult,
  MissionWorldFacts,
} from '../src/missions/missionModel'
import {
  BRAILA_FIRST_HOUR_ROLE_CHARACTER_REFS,
  FIRST_HOUR_STORY_ROLE_IDS,
  FIRST_HOUR_STORY_TRIGGER_IDS,
  type FirstHourStoryRoleContext,
} from '../src/narrative/firstHourStoryRuntimeHandoff'
import type { EconomicNodeCityEndpointRef, EconomicNodeLocation } from '../src/production/production'
import type { DeliveryMission } from '../src/systems/urbanLogistics'
import {
  bindLogisticsOpportunityToCitywideEndpoints,
  createCitywideEconomicEndpointAuthority,
  type CitywideEconomicEndpointAuthority,
  type GeographicallyBoundLogisticsOpportunity,
} from '../src/trade/citywideEconomicEndpoints'
import type { DemandRequirement, LogisticsOpportunity, SupplyOffer } from '../src/trade/regionalSupplyDemand'
import type { CitywideDeliveryDistributionAuthorityPort } from '../src/missions/citywideDeliveryDistribution'

const WORLD_ID = 'world:locality-materialization:test'
const CHECKPOINT = 'checkpoint:locality-materialization:v2'
const BRAILA_ID = 'locality:ro:braila'
const PORTABLE_FIXTURE_ID = 'locality:test:portable'

const endpointRef = (
  localityId: string,
  key: string,
  role: 'pickup' | 'delivery',
  districtId: string,
): EconomicNodeCityEndpointRef => ({
  localityId,
  sourceCheckpoint: CHECKPOINT,
  worldEndpointId: `world-endpoint:${key}`,
  role,
  districtId,
  areaId: `area:${key}`,
  locationRef: `location:${key}`,
  roadRef: `road:${key}`,
})

const location = (localityId: string, cityEndpoint: EconomicNodeCityEndpointRef): EconomicNodeLocation => ({
  worldInstanceId: WORLD_ID,
  countryId: localityId === BRAILA_ID ? 'country:ro' : 'country:test',
  localityId,
  cityEndpoint,
})

const realLocalCause = (input: {
  localityId: string
  key: string
  demandPressure?: number
  originDistrictId?: string
  destinationDistrictId?: string
}): { bound: GeographicallyBoundLogisticsOpportunity; authority: CitywideEconomicEndpointAuthority } => {
  const origin = endpointRef(input.localityId, `${input.key}:origin`, 'pickup', input.originDistrictId ?? 'district:local')
  const destination = endpointRef(input.localityId, `${input.key}:destination`, 'delivery', input.destinationDistrictId ?? 'district:local')
  const sourceNodeId = `node:${input.key}:origin`
  const destinationNodeId = `node:${input.key}:destination`
  const supply: SupplyOffer = {
    supplyId: `supply:${input.key}`,
    sourceNodeId,
    location: location(input.localityId, origin),
    productId: 'product:paper-packaging',
    availableQuantity: 2,
  }
  const demand: DemandRequirement = {
    demandId: `demand:${input.key}`,
    destinationNodeId,
    location: location(input.localityId, destination),
    productId: 'product:paper-packaging',
    targetStockUnits: 2,
    currentStockUnits: 0,
    requiredQuantity: 2,
  }
  const opportunity: LogisticsOpportunity = {
    opportunityId: `opportunity:${input.key}`,
    supplyId: supply.supplyId,
    demandId: demand.demandId,
    worldInstanceId: WORLD_ID,
    productId: 'product:paper-packaging',
    sourceNodeId,
    destinationNodeId,
    quantity: 1,
    demandPressure: input.demandPressure ?? 1,
    economicValueSignal: 1,
  }
  const authority = createCitywideEconomicEndpointAuthority({
    localityId: input.localityId,
    sourceCheckpoint: CHECKPOINT,
    endpoints: [origin, destination],
  })
  return {
    authority,
    bound: bindLogisticsOpportunityToCitywideEndpoints({ opportunity, supply, demand, authority }),
  }
}

const deliveryFor = (bound: GeographicallyBoundLogisticsOpportunity, key: string): DeliveryMission => {
  const orderId = `order:${key}`
  const parcelId = `parcel:${key}`
  return {
    missionId: `delivery:${key}`,
    orderId,
    parcels: [{ parcelId, orderId, cargoUnits: 1 }],
    legs: [{
      legId: `leg:${key}`,
      mode: 'terrestrial',
      carrier: { kind: 'player', playerId: 'player:test' },
      transport: 'walking',
      from: bound.opportunity.sourceNodeId,
      to: bound.opportunity.destinationNodeId,
      parcelIds: [parcelId],
    }],
  }
}

const deliveryRef = (mission: DeliveryMission): MissionDeliveryReference => ({
  deliveryMissionId: mission.missionId,
  orderId: mission.orderId,
  parcelIds: mission.parcels.map(parcel => parcel.parcelId),
})

const definitionFor = (input: {
  missionId: string
  delivery: MissionDeliveryReference
  opportunityId: string
  settlementRef: string
  authoredRef?: string
  extraSettlementRef?: string
}): MissionDefinition => ({
  missionId: input.missionId,
  category: input.authoredRef ? 'Employer' : 'ProducerSupplyChain',
  source: input.authoredRef
    ? { kind: 'Authored', authoredRef: input.authoredRef }
    : { kind: 'Systemic', causeRef: input.opportunityId },
  label: `Delivery ${input.missionId}`,
  prerequisites: [],
  availability: 'Prerequisites',
  startStageId: 'pickup',
  stages: [
    {
      stageId: 'pickup', label: 'Pickup',
      objectives: [{
        objectiveId: `${input.missionId}:pickup`, kind: 'delivery', delivery: input.delivery,
        status: 'PickedUp', label: 'Pick up authoritative cargo',
      }],
      next: { stageId: 'deliver' },
    },
    {
      stageId: 'deliver', label: 'Deliver',
      objectives: [{
        objectiveId: `${input.missionId}:deliver`, kind: 'delivery', delivery: input.delivery,
        status: 'Delivered', label: 'Deliver authoritative cargo',
      }],
    },
  ],
  completionConsequences: [
    { kind: 'EconomicSettlementReference', settlementRef: input.settlementRef },
    ...(input.extraSettlementRef
      ? [{ kind: 'EconomicSettlementReference' as const, settlementRef: input.extraSettlementRef }]
      : []),
  ],
  failurePolicy: { kind: 'Retry', stageId: 'pickup' },
})

const evidenceFor = (kind: 'EmployerService' | 'ProducerLogistics' = 'ProducerLogistics'): CanonicalDt03DeliveryEvidence => ({
  servedEntityId: kind === 'EmployerService' ? 'entity:fixture:employer' : 'entity:fixture:recipient',
  sourceKind: kind,
})

const candidateFor = (input: {
  bound: GeographicallyBoundLogisticsOpportunity
  delivery: DeliveryMission
  missionId: string
  purpose?: 'starter' | 'normal'
  activityIds?: readonly PlayerWorkActivityId[]
  settlementEvidence?: CanonicalDt03DeliveryEvidence
  storyTriggerId?: typeof FIRST_HOUR_STORY_TRIGGER_IDS.oneSmallThing
  requiredStoryRole?: boolean
}): LocalityDeliveryWorkCandidate => ({
  boundOpportunity: input.bound,
  delivery: deliveryRef(input.delivery),
  missionId: input.missionId,
  purpose: input.purpose ?? 'normal',
  compatibleWorkActivityIds: input.activityIds ?? ['walking-light-document-delivery'],
  settlementEvidence: input.settlementEvidence ?? evidenceFor(),
  ...(input.requiredStoryRole ? { requiredStoryRoles: [FIRST_HOUR_STORY_ROLE_IDS.merchant] } : {}),
  ...(input.storyTriggerId ? { storyTriggerId: input.storyTriggerId } : {}),
})

const brailaStoryContext = (): FirstHourStoryRoleContext => ({
  currentLocalityId: BRAILA_ID,
  bindings: [{
    roleId: FIRST_HOUR_STORY_ROLE_IDS.merchant,
    localityId: BRAILA_ID,
    actorId: 'actor:braila:merchant',
    characterRef: BRAILA_FIRST_HOUR_ROLE_CHARACTER_REFS[FIRST_HOUR_STORY_ROLE_IDS.merchant],
    displayName: 'Mirela Stan',
  }],
})

const distributionAuthority = (
  missionsInput: readonly DeliveryMission[],
  eligibleActivities: readonly PlayerWorkActivityId[] = ['walking-light-document-delivery'],
): CitywideDeliveryDistributionAuthorityPort => {
  const missions = new Map(missionsInput.map(mission => [mission.missionId, mission]))
  const orders = new Set(missionsInput.map(mission => mission.orderId))
  const eligible = new Set(eligibleActivities)
  const resolver: MissionDeliveryResolver = missionId => missions.get(missionId)
  return {
    hasOrder: orderId => orders.has(orderId),
    resolveDeliveryMission: resolver,
    classifyRoute: spatial => spatial.origin.districtId === spatial.destination.districtId ? 'local' : 'cross-city',
    isWorkActivityEligible: activityId => eligible.has(activityId),
  }
}

const facts: MissionWorldFacts = { worldMinute: 0 }

const materialize = (input: {
  localityId: string
  endpointAuthority: CitywideEconomicEndpointAuthority
  candidates: readonly LocalityDeliveryWorkCandidate[]
  definitions: readonly MissionDefinition[]
  deliveries: readonly DeliveryMission[]
  roles?: FirstHourStoryRoleContext
  eligibleActivities?: readonly PlayerWorkActivityId[]
}): LocalityDeliveryMaterializationResult => materializeDeliveryWorkForCurrentLocality({
  currentLocalityId: input.localityId,
  worldInstanceId: WORLD_ID,
  endpointAuthority: input.endpointAuthority,
  candidates: input.candidates,
  distributionAuthority: distributionAuthority(input.deliveries, input.eligibleActivities),
  missionDefinitions: input.definitions,
  missionState: createMissionRuntimeState(input.definitions, facts),
  missionFacts: facts,
  storyRoleContext: input.roles,
})

const completeDelivery = (input: {
  materialized: Extract<LocalityDeliveryMaterializationResult, { status: 'materialized' }>
  definition: MissionDefinition
  delivery: DeliveryMission
}): MissionTransitionResult => {
  const resolver: MissionDeliveryResolver = missionId => missionId === input.delivery.missionId ? input.delivery : undefined
  const pickedUp = applyMissionEvent(
    [input.definition],
    input.materialized.missionState,
    input.definition.missionId,
    {
      eventId: `event:${input.delivery.orderId}:picked-up`,
      kind: 'DeliveryStatus',
      deliveryMissionId: input.delivery.missionId,
      orderId: input.delivery.orderId,
      parcelIds: input.delivery.parcels.map(parcel => parcel.parcelId),
      status: 'PickedUp',
    },
    facts,
    resolver,
  )
  return applyMissionEvent(
    [input.definition],
    pickedUp.state,
    input.definition.missionId,
    {
      eventId: `event:${input.delivery.orderId}:delivered`,
      kind: 'DeliveryStatus',
      deliveryMissionId: input.delivery.missionId,
      orderId: input.delivery.orderId,
      parcelIds: input.delivery.parcels.map(parcel => parcel.parcelId),
      status: 'Delivered',
    },
    facts,
    resolver,
  )
}

const pickedUpOrder = (delivery: DeliveryMission): CanonicalDt03SourceOrder => ({
  orderId: delivery.orderId,
  pickupLocation: 'fixture:pickup',
  destination: 'fixture:delivery',
  status: 'PickedUp',
  acceptRequested: true,
  reward: 0,
  economySettled: false,
})

const acceptedInteraction = (sourceOrder: CanonicalDt03SourceOrder): CanonicalDt03SettledInteraction => ({
  settled: true,
  world: {
    activeOrder: { ...sourceOrder, orderId: `next:${sourceOrder.orderId}`, status: 'Available' },
    player: { currentOrder: '', carryingPackage: false },
  } as unknown as CanonicalDt03SettledInteraction['world'],
})

const portableScenario = (key: string) => {
  const cause = realLocalCause({ localityId: PORTABLE_FIXTURE_ID, key })
  const delivery = deliveryFor(cause.bound, key)
  const definition = definitionFor({
    missionId: `mission:${key}`,
    delivery: deliveryRef(delivery),
    opportunityId: cause.bound.opportunity.opportunityId,
    settlementRef: `settlement-intent:${key}`,
  })
  const evidence = evidenceFor('ProducerLogistics')
  const materialized = materialize({
    localityId: PORTABLE_FIXTURE_ID,
    endpointAuthority: cause.authority,
    candidates: [candidateFor({ bound: cause.bound, delivery, missionId: definition.missionId, settlementEvidence: evidence })],
    definitions: [definition],
    deliveries: [delivery],
  })
  expect(materialized.status).toBe('materialized')
  if (materialized.status !== 'materialized') throw new Error('Fixture did not materialize')
  const completed = completeDelivery({ materialized, definition, delivery })
  return { cause, delivery, definition, evidence, materialized, completed }
}

describe('locality-aware delivery runtime materialization', () => {
  it('materializes Brăila authored starter work without requesting settlement early', () => {
    const cause = realLocalCause({ localityId: BRAILA_ID, key: 'braila-starter' })
    const delivery = deliveryFor(cause.bound, 'braila-starter')
    const definition = definitionFor({
      missionId: BRAILA_FIRST_HOUR_MISSION_IDS.oneSmallThing,
      authoredRef: BRAILA_FIRST_HOUR_AUTHORED_REFS.oneSmallThing,
      delivery: deliveryRef(delivery),
      opportunityId: cause.bound.opportunity.opportunityId,
      settlementRef: 'settlement:braila:first-delivery',
    })
    const result = materialize({
      localityId: BRAILA_ID,
      endpointAuthority: cause.authority,
      candidates: [candidateFor({
        bound: cause.bound,
        delivery,
        missionId: definition.missionId,
        purpose: 'starter',
        settlementEvidence: evidenceFor('EmployerService'),
        requiredStoryRole: true,
        storyTriggerId: FIRST_HOUR_STORY_TRIGGER_IDS.oneSmallThing,
      })],
      definitions: [definition], deliveries: [delivery], roles: brailaStoryContext(),
    })

    expect(result.status).toBe('materialized')
    if (result.status !== 'materialized') return
    expect(result.missionState.missions[result.missionId]?.status).toBe('Active')
    expect(result.settlementBoundary.settlementReference).toBe('settlement:braila:first-delivery')
    expect(result.storyHandoff?.triggerId).toBe(FIRST_HOUR_STORY_TRIGGER_IDS.oneSmallThing)
    expect(result).not.toHaveProperty('settlementRequestRefs')
    expect(result).not.toHaveProperty('status', 'SETTLEMENT_REQUESTED')
  })

  it('isolates locality selection without presenting a fabricated second real-world locality', () => {
    const braila = realLocalCause({ localityId: BRAILA_ID, key: 'foreign-high', demandPressure: 100 })
    const portable = realLocalCause({ localityId: PORTABLE_FIXTURE_ID, key: 'portable-local', demandPressure: 1 })
    const brailaDelivery = deliveryFor(braila.bound, 'foreign-high')
    const portableDelivery = deliveryFor(portable.bound, 'portable-local')
    const brailaDefinition = definitionFor({
      missionId: 'mission:foreign:normal', delivery: deliveryRef(brailaDelivery),
      opportunityId: braila.bound.opportunity.opportunityId, settlementRef: 'settlement:foreign:normal',
    })
    const portableDefinition = definitionFor({
      missionId: 'mission:portable:normal', delivery: deliveryRef(portableDelivery),
      opportunityId: portable.bound.opportunity.opportunityId, settlementRef: 'settlement:portable:normal',
    })
    const result = materialize({
      localityId: PORTABLE_FIXTURE_ID,
      endpointAuthority: portable.authority,
      candidates: [
        candidateFor({ bound: braila.bound, delivery: brailaDelivery, missionId: brailaDefinition.missionId }),
        candidateFor({ bound: portable.bound, delivery: portableDelivery, missionId: portableDefinition.missionId }),
      ],
      definitions: [brailaDefinition, portableDefinition],
      deliveries: [brailaDelivery, portableDelivery],
    })

    expect(result.status).toBe('materialized')
    if (result.status !== 'materialized') return
    expect(result.missionId).toBe(portableDefinition.missionId)
    expect(result.candidateEvaluations.find(item => item.missionId === brailaDefinition.missionId)?.blockers)
      .toContain('locality-mismatch')
  })

  it('fails closed instead of falling back to Brăila when current locality has no local cause', () => {
    const portable = realLocalCause({ localityId: PORTABLE_FIXTURE_ID, key: 'portable-authority' })
    const braila = realLocalCause({ localityId: BRAILA_ID, key: 'braila-only' })
    const delivery = deliveryFor(braila.bound, 'braila-only')
    const definition = definitionFor({
      missionId: 'mission:braila:only', delivery: deliveryRef(delivery),
      opportunityId: braila.bound.opportunity.opportunityId, settlementRef: 'settlement:braila:only',
    })
    const result = materialize({
      localityId: PORTABLE_FIXTURE_ID,
      endpointAuthority: portable.authority,
      candidates: [candidateFor({ bound: braila.bound, delivery, missionId: definition.missionId })],
      definitions: [definition], deliveries: [delivery],
    })
    expect(result).toMatchObject({ status: 'unavailable', reason: 'no-local-opportunities' })
  })

  it('consumes DT-06 work-access verdict and rejects ambiguous payment references', () => {
    const cause = realLocalCause({ localityId: PORTABLE_FIXTURE_ID, key: 'gates' })
    const delivery = deliveryFor(cause.bound, 'gates')
    const definition = definitionFor({
      missionId: 'mission:gates', delivery: deliveryRef(delivery),
      opportunityId: cause.bound.opportunity.opportunityId,
      settlementRef: 'settlement:gates:one', extraSettlementRef: 'settlement:gates:two',
    })
    const result = materialize({
      localityId: PORTABLE_FIXTURE_ID,
      endpointAuthority: cause.authority,
      candidates: [candidateFor({
        bound: cause.bound, delivery, missionId: definition.missionId,
        activityIds: ['delivery-van-light-parcel-delivery'],
      })],
      definitions: [definition], deliveries: [delivery],
      eligibleActivities: ['walking-light-document-delivery'],
    })
    expect(result).toMatchObject({ status: 'unavailable', reason: 'no-materializable-opportunities' })
    expect(result.candidateEvaluations[0]?.blockers).toContain('settlement-reference-ambiguous')
  })

  it('requests canonical #673 settlement only after mission completion and accepted delivery', () => {
    const scenario = portableScenario('canonical-handoff')
    const sourceOrder = pickedUpOrder(scenario.delivery)
    const interaction = acceptedInteraction(sourceOrder)
    const result = requestCanonicalDt03DeliverySettlement({
      boundary: scenario.materialized.settlementBoundary,
      currentLocalityId: PORTABLE_FIXTURE_ID,
      worldInstanceId: WORLD_ID,
      missionState: scenario.completed.state,
      emittedConsequences: scenario.completed.emittedConsequences,
      acceptedDelivery: deliveryRef(scenario.delivery),
      sourceOrder,
      interaction,
      settlementEvidence: scenario.evidence,
    })

    expect(result.status).toBe('SETTLEMENT_REQUESTED')
    if (result.status !== 'SETTLEMENT_REQUESTED') return
    expect(result.settlementRef).toBe(scenario.materialized.settlementBoundary.settlementReference)
    expect(result.missionCompletionReceiptId).toBe(`mission-completion:${scenario.definition.missionId}`)
    expect(result.dt03).toEqual({ sourceOrder, interaction, evidence: scenario.evidence })
    expect(result).not.toHaveProperty('money')
    expect(result).not.toHaveProperty('xp')
    expect(result).not.toHaveProperty('loyalty')
    expect(result).not.toHaveProperty('fragments')
  })

  it('fails closed on locality, mission and payment-evidence mismatch', () => {
    const scenario = portableScenario('identity-fail-closed')
    const sourceOrder = pickedUpOrder(scenario.delivery)
    const interaction = acceptedInteraction(sourceOrder)
    const base = {
      boundary: scenario.materialized.settlementBoundary,
      currentLocalityId: PORTABLE_FIXTURE_ID,
      worldInstanceId: WORLD_ID,
      missionState: scenario.completed.state,
      emittedConsequences: scenario.completed.emittedConsequences,
      acceptedDelivery: deliveryRef(scenario.delivery),
      sourceOrder,
      interaction,
      settlementEvidence: scenario.evidence,
    }

    expect(requestCanonicalDt03DeliverySettlement({ ...base, currentLocalityId: BRAILA_ID }))
      .toMatchObject({ status: 'rejected', reason: 'locality-mismatch' })
    expect(requestCanonicalDt03DeliverySettlement({
      ...base,
      acceptedDelivery: { ...deliveryRef(scenario.delivery), orderId: 'order:wrong' },
    })).toMatchObject({ status: 'rejected', reason: 'mission-mismatch' })
    expect(requestCanonicalDt03DeliverySettlement({
      ...base,
      emittedConsequences: scenario.completed.emittedConsequences.map(intent => ({
        ...intent,
        consequence: intent.consequence.kind === 'EconomicSettlementReference'
          ? { ...intent.consequence, settlementRef: 'settlement:wrong' }
          : intent.consequence,
      })),
    })).toMatchObject({ status: 'rejected', reason: 'payment-evidence-mismatch' })
  })

  it('fails closed on acknowledgement, custody, cargo and canonical evidence mismatch', () => {
    const scenario = portableScenario('evidence-fail-closed')
    const sourceOrder = pickedUpOrder(scenario.delivery)
    const interaction = acceptedInteraction(sourceOrder)
    const boundaryWithAck = {
      ...scenario.materialized.settlementBoundary,
      acknowledgementReceiptId: 'story-ack:expected',
    }
    const base = {
      boundary: boundaryWithAck,
      currentLocalityId: PORTABLE_FIXTURE_ID,
      worldInstanceId: WORLD_ID,
      missionState: scenario.completed.state,
      emittedConsequences: scenario.completed.emittedConsequences,
      acceptedDelivery: deliveryRef(scenario.delivery),
      sourceOrder,
      interaction,
      settlementEvidence: scenario.evidence,
      acknowledgementReceiptId: 'story-ack:expected',
    }

    expect(requestCanonicalDt03DeliverySettlement({ ...base, acknowledgementReceiptId: 'story-ack:wrong' }))
      .toMatchObject({ status: 'rejected', reason: 'acknowledgement-mismatch' })
    expect(requestCanonicalDt03DeliverySettlement({
      ...base,
      sourceOrder: { ...sourceOrder, status: 'Accepted' },
    })).toMatchObject({ status: 'rejected', reason: 'custody-mismatch' })
    expect(requestCanonicalDt03DeliverySettlement({
      ...base,
      interaction: {
        ...interaction,
        world: {
          ...interaction.world,
          player: { ...interaction.world.player, carryingPackage: true },
        },
      },
    })).toMatchObject({ status: 'rejected', reason: 'cargo-mismatch' })
    expect(requestCanonicalDt03DeliverySettlement({
      ...base,
      settlementEvidence: { ...scenario.evidence, servedEntityId: 'entity:fixture:other' },
    })).toMatchObject({ status: 'rejected', reason: 'settlement-evidence-mismatch' })
  })
})
