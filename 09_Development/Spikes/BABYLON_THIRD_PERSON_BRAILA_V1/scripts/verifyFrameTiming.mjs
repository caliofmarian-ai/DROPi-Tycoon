import assert from 'node:assert/strict'
import { readFile, writeFile, unlink } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import path from 'node:path'
import ts from 'typescript'

const output = path.resolve(`.frame-timing-${process.pid}.mjs`)
await writeFile(output, ts.transpileModule(await readFile('src/authoredWalk.ts', 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
}).outputText)
let tests = 0
const check = (name, run) => { run(); tests += 1; console.log(`PASS ${name}`) }
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-8, `${a} != ${b}`)
try {
  const { planarSpeed, nextWalkState, createWalkMixer, WALK_REFERENCE_MPS, HERO_WALK_SPEED_MPS } = await import(pathToFileURL(output).href)
  check('a 750ms rendered movement is not silently converted to zero speed', () => near(planarSpeed(.06, 0, .75), .08))
  check('slow visible travel selects walking rather than a sliding idle pose', () => {
    const state = nextWalkState({ moving: false, weight: 0, ratio: 0 }, .08, .75)
    assert.equal(state.moving, true); assert.ok(state.weight > 0)
    near(state.ratio * .75 * WALK_REFERENCE_MPS, .06)
  })
  check('variable frame timing preserves displacement-to-animation phase', () => {
    let state = { moving: false, weight: 0, ratio: 0 }, travelled = 0, represented = 0
    for (const dt of [.016, .1, .3, .75, 1.2, .02, .4]) {
      const distance = Math.min(dt, .05) * HERO_WALK_SPEED_MPS
      state = nextWalkState(state, planarSpeed(distance, 0, dt), dt)
      assert.equal(state.moving, true)
      represented += state.ratio * dt * WALK_REFERENCE_MPS; travelled += distance
    }
    near(represented, travelled)
  })
  check('collision-blocked movement and invalid input remain zero', () => {
    for (const dt of [.016, .3, .75, 1.2]) near(planarSpeed(0, 0, dt), 0)
    near(planarSpeed(.06, 0, 0), 0); near(planarSpeed(NaN, 0, .5), 0)
  })
  check('suspension and relocation are not ordinary low-FPS walking', () => {
    near(planarSpeed(.05, 0, 5), 0); near(planarSpeed(15, 0, .1), 0)
    near(planarSpeed(.05, 0, -.1), 0)
  })
  check('the actual mixer retains normalized weights and stops after release', () => {
    const fake = () => ({ targetedAnimations: [{}], speedRatio: 0, weight: 0, starts: 0, start() { this.starts += 1 }, stop() {}, setWeightForAllAnimatables(weight) { this.weight = weight } })
    const idle = fake(), walk = fake(), mixer = createWalkMixer(idle, walk)
    for (let i = 0; i < 5; i += 1) {
      const state = mixer.update(planarSpeed(.06, 0, .75), .75)
      assert.equal(state.moving, true); near(walk.speedRatio * .75 * WALK_REFERENCE_MPS, .06); near(idle.weight + walk.weight, 1)
    }
    for (let i = 0; i < 60; i += 1) mixer.update(0, 1 / 60)
    near(walk.weight, 0); near(idle.weight, 1); near(walk.speedRatio, 0)
    assert.equal(idle.starts, 1); assert.equal(walk.starts, 1)
    mixer.stop()
  })
  console.log(`Continuous-frame motion regression: ${tests} PASS. Timing/animation correctness is not an Android FPS improvement claim.`)
} finally { await unlink(output) }
