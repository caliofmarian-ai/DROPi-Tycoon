import {
  Color3,
  Color4,
  EngineStore,
  Mesh,
  MeshBuilder,
  Scene,
  StandardMaterial,
  TransformNode,
  Vector3,
} from '@babylonjs/core'

const ISSUE = 720

const material = (scene: Scene, name: string, hex: string, specular = 0.08): StandardMaterial => {
  const existing = scene.getMaterialByName(name)
  if (existing instanceof StandardMaterial) return existing
  const result = new StandardMaterial(name, scene)
  result.diffuseColor = Color3.FromHexString(hex)
  result.specularColor = new Color3(specular, specular, specular)
  return result
}

const addBox = (
  scene: Scene,
  name: string,
  size: { width: number; height: number; depth: number },
  position: Vector3,
  mat: StandardMaterial,
  parent?: TransformNode,
): Mesh => {
  const mesh = MeshBuilder.CreateBox(name, size, scene)
  mesh.position.copyFrom(position)
  mesh.material = mat
  mesh.receiveShadows = true
  if (parent) mesh.parent = parent
  return mesh
}

const addCylinder = (
  scene: Scene,
  name: string,
  height: number,
  diameter: number,
  position: Vector3,
  mat: StandardMaterial,
): Mesh => {
  const mesh = MeshBuilder.CreateCylinder(name, { height, diameter, tessellation: 10 }, scene)
  mesh.position.copyFrom(position)
  mesh.material = mat
  mesh.receiveShadows = true
  return mesh
}

const tuneExistingMaterials = (scene: Scene): void => {
  const asphalt = scene.getMaterialByName('asphalt')
  if (asphalt instanceof StandardMaterial) {
    asphalt.diffuseColor = Color3.FromHexString('#343a3d')
    asphalt.specularColor = new Color3(0.035, 0.035, 0.035)
  }

  const sidewalk = scene.getMaterialByName('sidewalk')
  if (sidewalk instanceof StandardMaterial) {
    sidewalk.diffuseColor = Color3.FromHexString('#aaa79f')
    sidewalk.specularColor = new Color3(0.055, 0.055, 0.055)
  }

  const glass = scene.getMaterialByName('window-glass')
  if (glass instanceof StandardMaterial) {
    glass.diffuseColor = Color3.FromHexString('#517789')
    glass.specularColor = new Color3(0.48, 0.55, 0.59)
    glass.alpha = 0.86
  }

  const grass = scene.getMaterialByName('grass')
  if (grass instanceof StandardMaterial) {
    grass.diffuseColor = Color3.FromHexString('#5d7555')
    grass.specularColor = Color3.Black()
  }

  const water = scene.getMaterialByName('danube')
  if (water instanceof StandardMaterial) {
    water.diffuseColor = Color3.FromHexString('#315f73')
    water.specularColor = new Color3(0.42, 0.48, 0.52)
    water.alpha = 0.92
  }

  const facadeTuning: Array<[string, string]> = [
    ['facade-sand', '#b79a7d'],
    ['facade-brick', '#875b4b'],
    ['facade-stone', '#969995'],
    ['facade-cream', '#c7b9a2'],
    ['facade-blue', '#708c98'],
  ]
  facadeTuning.forEach(([name, hex]) => {
    const facade = scene.getMaterialByName(name)
    if (!(facade instanceof StandardMaterial)) return
    facade.diffuseColor = Color3.FromHexString(hex)
    facade.specularColor = new Color3(0.045, 0.045, 0.045)
  })
}

const addStreetSurfaceDetail = (scene: Scene): void => {
  const curbMat = material(scene, 'realism-curb', '#ded9cd', 0.05)
  const pavingDark = material(scene, 'realism-paving-dark', '#858681', 0.04)
  const roadMark = material(scene, 'realism-road-mark', '#ddd8c5', 0.02)

  for (const z of [-6.02, 6.02]) {
    addBox(scene, `realism-curb-main-${z}`, { width: 150, height: 0.19, depth: 0.22 }, new Vector3(0, 0.14, z), curbMat)
  }
  for (const x of [2.02, 13.98]) {
    addBox(scene, `realism-curb-cross-${x}`, { width: 0.22, height: 0.19, depth: 84 }, new Vector3(x, 0.145, 2), curbMat)
  }

  // Sparse paving seams create scale without expensive textures.
  for (let x = -60; x <= 60; x += 12) {
    addBox(scene, `realism-paver-n-${x}`, { width: 0.035, height: 0.012, depth: 3.45 }, new Vector3(x, 0.169, 8), pavingDark)
    addBox(scene, `realism-paver-s-${x}`, { width: 0.035, height: 0.012, depth: 3.45 }, new Vector3(x, 0.169, -8), pavingDark)
  }

  // One readable pedestrian crossing at the central junction.
  for (let i = 0; i < 7; i += 1) {
    addBox(
      scene,
      `realism-crosswalk-${i}`,
      { width: 0.55, height: 0.025, depth: 4.4 },
      new Vector3(4.3 + i * 1.05, 0.086, 0),
      roadMark,
    )
  }
}

