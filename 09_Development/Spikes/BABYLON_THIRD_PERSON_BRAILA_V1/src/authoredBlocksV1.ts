import { AbstractMesh, AssetContainer, EngineStore, Mesh, SceneLoader, Vector3 } from '@babylonjs/core'
import '@babylonjs/loaders/glTF'
import { fitCompleteModelBox, instantiateCompleteModel, waitForPresentationStage } from './completeAssetPresentation'
import type { CompleteModel } from './completeAssetPresentation'

const STAGE = 'dropiAuthoredBlocksV1'
const ASSET_ROOT = '/assets/environment/p3/'
const TARGETS = [
  { buildingName: 'building-3', source: 0 }, { buildingName: 'building-6', source: 0 },
  { buildingName: 'building-8', source: 1 }, { buildingName: 'building-10', source: 1 },
]
type P3Status = {
  issue: number; loaded: boolean; fallback: boolean; authoredShells: number
  sourceModels: number; hiddenProceduralDetails: number; retainedMeshes: number
  collisionAuthority: 'PROCEDURAL_MASS'; assetMode: 'PINNED_BUILD_TIME_CANDIDATE'; error?: string
}
const publish = (state: P3Status): void => {
  ;(window as unknown as { __DROPiAuthoredBlocksV1?: P3Status }).__DROPiAuthoredBlocksV1 = { ...state }
}
let started = false
const boot = async (): Promise<void> => {
  const scene = EngineStore.LastCreatedScene
  if (!scene) { setTimeout(() => void boot(), 100); return }
  if (started) return
  started = true
  const state: P3Status = { issue: 726, loaded: false, fallback: true, authoredShells: 0, sourceModels: 0, hiddenProceduralDetails: 0, retainedMeshes: 0, collisionAuthority: 'PROCEDURAL_MASS', assetMode: 'PINNED_BUILD_TIME_CANDIDATE' }
  const containers: AssetContainer[] = []
  const models: CompleteModel[] = []
  const replaced = new Map<AbstractMesh, boolean>()
  publish(state)
  try {
    await waitForPresentationStage(scene, 'dropiAuthoredEnvironmentV1')
    for (const file of ['Building_Small_1.gltf', 'Building_Medium_2_001.gltf']) containers.push(await SceneLoader.LoadAssetContainerAsync(ASSET_ROOT, file, scene))
    if (scene.isDisposed) throw new Error('Scene disposed during P3 import')
    state.sourceModels = containers.length
    for (const spec of TARGETS) {
      const target = scene.getMeshByName(spec.buildingName)
      if (!(target instanceof Mesh)) throw new Error(`Missing building anchor ${spec.buildingName}`)
      target.computeWorldMatrix(true)
      const b = target.getBoundingInfo().boundingBox
      const model = instantiateCompleteModel(containers[spec.source]!, scene, `p3-shell-${target.name}`)
      models.push(model)
      fitCompleteModelBox(model, new Vector3(b.centerWorld.x, b.minimumWorld.y, b.centerWorld.z), {
        width: b.maximumWorld.x - b.minimumWorld.x, height: b.maximumWorld.y - b.minimumWorld.y, depth: b.maximumWorld.z - b.minimumWorld.z,
      })
      model.root.metadata = { dropiP3AuthoredShell: true, collisionAuthority: target.name }
      for (const mesh of model.meshes) mesh.receiveShadows = true
      // Preserve collider enablement. Replace presentation only, including all
      // facade details from earlier passes, before any static mesh merging.
      const index = target.name.slice('building-'.length)
      const prefixes = [`${target.name}-`, `p2-window-${target.name}-`, `p2-door-${target.name}/`, `target-facade-band-${index}-`, `target-facade-pilaster-${index}-`]
      const exact = new Set([target.name, `realism-v2-plinth-${index}`, `realism-v2-cornice-${index}`, `realism-v2-entry-surround-${index}`, `target-parapet-${index}`, `target-shopfront-${index}`, `target-shop-awning-${index}`])
      for (const mesh of scene.meshes) if (exact.has(mesh.name) || prefixes.some(prefix => mesh.name.startsWith(prefix))) {
        replaced.set(mesh, mesh.isVisible); mesh.isVisible = false; state.hiddenProceduralDetails += 1
      }
      state.authoredShells += 1; state.retainedMeshes += model.meshes.length
    }
    state.loaded = state.authoredShells === TARGETS.length && models.every(model => model.meshes.every(mesh => mesh.isEnabled()))
    if (!state.loaded) throw new Error('P3 complete building coverage check failed')
    state.fallback = false
  } catch (error) {
    models.forEach(model => model.dispose())
    for (const [mesh, visible] of replaced) if (!mesh.isDisposed()) mesh.isVisible = visible
    state.loaded = false; state.fallback = true
    state.error = error instanceof Error ? error.message : String(error)
    console.warn('P3 building presentation failed; previous facades retained.', error)
  } finally {
    if (!scene.isDisposed) {
      scene.metadata = { ...(scene.metadata ?? {}), [STAGE]: state.loaded, [`${STAGE}Settled`]: true }
      scene.onDisposeObservable.addOnce(() => containers.forEach(asset => asset.dispose()))
    } else containers.forEach(asset => asset.dispose())
    publish(state)
  }
}
void boot()
