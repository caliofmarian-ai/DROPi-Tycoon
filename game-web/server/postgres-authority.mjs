import { readFile } from 'node:fs/promises'
import postgres from 'postgres'

const AUTHORITY_LOCK_KEY = 4_020_001
const MAX_DISPLAY_NAME_LENGTH = 48
const migrationUrl = new URL('./migrations/001_authority_public_profile.sql', import.meta.url)

const validateDisplayName = value => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (trimmed.length < 1 || trimmed.length > MAX_DISPLAY_NAME_LENGTH) return null
  return trimmed
}

const canonicalCommandFingerprint = command => JSON.stringify({
  actorId: command.actorId,
  aggregateId: command.aggregateId,
  commandType: command.commandType,
  expectedRevision: command.expectedRevision,
  payload: command.payload,
})

const publicProfile = state => ({
  aggregateId: state.aggregateId,
  revision: Number(state.revision),
  displayName: state.displayName,
})

const createReceipt = ({ commandId, aggregateId, accepted, resultingRevision, authoritativeSequence, eventId, rejectionReason }) => ({
  commandId,
  aggregateId,
  accepted,
  resultingRevision: Number(resultingRevision),
  authoritativeSequence: Number(authoritativeSequence),
  ...(eventId ? { eventId } : {}),
  ...(rejectionReason ? { rejectionReason } : {}),
})

const storedResult = row => ({
  kind: 'duplicate',
  receipt: structuredClone(row.receipt),
  ...(row.event ? { event: structuredClone(row.event) } : {}),
  ...(row.profile ? { profile: structuredClone(row.profile) } : {}),
})

const readProfileState = async (sql, aggregateId) => {
  const rows = await sql`
    SELECT aggregate_id, owner_actor_id, revision, display_name
    FROM authority_public_profiles
    WHERE aggregate_id = ${aggregateId}
  `
  const row = rows[0]
  if (!row) return undefined
  return {
    aggregateId: row.aggregate_id,
    ownerActorId: row.owner_actor_id,
    revision: Number(row.revision),
    displayName: row.display_name,
  }
}

const nextSequence = async sql => {
  const rows = await sql`
    UPDATE authority_sequence
    SET value = value + 1
    WHERE singleton = TRUE
    RETURNING value
  `
  if (!rows[0]) throw new Error('Authority sequence row is missing.')
  return Number(rows[0].value)
}

const persistCommand = async (sql, { command, fingerprint, receipt, event, profile }) => {
  await sql`
    INSERT INTO authority_commands (
      command_id,
      fingerprint,
      aggregate_id,
      receipt,
      event,
      profile
    ) VALUES (
      ${command.commandId},
      ${fingerprint},
      ${command.aggregateId},
      ${sql.json(receipt)},
      ${event ? sql.json(event) : null},
      ${profile ? sql.json(profile) : null}
    )
  `
}

export const runPostgresAuthorityMigrations = async sql => {
  const source = await readFile(migrationUrl, 'utf8')
  await sql.unsafe(source)
}

