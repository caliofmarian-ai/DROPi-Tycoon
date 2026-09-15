import { Mesh, Scene } from '@babylonjs/core'
import { installImageQuality } from './imageQualityPresentation'
import type { QualityBuilding } from './imageQualityPresentation'

// Explicit evaluation-local style binding. The shared renderer contains no city fallback.
const profiles = [
  { name: 'dropi-hq', color: '#a2b3b9', roofColor: '#495762', rise: .45, shape: 'hip', family: 'stone' },
  { name: 'maras-market', color: '#d1bba0', roofColor: '#81594b', rise: 1.9, shape: 'gable', family: 'plaster' },
  { name: 'customer-block', color: '#bbb9a9', roofColor: '#5d6864', rise: 2.1, shape: 'hip', family: 'stone' },
  { name: 'building-0', color: '#c9b89e', roofColor: '#84624e', rise: 2.2, shape: 'hip', family: 'plaster' },
  { name: 'building-1', color: '#b0937d', roofColor: '#7a4f41', rise: 1.7, shape: 'gable', family: 'plaster' },
  { name: 'building-2', color: '#bdc0b4', roofColor: '#616768', rise: 1.8, shape: 'hip', family: 'stone' },
  { name: 'building-4', color: '#c3cbc8', roofColor: '#526270', rise: 1.4, shape: 'hip', family: 'plaster' },
  { name: 'building-5', color: '#c8b499', roofColor: '#80574b', rise: 2.0, shape: 'hip', family: 'plaster' },
  { name: 'building-7', color: '#c2bbaa', roofColor: '#56606b', rise: 2.2, shape: 'hip', family: 'stone' },
  { name: 'building-9', color: '#b3bbb6', roofColor: '#695c51', rise: 2.3, shape: 'hip', family: 'plaster' },
] as const
export const applyBrailaImageQuality = (scene: Scene): void => {
  if (scene.metadata?.dropiImageQualitySettled) return
  const state = { status: 'LOADING', id: 'evaluation-braila-clarity/v1', buildings: 0, triangles: 0, textures: 0, source: 'AUTHORED_CODE_ONLY_CANDIDATE', photographicTextures: false, importedModelsPreserved: true, physicalAcceptance: 'UNKNOWN', error: '' }
  try {
    const buildings: QualityBuilding[] = profiles.map(profile => {
      const source = scene.getMeshByName(profile.name), roof = scene.getMeshByName(`${profile.name}-roof`)
      if (!(source instanceof Mesh) || !(roof instanceof Mesh)) throw new Error(`Missing explicit quality source ${profile.name}`)
      return { source, roof, color: profile.color, roofColor: profile.roofColor, roofRise: profile.rise, roofShape: profile.shape, family: profile.family }
    })
    const handle = installImageQuality(scene, { id: state.id, buildings, exposure: 1.0, contrast: 1.03 })
    state.status = 'ACTIVE'; state.buildings = handle.replacedBuildings; state.triangles = handle.triangles; state.textures = handle.textures
    if (typeof document !== 'undefined') document.dispatchEvent(new CustomEvent('dropi:render-clarity', { detail: 'high' }))
  } catch (error) {
    state.status = 'FAIL'; state.error = error instanceof Error ? error.message : String(error)
    console.warn('Image-quality upgrade failed; earlier city presentation retained.', error)
  }
  scene.metadata = { ...(scene.metadata ?? {}), dropiImageQualitySettled: true, dropiImageQuality: state }
  if (typeof window !== 'undefined') (window as unknown as { __DROPiImageQuality: typeof state }).__DROPiImageQuality = { ...state }
}
