import { Color3, Mesh, MeshBuilder, PBRMaterial, Scene, StandardMaterial, Texture, Vector3 } from '@babylonjs/core'
import { RawTexture } from '@babylonjs/core/Materials/Textures/rawTexture'
import { compileFacade, validateVisualKit } from './cityVisualRecipe'
import type { FacadeInput, VisualKit } from './cityVisualRecipe'
import { filmicSurfacePixels } from './filmicSurface'

export type CityVisualBindings = {
  id: string
  facades: ReadonlyArray<{ kit: VisualKit; anchor: FacadeInput; replaceWindows: readonly Mesh[] }>
  surfaces: ReadonlyArray<{ kit: VisualKit; mesh: Mesh; family: 'paving' | 'asphalt' }>
}
export type CityVisualHandle = {
  id: string; detailBoxes: number; drawMeshes: number; textureCount: number; materialCount: number
  dispose(): void
}
const installations = new WeakMap<Scene, CityVisualHandle>()
/** Scene-owned, bounded presentation transaction. Never disposes colliders or creates gameplay state. */
export const installCityVisuals = (scene: Scene, bindings: CityVisualBindings): CityVisualHandle => {
  if (scene.isDisposed) throw new Error('Cannot decorate a disposed scene')
  const previous = installations.get(scene)
  if (previous) {
    if (previous.id !== bindings.id) throw new Error('Dispose previous visual recipe before changing it')
    return previous
  }
  if (!bindings.id || bindings.facades.length > 8 || bindings.surfaces.length > 16 || bindings.facades.length + bindings.surfaces.length === 0) throw new Error('Visual sector exceeds bounded kit budget')
  const sourceMeshes = new Set<Mesh>(), ids = new Set<string>()
  const validateSource = (mesh: Mesh, allowCollider = false): void => {
    if (!(mesh instanceof Mesh) || mesh.getScene() !== scene || mesh.isDisposed() || !mesh.isEnabled() || !mesh.isVisible || mesh.parent || mesh.skeleton || (!allowCollider && mesh.checkCollisions)) throw new Error(`Unsafe presentation replacement: ${mesh?.name}`)
    if (sourceMeshes.has(mesh)) throw new Error('Duplicate presentation source')
    sourceMeshes.add(mesh)
  }
  const plans = bindings.facades.map(binding => {
    if (ids.has(binding.anchor.id)) throw new Error('Duplicate facade binding')
    ids.add(binding.anchor.id)
    if (binding.replaceWindows.length > 96) throw new Error('Unbounded replacement window list')
    binding.replaceWindows.forEach(mesh => validateSource(mesh))
    return { binding, boxes: compileFacade(binding.kit, binding.anchor) }
  })
  for (const binding of bindings.surfaces) {
    validateVisualKit(binding.kit); validateSource(binding.mesh, true)
    if (!['paving', 'asphalt'].includes(binding.family)) throw new Error('Unknown surface finish')
    if (!binding.mesh.getVerticesData('position') || !binding.mesh.getVerticesData('normal')) throw new Error('Surface projection requires positions and normals')
  }
  const ownedMeshes: Mesh[] = [], materials = new Map<string, StandardMaterial>(), surfaceMaterials = new Map<string, PBRMaterial>(), textures = new Map<string, RawTexture>()
  const hidden = new Map<Mesh, boolean>()
  const material = (key: string, color: string, gloss = false): StandardMaterial => {
    const cacheKey = `${key}/${color}`
    let result = materials.get(cacheKey)
    if (!result) {
      result = new StandardMaterial(`city-visual/${cacheKey}`, scene)
      result.diffuseColor = Color3.FromHexString(color)
      result.specularColor = gloss ? new Color3(.32, .36, .4) : new Color3(.035, .035, .035)
      result.specularPower = gloss ? 48 : 16
      result.alpha = 1
      materials.set(cacheKey, result)
    }
    return result
  }
  const finishMesh = (mesh: Mesh): void => {
    mesh.isPickable = false; mesh.checkCollisions = false; mesh.receiveShadows = true
    mesh.metadata = { dropiCityVisualDetail: true, recipe: bindings.id, gameplayAuthority: false }
    mesh.computeWorldMatrix(true); mesh.freezeWorldMatrix()
  }
  const cleanup = (): void => {
    for (const [mesh, visible] of hidden) if (!mesh.isDisposed()) mesh.isVisible = visible
    for (const mesh of ownedMeshes) if (!mesh.isDisposed()) mesh.dispose(false, false)
    for (const m of materials.values()) m.dispose(false, false)
    for (const m of surfaceMaterials.values()) m.dispose(false, false)
    for (const t of textures.values()) t.dispose()
    hidden.clear(); ownedMeshes.length = 0; materials.clear(); surfaceMaterials.clear(); textures.clear()
  }
  try {
    for (const { binding, boxes } of plans) {
      const groups = new Map<StandardMaterial, Mesh[]>()
      for (const spec of boxes) {
        const mesh = MeshBuilder.CreateBox(`city-visual/${spec.id}`, { width: spec.size[0], height: spec.size[1], depth: spec.size[2] }, scene)
        ownedMeshes.push(mesh)
        mesh.position.copyFromFloats(...spec.center); mesh.rotation.y = spec.yaw
        const detailMaterial = material(spec.finish, binding.kit.palette[spec.finish], spec.finish === 'glass')
        mesh.material = detailMaterial
        mesh.computeWorldMatrix(true)
        const group = groups.get(detailMaterial) ?? []; group.push(mesh); groups.set(detailMaterial, group)
      }
      // One small group per facade/material; never merge a city or different gameplay entities.
      for (const [m, group] of groups) {
        const merged = group.length === 1 ? group[0]! : Mesh.MergeMeshes(group, true, true)
        if (!merged) throw new Error('Facade detail merge failed')
        if (group.length !== 1) ownedMeshes.push(merged)
        merged.name = `city-visual/${binding.anchor.id}/${m.name}`; merged.material = m
        finishMesh(merged)
      }
    }
    for (const binding of bindings.surfaces) {
      const { kit, family, mesh: source } = binding
      // Clone presentation, not authority: source geometry, support height and collision identity survive.
      const mesh = source.clone(`city-visual/surface/${source.name}`, null, true)
      if (!mesh) throw new Error('Surface presentation clone failed')
      ownedMeshes.push(mesh); mesh.makeGeometryUnique()
      mesh.computeWorldMatrix(true)
      const positions = mesh.getVerticesData('position')!, normals = mesh.getVerticesData('normal')!
      const uvs = new Float32Array(positions.length / 3 * 2), world = mesh.getWorldMatrix()
      const p = new Vector3(), n = new Vector3()
      const tile = family === 'paving' ? kit.pavingTileMeters : 2
      for (let i = 0; i < positions.length; i += 3) {
        Vector3.TransformCoordinatesFromFloatsToRef(positions[i]!, positions[i + 1]!, positions[i + 2]!, world, p)
        Vector3.TransformNormalFromFloatsToRef(normals[i]!, normals[i + 1]!, normals[i + 2]!, world, n)
        const top = Math.abs(n.y) >= Math.max(Math.abs(n.x), Math.abs(n.z))
        uvs[i / 3 * 2] = (top || Math.abs(n.z) >= Math.abs(n.x) ? p.x : p.z) / tile
        uvs[i / 3 * 2 + 1] = (top ? p.z : p.y) / tile
      }
      mesh.setVerticesData('uv', uvs, false)
      const color = family === 'paving' ? kit.pavingColor : kit.asphaltColor
      const key = `${family}/${kit.seed}/${color}`
      const pixels = filmicSurfacePixels(kit, family)
      const texture = (kind: 'albedo' | 'normal' | 'orm', data: Uint8Array, gamma: boolean): RawTexture => {
        const cacheKey = `${key}/${kind}`
        let result = textures.get(cacheKey)
        if (!result) {
          result = RawTexture.CreateRGBATexture(data, 256, 256, scene, true, false, Texture.TRILINEAR_SAMPLINGMODE)
          result.name = `city-visual/${cacheKey}`; result.gammaSpace = gamma
          result.wrapU = Texture.WRAP_ADDRESSMODE; result.wrapV = Texture.WRAP_ADDRESSMODE
          result.anisotropicFilteringLevel = Math.min(8, scene.getEngine().getCaps().maxAnisotropy || 1)
          textures.set(cacheKey, result)
        }
        return result
      }
      let surfaceMaterial = surfaceMaterials.get(key)
      if (!surfaceMaterial) {
        surfaceMaterial = new PBRMaterial(`city-visual/pbr/${key}`, scene)
        surfaceMaterial.albedoColor = Color3.White()
        surfaceMaterial.albedoTexture = texture('albedo', pixels.color, true)
        surfaceMaterial.bumpTexture = texture('normal', pixels.normal, false)
        surfaceMaterial.metallicTexture = texture('orm', pixels.orm, false)
        surfaceMaterial.metallic = 0; surfaceMaterial.roughness = 1
        surfaceMaterial.useRoughnessFromMetallicTextureAlpha = false
        surfaceMaterial.useRoughnessFromMetallicTextureGreen = true
        surfaceMaterial.useMetallnessFromMetallicTextureBlue = true
        surfaceMaterial.enableSpecularAntiAliasing = true
        surfaceMaterial.forceIrradianceInFragment = true
        surfaceMaterial.environmentIntensity = .72
        surfaceMaterials.set(key, surfaceMaterial)
      }
      mesh.material = surfaceMaterial
      finishMesh(mesh)
    }
    // Commit only after every binding, texture and replacement was constructed successfully.
    for (const source of sourceMeshes) { hidden.set(source, source.isVisible); source.isVisible = false }
    for (const m of materials.values()) m.freeze()
    let disposed = false
    const handle: CityVisualHandle = {
      id: bindings.id, detailBoxes: plans.reduce((n, p) => n + p.boxes.length, 0),
      drawMeshes: ownedMeshes.filter(mesh => !mesh.isDisposed()).length,
      textureCount: textures.size, materialCount: materials.size + surfaceMaterials.size,
      dispose: () => {
        if (disposed) return
        disposed = true; cleanup(); installations.delete(scene)
        scene.onDisposeObservable.remove(observer)
      },
    }
    const observer = scene.onDisposeObservable.addOnce(() => handle.dispose())
    installations.set(scene, handle)
    return handle
  } catch (error) { cleanup(); throw error }
}
