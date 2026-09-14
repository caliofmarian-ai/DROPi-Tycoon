import assert from 'node:assert/strict'
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import path from 'node:path'
import ts from 'typescript'

const dir = path.resolve(`.mobile-performance-test-${process.pid}`)
await mkdir(dir, { recursive: true })
let passed = 0
const check = (name, fn) => { fn(); passed++; console.log(`PASS ${name}`) }
try {
  const source = await readFile('src/renderResolution.ts', 'utf8')
  const js = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText
  await writeFile(path.join(dir, 'resolution.mjs'), js)
  const { nextResolution, frameBudget, resolutionPlan, createResolutionOwner, TARGET_FPS } = await import(pathToFileURL(path.join(dir, 'resolution.mjs')).href)
  const initial = { density: 1.25, lastChange: 0, overloaded: false }
  check('60 FPS target: the reproduced 45 FPS sample reduces rather than increases load', () => {
    assert.equal(TARGET_FPS, 60)
    const next = nextResolution(initial, 22, 28, 20)
    assert.ok(next.density < initial.density); assert.equal(next.overloaded, true)
  })
  check('30 and 19 FPS reduce load; 55 FPS never increases it', () => {
    for (const [mean, p95] of [[33.34, 36], [52.6, 70]]) assert.ok(nextResolution(initial, mean, p95, 20).density < initial.density)
    assert.ok(nextResolution(initial, 18.2, 21, 20).density <= initial.density)
  })
  check('fast mean does not hide a repeatedly slow tail', () => assert.ok(nextResolution(initial, 16, 45, 20).density < initial.density))
  check('stable 60 Hz may recover quality, but only after the longer cooldown', () => {
    assert.equal(nextResolution(initial, 16.67, 17.1, 7).density, initial.density)
    assert.ok(nextResolution(initial, 16.67, 17.1, 13).density > initial.density)
    assert.equal(nextResolution(initial, 60, 90, 1), initial)
  })
  check('pixel density floor/ceiling and saturation do not pump lastChange', () => {
    let s = initial
    for (let t = 7; t < 300; t += 7) s = nextResolution(s, 70, 90, t)
    assert.equal(s.density, .95)
    assert.equal(nextResolution(s, 70, 90, 1000).lastChange, s.lastChange)
    for (let t = 1010; t < 2000; t += 13) s = nextResolution(s, 16.67, 17, t)
    assert.equal(s.density, 1.35)
  })
  check('invalid samples and clock reversal cannot drive quality', () => {
    for (const x of [NaN, Infinity, -1, 0]) assert.equal(nextResolution(initial, x, 22, 20), initial)
    assert.equal(nextResolution(initial, 16, 17, -3), initial)
  })
  check('p99 and worst-frame retain stalls, rather than dropping >=250ms', () => {
    const b = frameBudget([...Array(120).fill(16.67), 280, 400])
    assert.equal(b.worstMs, 400); assert.equal(b.p99Ms, 280); assert.ok(b.overBudgetPercent > 0)
    assert.ok(frameBudget([500, 500, 500, 500]).meanMs === 500)
    assert.equal(frameBudget([NaN, -1, 0, 10]), null)
  })
  check('resolution respects pixel budget, DPR, and finite dimensions', () => {
    for (const [w,h,d] of [[906,405,2.25],[412,915,3],[3840,2160,4],[960,432,1]]) {
      const p = resolutionPlan(w,h,d); assert.ok(p.width*p.height < 1_055_000); assert.ok(p.density <= d)
    }
    assert.throws(() => resolutionPlan(0, 405, 2))
  })
  // Deterministic real owner lifecycle with an engine/DOM test double. No GPU/FPS claim.
  const observable = () => {
    const callbacks = new Set()
    return { add(fn) { callbacks.add(fn); return fn }, addOnce(fn) { const once = () => { callbacks.delete(once); fn() }; callbacks.add(once); return once }, remove(fn) { callbacks.delete(fn) }, emit() { [...callbacks].forEach(fn => fn()) }, get size() { return callbacks.size } }
  }
  let now = 0, delta = 16.67, width = 900, height = 400, scale = 1, resizes = 0
  const listeners = new Map()
  const oldPerformance = globalThis.performance, oldWindow = globalThis.window, oldDocument = globalThis.document
  globalThis.performance = { now: () => now }
  globalThis.window = { devicePixelRatio: 2 }
  globalThis.document = { hidden: false, addEventListener(n,fn) { listeners.set(n,fn) }, removeEventListener(n,fn) { if (listeners.get(n)===fn) listeners.delete(n) } }
  const engine = {
    getHardwareScalingLevel: () => scale,
    setHardwareScalingLevel(s) { scale = s; this.resize() },
    resize() { resizes++ }, getRenderWidth: () => Math.floor(width/scale), getRenderHeight: () => Math.floor(height/scale), getDeltaTime: () => delta,
    onEndFrameObservable: observable(), onDisposeObservable: observable(),
  }
  try {
    const owner = createResolutionOwner(engine, { getBoundingClientRect: () => ({ width, height }) })
    check('one drawing-buffer resize initially; duplicate viewport events are no-ops', () => {
      owner.resize(); assert.equal(resizes,1)
      owner.resize(); owner.resize(); assert.equal(resizes,1)
      width=1000; owner.resize(); assert.equal(resizes,2)
    })
    check('completed sample windows are independent and recovery is not contaminated', () => {
      delta=22; for(let i=0;i<460;i++) { now+=delta; engine.onEndFrameObservable.emit() }
      assert.ok(window.__DROPiRenderQuality.overloaded)
      delta=16.67; for(let i=0;i<260;i++) { now+=delta; engine.onEndFrameObservable.emit() }
      assert.ok(window.__DROPiRenderQuality.meanMs < 17)
      assert.equal(window.__DROPiRenderQuality.overloaded,false)
    })
    check('hide/resume clears evidence and does not count a suspension as a slow frame', () => {
      document.hidden=true; listeners.get('visibilitychange')()
      assert.equal(window.__DROPiRenderQuality.sampleCount,0)
      now+=60000; document.hidden=false; listeners.get('visibilitychange')()
      delta=60000; engine.onEndFrameObservable.emit()
      delta=16.67; for(let i=0;i<130;i++) { now+=delta; engine.onEndFrameObservable.emit() }
      assert.ok(window.__DROPiRenderQuality.worstMs < 17)
      assert.equal(window.__DROPiRenderQuality.physicalDeviceAcceptance,'UNKNOWN')
    })
    check('owner disposal unregisters frame and visibility callbacks', () => {
      engine.onDisposeObservable.emit(); assert.equal(engine.onEndFrameObservable.size,0); assert.equal(listeners.size,0)
    })
  } finally {
    globalThis.performance=oldPerformance; globalThis.window=oldWindow; globalThis.document=oldDocument
  }
  // Test the actual production probe class, not a rewritten optimized algorithm.
  // Math/mesh test doubles isolate transform query counts and numeric equivalence;
  // existing native-asset/IK/rendered suites remain mandatory in the full build.
  const contact = await readFile('src/humanContactPose.ts', 'utf8')
  const probeText = contact.slice(contact.indexOf('export class SkinFeetProbe'), contact.indexOf('/** A stale support lock'))
  const probeJs = ts.transpileModule(probeText.replace('export class', 'class'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText
  let vectorAllocations=0
  class V3 {
    constructor(x=0,y=0,z=0) { this.set(x,y,z); vectorAllocations++ }
    set(x,y,z) { this.x=x; this.y=y; this.z=z; return this }
    static Zero() { return new V3() }
    static TransformCoordinatesToRef(v,m,r) {
      const x=v.x, y=v.y, z=v.z, w=x*m[3]+y*m[7]+z*m[11]+m[15]
      r.set((x*m[0]+y*m[4]+z*m[8]+m[12])/w,(x*m[1]+y*m[5]+z*m[9]+m[13])/w,(x*m[2]+y*m[6]+z*m[10]+m[14])/w)
    }
  }
  const Probe = new Function('Vector3','VertexBuffer',`${probeJs}; return SkinFeetProbe`)(V3,{PositionKind:'p',MatricesIndicesKind:'i',MatricesWeightsKind:'w'})
  const transform = (angle,tx,ty,tz,mirror=1) => [Math.cos(angle),0,-Math.sin(angle),0,0,1,0,0,Math.sin(angle)*mirror,0,Math.cos(angle)*mirror,0,tx,ty,tz,1]
  let prepares=0, worldQueries=0, computes=0
  let boneMatrices = [0,1,2,3].flatMap(i => transform(i*.1,0,i*.01,0))
  const skeleton = { bones: [0,1,2,3].map(i=>({getIndex:()=>i,name:`Foot.${i%2 ? 'R':'L'}`})), prepare() { prepares++ }, getTransformMatrices:()=>boneMatrices }
  const meshes = [0,1].map(part => {
    const p=[],i=[],w=[]
    for(let v=0;v<256;v++) {
      p.push(Math.sin(v)*.2,Math.cos(v*.3)*.03,Math.sin(v*.2)*.3)
      i.push(0,1,2,3)
      w.push(...(v%2 ? [.05,.55,.1,.3] : [.55,.05,.3,.1]))
    }
    return { name:`shoe-${part}`, skeleton, numBoneInfluencers:4, data:{p,i,w}, matrix:transform(.2,part*.4,0,0), getVerticesData(k) { return this.data[k] }, computeWorldMatrix() { computes++; return this.matrix }, getWorldMatrix() { worldQueries++; return this.matrix } }
  })
  const probe = new Probe(meshes)
  const legacyRead = surface => {
    let left=Infinity,right=Infinity,vertices=0
    // Independent baseline formula from the pre-change production read().
    for(const {mesh,positions,indices,weights,sides} of probe.data) for(let v=0;v<positions.length/3;v++) {
      const a=[0,0,0], p=positions.slice(v*3,v*3+3), m=boneMatrices
      for(let k=0;k<4;k++) for(let c=0;c<3;c++) a[c]+=weights[v*4+k]*(p[0]*m[indices[v*4+k]*16+c]+p[1]*m[indices[v*4+k]*16+4+c]+p[2]*m[indices[v*4+k]*16+8+c]+m[indices[v*4+k]*16+12+c])
      const world=new V3(); V3.TransformCoordinatesToRef(new V3(...a),mesh.getWorldMatrix(),world)
      const clearance=world.y-surface(world.x,world.z)
      if(sides[v]===-1) left=Math.min(left,clearance); else right=Math.min(right,clearance)
      vertices++
    }
    return {left,right,vertices}
  }
  check('shoe probe preserves every vertex and exact clearance across 60 moving/reflected poses', () => {
    for(let f=0;f<60;f++) {
      boneMatrices=[0,1,2,3].flatMap(i=>transform(f*.013+i*.11,0,Math.sin(f+i)*.06,0))
      meshes.forEach((mesh,i)=>{mesh.matrix=transform(f*.07,i*.4,.1,Math.sin(f*.1),f%2 ? -1:1)})
      const surface=(x,z)=>x>.03 && z>-.1 ? .16 : .02
      const expected=legacyRead(surface), actual=probe.read(surface)
      assert.deepEqual(actual,expected); assert.equal(actual.vertices,512)
    }
  })
  check('one matrix snapshot per shoe, one prepare per shared skeleton, no per-vertex world query/allocation', () => {
    computes=0; prepares=0; worldQueries=0; vectorAllocations=0
    for(let n=0;n<20;n++) probe.read(()=>0)
    assert.equal(computes,40); assert.equal(prepares,20)
    assert.equal(worldQueries,0); assert.equal(vectorAllocations,0)
  })
  check('unsupported/missing skin and non-finite contact remain explicit failures', () => {
    assert.throws(()=>new Probe([]))
    assert.throws(()=>new Probe([{...meshes[0],numBoneInfluencers:8}]))
    assert.throws(()=>probe.read(()=>NaN))
  })
  console.log(`Mobile performance regression: ${passed} PASS. Logic/lifecycle evidence only; physical Android FPS UNKNOWN.`)
} finally { await rm(dir,{recursive:true,force:true}) }
