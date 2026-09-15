import { Mesh, Scene } from '@babylonjs/core'
import { installCityVisuals } from './cityVisualPresentation'
import type { CityVisualBindings } from './cityVisualPresentation'
import type { VisualKit } from './cityVisualRecipe'

// Existing evaluation bindings ONLY. This is not a world/locality catalog or a Brăila fallback.
const RECIPE_ID = 'evaluation-braila-reference-street/v1'
const baseKit: VisualKit = {
  id: 'authored-street-finish', revision: 1, seed: 152026,
  palette: { stone: '#8f938e', trim: '#e0d7c5', metal: '#3e5057', glass: '#436374', accent: '#008cb5' },
  pavingColor: '#bcb5a5', asphaltColor: '#393e40', pavingTileMeters: 2,
  frameWidth: .10, windowWidth: 1.5, windowHeight: 1.55,
}
const destinations = [
  { meshName: 'dropi-hq', accent: '#008cb5' },
  { meshName: 'maras-market', accent: '#b67635' },
  { meshName: 'customer-block', accent: '#63826a' },
] as const
const surfaceNames = ['road-main', 'road-cross', 'sidewalk-main--8', 'sidewalk-main-8', 'sidewalk-cross-0', 'sidewalk-cross-16', 'quay'] as const
export const applyBrailaCityVisuals = (scene: Scene): void => {
  if (scene.metadata?.dropiCityVisualRecipeSettled) return
  const state = {
    status: 'LOADING', recipe: RECIPE_ID, source: 'AUTHORED_CODE_ONLY_CANDIDATE',
    facades: 0, surfaces: 0, detailBoxes: 0, drawMeshes: 0, textures: 0, materials: 0,
    existingRoadModelsPreserved: true, physicalAcceptance: 'UNKNOWN', error: '',
  }
  try {
    const bindings: CityVisualBindings = {
      id: RECIPE_ID,
      facades: destinations.map(({ meshName, accent }) => {
        const building = scene.getMeshByName(meshName)
        if (!(building instanceof Mesh) || !building.isEnabled() || !building.isVisible || building.parent || building.rotation.y !== 0) throw new Error(`Expected explicit evaluation facade ${meshName}`)
        building.computeWorldMatrix(true)
        const box = building.getBoundingInfo().boundingBox
        const windows = scene.meshes.filter((mesh): mesh is Mesh => mesh instanceof Mesh && mesh.name.startsWith(`${meshName}-w-`) && mesh.isEnabled() && mesh.isVisible)
        if (windows.length === 0) throw new Error(`No source window bindings for ${meshName}`)
        const door = scene.getMeshByName(`${meshName}-door`)
        if (!(door instanceof Mesh)) throw new Error(`No source entry binding for ${meshName}`)
        door.computeWorldMatrix(true)
        const entry = door.getBoundingInfo().boundingBox
        const kit = { ...baseKit, palette: { ...baseKit.palette, accent } }
        return {
          kit, replaceWindows: windows,
          anchor: {
            id: meshName, origin: [box.centerWorld.x, box.minimumWorld.y, box.minimumWorld.z] as const, yaw: 0,
            width: box.maximumWorld.x - box.minimumWorld.x, height: box.maximumWorld.y - box.minimumWorld.y,
            windows: windows.map(mesh => {
              mesh.computeWorldMatrix(true)
              const center = mesh.getBoundingInfo().boundingBox.centerWorld
              return [center.x - box.centerWorld.x, center.y - box.minimumWorld.y] as const
            }),
            door: { x: entry.centerWorld.x - box.centerWorld.x, width: entry.maximumWorld.x - entry.minimumWorld.x, height: entry.maximumWorld.y - box.minimumWorld.y },
          },
        }
      }),
      surfaces: surfaceNames.map(name => {
        const mesh = scene.getMeshByName(name)
        if (!(mesh instanceof Mesh)) throw new Error(`Missing explicit surface ${name}`)
        return { kit: baseKit, mesh, family: name.startsWith('road-') ? 'asphalt' as const : 'paving' as const }
      }),
    }
    const handle = installCityVisuals(scene, bindings)
    state.status = 'ACTIVE'; state.facades = bindings.facades.length; state.surfaces = bindings.surfaces.length
    state.detailBoxes = handle.detailBoxes; state.drawMeshes = handle.drawMeshes
    state.textures = handle.textureCount; state.materials = handle.materialCount
  } catch (error) {
    state.status = 'FAIL'; state.error = error instanceof Error ? error.message : String(error)
    console.warn('City visual recipe failed; previous presentation retained.', error)
  }
  scene.metadata = { ...(scene.metadata ?? {}), dropiCityVisualRecipe: state, dropiCityVisualRecipeSettled: true }
  if (typeof window !== 'undefined') (window as unknown as { __DROPiCityVisualRecipe: typeof state }).__DROPiCityVisualRecipe = { ...state }
}
