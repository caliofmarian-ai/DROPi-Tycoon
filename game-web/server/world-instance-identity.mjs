const MAX_ID_LENGTH = 128
const MAX_VERSION_LENGTH = 128

const cleanToken = (value, maxLength) => {
  if (typeof value !== 'string') return null
  const cleaned = value.trim()
  if (cleaned.length === 0 || cleaned.length > maxLength) return null
  return cleaned
}

/**
 * Server-side copy of the B1 local fingerprint contract.
 * This is not authentication or cryptographic identity. A deterministic compatibility
 * test locks this helper to `src/systems/worldIdentitySystem.ts` until a shared runtime
 * package can replace the boundary safely.
 */
const stableFingerprint = value => {
  let a = 0x811c9dc5
  let b = 0x9e3779b9
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index)
    a = Math.imul(a ^ code, 0x01000193) >>> 0
    b = Math.imul(b ^ code, 0x85ebca6b) >>> 0
  }
  return `${a.toString(36).padStart(7, '0')}${b.toString(36).padStart(7, '0')}`
}

export const normalizeWorldInstanceId = value => cleanToken(value, MAX_ID_LENGTH)
export const normalizeAccountId = value => cleanToken(value, MAX_ID_LENGTH)
export const normalizeHeroActorId = value => cleanToken(value, MAX_ID_LENGTH)
export const normalizeWorldVersion = value => cleanToken(value, MAX_VERSION_LENGTH)

export const deriveWorldHeroActorId = (accountId, worldInstanceId) =>
  `hero_${stableFingerprint(`${accountId}\u001f${worldInstanceId}`)}`

export const normalizeWorldInstanceCreate = value => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { ok: false, code: 'INVALID_WORLD_INSTANCE' }
  }

  const worldInstanceId = normalizeWorldInstanceId(value.worldInstanceId)
  const baselineVersion = normalizeWorldVersion(value.baselineVersion)
  const mapDatasetVersion = normalizeWorldVersion(value.mapDatasetVersion)
  if (!worldInstanceId || !baselineVersion || !mapDatasetVersion) {
    return { ok: false, code: 'INVALID_WORLD_INSTANCE' }
  }

  return {
    ok: true,
    value: { worldInstanceId, baselineVersion, mapDatasetVersion },
  }
}

export const normalizeWorldActorBinding = value => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { ok: false, code: 'INVALID_WORLD_ACTOR_BINDING' }
  }

  const worldInstanceId = normalizeWorldInstanceId(value.worldInstanceId)
  const accountId = normalizeAccountId(value.accountId)
  const heroActorId = normalizeHeroActorId(value.heroActorId)
  if (!worldInstanceId || !accountId || !heroActorId) {
    return { ok: false, code: 'INVALID_WORLD_ACTOR_BINDING' }
  }

  const expectedHeroActorId = deriveWorldHeroActorId(accountId, worldInstanceId)
  if (heroActorId !== expectedHeroActorId) {
    return {
      ok: false,
      code: 'HERO_ACTOR_ID_MISMATCH',
      expectedHeroActorId,
    }
  }

  return {
    ok: true,
    value: { worldInstanceId, accountId, heroActorId },
  }
}
