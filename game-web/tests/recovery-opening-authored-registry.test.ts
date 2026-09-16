import { describe, expect, it } from 'vitest'
import { validateMissionGraph } from '../src/missions/missionEngine'
import {
  RECOVERY_OPENING_MISSION_IDS,
  buildRecoveryOpeningMissionBundle,
  type RecoveryOpeningAuthoredBindings,
} from '../src/missions/recoveryOpeningAuthoredRegistry'
import { RECOVERY_AUTHORED_REFS } from '../src/narrative/recoveryOpeningV2'

const delivery = (index: number) => ({
  deliveryMissionId: `delivery:recovery:${index}`,
  orderId: `order:recovery:${index}`,
  parcelIds: [`parcel:recovery:${index}`],
})

const bindings = (): RecoveryOpeningAuthoredBindings => ({
  freshRecoveryOpeningFlagId: 'world:recovery-opening-enabled',
  mariaActorId: 'actor:maria-ionescu:braila',
  mariaShopLocationId: 'location:braila:maria-market',
  firstDelivery: delivery(0),
  firstDeliverySettlementRef: 'settlement:delivery:first-test',
  firstReturnFoodSettlementRef: 'settlement:inventory:maria-apples',
  mariaTrialDeliveries: [1, 2, 3, 4, 5].map(delivery),
  mariaTrialSettlementRefs: [1, 2, 3, 4, 5].map(index => `settlement:delivery:maria-trial:${index}`),
  supplierActorId: 'actor:braila:local-farmer',
  supplierLocationId: 'location:braila:local-farm',
})

describe('recovery opening authored mission registry', () => {
  it('builds a valid explicit mission chain from recovery to Maria to supplier', () => {
    const definitions = buildRecoveryOpeningMissionBundle(bindings())
    expect(validateMissionGraph(definitions)).toEqual({ valid: true, errors: [] })
    expect(definitions.map(definition => definition.missionId)).toEqual([
      RECOVERY_OPENING_MISSION_IDS.riseAndSearch,
      RECOVERY_OPENING_MISSION_IDS.mariaTest,
      RECOVERY_OPENING_MISSION_IDS.mariaReturn,
      RECOVERY_OPENING_MISSION_IDS.mariaTrialChain,
      RECOVERY_OPENING_MISSION_IDS.supplierIntroduction,
    ])
  })

  it('requires visible custody pickup before the first test can complete delivery', () => {
    const mariaTest = buildRecoveryOpeningMissionBundle(bindings())
      .find(definition => definition.missionId === RECOVERY_OPENING_MISSION_IDS.mariaTest)
    expect(mariaTest?.source).toEqual({ kind: 'Authored', authoredRef: RECOVERY_AUTHORED_REFS.merchantTest })
    expect(mariaTest?.stages.map(stage => stage.stageId)).toEqual(['enter-shop', 'accept-test', 'pickup', 'deliver'])
    expect(mariaTest?.stages[2].objectives[0]).toMatchObject({ kind: 'delivery', status: 'PickedUp' })
    expect(mariaTest?.stages[3].objectives[0]).toMatchObject({ kind: 'delivery', status: 'Delivered' })
  })

  it('does not fabricate food when no authoritative food settlement reference exists', () => {
    const noFood = { ...bindings(), firstReturnFoodSettlementRef: undefined }
    const mariaReturn = buildRecoveryOpeningMissionBundle(noFood)
      .find(definition => definition.missionId === RECOVERY_OPENING_MISSION_IDS.mariaReturn)
    expect(mariaReturn?.completionConsequences.some(consequence =>
      consequence.kind === 'EconomicSettlementReference' && consequence.settlementRef.includes('apples'),
    )).toBe(false)
  })

  it('requires exactly five governed deliveries only in the Brăila Maria authored chain', () => {
    const invalid = { ...bindings(), mariaTrialDeliveries: [delivery(1), delivery(2)] }
    expect(() => buildRecoveryOpeningMissionBundle(invalid)).toThrow('exactly five governed deliveries')
  })

  it('never places money amounts or qualification grants inside the authored missions', () => {
    const serialized = JSON.stringify(buildRecoveryOpeningMissionBundle(bindings()))
    expect(serialized).not.toMatch(/balanceMinor|amountMinor|qualification|CapabilityOpportunity/)
    expect(serialized).toContain('EconomicSettlementReference')
  })
})