const addHQDetail = (scene: Scene): void => {
  const metal = material(scene, 'realism-metal', '#3d474d', 0.32)
  const glass = material(scene, 'realism-entry-glass', '#5e8998', 0.42)
  glass.alpha = 0.82
  const concrete = material(scene, 'realism-concrete', '#9e9c95', 0.04)
  const accent = material(scene, 'realism-dropi-accent', '#0299c9', 0.16)

  addBox(scene, 'realism-hq-step-1', { width: 4.2, height: 0.18, depth: 1.1 }, new Vector3(29, 0.09, 8.55), concrete)
  addBox(scene, 'realism-hq-step-2', { width: 3.5, height: 0.18, depth: 0.8 }, new Vector3(29, 0.27, 8.92), concrete)
  addBox(scene, 'realism-hq-canopy', { width: 6.4, height: 0.24, depth: 2.2 }, new Vector3(29, 3.3, 8.05), metal)
  addBox(scene, 'realism-hq-glass-entry', { width: 3.3, height: 2.7, depth: 0.14 }, new Vector3(29, 1.48, 8.93), glass)
  addBox(scene, 'realism-hq-accent', { width: 5.8, height: 0.16, depth: 0.18 }, new Vector3(29, 4.05, 8.87), accent)
}

const addMarketDetail = (scene: Scene): void => {
  const awning = material(scene, 'realism-market-awning', '#bd7925', 0.08)
  const trim = material(scene, 'realism-market-trim', '#ece1ca', 0.05)
  const glass = material(scene, 'realism-market-glass', '#597b84', 0.35)
  glass.alpha = 0.83

  addBox(scene, 'realism-market-awning', { width: 8.2, height: 0.2, depth: 1.45 }, new Vector3(-27, 3.05, -18.72), awning)
  addBox(scene, 'realism-market-window-l', { width: 2.7, height: 2.1, depth: 0.12 }, new Vector3(-30.1, 1.25, -18.06), glass)
  addBox(scene, 'realism-market-window-r', { width: 2.7, height: 2.1, depth: 0.12 }, new Vector3(-23.9, 1.25, -18.06), glass)
  addBox(scene, 'realism-market-trim-l', { width: 0.14, height: 2.55, depth: 0.18 }, new Vector3(-31.55, 1.4, -18.02), trim)
  addBox(scene, 'realism-market-trim-r', { width: 0.14, height: 2.55, depth: 0.18 }, new Vector3(-22.45, 1.4, -18.02), trim)
}

const addResidenceDetail = (scene: Scene): void => {
  const slab = material(scene, 'realism-balcony-slab', '#b9b8b0', 0.05)
  const rail = material(scene, 'realism-balcony-rail', '#4b5358', 0.22)

  for (const y of [4.2, 7.4, 10.6]) {
    addBox(scene, `realism-balcony-${y}`, { width: 6.8, height: 0.18, depth: 1.25 }, new Vector3(34, y, -29.55), slab)
    for (const x of [31.1, 32.55, 34, 35.45, 36.9]) {
      addBox(scene, `realism-balcony-rail-${y}-${x}`, { width: 0.06, height: 0.8, depth: 0.06 }, new Vector3(x, y + 0.48, -30.08), rail)
    }
    addBox(scene, `realism-balcony-top-${y}`, { width: 6.0, height: 0.07, depth: 0.08 }, new Vector3(34, y + 0.88, -30.08), rail)
  }
}