export const createPostgresAuthorityRegistry = async ({ databaseUrl, migrate = true } = {}) => {
  if (typeof databaseUrl !== 'string' || databaseUrl.trim().length === 0) {
    throw new Error('A non-empty databaseUrl is required for PostgreSQL authority.')
  }

  const sql = postgres(databaseUrl, {
    max: 5,
    prepare: false,
    connect_timeout: 10,
    idle_timeout: 20,
  })

  try {
    if (migrate) await runPostgresAuthorityMigrations(sql)
    await sql`SELECT 1 AS ready`
  } catch (error) {
    await sql.end({ timeout: 2 }).catch(() => {})
    throw error
  }

  const getProfile = async aggregateId => {
    const state = await readProfileState(sql, aggregateId)
    return state ? publicProfile(state) : undefined
  }

  const getReceipt = async commandId => {
    const rows = await sql`
      SELECT receipt
      FROM authority_commands
      WHERE command_id = ${commandId}
    `
    return rows[0] ? structuredClone(rows[0].receipt) : undefined
  }

  const execute = async command => sql.begin(async tx => {
    await tx`SELECT pg_advisory_xact_lock(${AUTHORITY_LOCK_KEY})`

    const fingerprint = canonicalCommandFingerprint(command)
    const existingRows = await tx`
      SELECT fingerprint, receipt, event, profile
      FROM authority_commands
      WHERE command_id = ${command.commandId}
    `
    const existing = existingRows[0]
    if (existing) {
      if (existing.fingerprint !== fingerprint) {
        return { kind: 'conflict', code: 'COMMAND_ID_CONFLICT' }
      }
      return storedResult(existing)
    }

    const current = await readProfileState(tx, command.aggregateId)
    const currentRevision = current?.revision ?? 0
    const authoritativeSequence = await nextSequence(tx)

    if (command.expectedRevision !== currentRevision) {
      const receipt = createReceipt({
        commandId: command.commandId,
        aggregateId: command.aggregateId,
        accepted: false,
        resultingRevision: currentRevision,
        authoritativeSequence,
        rejectionReason: 'StaleRevision',
      })
      await persistCommand(tx, { command, fingerprint, receipt })
      return { kind: 'rejected', receipt: structuredClone(receipt) }
    }

    if (command.commandType === 'CreatePublicProfile') {
      const displayName = validateDisplayName(command.payload?.displayName)
      if (current || !displayName) {
        const receipt = createReceipt({
          commandId: command.commandId,
          aggregateId: command.aggregateId,
          accepted: false,
          resultingRevision: currentRevision,
          authoritativeSequence,
          rejectionReason: 'ValidationFailed',
        })
        await persistCommand(tx, { command, fingerprint, receipt })
        return { kind: 'rejected', receipt: structuredClone(receipt) }
      }

      const next = {
        aggregateId: command.aggregateId,
        ownerActorId: command.actorId,
        revision: 1,
        displayName,
      }
      await tx`
        INSERT INTO authority_public_profiles (
          aggregate_id,
          owner_actor_id,
          revision,
          display_name
        ) VALUES (
          ${next.aggregateId},
          ${next.ownerActorId},
          ${next.revision},
          ${next.displayName}
        )
      `

      const eventId = `PG:event:${authoritativeSequence}`
      const event = {
        eventId,
        commandId: command.commandId,
        aggregateId: command.aggregateId,
        revision: 1,
        authoritativeSequence,
        eventType: 'PublicProfileCreated',
        payload: { displayName },
      }
      const receipt = createReceipt({
        commandId: command.commandId,
        aggregateId: command.aggregateId,
        accepted: true,
        resultingRevision: 1,
        authoritativeSequence,
        eventId,
      })
      const profile = publicProfile(next)

      await tx`
        INSERT INTO authority_events (
          event_id,
          command_id,
          aggregate_id,
          revision,
          authoritative_sequence,
          event_type,
          payload
        ) VALUES (
          ${event.eventId},
          ${event.commandId},
          ${event.aggregateId},
          ${event.revision},
          ${event.authoritativeSequence},
          ${event.eventType},
          ${tx.json(event.payload)}
        )
      `
      await persistCommand(tx, { command, fingerprint, receipt, event, profile })
      return { kind: 'applied', receipt: structuredClone(receipt), event: structuredClone(event), profile }
    }

    if (command.commandType === 'SetDisplayName') {
      const displayName = validateDisplayName(command.payload?.displayName)
      if (!current || current.ownerActorId !== command.actorId || !displayName) {
        const receipt = createReceipt({
          commandId: command.commandId,
          aggregateId: command.aggregateId,
          accepted: false,
          resultingRevision: currentRevision,
          authoritativeSequence,
          rejectionReason: 'ValidationFailed',
        })
        await persistCommand(tx, { command, fingerprint, receipt })
        return { kind: 'rejected', receipt: structuredClone(receipt) }
      }

      const nextRevision = currentRevision + 1
      const next = { ...current, revision: nextRevision, displayName }
      await tx`
        UPDATE authority_public_profiles
        SET revision = ${nextRevision},
            display_name = ${displayName},
            updated_at = NOW()
        WHERE aggregate_id = ${command.aggregateId}
      `

      const eventId = `PG:event:${authoritativeSequence}`
      const event = {
        eventId,
        commandId: command.commandId,
        aggregateId: command.aggregateId,
        revision: nextRevision,
        authoritativeSequence,
        eventType: 'PublicDisplayNameChanged',
        payload: { displayName },
      }
      const receipt = createReceipt({
        commandId: command.commandId,
        aggregateId: command.aggregateId,
        accepted: true,
        resultingRevision: nextRevision,
        authoritativeSequence,
        eventId,
      })
      const profile = publicProfile(next)

      await tx`
        INSERT INTO authority_events (
          event_id,
          command_id,
          aggregate_id,
          revision,
          authoritative_sequence,
          event_type,
          payload
        ) VALUES (
          ${event.eventId},
          ${event.commandId},
          ${event.aggregateId},
          ${event.revision},
          ${event.authoritativeSequence},
          ${event.eventType},
          ${tx.json(event.payload)}
        )
      `
      await persistCommand(tx, { command, fingerprint, receipt, event, profile })
      return { kind: 'applied', receipt: structuredClone(receipt), event: structuredClone(event), profile }
    }

    const receipt = createReceipt({
      commandId: command.commandId,
      aggregateId: command.aggregateId,
      accepted: false,
      resultingRevision: currentRevision,
      authoritativeSequence,
      rejectionReason: 'ValidationFailed',
    })
    await persistCommand(tx, { command, fingerprint, receipt })
    return { kind: 'rejected', receipt: structuredClone(receipt) }
  })

  return {
    authority: 'server-database',
    durability: 'postgresql',
    persistent: true,
    authentication: 'not-configured',
    getProfile,
    getReceipt,
    execute,
    close: () => sql.end({ timeout: 5 }),
    stats: async () => {
      const [profiles] = await sql`SELECT COUNT(*)::int AS count FROM authority_public_profiles`
      const [commands] = await sql`SELECT COUNT(*)::int AS count FROM authority_commands`
      const [sequence] = await sql`SELECT value FROM authority_sequence WHERE singleton = TRUE`
      return {
        profiles: profiles.count,
        commands: commands.count,
        authoritativeSequence: Number(sequence.value),
      }
    },
  }
}
