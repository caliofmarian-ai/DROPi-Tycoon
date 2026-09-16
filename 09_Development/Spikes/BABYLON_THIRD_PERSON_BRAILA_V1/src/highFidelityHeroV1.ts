import {
  AbstractMesh,
  Axis,
  Color3,
  EngineStore,
  Material,
  Mesh,
  PBRMaterial,
  Quaternion,
  Scene,
  SceneLoader,
  ShadowGenerator,
  TransformNode,
  Vector3,
} from '@babylonjs/core'
import type { AssetContainer, InstantiatedEntries } from '@babylonjs/core/assetContainer'
import '@babylonjs/loaders/glTF'

const ASSET_ROOT = '/assets/characters/high-fidelity/'
const HERO_FILE = 'hero-courier-v1.glb'
const HERO_HEIGHT_M = 1.78
const LEGACY_ROOT = 'p1-rigged-hero-root'

type HighFidelityHeroState = {
  issue: 755
  status: 'LOADING' | 'ACTIVE' | 'FALLBACK'
  loaded: boolean
  file: string
  heightM: number
  meshCount: number
  skeletonCount: number
  triangleCount: number
  animationMode: 'PROCEDURAL_GAME_ENGINE_GAIT' | 'NONE'
  faceReadableTarget: true
  soleLocalY: number
  error?: string
}

type JointPose = { node: TransformNode; rest: Quaternion }

const publish = (state: HighFidelityHeroState): void => {
  ;(window as unknown as { __DROPiHighFidelityHeroV1?: HighFidelityHeroState }).__DROPiHighFidelityHeroV1 = { ...state }
}

const meshBounds = (meshes: AbstractMesh[]): { min: Vector3; max: Vector3 } => {
  const min = new Vector3(Infinity, Infinity, Infinity)
  const max = new Vector3(-Infinity, -Infinity, -Infinity)
  for (const mesh of meshes) {
    mesh.computeWorldMatrix(true)
    const bounds = mesh.getBoundingInfo().boundingBox
    min.minimizeInPlace(bounds.minimumWorld)
    max.maximizeInPlace(bounds.maximumWorld)
  }
  if (![min.x, min.y, min.z, max.x, max.y, max.z].every(Number.isFinite)) {
    throw new Error('High-fidelity hero has invalid world bounds')
  }
  return { min, max }
}

const triangleCount = (meshes: AbstractMesh[]): number => meshes.reduce((sum, mesh) => {
  const indices = mesh.getIndices()
  return sum + (indices ? Math.floor(indices.length / 3) : Math.floor(mesh.getTotalVertices() / 3))
}, 0)

const normalizeMaterials = (meshes: AbstractMesh[]): void => {
  const seen = new Set<Material>()
  for (const mesh of meshes) {
    const material = mesh.material
    if (!(material instanceof PBRMaterial) || seen.has(material)) continue
    seen.add(material)
    const name = material.name.toLowerCase()
    material.metallic = 0
    material.backFaceCulling = true
    if (name.includes('body')) {
      material.roughness = 0.58
      material.albedoColor = new Color3(1.0, 0.985, 0.975)
      material.transparencyMode = Material.MATERIAL_OPAQUE
    } else if (name.includes('high-poly') || name.includes('eye')) {
      material.roughness = 0.22
      material.transparencyMode = Material.MATERIAL_OPAQUE
    } else if (name.includes('eyebrow') || name.includes('eyelash') || name.includes('short03') || name.includes('hair')) {
      material.roughness = 0.68
      material.transparencyMode = Material.MATERIAL_ALPHATEST
      material.alphaCutOff = 0.34
      if (material.albedoTexture) material.albedoTexture.hasAlpha = true
    } else if (name.includes('teeth')) {
      material.roughness = 0.3
      material.transparencyMode = Material.MATERIAL_OPAQUE
    } else if (name.includes('shoe')) {
      material.roughness = 0.48
      material.transparencyMode = Material.MATERIAL_OPAQUE
    } else {
      material.roughness = 0.74
      material.transparencyMode = Material.MATERIAL_OPAQUE
    }
  }
}

const hideLegacyPresentation = (scene: Scene): void => {
  const oldRoot = scene.getTransformNodeByName(LEGACY_ROOT) ?? scene.getMeshByName(LEGACY_ROOT)
  oldRoot?.setEnabled(false)
  for (const mesh of scene.meshes) {
    if (
      ['hero-torso', 'hero-head', 'hero-leg-l', 'hero-leg-r', 'hero-arm-l', 'hero-arm-r'].includes(mesh.name) ||
      mesh.name.startsWith('realism-v2-hero-') ||
      mesh.name.startsWith('target-hero-') ||
      mesh.name.startsWith('hero-motion-')
    ) mesh.setEnabled(false)
  }
}

