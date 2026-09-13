import { AbstractMesh, EngineStore, Mesh, SceneLoader, TransformNode, Vector3 } from '@babylonjs/core'
import '@babylonjs/loaders/glTF'

const ISSUE = 726
const ASSET_ROOT = '/assets/environment/p3/'
const COMPACT_FILE = 'compact-hatchback-v1.glb'
const SEDAN_FILE = 'four-door-sedan-v1.glb'
const TREE_FILE = 'broadleaf-lod.glb'

type StreetLifeStatus = {
  issue: number
  loaded: boolean
  fallback: boolean
  authoredVehicles: number
  authoredTrees: number
  sourceModels: number
  simulationAuthority: 'EXISTING_ROOTS'
  assetMode: 'PINNED_BUILD_TIME_CANDIDATE'
  error?: string
}

const publish = (status: StreetLifeStatus): void => {
  ;(window as unknown as { __DROPiAuthoredStreetLifeV1?: StreetLifeStatus }).__DROPiAuthoredStreetLifeV1 = { ...status }
}

const firstRenderableMesh = (meshes: AbstractMesh[]): Mesh => {
  const mesh = meshes.find(candidate => candidate instanceof Mesh && candidate.getTotalVertices() > 0)
  if (!(mesh instanceof Mesh)) throw new Error('P3 street-life asset has no renderable mesh')
  return mesh
}

const dimensions = (mesh: Mesh): { width: number; height: number; depth: number; minY: number; centerX: number; centerZ: number } => {
  mesh.computeWorldMatrix(true)
  const box = mesh.getBoundingInfo().boundingBox
  return {
    width: Math.max(0.01, box.maximumWorld.x - box.minimumWorld.x),
    height: Math.max(0.01, box.maximumWorld.y - box.minimumWorld.y),
    depth: Math.max(0.01, box.maximumWorld.z - box.minimumWorld.z),
    minY: box.minimumWorld.y,
    centerX: (box.minimumWorld.x + box.maximumWorld.x) / 2,
    centerZ: (box.minimumWorld.z + box.maximumWorld.z) / 2,
  }
}

const hideProceduralVehicle = (rootName: string): void => {
  const scene = EngineStore.LastCreatedScene
  if (!scene) return
  for (const mesh of scene.meshes) {
    if (mesh.name.startsWith('p3-')) continue
    if (mesh.name.includes(rootName)) mesh.setEnabled(false)
  }
}

const mountVehicle = (rootName: string, source: Mesh, cloneName: string): boolean => {
  const scene = EngineStore.LastCreatedScene
  const root = scene?.getTransformNodeByName(rootName)
  if (!scene || !(root instanceof TransformNode)) return false

  const sourceSize = dimensions(source)
  const longestHorizontal = Math.max(sourceSize.width, sourceSize.depth)
  const uniform = 4.05 / longestHorizontal
  const rotate = sourceSize.width > sourceSize.depth ? Math.PI / 2 : 0

  const clone = source.clone(cloneName)
  if (!(clone instanceof Mesh)) return false
  clone.parent = root
  clone.scaling.setAll(uniform)
  clone.rotation.set(0, rotate, 0)

  const rotatedCenterX = rotate === 0 ? sourceSize.centerX : sourceSize.centerZ
  const rotatedCenterZ = rotate === 0 ? sourceSize.centerZ : -sourceSize.centerX
  clone.position.set(-rotatedCenterX * uniform, -root.position.y - sourceSize.minY * uniform, -rotatedCenterZ * uniform)
  clone.checkCollisions = false
  clone.receiveShadows = true
  clone.isPickable = false
  clone.metadata = { ...(clone.metadata ?? {}), dropiP3AuthoredVehicle: true, simulationAuthority: rootName }
  clone.computeWorldMatrix(true)

  hideProceduralVehicle(rootName)
  return true
}

const hideProceduralTreeAt = (position: Vector3): void => {
  const scene = EngineStore.LastCreatedScene
  if (!scene) return
  for (const mesh of scene.meshes) {
    const treePresentation = mesh.name.startsWith('tree-trunk-') || mesh.name.startsWith('tree-crown-') || mesh.name.startsWith('realism-v2-tree-canopy-')
    if (!treePresentation || mesh.name.startsWith('p3-')) continue
    const dx = mesh.position.x - position.x
    const dz = mesh.position.z - position.z
    if (dx * dx + dz * dz <= 5.0) mesh.setEnabled(false)
  }
}

