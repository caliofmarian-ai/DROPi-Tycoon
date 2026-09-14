import { EngineStore, Mesh, TransformNode } from '@babylonjs/core'

const boot = (): void => {
  const scene = EngineStore.LastCreatedScene
  const hero = scene?.getTransformNodeByName('hero')
  if (!scene || !(hero instanceof TransformNode) || !scene.metadata?.dropiVisualTargetJumpV1) { window.requestAnimationFrame(boot); return }
  if (scene.metadata?.dropiGroundContactV1) return
  const leftFoot = scene.getMeshByName('realism-v2-hero-foot--1'), rightFoot = scene.getMeshByName('realism-v2-hero-foot-1')
  if (!(leftFoot instanceof Mesh) || !(rightFoot instanceof Mesh)) { window.requestAnimationFrame(boot); return }
  const visualRoot = new TransformNode('hero-visual-ground-root', scene)
  visualRoot.parent = hero
  const names = ['hero-motion-shoulder-l', 'hero-motion-shoulder-r', 'hero-motion-hip-l', 'hero-motion-hip-r', 'realism-v2-hero-torso', 'realism-v2-hero-head', 'realism-v2-hero-hair', 'realism-v2-hero-backpack', 'realism-v2-hero-arm--1', 'realism-v2-hero-arm-1', 'realism-v2-hero-hand--1', 'realism-v2-hero-hand-1', 'realism-v2-hero-leg--1', 'realism-v2-hero-leg-1', 'realism-v2-hero-foot--1', 'realism-v2-hero-foot-1', 'hero-parcel', 'target-hero-neck', 'target-hero-jacket-panel', 'target-hero-strap-l', 'target-hero-strap-r']
  for (const name of names) {
    const node = scene.getTransformNodeByName(name) ?? scene.getMeshByName(name)
    if (node?.parent === hero) node.parent = visualRoot
  }
  const surfaces = scene.meshes.filter(mesh => mesh instanceof Mesh && (mesh.name === 'ground' || mesh.name === 'quay' || mesh.name.startsWith('road-') || mesh.name.startsWith('sidewalk-'))).map(mesh => {
    mesh.computeWorldMatrix(true)
    const b = mesh.getBoundingInfo().boundingBox
    return { min: b.minimumWorld.clone(), max: b.maximumWorld.clone() }
  })
  const heightAt = (x: number, z: number): number => {
    let top = -Infinity
    for (const surface of surfaces) if (x >= surface.min.x && x <= surface.max.x && z >= surface.min.z && z <= surface.max.z) top = Math.max(top, surface.max.y)
    return Number.isFinite(top) ? top : 0
  }
  scene.onBeforeRenderObservable.add(() => {
    // After the real skin/IK controller takes ownership, this module provides
    // only the initial presentation root and the procedural failed-load fallback.
    if (scene.metadata?.dropiContactPoseV1) return
    const ground = heightAt(hero.position.x, hero.position.z)
    const rigged = (window as unknown as { __DROPiRiggedHeroV1?: { loaded: boolean; soleLocalY: number } }).__DROPiRiggedHeroV1
    const dt = Math.max(0, Math.min(scene.getEngine().getDeltaTime() / 1000, .05))
    const target = ground + .028 - hero.getAbsolutePosition().y - (rigged?.loaded ? rigged.soleLocalY : .02)
    visualRoot.position.y = target > visualRoot.position.y ? target : visualRoot.position.y + (target - visualRoot.position.y) * (1 - Math.exp(-12 * dt))
    let clearance = hero.getAbsolutePosition().y + visualRoot.position.y + (rigged?.loaded ? rigged.soleLocalY : .02) - ground
    if (!rigged?.loaded) {
      leftFoot.computeWorldMatrix(true); rightFoot.computeWorldMatrix(true)
      clearance = Math.min(leftFoot.getBoundingInfo().boundingBox.minimumWorld.y, rightFoot.getBoundingInfo().boundingBox.minimumWorld.y) - ground
      if (clearance < .012) { visualRoot.position.y += .012 - clearance; clearance = .012 }
    }
    ;(window as unknown as { __DROPiGroundContactV1?: unknown }).__DROPiGroundContactV1 = {
      issue: 725, mode: 'startup-or-procedural-grounding', status: rigged?.loaded ? 'UNKNOWN' : clearance >= -.002 ? 'PASS' : 'FAIL',
      surfaceY: ground, visualLiftY: visualRoot.position.y, minFootClearance: clearance,
      visualAuthority: rigged?.loaded ? 'UNVERIFIED_RIG_OFFSET' : 'PROCEDURAL_PROXY',
    }
  })
  scene.metadata = { ...(scene.metadata ?? {}), dropiGroundContactV1: true }
}
boot()
