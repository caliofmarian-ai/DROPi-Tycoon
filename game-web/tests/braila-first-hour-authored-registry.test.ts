import { describe, expect, it } from 'vitest'
import type { DeliveryMission } from '../src/systems/urbanLogistics'
import {
  applyMissionEvent,
  createMissionRuntimeState,
  startMission,
  validateMissionGraph,
} from '../src/missions/missionEngine'
import type {
  MissionDefinition,
  MissionRuntimeState,
  MissionWorldFacts,
} from '../src/missions/missionModel'
import {
  createMissionResumePayload,
  restoreMissionResumePayload,
  validateMissionResumeReferences,
} from '../src/missions/missionResumeContract'
import {
  BRAILA_FIRST_DAY_ARC_ID,
  BRAILA_FIRST_HOUR_AUTHORED_REFS,
  BRAILA_FIRST_HOUR_CAPACITY_CHOICE,
  BRAILA_FIRST_HOUR_FACT_IDS,
  BRAILA_FIRST_HOUR_MISSION_IDS,
  BRAILA_FIRST_HOUR_SIGNALS,
  buildBrailaFirstHourAuthoredMissionRegistry,
  classifyOneSmallThingOutcome,
  type BrailaFirstHourAuthoredBindings,
} from '../src/missions/brailaFirstHourAuthoredRegistry'

const firstDelivery: DeliveryMission = {
  missionId: 'delivery:one-small-thing',
  orderId: 'order:one-small-thing',
  parcels: [{ parcelId: 'parcel:authoritative-business-item', orderId: 'order:one-small-thing', cargoUnits: 1 }],
  legs: [{
    legId: 'leg:one-small-thing',
    mode: 'terrestrial',
    carrier: { kind: 'player', playerId: 'hero:test' },
    transport: 'walking',
    from: 'station-commons:dispatch',
    to: 'braila-commerce:mirela-business',
    parcelIds: ['parcel:authoritative-business-item'],
  }],
}

const householdDelivery: DeliveryMission = {
  missionId: 'delivery:petru-household',
  orderId: 'order:petru-household',
  parcels: [{ parcelId: 'parcel:authoritative-household-item', orderId: 'order:petru-household', cargoUnits: 1 }],
  legs: [{
    legId: 'leg:petru-household',
    mode: 'terrestrial',
    carrier: { kind: 'player', playerId: 'hero:test' },
    transport: 'walking',
    from: 'station-commons:dispatch',
    to: 'old-town:petru-household',
    parcelIds: ['parcel:authoritative-household-item'],
  }],
}

const resolver = (missionId: string): DeliveryMission | undefined => {
  if (missionId === firstDelivery.missionId) return firstDelivery
  if (missionId === householdDelivery.missionId) return householdDelivery
  return undefined
}

const baseBindings = (
  overrides: Partial<BrailaFirstHourAuthoredBindings> = {},
): BrailaFirstHourAuthoredBindings => ({
  openingContextVerifiedFlagId: 'authority:opening-context:verified',
  dispatcherActorId: 'actor:ana-runtime',
  dispatcherLocationId: 'location:station-commons-dispatch',
  coworkerActorId: 'actor:radu-runtime',
  coworkerLocationId: 'location:station-commons-peer',
  mirelaActorId: 'actor:mirela-runtime',
  mirelaLocationId: 'location:braila-commerce-mirela',
  firstDelivery: {
    deliveryMissionId: firstDelivery.missionId,
    orderId: firstDelivery.orderId,
    parcelIds: firstDelivery.parcels.map(parcel => parcel.parcelId),
  },
  firstDeliverySettlementRef: 'settlement:shift:first-delivery',
  oneSmallThingRecovery: { kind: 'Retry' },
  ...overrides,
})

const fullBindings = (): BrailaFirstHourAuthoredBindings => baseBindings({
  optionalCommunicationReferenceId: 'communication:mirela:first-service',
  household: {
    petruActorId: 'actor:petru-runtime',
    petruLocationId: 'location:old-town-petru',
    delivery: {
      deliveryMissionId: householdDelivery.missionId,
      orderId: householdDelivery.orderId,
      parcelIds: householdDelivery.parcels.map(parcel => parcel.parcelId),
    },
  },
  capacityChoice: {
    bothOptionsAvailableFlagId: 'authority:capacity-choice:both-options',
    assistDispatchAuthorizedFlagId: 'authority:dispatch:radu-assist-authorized',
    protectConfirmationRef: 'work-state:existing-commitment-protected',
    assistConfirmationRef: 'dispatch-state:radu-assist-accepted',
  },
  firstWage: {
    settledFlagId: 'player-economy:first-wage-settled',
    settlementRef: 'wage-settlement:first-shift',
  },
})