const mountTree = (source: Mesh, position: Vector3, index: number): boolean => {
  const size = dimensions(source)
  const targetHeight = 4.7 + (index % 3) * 0.38
  const uniform = targetHeight / size.height
  const clone = source.clone(`p3-broadleaf-${index}`)
  if (!(clone instanceof Mesh)) return false

  clone.scaling.setAll(uniform)
  clone.position.set(position.x - size.centerX * uniform, -size.minY * uniform, position.z - size.centerZ * uniform)
  clone.rotation.y = (index % 5) * 0.41
  clone.checkCollisions = false
  clone.receiveShadows = false
  clone.isPickable = false
  clone.metadata = { ...(clone.metadata ?? {}), dropiP3AuthoredTree: true }
  clone.computeWorldMatrix(true)
  clone.freezeWorldMatrix()
  hideProceduralTreeAt(position)
  return true
}

let loading = false

const boot = async (): Promise<void> => {
  const scene = EngineStore.LastCreatedScene
  if (!scene || !scene.metadata?.dropiAuthoredBlocksV1) {
    window.requestAnimationFrame(() => void boot())
    return
  }
  if (scene.metadata?.dropiAuthoredStreetLifeV1 || loading) return
  loading = true

  const status: StreetLifeStatus = {
    issue: ISSUE,
    loaded: false,
    fallback: true,
    authoredVehicles: 0,
    authoredTrees: 0,
    sourceModels: 0,
    simulationAuthority: 'EXISTING_ROOTS',
    assetMode: 'PINNED_BUILD_TIME_CANDIDATE',
  }
  publish(status)

  try {
    const [compactAsset, sedanAsset, treeAsset] = await Promise.all([
      SceneLoader.ImportMeshAsync('', ASSET_ROOT, COMPACT_FILE, scene),
      SceneLoader.ImportMeshAsync('', ASSET_ROOT, SEDAN_FILE, scene),
      SceneLoader.ImportMeshAsync('', ASSET_ROOT, TREE_FILE, scene),
    ])

    const compactSource = firstRenderableMesh(compactAsset.meshes)
    const sedanSource = firstRenderableMesh(sedanAsset.meshes)
    const treeSource = firstRenderableMesh(treeAsset.meshes)
    status.sourceModels = 3

    if (mountVehicle('car-1', compactSource, 'p3-car-1-compact')) status.authoredVehicles += 1
    if (mountVehicle('car-2', sedanSource, 'p3-car-2-sedan')) status.authoredVehicles += 1
    if (mountVehicle('car-3', compactSource, 'p3-car-3-compact')) status.authoredVehicles += 1

    const hero = scene.getTransformNodeByName('hero')
    const heroPosition = hero instanceof TransformNode ? hero.position : new Vector3(-2, 0, 20)
    const trunks = scene.meshes
      .filter(mesh => mesh instanceof Mesh && mesh.isEnabled() && mesh.name.startsWith('tree-trunk-'))
      .map(mesh => mesh as Mesh)
      .sort((a, b) => Vector3.DistanceSquared(a.position, heroPosition) - Vector3.DistanceSquared(b.position, heroPosition))
      .slice(0, 7)

    trunks.forEach((trunk, index) => {
      if (mountTree(treeSource, trunk.position.clone(), index)) status.authoredTrees += 1
    })

    compactAsset.meshes.forEach(mesh => mesh.setEnabled(false))
    compactAsset.transformNodes.forEach(node => node.setEnabled(false))
    sedanAsset.meshes.forEach(mesh => mesh.setEnabled(false))
    sedanAsset.transformNodes.forEach(node => node.setEnabled(false))
    treeAsset.meshes.forEach(mesh => mesh.setEnabled(false))
    treeAsset.transformNodes.forEach(node => node.setEnabled(false))

    status.loaded = status.authoredVehicles >= 2 && status.authoredTrees >= 4
    status.fallback = !status.loaded
    publish(status)
    scene.metadata = { ...(scene.metadata ?? {}), dropiAuthoredStreetLifeV1: status.loaded }
  } catch (error) {
    status.error = error instanceof Error ? error.message : String(error)
    status.loaded = false
    status.fallback = true
    publish(status)
    console.warn('P3 authored street-life family unavailable; retaining procedural vehicle/tree presentation.', error)
    scene.metadata = { ...(scene.metadata ?? {}), dropiAuthoredStreetLifeV1: false }
  } finally {
    loading = false
  }
}

void boot()
