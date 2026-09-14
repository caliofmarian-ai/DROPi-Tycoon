export type DropiSentryConfig = {
  dsn: string
  environment: string
  sendDefaultPii: false
  tracesSampleRate: 0
  release?: string
  dist?: string
}

const normalizeCommitSha = (value: string | undefined): string | undefined => {
  const normalized = value?.trim().toLowerCase()
  return normalized && /^[a-f0-9]{40}$/.test(normalized) ? normalized : undefined
}

const normalizeDeploymentId = (value: string | undefined): string | undefined => {
  const normalized = value?.trim().toLowerCase()
  return normalized && /^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(normalized)
    ? normalized
    : undefined
}

export const buildSentryConfig = (
  dsn: string | undefined,
  environment: string,
  commitSha?: string,
  deploymentId?: string,
): DropiSentryConfig | null => {
  const normalizedDsn = dsn?.trim()
  if (!normalizedDsn) return null

  const release = normalizeCommitSha(commitSha)
  const dist = normalizeDeploymentId(deploymentId)

  return {
    dsn: normalizedDsn,
    environment,
    sendDefaultPii: false,
    tracesSampleRate: 0,
    ...(release ? { release } : {}),
    ...(dist ? { dist } : {}),
  }
}
