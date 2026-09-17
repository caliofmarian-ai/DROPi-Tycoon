import {
  Color3,
  Color4,
  DynamicTexture,
  EngineStore,
  Mesh,
  MeshBuilder,
  Scene,
  StandardMaterial,
  Texture,
  TransformNode,
  Vector3,
} from '@babylonjs/core'

const ISSUE = 726

type TexturePainter = (ctx: CanvasRenderingContext2D, size: number) => void

const seededRandom = (seed: number): (() => number) => {
  let state = seed >>> 0
  return () => {
    state = (1664525 * state + 1013904223) >>> 0
    return state / 0xffffffff
  }
}

const patternTexture = (
  scene: Scene,
  name: string,
  size: number,
  painter: TexturePainter,
): DynamicTexture => {
  const texture = new DynamicTexture(name, { width: size, height: size }, scene, false)
  const ctx = texture.getContext() as CanvasRenderingContext2D
  painter(ctx, size)
  texture.wrapU = Texture.WRAP_ADDRESSMODE
  texture.wrapV = Texture.WRAP_ADDRESSMODE
  texture.update(false)
  return texture
}

const applyTexture = (
  scene: Scene,
  materialName: string,
  texture: DynamicTexture,
  uScale: number,
  vScale: number,
  specular: number,
): void => {
  const material = scene.getMaterialByName(materialName)
  if (!(material instanceof StandardMaterial)) return
  material.diffuseTexture = texture
  texture.uScale = uScale
  texture.vScale = vScale
  material.specularColor = new Color3(specular, specular, specular)
}

const paintAsphalt: TexturePainter = (ctx, size) => {
  ctx.fillStyle = '#33383a'
  ctx.fillRect(0, 0, size, size)
  const random = seededRandom(7201)
  for (let i = 0; i < 720; i += 1) {
    const value = 48 + Math.floor(random() * 36)
    const alpha = 0.16 + random() * 0.22
    ctx.fillStyle = `rgba(${value},${value},${value},${alpha})`
    const r = random() > 0.86 ? 2 : 1
    ctx.fillRect(Math.floor(random() * size), Math.floor(random() * size), r, r)
  }
  ctx.strokeStyle = 'rgba(15,18,19,.22)'
  ctx.lineWidth = 1
  for (let y = 38; y < size; y += 71) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.bezierCurveTo(size * .27, y - 3, size * .66, y + 4, size, y - 1)
    ctx.stroke()
  }
}

const paintPavers: TexturePainter = (ctx, size) => {
  ctx.fillStyle = '#aaa69d'
  ctx.fillRect(0, 0, size, size)
  ctx.strokeStyle = 'rgba(70,70,66,.26)'
  ctx.lineWidth = 2
  const cell = 32
  for (let y = 0; y <= size; y += cell) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(size, y)
    ctx.stroke()
  }
  for (let row = 0, y = 0; y < size; row += 1, y += cell) {
    const offset = row % 2 === 0 ? 0 : cell / 2
    for (let x = offset; x <= size; x += cell) {
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x, Math.min(size, y + cell))
      ctx.stroke()
    }
  }
  const random = seededRandom(7202)
  for (let i = 0; i < 180; i += 1) {
    const tone = 145 + Math.floor(random() * 45)
    ctx.fillStyle = `rgba(${tone},${tone},${tone - 4},.16)`
    ctx.fillRect(Math.floor(random() * size), Math.floor(random() * size), 2, 2)
  }
}

const paintBrick: TexturePainter = (ctx, size) => {
  ctx.fillStyle = '#805849'
  ctx.fillRect(0, 0, size, size)
  const brickW = 48
  const brickH = 24
  ctx.strokeStyle = 'rgba(216,202,183,.42)'
  ctx.lineWidth = 2
  for (let y = 0, row = 0; y <= size; y += brickH, row += 1) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(size, y)
    ctx.stroke()
    const offset = row % 2 === 0 ? 0 : brickW / 2
    for (let x = offset; x <= size; x += brickW) {
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x, Math.min(size, y + brickH))
      ctx.stroke()
    }
  }
  const random = seededRandom(7203)
  for (let i = 0; i < 240; i += 1) {
    ctx.fillStyle = `rgba(65,42,36,${.04 + random() * .12})`
    ctx.fillRect(Math.floor(random() * size), Math.floor(random() * size), 3, 2)
  }
}

