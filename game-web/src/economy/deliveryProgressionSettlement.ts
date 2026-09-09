import type { UrbanInteractionResult } from '../systems/urbanInteractions'
import {
  PROTOTYPE_WORLD_CLOCK_POLICY,
  type WorldClockPolicy,
} from '../systems/worldClockSystem'
import { sanitizePersonalProgression } from '../systems/personalCapabilitySystem'
import type { OrderState, PersonalProgressionState } from '../types/game'
import type { WorldClockState } from '../world/globalWorld'
import {
  PROTOTYPE_PLAYER_ECONOMY_POLICY,
  type PlayerEconomyPolicy,
  type PlayerEconomyState,
} from './playerEconomy'
import {
  recordSettledUrbanDeliveryWork,
  type RuntimeProductiveWorkResult,
} from './playerEconomyRuntimeAdapter'

export const DELIVERY_PROGRESSION_SETTLEMENT_STATE_VERSION = 1 as const

export const DELIVERY_PROGRESSION_SOURCE_KINDS = [
  'EmployerService',
  'ProducerLogistics',
  'MarketplaceFulfillment',
] as const
export type DeliveryProgressionSourceKind = (typeof DELIVERY_PROGRESSION_SOURCE_KINDS)[number]

export const MARKETPLACE_PHYSICAL_ITEM_KINDS = [
  'SpecialistFragment',
  'OtherPhysicalInventory',
] as const
export type MarketplacePhysicalItemKind = (typeof MARKETPLACE_PHYSICAL_ITEM_KINDS)[number]

export interface EntityLoyaltyBalance {
  entityId: string
  points: number
}

/**
 * Stable earned inventory object. A later governed marketplace transfer must move this
 * same object through custody; it must never create a replacement fragment merely
 * because another delivery took place.
 */
export interface SpecialistFragmentInventoryItem {
  fragmentId: string
  specialistFamilyId: string
  sourceEconomicEntityId: string
  sourceAffinityRef: string
  mintSettlementReceiptId: string
}

export interface DeliveryProgressionMoneyConsequence {
  kind: 'ProductiveWorkTowardShiftWage'
  workActivityId: string
  productiveMinutes: number
}

export interface DeliverySettlementReceipt {
  receiptId: string
  worldInstanceId: string
  heroActorId: string
  orderId: string
  rewardPolicyId: string
  servedEntityId: string
  sourceKind: DeliveryProgressionSourceKind
  marketplaceTransactionId?: string
  moneyConsequence: DeliveryProgressionMoneyConsequence
  xpAwarded: number
  loyaltyAward?: {
    entityId: string
    points: number
  }
  fragmentIds: string[]
}

/**
 * DT-03 authority for the #653 consequences that did not previously have a runtime
 * owner. Player XP remains in the existing PersonalProgressionState; Personal Money
 * and Work Capacity remain in PlayerEconomyState.
 */
export interface DeliveryProgressionSettlementState {
  version: typeof DELIVERY_PROGRESSION_SETTLEMENT_STATE_VERSION
  worldInstanceId: string
  heroActorId: string
  entityLoyalty: EntityLoyaltyBalance[]
  fragmentInventory: SpecialistFragmentInventoryItem[]
  receipts: DeliverySettlementReceipt[]
}

export interface MarketplaceFulfillmentEvidence {
  marketTransactionId: string
  buyerActorId: string
  sellerActorId: string
  itemKind: MarketplacePhysicalItemKind
}

/**
 * Evidence is supplied by owning authorities. DT-03 does not infer entity identity,
 * marketplace parties, economic affinity or physical custody from map labels.
 */
export interface DeliverySettlementEvidence {
  servedEntityId: string
  sourceKind: DeliveryProgressionSourceKind
  marketplace?: MarketplaceFulfillmentEvidence
}

