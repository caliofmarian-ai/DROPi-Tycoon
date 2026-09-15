import { planarSpeed } from './authoredWalk'

export type MotionSample =
  | { kind: 'TRAVEL'; x: number; z: number }
  | { kind: 'STATIONARY' | 'DISCONTINUITY'; x: 0; z: 0 }

/** Use the same continuous-motion boundary as animation and facing correction.
 * A long restart/relocation vector supplies no evidence about walking direction.
 * Ignoring it must preserve an existing verdict, never turn FAIL into PASS.
 */
export const coherenceMotionSample = (dx: number, dz: number, seconds: number): MotionSample => {
  if (![dx, dz, seconds].every(Number.isFinite) || seconds <= 0 || seconds > 2 || Math.hypot(dx, dz) > 2) {
    return { kind: 'DISCONTINUITY', x: 0, z: 0 }
  }
  const lengthSquared = dx * dx + dz * dz
  if (lengthSquared < .00001 || planarSpeed(dx, dz, seconds) === 0) return { kind: 'STATIONARY', x: 0, z: 0 }
  const distance = Math.sqrt(lengthSquared)
  return { kind: 'TRAVEL', x: dx / distance, z: dz / distance }
}