const paintPlaster = (base: string, seed: number): TexturePainter => (ctx, size) => {
  ctx.fillStyle = base
  ctx.fillRect(0, 0, size, size)
  const random = seededRandom(seed)
  for (let i = 0; i < 620; i += 1) {
    const light = random() > .5 ? 255 : 48
    ctx.fillStyle = `rgba(${light},${light},${light},${.014 + random() * .035})`
    const r = random() > .88 ? 2 : 1
    ctx.fillRect(Math.floor(random() * size), Math.floor(random() * size), r, r)
  }
  ctx.fillStyle = 'rgba(48,52,49,.035)'
  for (let x = 18; x < size; x += 61) ctx.fillRect(x, 0, 1, size)
}

const paintGrass: TexturePainter = (ctx, size) => {
  ctx.fillStyle = '#58704f'
  ctx.fillRect(0, 0, size, size)
  const random = seededRandom(7207)
  for (let i = 0; i < 900; i += 1) {
    const g = 72 + Math.floor(random() * 70)
    ctx.fillStyle = `rgba(${38 + Math.floor(random() * 28)},${g},${34 + Math.floor(random() * 32)},.34)`
    const x = Math.floor(random() * size)
    const y = Math.floor(random() * size)
    ctx.fillRect(x, y, 1, 2 + Math.floor(random() * 3))
  }
}

const paintWater: TexturePainter = (ctx, size) => {
  ctx.fillStyle = '#315f73'
  ctx.fillRect(0, 0, size, size)
  const random = seededRandom(7208)
  for (let i = 0; i < 130; i += 1) {
    const y = Math.floor(random() * size)
    const x = Math.floor(random() * size)
    const w = 10 + Math.floor(random() * 42)
    ctx.fillStyle = random() > .45 ? 'rgba(177,211,220,.10)' : 'rgba(18,48,62,.12)'
    ctx.fillRect(x, y, w, 1)
  }
}

const material = (scene: Scene, name: string, hex: string, specular = .08): StandardMaterial => {
  const existing = scene.getMaterialByName(name)
  if (existing instanceof StandardMaterial) return existing
  const result = new StandardMaterial(name, scene)
  result.diffuseColor = Color3.FromHexString(hex)
  result.specularColor = new Color3(specular, specular, specular)
  return result
}

const box = (
  scene: Scene,
  name: string,
  dimensions: { width: number; height: number; depth: number },
  position: Vector3,
  mat: StandardMaterial,
  parent?: TransformNode,
): Mesh => {
  const mesh = MeshBuilder.CreateBox(name, dimensions, scene)
  mesh.position.copyFrom(position)
  mesh.material = mat
  mesh.receiveShadows = true
  if (parent) mesh.parent = parent
  return mesh
}

const upgradeSurfaceLanguage = (scene: Scene): void => {
  const asphalt = patternTexture(scene, 'target-asphalt-texture', 256, paintAsphalt)
  const pavers = patternTexture(scene, 'target-paver-texture', 256, paintPavers)
  const brick = patternTexture(scene, 'target-brick-texture', 256, paintBrick)
  const plasterSand = patternTexture(scene, 'target-plaster-sand', 192, paintPlaster('#b6997b', 7204))
  const plasterCream = patternTexture(scene, 'target-plaster-cream', 192, paintPlaster('#c6b79f', 7205))
  const plasterBlue = patternTexture(scene, 'target-plaster-blue', 192, paintPlaster('#6f8b97', 7206))
  const stone = patternTexture(scene, 'target-stone-texture', 192, paintPlaster('#90938f', 7209))
  const grass = patternTexture(scene, 'target-grass-texture', 192, paintGrass)
  const water = patternTexture(scene, 'target-water-texture', 256, paintWater)

  applyTexture(scene, 'asphalt', asphalt, 14, 8, .025)
  applyTexture(scene, 'sidewalk', pavers, 18, 4, .035)
  applyTexture(scene, 'facade-brick', brick, 4.3, 5.2, .035)
  applyTexture(scene, 'facade-sand', plasterSand, 4, 4, .028)
  applyTexture(scene, 'facade-cream', plasterCream, 4, 4, .028)
  applyTexture(scene, 'facade-blue', plasterBlue, 4, 4, .035)
  applyTexture(scene, 'facade-stone', stone, 4, 4, .035)
  applyTexture(scene, 'grass', grass, 14, 14, 0)
  applyTexture(scene, 'danube', water, 10, 2.6, .30)

  const glass = scene.getMaterialByName('window-glass')
  if (glass instanceof StandardMaterial) {
    glass.diffuseColor = Color3.FromHexString('#3f6879')
    glass.specularColor = new Color3(.58, .66, .72)
    glass.emissiveColor = new Color3(.02, .035, .045)
    glass.alpha = .80
  }
}