/** Exact amounts/curves are governed caller-supplied balancing data, not hardcoded here. */
export interface GovernedDeliveryProgressionGrant {
  policyId: string
  xp: number
  loyalty?: {
    entityId: string
    points: number
  }
  specialistFragment?: {
    specialistFamilyId: string
    sourceEconomicEntityId: string
    affinityRef: string
    quantity: number
  }
}

type RuntimeProductiveWorkFailureReason = Extract<
  RuntimeProductiveWorkResult,
  { applied: false }
>['reason']

export type DeliveryProgressionSettlementFailureReason =
  | 'invalid-settlement-state'
  | 'invalid-progression-state'
  | 'invalid-evidence'
  | 'invalid-grant'
  | 'loyalty-entity-mismatch'
  | 'fragment-entity-mismatch'
  | 'marketplace-context-required'
  | 'self-dealing-marketplace'
  | 'fragment-remint-forbidden'
  | 'already-settled'
  | RuntimeProductiveWorkFailureReason

export type DeliveryProgressionSettlementResult =
  | {
      applied: true
      economy: PlayerEconomyState
      personalProgression: PersonalProgressionState
      settlementState: DeliveryProgressionSettlementState
      receipt: DeliverySettlementReceipt
    }
  | {
      applied: false
      economy: PlayerEconomyState
      personalProgression: PersonalProgressionState
      settlementState: DeliveryProgressionSettlementState
      reason: DeliveryProgressionSettlementFailureReason
    }

const MAX_INPUT_TOKEN_LENGTH = 160
const MAX_STABLE_ID_LENGTH = 1024

const validInputToken = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0 && value.trim().length <= MAX_INPUT_TOKEN_LENGTH

const validStableId = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0 && value.trim().length <= MAX_STABLE_ID_LENGTH

const validNonNegativeInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0

const validPositiveInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value > 0

const validSourceKind = (value: unknown): value is DeliveryProgressionSourceKind =>
  typeof value === 'string' && DELIVERY_PROGRESSION_SOURCE_KINDS.some(kind => kind === value)

const validMarketplaceItemKind = (value: unknown): value is MarketplacePhysicalItemKind =>
  typeof value === 'string' && MARKETPLACE_PHYSICAL_ITEM_KINDS.some(kind => kind === value)

const clonePersonalProgression = (state: PersonalProgressionState): PersonalProgressionState => ({
  experiencePoints: state.experiencePoints,
  progressionPoints: state.progressionPoints,
  learnedCapabilityIds: [...state.learnedCapabilityIds],
})

const cloneReceipt = (receipt: DeliverySettlementReceipt): DeliverySettlementReceipt => ({
  ...receipt,
  moneyConsequence: { ...receipt.moneyConsequence },
  loyaltyAward: receipt.loyaltyAward ? { ...receipt.loyaltyAward } : undefined,
  fragmentIds: [...receipt.fragmentIds],
})

const cloneSettlementState = (
  state: DeliveryProgressionSettlementState,
): DeliveryProgressionSettlementState => ({
  ...state,
  entityLoyalty: state.entityLoyalty.map(entry => ({ ...entry })),
  fragmentInventory: state.fragmentInventory.map(item => ({ ...item })),
  receipts: state.receipts.map(cloneReceipt),
})

const settlementReceiptIdFor = (
  economy: Pick<PlayerEconomyState, 'worldInstanceId' | 'heroActorId'>,
  orderId: string,
): string => `delivery-settlement:${economy.worldInstanceId}:${economy.heroActorId}:${orderId.trim()}`

const fragmentIdFor = (receiptId: string, index: number): string =>
  `fragment:${receiptId}:${index}`

