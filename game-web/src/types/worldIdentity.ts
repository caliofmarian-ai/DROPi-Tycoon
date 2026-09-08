export const WORLD_IDENTITY_MODES = ['LegacyLocal', 'FreshLocal'] as const
export type WorldIdentityMode = (typeof WORLD_IDENTITY_MODES)[number]

/**
 * Account identity is portable product identity. Hero/worldActor identity is local to one
 * World Instance and must never be reused as a cross-world economic actor identifier.
 */
export interface WorldIdentityState {
  worldInstanceId: string
  accountId: string
  heroActorId: string
  baselineVersion: string
  mapDatasetVersion: string
  mode: WorldIdentityMode
}
