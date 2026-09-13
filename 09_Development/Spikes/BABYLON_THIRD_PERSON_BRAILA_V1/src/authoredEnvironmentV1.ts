import { AbstractMesh, EngineStore, Mesh, SceneLoader } from '@babylonjs/core'
import '@babylonjs/loaders/glTF'

const ISSUE = 726
const ASSET_ROOT = '/assets/environment/p2/'
const WINDOW_FILE = 'Brick_RedWhite_DoubleWindow.gltf'
const DOOR_FILE = 'DoorFrame_Trim.gltf'

const TARGET_BUILDINGS = new Set([0, 1, 2, 4, 5, 7, 8, 9, 10])

type P2EnvironmentDebug = {
  issue: number
  loaded: boolean
  fallback: boolean
  buildingsUpgraded: number
  authoredWindows: number
  authoredDoors: number
  sourceMeshes: number
  assetMode: 'PINNED_BUILD_TIME_CANDIDATE'
  error?: string
}

const publish = (state: P2EnvironmentDebug): void => {
  ;(window as unknown as { __DROPiAuthoredEnvironmentV1?: P2EnvironmentDebug }).__DROPiAuthoredEnvironmentV1 = { ...state }
}

const firstRenderableMesh = (meshes: AbstractMesh[]): Mesh => {
  const mesh = meshes.find(candidate => candidate instanceof Mesh && candidate.getTotalVertices() > 0)
  if (!(mesh instanceof Mesh)) throw new Error('Authored facade asset has no renderable mesh')
  return mesh
}

const hideProceduralFront = (buildingName: string): void => {
  const scene = EngineStore.LastCreatedScene
  if (!scene) return
  for (const mesh of scene.meshes) {
    if (mesh.name.startsWith(`${buildingName}-w-`) || mesh.name === `${buildingName}-door`) {
      mesh.setEnabled(false)
    }
  }
}

const decorateBuilding = (
  building: Mesh,
  windowSource: Mesh,
  doorSource: Mesh,
  state: P2EnvironmentDebug,
): void => {
  building.computeWorldMatrix(true)
  const box = building.getBoundingInfo().boundingBox
  const width = box.maximumWorld.x - box.minimumWorld.x
  const height = box.maximumWorld.y - box.minimumWorld.y
  const frontZ = box.minimumWorld.z - 0.035
  const floorCount = Math.max(2, Math.floor(height / 3.2))
  const cols = Math.max(2, Math.floor(width / 3.35))
  const spacing = (width - 3.4) / Math.max(1, cols - 1)
  const centerCol = Math.floor(cols / 2)

  hideProceduralFront(building.name)

  for (let floor = 0; floor < floorCount; floor += 1) {
    for (let col = 0; col < cols; col += 1) {
      if (floor === 0 && col === centerCol) continue
      const window = windowSource.clone(`p2-window-${building.name}-${floor}-${col}`)
      if (!(window instanceof Mesh)) continue
      const x = box.minimumWorld.x + 1.7 + col * spacing
      window.position.set(x, 0.12 + floor * 3.0, frontZ)
      window.scaling.set(0.72, 0.9, 0.92)
      window.rotation.y = 0
      window.checkCollisions = false
      window.receiveShadows = false
      window.freezeWorldMatrix()
      state.authoredWindows += 1
    }
  }

  const door = doorSource.clone(`p2-door-${building.name}`)
  if (door instanceof Mesh) {
    door.position.set(building.position.x, 0.12, frontZ - 0.012)
    door.scaling.set(0.95, 0.93, 0.95)
    door.rotation.y = 0
    door.checkCollisions = false
    door.receiveShadows = false
    door.freezeWorldMatrix()
    state.authoredDoors += 1
  }

  state.buildingsUpgraded += 1
}

let loading = false

const boot = async (): Promise<void> => {
  const scene = EngineStore.LastCreatedScene
  if (!scene || !scene.metadata?.dropiVisualTargetJumpV1) {
    window.requestAnimationFrame(() => void boot())
    return
  }
  if (scene.metadata?.dropiAuthoredEnvironmentV1 || loading) return
  loading = true

  const state: P2EnvironmentDebug = {
    issue: ISSUE,
    loaded: false,
    fallback: true,
    buildingsUpgraded: 0,
    authoredWindows: 0,
    authoredDoors: 0,
    sourceMeshes: 0,
    assetMode: 'PINNED_BUILD_TIME_CANDIDATE',
  }
  publish(state)

  try {
    const [windowAsset, doorAsset] = await Promise.all([
      SceneLoader.ImportMeshAsync('', ASSET_ROOT, WINDOW_FILE, scene),
      SceneLoader.ImportMeshAsync('', ASSET_ROOT, DOOR_FILE, scene),
    ])
    const windowSource = firstRenderableMesh(windowAsset.meshes)
    const doorSource = firstRenderableMesh(doorAsset.meshes)
    state.sourceMeshes = 2

    for (const index of TARGET_BUILDINGS) {
      const building = scene.getMeshByName(`building-${index}`)
      if (building instanceof Mesh) decorateBuilding(building, windowSource, doorSource, state)
    }

    windowAsset.meshes.forEach(mesh => mesh.setEnabled(false))
    windowAsset.transformNodes.forEach(node => node.setEnabled(false))
    doorAsset.meshes.forEach(mesh => mesh.setEnabled(false))
    doorAsset.transformNodes.forEach(node => node.setEnabled(false))

    state.loaded = state.buildingsUpgraded > 0 && state.authoredWindows > 0
    state.fallback = !state.loaded
    publish(state)
    scene.metadata = { ...(scene.metadata ?? {}), dropiAuthoredEnvironmentV1: state.loaded }
  } catch (error) {
    state.error = error instanceof Error ? error.message : String(error)
    state.loaded = false
    state.fallback = true
    publish(state)
    console.warn('P2 authored environment unavailable; keeping procedural facade fallback.', error)
    scene.metadata = { ...(scene.metadata ?? {}), dropiAuthoredEnvironmentV1: false }
  } finally {
    loading = false
  }
}

void boot()