const validReceipt = (receipt: DeliverySettlementReceipt): boolean => {
  if (
    !validStableId(receipt.receiptId) ||
    !validStableId(receipt.worldInstanceId) ||
    !validStableId(receipt.heroActorId) ||
    !validInputToken(receipt.orderId) ||
    !validInputToken(receipt.rewardPolicyId) ||
    !validInputToken(receipt.servedEntityId) ||
    !validSourceKind(receipt.sourceKind) ||
    !validStableId(receipt.moneyConsequence.workActivityId) ||
    !validPositiveInteger(receipt.moneyConsequence.productiveMinutes) ||
    !validPositiveInteger(receipt.xpAwarded)
  ) {
    return false
  }
  if (receipt.moneyConsequence.kind !== 'ProductiveWorkTowardShiftWage') return false
  if (receipt.sourceKind === 'MarketplaceFulfillment' && !validInputToken(receipt.marketplaceTransactionId)) return false
  if (receipt.sourceKind !== 'MarketplaceFulfillment' && receipt.marketplaceTransactionId !== undefined) return false
  if (receipt.loyaltyAward) {
    if (!validInputToken(receipt.loyaltyAward.entityId) || !validPositiveInteger(receipt.loyaltyAward.points)) return false
  }
  const fragmentIds = new Set<string>()
  for (const fragmentId of receipt.fragmentIds) {
    if (!validStableId(fragmentId) || fragmentIds.has(fragmentId)) return false
    fragmentIds.add(fragmentId)
  }
  return true
}

const validSettlementState = (
  state: DeliveryProgressionSettlementState,
  economy: PlayerEconomyState,
): boolean => {
  if (
    state.version !== DELIVERY_PROGRESSION_SETTLEMENT_STATE_VERSION ||
    state.worldInstanceId !== economy.worldInstanceId ||
    state.heroActorId !== economy.heroActorId ||
    !Array.isArray(state.entityLoyalty) ||
    !Array.isArray(state.fragmentInventory) ||
    !Array.isArray(state.receipts)
  ) {
    return false
  }

  const loyaltyIds = new Set<string>()
  for (const balance of state.entityLoyalty) {
    if (!validInputToken(balance.entityId) || !validNonNegativeInteger(balance.points) || loyaltyIds.has(balance.entityId)) return false
    loyaltyIds.add(balance.entityId)
  }

  const fragmentIds = new Set<string>()
  for (const fragment of state.fragmentInventory) {
    if (
      !validStableId(fragment.fragmentId) ||
      !validInputToken(fragment.specialistFamilyId) ||
      !validInputToken(fragment.sourceEconomicEntityId) ||
      !validInputToken(fragment.sourceAffinityRef) ||
      !validStableId(fragment.mintSettlementReceiptId) ||
      fragmentIds.has(fragment.fragmentId)
    ) {
      return false
    }
    fragmentIds.add(fragment.fragmentId)
  }

  const receiptIds = new Set<string>()
  const orderIds = new Set<string>()
  for (const receipt of state.receipts) {
    if (
      !validReceipt(receipt) ||
      receipt.worldInstanceId !== state.worldInstanceId ||
      receipt.heroActorId !== state.heroActorId ||
      receiptIds.has(receipt.receiptId) ||
      orderIds.has(receipt.orderId)
    ) {
      return false
    }
    receiptIds.add(receipt.receiptId)
    orderIds.add(receipt.orderId)
  }

  return true
}

const validateGrant = (grant: GovernedDeliveryProgressionGrant): DeliveryProgressionSettlementFailureReason | null => {
  if (!validInputToken(grant.policyId) || !validPositiveInteger(grant.xp)) return 'invalid-grant'
  if (grant.loyalty && (!validInputToken(grant.loyalty.entityId) || !validPositiveInteger(grant.loyalty.points))) {
    return 'invalid-grant'
  }
  if (grant.specialistFragment && (
    !validInputToken(grant.specialistFragment.specialistFamilyId) ||
    !validInputToken(grant.specialistFragment.sourceEconomicEntityId) ||
    !validInputToken(grant.specialistFragment.affinityRef) ||
    !validPositiveInteger(grant.specialistFragment.quantity)
  )) {
    return 'invalid-grant'
  }
  return null
}

