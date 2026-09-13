import {
  AbstractMesh,
  Color3,
  Color4,
  DirectionalLight,
  EngineStore,
  HemisphericLight,
  Mesh,
  SceneLoader,
  StandardMaterial,
  Vector3,
} from '@babylonjs/core'
import '@babylonjs/loaders/glTF'

const ISSUE = 726
const ASSET_ROOT = '/assets/environment/p4/'
const STREET_FILE = 'Street_2Lane.gltf'
const INTERSECTION_FILE = 'Street_4WayIntersection.gltf'
const PLANTER_FILE = 'Sidewalk_Planter.gltf'
const BOLLARD_FILE = 'Prop_Bollard.gltf'
const MANHOLE_FILE = 'Prop_ManholeCover.gltf'

type P4Status = {
  issue: number
  loaded: boolean
  fallback: boolean
  roadSegments: number
  intersections: number
  streetProps: number
  lookTuned: boolean
  sourceModels: number
  collisionAuthority: 'EXISTING_PROCEDURAL_SURFACES'
  assetMode: 'PINNED_BUILD_TIME_CANDIDATE'
  error?: string
}

const publish = (status: P4Status): void => {
  ;(window as unknown as { __DROPiAuthoredStreetLayerV1?: P4Status }).__DROPiAuthoredStreetLayerV1 = { ...status }
}

