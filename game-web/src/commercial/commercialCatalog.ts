export const COMMERCIAL_EFFECT_NONE = 'NONE' as const
export const COMMERCIAL_SCOPE_ACCOUNT_PRESENTATION_ONLY = 'ACCOUNT_PRESENTATION_ONLY' as const

export type CommercialProductId = string
export type CommercialEntitlementId = string
export type CommercialProductType = 'NON_CONSUMABLE' | 'SUBSCRIPTION' | 'CONSUMABLE'
export type CommercialEntitlementFamily =
  | 'SUPPORTER'
  | 'PROFILE_COSMETIC'
  | 'PHONE_COSMETIC'
  | 'VEHICLE_COSMETIC'

export interface CommercialEntitlementDefinition {
  entitlementId: CommercialEntitlementId
  scope: typeof COMMERCIAL_SCOPE_ACCOUNT_PRESENTATION_ONLY
  family: CommercialEntitlementFamily
  economicEffect: typeof COMMERCIAL_EFFECT_NONE
  worldPowerEffect: typeof COMMERCIAL_EFFECT_NONE
  contentBindingRequired: boolean
}

export interface CommercialProductDefinition {
  productId: CommercialProductId
  productType: CommercialProductType
  entitlementIds: readonly CommercialEntitlementId[]
  economicEffect: typeof COMMERCIAL_EFFECT_NONE
  worldPowerEffect: typeof COMMERCIAL_EFFECT_NONE
}

export interface CommercialCatalog {
  catalogId: string
  catalogVersion: string
  products: readonly CommercialProductDefinition[]
  entitlements: readonly CommercialEntitlementDefinition[]
}

export type CommercialCatalogValidation =
  | { valid: true }
  | { valid: false; errors: readonly string[] }

const MAX_ID_LENGTH = 180

const validId = (value: unknown): value is string =>
  typeof value === 'string' &&
  value.length > 0 &&
  value.length <= MAX_ID_LENGTH &&
  value.trim() === value

export const validateCommercialCatalog = (
  catalog: CommercialCatalog,
): CommercialCatalogValidation => {
  const errors: string[] = []

  if (!validId(catalog.catalogId)) errors.push('invalid-catalog-id')
  if (!validId(catalog.catalogVersion)) errors.push('invalid-catalog-version')

  const entitlementIds = new Set<string>()
  for (const entitlement of catalog.entitlements) {
    if (!validId(entitlement.entitlementId)) {
      errors.push('invalid-entitlement-id')
      continue
    }
    if (entitlementIds.has(entitlement.entitlementId)) {
      errors.push(`duplicate-entitlement:${entitlement.entitlementId}`)
    }
    entitlementIds.add(entitlement.entitlementId)

    if (entitlement.scope !== COMMERCIAL_SCOPE_ACCOUNT_PRESENTATION_ONLY) {
      errors.push(`prohibited-entitlement-scope:${entitlement.entitlementId}`)
    }
    if (entitlement.economicEffect !== COMMERCIAL_EFFECT_NONE) {
      errors.push(`economic-effect-not-none:${entitlement.entitlementId}`)
    }
    if (entitlement.worldPowerEffect !== COMMERCIAL_EFFECT_NONE) {
      errors.push(`world-power-effect-not-none:${entitlement.entitlementId}`)
    }
  }

  const productIds = new Set<string>()
  for (const product of catalog.products) {
    if (!validId(product.productId)) {
      errors.push('invalid-product-id')
      continue
    }
    if (productIds.has(product.productId)) {
      errors.push(`duplicate-product:${product.productId}`)
    }
    productIds.add(product.productId)

    if (product.productType !== 'NON_CONSUMABLE') {
      errors.push(`v1-product-type-not-allowed:${product.productId}`)
    }
    if (product.economicEffect !== COMMERCIAL_EFFECT_NONE) {
      errors.push(`economic-effect-not-none:${product.productId}`)
    }
    if (product.worldPowerEffect !== COMMERCIAL_EFFECT_NONE) {
      errors.push(`world-power-effect-not-none:${product.productId}`)
    }
    if (product.entitlementIds.length === 0) {
      errors.push(`empty-entitlement-bundle:${product.productId}`)
    }

    const productEntitlements = new Set<string>()
    for (const entitlementId of product.entitlementIds) {
      if (!validId(entitlementId)) {
        errors.push(`invalid-entitlement-reference:${product.productId}`)
        continue
      }
      if (productEntitlements.has(entitlementId)) {
        errors.push(`duplicate-product-entitlement:${product.productId}:${entitlementId}`)
      }
      productEntitlements.add(entitlementId)
      if (!entitlementIds.has(entitlementId)) {
        errors.push(`unknown-entitlement:${product.productId}:${entitlementId}`)
      }
    }
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors }
}

export const getCommercialProduct = (
  catalog: CommercialCatalog,
  productId: string,
): CommercialProductDefinition | null =>
  catalog.products.find((product) => product.productId === productId) ?? null

