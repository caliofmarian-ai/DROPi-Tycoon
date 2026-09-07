import type {
  AuthorityCommandHandlingResult,
  AuthorityCommandReceipt,
  AuthorityEventEnvelope,
  LocalAuthorityCommandResult,
  SharedCommandEnvelope,
} from '../types/sharedAuthority'

const requireOpaquePart = (value: string, label: string): string => {
  const trimmed = value.trim()
  if (trimmed.length === 0) throw new Error(`${label} must be non-empty.`)
  return trimmed
}

/**
 * Deterministic local-only ID helper. The caller supplies a collision-resistant namespace
 * for the local installation/session. Future server issuers may use a different opaque format.
 */
export const createLocalAuthorityId = (
  namespace: string,
  kind: 'actor' | 'aggregate' | 'command' | 'event',
  sequence: number,
): string => {
  const safeNamespace = requireOpaquePart(namespace, 'namespace')
  if (!Number.isSafeInteger(sequence) || sequence < 1) throw new Error('sequence must be a positive safe integer.')
  return `LOCAL:${safeNamespace}:${kind}:${sequence}`
}

interface StoredCommandResult<TEventType extends string, TEventPayload> {
  receipt: AuthorityCommandReceipt
  event?: AuthorityEventEnvelope<TEventType, TEventPayload>
}

/**
 * Offline compatibility adapter for the future shared-authority boundary.
 * It does not replace the current runtime economy. It proves command revision,
 * replay and receipt semantics locally before any network/backend selection.
 */
export class LocalSharedAuthorityAdapter<TEventType extends string = string, TEventPayload = unknown> {
  private readonly revisions = new Map<string, number>()
  private readonly processedCommands = new Map<string, StoredCommandResult<TEventType, TEventPayload>>()
  private authoritativeSequence = 0
  private readonly namespace: string

  constructor(namespace: string) {
    this.namespace = requireOpaquePart(namespace, 'namespace')
  }

  getRevision(aggregateId: string): number {
    return this.revisions.get(aggregateId) ?? 0
  }

  getReceipt(commandId: string): AuthorityCommandReceipt | undefined {
    const stored = this.processedCommands.get(commandId)
    return stored ? { ...stored.receipt } : undefined
  }

  execute<TCommandType extends string, TCommandPayload>(
    command: SharedCommandEnvelope<TCommandType, TCommandPayload>,
    handler: (currentRevision: number) => AuthorityCommandHandlingResult<TEventType, TEventPayload>,
  ): LocalAuthorityCommandResult<TEventType, TEventPayload> {
    const existing = this.processedCommands.get(command.commandId)
    if (existing) {
      return {
        kind: 'duplicate',
        receipt: { ...existing.receipt },
        ...(existing.event ? { event: { ...existing.event } } : {}),
      }
    }

    const currentRevision = this.getRevision(command.aggregateId)
    this.authoritativeSequence += 1

    if (command.expectedRevision !== currentRevision) {
      const receipt: AuthorityCommandReceipt = {
        commandId: command.commandId,
        aggregateId: command.aggregateId,
        accepted: false,
        resultingRevision: currentRevision,
        authoritativeSequence: this.authoritativeSequence,
        rejectionReason: 'StaleRevision',
      }
      this.processedCommands.set(command.commandId, { receipt })
      return { kind: 'rejected', receipt: { ...receipt } }
    }

    const handling = handler(currentRevision)
    if (!handling.accepted) {
      const receipt: AuthorityCommandReceipt = {
        commandId: command.commandId,
        aggregateId: command.aggregateId,
        accepted: false,
        resultingRevision: currentRevision,
        authoritativeSequence: this.authoritativeSequence,
        rejectionReason: handling.reason,
      }
      this.processedCommands.set(command.commandId, { receipt })
      return { kind: 'rejected', receipt: { ...receipt } }
    }

    const nextRevision = currentRevision + 1
    const eventId = createLocalAuthorityId(this.namespace, 'event', this.authoritativeSequence)
    const event: AuthorityEventEnvelope<TEventType, TEventPayload> = {
      eventId,
      commandId: command.commandId,
      aggregateId: command.aggregateId,
      revision: nextRevision,
      authoritativeSequence: this.authoritativeSequence,
      eventType: handling.eventType,
      payload: handling.eventPayload,
    }
    const receipt: AuthorityCommandReceipt = {
      commandId: command.commandId,
      aggregateId: command.aggregateId,
      accepted: true,
      resultingRevision: nextRevision,
      authoritativeSequence: this.authoritativeSequence,
      eventId,
    }

    this.revisions.set(command.aggregateId, nextRevision)
    this.processedCommands.set(command.commandId, { receipt, event })

    return { kind: 'applied', receipt: { ...receipt }, event: { ...event } }
  }
}