const addStreetFurniture = (scene: Scene): void => {
  const pole = material(scene, 'realism-lamp-pole', '#444b50', 0.28)
  const lamp = material(scene, 'realism-lamp-head', '#d8d2bb', 0.18)
  lamp.emissiveColor = Color3.FromHexString('#403a2c')
  const bench = material(scene, 'realism-bench', '#765b43', 0.05)
  const bin = material(scene, 'realism-bin', '#3c4b46', 0.08)

  const lampPositions: Array<[number, number]> = [
    [-48, 10.4], [-20, 10.4], [23, 10.4], [48, 10.4], [-42, -10.4], [26, -10.4],
  ]
  lampPositions.forEach(([x, z], index) => {
    addCylinder(scene, `realism-lamp-post-${index}`, 4.6, 0.16, new Vector3(x, 2.3, z), pole)
    addBox(scene, `realism-lamp-head-${index}`, { width: 0.65, height: 0.2, depth: 0.35 }, new Vector3(x, 4.62, z), lamp)
  })

  addBox(scene, 'realism-bench-seat-1', { width: 2.1, height: 0.14, depth: 0.55 }, new Vector3(-10, 0.55, 10.5), bench)
  addBox(scene, 'realism-bench-back-1', { width: 2.1, height: 0.75, depth: 0.12 }, new Vector3(-10, 0.95, 10.75), bench)
  addBox(scene, 'realism-bin-1', { width: 0.5, height: 0.9, depth: 0.5 }, new Vector3(-7.8, 0.45, 10.6), bin)
  addBox(scene, 'realism-bin-2', { width: 0.5, height: 0.9, depth: 0.5 }, new Vector3(31.8, 0.45, 9.8), bin)
}

const addVehicleDetail = (scene: Scene): void => {
  const tyre = material(scene, 'realism-tyre', '#171a1c', 0.08)
  const headlight = material(scene, 'realism-headlight', '#e7e1c7', 0.28)
  headlight.emissiveColor = new Color3(0.2, 0.18, 0.12)

  ;['car-1', 'car-2', 'car-3'].forEach(name => {
    const root = scene.getTransformNodeByName(name)
    if (!root) return
    const wheelPositions: Array<[number, number]> = [
      [-0.9, -1.25], [0.9, -1.25], [-0.9, 1.25], [0.9, 1.25],
    ]
    wheelPositions.forEach(([x, z], index) => {
      const wheel = MeshBuilder.CreateCylinder(`${name}-wheel-${index}`, { height: 0.22, diameter: 0.64, tessellation: 12 }, scene)
      wheel.parent = root
      wheel.position.set(x, 0.24, z)
      wheel.rotation.z = Math.PI / 2
      wheel.material = tyre
    })
    for (const x of [-0.55, 0.55]) {
      const light = addBox(scene, `${name}-headlight-${x}`, { width: 0.36, height: 0.22, depth: 0.08 }, new Vector3(x, 0.62, 2.03), headlight, root)
      light.receiveShadows = false
    }
  })
}

const addBadge = (): void => {
  if (document.querySelector('#dropi-realism-v1')) return
  const badge = document.createElement('div')
  badge.id = 'dropi-realism-v1'
  badge.textContent = `GROUNDED REALISM V1 · #${ISSUE}`
  Object.assign(badge.style, {
    position: 'fixed',
    right: '12px',
    top: '12px',
    zIndex: '10',
    padding: '5px 8px',
    borderRadius: '8px',
    background: 'rgba(7, 20, 28, .62)',
    border: '1px solid rgba(255,255,255,.12)',
    color: 'rgba(235,245,248,.78)',
    font: '700 8px/1 system-ui',
    letterSpacing: '.06em',
    pointerEvents: 'none',
  } satisfies Partial<CSSStyleDeclaration>)
  document.body.append(badge)
}

const boot = (): void => {
  const scene = EngineStore.LastCreatedScene
  if (!scene || !scene.getTransformNodeByName('hero') || !scene.getMeshByName('dropi-hq')) {
    window.requestAnimationFrame(boot)
    return
  }
  if (scene.metadata?.dropiRealismV1) return
  scene.metadata = { ...(scene.metadata ?? {}), dropiRealismV1: true }

  scene.clearColor = new Color4(0.56, 0.71, 0.79, 1)
  scene.fogColor = new Color3(0.56, 0.71, 0.79)
  scene.fogDensity = 0.0028

  tuneExistingMaterials(scene)
  addStreetSurfaceDetail(scene)
  addHQDetail(scene)
  addMarketDetail(scene)
  addResidenceDetail(scene)
  addStreetFurniture(scene)
  addVehicleDetail(scene)
  addBadge()
}

boot()
