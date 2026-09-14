export type DropiSentryConfig = {
  dsn: string
  environment: string
  sendDefaultPii: false
  tracesSampleRate: 0
}

export const buildSentryConfig = (
  dsn: string | undefined,
  environment: string,
): DropiSentryConfig | null => {
  const normalizedDsn = dsn?.trim()
  if (!normalizedDsn) return null

  return {
    dsn: normalizedDsn,
    environment,
    sendDefaultPii: false,
    tracesSampleRate: 0,
  }
}