const findJoint = (root: TransformNode, sourceName: string): TransformNode => {
  const matches = root.getDescendants(false).filter((node): node is TransformNode =>
    node instanceof TransformNode && (node.name === sourceName || node.name.endsWith(`/${sourceName}`)),
  )
  if (matches.length !== 1) throw new Error(`High-fidelity hero requires exact joint ${sourceName}; found ${matches.length}`)
  return matches[0]!
}

const restPose = (node: TransformNode): JointPose => {
  const rest = node.rotationQuaternion?.clone() ?? Quaternion.FromEulerAngles(node.rotation.x, node.rotation.y, node.rotation.z)
  node.rotationQuaternion = rest.clone()
  node.rotation.set(0, 0, 0)
  return { node, rest }
}

const setLocalPitch = (pose: JointPose, pitch: number): void => {
  pose.node.rotationQuaternion = pose.rest.multiply(Quaternion.RotationAxis(Axis.X, pitch))
}

const setupGait = (
  scene: Scene,
  heroAuthority: TransformNode,
  modelRoot: TransformNode,
  onState: (moving: boolean) => void,
): (() => void) => {
  const thighL = restPose(findJoint(modelRoot, 'thigh_l'))
  const thighR = restPose(findJoint(modelRoot, 'thigh_r'))
  const calfL = restPose(findJoint(modelRoot, 'calf_l'))
  const calfR = restPose(findJoint(modelRoot, 'calf_r'))
  const armL = restPose(findJoint(modelRoot, 'upperarm_l'))
  const armR = restPose(findJoint(modelRoot, 'upperarm_r'))
  const spine = restPose(findJoint(modelRoot, 'spine_02'))
  const previous = heroAuthority.position.clone()
  let phase = 0
  let lastMoving = false
  const observer = scene.onBeforeRenderObservable.add(() => {
    const dt = Math.max(0.001, Math.min(scene.getEngine().getDeltaTime() / 1000, 0.08))
    const dx = heroAuthority.position.x - previous.x
    const dz = heroAuthority.position.z - previous.z
    previous.copyFrom(heroAuthority.position)
    const distance = Math.hypot(dx, dz)
    const speed = distance / dt
    const weight = Math.min(1, speed / 2.1)
    if (distance > 0.00005) phase += distance * 5.0
    const swing = Math.sin(phase) * 0.46 * weight
    setLocalPitch(thighL, swing)
    setLocalPitch(thighR, -swing)
    setLocalPitch(calfL, Math.max(0, -Math.sin(phase)) * 0.34 * weight)
    setLocalPitch(calfR, Math.max(0, Math.sin(phase)) * 0.34 * weight)
    setLocalPitch(armL, -swing * 0.62)
    setLocalPitch(armR, swing * 0.62)
    setLocalPitch(spine, Math.sin(phase * 2) * 0.018 * weight)
    const moving = weight > 0.04
    if (moving !== lastMoving) {
      lastMoving = moving
      onState(moving)
    }
  })
  return () => scene.onBeforeRenderObservable.remove(observer)
}

