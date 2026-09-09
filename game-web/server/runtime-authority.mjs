import { createPostgresAuthorityRegistry } from './postgres-authority.mjs'
import { createSessionAuthorityRegistry } from './session-authority.mjs'
import { createPostgresWorldInstanceRuntimeAdapter } from './world-instance-runtime-adapter.mjs'

const normalizeAuthorityStore = value => String(value ?? 'session').trim().toLowerCase()

const closeAll = async resources => {
  const errors = []
  for (const resource of resources) {
    if (!resource || typeof resource.close !== 'function') continue
    try {
      await resource.close()
    } catch (error) {
      errors.push(error)
    }
  }
  if (errors.length > 0) throw new AggregateError(errors, 'Runtime authority shutdown failed.')
}

export const createRuntimeAuthorityServices = async ({
  authorityStore,
  databaseUrl,
  resolveTrustedWorldIdentity,
} = {}) => {
  const selectedStore = normalizeAuthorityStore(authorityStore)

  if (selectedStore === 'session') {
    const authorityRegistry = createSessionAuthorityRegistry()
    return {
      authorityStore: selectedStore,
      authorityRegistry,
      worldInstanceRuntime: undefined,
      close: () => closeAll([authorityRegistry]),
    }
  }

  if (selectedStore !== 'postgres') {
    throw new Error(`Unsupported DROPI_AUTHORITY_STORE value: ${selectedStore}`)
  }

  const authorityRegistry = await createPostgresAuthorityRegistry({ databaseUrl })
  try {
    const worldInstanceRuntime = await createPostgresWorldInstanceRuntimeAdapter({
      databaseUrl,
      resolveTrustedIdentity: resolveTrustedWorldIdentity,
    })

    return {
      authorityStore: selectedStore,
      authorityRegistry,
      worldInstanceRuntime,
      close: () => closeAll([worldInstanceRuntime, authorityRegistry]),
    }
  } catch (error) {
    await authorityRegistry.close?.().catch(() => {})
    throw error
  }
}
