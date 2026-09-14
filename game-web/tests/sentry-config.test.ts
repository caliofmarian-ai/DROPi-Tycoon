import { describe, expect, it } from 'vitest'
import { buildSentryConfig } from '../src/observability/sentryConfig'

describe('Sentry runtime configuration', () => {
  it('stays disabled when no DSN is configured', () => {
    expect(buildSentryConfig(undefined, 'production')).toBeNull()
    expect(buildSentryConfig('   ', 'production')).toBeNull()
  })

  it('uses the configured DSN without enabling PII or tracing', () => {
    expect(buildSentryConfig(' https://examplePublicKey@o0.ingest.sentry.io/1 ', 'production')).toEqual({
      dsn: 'https://examplePublicKey@o0.ingest.sentry.io/1',
      environment: 'production',
      sendDefaultPii: false,
      tracesSampleRate: 0,
    })
  })
})
