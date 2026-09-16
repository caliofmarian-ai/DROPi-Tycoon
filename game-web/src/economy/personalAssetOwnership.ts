export const PERSONAL_ASSET_OWNERSHIP_VERSION = 1 as const

export const BASIC_PERSONAL_SMARTPHONE_ASSET_ID = 'personal-asset:smartphone:basic' as const

export interface PersonalOwnedAsset {
  assetId: string
  assetType: 'Smartphone' | 'Equipment' | 'Vehicle' | 'PropertyRight' | 'Collectible'
  acquiredBySettlementRef: string
  sellerEntityId: string
  localityId: string
  priceMinor: number
  acquiredAtWorldMinute: number
}

export interface PersonalAssetOwnershipState {
  version: typeof PERSONAL_ASSET_OWNERSHIP_VERSION
  worldInstanceId: string
  heroActorId: string
  assets: PersonalOwnedAsset[]
  processedSettlementRefs: string[]
}

export interface PersonalAssetAcquisitionEvidence {
  worldInstanceId: string
  heroActorId: string
  settlementRef: string
  asset: Omit<PersonalOwnedAsset, 'acquiredBySettlementRef'>
  /** Evidence projected by Player Economy / transaction authority. */
  personalMoneyDebited: boolean
  /** Conservation counterpart: the seller/merchant actually received settlement. */
  sellerCredited: boolean
  /** Physical-world handoff/custody evidence; browsing a listing is never ownership. */
  physicalHandoffConfirmed: boolean
}

export type PersonalAssetAcquisitionBlocker =
  | 'invalid-state'
  | 'invalid-evidence'
  | 'world-mismatch'
  | 'hero-mismatch'
  | 'settlement-not-applied'
  | 'handoff-not-confirmed'
  | 'duplicate-settlement'
  | 'asset-already-owned'

export type PersonalAssetAcquisitionResult =
  | { applied: true; state: PersonalAssetOwnershipState; asset: PersonalOwnedAsset }
  | { applied: false; state: PersonalAssetOwnershipState; reason: PersonalAssetAcquisitionBlocker }

const MAX_ID = 180
const validId = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0 && value.trim().length <= MAX_ID
const validMoney = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value > 0
const validMinute = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0

export const createPersonalAssetOwnershipState = (
  worldInstanceId: string,
  heroActorId: string,
): PersonalAssetOwnershipState => {
  if (!validId(worldInstanceId) || !validId(heroActorId)) throw new Error('Invalid personal asset identity')
  return {
    version: PERSONAL_ASSET_OWNERSHIP_VERSION,
    worldInstanceId,
    heroActorId,
    assets: [],
    processedSettlementRefs: [],
  }
}

export const personalAssetOwnershipIsValid = (state: PersonalAssetOwnershipState): boolean => {
  if (
    state.version !== PERSONAL_ASSET_OWNERSHIP_VERSION ||
    !validId(state.worldInstanceId) ||
    !validId(state.heroActorId) ||
    new Set(state.processedSettlementRefs).size !== state.processedSettlementRefs.length ||
    state.processedSettlementRefs.some(ref => !validId(ref))
  ) return false

  const seenAssets = new Set<string>()
  for (const asset of state.assets) {
    if (
      !validId(asset.assetId) || seenAssets.has(asset.assetId) ||
      !validId(asset.acquiredBySettlementRef) || !validId(asset.sellerEntityId) || !validId(asset.localityId) ||
      !validMoney(asset.priceMinor) || !validMinute(asset.acquiredAtWorldMinute) ||
      !state.processedSettlementRefs.includes(asset.acquiredBySettlementRef)
    ) return false
    seenAssets.add(asset.assetId)
  }
  return true
}

export const ownsPersonalAsset = (
  state: PersonalAssetOwnershipState | undefined,
  assetId: string,
): boolean => Boolean(state && validId(assetId) && state.assets.some(asset => asset.assetId === assetId))

/**
 * This domain records durable personal ownership only after the authoritative money transaction
 * and physical handoff have both happened. It deliberately does NOT debit Personal Money itself.
 * Marketplace/UI/narrative code may request a purchase but cannot mint an asset by calling this
 * function with unproved booleans; the runtime adapter must source them from the owning domains.
 */
export const applyPersonalAssetAcquisition = (
  state: PersonalAssetOwnershipState,
  evidence: PersonalAssetAcquisitionEvidence,
): PersonalAssetAcquisitionResult => {
  if (!personalAssetOwnershipIsValid(state)) return { applied: false, state, reason: 'invalid-state' }
  const { asset } = evidence
  if (
    !validId(evidence.worldInstanceId) || !validId(evidence.heroActorId) || !validId(evidence.settlementRef) ||
    !validId(asset.assetId) || !validId(asset.sellerEntityId) || !validId(asset.localityId) ||
    !validMoney(asset.priceMinor) || !validMinute(asset.acquiredAtWorldMinute)
  ) return { applied: false, state, reason: 'invalid-evidence' }
  if (evidence.worldInstanceId !== state.worldInstanceId) return { applied: false, state, reason: 'world-mismatch' }
  if (evidence.heroActorId !== state.heroActorId) return { applied: false, state, reason: 'hero-mismatch' }
  if (!evidence.personalMoneyDebited || !evidence.sellerCredited) return { applied: false, state, reason: 'settlement-not-applied' }
  if (!evidence.physicalHandoffConfirmed) return { applied: false, state, reason: 'handoff-not-confirmed' }
  if (state.processedSettlementRefs.includes(evidence.settlementRef)) return { applied: false, state, reason: 'duplicate-settlement' }
  if (ownsPersonalAsset(state, asset.assetId)) return { applied: false, state, reason: 'asset-already-owned' }

  const owned: PersonalOwnedAsset = { ...asset, acquiredBySettlementRef: evidence.settlementRef }
  const next: PersonalAssetOwnershipState = {
    ...state,
    assets: [...state.assets, owned],
    processedSettlementRefs: [...state.processedSettlementRefs, evidence.settlementRef],
  }
  if (!personalAssetOwnershipIsValid(next)) return { applied: false, state, reason: 'invalid-state' }
  return { applied: true, state: next, asset: owned }
}
