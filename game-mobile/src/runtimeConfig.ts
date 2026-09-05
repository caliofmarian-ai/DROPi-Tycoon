const configuredGameUrl = process.env.EXPO_PUBLIC_DROPITYCOON_GAME_URL?.trim()

export interface RuntimeConfiguration {
  gameUrl: string | null
  configurationError: string | null
}

export const getRuntimeConfiguration = (): RuntimeConfiguration => {
  if (!configuredGameUrl) {
    return {
      gameUrl: null,
      configurationError:
        'Missing EXPO_PUBLIC_DROPITYCOON_GAME_URL. Configure the first-stage Railway bridge before building the development client.',
    }
  }

  try {
    const parsed = new URL(configuredGameUrl)
    if (parsed.protocol !== 'https:') {
      return {
        gameUrl: null,
        configurationError: 'EXPO_PUBLIC_DROPITYCOON_GAME_URL must use HTTPS.',
      }
    }

    return {
      gameUrl: parsed.toString(),
      configurationError: null,
    }
  } catch {
    return {
      gameUrl: null,
      configurationError: 'EXPO_PUBLIC_DROPITYCOON_GAME_URL is not a valid URL.',
    }
  }
}
