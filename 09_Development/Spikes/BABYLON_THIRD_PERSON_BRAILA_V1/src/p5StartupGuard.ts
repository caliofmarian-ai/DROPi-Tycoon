import { EngineStore, Mesh } from '@babylonjs/core'

type RiggedHeroState = {
  loaded: boolean
  fallback: boolean
  animation: string
}

const touched = new Set<Mesh>()

const isLegacyHeroMesh = (mesh: Mesh): boolean => {
  const exact = new Set([
    'hero-torso',
    'hero-head',
    'hero-leg-l',
    'hero-leg-r',
    'hero-arm-l',
    'hero-arm-r',
  ])
  return (
    exact.has(mesh.name) ||
    mesh.name.startsWith('realism-v2-hero-') ||
    mesh.name.startsWith('target-hero-') ||
    mesh.name.startsWith('hero-motion-')
  )
}

const riggedState = (): RiggedHeroState | undefined =>
  (window as unknown as { __DROPiRiggedHeroV1?: RiggedHeroState }).__DROPiRiggedHeroV1

const restoreVisibility = (): void => {
  for (const mesh of touched) {
    if (!mesh.isDisposed()) mesh.isVisible = true
  }
}

const guard = (): void => {
  const scene = EngineStore.LastCreatedScene
  const rigged = riggedState()

  if (rigged?.animation === 'FALLBACK_PROCEDURAL') {
    restoreVisibility()
    return
  }

  if (scene) {
    for (const mesh of scene.meshes) {
      if (!(mesh instanceof Mesh) || !isLegacyHeroMesh(mesh)) continue
      touched.add(mesh)
      mesh.isVisible = false
    }
  }

  window.requestAnimationFrame(guard)
}

// This module is intentionally loaded before main.ts. It does not alter the
// simulation or hero authority; it only prevents the obsolete procedural hero
// from being painted while the authored P1/P5 character path is loading.
window.requestAnimationFrame(guard)

export {}