export const getCommercialEntitlement = (
  catalog: CommercialCatalog,
  entitlementId: string,
): CommercialEntitlementDefinition | null =>
  catalog.entitlements.find((entitlement) => entitlement.entitlementId === entitlementId) ?? null

const V1_ENTITLEMENTS: readonly CommercialEntitlementDefinition[] = Object.freeze([
  Object.freeze({
    entitlementId: 'commercial.entitlement.account.supporter.early_badge.v1',
    scope: COMMERCIAL_SCOPE_ACCOUNT_PRESENTATION_ONLY,
    family: 'SUPPORTER',
    economicEffect: COMMERCIAL_EFFECT_NONE,
    worldPowerEffect: COMMERCIAL_EFFECT_NONE,
    contentBindingRequired: false,
  }),
  Object.freeze({
    entitlementId: 'commercial.entitlement.account.cosmetic.profile_frame.early_supporter.v1',
    scope: COMMERCIAL_SCOPE_ACCOUNT_PRESENTATION_ONLY,
    family: 'PROFILE_COSMETIC',
    economicEffect: COMMERCIAL_EFFECT_NONE,
    worldPowerEffect: COMMERCIAL_EFFECT_NONE,
    contentBindingRequired: true,
  }),
  Object.freeze({
    entitlementId: 'commercial.entitlement.account.cosmetic.phone_theme.early_supporter.v1',
    scope: COMMERCIAL_SCOPE_ACCOUNT_PRESENTATION_ONLY,
    family: 'PHONE_COSMETIC',
    economicEffect: COMMERCIAL_EFFECT_NONE,
    worldPowerEffect: COMMERCIAL_EFFECT_NONE,
    contentBindingRequired: true,
  }),
  Object.freeze({
    entitlementId: 'commercial.entitlement.account.cosmetic.vehicle_livery.early_supporter.v1',
    scope: COMMERCIAL_SCOPE_ACCOUNT_PRESENTATION_ONLY,
    family: 'VEHICLE_COSMETIC',
    economicEffect: COMMERCIAL_EFFECT_NONE,
    worldPowerEffect: COMMERCIAL_EFFECT_NONE,
    contentBindingRequired: true,
  }),
  Object.freeze({
    entitlementId: 'commercial.entitlement.account.cosmetic.phone_theme.pack_01.v1',
    scope: COMMERCIAL_SCOPE_ACCOUNT_PRESENTATION_ONLY,
    family: 'PHONE_COSMETIC',
    economicEffect: COMMERCIAL_EFFECT_NONE,
    worldPowerEffect: COMMERCIAL_EFFECT_NONE,
    contentBindingRequired: true,
  }),
  Object.freeze({
    entitlementId: 'commercial.entitlement.account.cosmetic.vehicle_livery.pack_01.v1',
    scope: COMMERCIAL_SCOPE_ACCOUNT_PRESENTATION_ONLY,
    family: 'VEHICLE_COSMETIC',
    economicEffect: COMMERCIAL_EFFECT_NONE,
    worldPowerEffect: COMMERCIAL_EFFECT_NONE,
    contentBindingRequired: true,
  }),
])

const V1_PRODUCTS: readonly CommercialProductDefinition[] = Object.freeze([
  Object.freeze({
    productId: 'commercial.product.supporter.early.v1',
    productType: 'NON_CONSUMABLE',
    entitlementIds: Object.freeze([
      'commercial.entitlement.account.supporter.early_badge.v1',
      'commercial.entitlement.account.cosmetic.profile_frame.early_supporter.v1',
      'commercial.entitlement.account.cosmetic.phone_theme.early_supporter.v1',
      'commercial.entitlement.account.cosmetic.vehicle_livery.early_supporter.v1',
    ]),
    economicEffect: COMMERCIAL_EFFECT_NONE,
    worldPowerEffect: COMMERCIAL_EFFECT_NONE,
  }),
  Object.freeze({
    productId: 'commercial.product.cosmetic.phone_theme_pack_01.v1',
    productType: 'NON_CONSUMABLE',
    entitlementIds: Object.freeze([
      'commercial.entitlement.account.cosmetic.phone_theme.pack_01.v1',
    ]),
    economicEffect: COMMERCIAL_EFFECT_NONE,
    worldPowerEffect: COMMERCIAL_EFFECT_NONE,
  }),
  Object.freeze({
    productId: 'commercial.product.cosmetic.vehicle_livery_pack_01.v1',
    productType: 'NON_CONSUMABLE',
    entitlementIds: Object.freeze([
      'commercial.entitlement.account.cosmetic.vehicle_livery.pack_01.v1',
    ]),
    economicEffect: COMMERCIAL_EFFECT_NONE,
    worldPowerEffect: COMMERCIAL_EFFECT_NONE,
  }),
])

export const V1_COMMERCIAL_CATALOG: Readonly<CommercialCatalog> = Object.freeze({
  catalogId: 'dropi-tycoon-commercial-v1',
  catalogVersion: '1.0.0',
  products: V1_PRODUCTS,
  entitlements: V1_ENTITLEMENTS,
})
