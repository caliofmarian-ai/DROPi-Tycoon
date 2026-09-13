import { AssetContainer, EngineStore, Mesh, Scene, SceneLoader, TransformNode, Vector3 } from '@babylonjs/core'
import '@babylonjs/loaders/glTF'
import { fitCompleteModel, instantiateCompleteModel, waitForPresentationStage } from './completeAssetPresentation'

const ISSUE = 726
const ASSET_ROOT = '/assets/environment/p3/'
type StreetLifeStatus = {
  issue: number; loaded: boolean; fallback: boolean; authoredVehicles: number; authoredTrees: number
  sourceModels: number; retainedVehicleMeshes: number; retainedTreeMeshes: number
  simulationAuthority: 'EXISTING_ROOTS'; assetMode: 'PINNED_BUILD_TIME_CANDIDATE'; error?: string
}
const publish = (state: StreetLifeStatus): void => {
  ;(window as unknown as { __DROPiAuthoredStreetLifeV1?: StreetLifeStatus }).__DROPiAuthoredStreetLifeV1 = { ...state }
}

const surfaceY = (scene: Scene, x: number, z: number): number => {
  let y = -Infinity
  for (const mesh of scene.meshes) {
    if (!(mesh instanceof Mesh) || !(mesh.name === 'ground' || mesh.name === 'quay' || mesh.name.startsWith('road-') || mesh.name.startsWith('sidewalk-'))) continue
    mesh.computeWorldMatrix(true)
    const b = mesh.getBoundingInfo().boundingBox
    if (x >= b.minimumWorld.x && x <= b.maximumWorld.x && z >= b.minimumWorld.z && z <= b.maximumWorld.z) y = Math.max(y, b.maximumWorld.y)
  }
  if (!Number.isFinite(y)) throw new Error(`Missing governed ground at ${x},${z}`)
  return y
}

const mountVehicle = (scene: Scene, asset: AssetContainer, name: string, state: StreetLifeStatus): void => {
  const simulation = scene.getTransformNodeByName(name)
  if (!(simulation instanceof TransformNode)) throw new Error(`Missing vehicle root ${name}`)
  // Snapshot the old presentation before creating the new hierarchy.
  const old = simulation.getChildMeshes(false)
  const model = instantiateCompleteModel(asset, scene, `p3-${name}-complete`)
  try {
    const p = simulation.getAbsolutePosition()
    fitCompleteModel(model, new Vector3(0, surfaceY(scene, p.x, p.z) + 0.006 - p.y, 0), { length: 4.05 }, 0, true)
    model.root.parent = simulation
    model.root.metadata = { dropiP3AuthoredVehicle: true, simulationAuthority: name }
    model.meshes.forEach(mesh => { mesh.receiveShadows = true; mesh.computeWorldMatrix(true) })
    // Do not setEnabled(false) on a collider or on the simulation root.
    old.forEach(mesh => { mesh.isVisible = false })
    state.authoredVehicles += 1
    state.retainedVehicleMeshes += model.meshes.length
  } catch (error) { model.dispose(); throw error }
}

const mountTree = (scene: Scene, asset: AssetContainer, trunk: Mesh, index: number, state: StreetLifeStatus): void => {
  const p = trunk.getAbsolutePosition().clone()
  const old = scene.meshes.filter(mesh =>
    (mesh.name.startsWith('tree-trunk-') || mesh.name.startsWith('tree-crown-') || mesh.name.startsWith('realism-v2-tree-canopy-')) &&
    (mesh.position.x - p.x) ** 2 + (mesh.position.z - p.z) ** 2 <= 5,
  )
  const model = instantiateCompleteModel(asset, scene, `p3-broadleaf-${index}`)
  try {
    fitCompleteModel(model, new Vector3(p.x, surfaceY(scene, p.x, p.z), p.z), { height: 4.7 + (index % 3) * 0.38 }, (index % 5) * 0.41)
    model.root.metadata = { dropiP3AuthoredTree: true }
    model.meshes.forEach(mesh => { mesh.receiveShadows = false; mesh.computeWorldMatrix(true); mesh.freezeWorldMatrix() })
    old.forEach(mesh => { mesh.isVisible = false })
    state.authoredTrees += 1
    state.retainedTreeMeshes += model.meshes.length
  } catch (error) { model.dispose(); throw error }
}

let started = false
const boot = async (): Promise<void> => {
  const scene = EngineStore.LastCreatedScene
  if (!scene) {
    window.setTimeout(() => void boot(), 100)
    return
  }
  if (started) return
  started = true
  const state: StreetLifeStatus = {
    issue: ISSUE, loaded: false, fallback: true, authoredVehicles: 0, authoredTrees: 0, sourceModels: 0,
    retainedVehicleMeshes: 0, retainedTreeMeshes: 0, simulationAuthority: 'EXISTING_ROOTS', assetMode: 'PINNED_BUILD_TIME_CANDIDATE',
  }
  publish(state)
  const assets: AssetContainer[] = []
  try {
    await waitForPresentationStage(scene, 'dropiAuthoredBlocksV1')
    // Keep originals in asset containers, outside the scene. Clones must never
    // inherit a hidden source root or lose sibling wheels, glass, bark or leaves.
    for (const file of ['compact-hatchback-v1.glb', 'four-door-sedan-v1.glb', 'broadleaf-lod.glb']) {
      assets.push(await SceneLoader.LoadAssetContainerAsync(ASSET_ROOT, file, scene))
    }
    if (scene.isDisposed) { assets.forEach(asset => asset.dispose()); return }
    const [compact, sedan, tree] = assets
    if (!compact || !sedan || !tree) throw new Error('Incomplete street-life asset set')
    state.sourceModels = assets.length
    const hero = scene.getTransformNodeByName('hero')
    if (!hero) throw new Error('Missing hero root for locality selection')
    const anchors = scene.meshes.filter((mesh): mesh is Mesh => mesh instanceof Mesh && mesh.name.startsWith('tree-trunk-'))
      .sort((a, b) => Vector3.DistanceSquared(a.position, hero.position) - Vector3.DistanceSquared(b.position, hero.position)).slice(0, 7)
    if (anchors.length < 4) throw new Error(`Tree anchors lost before replacement: ${anchors.length}; retain them until P4 settles`)
    mountVehicle(scene, compact, 'car-1', state)
    mountVehicle(scene, sedan, 'car-2', state)
    mountVehicle(scene, compact, 'car-3', state)
    anchors.forEach((trunk, index) => mountTree(scene, tree, trunk, index, state))
    state.loaded = state.authoredVehicles === 3 && state.authoredTrees === anchors.length
    state.fallback = !state.loaded
    if (!state.loaded) state.error = `Incomplete replacement: ${state.authoredVehicles}/3 cars, ${state.authoredTrees}/${anchors.length} trees`
  } catch (error) {
    state.error = error instanceof Error ? error.message : String(error)
    state.fallback = true
    console.warn('P3 street-life replacement incomplete; keep unmodified fallbacks.', error)
  }
  // A partial outcome is an error, never a permanently misleading LOADING state.
  publish(state)
  if (!scene.isDisposed) {
    scene.metadata = { ...(scene.metadata ?? {}), dropiAuthoredStreetLifeV1: state.loaded, dropiAuthoredStreetLifeV1Settled: true }
    scene.onDisposeObservable.addOnce(() => assets.forEach(asset => asset.dispose()))
  } else assets.forEach(asset => asset.dispose())
}
void boot()
