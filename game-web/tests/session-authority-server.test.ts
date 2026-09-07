import { createServer, type Server } from 'node:http'
import { afterEach, describe, expect, it } from 'vitest'
import {
  createSessionAuthorityRegistry,
  handleSessionAuthorityRequest,
} from '../server/session-authority.mjs'

interface RunningAuthorityServer {
  server: Server
  baseUrl: string
}

const runningServers: Server[] = []

const startAuthorityServer = async (): Promise<RunningAuthorityServer> => {
  const registry = createSessionAuthorityRegistry()
  const server = createServer(async (request, response) => {
    if (await handleSessionAuthorityRequest(request, response, registry)) return
    response.writeHead(404)
    response.end('Not found')
  })
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
  runningServers.push(server)
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('Test server failed to bind.')
  return { server, baseUrl: `http://127.0.0.1:${address.port}` }
}

afterEach(async () => {
  const servers = runningServers.splice(0)
  await Promise.all(servers.map(server => new Promise<void>(resolve => server.close(() => resolve()))))
})

const postCommand = async (baseUrl: string, command: unknown, contentType = 'application/json') =>
  fetch(`${baseUrl}/api/authority/commands`, {
    method: 'POST',
    headers: { 'content-type': contentType },
    body: typeof command === 'string' ? command : JSON.stringify(command),
  })

const createCommand = {
  commandId: 'SESSION:command:create-1',
  actorId: 'SESSION:actor:owner-1',
  aggregateId: 'SESSION:profile:player-1',
  commandType: 'CreatePublicProfile',
  expectedRevision: 0,
  payload: { displayName: 'Courier One' },
}

