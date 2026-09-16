import { describe, expect, it } from 'vitest'
import {
  BASIC_PERSONAL_SMARTPHONE_ASSET_ID,
  applyPersonalAssetAcquisition,
  createPersonalAssetOwnershipState,
  ownsPersonalAsset,
  type PersonalAssetAcquisitionEvidence,
} from '../src/economy/personalAssetOwnership'

const worldInstanceId = 'wi:recovery-phone-test'
const heroActorId = 'actor:hero:test'

const evidence = (overrides: Partial<PersonalAssetAcquisitionEvidence> = {}): PersonalAssetAcquisitionEvidence => ({
  worldInstanceId,
  heroActorId,
  settlementRef: 'settlement:personal-purchase:phone-001',
  asset: {
    assetId: BASIC_PERSONAL_SMARTPHONE_ASSET_ID,
    assetType: 'Smartphone',
    sellerEntityId: 'economic-entity:merchant:phone-shop',
    localityId: 'locality:braila',
    priceMinor: 12_000,
    acquiredAtWorldMinute: 1_200,
  },
  personalMoneyDebited: true,
  sellerCredited: true,
  physicalHandoffConfirmed: true,
  ...overrides,
})

describe('personal asset ownership', () => {
  it('starts with no phone', () => {
    const state = createPersonalAssetOwnershipState(worldInstanceId, heroActorId)
    expect(ownsPersonalAsset(state, BASIC_PERSONAL_SMARTPHONE_ASSET_ID)).toBe(false)
  })

  it('records the basic phone only after money settlement and physical handoff are proven', () => {
    const state = createPersonalAssetOwnershipState(worldInstanceId, heroActorId)
    const result = applyPersonalAssetAcquisition(state, evidence())
    expect(result.applied).toBe(true)
    if (!result.applied) throw new Error(result.reason)
    expect(ownsPersonalAsset(result.state, BASIC_PERSONAL_SMARTPHONE_ASSET_ID)).toBe(true)
    expect(result.asset.priceMinor).toBe(12_000)
    expect(result.asset.acquiredBySettlementRef).toBe('settlement:personal-purchase:phone-001')
  })

  it('does not mint a phone from browsing, narrative or an unproved payment', () => {
    const state = createPersonalAssetOwnershipState(worldInstanceId, heroActorId)
    const noDebit = applyPersonalAssetAcquisition(state, evidence({ personalMoneyDebited: false }))
    expect(noDebit).toMatchObject({ applied: false, reason: 'settlement-not-applied' })
    expect(ownsPersonalAsset(noDebit.state, BASIC_PERSONAL_SMARTPHONE_ASSET_ID)).toBe(false)

    const noHandoff = applyPersonalAssetAcquisition(state, evidence({ physicalHandoffConfirmed: false }))
    expect(noHandoff).toMatchObject({ applied: false, reason: 'handoff-not-confirmed' })
    expect(ownsPersonalAsset(noHandoff.state, BASIC_PERSONAL_SMARTPHONE_ASSET_ID)).toBe(false)
  })

  it('is exactly-once and world/person scoped', () => {
    const initial = createPersonalAssetOwnershipState(worldInstanceId, heroActorId)
    const first = applyPersonalAssetAcquisition(initial, evidence())
    expect(first.applied).toBe(true)
    if (!first.applied) throw new Error(first.reason)

    const replay = applyPersonalAssetAcquisition(first.state, evidence())
    expect(replay).toMatchObject({ applied: false, reason: 'duplicate-settlement' })
    expect(replay.state.assets).toHaveLength(1)

    const wrongWorld = applyPersonalAssetAcquisition(initial, evidence({ worldInstanceId: 'wi:other' }))
    expect(wrongWorld).toMatchObject({ applied: false, reason: 'world-mismatch' })

    const wrongHero = applyPersonalAssetAcquisition(initial, evidence({ heroActorId: 'actor:other' }))
    expect(wrongHero).toMatchObject({ applied: false, reason: 'hero-mismatch' })
  })
})
