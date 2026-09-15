import { Color3, EngineStore, Mesh, MeshBuilder, StandardMaterial, TransformNode, Vector3 } from '@babylonjs/core'

const ISSUE = 720

const getStandardMaterial = (name: string): StandardMaterial | null => {
  const scene = EngineStore.LastCreatedScene
  const material = scene?.getMaterialByName(name)
  return material instanceof StandardMaterial ? material : null
}

const makeMaterial = (name: string, hex: string, specular = 0.06): StandardMaterial | null => {
  const scene = EngineStore.LastCreatedScene
  if (!scene) return null
  const existing = scene.getMaterialByName(name)
  if (existing instanceof StandardMaterial) return existing
  const material = new StandardMaterial(name, scene)
  material.diffuseColor = Color3.FromHexString(hex)
  material.specularColor = new Color3(specular, specular, specular)
  return material
}

const replaceHeroSilhouette = (): void => {
  const scene = EngineStore.LastCreatedScene
  const hero = scene?.getTransformNodeByName('hero')
  if (!scene || !(hero instanceof TransformNode)) return

  ;['hero-torso', 'hero-head', 'hero-leg-l', 'hero-leg-r', 'hero-arm-l', 'hero-arm-r'].forEach(name => {
    scene.getMeshByName(name)?.setEnabled(false)
  })

  const jacket = getStandardMaterial('hero-jacket')
  const trousers = getStandardMaterial('hero-trousers')
  const skin = getStandardMaterial('hero-skin')
  if (!jacket || !trousers || !skin) return

  const hair = makeMaterial('realism-v2-hair', '#2f2925', 0.03)
  const shoe = makeMaterial('realism-v2-shoe', '#171c21', 0.08)
  const backpack = makeMaterial('realism-v2-backpack', '#253746', 0.08)
  if (!hair || !shoe || !backpack) return

  const torso = MeshBuilder.CreateCylinder('realism-v2-hero-torso', {
    height: 0.78,
    diameterTop: 0.44,
    diameterBottom: 0.52,
    tessellation: 16,
  }, scene)
  torso.parent = hero
  torso.position.y = 1.08
  torso.material = jacket

  const head = MeshBuilder.CreateSphere('realism-v2-hero-head', { diameter: 0.38, segments: 16 }, scene)
  head.parent = hero
  head.position.y = 1.59
  head.material = skin

  const hairCap = MeshBuilder.CreateSphere('realism-v2-hero-hair', { diameter: 0.4, segments: 12 }, scene)
  hairCap.parent = hero
  hairCap.position.set(0, 1.72, -0.01)
  hairCap.scaling.set(1.02, 0.34, 1.03)
  hairCap.material = hair

  for (const side of [-1, 1] as const) {
    const arm = MeshBuilder.CreateCylinder(`realism-v2-hero-arm-${side}`, {
      height: 0.66,
      diameter: 0.145,
      tessellation: 12,
    }, scene)
    arm.parent = hero
    arm.position.set(side * 0.31, 1.06, 0)
    arm.rotation.z = side * 0.08
    arm.material = jacket

    const hand = MeshBuilder.CreateSphere(`realism-v2-hero-hand-${side}`, { diameter: 0.16, segments: 10 }, scene)
    hand.parent = hero
    hand.position.set(side * 0.335, 0.72, 0)
    hand.material = skin

    const leg = MeshBuilder.CreateCylinder(`realism-v2-hero-leg-${side}`, {
      height: 0.68,
      diameter: 0.18,
      tessellation: 12,
    }, scene)
    leg.parent = hero
    leg.position.set(side * 0.135, 0.38, 0)
    leg.material = trousers

    const foot = MeshBuilder.CreateBox(`realism-v2-hero-foot-${side}`, { width: 0.2, height: 0.12, depth: 0.34 }, scene)
    foot.parent = hero
    foot.position.set(side * 0.135, 0.08, 0.075)
    foot.material = shoe
  }

  const pack = MeshBuilder.CreateBox('realism-v2-hero-backpack', { width: 0.46, height: 0.6, depth: 0.2 }, scene)
  pack.parent = hero
  pack.position.set(0, 1.08, -0.31)
  pack.material = backpack
}

