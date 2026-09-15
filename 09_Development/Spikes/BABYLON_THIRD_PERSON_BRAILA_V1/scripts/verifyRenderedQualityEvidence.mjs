import assert from 'node:assert/strict'
import { readFile, writeFile } from 'node:fs/promises'
const report=JSON.parse(await readFile('dist/evidence/verification.json','utf8'))
assert.equal(report.status,'PASS');assert.equal(report.errors.length,0);assert.equal(report.gpuErrors.length,0)
assert.equal(report.classification,'DESKTOP_SOFTWARE_WEBGL_REGRESSION_NOT_ANDROID_ACCEPTANCE')
const expected=process.env.VITE_COMMIT_SHA??process.env.GITHUB_SHA??'LOCAL'
assert.equal(report.sourceSha,expected)
const names=['01-city-start','02-hq','03-carry','04-walk-stop','05-handoff','06-restart']
const frames=[]
for(const name of names){
 const frame=report.frames.find(f=>f.name===name);assert.ok(frame,`Missing ${name}`)
 const q=frame.state.ready.quality,r=frame.state.resolution
 assert.equal(q?.status,'ACTIVE',`${name}: quality assembly not active`)
 assert.equal(q.buildings,10);assert.ok(q.recessedWindows>=200)
 assert.equal(q.originalColliderBoundsPreserved,true);assert.equal(q.texturePixels,1024)
 assert.ok(q.ownedMeshes<=41&&q.ownedTextures<=15);assert.equal(q.visualAcceptance,'UNKNOWN')
 assert.equal(r.graphicsMode,'HD');assert.equal(r.resizePhase,'BEGIN_FRAME_ONLY')
 assert.ok(r.actualWidth>=2000&&r.actualHeight>=900,`${name}: no actual HD pixel gain`)
 assert.ok(r.actualWidth*r.actualHeight<=2073600,`${name}: pixel cap exceeded`)
 assert.equal(frame.pixels.nonblank,true,`${name}: original capture was blank`)
 frames.push({name,actualPixels:[r.actualWidth,r.actualHeight],geometry:q,visiblePixels:frame.pixels,measuredFrameBudget:{meanMs:r.meanMs,p95Ms:r.p95Ms,p99Ms:r.p99Ms}})
}
const result={sourceSha:expected,status:'PASS',classification:report.classification,frames,physicalDeviceAcceptance:'UNKNOWN',ownerVisualAcceptance:'UNKNOWN',balancedButtonPhysicalTest:'UNKNOWN'}
await writeFile('dist/evidence/quality-verification.json',`${JSON.stringify(result,null,2)}\n`)
console.log('Rendered quality PASS: real HD buffer and upgraded architecture present at all six preserved mission checkpoints. NOT physical Android, subjective visual acceptance, or balanced-button acceptance.')