const facts = (bindings: BrailaFirstHourAuthoredBindings, worldMinute = 20): MissionWorldFacts => ({
  worldMinute,
  worldFlags: [
    bindings.openingContextVerifiedFlagId,
    ...(bindings.capacityChoice ? [
      bindings.capacityChoice.bothOptionsAvailableFlagId,
      bindings.capacityChoice.assistDispatchAuthorizedFlagId,
    ] : []),
    ...(bindings.firstWage ? [bindings.firstWage.settledFlagId] : []),
  ],
  actorIds: [
    bindings.dispatcherActorId,
    bindings.coworkerActorId,
    bindings.mirelaActorId,
    ...(bindings.household ? [bindings.household.petruActorId] : []),
  ],
  locationIds: [
    bindings.dispatcherLocationId,
    bindings.coworkerLocationId,
    bindings.mirelaLocationId,
    ...(bindings.household ? [bindings.household.petruLocationId] : []),
  ],
  orderStatuses: {
    [bindings.firstDelivery.orderId]: 'Accepted',
    ...(bindings.household ? { [bindings.household.delivery.orderId]: 'Accepted' as const } : {}),
  },
})

const start = (
  definitions: readonly MissionDefinition[],
  state: MissionRuntimeState,
  missionId: string,
  worldFacts: MissionWorldFacts,
): MissionRuntimeState => {
  const result = startMission(definitions, state, missionId, worldFacts)
  expect(result.changed).toBe(true)
  return result.state
}

const completeOpening = (
  definitions: readonly MissionDefinition[],
  state: MissionRuntimeState,
  bindings: BrailaFirstHourAuthoredBindings,
  worldFacts: MissionWorldFacts,
): MissionRuntimeState => {
  state = start(definitions, state, BRAILA_FIRST_HOUR_MISSION_IDS.placeToStart, worldFacts)
  state = applyMissionEvent(
    definitions,
    state,
    BRAILA_FIRST_HOUR_MISSION_IDS.placeToStart,
    {
      eventId: 'event:reported-for-work',
      kind: 'Signal',
      signalType: BRAILA_FIRST_HOUR_SIGNALS.reportedForWork,
      referenceId: bindings.dispatcherActorId,
    },
    worldFacts,
  ).state
  state = start(definitions, state, BRAILA_FIRST_HOUR_MISSION_IDS.firstStandard, worldFacts)
  state = applyMissionEvent(
    definitions,
    state,
    BRAILA_FIRST_HOUR_MISSION_IDS.firstStandard,
    {
      eventId: 'event:first-standard',
      kind: 'Signal',
      signalType: BRAILA_FIRST_HOUR_SIGNALS.firstStandardAcknowledged,
      referenceId: bindings.dispatcherActorId,
    },
    worldFacts,
  ).state
  state = applyMissionEvent(
    definitions,
    state,
    BRAILA_FIRST_HOUR_MISSION_IDS.firstStandard,
    {
      eventId: 'event:meet-radu',
      kind: 'Signal',
      signalType: BRAILA_FIRST_HOUR_SIGNALS.actorMet,
      referenceId: bindings.coworkerActorId,
    },
    worldFacts,
  ).state
  return state
}

const startOneSmallThing = (
  definitions: readonly MissionDefinition[],
  bindings: BrailaFirstHourAuthoredBindings,
  worldFacts: MissionWorldFacts,
): MissionRuntimeState => {
  let state = createMissionRuntimeState(definitions, worldFacts)
  state = completeOpening(definitions, state, bindings, worldFacts)
  return start(definitions, state, BRAILA_FIRST_HOUR_MISSION_IDS.oneSmallThing, worldFacts)
}

