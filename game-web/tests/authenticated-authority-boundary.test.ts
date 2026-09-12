import { createServer, type IncomingMessage, type Server } from 'node:http'
import { afterEach, describe, expect, it } from 'vitest'
import {
  createSessionAuthorityRegistry,
  handleSessionAuthorityRequest,
} from '../server/session-authority.mjs'

interface AuthenticatedContext {
  accountId: string
  actorId: string
  profileAggregateId: string
}

interface RunningAuthorityServer {
  server: Server
  baseUrl: string
  registry: ReturnType<typeof createSessionAuthorityRegistry>
}

type Authenticator = (
  request: IncomingMessage,
) => AuthenticatedContext | null | Promise<AuthenticatedContext | null>

const accountA: AuthenticatedContext = {
  accountId: 'ACCOUNT:alpha',
  actorId: 'ACTOR:alpha',
  profileAggregateId: 'PROFILE:alpha',
}

const accountB: AuthenticatedContext = {
  accountId: 'ACCOUNT:bravo',
  actorId: 'ACTOR:bravo',
  profileAggregateId: 'PROFILE:bravo',
}

const authenticateByBearer: Authenticator = request => {
  if (request.headers.authorization === 'Bearer alpha') return accountA
  if (request.headers.authorization === 'Bearer bravo') return accountB
  return null
}

const runningServers: Server[] = []

const startAuthorityServer = async (authenticateRequest?: Authenticator): Promise<RunningAuthorityServer> => {
  const registry = createSessionAuthorityRegistry()
  const server = createServer(async (request, response) => {
    if (await handleSessionAuthorityRequest(request, response, registry, {
      requireAuthentication: true,
      authenticateRequest,
    })) return
    response.writeHead(404)
    response.end('Not found')
  })
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
  runningServers.push(server)
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('Test server failed to bind.')
  return { server, baseUrl: `http://127.0.0.1:${address.port}`, registry }
}

afterEach(async () => {
  const servers = runningServers.splice(0)
  await Promise.all(servers.map(server => new Promise<void>(resolve => server.close(() => resolve()))))
})

const commandBody = (commandId = 'CLIENT:command:create-1') => ({
  commandId,
  commandType: 'CreatePublicProfile',
  expectedRevision: 0,
  payload: { displayName: 'Courier One' },
})

const postCommand = async (
  baseUrl: string,
  token: string,
  body: unknown,
) => fetch(`${baseUrl}/api/authority/commands`, {
  method: 'POST',
  headers: {
    authorization: `Bearer ${token}`,
    'content-type': 'application/json',
  },
  body: JSON.stringify(body),
})

