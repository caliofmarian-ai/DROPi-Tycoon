export type RuntimeMode = 'remote' | 'bundled'

export interface RuntimeConfiguration {
  mode: RuntimeMode | null
  remoteGameUrl: string | null
  configurationError: string | null
}

const configuredRuntimeMode = process.env.EXPO_PUBLIC_DROPITYCOON_RUNTIME_MODE?.trim()
const configuredGameUrl = process.env.EXPO_PUBLIC_DROPITYCOON_GAME_URL?.trim()

const configurationError = (message: string): RuntimeConfiguration => ({
  mode: null,
  remoteGameUrl: null,
  configurationError: message,
})

export const getRuntimeConfiguration = (): RuntimeConfiguration => {
  if (configuredRuntimeMode === 'bundled') {
    return {
      mode: 'bundled',
      remoteGameUrl: null,
      configurationError: null,
    }
  }

  if (configuredRuntimeMode !== 'remote') {
    return configurationError(
      'Missing or invalid EXPO_PUBLIC_DROPITYCOON_RUNTIME_MODE. Use remote for development/preview or bundled for production.',
    )
  }

  if (!configuredGameUrl) {
    return configurationError(
      'Remote runtime mode requires EXPO_PUBLIC_DROPITYCOON_GAME_URL.',
    )
  }

  try {
    const parsed = new URL(configuredGameUrl)
    if (parsed.protocol !== 'https:') {
      return configurationError(
        'EXPO_PUBLIC_DROPITYCOON_GAME_URL must use HTTPS in remote runtime mode.',
      )
    }

    return {
      mode: 'remote',
      remoteGameUrl: parsed.toString(),
      configurationError: null,
    }
  } catch {
    return configurationError(
      'EXPO_PUBLIC_DROPITYCOON_GAME_URL is not a valid URL.',
    )
  }
}
