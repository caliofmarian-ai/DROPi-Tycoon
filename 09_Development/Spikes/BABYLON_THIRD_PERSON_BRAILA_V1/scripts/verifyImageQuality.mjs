import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import ts from 'typescript'
const temp = mkdtempSync(path.join(process.cwd(), '.verify-image-quality-'))
let checks = 0
const check = (name, fn) => { fn(); checks++; console.log(`PASS ${name}`) }
const compile = name => {
  const input = readFileSync(new URL(`../src/${name}.ts`, import.meta.url), 'utf8')
  const output = ts.transpileModule(input, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText
    .replaceAll("'./imageQualityGeometry'", "'./imageQualityGeometry.mjs'")
    .replaceAll("'@babylonjs/core/Materials/Textures/rawTexture'", "'@babylonjs/core/Materials/Textures/rawTexture.js'")
  const target = path.join(temp, `${name}.mjs`); writeFileSync(target, output); return pathToFileURL(target).href
}
try {
  const { bevelledEnvelope, roofEnvelope, materialPixels } = await import(compile('imageQualityGeometry'))
  check('bevelled envelope remains inside authoritative bounds', () => {
    const g = bevelledEnvelope(18,12,14,.16)
    assert.ok(g.positions.length > 72)
    for (let i=0;i<g.positions.length;i+=3) { assert.ok(Math.abs(g.positions[i])<=9); assert.ok(g.positions[i+1]>=0 && g.positions[i+1]<=14); assert.ok(Math.abs(g.positions[i+2])<=6) }
    assert.deepEqual(g,bevelledEnvelope(18,12,14,.16))
  })
  check('all faces have nonzero area and outward normals', () => {
    const g=bevelledEnvelope(18,12,14,.16)
    for (let i=0;i<g.indices.length;i+=3) {
      const p=g.indices.slice(i,i+3).map(n=>g.positions.slice(n*3,n*3+3))
      const a=p[1].map((v,j)=>v-p[0][j]), b=p[2].map((v,j)=>v-p[0][j])
      const n=[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]
      assert.ok(Math.hypot(...n)>1e-7)
      const c=[0,1,2].map(j=>(p[0][j]+p[1][j]+p[2][j])/3-(j===1?7:0))
      assert.ok(n.reduce((s,v,j)=>s+v*c[j],0)>0)
    }
  })
  check('two explicit roof families vary using one compiler', () => {
    const a=roofEnvelope(18,12,2,'hip'), b=roofEnvelope(18,12,2,'gable')
    assert.notDeepEqual(a.positions,b.positions)
    for (const g of [a,b]) { assert.equal(g.uvs.length,g.positions.length/3*2); assert.ok(g.indices.every(i=>i>=0 && i<g.positions.length/3)); assert.ok(g.indices.length/3<30) }
  })
  check('malformed or unbounded dimensions fail closed', () => {
    for (const args of [[NaN,12,14,.16],[18,12,14,9],[0,12,14,.16],[1000,12,14,.16]]) assert.throws(()=>bevelledEnvelope(...args))
    assert.throws(()=>roofEnvelope(18,12,2,'unknown')); assert.throws(()=>roofEnvelope(18,12,20,'hip'))
  })
  check('all authored maps are deterministic opaque and bounded', () => {
    for (const f of ['plaster','stone','roof']) {
      const a=materialPixels(256,f,720), b=materialPixels(256,f,720)
      assert.deepEqual(a,b)
      for (const t of Object.values(a)) { assert.equal(t.length,256*256*4); for(let i=3;i<t.length;i+=4)assert.equal(t[i],255) }
      assert.ok(new Set(a.color).size>8)
      for(let i=0;i<a.normal.length;i+=4)assert.ok(a.normal[i+2]>=128)
    }
  })
  check('material families differ and invalid allocation is rejected', () => {
    assert.notDeepEqual(materialPixels(256,'plaster',720).normal,materialPixels(256,'roof',720).normal)
    for(const s of [0,33,2048,NaN])assert.throws(()=>materialPixels(s,'plaster',720))
    assert.throws(()=>materialPixels(256,'unknown',720))
  })
  const { resolutionPlan, nextResolution } = await import(compile('renderResolution'))
  check('clarity mode renders more real pixels without exceeding native DPR or 1080p budget',()=>{
    const old=resolutionPlan(800,360,2,.95), sharp=resolutionPlan(800,360,2,2,2_073_600)
    assert.equal(sharp.width,1600);assert.equal(sharp.height,720);assert.ok(sharp.width*sharp.height>old.width*old.height*4)
    for(const [w,h,d]of [[3840,2160,3],[1600,720,2],[800,360,1]]){const p=resolutionPlan(w,h,d,2,2_073_600);assert.ok(p.width*p.height<=2_073_600);assert.ok(p.density<=d)}
  })
  check('clarity floor retains slow-frame warnings and never claims speed improvement',()=>{
    const range={min:1.5,max:2}, state={density:1.5,lastChange:0,overloaded:false}
    assert.deepEqual(nextResolution(state,100,150,100,range),{...state,overloaded:true})
    assert.equal(nextResolution({...state,density:2},14,16,100,range).density,2)
  })
  if (!process.argv.includes('--pure-only')) {
    const { NullEngine,Scene,MeshBuilder,StandardMaterial } = await import('@babylonjs/core')
    const { installImageQuality } = await import(compile('imageQualityPresentation'))
    const engine=new NullEngine(),scene=new Scene(engine),m=new StandardMaterial('source',scene)
    const source=MeshBuilder.CreateBox('synthetic-locality', {width:18,height:14,depth:12},scene);source.position.y=7;source.material=m;source.checkCollisions=true
    const roof=MeshBuilder.CreateBox('synthetic-roof',{width:18.3,height:.35,depth:12.3},scene);roof.position.y=14.17;roof.material=m
    const binding={id:'test-only/quality',buildings:[{source,roof,color:'#c9b89e',roofColor:'#84624e',roofRise:2,roofShape:'hip',family:'plaster'}],exposure:1,contrast:1.03}
    const before={meshes:scene.meshes.length,materials:scene.materials.length,textures:scene.textures.length,vertices:[...source.getVerticesData('position')],config:{toneMappingEnabled:scene.imageProcessingConfiguration.toneMappingEnabled,toneMappingType:scene.imageProcessingConfiguration.toneMappingType,exposure:scene.imageProcessingConfiguration.exposure,contrast:scene.imageProcessingConfiguration.contrast}}
    let handle
    check('actual PBR installation does not mutate collider or source geometry',()=>{
      handle=installImageQuality(scene,binding);assert.equal(handle.replacedBuildings,1);assert.equal(handle.textures,6);assert.equal(source.isVisible,false);assert.equal(source.isEnabled(),true);assert.equal(source.checkCollisions,true);assert.equal(source.material,m);assert.deepEqual([...source.getVerticesData('position')],before.vertices)
      assert.ok(scene.meshes.filter(x=>x.metadata?.dropiImageQuality).every(x=>!x.checkCollisions&&!x.isPickable))
    })
    check('same scene is idempotent and palette change needs disposal',()=>{assert.equal(installImageQuality(scene,binding),handle);assert.throws(()=>installImageQuality(scene,{...binding,id:'other'}))})
    check('disposal restores sources and color processing without leaks',()=>{
      handle.dispose();handle.dispose();assert.equal(source.isVisible,true);assert.equal(roof.isVisible,true);assert.equal(scene.meshes.length,before.meshes);assert.equal(scene.materials.length,before.materials);assert.equal(scene.textures.length,before.textures)
      for(const [k,v]of Object.entries(before.config))assert.equal(scene.imageProcessingConfiguration[k],v)
    })
    check('duplicate and missing bindings fail before presentation mutation',()=>{
      assert.throws(()=>installImageQuality(scene,{...binding,buildings:[binding.buildings[0],binding.buildings[0]]}));assert.equal(source.isVisible,true)
      assert.throws(()=>installImageQuality(scene,{...binding,buildings:[]}));assert.equal(scene.meshes.length,before.meshes)
    })
    check('fresh install and scene-owned cleanup work',()=>{installImageQuality(scene,binding);scene.dispose();assert.throws(()=>installImageQuality(scene,binding));engine.dispose()})
  }
  console.log(`Image quality: ${checks} checks PASS; physical quality/performance UNKNOWN`)
} finally {rmSync(temp,{recursive:true,force:true})}
