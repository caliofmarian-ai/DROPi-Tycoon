import { describe, expect, it } from 'vitest'
import {
  advanceWorldClock,
  createInitialWorldClockState,
} from '../src/systems/worldClockSystem'
import { createFreshLocalWorldIdentity } from '../src/systems/worldIdentitySystem'
import { createInitialPersonalProgressionState } from '../src/systems/personalCapabilitySystem'
import { createInitialCompanyState, createInitialWorldState } from '../src/state/gameState'
import { createOrderForSequence } from '../src/systems/orderGeneration'
import { performUrbanInteraction, type UrbanInteractionResult } from '../src/systems/urbanInteractions'
import { findWorldRoutePoint } from '../src/world/worldLayout'
import type { CompanyState, OrderState, PersonalProgressionState, WorldState } from '../src/types/game'
import {
  PROTOTYPE_PLAYER_ECONOMY_POLICY,
  createFreshEmployeePlayerEconomy,
  type PlayerEconomyState,
} from '../src/economy/playerEconomy'
import {
  createDeliveryProgressionSettlementState,
  settleLegitimateDeliveryProgression,
  type DeliveryProgressionSettlementState,
  type DeliverySettlementEvidence,
  type GovernedDeliveryProgressionGrant,
} from '../src/economy/deliveryProgressionSettlement'

const freshFixture = (worldInstanceId = 'wi_delivery_progression') => {
  const identity = createFreshLocalWorldIdentity(worldInstanceId)
  const clock = createInitialWorldClockState(identity.worldInstanceId)
  const economy = createFreshEmployeePlayerEconomy(identity, clock)
  const personalProgression: PersonalProgressionState = {
    ...createInitialPersonalProgressionState(),
    experiencePoints: 7,
    progressionPoints: 2,
  }
  const settlementState = createDeliveryProgressionSettlementState(economy)
  return { identity, clock, economy, personalProgression, settlementState }
}

const completeRealUrbanDelivery = (
  sequence: number,
  company: CompanyState = createInitialCompanyState(),
): {
  sourceOrder: OrderState
  interaction: UrbanInteractionResult
} => {
  const world: WorldState = createInitialWorldState()
  world.urban = { merchantOnboarded: true, activeTransport: 'walking' }
  world.activeOrder = {
    ...createOrderForSequence(sequence),
    status: 'PickedUp',
    economySettled: false,
  }
  world.player.currentOrder = world.activeOrder.orderId
  world.player.carryingPackage = true
  const destination = findWorldRoutePoint(world.activeOrder.destination)
  if (!destination) throw new Error(`Missing destination ${world.activeOrder.destination}`)
  world.player.x = destination.x
  world.player.y = destination.y

  const sourceOrder = { ...world.activeOrder }
  const interaction = performUrbanInteraction(world, company)
  expect(interaction.settled).toBe(true)
  return { sourceOrder, interaction }
}

const employerEvidence = (servedEntityId = 'economic-entity:merchant:fixture'): DeliverySettlementEvidence => ({
  servedEntityId,
  sourceKind: 'EmployerService',
})

const governedGrant = (servedEntityId = 'economic-entity:merchant:fixture'): GovernedDeliveryProgressionGrant => ({
  policyId: 'test-progression-policy-v1',
  xp: 11,
  loyalty: {
    entityId: servedEntityId,
    points: 3,
  },
  specialistFragment: {
    specialistFamilyId: 'specialist-family:fixture',
    sourceEconomicEntityId: servedEntityId,
    affinityRef: 'affinity:governed-fixture',
    quantity: 2,
  },
})

const settle = (input: {
  economy: PlayerEconomyState
  personalProgression: PersonalProgressionState
  settlementState: DeliveryProgressionSettlementState
  clock: ReturnType<typeof createInitialWorldClockState>
  delivery: ReturnType<typeof completeRealUrbanDelivery>
  evidence?: DeliverySettlementEvidence
  grant?: GovernedDeliveryProgressionGrant
}) => settleLegitimateDeliveryProgression(
  input.economy,
  input.personalProgression,
  input.settlementState,
  input.clock,
  input.delivery.sourceOrder,
  input.delivery.interaction,
  input.evidence ?? employerEvidence(),
  input.grant ?? governedGrant(),
)

