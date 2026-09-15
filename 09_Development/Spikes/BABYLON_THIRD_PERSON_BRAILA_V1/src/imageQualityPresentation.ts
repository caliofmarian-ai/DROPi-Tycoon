import { Color3, ImageProcessingConfiguration, Material, Mesh, PBRMaterial, Scene, ShadowGenerator, Texture, VertexData } from '@babylonjs/core'
import { RawTexture } from '@babylonjs/core/Materials/Textures/rawTexture'
import { bevelledEnvelope, materialPixels, roofEnvelope } from './imageQualityGeometry'
import type { QualityGeometry, RoofShape, SurfaceFamily } from './imageQualityGeometry'

export type QualityBuilding = { source: Mesh; roof: Mesh; color: string; roofColor: string; roofShape: RoofShape; roofRise: number; family: 'stone' | 'plaster' }
export type ImageQualityBinding = { id: string; buildings: readonly QualityBuilding[]; exposure: number; contrast: number }
export type ImageQualityHandle = { id: string; replacedBuildings: number; triangles: number; textures: number; dispose(): void }
const active = new WeakMap<Scene, ImageQualityHandle>()
/** Reversible presentation only. Imported complete models, colliders and windows are not rewritten. */
export const installImageQuality = (scene: Scene, binding: ImageQualityBinding): ImageQualityHandle => {
  if (scene.isDisposed) throw new Error('Disposed quality scene')
  const previous = active.get(scene)
  if (previous) { if (previous.id !== binding.id) throw new Error('Quality binding already installed'); return previous }
  if (!binding.id || !binding.buildings.length || binding.buildings.length > 16 || !Number.isFinite(binding.exposure) || binding.exposure < .5 || binding.exposure > 1.5 || !Number.isFinite(binding.contrast) || binding.contrast < .8 || binding.contrast > 1.2) throw new Error('Invalid bounded quality binding')
  const seen = new Set<Mesh>()
  const plans = binding.buildings.map(spec => {
    if (!/^#[0-9a-f]{6}$/i.test(spec.color) || !/^#[0-9a-f]{6}$/i.test(spec.roofColor) || !['stone','plaster'].includes(spec.family)) throw new Error('Explicit valid material palette required')
    for (const source of [spec.source, spec.roof]) {
      if (!(source instanceof Mesh) || source.getScene() !== scene || source.isDisposed() || !source.isVisible || !source.isEnabled() || source.parent || source.skeleton || source.rotationQuaternion || source.rotation.lengthSquared() !== 0 || seen.has(source)) throw new Error('Unsafe quality presentation source')
      seen.add(source); source.computeWorldMatrix(true)
    }
    const b = spec.source.getBoundingInfo().boundingBox, r = spec.roof.getBoundingInfo().boundingBox
    const width = b.maximumWorld.x - b.minimumWorld.x, depth = b.maximumWorld.z - b.minimumWorld.z, height = b.maximumWorld.y - b.minimumWorld.y
    return { spec, center: b.centerWorld.clone(), bottom: b.minimumWorld.y, roofBottom: r.minimumWorld.y,
      envelope: bevelledEnvelope(width, depth, height, Math.min(.16, width / 30, depth / 30)),
      roofGeometry: roofEnvelope(r.maximumWorld.x - r.minimumWorld.x, r.maximumWorld.z - r.minimumWorld.z, spec.roofRise, spec.roofShape),
    }
  })
  const meshes: Mesh[] = [], textures: RawTexture[] = [], materials = new Map<string, PBRMaterial>(), sets = new Map<SurfaceFamily, { color: RawTexture; normal: RawTexture; orm: RawTexture }>()
  const hidden = new Map<Mesh, boolean>()
  const config = scene.imageProcessingConfiguration
  const old = { toneMappingEnabled: config.toneMappingEnabled, toneMappingType: config.toneMappingType, exposure: config.exposure, contrast: config.contrast }
  const anisotropy = Math.min(8, scene.getEngine().getCaps().maxAnisotropy || 1)
  const shadowGenerators = scene.lights.map(light => light.getShadowGenerator()).filter((g): g is ShadowGenerator => g instanceof ShadowGenerator)
  let committed = false, disposed = false
  const cleanup = (): void => {
    for (const [source, visible] of hidden) if (!source.isDisposed()) source.isVisible = visible
    meshes.forEach(mesh => { shadowGenerators.forEach(g => g.removeShadowCaster(mesh)); if (!mesh.isDisposed()) mesh.dispose(false, false) })
    materials.forEach(material => material.dispose(false, false)); textures.forEach(texture => texture.dispose())
    if (committed) Object.assign(config, old)
    hidden.clear(); meshes.length = 0; materials.clear(); textures.length = 0; sets.clear()
  }
  const textureSet = (family: SurfaceFamily) => {
    const cached = sets.get(family); if (cached) return cached
    const pixels = materialPixels(512, family, 720)
    const make = (data: Uint8Array, name: string, gamma: boolean): RawTexture => {
      const texture = RawTexture.CreateRGBATexture(data, 512, 512, scene, true, false, Texture.TRILINEAR_SAMPLINGMODE)
      textures.push(texture); texture.name = `image-quality/${family}/${name}`; texture.gammaSpace = gamma
      texture.wrapU = Texture.WRAP_ADDRESSMODE; texture.wrapV = Texture.WRAP_ADDRESSMODE
      texture.anisotropicFilteringLevel = anisotropy; return texture
    }
    const set = { color: make(pixels.color, 'albedo', true), normal: make(pixels.normal, 'normal', false), orm: make(pixels.orm, 'roughness', false) }
    sets.set(family, set); return set
  }
  const material = (family: SurfaceFamily, color: string): PBRMaterial => {
    const key = `${family}/${color}`, cached = materials.get(key); if (cached) return cached
    const maps = textureSet(family), m = new PBRMaterial(`image-quality/${key}`, scene)
    materials.set(key, m)
    m.albedoColor = Color3.FromHexString(color).toLinearSpace(); m.albedoTexture = maps.color
    m.metallic = 0; m.roughness = 1; m.bumpTexture = maps.normal; m.metallicTexture = maps.orm
    m.useRoughnessFromMetallicTextureAlpha = false; m.useRoughnessFromMetallicTextureGreen = true; m.useMetallnessFromMetallicTextureBlue = true
    m.enableSpecularAntiAliasing = true; m.forceIrradianceInFragment = true
    m.environmentIntensity = .8; m.backFaceCulling = true; m.transparencyMode = Material.MATERIAL_OPAQUE
    return m
  }
  const meshFrom = (name: string, geometry: QualityGeometry, m: PBRMaterial, x: number, y: number, z: number): Mesh => {
    const mesh = new Mesh(`image-quality/${name}`, scene); meshes.push(mesh)
    const normals: number[] = []; VertexData.ComputeNormals(geometry.positions, geometry.indices, normals)
    const data = new VertexData(); data.positions = geometry.positions; data.indices = geometry.indices; data.normals = normals; data.uvs = geometry.uvs; data.applyToMesh(mesh)
    mesh.position.set(x,y,z); mesh.material = m; mesh.isPickable = false; mesh.checkCollisions = false; mesh.receiveShadows = true
    mesh.metadata = { dropiImageQuality: true, gameplayAuthority: false, provenance: 'AUTHORED_CODE_ONLY_CANDIDATE', recipe: binding.id }
    mesh.computeWorldMatrix(true); mesh.freezeWorldMatrix(); shadowGenerators.forEach(g => g.addShadowCaster(mesh)); return mesh
  }
  try {
    let triangles = 0
    for (const plan of plans) {
      meshFrom(`${plan.spec.source.name}/envelope`, plan.envelope, material(plan.spec.family, plan.spec.color), plan.center.x, plan.bottom, plan.center.z)
      meshFrom(`${plan.spec.source.name}/roof`, plan.roofGeometry, material('roof', plan.spec.roofColor), plan.center.x, plan.roofBottom, plan.center.z)
      triangles += (plan.envelope.indices.length + plan.roofGeometry.indices.length) / 3
    }
    for (const source of seen) { hidden.set(source, source.isVisible); source.isVisible = false }
    committed = true
    config.toneMappingEnabled = true; config.toneMappingType = ImageProcessingConfiguration.TONEMAPPING_ACES
    config.exposure = binding.exposure; config.contrast = binding.contrast
    // Do not freeze before the first ready render: shader variants must include final scene lights.
    const handle: ImageQualityHandle = { id: binding.id, replacedBuildings: plans.length, triangles, textures: textures.length, dispose: () => {
      if (disposed) return; disposed = true; cleanup(); active.delete(scene); scene.onDisposeObservable.remove(observer)
    } }
    const observer = scene.onDisposeObservable.addOnce(() => handle.dispose())
    active.set(scene, handle); return handle
  } catch (error) { cleanup(); throw error }
}
