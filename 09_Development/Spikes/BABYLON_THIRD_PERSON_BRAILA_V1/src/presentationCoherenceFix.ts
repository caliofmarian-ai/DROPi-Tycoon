import { EngineStore, Mesh, TransformNode } from '@babylonjs/core'
import { planarSpeed } from './authoredWalk'

const ISSUE = 731
/** Relocations and suspended frames are not directional joystick movement. */
export const travelledHeading = (dx: number, dz: number, seconds: number): number | null =>
  planarSpeed(dx, dz, seconds) > .005 && Math.hypot(dx, dz) >= .002 ? Math.atan2(dx, dz) : null
const shortestAngleDelta = (from: number, to: number): number => Math.atan2(Math.sin(to - from), Math.cos(to - from))
const boot = (): void => {
  const scene = EngineStore.LastCreatedScene, hero = scene?.getTransformNodeByName('hero')
  if (!scene || !(hero instanceof TransformNode) || !scene.metadata?.dropiHeroMotionV1) { requestAnimationFrame(boot); return }
  if (scene.metadata?.dropiPresentationCoherenceFix) return
  const canopy = scene.getMeshByName('realism-hq-canopy')
  if (canopy instanceof Mesh) { canopy.position.y = 2.22; canopy.computeWorldMatrix(true) }
  const sign = scene.getMeshByName('sign-plane-DROPi HQ')
  if (sign instanceof Mesh) { sign.position.y = 3.72; sign.computeWorldMatrix(true) }
  const previous = hero.position.clone()
  scene.onBeforeRenderObservable.add(() => {
    const seconds = scene.getEngine().getDeltaTime() / 1000
    const dx = hero.position.x - previous.x, dz = hero.position.z - previous.z
    previous.copyFrom(hero.position)
    const yaw = travelledHeading(dx, dz, seconds)
    // The previous guard turned the hero toward the teleport vector after a
    // restart/test relocation, redirecting the requested camera behind a wall.
    if (yaw === null) return
    hero.rotation.y += shortestAngleDelta(hero.rotation.y, yaw) * (1 - Math.exp(-18 * Math.min(seconds, .05)))
  })
  scene.metadata = { ...(scene.metadata ?? {}), dropiPresentationCoherenceFix: true }
  ;(window as unknown as { __DROPiPresentationCoherence?: unknown }).__DROPiPresentationCoherence = { issue: ISSUE, hqSignClear: true }
}
if (typeof window !== 'undefined' && typeof document !== 'undefined') boot()
