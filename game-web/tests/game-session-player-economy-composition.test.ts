import { describe, expect, it } from 'vitest'
import {
  PROTOTYPE_PLAYER_ECONOMY_POLICY,
} from '../src/economy/playerEconomy'
import {
  advanceGameSessionPlayerEconomyThroughClock,
  captureGameSessionPlayerEconomyStatePort,
  createGameSessionPlayerEconomyComposition,
  readGameSessionPlayerEconomy,
  recordGameSessionSettledDeliveryWork,
  restoreGameSessionPlayerEconomyStatePort,
  type GameSessionPlayerEconomyComposition,
} from '../src/economy/gameSessionPlayerEconomyComposition'
import {
  advanceWorldClock,
  createInitialWorldClockState,
} from '../src/systems/worldClockSystem'
import {
  createFreshLocalWorldIdentity,
  createInitialWorldIdentityState,
} from '../src/systems/worldIdentitySystem'
import {
  createInitialCompanyState,
  createInitialGameSettingsState,
  createInitialWorldState,
} from '../src/state/gameState'
import { createInitialOwnershipEconomyState } from '../src/systems/ownershipEconomySystem'
import { createInitialPersonalProgressionState } from '../src/systems/personalCapabilitySystem'
import { createOrderForSequence } from '../src/systems/orderGeneration'
import { performUrbanInteraction, type UrbanInteractionResult } from '../src/systems/urbanInteractions'
import { findWorldRoutePoint } from '../src/world/worldLayout'
import type { CompanyState, GameSessionState, OrderState, WorldState } from '../src/types/game'

const makeSession = (worldInstanceId = 'wi_gamesession_player_economy'): GameSessionState => ({
  world: createInitialWorldState(),
  company: createInitialCompanyState(),
  settings: createInitialGameSettingsState(),
  personalProgression: createInitialPersonalProgressionState(),
  ownershipEconomy: createInitialOwnershipEconomyState(),
  worldIdentity: createFreshLocalWorldIdentity(worldInstanceId),
})

const makeLegacySession = (): GameSessionState => ({
  world: createInitialWorldState(),
  company: createInitialCompanyState(),
  settings: createInitialGameSettingsState(),
  personalProgression: createInitialPersonalProgressionState(),
  ownershipEconomy: createInitialOwnershipEconomyState(),
  worldIdentity: createInitialWorldIdentityState(),
})

const createComposition = (session: GameSessionState): GameSessionPlayerEconomyComposition => {
  const identity = session.worldIdentity
  if (!identity) throw new Error('Expected World Identity')
  const result = createGameSessionPlayerEconomyComposition(
    session,
    createInitialWorldClockState(identity.worldInstanceId),
  )
  expect(result.created).toBe(true)
  if (!result.created) throw new Error(result.reason)
  return result.composition
}

