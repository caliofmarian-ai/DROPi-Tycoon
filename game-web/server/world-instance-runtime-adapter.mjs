import { createPostgresWorldInstanceRepository } from './postgres-world-instances.mjs'
import {
  deriveWorldHeroActorId,
  normalizeAccountId,
  normalizeWorldInstanceId,
  normalizeWorldVersion,
} from './world-instance-identity.mjs'

const REQUIRED_REPOSITORY_METHODS = [
  'createWorldInstance',
  'getWorldInstance',
  'bindWorldActor',
  'getWorldActor',
]

const isRecord = value => typeof value === 'object' && value !== null && !Array.isArray(value)

const normalizeTrustedIdentityContext = value => {
  if (!isRecord(value)) return null

  const worldInstanceId = normalizeWorldInstanceId(value.worldInstanceId)
  const accountId = normalizeAccountId(value.accountId)
  const baselineVersion = normalizeWorldVersion(value.baselineVersion)
  const mapDatasetVersion = normalizeWorldVersion(value.mapDatasetVersion)
  if (!worldInstanceId || !accountId || !baselineVersion || !mapDatasetVersion) return null

  return {
    worldInstanceId,
    accountId,
    baselineVersion,
    mapDatasetVersion,
  }
}

const validateRepository = repository => {
  if (!isRecord(repository)) {
    throw new Error('A World Instance repository is required by the runtime adapter.')
  }
  for (const method of REQUIRED_REPOSITORY_METHODS) {
    if (typeof repository[method] !== 'function') {
      throw new Error(`World Instance repository is missing ${method}().`)
    }
  }
}

const projectIdentity = trusted => ({
  ...trusted,
  heroActorId: deriveWorldHeroActorId(trusted.accountId, trusted.worldInstanceId),
})

const resolveTrustedContext = async (resolver, requestContext) => {
  if (typeof resolver !== 'function') {
    return { ok: false, code: 'AUTHENTICATED_IDENTITY_REQUIRED' }
  }

  let resolved
  try {
    resolved = await resolver(requestContext)
  } catch {
    return { ok: false, code: 'TRUSTED_IDENTITY_RESOLUTION_FAILED' }
  }

  if (resolved === undefined || resolved === null) {
    return { ok: false, code: 'AUTHENTICATED_IDENTITY_REQUIRED' }
  }

  const trusted = normalizeTrustedIdentityContext(resolved)
  if (!trusted) return { ok: false, code: 'INVALID_TRUSTED_IDENTITY_CONTEXT' }
  return { ok: true, value: trusted }
}

const repositoryFailure = (result, fallbackCode) => ({
  kind: result?.kind === 'missing' ? 'missing' : 'conflict',
  code: result?.code ?? fallbackCode,
})

export const createWorldInstanceRuntimeAdapter = ({
  repository,
  resolveTrustedIdentity,
  ownsRepository = false,
} = {}) => {
  validateRepository(repository)

  const ensureIdentity = async requestContext => {
    const trustedResult = await resolveTrustedContext(resolveTrustedIdentity, requestContext)
    if (!trustedResult.ok) return { kind: 'blocked', code: trustedResult.code }

    const identity = projectIdentity(trustedResult.value)
    const worldResult = await repository.createWorldInstance(identity)
    if (worldResult?.kind !== 'created' && worldResult?.kind !== 'duplicate') {
      return repositoryFailure(worldResult, 'WORLD_INSTANCE_CREATE_FAILED')
    }

    const actorResult = await repository.bindWorldActor(identity)
    if (actorResult?.kind !== 'created' && actorResult?.kind !== 'duplicate') {
      return repositoryFailure(actorResult, 'WORLD_ACTOR_BIND_FAILED')
    }

    return {
      kind: worldResult.kind === 'created' || actorResult.kind === 'created' ? 'created' : 'existing',
      identity,
      world: worldResult.world,
      actor: actorResult.actor,
    }
  }

  const readIdentity = async requestContext => {
    const trustedResult = await resolveTrustedContext(resolveTrustedIdentity, requestContext)
    if (!trustedResult.ok) return { kind: 'blocked', code: trustedResult.code }

    const identity = projectIdentity(trustedResult.value)
    const world = await repository.getWorldInstance(identity.worldInstanceId)
    if (!world) return { kind: 'missing', code: 'WORLD_INSTANCE_NOT_FOUND' }

    if (
      world.baselineVersion !== identity.baselineVersion
      || world.mapDatasetVersion !== identity.mapDatasetVersion
    ) {
      return { kind: 'conflict', code: 'WORLD_INSTANCE_IDENTITY_CONFLICT' }
    }

    const actor = await repository.getWorldActor(identity.worldInstanceId, identity.accountId)
    if (!actor) return { kind: 'missing', code: 'WORLD_ACTOR_NOT_FOUND' }
    if (actor.heroActorId !== identity.heroActorId) {
      return { kind: 'conflict', code: 'DURABLE_HERO_IDENTITY_CONFLICT' }
    }

    return { kind: 'ready', identity, world, actor }
  }

  let closed = false
  const close = async () => {
    if (closed) return
    closed = true
    if (ownsRepository && typeof repository.close === 'function') await repository.close()
  }

  return {
    authority: 'server-runtime',
    durability: repository.durability ?? 'unknown',
    scope: 'world-instance-b2-runtime-adapter',
    authentication: typeof resolveTrustedIdentity === 'function'
      ? 'external-server-resolver'
      : 'required-unavailable',
    publicRoutes: false,
    publicClientIdentityInput: false,
    ensureIdentity,
    readIdentity,
    close,
  }
}

export const createPostgresWorldInstanceRuntimeAdapter = async ({
  databaseUrl,
  resolveTrustedIdentity,
  migrate = true,
} = {}) => {
  const repository = await createPostgresWorldInstanceRepository({ databaseUrl, migrate })
  return createWorldInstanceRuntimeAdapter({
    repository,
    resolveTrustedIdentity,
    ownsRepository: true,
  })
}