const deepenFacades = (scene: Scene): void => {
  const trim = material(scene, 'target-facade-trim', '#d3cbbb', .04)
  const darkTrim = material(scene, 'target-facade-dark-trim', '#4c5253', .09)
  const shopGlass = material(scene, 'target-shop-glass', '#456f7b', .38)
  shopGlass.alpha = .78
  const awning = material(scene, 'target-awning', '#5f756f', .06)

  const buildings = scene.meshes.filter(mesh => mesh instanceof Mesh && /^building-\d+$/.test(mesh.name)) as Mesh[]
  buildings.forEach((building, index) => {
    building.computeWorldMatrix(true)
    const bounds = building.getBoundingInfo().boundingBox
    const width = bounds.extendSizeWorld.x * 2
    const depth = bounds.extendSizeWorld.z * 2
    const height = bounds.extendSizeWorld.y * 2
    const groundY = building.position.y - height / 2
    const topY = building.position.y + height / 2
    const frontZ = building.position.z - depth / 2 - .15

    const floorCount = Math.max(2, Math.min(5, Math.floor(height / 3.0)))
    for (let floor = 1; floor < floorCount; floor += 1) {
      box(
        scene,
        `target-facade-band-${index}-${floor}`,
        { width: width - .36, height: .10, depth: .16 },
        new Vector3(building.position.x, groundY + floor * 3.0, frontZ),
        trim,
      )
    }

    for (const xOffset of [-width * .31, width * .31]) {
      box(
        scene,
        `target-facade-pilaster-${index}-${xOffset > 0 ? 'r' : 'l'}`,
        { width: .14, height: Math.max(3, height - .7), depth: .17 },
        new Vector3(building.position.x + xOffset, groundY + height / 2, frontZ - .01),
        trim,
      )
    }

    box(
      scene,
      `target-parapet-${index}`,
      { width: width + .32, height: .42 + (index % 3) * .08, depth: .28 },
      new Vector3(building.position.x, topY + .19, frontZ + .04),
      index % 2 === 0 ? trim : darkTrim,
    )

    if (index % 3 === 0) {
      const storefrontWidth = Math.min(width - 2.6, 7.2)
      box(
        scene,
        `target-shopfront-${index}`,
        { width: storefrontWidth, height: 2.45, depth: .13 },
        new Vector3(building.position.x, groundY + 1.3, frontZ - .035),
        shopGlass,
      )
      box(
        scene,
        `target-shop-awning-${index}`,
        { width: storefrontWidth + .5, height: .15, depth: .82 },
        new Vector3(building.position.x, groundY + 2.72, frontZ - .34),
        awning,
      )
    }
  })
}

