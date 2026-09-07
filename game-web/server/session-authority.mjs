const MAX_BODY_BYTES = 8 * 1024
const MAX_AGGREGATES = 32
const MAX_COMMANDS = 512
const MAX_ID_LENGTH = 96
const MAX_DISPLAY_NAME_LENGTH = 48

const ID_PATTERN = /^[A-Za-z0-9:_\-.]+$/

const sendJson = (response, status, payload) => {
  const body = JSON.stringify(payload)
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Content-Length': Buffer.byteLength(body),
  })
  response.end(body)
}

const fail = (status, code, message) => ({ status, code, message })

const readJsonBody = async request => {
  const contentType = String(request.headers['content-type'] ?? '').toLowerCase()
  if (!contentType.startsWith('application/json')) throw fail(415, 'UNSUPPORTED_MEDIA_TYPE', 'Expected application/json.')

  let size = 0
  const chunks = []
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    size += buffer.length
    if (size > MAX_BODY_BYTES) throw fail(413, 'PAYLOAD_TOO_LARGE', 'Request body exceeds the authority prototype limit.')
    chunks.push(buffer)
  }

  if (chunks.length === 0) throw fail(400, 'INVALID_JSON', 'Request body is required.')
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    throw fail(400, 'INVALID_JSON', 'Malformed JSON body.')
  }
}

const isRecord = value => typeof value === 'object' && value !== null && !Array.isArray(value)
const isSafeRevision = value => Number.isSafeInteger(value) && value >= 0

const validOpaqueId = value =>
  typeof value === 'string' &&
  value.length >= 1 &&
  value.length <= MAX_ID_LENGTH &&
  ID_PATTERN.test(value)

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
  revision: state.revision,
  displayName: state.displayName,
})

const createReceipt = ({ commandId, aggregateId, accepted, resultingRevision, authoritativeSequence, eventId, rejectionReason }) => ({
  commandId,
  aggregateId,
  accepted,
  resultingRevision,
  authoritativeSequence,
  ...(eventId ? { eventId } : {}),
  ...(rejectionReason ? { rejectionReason } : {}),
})

export const createSessionAuthorityRegistry = () => {
  const profiles = new Map()
  const commands = new Map()
  let authoritativeSequence = 0

  const getProfile = aggregateId => {
    const state = profiles.get(aggregateId)
    return state ? publicProfile(state) : undefined
  }

  const getReceipt = commandId => {
    const stored = commands.get(commandId)
    return stored ? structuredClone(stored.receipt) : undefined
  }

  const execute = command => {
    const existing = commands.get(command.commandId)
    const fingerprint = canonicalCommandFingerprint(command)
    if (existing) {
      if (existing.fingerprint !== fingerprint) {
        return { kind: 'conflict', code: 'COMMAND_ID_CONFLICT' }
      }
      return {
        kind: 'duplicate',
        receipt: structuredClone(existing.receipt),
        ...(existing.event ? { event: structuredClone(existing.event) } : {}),
        ...(existing.profile ? { profile: structuredClone(existing.profile) } : {}),
      }
    }

    if (commands.size >= MAX_COMMANDS) return { kind: 'capacity', code: 'COMMAND_CAPACITY_REACHED' }

    const current = profiles.get(command.aggregateId)
    const currentRevision = current?.revision ?? 0
    authoritativeSequence += 1

    if (command.expectedRevision !== currentRevision) {
      const receipt = createReceipt({
        commandId: command.commandId,
        aggregateId: command.aggregateId,
        accepted: false,
        resultingRevision: currentRevision,
        authoritativeSequence,
        rejectionReason: 'StaleRevision',
      })
      commands.set(command.commandId, { fingerprint, receipt })
      return { kind: 'rejected', receipt: structuredClone(receipt) }
    }

    if (command.commandType === 'CreatePublicProfile') {
      if (current || profiles.size >= MAX_AGGREGATES) {
        const receipt = createReceipt({
          commandId: command.commandId,
          aggregateId: command.aggregateId,
          accepted: false,
          resultingRevision: currentRevision,
          authoritativeSequence,
          rejectionReason: 'ValidationFailed',
        })
        commands.set(command.commandId, { fingerprint, receipt })
        return { kind: 'rejected', receipt: structuredClone(receipt) }
      }

      const displayName = validateDisplayName(command.payload?.displayName)
      if (!displayName) {
        const receipt = createReceipt({
          commandId: command.commandId,
          aggregateId: command.aggregateId,
          accepted: false,
          resultingRevision: currentRevision,
          authoritativeSequence,
          rejectionReason: 'ValidationFailed',
        })
        commands.set(command.commandId, { fingerprint, receipt })
        return { kind: 'rejected', receipt: structuredClone(receipt) }
      }

      const next = {
        aggregateId: command.aggregateId,
        ownerActorId: command.actorId,
        revision: 1,
        displayName,
      }
      profiles.set(command.aggregateId, next)
      const eventId = `SESSION:event:${authoritativeSequence}`
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
      commands.set(command.commandId, { fingerprint, receipt, event, profile })
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
        commands.set(command.commandId, { fingerprint, receipt })
        return { kind: 'rejected', receipt: structuredClone(receipt) }
      }

      const nextRevision = currentRevision + 1
      const next = { ...current, revision: nextRevision, displayName }
      profiles.set(command.aggregateId, next)
      const eventId = `SESSION:event:${authoritativeSequence}`
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
      commands.set(command.commandId, { fingerprint, receipt, event, profile })
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
    commands.set(command.commandId, { fingerprint, receipt })
    return { kind: 'rejected', receipt: structuredClone(receipt) }
  }

  return {
    durability: 'session-only',
    getProfile,
    getReceipt,
    execute,
    stats: () => ({ profiles: profiles.size, commands: commands.size, authoritativeSequence }),
  }
}