const firstRenderableMesh = (meshes: AbstractMesh[]): Mesh => {
  const mesh = meshes.find(candidate => candidate instanceof Mesh && candidate.getTotalVertices() > 0)
  if (!(mesh instanceof Mesh)) throw new Error('P4 street-layer asset has no renderable mesh')
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

const mountFlat = (
  source: Mesh,
  name: string,
  center: Vector3,
  targetWidth: number,
  targetDepth: number,
  rotationY: number,
): Mesh | null => {
  const size = dimensions(source)
  const quarterTurn = Math.abs(Math.sin(rotationY)) > 0.7
  const scaleX = quarterTurn ? targetDepth / size.width : targetWidth / size.width
  const scaleZ = quarterTurn ? targetWidth / size.depth : targetDepth / size.depth
  const scaleY = Math.min(scaleX, scaleZ)
  const clone = source.clone(name)
  if (!(clone instanceof Mesh)) return null

  clone.scaling.set(scaleX, scaleY, scaleZ)
  clone.rotation.y = rotationY
  const localX = size.centerX * scaleX
  const localZ = size.centerZ * scaleZ
  const cos = Math.cos(rotationY)
  const sin = Math.sin(rotationY)
  const rotatedX = localX * cos + localZ * sin
  const rotatedZ = -localX * sin + localZ * cos
  clone.position.set(center.x - rotatedX, center.y - size.minY * scaleY, center.z - rotatedZ)
  clone.checkCollisions = false
  clone.isPickable = false
  clone.receiveShadows = false
  clone.metadata = { ...(clone.metadata ?? {}), dropiP4AuthoredStreet: true, collisionAuthority: 'procedural-underlay' }
  clone.computeWorldMatrix(true)
  clone.freezeWorldMatrix()
  return clone
}

const mountProp = (
  source: Mesh,
  name: string,
  position: Vector3,
  targetHeight: number,
  rotationY = 0,
): Mesh | null => {
  const size = dimensions(source)
  const uniform = targetHeight / size.height
  const clone = source.clone(name)
  if (!(clone instanceof Mesh)) return null
  clone.scaling.setAll(uniform)
  clone.rotation.y = rotationY
  const localX = size.centerX * uniform
  const localZ = size.centerZ * uniform
  const cos = Math.cos(rotationY)
  const sin = Math.sin(rotationY)
  const rotatedX = localX * cos + localZ * sin
  const rotatedZ = -localX * sin + localZ * cos
  clone.position.set(position.x - rotatedX, position.y - size.minY * uniform, position.z - rotatedZ)
  clone.checkCollisions = false
  clone.isPickable = false
  clone.receiveShadows = false
  clone.metadata = { ...(clone.metadata ?? {}), dropiP4StreetProp: true }
  clone.computeWorldMatrix(true)
  clone.freezeWorldMatrix()
  return clone
}

const tuneLook = (): boolean => {
  const scene = EngineStore.LastCreatedScene
  if (!scene) return false

  scene.clearColor = new Color4(0.61, 0.74, 0.82, 1)
  scene.fogColor = new Color3(0.61, 0.74, 0.82)
  scene.fogDensity = 0.00255

  const ambient = scene.getLightByName('ambient')
  if (ambient instanceof HemisphericLight) {
    ambient.intensity = 0.56
    ambient.diffuse = new Color3(0.94, 0.97, 1)
    ambient.groundColor = new Color3(0.31, 0.29, 0.25)
  }
  const sun = scene.getLightByName('sun')
  if (sun instanceof DirectionalLight) {
    sun.direction.set(-0.40, -1, 0.27)
    sun.position.set(42, 68, -36)
    sun.intensity = 1.18
    sun.diffuse = new Color3(1, 0.94, 0.85)
  }

  scene.imageProcessingConfiguration.exposure = 1.05
  scene.imageProcessingConfiguration.contrast = 1.12

  const water = scene.getMaterialByName('danube')
  if (water instanceof StandardMaterial) {
    water.diffuseColor = Color3.FromHexString('#2f6277')
    water.specularColor = new Color3(0.46, 0.54, 0.58)
    water.emissiveColor = new Color3(0.018, 0.035, 0.042)
  }
  return true
}

let loading = false

const boot = async (): Promise<void> => {
  const scene = EngineStore.LastCreatedScene
  if (!scene || !scene.metadata?.dropiAuthoredStreetLifeV1) {
    window.requestAnimationFrame(() => void boot())
    return
  }
  if (scene.metadata?.dropiAuthoredStreetLayerV1 || loading) return
  loading = true

  const status: P4Status = {
    issue: ISSUE,
    loaded: false,
    fallback: true,
    roadSegments: 0,
    intersections: 0,
    streetProps: 0,
    lookTuned: false,
    sourceModels: 0,
    collisionAuthority: 'EXISTING_PROCEDURAL_SURFACES',
    assetMode: 'PINNED_BUILD_TIME_CANDIDATE',
  }
  publish(status)

  try {
    const [streetAsset, intersectionAsset, planterAsset, bollardAsset, manholeAsset] = await Promise.all([
      SceneLoader.ImportMeshAsync('', ASSET_ROOT, STREET_FILE, scene),
      SceneLoader.ImportMeshAsync('', ASSET_ROOT, INTERSECTION_FILE, scene),
      SceneLoader.ImportMeshAsync('', ASSET_ROOT, PLANTER_FILE, scene),
      SceneLoader.ImportMeshAsync('', ASSET_ROOT, BOLLARD_FILE, scene),
      SceneLoader.ImportMeshAsync('', ASSET_ROOT, MANHOLE_FILE, scene),
    ])

    const streetSource = firstRenderableMesh(streetAsset.meshes)
    const intersectionSource = firstRenderableMesh(intersectionAsset.meshes)
    const planterSource = firstRenderableMesh(planterAsset.meshes)
    const bollardSource = firstRenderableMesh(bollardAsset.meshes)
    const manholeSource = firstRenderableMesh(manholeAsset.meshes)
    status.sourceModels = 5

    const mainX = [-56, -40, -24, -8, 24, 40, 56]
    mainX.forEach((x, index) => {
      if (mountFlat(streetSource, `p4-main-street-${index}`, new Vector3(x, 0.085, 0), 15.8, 11.65, 0)) status.roadSegments += 1
    })
    const crossZ = [-30, -15, 15, 30]
    crossZ.forEach((z, index) => {
      if (mountFlat(streetSource, `p4-cross-street-${index}`, new Vector3(8, 0.088, z), 15.8, 11.65, Math.PI / 2)) status.roadSegments += 1
    })
    if (mountFlat(intersectionSource, 'p4-main-intersection', new Vector3(8, 0.09, 0), 12.2, 12.2, 0)) status.intersections += 1

    const planterPositions = [
      new Vector3(21, 0.16, 9.8), new Vector3(26, 0.16, 9.8), new Vector3(34, 0.16, 9.8),
      new Vector3(-32, 0.16, -7.2), new Vector3(-24, 0.16, -7.2),
    ]
    planterPositions.forEach((position, index) => {
      if (mountProp(planterSource, `p4-planter-${index}`, position, 0.72, index % 2 ? Math.PI / 2 : 0)) status.streetProps += 1
    })

    for (let x = -48, index = 0; x <= 48; x += 12, index += 1) {
      if (mountProp(bollardSource, `p4-quay-bollard-${index}`, new Vector3(x, 0.17, -38.6), 0.82)) status.streetProps += 1
    }
    const manholes = [new Vector3(-30, 0.105, 2.6), new Vector3(29, 0.105, -2.5), new Vector3(8, 0.108, 20)]
    manholes.forEach((position, index) => {
      if (mountProp(manholeSource, `p4-manhole-${index}`, position, 0.055, index * 0.4)) status.streetProps += 1
    })

    for (const mesh of scene.meshes) {
      if (mesh.name.startsWith('lane-')) mesh.setEnabled(false)
    }

    status.lookTuned = tuneLook()

    for (const asset of [streetAsset, intersectionAsset, planterAsset, bollardAsset, manholeAsset]) {
      asset.meshes.forEach(mesh => mesh.setEnabled(false))
      asset.transformNodes.forEach(node => node.setEnabled(false))
    }

    status.loaded = status.roadSegments >= 9 && status.intersections === 1 && status.streetProps >= 10 && status.lookTuned
    status.fallback = !status.loaded
    publish(status)
    scene.metadata = { ...(scene.metadata ?? {}), dropiAuthoredStreetLayerV1: status.loaded }
  } catch (error) {
    status.error = error instanceof Error ? error.message : String(error)
    status.loaded = false
    status.fallback = true
    publish(status)
    console.warn('P4 authored street layer unavailable; retaining P3 presentation.', error)
    scene.metadata = { ...(scene.metadata ?? {}), dropiAuthoredStreetLayerV1: false }
  } finally {
    loading = false
  }
}

void boot()