describe('issue #394 session-only server authority transport', () => {
  it('reports its non-durable and unauthenticated prototype boundary explicitly', async () => {
    const { baseUrl } = await startAuthorityServer()
    const response = await fetch(`${baseUrl}/api/authority/status`)
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      authority: 'server-process',
      durability: 'session-only',
      scope: 'public-profile-prototype',
      persistent: false,
      authentication: 'not-configured',
    })
  })

  it('lets separate HTTP clients observe one server-owned profile revision', async () => {
    const { baseUrl } = await startAuthorityServer()
    const createResponse = await postCommand(baseUrl, createCommand)
    expect(createResponse.status).toBe(200)
    const created = await createResponse.json() as any
    expect(created.kind).toBe('applied')
    expect(created.receipt.accepted).toBe(true)
    expect(created.receipt.resultingRevision).toBe(1)

    const clientB = await fetch(`${baseUrl}/api/authority/profiles/${createCommand.aggregateId}`)
    expect(clientB.status).toBe(200)
    const profile = await clientB.json() as any
    expect(profile).toEqual({
      aggregateId: createCommand.aggregateId,
      revision: 1,
      displayName: 'Courier One',
    })
    expect(profile.ownerActorId).toBeUndefined()
  })

  it('replays an exact command without applying a second mutation', async () => {
    const { baseUrl } = await startAuthorityServer()
    const first = await (await postCommand(baseUrl, createCommand)).json() as any
    const replay = await (await postCommand(baseUrl, createCommand)).json() as any

    expect(replay.kind).toBe('duplicate')
    expect(replay.receipt).toEqual(first.receipt)
    expect(replay.event).toEqual(first.event)

    const profile = await (await fetch(`${baseUrl}/api/authority/profiles/${createCommand.aggregateId}`)).json() as any
    expect(profile.revision).toBe(1)
  })

  it('rejects a stale expected revision and preserves the current profile', async () => {
    const { baseUrl } = await startAuthorityServer()
    await postCommand(baseUrl, createCommand)

    const stale = {
      ...createCommand,
      commandId: 'SESSION:command:stale-1',
      commandType: 'SetDisplayName',
      expectedRevision: 0,
      payload: { displayName: 'Stale Name' },
    }
    const result = await (await postCommand(baseUrl, stale)).json() as any
    expect(result.kind).toBe('rejected')
    expect(result.receipt.accepted).toBe(false)
    expect(result.receipt.rejectionReason).toBe('StaleRevision')
    expect(result.receipt.resultingRevision).toBe(1)

    const profile = await (await fetch(`${baseUrl}/api/authority/profiles/${createCommand.aggregateId}`)).json() as any
    expect(profile).toMatchObject({ revision: 1, displayName: 'Courier One' })
  })

  it('accepts the owner update at the current revision and increments exactly once', async () => {
    const { baseUrl } = await startAuthorityServer()
    await postCommand(baseUrl, createCommand)
    const update = {
      ...createCommand,
      commandId: 'SESSION:command:update-1',
      commandType: 'SetDisplayName',
      expectedRevision: 1,
      payload: { displayName: 'Courier Prime' },
    }

    const result = await (await postCommand(baseUrl, update)).json() as any
    expect(result.kind).toBe('applied')
    expect(result.receipt.resultingRevision).toBe(2)
    expect(result.event.eventType).toBe('PublicDisplayNameChanged')

    const profile = await (await fetch(`${baseUrl}/api/authority/profiles/${createCommand.aggregateId}`)).json() as any
    expect(profile).toEqual({
      aggregateId: createCommand.aggregateId,
      revision: 2,
      displayName: 'Courier Prime',
    })
  })

  it('rejects command-id reuse with different intent instead of treating it as replay', async () => {
    const { baseUrl } = await startAuthorityServer()
    await postCommand(baseUrl, createCommand)
    const conflict = {
      ...createCommand,
      payload: { displayName: 'Different Intent' },
    }
    const response = await postCommand(baseUrl, conflict)
    expect(response.status).toBe(409)
    await expect(response.json()).resolves.toEqual({ error: 'COMMAND_ID_CONFLICT' })
  })

  it('does not let a different unauthenticated actor mutate an existing owner profile', async () => {
    const { baseUrl } = await startAuthorityServer()
    await postCommand(baseUrl, createCommand)
    const unauthorizedPrototypeMutation = {
      ...createCommand,
      commandId: 'SESSION:command:wrong-actor-1',
      actorId: 'SESSION:actor:other-1',
      commandType: 'SetDisplayName',
      expectedRevision: 1,
      payload: { displayName: 'Hijacked' },
    }
    const result = await (await postCommand(baseUrl, unauthorizedPrototypeMutation)).json() as any
    expect(result.kind).toBe('rejected')
    expect(result.receipt.rejectionReason).toBe('ValidationFailed')

    const profile = await (await fetch(`${baseUrl}/api/authority/profiles/${createCommand.aggregateId}`)).json() as any
    expect(profile.displayName).toBe('Courier One')
  })

  it('exposes first-seen receipts for reconnect reconciliation', async () => {
    const { baseUrl } = await startAuthorityServer()
    const applied = await (await postCommand(baseUrl, createCommand)).json() as any
    const response = await fetch(`${baseUrl}/api/authority/receipts/${createCommand.commandId}`)
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual(applied.receipt)
  })

  it('fails closed for malformed JSON and wrong content type', async () => {
    const { baseUrl } = await startAuthorityServer()
    const malformed = await postCommand(baseUrl, '{not-json')
    expect(malformed.status).toBe(400)
    await expect(malformed.json()).resolves.toMatchObject({ error: 'INVALID_JSON' })

    const wrongType = await postCommand(baseUrl, createCommand, 'text/plain')
    expect(wrongType.status).toBe(415)
    await expect(wrongType.json()).resolves.toMatchObject({ error: 'UNSUPPORTED_MEDIA_TYPE' })
  })

  it('makes session-only durability observable by resetting state after server restart', async () => {
    const first = await startAuthorityServer()
    await postCommand(first.baseUrl, createCommand)
    await new Promise<void>(resolve => first.server.close(() => resolve()))
    runningServers.splice(runningServers.indexOf(first.server), 1)

    const second = await startAuthorityServer()
    const response = await fetch(`${second.baseUrl}/api/authority/profiles/${createCommand.aggregateId}`)
    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toEqual({ error: 'PROFILE_NOT_FOUND' })
  })
})
