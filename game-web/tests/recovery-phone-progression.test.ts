import { describe, expect, it } from 'vitest'
import { validateMissionGraph } from '../src/missions/missionEngine'
import { BASIC_PERSONAL_SMARTPHONE_ASSET_ID, applyPersonalAssetAcquisition, createPersonalAssetOwnershipState } from '../src/economy/personalAssetOwnership'
import { RECOVERY_FACT_IDS } from '../src/narrative/recoveryOpeningV2'
import {
  RECOVERY_PHONE_AUTHORED_REFS,
  RECOVERY_PHONE_FACT_IDS,
  RECOVERY_PHONE_LINE_COPY,
  buildPhoneNeedRealizationSequence,
} from '../src/narrative/recoveryPhoneProgression'
import {
  RECOVERY_PHONE_MISSION_IDS,
  RECOVERY_PHONE_SIGNALS,
  buildRecoveryPhoneMissionBundle,
} from '../src/missions/recoveryPhoneAcquisitionMission'
import { projectSmartphoneFromAuthorities } from '../src/ui/smartphoneProgressionEvidenceAdapter'

const observationDelivery = {
  deliveryMissionId: 'delivery:maria:phoneshop:001',
  orderId: 'order:maria:phoneshop:001',
  parcelIds: ['parcel:maria:phoneshop:001'],
}

const bundle = () => buildRecoveryPhoneMissionBundle({
  phoneRetailerActorId: 'actor:phone-retailer',
  phoneRetailerLocationId: 'location:phone-retailer',
  observationDelivery,
})

describe('recovery phone progression', () => {
  it('uses the same real delivery as observation without attaching a second economic settlement', () => {
    const missions = bundle()
    expect(validateMissionGraph(missions)).toEqual({ valid: true, errors: [] })
    const notice = missions.find(mission => mission.missionId === RECOVERY_PHONE_MISSION_IDS.noticeNeed)!
    const deliveryObjective = notice.stages[0].objectives[0]
    expect(deliveryObjective).toMatchObject({ kind: 'delivery', delivery: observationDelivery, status: 'Delivered' })
    expect(notice.completionConsequences).toEqual([
      { kind: 'WorldFlag', flagId: RECOVERY_PHONE_FACT_IDS.needRealized, value: true },
    ])
  })

  it('does not allow the first-phone story mission before both phone need and founder idea exist', () => {
    const purchase = bundle().find(mission => mission.missionId === RECOVERY_PHONE_MISSION_IDS.buyFirstPhone)!
    expect(purchase.prerequisites).toEqual(expect.arrayContaining([
      { kind: 'worldFlag', flagId: RECOVERY_PHONE_FACT_IDS.needRealized },
      { kind: 'worldFlag', flagId: RECOVERY_FACT_IDS.founderThoughtFormed },
    ]))
    expect(purchase.stages[1].objectives[0]).toMatchObject({
      kind: 'signal',
      signalType: RECOVERY_PHONE_SIGNALS.personalAssetAcquired,
      referenceId: BASIC_PERSONAL_SMARTPHONE_ASSET_ID,
    })
    expect(purchase.completionConsequences).toEqual([
      { kind: 'WorldFlag', flagId: RECOVERY_PHONE_FACT_IDS.firstPhonePurchased, value: true },
    ])
  })

  it('presents phone need as motivation rather than granting an item', () => {
    const sequence = buildPhoneNeedRealizationSequence({
      retailerLabel: 'Local phone shop',
      mission: {
        missionId: RECOVERY_PHONE_MISSION_IDS.noticeNeed,
        authoredRef: RECOVERY_PHONE_AUTHORED_REFS.needRealized,
        signalTypes: [RECOVERY_PHONE_SIGNALS.observeRetailerSystems],
        factIds: [RECOVERY_PHONE_FACT_IDS.needRealized],
      },
    })
    expect(sequence.beats[0].text).toBe(RECOVERY_PHONE_LINE_COPY.observeTracking)
    expect(JSON.stringify(sequence)).not.toContain('PersonalAsset')
    expect(JSON.stringify(sequence)).not.toContain('grant')
  })

  it('keeps phone UI unavailable until actual personal ownership evidence exists', () => {
    const emptyAssets = createPersonalAssetOwnershipState('wi:phone', 'actor:hero')
    const before = projectSmartphoneFromAuthorities({
      personalAssets: emptyAssets,
      registeredStarterEntity: true,
      operationalCompanyCapability: true,
      humanCompanyMembershipActive: true,
      regionalNetworkCapability: true,
      globalNetworkCapability: true,
    })
    expect(before.stage).toBe('NO_PHONE')
    expect(before.surfaces).toEqual([])

    const acquired = applyPersonalAssetAcquisition(emptyAssets, {
      worldInstanceId: 'wi:phone',
      heroActorId: 'actor:hero',
      settlementRef: 'settlement:phone:1',
      asset: {
        assetId: BASIC_PERSONAL_SMARTPHONE_ASSET_ID,
        assetType: 'Smartphone',
        sellerEntityId: 'merchant:phone',
        localityId: 'locality:braila',
        priceMinor: 10_000,
        acquiredAtWorldMinute: 100,
      },
      personalMoneyDebited: true,
      sellerCredited: true,
      physicalHandoffConfirmed: true,
    })
    expect(acquired.applied).toBe(true)
    if (!acquired.applied) throw new Error(acquired.reason)

    const basic = projectSmartphoneFromAuthorities({
      personalAssets: acquired.state,
      registeredStarterEntity: false,
      operationalCompanyCapability: false,
      humanCompanyMembershipActive: false,
      regionalNetworkCapability: false,
      globalNetworkCapability: false,
    })
    expect(basic.stage).toBe('BASIC_PERSONAL_PHONE')
    expect(basic.surfaces).toEqual(['NearbyMap', 'PublicEconomicPlaces'])
  })
})