describe('canonical Brăila first-hour authored mission registry', () => {
  it('materializes the merged DT-08 canon as a valid acyclic authored registry', () => {
    const bindings = fullBindings()
    const definitions = buildBrailaFirstHourAuthoredMissionRegistry(bindings)
    const validation = validateMissionGraph(definitions)

    expect(validation).toEqual({ valid: true, errors: [] })
    expect(definitions.every(definition => definition.arcId === BRAILA_FIRST_DAY_ARC_ID)).toBe(true)
    expect(definitions.every(definition => definition.source.kind === 'Authored')).toBe(true)
    expect(definitions.map(definition => definition.source.kind === 'Authored' ? definition.source.authoredRef : undefined))
      .not.toContain('agent8-canon-pending')

    const oneSmallThing = definitions.find(definition => definition.missionId === BRAILA_FIRST_HOUR_MISSION_IDS.oneSmallThing)
    expect(oneSmallThing?.source).toEqual({ kind: 'Authored', authoredRef: BRAILA_FIRST_HOUR_AUTHORED_REFS.oneSmallThing })
    expect(oneSmallThing?.label).toBe('One Small Thing')
    expect(JSON.stringify(oneSmallThing)).not.toContain('amount')
    expect(JSON.stringify(oneSmallThing)).not.toContain('qualification')
  })

  it('keeps the opening locked until the external employee-first context exists', () => {
    const bindings = baseBindings()
    const definitions = buildBrailaFirstHourAuthoredMissionRegistry(bindings)
    const blockedFacts: MissionWorldFacts = {
      ...facts(bindings),
      worldFlags: [],
    }
    const blocked = createMissionRuntimeState(definitions, blockedFacts)
    expect(blocked.missions[BRAILA_FIRST_HOUR_MISSION_IDS.placeToStart].status).toBe('Locked')

    const available = createMissionRuntimeState(definitions, facts(bindings))
    expect(available.missions[BRAILA_FIRST_HOUR_MISSION_IDS.placeToStart].status).toBe('Available')
    expect(available.missions[BRAILA_FIRST_HOUR_MISSION_IDS.firstStandard].status).toBe('Locked')
    expect(available.missions[BRAILA_FIRST_HOUR_MISSION_IDS.oneSmallThing].status).toBe('Locked')
  })

  it('binds One Small Thing to the exact DeliveryMission and completes exactly once', () => {
    const bindings = baseBindings({ optionalCommunicationReferenceId: 'communication:mirela:first-service' })
    const definitions = buildBrailaFirstHourAuthoredMissionRegistry(bindings)
    const worldFacts = facts(bindings)
    let state = startOneSmallThing(definitions, bindings, worldFacts)

    const wrongParcel = applyMissionEvent(
      definitions,
      state,
      BRAILA_FIRST_HOUR_MISSION_IDS.oneSmallThing,
      {
        eventId: 'delivery:wrong-parcel',
        kind: 'DeliveryStatus',
        deliveryMissionId: firstDelivery.missionId,
        orderId: firstDelivery.orderId,
        parcelIds: ['parcel:not-authoritative'],
        status: 'PickedUp',
      },
      worldFacts,
      resolver,
    )
    expect(wrongParcel.state.missions[BRAILA_FIRST_HOUR_MISSION_IDS.oneSmallThing].stageId).toBe('pickup')

    state = applyMissionEvent(
      definitions,
      state,
      BRAILA_FIRST_HOUR_MISSION_IDS.oneSmallThing,
      {
        eventId: 'delivery:pickup',
        kind: 'DeliveryStatus',
        deliveryMissionId: firstDelivery.missionId,
        orderId: firstDelivery.orderId,
        parcelIds: firstDelivery.parcels.map(parcel => parcel.parcelId),
        status: 'PickedUp',
      },
      worldFacts,
      resolver,
    ).state
    expect(state.missions[BRAILA_FIRST_HOUR_MISSION_IDS.oneSmallThing].stageId).toBe('deliver')

    const completed = applyMissionEvent(
      definitions,
      state,
      BRAILA_FIRST_HOUR_MISSION_IDS.oneSmallThing,
      {
        eventId: 'delivery:delivered',
        kind: 'DeliveryStatus',
        deliveryMissionId: firstDelivery.missionId,
        orderId: firstDelivery.orderId,
        parcelIds: firstDelivery.parcels.map(parcel => parcel.parcelId),
        status: 'Delivered',
      },
      worldFacts,
      resolver,
    )
    state = completed.state
    expect(state.missions[BRAILA_FIRST_HOUR_MISSION_IDS.oneSmallThing].status).toBe('Completed')
    expect(classifyOneSmallThingOutcome(state)).toEqual({
      outcome: 'CLEAN',
      factId: BRAILA_FIRST_HOUR_FACT_IDS.oneSmallThingClean,
    })
    expect(completed.emittedConsequences.map(item => item.consequence)).toContainEqual({
      kind: 'EconomicSettlementReference',
      settlementRef: bindings.firstDeliverySettlementRef,
    })
    expect(completed.emittedConsequences.map(item => item.consequence)).toContainEqual({
      kind: 'WorldFlag',
      flagId: BRAILA_FIRST_HOUR_FACT_IDS.metMirela,
      value: true,
    })

    const duplicate = applyMissionEvent(
      definitions,
      state,
      BRAILA_FIRST_HOUR_MISSION_IDS.oneSmallThing,
      {
        eventId: 'delivery:delivered-again',
        kind: 'DeliveryStatus',
        deliveryMissionId: firstDelivery.missionId,
        orderId: firstDelivery.orderId,
        parcelIds: firstDelivery.parcels.map(parcel => parcel.parcelId),
        status: 'Delivered',
      },
      worldFacts,
      resolver,
    )
    expect(duplicate.emittedConsequences).toEqual([])
    expect(duplicate.state.completionReceipts.filter(receipt => receipt.missionId === BRAILA_FIRST_HOUR_MISSION_IDS.oneSmallThing))
      .toHaveLength(1)
  })

  it('allows the optional real communication objective to remain optional', () => {
    const bindings = baseBindings({ optionalCommunicationReferenceId: 'communication:mirela:first-service' })
    const definitions = buildBrailaFirstHourAuthoredMissionRegistry(bindings)
    const worldFacts = facts(bindings)
    let state = startOneSmallThing(definitions, bindings, worldFacts)

    for (const event of [
      {
        eventId: 'delivery:pickup-without-message',
        kind: 'DeliveryStatus' as const,
        deliveryMissionId: firstDelivery.missionId,
        orderId: firstDelivery.orderId,
        parcelIds: firstDelivery.parcels.map(parcel => parcel.parcelId),
        status: 'PickedUp' as const,
      },
      {
        eventId: 'delivery:done-without-message',
        kind: 'DeliveryStatus' as const,
        deliveryMissionId: firstDelivery.missionId,
        orderId: firstDelivery.orderId,
        parcelIds: firstDelivery.parcels.map(parcel => parcel.parcelId),
        status: 'Delivered' as const,
      },
    ]) {
      state = applyMissionEvent(
        definitions,
        state,
        BRAILA_FIRST_HOUR_MISSION_IDS.oneSmallThing,
        event,
        worldFacts,
        resolver,
      ).state
    }

    expect(state.missions[BRAILA_FIRST_HOUR_MISSION_IDS.oneSmallThing].status).toBe('Completed')
    expect(state.missions[BRAILA_FIRST_HOUR_MISSION_IDS.oneSmallThing].completedObjectiveIds)
      .not.toContain('one-small-thing-communication')
  })

  it('derives recovered history from real failure/retry history without inventing an outcome choice', () => {
    const bindings = baseBindings({ oneSmallThingRecovery: { kind: 'Retry' } })
    const definitions = buildBrailaFirstHourAuthoredMissionRegistry(bindings)
    const worldFacts = facts(bindings)
    let state = startOneSmallThing(definitions, bindings, worldFacts)

    state = applyMissionEvent(
      definitions,
      state,
      BRAILA_FIRST_HOUR_MISSION_IDS.oneSmallThing,
      { eventId: 'logistics:recoverable-failure', kind: 'Fail', reason: 'authoritative-route-complication' },
      worldFacts,
      resolver,
    ).state
    expect(state.missions[BRAILA_FIRST_HOUR_MISSION_IDS.oneSmallThing].failureCount).toBe(1)

    state = applyMissionEvent(
      definitions,
      state,
      BRAILA_FIRST_HOUR_MISSION_IDS.oneSmallThing,
      {
        eventId: 'logistics:recovery-pickup',
        kind: 'DeliveryStatus',
        deliveryMissionId: firstDelivery.missionId,
        orderId: firstDelivery.orderId,
        parcelIds: firstDelivery.parcels.map(parcel => parcel.parcelId),
        status: 'PickedUp',
      },
      worldFacts,
      resolver,
    ).state
    state = applyMissionEvent(
      definitions,
      state,
      BRAILA_FIRST_HOUR_MISSION_IDS.oneSmallThing,
      {
        eventId: 'logistics:recovery-delivery',
        kind: 'DeliveryStatus',
        deliveryMissionId: firstDelivery.missionId,
        orderId: firstDelivery.orderId,
        parcelIds: firstDelivery.parcels.map(parcel => parcel.parcelId),
        status: 'Delivered',
      },
      worldFacts,
      resolver,
    ).state

    expect(classifyOneSmallThingOutcome(state)).toEqual({
      outcome: 'RECOVERED',
      factId: BRAILA_FIRST_HOUR_FACT_IDS.oneSmallThingRecovered,
    })
  })

  it('supports a terminal authoritative failure without corrupting the campaign graph', () => {
    const bindings = baseBindings({ oneSmallThingRecovery: { kind: 'TerminalFailure' } })
    const definitions = buildBrailaFirstHourAuthoredMissionRegistry(bindings)
    const worldFacts = facts(bindings)
    let state = startOneSmallThing(definitions, bindings, worldFacts)

    state = applyMissionEvent(
      definitions,
      state,
      BRAILA_FIRST_HOUR_MISSION_IDS.oneSmallThing,
      { eventId: 'logistics:terminal-failure', kind: 'Fail', reason: 'authoritative-order-failed' },
      worldFacts,
      resolver,
    ).state

    expect(state.missions[BRAILA_FIRST_HOUR_MISSION_IDS.oneSmallThing].status).toBe('Failed')
    expect(classifyOneSmallThingOutcome(state)).toEqual({
      outcome: 'FAILED',
      factId: BRAILA_FIRST_HOUR_FACT_IDS.oneSmallThingFailed,
    })
    expect(state.missions[BRAILA_FIRST_HOUR_MISSION_IDS.firstConsequence].status).toBe('Available')
    expect(state.completionReceipts.filter(receipt => receipt.missionId === BRAILA_FIRST_HOUR_MISSION_IDS.oneSmallThing))
      .toHaveLength(0)
  })

  it('branches the finite-capacity choice deterministically and records only the confirmed chosen fact', () => {
    const bindings = baseBindings({
      capacityChoice: {
        bothOptionsAvailableFlagId: 'authority:capacity-choice:both-options',
        assistDispatchAuthorizedFlagId: 'authority:dispatch:radu-assist-authorized',
        protectConfirmationRef: 'work-state:existing-commitment-protected',
        assistConfirmationRef: 'dispatch-state:radu-assist-accepted',
      },
    })
    const definitions = buildBrailaFirstHourAuthoredMissionRegistry(bindings)
    const worldFacts = facts(bindings)
    let state = startOneSmallThing(definitions, bindings, worldFacts)

    state = applyMissionEvent(
      definitions,
      state,
      BRAILA_FIRST_HOUR_MISSION_IDS.oneSmallThing,
      {
        eventId: 'delivery:pickup-before-capacity',
        kind: 'DeliveryStatus',
        deliveryMissionId: firstDelivery.missionId,
        orderId: firstDelivery.orderId,
        parcelIds: firstDelivery.parcels.map(parcel => parcel.parcelId),
        status: 'PickedUp',
      },
      worldFacts,
      resolver,
    ).state
    state = applyMissionEvent(
      definitions,
      state,
      BRAILA_FIRST_HOUR_MISSION_IDS.oneSmallThing,
      {
        eventId: 'delivery:done-before-capacity',
        kind: 'DeliveryStatus',
        deliveryMissionId: firstDelivery.missionId,
        orderId: firstDelivery.orderId,
        parcelIds: firstDelivery.parcels.map(parcel => parcel.parcelId),
        status: 'Delivered',
      },
      worldFacts,
      resolver,
    ).state

    state = start(definitions, state, BRAILA_FIRST_HOUR_MISSION_IDS.capacityChoice, worldFacts)
    const event = {
      eventId: 'choice:capacity-priority',
      kind: 'Choice' as const,
      choiceId: BRAILA_FIRST_HOUR_CAPACITY_CHOICE.choiceId,
      optionId: BRAILA_FIRST_HOUR_CAPACITY_CHOICE.protectCommitment,
    }
    const first = applyMissionEvent(definitions, state, BRAILA_FIRST_HOUR_MISSION_IDS.capacityChoice, event, worldFacts)
    const replay = applyMissionEvent(definitions, state, BRAILA_FIRST_HOUR_MISSION_IDS.capacityChoice, event, worldFacts)
    expect(first).toEqual(replay)
    state = first.state
    expect(state.missions[BRAILA_FIRST_HOUR_MISSION_IDS.capacityProtectOutcome].status).toBe('Available')
    expect(state.missions[BRAILA_FIRST_HOUR_MISSION_IDS.capacityAssistOutcome].status).toBe('Locked')

    state = start(definitions, state, BRAILA_FIRST_HOUR_MISSION_IDS.capacityProtectOutcome, worldFacts)
    const confirmed = applyMissionEvent(
      definitions,
      state,
      BRAILA_FIRST_HOUR_MISSION_IDS.capacityProtectOutcome,
      {
        eventId: 'capacity:protect-confirmed',
        kind: 'Signal',
        signalType: BRAILA_FIRST_HOUR_SIGNALS.capacityOutcomeConfirmed,
        referenceId: bindings.capacityChoice?.protectConfirmationRef,
      },
      worldFacts,
    )
    expect(confirmed.emittedConsequences.map(item => item.consequence)).toContainEqual({
      kind: 'WorldFlag',
      flagId: BRAILA_FIRST_HOUR_FACT_IDS.capacityProtect,
      value: true,
    })
    expect(confirmed.emittedConsequences.map(item => item.consequence)).not.toContainEqual({
      kind: 'WorldFlag',
      flagId: BRAILA_FIRST_HOUR_FACT_IDS.capacityAssist,
      value: true,
    })
  })

  it('round-trips an active authored delivery through the merged mission resume contract', () => {
    const bindings = baseBindings()
    const definitions = buildBrailaFirstHourAuthoredMissionRegistry(bindings)
    const worldFacts = facts(bindings)
    let state = startOneSmallThing(definitions, bindings, worldFacts)
    state = applyMissionEvent(
      definitions,
      state,
      BRAILA_FIRST_HOUR_MISSION_IDS.oneSmallThing,
      {
        eventId: 'delivery:persisted-pickup',
        kind: 'DeliveryStatus',
        deliveryMissionId: firstDelivery.missionId,
        orderId: firstDelivery.orderId,
        parcelIds: firstDelivery.parcels.map(parcel => parcel.parcelId),
        status: 'PickedUp',
      },
      worldFacts,
      resolver,
    ).state

    const restored = restoreMissionResumePayload(createMissionResumePayload(state), definitions, worldFacts)
    expect(restored.status).toBe('restored')
    expect(restored.state).toEqual(state)

    const validation = validateMissionResumeReferences(restored.state, definitions, {
      hasOrder: orderId => orderId === firstDelivery.orderId,
      resolveDeliveryMission: resolver,
    })
    expect(validation.resumable).toBe(true)
    expect(validation.issues).toEqual([])
    expect(validation.references).toContainEqual(expect.objectContaining({
      kind: 'delivery',
      missionId: BRAILA_FIRST_HOUR_MISSION_IDS.oneSmallThing,
      stageId: 'deliver',
      objectiveId: 'one-small-thing-delivered',
    }))
  })

  it('includes First Pay only when real Player Economy settlement evidence can be bound', () => {
    const withoutWage = buildBrailaFirstHourAuthoredMissionRegistry(baseBindings())
    expect(withoutWage.some(definition => definition.missionId === BRAILA_FIRST_HOUR_MISSION_IDS.firstPay)).toBe(false)

    const withWageBindings = baseBindings({
      firstWage: {
        settledFlagId: 'player-economy:first-wage-settled',
        settlementRef: 'wage-settlement:first-shift',
      },
    })
    const withWage = buildBrailaFirstHourAuthoredMissionRegistry(withWageBindings)
    const firstPay = withWage.find(definition => definition.missionId === BRAILA_FIRST_HOUR_MISSION_IDS.firstPay)
    expect(firstPay?.prerequisites).toContainEqual({
      kind: 'worldFlag',
      flagId: withWageBindings.firstWage?.settledFlagId,
    })
    expect(firstPay?.completionConsequences).toEqual([{
      kind: 'WorldFlag',
      flagId: BRAILA_FIRST_HOUR_FACT_IDS.firstWageObserved,
      value: true,
    }])
    expect(JSON.stringify(firstPay)).not.toContain('EconomicSettlementReference')
  })
})