const completeRealUrbanDelivery = (
  sequence: number,
  company: CompanyState = createInitialCompanyState(),
): { sourceOrder: OrderState; interaction: UrbanInteractionResult } => {
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

const recordDelivery = (
  session: GameSessionState,
  composition: GameSessionPlayerEconomyComposition,
  sequence: number,
): GameSessionPlayerEconomyComposition => {
  const delivery = completeRealUrbanDelivery(sequence)
  const work = recordGameSessionSettledDeliveryWork(
    session,
    composition,
    delivery.sourceOrder,
    delivery.interaction,
  )
  expect(work.applied).toBe(true)
  if (!work.applied) throw new Error(work.reason)
  return work.composition
}

const advanceComposition = (
  session: GameSessionState,
  composition: GameSessionPlayerEconomyComposition,
  minutes: number,
): GameSessionPlayerEconomyComposition => {
  const toClock = advanceWorldClock(composition.clock, minutes).clock
  const result = advanceGameSessionPlayerEconomyThroughClock(session, composition, toClock)
  expect(result.processed).toBe(true)
  if (!result.processed) throw new Error(result.reason)
  return result.composition
}

describe('GameSession Player Economy composition', () => {
  it('makes Personal Money explicit while keeping legacy Company Money non-personal', () => {
    const session = makeSession('wi_composition_authority')
    session.company.money = 87_654
    const composition = createComposition(session)

    const read = readGameSessionPlayerEconomy(session, composition)
    expect(read.ok).toBe(true)
    if (!read.ok) throw new Error(read.reason)

    expect(read.projection.moneyAuthority).toBe('PlayerEconomy.PersonalMoney')
    expect(read.projection.personalMoneyBalanceMinor).toBe(0)
    expect(read.projection.employerTreasuryBalanceMinor).toBe(
      PROTOTYPE_PLAYER_ECONOMY_POLICY.starterEmployerOpeningMoneyMinor,
    )
    expect(read.projection.legacyCompanyMoney).toEqual({
      authority: 'GameSession.CompanyState',
      balance: 87_654,
      isPersonalMoney: false,
    })
    expect(read.projection.workCapacity.current).toBe(PROTOTYPE_PLAYER_ECONOMY_POLICY.maxWorkCapacity)
    expect(read.projection.currentShift).toMatchObject({
      productiveMinutes: 0,
      requiredProductiveMinutes: PROTOTYPE_PLAYER_ECONOMY_POLICY.starterShiftRequiredProductiveMinutes,
      wageEligibleAtClose: false,
    })
  })

  it('records real settled delivery receipts once and projects shift progress without exposing mutation authority', () => {
    const session = makeSession('wi_composition_work')
    let composition = createComposition(session)
    const delivery = completeRealUrbanDelivery(1)

    const first = recordGameSessionSettledDeliveryWork(
      session,
      composition,
      delivery.sourceOrder,
      delivery.interaction,
    )
    expect(first.applied).toBe(true)
    if (!first.applied) throw new Error(first.reason)
    composition = first.composition

    const duplicate = recordGameSessionSettledDeliveryWork(
      session,
      composition,
      delivery.sourceOrder,
      delivery.interaction,
    )
    expect(duplicate).toMatchObject({ applied: false, reason: 'duplicate-delivery' })
    expect(duplicate.composition).toEqual(composition)

    const read = readGameSessionPlayerEconomy(session, composition)
    expect(read.ok).toBe(true)
    if (!read.ok) throw new Error(read.reason)
    expect(read.projection.productiveWork.receiptCount).toBe(1)
    expect(read.projection.currentShift).toMatchObject({
      productiveMinutes: PROTOTYPE_PLAYER_ECONOMY_POLICY.starterDeliveryProductiveMinutes,
      remainingProductiveMinutes:
        PROTOTYPE_PLAYER_ECONOMY_POLICY.starterShiftRequiredProductiveMinutes -
        PROTOTYPE_PLAYER_ECONOMY_POLICY.starterDeliveryProductiveMinutes,
    })
    expect(read.projection.workCapacity.current).toBe(
      PROTOTYPE_PLAYER_ECONOMY_POLICY.maxWorkCapacity -
      PROTOTYPE_PLAYER_ECONOMY_POLICY.starterDeliveryCapacityCost,
    )

    read.projection.productiveWork.receipts[0].productiveMinutes = 999
    read.projection.legacyCompanyMoney.balance = 0
    const reread = readGameSessionPlayerEconomy(session, composition)
    expect(reread.ok).toBe(true)
    if (!reread.ok) throw new Error(reread.reason)
    expect(reread.projection.productiveWork.receipts[0].productiveMinutes).toBe(
      PROTOTYPE_PLAYER_ECONOMY_POLICY.starterDeliveryProductiveMinutes,
    )
    expect(reread.projection.legacyCompanyMoney.balance).toBe(session.company.money)
  })

  it('runs the live causal path work -> wage -> living hardship -> wage recovery -> Stable exactly once', () => {
    const session = makeSession('wi_composition_causal')
    session.company.money = 73_000
    const legacyCompanyBefore = session.company.money
    let composition = createComposition(session)

    composition = recordDelivery(session, composition, 1)
    composition = recordDelivery(session, composition, 2)

    const wageBoundary = advanceWorldClock(composition.clock, 6 * 60).clock
    const wage = advanceGameSessionPlayerEconomyThroughClock(session, composition, wageBoundary)
    expect(wage.processed).toBe(true)
    if (!wage.processed) throw new Error(wage.reason)
    expect(wage.summary.finance.wagesPaidMinor).toBe(PROTOTYPE_PLAYER_ECONOMY_POLICY.starterShiftWageMinor)
    expect(wage.composition.economy.personalMoney.balanceMinor).toBe(
      PROTOTYPE_PLAYER_ECONOMY_POLICY.starterShiftWageMinor,
    )
    expect(session.company.money).toBe(legacyCompanyBefore)
    composition = wage.composition

    const wageReplay = advanceGameSessionPlayerEconomyThroughClock(session, composition, wageBoundary)
    expect(wageReplay.processed).toBe(true)
    if (!wageReplay.processed) throw new Error(wageReplay.reason)
    expect(wageReplay.summary.finance.wagesPaidMinor).toBe(0)
    expect(wageReplay.composition.economy.personalMoney).toEqual(composition.economy.personalMoney)

    const fourLivingDays = advanceWorldClock(composition.clock, 82 * 60).clock
    const hardship = advanceGameSessionPlayerEconomyThroughClock(session, composition, fourLivingDays)
    expect(hardship.processed).toBe(true)
    if (!hardship.processed) throw new Error(hardship.reason)
    expect(hardship.summary.finance.livingCostsPaidMinor).toBe(
      PROTOTYPE_PLAYER_ECONOMY_POLICY.starterShiftWageMinor,
    )
    expect(hardship.summary.finance.livingArrearsAddedMinor).toBe(
      PROTOTYPE_PLAYER_ECONOMY_POLICY.basicLivingCostMinor,
    )
    expect(hardship.composition.economy.personalMoney.balanceMinor).toBe(0)
    expect(hardship.composition.economy.living.arrearsMinor).toBe(
      PROTOTYPE_PLAYER_ECONOMY_POLICY.basicLivingCostMinor,
    )
    expect(hardship.summary.transitions).toContainEqual(expect.objectContaining({
      kind: 'InsolvencyEntered',
    }))
    composition = hardship.composition

    const hardshipReplay = advanceGameSessionPlayerEconomyThroughClock(session, composition, fourLivingDays)
    expect(hardshipReplay.processed).toBe(true)
    if (!hardshipReplay.processed) throw new Error(hardshipReplay.reason)
    expect(hardshipReplay.summary.finance.livingArrearsAddedMinor).toBe(0)
    expect(hardshipReplay.summary.transitions).toEqual([])
    expect(hardshipReplay.composition.economy.living.arrearsMinor).toBe(
      PROTOTYPE_PLAYER_ECONOMY_POLICY.basicLivingCostMinor,
    )

    composition = recordDelivery(session, composition, 3)
    composition = recordDelivery(session, composition, 4)
    const recoveryWageBoundary = advanceWorldClock(composition.clock, 6 * 60).clock
    const recoveryWage = advanceGameSessionPlayerEconomyThroughClock(
      session,
      composition,
      recoveryWageBoundary,
    )
    expect(recoveryWage.processed).toBe(true)
    if (!recoveryWage.processed) throw new Error(recoveryWage.reason)
    expect(recoveryWage.summary.finance.wagesPaidMinor).toBe(
      PROTOTYPE_PLAYER_ECONOMY_POLICY.starterShiftWageMinor,
    )
    expect(recoveryWage.summary.finance.livingArrearsRecoveredMinor).toBe(
      PROTOTYPE_PLAYER_ECONOMY_POLICY.basicLivingCostMinor,
    )
    expect(recoveryWage.composition.economy.living.arrearsMinor).toBe(0)
    expect(recoveryWage.composition.economy.living.financialStatus).toBe('Recovering')
    expect(recoveryWage.summary.transitions).toContainEqual(expect.objectContaining({
      kind: 'RecoveryStarted',
    }))
    composition = recoveryWage.composition

    const nextLivingBoundary = advanceWorldClock(composition.clock, 18 * 60).clock
    const stable = advanceGameSessionPlayerEconomyThroughClock(
      session,
      composition,
      nextLivingBoundary,
    )
    expect(stable.processed).toBe(true)
    if (!stable.processed) throw new Error(stable.reason)
    expect(stable.composition.economy.living.financialStatus).toBe('Stable')
    expect(stable.composition.economy.living.arrearsMinor).toBe(0)
    expect(stable.summary.transitions).toContainEqual(expect.objectContaining({
      kind: 'StableRecoveryReached',
    }))
    expect(session.company.money).toBe(legacyCompanyBefore)
  })

  it('captures and restores a detached state port without changing Save v2 ownership or replay identities', () => {
    const session = makeSession('wi_composition_port')
    let composition = createComposition(session)
    const delivery = completeRealUrbanDelivery(1)
    const first = recordGameSessionSettledDeliveryWork(
      session,
      composition,
      delivery.sourceOrder,
      delivery.interaction,
    )
    expect(first.applied).toBe(true)
    if (!first.applied) throw new Error(first.reason)
    composition = first.composition

    const captured = captureGameSessionPlayerEconomyStatePort(session, composition)
    expect(captured.ok).toBe(true)
    if (!captured.ok) throw new Error(captured.reason)

    captured.port.economy.workCapacity.current = 0
    expect(composition.economy.workCapacity.current).not.toBe(0)

    const freshCapture = captureGameSessionPlayerEconomyStatePort(session, composition)
    expect(freshCapture.ok).toBe(true)
    if (!freshCapture.ok) throw new Error(freshCapture.reason)
    const restored = restoreGameSessionPlayerEconomyStatePort(session, freshCapture.port)
    expect(restored.restored).toBe(true)
    if (!restored.restored) throw new Error(restored.reason)
    expect(restored.composition).toEqual(composition)

    const replay = recordGameSessionSettledDeliveryWork(
      session,
      restored.composition,
      delivery.sourceOrder,
      delivery.interaction,
    )
    expect(replay).toMatchObject({ applied: false, reason: 'duplicate-delivery' })

    const tamperedCapture = captureGameSessionPlayerEconomyStatePort(session, composition)
    expect(tamperedCapture.ok).toBe(true)
    if (!tamperedCapture.ok) throw new Error(tamperedCapture.reason)
    tamperedCapture.port.economy.personalMoney.balanceMinor += 1
    const tampered = restoreGameSessionPlayerEconomyStatePort(session, tamperedCapture.port)
    expect(tampered).toEqual({ restored: false, reason: 'invalid-state' })
  })

  it('rejects cross-session state ports and keeps legacy Company Money outside employee mutations', () => {
    const sessionA = makeSession('wi_composition_a')
    const compositionA = createComposition(sessionA)
    const captured = captureGameSessionPlayerEconomyStatePort(sessionA, compositionA)
    expect(captured.ok).toBe(true)
    if (!captured.ok) throw new Error(captured.reason)

    const sessionB = makeSession('wi_composition_b')
    const crossWorld = restoreGameSessionPlayerEconomyStatePort(sessionB, captured.port)
    expect(crossWorld).toEqual({ restored: false, reason: 'session-mismatch' })

    const legacySession = makeLegacySession()
    legacySession.company.money = 321
    const legacyComposition = createComposition(legacySession)
    const read = readGameSessionPlayerEconomy(legacySession, legacyComposition)
    expect(read.ok).toBe(true)
    if (!read.ok) throw new Error(read.reason)
    expect(read.projection.mode).toBe('LegacyCompatibility')
    expect(read.projection.personalMoneyBalanceMinor).toBe(0)
    expect(read.projection.employerTreasuryBalanceMinor).toBeNull()
    expect(read.projection.legacyCompanyMoney).toEqual({
      authority: 'GameSession.CompanyState',
      balance: 321,
      isPersonalMoney: false,
    })

    const delivery = completeRealUrbanDelivery(1)
    const work = recordGameSessionSettledDeliveryWork(
      legacySession,
      legacyComposition,
      delivery.sourceOrder,
      delivery.interaction,
    )
    expect(work).toMatchObject({ applied: false, reason: 'legacy-mode' })
    expect(work.composition.economy.personalMoney.balanceMinor).toBe(0)
    expect(legacySession.company.money).toBe(321)
  })
})