const instantiateHero = async (scene: Scene): Promise<{
  container: AssetContainer
  entries: InstantiatedEntries
  root: TransformNode
  meshes: AbstractMesh[]
  soleLocalY: number
}> => {
  const container = await SceneLoader.LoadAssetContainerAsync(ASSET_ROOT, HERO_FILE, scene)
  try {
    const entries = container.instantiateModelsToScene(source => `high-fi/${source}`, false, { doNotInstantiate: true })
    if (!entries.skeletons.length) throw new Error('High-fidelity hero GLB has no skeleton')
    const root = new TransformNode('high-fidelity-hero-root', scene)
    const normalization = new TransformNode('high-fidelity-hero-normalization', scene)
    normalization.parent = root
    entries.rootNodes.forEach(node => { node.parent = normalization })
    const meshes = root.getChildMeshes(false).filter(mesh => mesh.getTotalVertices() > 0)
    if (meshes.length < 6) throw new Error(`High-fidelity hero hierarchy incomplete: ${meshes.length} meshes`)

    const footL = findJoint(root, 'foot_l')
    const ballL = findJoint(root, 'ball_l')
    const footR = findJoint(root, 'foot_r')
    const ballR = findJoint(root, 'ball_r')
    ;[footL, ballL, footR, ballR].forEach(node => node.computeWorldMatrix(true))
    const forward = ballL.getAbsolutePosition().subtract(footL.getAbsolutePosition())
      .add(ballR.getAbsolutePosition().subtract(footR.getAbsolutePosition()))
    forward.y = 0
    if (forward.lengthSquared() < 0.000001) throw new Error('High-fidelity hero foot frame cannot determine forward')
    normalization.rotation.y = -Math.atan2(forward.x, forward.z)

    let bounds = meshBounds(meshes)
    const sourceHeight = bounds.max.y - bounds.min.y
    if (!Number.isFinite(sourceHeight) || sourceHeight < 0.1) throw new Error(`Invalid high-fidelity source height ${sourceHeight}`)
    normalization.scaling.setAll(HERO_HEIGHT_M / sourceHeight)
    bounds = meshBounds(meshes)
    normalization.position.x -= (bounds.min.x + bounds.max.x) * 0.5
    normalization.position.y -= bounds.min.y
    normalization.position.z -= (bounds.min.z + bounds.max.z) * 0.5
    bounds = meshBounds(meshes)

    normalizeMaterials(meshes)
    for (const mesh of meshes) {
      mesh.isPickable = false
      mesh.checkCollisions = false
      mesh.receiveShadows = true
      mesh.metadata = { ...(mesh.metadata ?? {}), dropiHighFidelityHuman: true, identity: 'hero-courier-v1' }
    }
    return { container, entries, root, meshes, soleLocalY: Math.max(0, bounds.min.y) }
  } catch (error) {
    container.dispose()
    throw error
  }
}

let started = false
const boot = async (): Promise<void> => {
  const scene = EngineStore.LastCreatedScene
  const hero = scene?.getTransformNodeByName('hero')
  const visualRoot = scene?.getTransformNodeByName('hero-visual-ground-root')
  if (!scene || !(hero instanceof TransformNode) || !(visualRoot instanceof TransformNode) || !scene.metadata?.dropiGroundContactV1) {
    window.requestAnimationFrame(() => void boot())
    return
  }
  if (started) return
  started = true
  const state: HighFidelityHeroState = {
    issue: 755,
    status: 'LOADING',
    loaded: false,
    file: HERO_FILE,
    heightM: HERO_HEIGHT_M,
    meshCount: 0,
    skeletonCount: 0,
    triangleCount: 0,
    animationMode: 'NONE',
    faceReadableTarget: true,
    soleLocalY: 0,
  }
  publish(state)

  let disposeGait: (() => void) | undefined
  let heroInstance: Awaited<ReturnType<typeof instantiateHero>> | undefined
  try {
    heroInstance = await instantiateHero(scene)
    if (scene.isDisposed) throw new Error('Scene disposed while loading high-fidelity hero')
    heroInstance.root.parent = visualRoot
    heroInstance.root.position.set(0, 0, 0)
    heroInstance.root.rotation.y = 0
    hideLegacyPresentation(scene)

    const sun = scene.getLightByName('sun')
    const shadowGenerator = sun?.getShadowGenerator()
    if (shadowGenerator instanceof ShadowGenerator) {
      for (const mesh of heroInstance.meshes) shadowGenerator.addShadowCaster(mesh, false)
    }

    state.status = 'ACTIVE'
    state.loaded = true
    state.meshCount = heroInstance.meshes.length
    state.skeletonCount = heroInstance.entries.skeletons.length
    state.triangleCount = triangleCount(heroInstance.meshes)
    state.soleLocalY = heroInstance.soleLocalY
    state.animationMode = 'PROCEDURAL_GAME_ENGINE_GAIT'
    publish(state)
    scene.metadata = { ...(scene.metadata ?? {}), dropiHighFidelityHeroV1: true }

    disposeGait = setupGait(scene, hero, heroInstance.root, () => publish(state))
    const suppression = scene.onBeforeRenderObservable.add(() => hideLegacyPresentation(scene))
    scene.onDisposeObservable.addOnce(() => {
      scene.onBeforeRenderObservable.remove(suppression)
      disposeGait?.()
      heroInstance?.entries.dispose()
      heroInstance?.container.dispose()
      heroInstance?.root.dispose()
    })
  } catch (error) {
    disposeGait?.()
    heroInstance?.entries.dispose()
    heroInstance?.container.dispose()
    heroInstance?.root.dispose()
    state.status = 'FALLBACK'
    state.loaded = false
    state.animationMode = 'NONE'
    state.error = error instanceof Error ? error.message : String(error)
    scene.metadata = { ...(scene.metadata ?? {}), dropiHighFidelityHeroV1: false }
    publish(state)
    console.error('High-fidelity hero failed; old evaluation hero remains available.', error)
  }
}

void boot()
