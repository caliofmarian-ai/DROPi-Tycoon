import type { SaveStorage } from './saveSystem'

/**
 * Browser-local persistence adapter for the active web runtime.
 * Core save semantics remain in saveSystem.ts and do not depend on Phaser.
 */
export const getBrowserSaveStorage = (): SaveStorage | null => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null
    }

    return window.localStorage
  } catch {
    return null
  }
}
