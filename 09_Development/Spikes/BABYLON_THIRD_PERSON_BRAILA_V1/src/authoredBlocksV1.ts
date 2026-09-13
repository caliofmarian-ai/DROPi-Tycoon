import { AbstractMesh, EngineStore, Mesh, SceneLoader } from '@babylonjs/core'
import '@babylonjs/loaders/glTF'

const ISSUE = 726
const ASSET_ROOT = '/assets/environment/p3/'
const SMALL_FILE = 'Building_Small_1.gltf'
const MEDIUM_FILE = 'Building_Medium_2_001.gltf'

type P3Status = {
  issue: number
  loaded: boolean
  fallback: boolean
  authoredShells: number
  sourceModels: number
  hiddenProceduralDetails: number
  collisionAuthority: 'PROCEDURAL_MASS'
  assetMode: 'PINNED_BUILD_TIME_CANDIDATE'
  error?: string
}

type TargetSpec = {
  buildingName: string
  source: 'small' | 'medium'
}

const TARGETS: TargetSpec[] = [
  { buildingName: 'building-3', source: 'small' },
  { buildingName: 'building-6', source: 'small' },
  { buildingName: 'building-8', source: 'medium' },
  { buildingName: 'building-10', source: 'medium' },
]

const publish = (status: P3Status): void => {
  ;(window as unknown as { __DROPiAuthoredBlocksV1?: P3Status }).__DROPiAuthoredBlocksV1 = { ...status }
}

const firstRenderableMesh = (meshes: AbstractMesh[]): Mesh => {
  const mesh = meshes.find(candidate => candidate instanceof Mesh && candidate.getTotalVertices() > 0)
  if (!(mesh instanceof Mesh)) throw new Error('P3 authored building asset has no renderable mesh')
  return mesh
}

const hideProceduralPresentation = (buildingName: string, status: P3Status): void => {
  const scene = EngineStore.LastCreatedScene
  if (!scene) return
  for (const mesh of scene.meshes) {
    const proceduralDetail = mesh.name.startsWith(`${buildingName}-`)
    const p2Detail = mesh.name.startsWith(`p2-window-${buildingName}-`) || mesh.name === `p2-door-${buildingName}`
    if (!proceduralDetail && !p2Detail) continue
    mesh.setEnabled(false)
    status.hiddenProceduralDetails += 1
  }
}

const fitAuthoredShell = (target: Mesh, source: Mesh, cloneName: string): Mesh => {
  target.computeWorldMatrix(true)
  source.computeWorldMatrix(true)

  const targetBox = target.getBoundingInfo().boundingBox
  const sourceBox = source.getBoundingInfo().boundingBox

  const targetWidth = Math.max(0.01, targetBox.maximumWorld.x - targetBox.minimumWorld.x)
  const targetHeight = Math.max(0.01, targetBox.maximumWorld.y - targetBox.minimumWorld.y)
  const targetDepth = Math.max(0.01, targetBox.maximumWorld.z - targetBox.minimumWorld.z)

  const sourceWidth = Math.max(0.01, sourceBox.maximumWorld.x - sourceBox.minimumWorld.x)
  const sourceHeight = Math.max(0.01, sourceBox.maximumWorld.y - sourceBox.minimumWorld.y)
  const sourceDepth = Math.max(0.01, sourceBox.maximumWorld.z - sourceBox.minimumWorld.z)

  const clone = source.clone(cloneName)
  if (!(clone instanceof Mesh)) throw new Error(`Unable to clone P3 source mesh for ${target.name}`)

  const sx = targetWidth / sourceWidth
  const sy = targetHeight / sourceHeight
  const sz = targetDepth / sourceDepth
  clone.scaling.set(sx, sy, sz)
  clone.rotation.set(0, 0, 0)

  const localCenter = sourceBox.centerWorld
  const localMinY = sourceBox.minimumWorld.y
  const targetCenterX = (targetBox.minimumWorld.x + targetBox.maximumWorld.x) / 2
  const targetCenterZ = (targetBox.minimumWorld.z + targetBox.maximumWorld.z) / 2

  clone.position.set(
    targetCenterX - localCenter.x * sx,
    targetBox.minimumWorld.y - localMinY * sy,
    targetCenterZ - localCenter.z * sz,
  )
  clone.checkCollisions = false
  clone.receiveShadows = true
  clone.isPickable = false
  clone.metadata = { ...(clone.metadata ?? {}), dropiP3AuthoredShell: true, collisionAuthority: target.name }
  clone.computeWorldMatrix(true)
  clone.freezeWorldMatrix()
  return clone
}

let loading = false

const boot = async (): Promise<void> => {
  const scene = EngineStore.LastCreatedScene
  if (!scene || !scene.metadata?.dropiAuthoredEnvironmentV1) {
    window.requestAnimationFrame(() => void boot())
    return
  }
  if (scene.metadata?.dropiAuthoredBlocksV1 || loading) return
  loading = true

  const status: P3Status = {
    issue: ISSUE,
    loaded: false,
    fallback: true,
    authoredShells: 0,
    sourceModels: 0,
    hiddenProceduralDetails: 0,
    collisionAuthority: 'PROCEDURAL_MASS',
    assetMode: 'PINNED_BUILD_TIME_CANDIDATE',
  }
  publish(status)

  try {
    const [smallAsset, mediumAsset] = await Promise.all([
      SceneLoader.ImportMeshAsync('', ASSET_ROOT, SMALL_FILE, scene),
      SceneLoader.ImportMeshAsync('', ASSET_ROOT, MEDIUM_FILE, scene),
    ])
    const smallSource = firstRenderableMesh(smallAsset.meshes)
    const mediumSource = firstRenderableMesh(mediumAsset.meshes)
    status.sourceModels = 2

    for (const spec of TARGETS) {
      const target = scene.getMeshByName(spec.buildingName)
      if (!(target instanceof Mesh)) continue
      const source = spec.source === 'small' ? smallSource : mediumSource
      fitAuthoredShell(target, source, `p3-shell-${spec.buildingName}`)
      hideProceduralPresentation(spec.buildingName, status)
      // Keep the primitive mass enabled as collision/layout authority, but make it visually inert.
      target.visibility = 0
      target.checkCollisions = true
      status.authoredShells += 1
    }

    smallAsset.meshes.forEach(mesh => mesh.setEnabled(false))
    smallAsset.transformNodes.forEach(node => node.setEnabled(false))
    mediumAsset.meshes.forEach(mesh => mesh.setEnabled(false))
    mediumAsset.transformNodes.forEach(node => node.setEnabled(false))

    status.loaded = status.authoredShells >= 2
    status.fallback = !status.loaded
    publish(status)
    scene.metadata = { ...(scene.metadata ?? {}), dropiAuthoredBlocksV1: status.loaded }
  } catch (error) {
    status.error = error instanceof Error ? error.message : String(error)
    status.loaded = false
    status.fallback = true
    publish(status)
    console.warn('P3 authored building shells unavailable; retaining P2/procedural presentation.', error)
    scene.metadata = { ...(scene.metadata ?? {}), dropiAuthoredBlocksV1: false }
  } finally {
    loading = false
  }
}

void boot()