describe('DT-03 delivery progression settlement receipt', () => {
  it('settles legitimate delivery consequences exactly once without minting per-parcel Personal Money', () => {
    const fixture = freshFixture()
    const delivery = completeRealUrbanDelivery(1)
    const personalMoneyBefore = fixture.economy.personalMoney.balanceMinor
    const employerMoneyBefore = fixture.economy.employerCompanyMoney?.balanceMinor
    const capacityBefore = fixture.economy.workCapacity.current
    const learnedBefore = [...fixture.personalProgression.learnedCapabilityIds]

    const result = settle({ ...fixture, delivery })

    expect(result.applied).toBe(true)
    if (!result.applied) throw new Error(`Expected settlement: ${result.reason}`)

    expect(result.economy.personalMoney.balanceMinor).toBe(personalMoneyBefore)
    expect(result.economy.employerCompanyMoney?.balanceMinor).toBe(employerMoneyBefore)
    expect(result.economy.workCapacity.current).toBe(
      capacityBefore - PROTOTYPE_PLAYER_ECONOMY_POLICY.starterDeliveryCapacityCost,
    )
    expect(result.receipt.moneyConsequence).toMatchObject({
      kind: 'ProductiveWorkTowardShiftWage',
      productiveMinutes: PROTOTYPE_PLAYER_ECONOMY_POLICY.starterDeliveryProductiveMinutes,
    })

    expect(result.personalProgression.experiencePoints).toBe(fixture.personalProgression.experiencePoints + 11)
    expect(result.personalProgression.progressionPoints).toBe(fixture.personalProgression.progressionPoints)
    expect(result.personalProgression.learnedCapabilityIds).toEqual(learnedBefore)

    expect(result.settlementState.entityLoyalty).toEqual([
      { entityId: 'economic-entity:merchant:fixture', points: 3 },
    ])
    expect(result.settlementState.fragmentInventory).toHaveLength(2)
    expect(result.settlementState.fragmentInventory.every(
      item => item.sourceEconomicEntityId === 'economic-entity:merchant:fixture' &&
        item.mintSettlementReceiptId === result.receipt.receiptId,
    )).toBe(true)
    expect(result.receipt.fragmentIds).toEqual(
      result.settlementState.fragmentInventory.map(item => item.fragmentId),
    )
    expect(result.settlementState.receipts).toHaveLength(1)
  })

  it('blocks retry/replay from duplicating work, XP, loyalty or fragments after time advances', () => {
    const fixture = freshFixture('wi_delivery_progression_replay')
    const delivery = completeRealUrbanDelivery(1)
    const first = settle({ ...fixture, delivery })
    expect(first.applied).toBe(true)
    if (!first.applied) throw new Error(`Expected first settlement: ${first.reason}`)

    const laterClock = advanceWorldClock(fixture.clock, 8 * 60).clock
    const replay = settleLegitimateDeliveryProgression(
      first.economy,
      first.personalProgression,
      first.settlementState,
      laterClock,
      delivery.sourceOrder,
      delivery.interaction,
      employerEvidence(),
      governedGrant(),
    )

    expect(replay).toMatchObject({ applied: false, reason: 'already-settled' })
    expect(replay.economy).toEqual(first.economy)
    expect(replay.personalProgression).toEqual(first.personalProgression)
    expect(replay.settlementState).toEqual(first.settlementState)
  })

  it('fails closed before productive-work mutation when loyalty or fragment affinity targets another entity', () => {
    const fixture = freshFixture('wi_delivery_progression_affinity')
    const delivery = completeRealUrbanDelivery(1)
    const invalidGrant = governedGrant('economic-entity:other')

    const result = settle({
      ...fixture,
      delivery,
      evidence: employerEvidence('economic-entity:served'),
      grant: invalidGrant,
    })

    expect(result).toMatchObject({ applied: false, reason: 'loyalty-entity-mismatch' })
    expect(result.economy).toEqual(fixture.economy)
    expect(result.personalProgression).toEqual(fixture.personalProgression)
    expect(result.settlementState).toEqual(fixture.settlementState)
  })

  it('forbids reminting a Specialist Fragment merely because existing fragment inventory was transported', () => {
    const fixture = freshFixture('wi_delivery_progression_fragment_transport')
    const delivery = completeRealUrbanDelivery(1)
    const buyerActorId = 'actor:market-buyer'
    const evidence: DeliverySettlementEvidence = {
      servedEntityId: buyerActorId,
      sourceKind: 'MarketplaceFulfillment',
      marketplace: {
        marketTransactionId: 'market-tx:fragment-transfer:1',
        buyerActorId,
        sellerActorId: 'actor:market-seller',
        itemKind: 'SpecialistFragment',
      },
    }
    const grant = governedGrant(buyerActorId)

    const result = settle({ ...fixture, delivery, evidence, grant })

    expect(result).toMatchObject({ applied: false, reason: 'fragment-remint-forbidden' })
    expect(result.economy).toEqual(fixture.economy)
    expect(result.personalProgression).toEqual(fixture.personalProgression)
    expect(result.settlementState.fragmentInventory).toEqual([])
    expect(result.settlementState.receipts).toEqual([])
  })

  it('allows legitimate third-party fragment transport progression without minting a new fragment', () => {
    const fixture = freshFixture('wi_delivery_progression_third_party')
    const delivery = completeRealUrbanDelivery(1)
    const buyerActorId = 'actor:market-buyer'
    const evidence: DeliverySettlementEvidence = {
      servedEntityId: buyerActorId,
      sourceKind: 'MarketplaceFulfillment',
      marketplace: {
        marketTransactionId: 'market-tx:fragment-transfer:2',
        buyerActorId,
        sellerActorId: 'actor:market-seller',
        itemKind: 'SpecialistFragment',
      },
    }
    const grant: GovernedDeliveryProgressionGrant = {
      policyId: 'test-market-logistics-progression-v1',
      xp: 5,
      loyalty: { entityId: buyerActorId, points: 1 },
    }

    const result = settle({ ...fixture, delivery, evidence, grant })

    expect(result.applied).toBe(true)
    if (!result.applied) throw new Error(`Expected third-party progression: ${result.reason}`)
    expect(result.personalProgression.experiencePoints).toBe(fixture.personalProgression.experiencePoints + 5)
    expect(result.settlementState.entityLoyalty).toEqual([{ entityId: buyerActorId, points: 1 }])
    expect(result.settlementState.fragmentInventory).toEqual([])
    expect(result.receipt.fragmentIds).toEqual([])
    expect(result.receipt.marketplaceTransactionId).toBe('market-tx:fragment-transfer:2')
  })

  it('blocks self-dealing and buyer/seller work from becoming a marketplace progression farm', () => {
    const fixture = freshFixture('wi_delivery_progression_self_trade')
    const delivery = completeRealUrbanDelivery(1)
    const actorId = 'actor:self-dealer'
    const evidence: DeliverySettlementEvidence = {
      servedEntityId: actorId,
      sourceKind: 'MarketplaceFulfillment',
      marketplace: {
        marketTransactionId: 'market-tx:self:1',
        buyerActorId: actorId,
        sellerActorId: actorId,
        itemKind: 'OtherPhysicalInventory',
      },
    }
    const grant: GovernedDeliveryProgressionGrant = {
      policyId: 'test-market-logistics-progression-v1',
      xp: 5,
      loyalty: { entityId: actorId, points: 1 },
    }

    const result = settle({ ...fixture, delivery, evidence, grant })

    expect(result).toMatchObject({ applied: false, reason: 'self-dealing-marketplace' })
    expect(result.economy).toEqual(fixture.economy)
    expect(result.personalProgression).toEqual(fixture.personalProgression)
    expect(result.settlementState).toEqual(fixture.settlementState)
  })

  it('rejects a marketplace trade where the worker is one of the trading parties', () => {
    const fixture = freshFixture('wi_delivery_progression_worker_trade')
    const delivery = completeRealUrbanDelivery(1)
    const evidence: DeliverySettlementEvidence = {
      servedEntityId: 'actor:market-buyer',
      sourceKind: 'MarketplaceFulfillment',
      marketplace: {
        marketTransactionId: 'market-tx:worker-party:1',
        buyerActorId: 'actor:market-buyer',
        sellerActorId: fixture.identity.heroActorId,
        itemKind: 'OtherPhysicalInventory',
      },
    }
    const grant: GovernedDeliveryProgressionGrant = {
      policyId: 'test-market-logistics-progression-v1',
      xp: 5,
      loyalty: { entityId: 'actor:market-buyer', points: 1 },
    }

    const result = settle({ ...fixture, delivery, evidence, grant })

    expect(result).toMatchObject({ applied: false, reason: 'self-dealing-marketplace' })
    expect(result.economy).toEqual(fixture.economy)
  })

  it('fails closed on settlement-state world mismatch and on XP overflow', () => {
    const fixture = freshFixture('wi_delivery_progression_integrity')
    const delivery = completeRealUrbanDelivery(1)
    const foreign = freshFixture('wi_delivery_progression_foreign')

    const worldMismatch = settle({
      ...fixture,
      delivery,
      settlementState: foreign.settlementState,
    })
    expect(worldMismatch).toMatchObject({ applied: false, reason: 'invalid-settlement-state' })
    expect(worldMismatch.economy).toEqual(fixture.economy)

    const overflowProgression: PersonalProgressionState = {
      ...fixture.personalProgression,
      experiencePoints: Number.MAX_SAFE_INTEGER,
    }
    const overflow = settle({
      ...fixture,
      delivery,
      personalProgression: overflowProgression,
      grant: {
        policyId: 'test-overflow-policy-v1',
        xp: 1,
      },
    })
    expect(overflow).toMatchObject({ applied: false, reason: 'invalid-grant' })
    expect(overflow.economy).toEqual(fixture.economy)
  })
})
