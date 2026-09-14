import assert from 'node:assert/strict'
import { readFile, writeFile, unlink } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import path from 'node:path'
import ts from 'typescript'

const generated=[]
const load=async name=>{
  const file=path.resolve(`.frame-safety-${name}-${process.pid}.mjs`)
  let code=ts.transpileModule(await readFile(`src/${name}.ts`,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText
  code=code.replace(/(['"])(@babylonjs\/core\/[^'"]+)\1/g,(_,q,s)=>`${q}${s.endsWith('.js')?s:s+'.js'}${q}`)
  await writeFile(file,code);generated.push(file);return import(pathToFileURL(file).href)
}
let passed=0
const check=(name,test)=>{test();passed++;console.log(`PASS ${name}`)}
try {
  const {movementSteps,planarSpeed,nextWalkState,HERO_WALK_SPEED_MPS}=await load('authoredWalk')
  const {frameBudget,nextResolution}=await load('renderResolution')
  const {cameraBoxEntry}=await load('cameraOcclusion')
  check('visible long frames preserve measured movement rather than false Idle',()=>{
    for(const seconds of [.016,.05,.12,.3,.8,1.2,1.8]) {
      const steps=movementSteps(seconds)
      assert.ok(steps.length>=1&&steps.length<=5);assert.ok(steps.every(dt=>dt>0&&dt<=.050001))
      const total=steps.reduce((sum,dt)=>sum+dt,0)
      assert.ok(total<=.250001&&total<=seconds+.000001)
      const speed=planarSpeed(0,total*HERO_WALK_SPEED_MPS,seconds)
      assert.ok(speed>0&&speed<=HERO_WALK_SPEED_MPS+.000001)
      assert.equal(nextWalkState({moving:false,weight:0,ratio:0},speed,seconds).moving,true)
    }
  })
  check('suspension and long resume gaps cannot produce catch-up teleport',()=>{
    for(const seconds of [NaN,Infinity,-1,0,2.1,10])assert.deepEqual(movementSteps(seconds),[])
    assert.deepEqual(movementSteps(.5,true),[])
    assert.equal(planarSpeed(0,0,.8),0);assert.equal(planarSpeed(15,0,.8),0);assert.equal(planarSpeed(1,0,5),0)
  })
  check('a slow walk reports actual elapsed velocity, not requested speed',()=>{
    const speed=planarSpeed(0,.1,.8);assert.equal(speed,.125)
    const state=nextWalkState({moving:false,weight:0,ratio:0},speed,.8)
    assert.ok(state.ratio>0&&state.ratio<.1)
  })
  check('integrated camera slab detects intervening walls and handles parallel rays',()=>{
    const box={id:'wall',min:{x:-2,y:0,z:2},max:{x:2,y:3,z:4}}
    assert.equal(cameraBoxEntry({x:0,y:1,z:0},{x:0,y:0,z:1},10,box,0),2)
    assert.equal(cameraBoxEntry({x:0,y:1,z:0},{x:0,y:0,z:1},1,box,0),null)
    assert.equal(cameraBoxEntry({x:4,y:1,z:0},{x:0,y:0,z:1},10,box,0),null)
    assert.equal(cameraBoxEntry({x:0,y:1,z:3},{x:0,y:0,z:1},10,box,0),0)
    assert.equal(cameraBoxEntry({x:0,y:1,z:10},{x:0,y:0,z:-1},10,box,0),6)
    assert.throws(()=>cameraBoxEntry({x:NaN,y:0,z:0},{x:0,y:0,z:1},10,box,0))
  })
  check('one-FPS visible frames are reported as overload instead of discarded',()=>{
    const budget=frameBudget([1000,1100,900,1000]);assert.equal(budget.meanMs,1000);assert.equal(budget.p95Ms,1100)
    const state=nextResolution({density:1.25,lastChange:0,overloaded:false},budget.meanMs,budget.p95Ms,7)
    assert.equal(state.overloaded,true);assert.ok(state.density<1.25&&state.density>=.95);assert.equal(frameBudget([16,17]),null)
  })
  check('resolution retains its clarity floor under persistent stalls',()=>{
    let state={density:1.25,lastChange:0,overloaded:false}
    for(let i=1;i<=30;i++)state=nextResolution(state,1000,1200,i*7)
    assert.ok(state.density>=.95);assert.ok(state.overloaded)
  })
  const controls=await readFile('src/naturalControlsV2.ts','utf8')
  check('bounded substeps and actual velocity are wired into touch controls',()=>{
    assert.match(controls,/movementSteps\(seconds, document\.hidden\)/)
    assert.match(controls,/for \(const dt of steps\)/);assert.match(controls,/measuredSpeed = planarSpeed/)
    assert.doesNotMatch(controls,/rawFrameMs < 250/)
  })
  console.log(`Frame and camera safety: ${passed} PASS. Math/wiring evidence, not Android acceptance.`)
} finally {await Promise.all(generated.map(file=>unlink(file)))}
