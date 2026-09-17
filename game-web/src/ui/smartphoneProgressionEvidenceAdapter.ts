import {
  BASIC_PERSONAL_SMARTPHONE_ASSET_ID,
  ownsPersonalAsset,
  type PersonalAssetOwnershipState,
} from '../economy/personalAssetOwnership'
import {
  projectSmartphoneProgression,
  type SmartphoneProgressionEvidence,
  type SmartphoneProgressionProjection,
} from './smartphoneProgressionPolicy'

export interface SmartphoneAuthorityEvidence {
  personalAssets?: PersonalAssetOwnershipState
  registeredStarterEntity: boolean
  operationalCompanyCapability: boolean
  humanCompanyMembershipActive: boolean
  regionalNetworkCapability: boolean
  globalNetworkCapability: boolean
}

/**
 * One-way adapter from owning domains into phone presentation policy. It does not infer phone
 * ownership from story flags, screen state, Maria progress, player level, revenue or a map marker.
 */
export const smartphoneProgressionEvidenceFromAuthorities = (
  evidence: SmartphoneAuthorityEvidence,
): SmartphoneProgressionEvidence => ({
  ownsSmartphone: ownsPersonalAsset(evidence.personalAssets, BASIC_PERSONAL_SMARTPHONE_ASSET_ID),
  registeredStarterEntity: evidence.registeredStarterEntity,
  operationalCompanyCapability: evidence.operationalCompanyCapability,
  humanCompanyMembershipActive: evidence.humanCompanyMembershipActive,
  regionalNetworkCapability: evidence.regionalNetworkCapability,
  globalNetworkCapability: evidence.globalNetworkCapability,
})

export const projectSmartphoneFromAuthorities = (
  evidence: SmartphoneAuthorityEvidence,
): SmartphoneProgressionProjection =>
  projectSmartphoneProgression(smartphoneProgressionEvidenceFromAuthorities(evidence))
