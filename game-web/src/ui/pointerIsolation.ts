import { boundsContainPoint, type RectBounds } from './hudLayout'

export interface UIHitTestState {
  menuButtonBounds: ReadonlyArray<RectBounds>
  hudControlBounds: ReadonlyArray<RectBounds>
}

/**
 * Shared UI hit-testing used by scene pointer guards.
 */
export const isPointerOnInteractiveUI = (
  x: number,
  y: number,
  state: UIHitTestState,
): boolean =>
  state.menuButtonBounds.some((bounds) => boundsContainPoint(bounds, x, y)) ||
  state.hudControlBounds.some((bounds) => boundsContainPoint(bounds, x, y))