const replaceTreeCrowns = (): void => {
  const scene = EngineStore.LastCreatedScene
  const leaf = getStandardMaterial('tree-leaves')
  if (!scene || !leaf) return

  const crowns = scene.meshes.filter(mesh => mesh instanceof Mesh && mesh.name.startsWith('tree-crown-')) as Mesh[]
  crowns.forEach((crown, index) => {
    if (!crown.isEnabled()) return
    const center = crown.position.clone()
    crown.setEnabled(false)
    const variants: Array<[number, number, number, number, number, number]> = [
      [-0.52, -0.08, 0.06, 1.05, 0.74, 0.92],
      [0.46, 0.04, -0.08, 0.96, 0.82, 1.04],
      [0, 0.72, 0, 0.86, 0.92, 0.86],
    ]
    variants.forEach(([dx, dy, dz, sx, sy, sz], variant) => {
      const canopy = MeshBuilder.CreateSphere(`realism-v2-tree-canopy-${index}-${variant}`, {
        diameter: 2.15,
        segments: 7,
      }, scene)
      canopy.position.copyFrom(center.add(new Vector3(dx, dy, dz)))
      canopy.scaling.set(sx, sy, sz)
      canopy.material = leaf
      canopy.receiveShadows = false
    })
  })
}

const deepenGenericFacades = (): void => {
  const scene = EngineStore.LastCreatedScene
  if (!scene) return
  const plinth = makeMaterial('realism-v2-plinth', '#777973', 0.04)
  const cornice = makeMaterial('realism-v2-cornice', '#c4c0b6', 0.05)
  const entrance = makeMaterial('realism-v2-entry', '#343d42', 0.14)
  if (!plinth || !cornice || !entrance) return

  const buildings = scene.meshes.filter(mesh => mesh instanceof Mesh && /^building-\d+$/.test(mesh.name)) as Mesh[]
  buildings.forEach((building, index) => {
    building.computeWorldMatrix(true)
    const box = building.getBoundingInfo().boundingBox
    const width = box.extendSizeWorld.x * 2
    const depth = box.extendSizeWorld.z * 2
    const height = box.extendSizeWorld.y * 2
    const frontZ = building.position.z - depth / 2 - 0.075
    const groundY = building.position.y - height / 2
    const topY = building.position.y + height / 2

    const base = MeshBuilder.CreateBox(`realism-v2-plinth-${index}`, {
      width: Math.max(2, width - 0.35),
      height: 0.72,
      depth: 0.15,
    }, scene)
    base.position.set(building.position.x, groundY + 0.37, frontZ)
    base.material = plinth

    const top = MeshBuilder.CreateBox(`realism-v2-cornice-${index}`, {
      width: width + 0.22,
      height: 0.22,
      depth: 0.28,
    }, scene)
    top.position.set(building.position.x, topY - 0.28, frontZ - 0.03)
    top.material = cornice

    if (index % 2 === 0) {
      const surround = MeshBuilder.CreateBox(`realism-v2-entry-surround-${index}`, {
        width: 1.75,
        height: 2.65,
        depth: 0.16,
      }, scene)
      surround.position.set(building.position.x, groundY + 1.33, frontZ - 0.02)
      surround.material = entrance
    }
  })
}

const addBadge = (): void => {
  if (document.querySelector('#dropi-realism-v2')) return
  const badge = document.createElement('div')
  badge.id = 'dropi-realism-v2'
  badge.textContent = `REALISM V2 · HUMAN SCALE · #${ISSUE}`
  Object.assign(badge.style, {
    position: 'fixed',
    right: '12px',
    top: '31px',
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
  if (!scene || !scene.getTransformNodeByName('hero') || !scene.metadata?.dropiRealismV1) {
    window.requestAnimationFrame(boot)
    return
  }
  if (scene.metadata?.dropiRealismV2) return
  scene.metadata = { ...(scene.metadata ?? {}), dropiRealismV2: true }

  replaceHeroSilhouette()
  replaceTreeCrowns()
  deepenGenericFacades()
  addBadge()
}

boot()