describe('issue #560 authenticated authority boundary', () => {
  it('keeps the production transport fail-closed when authentication is not configured', async () => {
    const { baseUrl, registry } = await startAuthorityServer()

    const status = await fetch(`${baseUrl}/api/authority/status`)
    expect(status.status).toBe(200)
    await expect(status.json()).resolves.toEqual({
      authority: 'server-process',
      durability: 'session-only',
      scope: 'authenticated-public-profile-boundary',
      persistent: false,
      authentication: 'required-unavailable',
      profileLookup: 'self-only',
      clientIdentityClaims: false,
    })

    const response = await postCommand(baseUrl, 'alpha', commandBody())
    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toEqual({ error: 'AUTHENTICATION_NOT_CONFIGURED' })
    expect(registry.stats()).toEqual({ profiles: 0, commands: 0, authoritativeSequence: 0 })
  })

  it('requires an authenticated server context before reading or mutating profile state', async () => {
    const { baseUrl } = await startAuthorityServer(authenticateByBearer)

    const commandResponse = await postCommand(baseUrl, 'unknown', commandBody())
    expect(commandResponse.status).toBe(401)
    await expect(commandResponse.json()).resolves.toEqual({ error: 'AUTHENTICATION_REQUIRED' })

    const profileResponse = await fetch(`${baseUrl}/api/authority/profiles/me`)
    expect(profileResponse.status).toBe(401)
    await expect(profileResponse.json()).resolves.toEqual({ error: 'AUTHENTICATION_REQUIRED' })
  })

  it('rejects client-supplied actor, account and aggregate identity claims', async () => {
    const { baseUrl, registry } = await startAuthorityServer(authenticateByBearer)
    const spoofed = {
      ...commandBody(),
      actorId: 'ACTOR:bravo',
      aggregateId: 'PROFILE:bravo',
    }

    const response = await postCommand(baseUrl, 'alpha', spoofed)
    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ error: 'CLIENT_IDENTITY_CLAIMS_FORBIDDEN' })
    expect(registry.stats()).toEqual({ profiles: 0, commands: 0, authoritativeSequence: 0 })
  })

  it('derives the writable actor and profile aggregate only from authenticated server context', async () => {
    const { baseUrl, registry } = await startAuthorityServer(authenticateByBearer)

    const response = await postCommand(baseUrl, 'alpha', commandBody())
    expect(response.status).toBe(200)
    const created = await response.json() as any
    expect(created.kind).toBe('applied')
    expect(created.receipt.commandId).toBe('CLIENT:command:create-1')
    expect(created.receipt.aggregateId).toBe(accountA.profileAggregateId)
    expect(created.profile).toEqual({
      aggregateId: accountA.profileAggregateId,
      revision: 1,
      displayName: 'Courier One',
    })
    expect(await registry.getProfile(accountB.profileAggregateId)).toBeUndefined()

    const self = await fetch(`${baseUrl}/api/authority/profiles/me`, {
      headers: { authorization: 'Bearer alpha' },
    })
    expect(self.status).toBe(200)
    await expect(self.json()).resolves.toEqual(created.profile)
  })

  it('blocks profile enumeration and cross-account mutation', async () => {
    const { baseUrl, registry } = await startAuthorityServer(authenticateByBearer)
    await postCommand(baseUrl, 'alpha', commandBody())

    const enumeration = await fetch(`${baseUrl}/api/authority/profiles/${accountA.profileAggregateId}`, {
      headers: { authorization: 'Bearer bravo' },
    })
    expect(enumeration.status).toBe(404)
    await expect(enumeration.json()).resolves.toEqual({ error: 'PROFILE_LOOKUP_NOT_AVAILABLE' })

    const crossAccountUpdate = await postCommand(baseUrl, 'bravo', {
      commandId: 'CLIENT:command:update-1',
      commandType: 'SetDisplayName',
      expectedRevision: 1,
      payload: { displayName: 'Hijacked' },
    })
    expect(crossAccountUpdate.status).toBe(200)
    const rejected = await crossAccountUpdate.json() as any
    expect(rejected.kind).toBe('rejected')
    expect(rejected.receipt.rejectionReason).toBe('StaleRevision')

    await expect(registry.getProfile(accountA.profileAggregateId)).toEqual({
      aggregateId: accountA.profileAggregateId,
      revision: 1,
      displayName: 'Courier One',
    })
  })

  it('scopes replay and receipt lookup to the authenticated account', async () => {
    const { baseUrl } = await startAuthorityServer(authenticateByBearer)
    const clientCommandId = 'CLIENT:command:shared-retry-key'

    const firstA = await (await postCommand(baseUrl, 'alpha', commandBody(clientCommandId))).json() as any
    const replayA = await (await postCommand(baseUrl, 'alpha', commandBody(clientCommandId))).json() as any
    expect(replayA.kind).toBe('duplicate')
    expect(replayA.receipt).toEqual(firstA.receipt)

    const receiptA = await fetch(`${baseUrl}/api/authority/receipts/${clientCommandId}`, {
      headers: { authorization: 'Bearer alpha' },
    })
    expect(receiptA.status).toBe(200)
    await expect(receiptA.json()).resolves.toEqual(firstA.receipt)

    const receiptBMissing = await fetch(`${baseUrl}/api/authority/receipts/${clientCommandId}`, {
      headers: { authorization: 'Bearer bravo' },
    })
    expect(receiptBMissing.status).toBe(404)
    await expect(receiptBMissing.json()).resolves.toEqual({ error: 'RECEIPT_NOT_FOUND' })

    const firstB = await (await postCommand(baseUrl, 'bravo', commandBody(clientCommandId))).json() as any
    expect(firstB.kind).toBe('applied')
    expect(firstB.receipt.commandId).toBe(clientCommandId)
    expect(firstB.receipt.aggregateId).toBe(accountB.profileAggregateId)
  })

  it('fails closed when the external authentication resolver fails', async () => {
    const { baseUrl, registry } = await startAuthorityServer(async () => {
      throw new Error('provider unavailable')
    })

    const response = await postCommand(baseUrl, 'alpha', commandBody())
    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toEqual({ error: 'AUTHENTICATION_UNAVAILABLE' })
    expect(registry.stats()).toEqual({ profiles: 0, commands: 0, authoritativeSequence: 0 })
  })
})
