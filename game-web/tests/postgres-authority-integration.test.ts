import { createServer, type Server } from 'node:http'
import postgres from 'postgres'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import {
  createPostgresAuthorityRegistry,
  runPostgresAuthorityMigrations,
} from '../server/postgres-authority.mjs'
import { handleSessionAuthorityRequest } from '../server/session-authority.mjs'

const databaseUrl = process.env.AUTHORITY_TEST_DATABASE_URL
const describePostgres = databaseUrl ? describe : describe.skip

const createCommand = {
  commandId: 'PG:command:create-1',
  actorId: 'PG:actor:owner-1',
  aggregateId: 'PG:profile:player-1',
  commandType: 'CreatePublicProfile',
  expectedRevision: 0,
  payload: { displayName: 'Courier One' },
}

const openRegistry = () => createPostgresAuthorityRegistry({ databaseUrl })

describePostgres('issue #402 PostgreSQL durable authority repository', () => {
  const admin = databaseUrl ? postgres(databaseUrl, { max: 1, prepare: false }) : undefined
  const runningServers: Server[] = []

  beforeEach(async () => {
    if (!admin) return
    await runPostgresAuthorityMigrations(admin)
    await admin.unsafe(`
      TRUNCATE TABLE authority_commands, authority_events, authority_public_profiles;
      UPDATE authority_sequence SET value = 0 WHERE singleton = TRUE;
    `)
  })

  afterAll(async () => {
    await Promise.all(runningServers.splice(0).map(server => new Promise<void>(resolve => server.close(() => resolve()))))
    await admin?.end({ timeout: 2 })
  })

  it('applies the versioned migration repeatedly without duplicating migration evidence', async () => {
    if (!admin) return
    await runPostgresAuthorityMigrations(admin)
    await runPostgresAuthorityMigrations(admin)

    const rows = await admin`
      SELECT COUNT(*)::int AS count
      FROM authority_schema_migrations
      WHERE version = '001_authority_public_profile'
    `
    expect(rows[0].count).toBe(1)
  })

  it('persists revision 1 across a completely new repository connection', async () => {
    const first = await openRegistry()
    const created = await first.execute(createCommand)
    expect(created.kind).toBe('applied')
    expect(created.receipt.resultingRevision).toBe(1)
    await first.close()

    const second = await openRegistry()
    await expect(second.getProfile(createCommand.aggregateId)).resolves.toEqual({
      aggregateId: createCommand.aggregateId,
      revision: 1,
      displayName: 'Courier One',
    })
    await second.close()
  })

  it('updates revision 1 to revision 2 and exposes no private owner actor', async () => {
    const registry = await openRegistry()
    await registry.execute(createCommand)
    const result = await registry.execute({
      ...createCommand,
      commandId: 'PG:command:update-1',
      commandType: 'SetDisplayName',
      expectedRevision: 1,
      payload: { displayName: 'Courier Prime' },
    })

    expect(result.kind).toBe('applied')
    expect(result.receipt.resultingRevision).toBe(2)
    const profile = await registry.getProfile(createCommand.aggregateId)
    expect(profile).toEqual({
      aggregateId: createCommand.aggregateId,
      revision: 2,
      displayName: 'Courier Prime',
    })
    expect((profile as any).ownerActorId).toBeUndefined()
    await registry.close()
  })

  it('replays the original durable receipt after repository recreation without mutating twice', async () => {
    const first = await openRegistry()
    const applied = await first.execute(createCommand)
    await first.close()

    const second = await openRegistry()
    const replay = await second.execute(createCommand)
    expect(replay.kind).toBe('duplicate')
    expect(replay.receipt).toEqual(applied.receipt)
    expect(replay.event).toEqual(applied.event)
    await expect(second.getProfile(createCommand.aggregateId)).resolves.toMatchObject({ revision: 1 })
    await second.close()
  })

  it('persists a first-seen stale rejection and replays it deterministically', async () => {
    const first = await openRegistry()
    await first.execute(createCommand)
    const staleCommand = {
      ...createCommand,
      commandId: 'PG:command:stale-1',
      commandType: 'SetDisplayName',
      expectedRevision: 0,
      payload: { displayName: 'Stale Name' },
    }
    const stale = await first.execute(staleCommand)
    expect(stale.kind).toBe('rejected')
    expect(stale.receipt.rejectionReason).toBe('StaleRevision')
    expect(stale.receipt.resultingRevision).toBe(1)
    await first.close()

    const second = await openRegistry()
    const replay = await second.execute(staleCommand)
    expect(replay.kind).toBe('duplicate')
    expect(replay.receipt).toEqual(stale.receipt)
    await second.close()
  })

  it('rejects reuse of a durable command ID with different intent', async () => {
    const registry = await openRegistry()
    await registry.execute(createCommand)
    const conflict = await registry.execute({
      ...createCommand,
      payload: { displayName: 'Different Intent' },
    })
    expect(conflict).toEqual({ kind: 'conflict', code: 'COMMAND_ID_CONFLICT' })
    await registry.close()
  })

  it('rejects a different prototype actor without exposing or changing the stored owner', async () => {
    const registry = await openRegistry()
    await registry.execute(createCommand)
    const wrongActor = await registry.execute({
      ...createCommand,
      commandId: 'PG:command:wrong-actor-1',
      actorId: 'PG:actor:other-1',
      commandType: 'SetDisplayName',
      expectedRevision: 1,
      payload: { displayName: 'Hijacked' },
    })

    expect(wrongActor.kind).toBe('rejected')
    expect(wrongActor.receipt.rejectionReason).toBe('ValidationFailed')
    await expect(registry.getProfile(createCommand.aggregateId)).resolves.toEqual({
      aggregateId: createCommand.aggregateId,
      revision: 1,
      displayName: 'Courier One',
    })
    await registry.close()
  })

  it('serializes competing revision-1 writes so exactly one reaches revision 2', async () => {
    const first = await openRegistry()
    const second = await openRegistry()
    await first.execute(createCommand)

    const commandA = {
      ...createCommand,
      commandId: 'PG:command:race-a',
      commandType: 'SetDisplayName',
      expectedRevision: 1,
      payload: { displayName: 'Race A' },
    }
    const commandB = {
      ...createCommand,
      commandId: 'PG:command:race-b',
      commandType: 'SetDisplayName',
      expectedRevision: 1,
      payload: { displayName: 'Race B' },
    }

    const results = await Promise.all([first.execute(commandA), second.execute(commandB)])
    expect(results.filter(result => result.kind === 'applied')).toHaveLength(1)
    const rejected = results.find(result => result.kind === 'rejected')
    expect(rejected?.receipt.rejectionReason).toBe('StaleRevision')
    expect(rejected?.receipt.resultingRevision).toBe(2)

    const profile = await first.getProfile(createCommand.aggregateId)
    expect(profile?.revision).toBe(2)
    expect(['Race A', 'Race B']).toContain(profile?.displayName)
    await first.close()
    await second.close()
  })

  it('serves truthful PostgreSQL status and durable receipts through the shared HTTP boundary', async () => {
    const registry = await openRegistry()
    const server = createServer(async (request, response) => {
      if (await handleSessionAuthorityRequest(request, response, registry)) return
      response.writeHead(404)
      response.end('Not found')
    })
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
    runningServers.push(server)
    const address = server.address()
    if (!address || typeof address === 'string') throw new Error('PostgreSQL test server failed to bind.')
    const baseUrl = `http://127.0.0.1:${address.port}`

    const statusResponse = await fetch(`${baseUrl}/api/authority/status`)
    await expect(statusResponse.json()).resolves.toEqual({
      authority: 'server-database',
      durability: 'postgresql',
      scope: 'public-profile-prototype',
      persistent: true,
      authentication: 'not-configured',
    })

    const appliedResponse = await fetch(`${baseUrl}/api/authority/commands`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(createCommand),
    })
    const applied = await appliedResponse.json() as any
    expect(applied.kind).toBe('applied')

    const receiptResponse = await fetch(`${baseUrl}/api/authority/receipts/${createCommand.commandId}`)
    expect(receiptResponse.status).toBe(200)
    await expect(receiptResponse.json()).resolves.toEqual(applied.receipt)

    await new Promise<void>(resolve => server.close(() => resolve()))
    runningServers.splice(runningServers.indexOf(server), 1)
    await registry.close()
  })
})
