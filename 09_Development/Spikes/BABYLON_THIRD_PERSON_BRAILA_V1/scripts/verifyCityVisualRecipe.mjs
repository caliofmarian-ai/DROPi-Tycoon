import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import ts from 'typescript'

const temp = mkdtempSync(path.join(process.cwd(), '.verify-city-visual-'))
let checks = 0
const check = (name, fn) => { fn(); checks++; console.log(`PASS ${name}`) }
const compile = name => {
  const input = readFileSync(new URL(`../src/${name}.ts`, import.meta.url), 'utf8')
  const output = ts.transpileModule(input, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText
    .replaceAll("'./cityVisualRecipe'", "'./cityVisualRecipe.mjs'")
    .replaceAll("'./filmicSurface'", "'./filmicSurface.mjs'")
    .replaceAll("'@babylonjs/core/Materials/Textures/rawTexture'", "'@babylonjs/core/Materials/Textures/rawTexture.js'")
  const target = path.join(temp, `${name}.mjs`); writeFileSync(target, output); return pathToFileURL(target).href
}
try {
  const recipeUrl = compile('cityVisualRecipe')
  const filmicUrl = compile('filmicSurface')
  const { compileFacade, facadePoint, surfacePixels, validateVisualKit } = await import(recipeUrl)
  const { filmicSurfacePixels } = await import(filmicUrl)
  const kit = { id: 'test-only/stone', revision: 1, seed: 18, palette: { stone: '#8f938e', trim: '#e0d7c5', metal: '#3e5057', glass: '#436374', accent: '#008cb5' }, pavingColor: '#bcb5a5', asphaltColor: '#393e40', pavingTileMeters: 2, frameWidth: .1, windowWidth: 1.5, windowHeight: 1.55 }
  const facade = { id: 'test-only/anchor', origin: [9, .16, 12], yaw: 0, width: 14, height: 9, windows: [[-4, 2.1], [0, 2.1], [4, 2.1], [-4, 5.1], [0, 5.1], [4, 5.1]], door: { x: 0, width: 1.35, height: 2.35 } }
  check('deterministic geometry without input mutation', () => {
    const before = JSON.stringify({ kit, facade })
    assert.deepEqual(compileFacade(kit, facade), compileFacade(kit, facade))
    assert.equal(JSON.stringify({ kit, facade }), before)
  })
  check('explicit materially different profile uses same compiler', () => {
    const other = { ...kit, id: 'test-only/dark-metal', revision: 2, seed: 91, palette: { ...kit.palette, trim: '#364655', glass: '#786454' }, frameWidth: .06, windowWidth: 1.2, windowHeight: 1.9, pavingTileMeters: 4 }
    assert.notDeepEqual(compileFacade(other, { ...facade, yaw: Math.PI / 2 }), compileFacade(kit, facade))
    assert.notDeepEqual(surfacePixels(other, 'paving'), surfacePixels(kit, 'paving'))
    assert.notDeepEqual(filmicSurfacePixels(other, 'asphalt').normal, filmicSurfacePixels(kit, 'asphalt').normal)
  })
  check('four facade orientations retain physical dimensions', () => {
    for (const yaw of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
      const f = { ...facade, yaw }, point = facadePoint(f, 2, 3, .4)
      assert.ok(Math.abs(Math.hypot(point[0] - 9, point[2] - 12) - Math.hypot(2, .4)) < 1e-10)
      assert.equal(point[1], 3.16)
      assert.deepEqual(compileFacade(kit, f).map(x => x.size), compileFacade(kit, facade).map(x => x.size))
    }
  })
  check('doorway remains free of a decorative filling panel', () => {
    const boxes = compileFacade(kit, facade)
    assert.ok(!boxes.some(b => b.id.includes('window-0:2.1')))
    assert.ok(!boxes.some(b => b.id.includes('door/glazing') || b.id.includes('door/sill')))
    assert.equal(boxes.filter(b => b.id.includes('door/jamb')).length, 2)
    for (const b of boxes.filter(b => b.id.includes('plinth'))) assert.ok(Math.abs(b.center[0] - 9) - b.size[0] / 2 >= facade.door.width / 2)
  })
  check('all detail IDs unique, dimensions finite and bounded', () => {
    const boxes = compileFacade(kit, facade)
    assert.equal(new Set(boxes.map(b => b.id)).size, boxes.length)
    assert.ok(boxes.length < 800)
    assert.ok(boxes.every(b => b.size.every(v => Number.isFinite(v) && v > 0) && b.center.every(Number.isFinite)))
  })
  check('deterministic opaque textures within 256-pixel budget', () => {
    for (const family of ['paving', 'asphalt']) {
      const pixels = surfacePixels(kit, family)
      assert.deepEqual(pixels, surfacePixels(kit, family))
      assert.equal(pixels.length, 256 * 256 * 4)
      for (let i = 3; i < pixels.length; i += 4) assert.equal(pixels[i], 255)
      assert.ok(new Set(pixels).size > 15)
    }
  })
  check('PBR companion maps are deterministic, bounded and materially non-flat', () => {
    for (const family of ['paving', 'asphalt']) {
      const a = filmicSurfacePixels(kit, family), b = filmicSurfacePixels(kit, family)
      assert.deepEqual(a, b)
      for (const map of [a.color, a.normal, a.orm]) assert.equal(map.length, 256 * 256 * 4)
      assert.ok(new Set(a.normal).size > 12)
      assert.ok(new Set(a.orm).size > 8)
      for (let i = 3; i < a.normal.length; i += 4) {
        assert.equal(a.normal[i], 255); assert.equal(a.orm[i], 255)
        assert.equal(a.orm[i - 1], 0)
      }
    }
  })
  check('invalid kit cannot silently use the reference city', () => {
    for (const bad of [null, { ...kit, id: '' }, { ...kit, revision: 0 }, { ...kit, palette: {} }, { ...kit, pavingTileMeters: NaN }, { ...kit, frameWidth: 9 }]) assert.throws(() => validateVisualKit(bad))
  })
  check('malformed, duplicated and out-of-bounds openings rejected', () => {
    for (const bad of [{ ...facade, origin: [NaN, 0, 0] }, { ...facade, yaw: Infinity }, { ...facade, windows: [[1, 2], [1, 2]] }, { ...facade, windows: [[100, 2]] }, { ...facade, windows: [[0]] }, { ...facade, windows: new Array(97).fill([2, 2]) }, { ...facade, door: { x: 50, width: 1, height: 2 } }]) assert.throws(() => compileFacade(kit, bad))
  })
  check('oversized, non-power-of-two and unknown texture families rejected', () => {
    for (const size of [0, 16, 33, 1024, NaN]) assert.throws(() => surfacePixels(kit, 'paving', size))
    assert.throws(() => surfacePixels(kit, 'unknown'))
  })
  if (!process.argv.includes('--pure-only')) {
    const { NullEngine, Scene, MeshBuilder, PBRMaterial } = await import('@babylonjs/core')
    const { installCityVisuals } = await import(compile('cityVisualPresentation'))
    const engine = new NullEngine()
    const scene = new Scene(engine)
    // Warm Babylon's scene-owned PBR BRDF cache before resource snapshots so
    // recipe disposal is measured against stable scene infrastructure.
    new PBRMaterial('scene-shared-brdf-warm', scene)
    // Account for the engine-owned lazy default before taking resource snapshots.
    // It is not owned by the visual recipe and must never be disposed with it.
    const originalMaterial = scene.defaultMaterial
    const floor = MeshBuilder.CreateBox('authoritative-sidewalk', { width: 12, depth: 4, height: .16 }, scene)
    floor.position.set(1, .08, 2); floor.checkCollisions = true
    const window = MeshBuilder.CreateBox('old-window', { width: 1.2, height: 1.1, depth: .08 }, scene)
    floor.material = originalMaterial; window.material = originalMaterial
    const binding = { id: 'test-only/sector', facades: [{ kit, anchor: facade, replaceWindows: [window] }], surfaces: [{ kit, mesh: floor, family: 'paving' }] }
    const before = { meshes: scene.meshes.length, materials: scene.materials.length, textures: scene.textures.length, positions: [...floor.getVerticesData('position')], uvs: [...floor.getVerticesData('uv')], position: floor.position.asArray() }
    let handle
    check('actual Babylon installation preserves source geometry and collision', () => {
      handle = installCityVisuals(scene, binding)
      assert.equal(floor.isVisible, false); assert.equal(window.isVisible, false)
      assert.equal(floor.checkCollisions, true); assert.equal(floor.isEnabled(), true)
      assert.deepEqual([...floor.getVerticesData('position')], before.positions)
      assert.deepEqual([...floor.getVerticesData('uv')], before.uvs)
      assert.deepEqual(floor.position.asArray(), before.position)
      assert.equal(handle.textureCount, 3); assert.ok(handle.drawMeshes <= 6)
      const visual = scene.getMeshByName('city-visual/surface/authoritative-sidewalk')
      assert.equal(visual.checkCollisions, false); assert.equal(visual.isPickable, false)
      assert.ok(visual.material instanceof PBRMaterial)
      assert.ok(visual.material.albedoTexture && visual.material.bumpTexture && visual.material.metallicTexture)
      assert.notDeepEqual([...visual.getVerticesData('uv')], before.uvs)
      // Babylon geometry cloning materializes GPU float32 data. Keep exact
      // source checks above; compare the clone to the exact float32 conversion,
      // not a blanket tolerance that could conceal displaced geometry.
      assert.deepEqual([...visual.getVerticesData('position')], before.positions.map(Math.fround))
    })
    check('same-scene repeat is idempotent; different recipe requires disposal', () => {
      const n = scene.meshes.length
      assert.equal(installCityVisuals(scene, binding), handle); assert.equal(scene.meshes.length, n)
      assert.throws(() => installCityVisuals(scene, { ...binding, id: 'other' }))
    })
    check('disposal restores original presentation without leaks', () => {
      handle.dispose(); handle.dispose()
      assert.equal(floor.isVisible, true); assert.equal(window.isVisible, true)
      assert.equal(scene.meshes.length, before.meshes)
      assert.equal(scene.materials.length, before.materials, scene.materials.map(m => m.name).join(','))
      assert.equal(floor.material, originalMaterial); assert.equal(window.material, originalMaterial)
      assert.ok(scene.materials.includes(originalMaterial))
      assert.equal(scene.textures.length, before.textures)
    })
    check('missing or duplicate source fails before any visual mutation', () => {
      assert.throws(() => installCityVisuals(scene, { ...binding, surfaces: [...binding.surfaces, ...binding.surfaces] }))
      assert.throws(() => installCityVisuals(scene, { ...binding, facades: [binding.facades[0], binding.facades[0]] }))
      assert.equal(floor.isVisible, true); assert.equal(scene.meshes.length, before.meshes)
    })
    check('fresh scene entry rebuilds and scene disposal owns cleanup', () => {
      assert.ok(installCityVisuals(scene, binding)); scene.dispose()
      assert.throws(() => installCityVisuals(scene, binding)); engine.dispose()
    })
  }
  console.log(`City visual recipe: ${checks} checks PASS; physical Android acceptance UNKNOWN`)
} finally { rmSync(temp, { recursive: true, force: true }) }
