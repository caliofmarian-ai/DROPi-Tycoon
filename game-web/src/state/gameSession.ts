import {
  createInitialCompanyState,
  createInitialGameSettingsState,
  createInitialWorldState,
} from './gameState'
import { createInitialPersonalProgressionState } from '../systems/personalCapabilitySystem'
import type {
  CompanyState,
  GameSessionState,
  GameSettingsState,
  WorldState,
} from '../types/game'

let activeSession: GameSessionState | null = null

export const startNewGameSession = (): GameSessionState => {
  activeSession = {
    world: createInitialWorldState(),
    company: createInitialCompanyState(),
    settings: createInitialGameSettingsState(),
    personalProgression: createInitialPersonalProgressionState(),
  }
  return activeSession
}

export const getOrCreateGameSession = (): GameSessionState =>
  activeSession ?? startNewGameSession()

export const replaceGameSession = (
  world: WorldState,
  company: CompanyState,
  settings: GameSettingsState = activeSession?.settings ?? createInitialGameSettingsState(),
): GameSessionState => {
  activeSession = {
    world,
    company,
    settings,
    personalProgression: activeSession?.personalProgression ?? createInitialPersonalProgressionState(),
  }
  return activeSession
}

export const replaceEntireGameSession = (session: GameSessionState): GameSessionState => {
  activeSession = {
    ...session,
    personalProgression: session.personalProgression ?? createInitialPersonalProgressionState(),
  }
  return activeSession
}

export const peekGameSession = (): GameSessionState | null => activeSession

export const clearGameSession = (): void => {
  activeSession = null
}
