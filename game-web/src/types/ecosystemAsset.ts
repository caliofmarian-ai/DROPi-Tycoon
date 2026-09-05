/**
 * FUTURE / NOT YET IMPLEMENTED. Declaration-only extension boundary, not a
 * currency, balance, wallet or reward service. Core gameplay must not depend on it.
 */
export interface EcosystemAsset {
  readonly kind: 'optional-ecosystem-asset'
  readonly assetId: string
  readonly implementation: 'not-implemented'
  readonly requiredForCoreGameplay: false
  readonly affectsGameplayPower: false
  readonly convertibleToCompanyMoney: false
}
