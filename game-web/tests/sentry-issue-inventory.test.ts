import { describe, expect, it } from 'vitest'
import { inventorySentryIssues } from '../server/sentry-issue-inventory.mjs'

const env = {
  SENTRY_AUTH_TOKEN: 'sntrys_test-private-value-never-log',
  SENTRY_ORG: 'dropi',
  SENTRY_PROJECT: 'dropi-tycon',
}

const response = (data: unknown, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => data,
})

describe('Sentry issue inventory boundary', () => {
  it('does not call Sentry when runtime credentials are absent', async () => {
    let calls = 0
    const result = await inventorySentryIssues({}, async () => { calls++; return response([]) })
    expect(calls).toBe(0)
    expect(result.status).toBe('UNKNOWN')
  })

  it('uses one bounded read-only unresolved-issue request', async () => {
    const calls: Array<{ url: string; options: RequestInit }> = []
    const result = await inventorySentryIssues(env, async (url: string, options: RequestInit) => {
      calls.push({ url, options })
      return response([])
    })

    expect(calls).toHaveLength(1)
    expect(calls[0].url).toContain('/api/0/projects/dropi/dropi-tycon/issues/')
    expect(calls[0].url).toContain('query=is%3Aunresolved')
    expect(calls[0].url).toContain('limit=25')
    expect(calls[0].options.method).toBe('GET')
    expect(calls[0].options.redirect).toBe('error')
    expect(result.status).toBe('PASS')
    expect(result.issue_count).toBe(0)
    expect(result.reason).toBe('NO_UNRESOLVED_ISSUES_OBSERVED')
  })

  it('returns useful issue metadata while redacting common sensitive values', async () => {
    const result = await inventorySentryIssues(env, async () => response([{
      id: '12345',
      shortId: 'DROPI-TYCON-2',
      status: 'unresolved',
      level: 'error',
      count: '7',
      firstSeen: '2026-09-14T20:00:00Z',
      lastSeen: '2026-09-14T22:00:00Z',
      title: 'Failed for jane@example.com at https://example.invalid/path',
      culprit: 'load sk_abcdefghijklmnopqrstuvwxyz123456',
    }]))

    expect(result.status).toBe('PASS')
    expect(result.issue_count).toBe(1)
    expect(result.issues[0]).toMatchObject({
      id: '12345',
      short_id: 'DROPI-TYCON-2',
      status: 'unresolved',
      level: 'error',
      count: '7',
    })
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('jane@example.com')
    expect(serialized).not.toContain('https://example.invalid/path')
    expect(serialized).not.toContain('sk_abcdefghijklmnopqrstuvwxyz123456')
    expect(serialized).not.toContain(env.SENTRY_AUTH_TOKEN)
  })

  it('keeps permission and network failures UNKNOWN without echoing response bodies or errors', async () => {
    const denied = await inventorySentryIssues(env, async () => response({ detail: env.SENTRY_AUTH_TOKEN }, 403))
    expect(denied.status).toBe('UNKNOWN')
    expect(denied.http).toBe(403)
    expect(JSON.stringify(denied)).not.toContain(env.SENTRY_AUTH_TOKEN)

    const failed = await inventorySentryIssues(env, async () => { throw new Error(env.SENTRY_AUTH_TOKEN) })
    expect(failed.status).toBe('UNKNOWN')
    expect(JSON.stringify(failed)).not.toContain(env.SENTRY_AUTH_TOKEN)
  })

  it('rejects arbitrary API destinations before credentials are sent', async () => {
    let calls = 0
    const result = await inventorySentryIssues({ ...env, DROPI_SENTRY_API_REGION: 'https://untrusted.invalid' }, async () => {
      calls++
      return response([])
    })
    expect(calls).toBe(0)
    expect(result.status).toBe('UNKNOWN')
  })
})
