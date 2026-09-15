import assert from 'node:assert/strict'
import { readFile, writeFile, unlink } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { pathToFileURL } from 'node:url'
import path from 'node:path'
import ts from 'typescript'
import { NullEngine, Scene, Mesh, VertexData, Vector3, Ray } from '@babylonjs/core'
import { materialFields, MATERIAL_FAMILIES, png } from './setupQualityMaterials.mjs'
const transpile=async file=>ts.transpileModule(await readFile(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText
const loadPure=async file=>import(`data:text/javascript;base64,${Buffer.from(await transpile(file)).toString('base64')}`)
const {compileArchitecture}=await loadPure('src/architectureMesh.ts')
const {resolutionPlan,HD_PIXEL_LIMIT,createResolutionOwner}=await loadPure('src/renderResolution.ts')
let count=0
const check=(name,fn)=>{fn();count++;console.log(`PASS ${name}`)}
const hash=bytes=>createHash('sha256').update(bytes).digest('hex')
const recipe={width:18,depth:12,height:14,bevel:.14,roof:'hip'}
const geometry=compileArchitecture(recipe)
check('architectural profiles contain actual roof slopes, three perforated facades and bounded mesh work',()=>{
 assert.ok(geometry.windowCount>=30);assert.ok(geometry.eaves<recipe.height)
 let vertices=0
 for(const data of [geometry.walls,geometry.glazing,geometry.reveals,geometry.roof]){
  assert.equal(data.positions.length/3,data.normals.length/3);assert.equal(data.uvs.length/2,data.positions.length/3)
  assert.ok(data.positions.every(Number.isFinite)&&data.uvs.every(Number.isFinite));vertices+=data.positions.length/3
  assert.ok(data.indices.every(i=>Number.isInteger(i)&&i>=0&&i<data.positions.length/3))
  for(let i=0;i<data.positions.length;i+=3){assert.ok(Math.abs(data.positions[i])<=9+.001);assert.ok(Math.abs(data.positions[i+2])<=6+.001);assert.ok(data.positions[i+1]>=0&&data.positions[i+1]<=14.31)}
 }
 assert.ok(vertices<8000);assert.ok(geometry.roof.normals.some((n,i)=>i%3===1&&n>0&&n<.99))
})
check('two different local styles produce reproducible geometry without city names',()=>{
 assert.deepEqual(compileArchitecture(recipe),geometry)
 const other=compileArchitecture({...recipe,width:12,depth:16,height:18,roof:'mansard'})
 assert.notDeepEqual(other.roof,geometry.roof);assert.ok(other.windowCount>0)
})
check('invalid and unbounded style inputs fail before allocating presentation geometry',()=>{
 for(const bad of [NaN,Infinity,0,-3,1000])assert.throws(()=>compileArchitecture({...recipe,width:bad}))
 assert.throws(()=>compileArchitecture({...recipe,roof:'UNKNOWN'}));assert.throws(()=>compileArchitecture({...recipe,bevel:2}))
 for(const height of [5,8,9,14,16,25,60])assert.ok(compileArchitecture({...recipe,height}).eaves<height)
})
const engine=new NullEngine(),scene=new Scene(engine)
try{
 const create=(name,data)=>{const mesh=new Mesh(name,scene),v=new VertexData();Object.assign(v,data);v.applyToMesh(mesh);mesh.computeWorldMatrix(true);return mesh}
 const wall=create('wall',geometry.walls),glass=create('glass',geometry.glazing)
 check('actual rendered-side window opening intersects recessed glazing, not an opaque box',()=>{
  const span=12-2*.14,columns=Math.floor((span-1)/3.1),z=-span/2+span/columns*.5
  const ray=new Ray(new Vector3(10,2.1,z),new Vector3(-1,0,0),2)
  assert.equal(wall.intersects(ray,false).hit,false)
  const hit=glass.intersects(ray,false);assert.equal(hit.hit,true);assert.ok(Math.abs(hit.distance-1.16)<.002)
 })
 check('wall strip between windows is still opaque',()=>{
  assert.equal(wall.intersects(new Ray(new Vector3(10,.5,0),new Vector3(-1,0,0),2),false).hit,true)
 })
}finally{scene.dispose();engine.dispose()}
for(const family of MATERIAL_FAMILIES)check(`${family}: reproducible color/normal/roughness and valid PNG`,()=>{
 const a=materialFields(family,256),b=materialFields(family,256)
 for(const kind of ['color','normal','orm']){assert.equal(a[kind].length,256*256*4);assert.equal(hash(a[kind]),hash(b[kind]));assert.ok(a[kind].every(Number.isFinite));const bytes=png(a[kind],256);assert.equal(bytes.readUInt32BE(16),256);assert.equal(bytes.readUInt32BE(20),256)}
 assert.ok(new Set(a.color).size>10);assert.ok(a.normal.some((v,i)=>i%4===0&&v!==128))
})
check('material families cannot silently fall back to another locality or arbitrary resolution',()=>{assert.throws(()=>materialFields('UNKNOWN'));assert.throws(()=>materialFields('brick',8192))})
check('HD supplies real bounded additional pixels, not a CSS upscaling claim',()=>{
 const hd=resolutionPlan(960,432,2.25,2.25,HD_PIXEL_LIMIT),old=resolutionPlan(960,432,2.25,.95)
 assert.ok(hd.width*hd.height<=HD_PIXEL_LIMIT);assert.ok(hd.width*hd.height>old.width*old.height*4)
 assert.ok(hd.width>2000);assert.equal(resolutionPlan(800,400,1,2.25,HD_PIXEL_LIMIT).density,1)
 assert.ok(resolutionPlan(8000,5000,8,2.25,HD_PIXEL_LIMIT).width*resolutionPlan(8000,5000,8,2.25,HD_PIXEL_LIMIT).height<=HD_PIXEL_LIMIT)
 assert.throws(()=>resolutionPlan(800,400,2,2,NaN))
})
// Explicit HD selection must keep its pixel count under overload and switch only
// when the player selects BALANCED. Every actual buffer change remains begin-frame-only.
const old={window:globalThis.window,document:globalThis.document,performance:globalThis.performance}
const observable=()=>{const callbacks=new Set();return{add:f=>(callbacks.add(f),f),addOnce:f=>(callbacks.add(f),f),remove:f=>callbacks.delete(f),notify:()=>callbacks.forEach(f=>f())}}
let now=0,delta=0,phase='',resizes=0
const begin=observable(),end=observable(),dispose=observable()
try{
 globalThis.window={devicePixelRatio:2.25};globalThis.document={hidden:false,addEventListener(){},removeEventListener(){}}
 Object.defineProperty(globalThis,'performance',{configurable:true,value:{now:()=>now}})
 const engine={onBeginFrameObservable:begin,onEndFrameObservable:end,onDisposeObservable:dispose,getDeltaTime:()=>delta,getRenderWidth:()=>2100,getRenderHeight:()=>950,setHardwareScalingLevel(){assert.equal(phase,'BEGIN')},resize(){assert.equal(phase,'BEGIN');resizes++}}
 const owner=createResolutionOwner(engine,{getBoundingClientRect:()=>({width:960,height:432})},'HD')
 const frame=ms=>{delta=ms;now+=ms;phase='BEGIN';begin.notify();phase='RENDER';phase='END';end.notify();phase='OUTSIDE'}
 owner.resize();frame(16)
 check('HD does not silently downsample slow recorded frames or claim performance acceptance',()=>{
  const before=resizes;for(let i=0;i<25;i++)frame(400)
  assert.equal(resizes,before);assert.equal(window.__DROPiRenderQuality.graphicsMode,'HD');assert.equal(window.__DROPiRenderQuality.overloaded,true)
  assert.ok(window.__DROPiRenderQuality.actualWidth>2000);assert.equal(window.__DROPiRenderQuality.physicalDeviceAcceptance,'UNKNOWN')
 })
 check('mode switch queues one begin-frame resize and retains the original adaptive path',()=>{
  const before=resizes;owner.setMode('BALANCED');assert.equal(resizes,before);frame(16);assert.equal(resizes,before+1)
  assert.equal(window.__DROPiRenderQuality.graphicsMode,'BALANCED');assert.throws(()=>owner.setMode('ULTRA_UNBOUNDED'))
  owner.setMode('HD');assert.equal(resizes,before+1);frame(16);assert.equal(resizes,before+2)
 })
 check('disposed graphics owner cannot be controlled through a stale global',()=>{dispose.notify();assert.equal(window.__DROPiGraphicsControl,undefined);const n=resizes;owner.resize();frame(16);assert.equal(resizes,n)})
}finally{globalThis.window=old.window;globalThis.document=old.document;Object.defineProperty(globalThis,'performance',{configurable:true,value:old.performance})}
console.log(`World quality: ${count} PASS. Geometry/material/policy evidence only, not physical Android or visual acceptance.`)