const validateCommandEnvelope = body => {
  if (!isRecord(body)) return false
  if (!validOpaqueId(body.commandId) || !validOpaqueId(body.actorId) || !validOpaqueId(body.aggregateId)) return false
  if (!isSafeRevision(body.expectedRevision)) return false
  if (body.commandType !== 'CreatePublicProfile' && body.commandType !== 'SetDisplayName') return false
  if (!isRecord(body.payload)) return false
  const keys = Object.keys(body.payload)
  if (keys.length !== 1 || keys[0] !== 'displayName') return false
  return validateDisplayName(body.payload.displayName) !== null
}

const pathSegments = requestUrl => {
  const pathname = new URL(requestUrl ?? '/', 'http://authority.local').pathname
  return pathname.split('/').filter(Boolean).map(segment => decodeURIComponent(segment))
}

export const handleSessionAuthorityRequest = async (request, response, registry) => {
  const segments = pathSegments(request.url)
  if (segments[0] !== 'api' || segments[1] !== 'authority') return false

  try {
    if (request.method === 'GET' && segments.length === 3 && segments[2] === 'status') {
      sendJson(response, 200, {
        authority: 'server-process',
        durability: registry.durability,
        scope: 'public-profile-prototype',
        persistent: false,
        authentication: 'not-configured',
      })
      return true
    }

    if (request.method === 'GET' && segments.length === 4 && segments[2] === 'profiles') {
      const aggregateId = segments[3]
      if (!validOpaqueId(aggregateId)) {
        sendJson(response, 400, { error: 'INVALID_AGGREGATE_ID' })
        return true
      }
      const profile = registry.getProfile(aggregateId)
      if (!profile) {
        sendJson(response, 404, { error: 'PROFILE_NOT_FOUND' })
        return true
      }
      sendJson(response, 200, profile)
      return true
    }

    if (request.method === 'GET' && segments.length === 4 && segments[2] === 'receipts') {
      const commandId = segments[3]
      if (!validOpaqueId(commandId)) {
        sendJson(response, 400, { error: 'INVALID_COMMAND_ID' })
        return true
      }
      const receipt = registry.getReceipt(commandId)
      if (!receipt) {
        sendJson(response, 404, { error: 'RECEIPT_NOT_FOUND' })
        return true
      }
      sendJson(response, 200, receipt)
      return true
    }

    if (request.method === 'POST' && segments.length === 3 && segments[2] === 'commands') {
      const body = await readJsonBody(request)
      if (!validateCommandEnvelope(body)) {
        sendJson(response, 400, { error: 'INVALID_COMMAND_ENVELOPE' })
        return true
      }
      const result = registry.execute(body)
      if (result.kind === 'conflict') {
        sendJson(response, 409, { error: result.code })
        return true
      }
      if (result.kind === 'capacity') {
        sendJson(response, 503, { error: result.code })
        return true
      }
      sendJson(response, 200, result)
      return true
    }

    sendJson(response, 405, { error: 'METHOD_OR_ROUTE_NOT_ALLOWED' })
    return true
  } catch (error) {
    if (isRecord(error) && Number.isInteger(error.status)) {
      sendJson(response, error.status, { error: error.code, message: error.message })
      return true
    }
    sendJson(response, 500, { error: 'AUTHORITY_INTERNAL_ERROR' })
    return true
  }
}
