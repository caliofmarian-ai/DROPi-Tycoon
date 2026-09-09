import { describe, expect, it } from 'vitest'
import { applyMissionEvent, createMissionRuntimeState, validateMissionGraph } from '../src/missions/missionEngine'
import type { MissionWorldFacts } from '../src/missions/missionModel'
import {
  BRAILA_FIRST_HOUR_MISSION_IDS,
  buildBrailaFirstHourAuthoredMissionRegistry,
  type BrailaFirstHourAuthoredBindings,
} from '../src/missions/brailaFirstHourAuthoredRegistry'

const bindings: BrailaFirstHourAuthoredBindings = {
  openingContextVerifiedFlagId: 'authority:opening-context:verified',
  dispatcherActorId: 'actor:ana-runtime',
  dispatcherLocationId: 'location:station-commons-dispatch',
  coworkerActorId: 'actor:radu-runtime',
  coworkerLocationId: 'location:station-commons-peer',
  mirelaActorId: 'actor:mirela-runtime',
  mirelaLocationId: 'location:braila-commerce-mirela',
  firstDelivery: {
    deliveryMissionId: 'delivery:one-small-thing',
    orderId: 'order:one-small-thing',
    parcelIds: ['parcel:authoritative-business-item'],
  },
  firstDeliverySettlementRef: 'settlement:shift:first-delivery',
  oneSmallThingRecovery: { kind: 'TerminalFailure' },
  household: {
    petruActorId: 'actor:petru-runtime',
    petruLocationId: 'location:old-town-petru',
    delivery: {
      deliveryMissionId: 'delivery:petru-household',
      orderId: 'order:petru-household',
      parcelIds: ['parcel:authoritative-household-item'],
    },
  },
}

const facts: MissionWorldFacts = {
  worldMinute: 20,
  worldFlags: [bindings.openingContextVerifiedFlagId],
  actorIds: [
    bindings.dispatcherActorId,
    bindings.coworkerActorId,
    bindings.mirelaActorId,
    bindings.household!.petruActorId,
  ],
  locationIds: [
    bindings.dispatcherLocationId,
    bindings.coworkerLocationId,
    bindings.mirelaLocationId,
    bindings.household!.petruLocationId,
  ],
  orderStatuses: {
    [bindings.firstDelivery.orderId]: 'Accepted',
    [bindings.household!.delivery.orderId]: 'Accepted',
  },
}

describe('Brăila authored first-hour terminal recovery', () => {
  it('unlocks consequence reporting and the next legitimate optional beat after terminal delivery failure', () => {
    const definitions = buildBrailaFirstHourAuthoredMissionRegistry(bindings)
    expect(validateMissionGraph(definitions)).toEqual({ valid: true, errors: [] })

    const oneSmallThing = definitions.find(
      definition => definition.missionId === BRAILA_FIRST_HOUR_MISSION_IDS.oneSmallThing,
    )
    expect(oneSmallThing?.failurePolicy).toEqual({
      kind: 'FailedBranch',
      unlocks: [
        { missionId: BRAILA_FIRST_HOUR_MISSION_IDS.firstConsequence },
        { missionId: BRAILA_FIRST_HOUR_MISSION_IDS.personNotAddress },
      ],
    })

    const state = createMissionRuntimeState(definitions, facts)
    state.missions[BRAILA_FIRST_HOUR_MISSION_IDS.oneSmallThing].status = 'Active'
    state.missions[BRAILA_FIRST_HOUR_MISSION_IDS.oneSmallThing].stageId = 'pickup'

    const failed = applyMissionEvent(
      definitions,
      state,
      BRAILA_FIRST_HOUR_MISSION_IDS.oneSmallThing,
      { eventId: 'delivery:terminal-failure', kind: 'Fail', reason: 'authoritative-order-failed' },
      facts,
    )

    expect(failed.state.missions[BRAILA_FIRST_HOUR_MISSION_IDS.oneSmallThing].status).toBe('Failed')
    expect(failed.state.missions[BRAILA_FIRST_HOUR_MISSION_IDS.firstConsequence].status).toBe('Available')
    expect(failed.state.missions[BRAILA_FIRST_HOUR_MISSION_IDS.personNotAddress].status).toBe('Available')
  })
})
