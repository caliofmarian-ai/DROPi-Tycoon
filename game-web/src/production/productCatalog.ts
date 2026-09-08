import type { ProductGroup } from '../world/globalWorld'

export type ProductId = `product:${string}`

export interface ProductDefinition {
  productId: ProductId
  name: string
  group: ProductGroup
  unitLabel: string
}

export const PRODUCT_CATALOG = Object.freeze({
  rawTimber: Object.freeze({
    productId: 'product:raw-timber',
    name: 'Raw timber',
    group: 'RawMaterials',
    unitLabel: 'simulation-unit',
  }),
  woodPulp: Object.freeze({
    productId: 'product:wood-pulp',
    name: 'Wood pulp',
    group: 'PaperPackaging',
    unitLabel: 'simulation-unit',
  }),
  paperPackaging: Object.freeze({
    productId: 'product:paper-packaging',
    name: 'Paper packaging',
    group: 'PaperPackaging',
    unitLabel: 'simulation-unit',
  }),
} satisfies Record<string, ProductDefinition>)

export const productDefinition = (productId: ProductId): ProductDefinition | undefined =>
  Object.values(PRODUCT_CATALOG).find(product => product.productId === productId)