const validateEvidenceAndAntiFarming = (
  heroActorId: string,
  evidence: DeliverySettlementEvidence,
  grant: GovernedDeliveryProgressionGrant,
): DeliveryProgressionSettlementFailureReason | null => {
  if (!validInputToken(evidence.servedEntityId) || !validSourceKind(evidence.sourceKind)) return 'invalid-evidence'

  if (grant.loyalty && grant.loyalty.entityId !== evidence.servedEntityId) {
    return 'loyalty-entity-mismatch'
  }
  if (grant.specialistFragment && grant.specialistFragment.sourceEconomicEntityId !== evidence.servedEntityId) {
    return 'fragment-entity-mismatch'
  }

  if (evidence.sourceKind !== 'MarketplaceFulfillment') {
    return evidence.marketplace === undefined ? null : 'invalid-evidence'
  }

  const marketplace = evidence.marketplace
  if (!marketplace) return 'marketplace-context-required'
  if (
    !validInputToken(marketplace.marketTransactionId) ||
    !validInputToken(marketplace.buyerActorId) ||
    !validInputToken(marketplace.sellerActorId) ||
    !validMarketplaceItemKind(marketplace.itemKind)
  ) {
    return 'invalid-evidence'
  }
  if (
    marketplace.buyerActorId === marketplace.sellerActorId ||
    heroActorId === marketplace.buyerActorId ||
    heroActorId === marketplace.sellerActorId
  ) {
    return 'self-dealing-marketplace'
  }
  if (
    evidence.servedEntityId !== marketplace.buyerActorId &&
    evidence.servedEntityId !== marketplace.sellerActorId
  ) {
    return 'invalid-evidence'
  }
  if (marketplace.itemKind === 'SpecialistFragment' && grant.specialistFragment) {
    return 'fragment-remint-forbidden'
  }
  return null
}

const addLoyalty = (
  balances: readonly EntityLoyaltyBalance[],
  award: GovernedDeliveryProgressionGrant['loyalty'],
): EntityLoyaltyBalance[] | null => {
  if (!award) return balances.map(entry => ({ ...entry }))
  const current = balances.find(entry => entry.entityId === award.entityId)?.points ?? 0
  const nextPoints = current + award.points
  if (!validNonNegativeInteger(nextPoints)) return null
  const found = balances.some(entry => entry.entityId === award.entityId)
  return found
    ? balances.map(entry => entry.entityId === award.entityId ? { ...entry, points: nextPoints } : { ...entry })
    : [...balances.map(entry => ({ ...entry })), { entityId: award.entityId, points: award.points }]
}

export const createDeliveryProgressionSettlementState = (
  economy: Pick<PlayerEconomyState, 'worldInstanceId' | 'heroActorId'>,
): DeliveryProgressionSettlementState => ({
  version: DELIVERY_PROGRESSION_SETTLEMENT_STATE_VERSION,
  worldInstanceId: economy.worldInstanceId,
  heroActorId: economy.heroActorId,
  entityLoyalty: [],
  fragmentInventory: [],
  receipts: [],
})

/**
 * Applies the #653 progression stack only after the existing DT-03 runtime adapter
 * accepts a legitimate already-settled delivery as productive work.
 *
 * Money is deliberately not minted per parcel: the delivery contributes productive
 * work toward the existing exactly-once employer-funded shift wage from #436.
 *
 * This function is not mounted into GameSession persistence yet. The persistence owner
 * must commit the PlayerEconomy work receipt, PersonalProgression XP and this receipt
 * state atomically (or by an equivalent durable transactional workflow) before live
 * save/reload activation, otherwise partial commits correctly fail closed on retry.
 */
