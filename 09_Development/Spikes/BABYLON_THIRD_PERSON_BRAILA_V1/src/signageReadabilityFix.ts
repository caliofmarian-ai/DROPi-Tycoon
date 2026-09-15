import { EngineStore } from '@babylonjs/core/Engines/engineStore'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { Texture } from '@babylonjs/core/Materials/Textures/texture'

const SIGNAGE_ISSUE = 718

type SignageFixDebug = {
  issue: number
  correctedSigns: string[]
}

declare global {
  interface Window {
    __DROPiSignageReadabilityFix?: SignageFixDebug
  }
}

const boot = (): void => {
  const scene = EngineStore.LastCreatedScene
  if (!scene) {
    window.requestAnimationFrame(boot)
    return
  }

  const signs = scene.meshes.filter(mesh => mesh.name.startsWith('sign-plane-'))
  if (signs.length === 0) {
    window.requestAnimationFrame(boot)
    return
  }

  const correctedSigns: string[] = []

  for (const sign of signs) {
    const material = sign.material
    if (!(material instanceof StandardMaterial)) continue

    const texture = material.diffuseTexture
    if (!(texture instanceof Texture)) continue

    // The façade sign planes are rotated 180° around Y so their visible face points
    // toward the street. That also reverses the texture's local horizontal axis.
    // Mirror U once at texture level so text reads normally from the street-facing side.
    texture.uScale = -Math.abs(texture.uScale || 1)
    texture.uOffset = 1
    correctedSigns.push(sign.name)
  }

  window.__DROPiSignageReadabilityFix = {
    issue: SIGNAGE_ISSUE,
    correctedSigns,
  }
}

boot()
