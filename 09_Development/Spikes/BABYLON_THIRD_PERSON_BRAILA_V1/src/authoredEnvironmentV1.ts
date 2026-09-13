import { AssetContainer, EngineStore, Mesh, SceneLoader } from '@babylonjs/core'
import '@babylonjs/loaders/glTF'
import { instantiateCompleteModel } from './completeAssetPresentation'
import type { CompleteModel } from './completeAssetPresentation'

const ISSUE = 726
const STAGE = 'dropiAuthoredEnvironmentV1'
const ASSET_ROOT = '/assets/environment/p2/'
const TARGET_BUILDINGS = [0, 1, 2, 4, 5, 7, 8, 9, 10]

type P2EnvironmentDebug = {
  issue: number; loaded: boolean; fallback: boolean; buildingsUpgraded: number
  authoredWindows: number; authoredDoors: number; sourceMeshes: number
  assetMode: 'PINNED_BUILD_TIME_CANDIDATE'; error?: string
}
const publish = (state: P2EnvironmentDebug): void => {
  ;(window as unknown as { __DROPiAuthoredEnvironmentV1?: P2EnvironmentDebug }).__DROPiAuthoredEnvironmentV1 = { ...state }
}
let started = false
const boot = async (): Promise<void> => {
  const scene = EngineStore.LastCreatedScene
  if (!scene || !scene.metadata?.dropiVisualTargetJumpV1) { setTimeout(() => void boot(), 100); return }
  if (started) return
  started = true
  const state: P2EnvironmentDebug = { issue: ISSUE, loaded: false, fallback: true, buildingsUpgraded: 0, authoredWindows: 0, authoredDoors: 0, sourceMeshes: 0, assetMode: 'PINNED_BUILD_TIME_CANDIDATE' }
  const containers: AssetContainer[] = []
  const models: CompleteModel[] = []
  const replaced = new Map<Mesh, boolean>()
  publish(state)
  try {
    // Containers keep originals out of the live scene. Every primitive and the
    // glTF conversion root survive instantiation; no first-mesh-only shortcut.
    for (const file of ['Brick_RedWhite_DoubleWindow.gltf', 'DoorFrame_Trim.gltf']) containers.push(await SceneLoader.LoadAssetContainerAsync(ASSET_ROOT, file, scene))
    if (scene.isDisposed) throw new Error('Scene disposed during P2 import')
    const windowAsset = containers[0]!
    const doorAsset = containers[1]!
    state.sourceMeshes = containers.reduce((count, asset) => count + asset.meshes.filter(mesh => mesh.getTotalVertices() > 0).length, 0)
    for (const index of TARGET_BUILDINGS) {
      const building = scene.getMeshByName(`building-${index}`)
      if (!(building instanceof Mesh)) throw new Error(`Missing facade anchor building-${index}`)
      building.computeWorldMatrix(true)
      const bounds = building.getBoundingInfo().boundingBox
      const width = bounds.maximumWorld.x - bounds.minimumWorld.x
      const height = bounds.maximumWorld.y - bounds.minimumWorld.y
      const frontZ = bounds.minimumWorld.z - 0.035
      const floorCount = Math.max(2, Math.floor(height / 3.2))
      const columns = Math.max(2, Math.floor(width / 3.35))
      const spacing = (width - 3.4) / Math.max(1, columns - 1)
      for (let floor = 0; floor < floorCount; floor += 1) for (let col = 0; col < columns; col += 1) {
        if (floor === 0 && col === Math.floor(columns / 2)) continue
        const model = instantiateCompleteModel(windowAsset, scene, `p2-window-${building.name}-${floor}-${col}`)
        models.push(model)
        model.root.position.set(bounds.minimumWorld.x + 1.7 + col * spacing, 0.12 + floor * 3, frontZ)
        model.root.scaling.set(0.72, 0.9, 0.92)
        for (const mesh of model.meshes) mesh.receiveShadows = false
        state.authoredWindows += 1
      }
      const door = instantiateCompleteModel(doorAsset, scene, `p2-door-${building.name}`)
      models.push(door)
      door.root.position.set(building.position.x, 0.12, frontZ - 0.012)
      door.root.scaling.set(0.95, 0.93, 0.95)
      for (const mesh of door.meshes) mesh.receiveShadows = false
      state.authoredDoors += 1
      for (const mesh of scene.meshes) {
        if (!(mesh instanceof Mesh)) continue
        if (mesh.name.startsWith(`${building.name}-w-`) || mesh.name === `${building.name}-door`) {
          replaced.set(mesh, mesh.isVisible); mesh.isVisible = false
        }
      }
      state.buildingsUpgraded += 1
    }
    state.loaded = state.buildingsUpgraded === TARGET_BUILDINGS.length && models.every(model => model.meshes.every(mesh => mesh.isEnabled()))
    if (!state.loaded) throw new Error('P2 complete-model coverage check failed')
    state.fallback = false
  } catch (error) {
    models.forEach(model => model.dispose())
    for (const [mesh, visible] of replaced) if (!mesh.isDisposed()) mesh.isVisible = visible
    state.loaded = false; state.fallback = true
    state.error = error instanceof Error ? error.message : String(error)
    console.warn('P2 presentation failed; original facades retained.', error)
  } finally {
    if (!scene.isDisposed) {
      scene.metadata = { ...(scene.metadata ?? {}), [STAGE]: state.loaded, [`${STAGE}Settled`]: true }
      scene.onDisposeObservable.addOnce(() => containers.forEach(asset => asset.dispose()))
    } else containers.forEach(asset => asset.dispose())
    publish(state)
  }
}
void boot()