export const settleLegitimateDeliveryProgression = (
  economy: PlayerEconomyState,
  personalProgression: PersonalProgressionState,
  settlementState: DeliveryProgressionSettlementState,
  clock: WorldClockState,
  sourceOrder: OrderState,
  interaction: Pick<UrbanInteractionResult, 'settled' | 'world'>,
  evidence: DeliverySettlementEvidence,
  grant: GovernedDeliveryProgressionGrant,
  policy: PlayerEconomyPolicy = PROTOTYPE_PLAYER_ECONOMY_POLICY,
  clockPolicy: WorldClockPolicy = PROTOTYPE_WORLD_CLOCK_POLICY,
): DeliveryProgressionSettlementResult => {
  const unchanged = (reason: DeliveryProgressionSettlementFailureReason): DeliveryProgressionSettlementResult => ({
    applied: false,
    economy,
    personalProgression,
    settlementState,
    reason,
  })

  if (!validSettlementState(settlementState, economy)) return unchanged('invalid-settlement-state')

  const sanitizedProgression = sanitizePersonalProgression(personalProgression)
  if (sanitizedProgression.repaired) return unchanged('invalid-progression-state')

  const grantFailure = validateGrant(grant)
  if (grantFailure) return unchanged(grantFailure)
  const evidenceFailure = validateEvidenceAndAntiFarming(economy.heroActorId, evidence, grant)
  if (evidenceFailure) return unchanged(evidenceFailure)

  if (!validInputToken(sourceOrder.orderId)) return unchanged('invalid-order')
  const receiptId = settlementReceiptIdFor(economy, sourceOrder.orderId)
  if (settlementState.receipts.some(receipt => receipt.receiptId === receiptId || receipt.orderId === sourceOrder.orderId)) {
    return unchanged('already-settled')
  }

  const nextExperiencePoints = personalProgression.experiencePoints + grant.xp
  if (!validNonNegativeInteger(nextExperiencePoints)) return unchanged('invalid-grant')

  const loyalty = addLoyalty(settlementState.entityLoyalty, grant.loyalty)
  if (!loyalty) return unchanged('invalid-grant')

  const work = recordSettledUrbanDeliveryWork(
    economy,
    clock,
    sourceOrder,
    interaction,
    policy,
    clockPolicy,
  )
  if (!work.applied) return unchanged(work.reason)

  const fragmentItems: SpecialistFragmentInventoryItem[] = []
  if (grant.specialistFragment) {
    for (let index = 0; index < grant.specialistFragment.quantity; index += 1) {
      fragmentItems.push({
        fragmentId: fragmentIdFor(receiptId, index),
        specialistFamilyId: grant.specialistFragment.specialistFamilyId,
        sourceEconomicEntityId: grant.specialistFragment.sourceEconomicEntityId,
        sourceAffinityRef: grant.specialistFragment.affinityRef,
        mintSettlementReceiptId: receiptId,
      })
    }
  }

  const receipt: DeliverySettlementReceipt = {
    receiptId,
    worldInstanceId: economy.worldInstanceId,
    heroActorId: economy.heroActorId,
    orderId: sourceOrder.orderId,
    rewardPolicyId: grant.policyId,
    servedEntityId: evidence.servedEntityId,
    sourceKind: evidence.sourceKind,
    marketplaceTransactionId: evidence.marketplace?.marketTransactionId,
    moneyConsequence: {
      kind: 'ProductiveWorkTowardShiftWage',
      workActivityId: work.activityId,
      productiveMinutes: work.productiveMinutes,
    },
    xpAwarded: grant.xp,
    loyaltyAward: grant.loyalty ? { ...grant.loyalty } : undefined,
    fragmentIds: fragmentItems.map(item => item.fragmentId),
  }

  const nextProgression = clonePersonalProgression(personalProgression)
  nextProgression.experiencePoints = nextExperiencePoints

  const nextSettlementState: DeliveryProgressionSettlementState = {
    ...cloneSettlementState(settlementState),
    entityLoyalty: loyalty,
    fragmentInventory: [
      ...settlementState.fragmentInventory.map(item => ({ ...item })),
      ...fragmentItems,
    ],
    receipts: [...settlementState.receipts.map(cloneReceipt), cloneReceipt(receipt)],
  }

  return {
    applied: true,
    economy: work.state,
    personalProgression: nextProgression,
    settlementState: nextSettlementState,
    receipt: cloneReceipt(receipt),
  }
}
