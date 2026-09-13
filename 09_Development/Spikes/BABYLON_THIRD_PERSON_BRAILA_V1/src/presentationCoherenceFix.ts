import { EngineStore, Mesh, TransformNode, Vector3 } from '@babylonjs/core'

const ISSUE = 731

const shortestAngleDelta = (from: number, to: number): number =>
  Math.atan2(Math.sin(to - from), Math.cos(to - from))

const boot = (): void => {
  const scene = EngineStore.LastCreatedScene
  const hero = scene?.getTransformNodeByName('hero')
  if (!scene || !(hero instanceof TransformNode) || !scene.metadata?.dropiHeroMotionV1) {
    window.requestAnimationFrame(boot)
    return
  }
  if (scene.metadata?.dropiPresentationCoherenceFix) return

  // HQ visual-safe placement invariant: the canopy belongs directly above the
  // entrance, below the canonical sign clear zone. The previous realism pass
  // placed it through the sign volume and hid previously accepted signage.
  const canopy = scene.getMeshByName('realism-hq-canopy')
  if (canopy instanceof Mesh) {
    canopy.position.y = 2.22
    canopy.computeWorldMatrix(true)
  }

  const sign = scene.getMeshByName('sign-plane-DROPi HQ')
  if (sign instanceof Mesh) {
    sign.position.y = 3.72
    sign.computeWorldMatrix(true)
  }

  // Presentation-only facing guard. Authoritative movement remains owned by
  // Natural Controls; this only keeps the visible +Z hero front aligned with
  // measured ground-plane velocity so the avatar cannot visually moonwalk.
  let previous = hero.position.clone()
  scene.onBeforeRenderObservable.add(() => {
    const dt = Math.min(scene.getEngine().getDeltaTime() / 1000, 0.05)
    if (dt <= 0) return
    const delta = hero.position.subtract(previous)
    previous.copyFrom(hero.position)
    delta.y = 0
    if (delta.lengthSquared() < 0.000004) return

    delta.normalize()
    const desiredYaw = Math.atan2(delta.x, delta.z)
    const blend = 1 - Math.exp(-18 * dt)
    hero.rotation.y += shortestAngleDelta(hero.rotation.y, desiredYaw) * blend
  })

  scene.metadata = { ...(scene.metadata ?? {}), dropiPresentationCoherenceFix: true }
  ;(window as Window & { __DROPiPresentationCoherence?: { issue: number; hqSignClear: boolean } })
    .__DROPiPresentationCoherence = {
      issue: ISSUE,
      hqSignClear: true,
    }
}

boot()