const refineVehicles = (scene: Scene): void => {
  const tyre = scene.getMaterialByName('realism-tyre')
  const glass = scene.getMaterialByName('window-glass')
  const chrome = material(scene, 'target-car-chrome', '#767d80', .45)
  const redLight = material(scene, 'target-tail-light', '#7d2220', .16)
  redLight.emissiveColor = new Color3(.16, .015, .01)

  ;['car-1', 'car-2', 'car-3'].forEach((name, index) => {
    const root = scene.getTransformNodeByName(name)
    const body = scene.getMeshByName(`${name}-body`)
    const cabin = scene.getMeshByName(`${name}-cabin`)
    if (!(root instanceof TransformNode) || !(body instanceof Mesh) || !(cabin instanceof Mesh)) return

    body.scaling.set(1, .90, 1)
    cabin.scaling.set(.94, .90, .88)

    const bodyMaterial = body.material instanceof StandardMaterial ? body.material : chrome
    box(scene, `target-${name}-hood`, { width: 1.58, height: .24, depth: 1.05 }, new Vector3(0, .78, 1.42), bodyMaterial, root)
    box(scene, `target-${name}-trunk`, { width: 1.58, height: .22, depth: .72 }, new Vector3(0, .75, -1.62), bodyMaterial, root)
    box(scene, `target-${name}-front-bumper`, { width: 1.72, height: .17, depth: .16 }, new Vector3(0, .38, 2.04), chrome, root)
    box(scene, `target-${name}-rear-bumper`, { width: 1.72, height: .17, depth: .16 }, new Vector3(0, .38, -2.04), chrome, root)

    if (glass instanceof StandardMaterial) {
      box(scene, `target-${name}-windshield`, { width: 1.40, height: .50, depth: .08 }, new Vector3(0, 1.16, .82), glass, root).rotation.x = -.25
    }
    for (const x of [-.58, .58]) {
      box(scene, `target-${name}-tail-${x}`, { width: .28, height: .20, depth: .07 }, new Vector3(x, .61, -2.06), redLight, root)
    }

    if (tyre instanceof StandardMaterial && index === 0) tyre.diffuseColor = Color3.FromHexString('#111416')
  })
}

const refineHero = (scene: Scene): void => {
  const hero = scene.getTransformNodeByName('hero')
  const torso = scene.getMeshByName('realism-v2-hero-torso')
  const head = scene.getMeshByName('realism-v2-hero-head')
  const jacket = scene.getMaterialByName('hero-jacket')
  const skin = scene.getMaterialByName('hero-skin')
  if (!(hero instanceof TransformNode) || !(torso instanceof Mesh) || !(head instanceof Mesh)) return
  if (!(jacket instanceof StandardMaterial) || !(skin instanceof StandardMaterial)) return

  torso.scaling.set(1.05, 1, .82)
  head.scaling.set(.88, 1.05, .92)

  const neck = MeshBuilder.CreateCylinder('target-hero-neck', { height: .18, diameter: .16, tessellation: 10 }, scene)
  neck.parent = hero
  neck.position.set(0, 1.42, 0)
  neck.material = skin

  const chest = box(
    scene,
    'target-hero-jacket-panel',
    { width: .31, height: .46, depth: .035 },
    new Vector3(0, 1.10, .245),
    jacket,
    hero,
  )
  chest.receiveShadows = false

  const strap = material(scene, 'target-hero-strap', '#1f303b', .04)
  for (const x of [-.18, .18]) {
    const shoulder = box(
      scene,
      `target-hero-strap-${x < 0 ? 'l' : 'r'}`,
      { width: .055, height: .54, depth: .035 },
      new Vector3(x, 1.13, -.225),
      strap,
      hero,
    )
    shoulder.receiveShadows = false
  }
}

const tuneLighting = (scene: Scene): void => {
  scene.clearColor = new Color4(.59, .72, .80, 1)
  scene.fogColor = new Color3(.59, .72, .80)
  scene.fogDensity = .0022

  const ambient = scene.getLightByName('ambient')
  const sun = scene.getLightByName('sun')
  if (ambient) ambient.intensity = .78
  if (sun) sun.intensity = 1.28

  const processing = scene.imageProcessingConfiguration
  processing.toneMappingEnabled = true
  processing.exposure = 1.04
  processing.contrast = 1.16
}

const boot = (): void => {
  const scene = EngineStore.LastCreatedScene
  if (!scene || !scene.metadata?.dropiRealismV2 || !scene.metadata?.dropiPresentationCoherenceFix) {
    window.requestAnimationFrame(boot)
    return
  }
  if (scene.metadata?.dropiVisualTargetJumpV1) return
  scene.metadata = { ...(scene.metadata ?? {}), dropiVisualTargetJumpV1: true }

  tuneLighting(scene)
  upgradeSurfaceLanguage(scene)
  deepenFacades(scene)
  refineVehicles(scene)
  refineHero(scene)

  ;(window as Window & { __DROPiVisualTargetJumpV1?: { issue: number; mode: string } }).__DROPiVisualTargetJumpV1 = {
    issue: ISSUE,
    mode: 'procedural-material-depth-bridge-to-governed-asset-family',
  }
}

boot()
