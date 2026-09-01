import { createInitialCompanyState, createInitialWorldState } from './gameState'
import type { CompanyState, GameSessionState, WorldState } from '../types/game'

let activeSession: GameSessionState | null = null

export const startNewGameSession = (): GameSessionState => {
  activeSession = {
    world: createInitialWorldState(),
    company: createInitialCompanyState(),
  }
  return activeSession
}

export const getOrCreateGameSession = (): GameSessionState =>
  activeSession ?? startNewGameSession()

export const replaceGameSession = (
  world: WorldState,
  company: CompanyState,
): GameSessionState => {
  activeSession = { world, company }
  return activeSession
}

export const peekGameSession = (): GameSessionState | null => activeSession

export const clearGameSession = (): void => {
  activeSession = null
}
