import { AbstractMesh, AssetContainer, Scene, TransformNode, Vector3 } from '@babylonjs/core'

export type CompleteModel = {
  root: TransformNode
  meshes: AbstractMesh[]
  sourceMeshCount: number
  dispose(): void
}

/** A static presentation only. Never replaces or disables simulation roots. */
export const instantiateCompleteModel = (container: AssetContainer, scene: Scene, name: string): CompleteModel => {
  const expected = container.meshes.filter(mesh => mesh.getTotalVertices() > 0).length
  if (!expected) throw new Error(`${name}: asset has no renderable meshes`)
  if (container.skeletons.length) throw new Error(`${name}: use the skeletal presentation adapter for animated assets`)
  const root = new TransformNode(name, scene)
  const entries = container.instantiateModelsToScene(sourceName => `${name}/${sourceName}`, false, { doNotInstantiate: false })
  try {
    // Retain the glTF conversion root, node transforms, all material primitives
    // and child pivots. Selecting just meshes.find(...) loses wheels/glazing.
    for (const node of entries.rootNodes) node.parent = root
    const meshes = root.getChildMeshes(false).filter(mesh => mesh.getTotalVertices() > 0)
    if (meshes.length !== expected) throw new Error(`${name}: incomplete hierarchy ${meshes.length}/${expected}`)
    for (const mesh of meshes) {
      mesh.checkCollisions = false
      mesh.isPickable = false
      mesh.metadata = { ...(mesh.metadata ?? {}), dropiCompleteAssetPresentation: true }
    }
    return { root, meshes, sourceMeshCount: expected, dispose: () => { entries.dispose(); root.dispose() } }
  } catch (error) {
    entries.dispose()
    root.dispose()
    throw error
  }
}

export const modelBounds = (model: CompleteModel): { min: Vector3; max: Vector3; size: Vector3 } => {
  model.root.computeWorldMatrix(true)
  const min = new Vector3(Infinity, Infinity, Infinity)
  const max = new Vector3(-Infinity, -Infinity, -Infinity)
  for (const mesh of model.meshes) {
    mesh.computeWorldMatrix(true)
    const box = mesh.getBoundingInfo().boundingBox
    min.minimizeInPlace(box.minimumWorld)
    max.maximizeInPlace(box.maximumWorld)
  }
  const size = max.subtract(min)
  if (![min.x, min.y, min.z, max.x, max.y, max.z].every(Number.isFinite)) throw new Error('Non-finite complete model bounds')
  return { min, max, size }
}

/** Fit before parenting; the given centre/base are in the future parent's frame. */
export const fitCompleteModel = (
  model: CompleteModel, centreBase: Vector3, target: { height?: number; length?: number }, yaw = 0,
  alignLongAxisToZ = false,
): void => {
  if (model.root.parent) throw new Error('Fit the presentation before attaching to a simulation root')
  const initial = modelBounds(model)
  const size = target.height ?? target.length
  const sourceSize = target.height !== undefined ? initial.size.y : Math.max(initial.size.x, initial.size.z)
  if (size === undefined || !Number.isFinite(size) || size <= 0 || sourceSize <= 0.000001) throw new Error('Invalid model fit dimensions')
  model.root.scaling.setAll(size / sourceSize)
  model.root.rotation.y = yaw + (alignLongAxisToZ && initial.size.x > initial.size.z ? Math.PI / 2 : 0)
  const fitted = modelBounds(model)
  model.root.position.set(
    centreBase.x - (fitted.min.x + fitted.max.x) / 2,
    centreBase.y - fitted.min.y,
    centreBase.z - (fitted.min.z + fitted.max.z) / 2,
  )
  modelBounds(model)
}

export const canMergeReplacementSources = (metadata: Record<string, unknown> | null | undefined): boolean =>
  metadata?.dropiAuthoredEnvironmentV1 === true && metadata.dropiAuthoredBlocksV1 === true &&
  metadata.dropiAuthoredStreetLifeV1 === true && metadata.dropiAuthoredStreetLayerV1 === true

/** Presentation tuning in metres, not economy/inventory size or ownership. */
export const PARCEL_PRESENTATION_SIZE_M = Object.freeze({ width: 0.36, height: 0.24, depth: 0.24 })
export const resizeParcelPresentation = (parcel: AbstractMesh): void => {
  const box = parcel.getBoundingInfo().boundingBox
  const local = box.maximum.subtract(box.minimum)
  if (Math.min(local.x, local.y, local.z) <= 0) throw new Error('Invalid parcel geometry')
  parcel.scaling.set(PARCEL_PRESENTATION_SIZE_M.width / local.x, PARCEL_PRESENTATION_SIZE_M.height / local.y, PARCEL_PRESENTATION_SIZE_M.depth / local.z)
}

/** Axis-aware static fit; preserves the complete imported hierarchy. */
export const fitCompleteModelBox = (
  model: CompleteModel, centreBase: Vector3,
  target: { width: number; depth: number; height?: number }, yaw = 0,
): void => {
  if (model.root.parent) throw new Error('Fit before parenting')
  model.root.rotation.y = yaw
  const original = modelBounds(model)
  if (Math.min(original.size.x, original.size.z, target.width, target.depth) <= 0 || (target.height !== undefined && (target.height <= 0 || original.size.y <= 0))) throw new Error('Invalid box fit')
  const quarterTurn = Math.abs(Math.sin(yaw)) > 0.7
  const sx = target.width / original.size.x
  const sz = target.depth / original.size.z
  model.root.scaling.set(quarterTurn ? sz : sx, target.height === undefined ? Math.min(sx, sz) : target.height / original.size.y, quarterTurn ? sx : sz)
  const fitted = modelBounds(model)
  model.root.position.set(centreBase.x - (fitted.min.x + fitted.max.x) / 2, centreBase.y - fitted.min.y, centreBase.z - (fitted.min.z + fitted.max.z) / 2)
  modelBounds(model)
}

export const PRESENTATION_STAGES = ['dropiAuthoredEnvironmentV1', 'dropiAuthoredBlocksV1', 'dropiAuthoredStreetLifeV1', 'dropiAuthoredStreetLayerV1'] as const
export const allPresentationStagesSettled = (metadata: Record<string, unknown> | null | undefined): boolean =>
  PRESENTATION_STAGES.every(key => metadata?.[`${key}Settled`] === true)

/** Failure is terminal and explicit, never an endless LOADING badge. */
export const waitForPresentationStage = async (scene: Scene, key: string, timeoutMs = 45_000): Promise<void> => {
  const started = Date.now()
  while (!scene.isDisposed) {
    if (scene.metadata?.[key] === true) return
    if (scene.metadata?.[`${key}Settled`] === true) throw new Error(`Required presentation stage unavailable: ${key}`)
    if (Date.now() - started >= timeoutMs) throw new Error(`Presentation stage timed out: ${key}`)
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  throw new Error('Scene disposed during presentation loading')
}
