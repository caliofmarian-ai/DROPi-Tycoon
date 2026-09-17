import assert from 'node:assert/strict'
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import ts from 'typescript'
const dir = path.resolve(`.coherence-sampling-${process.pid}`)
await mkdir(dir, { recursive: true })
for (const name of ['authoredWalk', 'coherenceSampling']) {
  const code = ts.transpileModule(await readFile(`src/${name}.ts`, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText.replace("'./authoredWalk'", "'./authoredWalk.mjs'")
  await writeFile(path.join(dir, `${name}.mjs`), code)
}
let count = 0
const check = (name, fn) => { fn(); count += 1; console.log(`PASS ${name}`) }
try {
  const { coherenceMotionSample } = await import(pathToFileURL(path.join(dir, 'coherenceSampling.mjs')).href)
  check('cardinal and inverted ordinary travel remain observable', () => {
    for (const [x,z] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const sample = coherenceMotionSample(x * .08, z * .08, .05)
      assert.equal(sample.kind, 'TRAVEL'); assert.equal(sample.x, x); assert.equal(sample.z, z)
    }
    const backward = coherenceMotionSample(0, -.08, .05)
    assert.ok(backward.z < .72, 'A genuinely backward local step must still fail a +Z facing check')
  })
  check('HQ/pickup/handoff/restart relocation never counts as walking', () => {
    for (const [x,z] of [[31,-12],[-56,-27],[61,-11],[-36,50]]) assert.equal(coherenceMotionSample(x,z,.05).kind, 'DISCONTINUITY')
  })
  check('continuous slow frames are sampled while suspension and invalid input are not', () => {
    assert.equal(coherenceMotionSample(.08,0,.8).kind, 'TRAVEL')
    for (const values of [[.08,0,5],[.08,0,0],[NaN,0,.05],[.08,0,Infinity]]) assert.equal(coherenceMotionSample(...values).kind, 'DISCONTINUITY')
    assert.equal(coherenceMotionSample(0,0,.05).kind, 'STATIONARY')
  })
  check('the first local step after relocation is judged from the updated baseline', () => {
    let previous = {x:-2,z:20}
    const values=[]
    for (const point of [{x:29,z:8},{x:29.08,z:8}]) {
      values.push(coherenceMotionSample(point.x-previous.x,point.z-previous.z,.05)); previous=point
    }
    assert.equal(values[0].kind,'DISCONTINUITY');assert.equal(values[1].kind,'TRAVEL');assert.equal(values[1].x,1)
  })
  const source = await readFile('src/coherenceProbe.ts', 'utf8')
  check('probe preserves verdict and thresholds rather than suppressing real failures', () => {
    const start=source.indexOf("if (sample.kind !== 'TRAVEL')"),end=source.indexOf('const actual =',start)
    const skipped=source.slice(start,end)
    assert.doesNotMatch(skipped,/status\.(controls|facing)\s*=/)
    assert.match(source,/facingSamples >= 8/);assert.match(source,/controlSamples >= 8/)
    assert.match(source,/facingDot >= \.72/);assert.match(source,/dot >= \.72/)
    assert.ok(source.indexOf('previous.copyFrom(hero.position)')<start)
  })
  console.log(`Coherence sampling regression: ${count} PASS. Restart is not directional evidence; real opposite-direction travel remains detectable.`)
} finally { await rm(dir, { recursive: true, force: true }) }
