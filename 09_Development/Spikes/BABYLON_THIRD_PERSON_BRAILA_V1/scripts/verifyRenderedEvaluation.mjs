import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { readFile, writeFile, mkdir, mkdtemp, readdir, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { spawn } from 'node:child_process'

// Actual bundled renderer, software WebGL only. Never Android/FPS acceptance.
const chromePath=[process.env.CHROME_BIN,'/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser'].find(p=>p&&existsSync(p))
if(!chromePath)throw new Error('Rendered gate requires runner Chromium')
const dist=path.resolve('dist'),evidenceDir=path.join(dist,'evidence')
await mkdir(evidenceDir,{recursive:true})
const profile=await mkdtemp(path.join(tmpdir(),'dropi-browser-'))
const evidence={classification:'DESKTOP_SOFTWARE_WEBGL_REGRESSION_NOT_ANDROID_ACCEPTANCE',sourceSha:process.env.VITE_COMMIT_SHA??process.env.GITHUB_SHA??'LOCAL',browser:chromePath,status:'RUNNING',frames:[],errors:[],tests:[]}
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.gltf':'model/gltf+json','.glb':'model/gltf-binary'}
const server=createServer(async(req,res)=>{
  try{
    const p=decodeURIComponent(new URL(req.url??'/','http://localhost').pathname),file=path.resolve(dist,`.${p==='/'?'/index.html':p}`)
    if(!file.startsWith(`${dist}${path.sep}`)){res.writeHead(403).end();return}
    const bytes=await readFile(file)
    res.writeHead(200,{'Content-Type':mime[path.extname(file)]??'application/octet-stream','Cache-Control':'no-store'}).end(bytes)
  }catch{res.writeHead(404).end()}
})
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve))
const url=`http://127.0.0.1:${server.address().port}`
let stderr=''
const browser=spawn(chromePath,['--headless=new','--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'],{stdio:['ignore','ignore','pipe']})
browser.stderr.on('data',data=>{stderr=`${stderr}${data}`.slice(-8000)})
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms))
let socket,sequence=0
const pending=new Map()
const send=(method,params={})=>new Promise((resolve,reject)=>{
  const id=++sequence,timeout=setTimeout(()=>{pending.delete(id);reject(new Error(`CDP timeout ${method}`))},30000)
  pending.set(id,{resolve:r=>{clearTimeout(timeout);resolve(r)},reject:e=>{clearTimeout(timeout);reject(e)}})
  socket.send(JSON.stringify({id,method,params}))
})
const evaluate=async expression=>{
  const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true})
  if(r.exceptionDetails)throw new Error(r.exceptionDetails.exception?.description??r.exceptionDetails.text)
  return r.result?.value
}
const snapshot=()=>evaluate(`(()=>({ready:window.__DROPiEvaluationReadiness,contact:window.__DROPiContactRuntime,hero:window.__DROPiRiggedHeroV1,humans:window.__DROPiHumanoidPedestrians,resolution:window.__DROPiRenderQuality,camera:window.__DROPiCameraAuthorityV3?.getState(),surfaces:window.__DROPiSurfaceFinish,cityVisuals:window.__DROPiCityVisualRecipe,streetLife:window.__DROPiAuthoredStreetLifeV1,blocks:window.__DROPiAuthoredBlocksV1,streets:window.__DROPiAuthoredStreetLayerV1,rendererFailure:window.__DROPiBabylonSpikeFailure,buildSha:window.__DROPiBabylonSpike?.buildSha,phase:window.__DROPiBabylonSpike?.getPhase(),position:globalThis.__dropiTestScene?(()=>{const p=__dropiTestScene.getTransformNodeByName('hero').position;return{x:p.x,y:p.y,z:p.z}})():null}))()`)
const fresh=(c,after)=>Number.isInteger(c?.sampleId)&&c.sampleId>after&&c.renderedSampleId===c.sampleId
assert.equal(fresh({sampleId:4,renderedSampleId:4},4),false);assert.equal(fresh({sampleId:5,renderedSampleId:4},4),false);assert.equal(fresh({sampleId:5,renderedSampleId:5},4),true);assert.equal(fresh({sampleId:NaN,renderedSampleId:NaN},4),false)
evidence.tests.push('repeated/unfinished/missing pose samples rejected')
const healthy=s=>{
  assert.equal(evidence.errors.length,0,'Uncaught browser exceptions')
  if(s.rendererFailure||s.ready?.status==='FAIL'||s.cityVisuals?.status==='FAIL'||s.contact?.status==='FAIL'||s.contact?.error||s.contact?.mechanicalStatus==='FAIL'||s.camera?.occlusion==='FAIL')throw new Error(`Runtime failure: ${JSON.stringify(s)}`)
}
const waitForPose=async(label,predicate,after=-1,timeoutMs=30000)=>{
  const deadline=Date.now()+timeoutMs;let last,observed=after,matching=0
  while(Date.now()<deadline){last=await snapshot();healthy(last);if(fresh(last.contact,observed)){observed=last.contact.sampleId;matching=predicate(last)?matching+1:0;if(matching>=2)return last}await wait(100)}
  throw new Error(`${label}: no two matching completed pose frames: ${JSON.stringify(last)}`)
}
// Detect a blank central 3D area without confusing HUD text with rendered city pixels.
// PNG decoding happens on an unattached canvas and never edits/recenters the game scene.
const capturedPixels=png=>evaluate(`(async()=>{const image=new Image();image.src=${JSON.stringify('data:image/png;base64,')}+${JSON.stringify(png)};await image.decode();const c=document.createElement('canvas');c.width=image.width;c.height=image.height;const g=c.getContext('2d');g.drawImage(image,0,0);const x=Math.floor(c.width*.35),y=Math.floor(c.height*.4),w=Math.floor(c.width*.35),h=Math.floor(c.height*.3),d=g.getImageData(x,y,w,h).data,colors=new Set();for(let i=0;i<d.length;i+=16)colors.add((d[i]>>3)*1024+(d[i+1]>>3)*32+(d[i+2]>>3));return{region:[.35,.4,.35,.3],quantizedColors:colors.size,nonblank:colors.size>=16}})()`)
const frame=async(name,note)=>{
  const before=await snapshot(),image=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false}),state=await snapshot()
  await writeFile(path.join(evidenceDir,`${name}.png`),Buffer.from(image.data,'base64'))
  const entry={name,note,sampleRange:[before.contact?.renderedSampleId,state.contact?.renderedSampleId],state}
  evidence.frames.push(entry)
  entry.pixels=await capturedPixels(image.data)
  return state
}
try{
  let port
  for(let i=0;i<100;i++){try{port=Number((await readFile(path.join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0]);break}catch{await wait(100)}}
  if(!port)throw new Error(`Browser did not start: ${stderr}`)
  const targets=await(await fetch(`http://127.0.0.1:${port}/json/list`)).json(),page=targets.find(t=>t.type==='page')
  if(!page?.webSocketDebuggerUrl)throw new Error('No inspectable page')
  socket=new WebSocket(page.webSocketDebuggerUrl)
  await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true})})
  socket.addEventListener('message',event=>{
    const m=JSON.parse(event.data)
    if(m.id){const task=pending.get(m.id);if(!task)return;pending.delete(m.id);if(m.error)task.reject(new Error(JSON.stringify(m.error)));else task.resolve(m.result)}else if(m.method==='Runtime.exceptionThrown')evidence.errors.push(m.params.exceptionDetails)
  })
  await send('Page.enable');await send('Runtime.enable');await send('Emulation.setDeviceMetricsOverride',{width:960,height:432,deviceScaleFactor:2.25,mobile:true});await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});await send('Page.navigate',{url})
  let state=await waitForPose('complete startup',s=>s.ready?.status==='READY'&&s.contact?.status==='ACTIVE'&&s.cityVisuals?.status==='ACTIVE',-1,100000)
  evidence.tests.push('complete scene/8 pedestrians/materials/rendered contact/city recipe READY')
  state=await frame('01-city-start','Real compiled renderer at 960x432 CSS viewport; software WebGL only');healthy(state)
  const firstVisible=evidence.frames.at(-1).pixels.nonblank
  for(let attempt=2;!evidence.frames.at(-1).pixels.nonblank&&attempt<=3;attempt++){
    await waitForPose('unchanged initial view visible-pixel retry',s=>s.cityVisuals?.status==='ACTIVE',state.contact.sampleId)
    state=await frame(`01-city-start-attempt-${attempt}`,'Bounded unchanged initial view; no relocation/recenter/input; original frame retained')
  }
  evidence.tests.push({initialVisiblePixels:firstVisible,initialViewResult:firstVisible?'VISIBLE_FIRST_CAPTURE':'BLANK_FIRST_CAPTURE_RECHECKED',finalNonblank:evidence.frames.at(-1).pixels.nonblank})
  assert.equal(evidence.frames.at(-1).pixels.nonblank,true,'Initial 3D view remained blank across three preserved captures')
  assert.equal(state.cityVisuals.facades,3);assert.equal(state.cityVisuals.surfaces,7);assert.equal(state.cityVisuals.textures,2)
  assert.ok(state.cityVisuals.drawMeshes<=22&&state.cityVisuals.materials<=9,'City visual resource budget exceeded')
  evidence.tests.push({cityVisualRecipe:state.cityVisuals})
  assert.equal(state.humans.visibleHumans,8);assert.equal(state.streetLife.authoredVehicles,3);assert.equal(state.streets.loaded,true);assert.ok(state.resolution.actualWidth>=900&&state.resolution.actualHeight>=400,'Below clarity floor')
  const chunk=(await readdir(path.join(dist,'assets'))).find(n=>/^engineStore-.*\.js$/.test(n))
  if(!chunk)throw new Error('Missing engineStore inspection module')
  await evaluate(`(async()=>{const m=await import('/assets/${chunk}'),store=Object.values(m).find(v=>typeof v==='function'&&'LastCreatedScene'in v);if(!store?.LastCreatedScene)throw new Error('No scene');globalThis.__dropiTestScene=store.LastCreatedScene})()`)
  const assembly=await evaluate(`(()=>{const s=__dropiTestScene;return{cars:['car-1','car-2','car-3'].map(name=>({name,visibleParts:s.getTransformNodeByName(name).getChildMeshes(false).filter(m=>m.isEnabled()&&m.isVisible&&m.getTotalVertices()>0).map(m=>({name:m.name,material:m.material?.name}))})),ghostCount:s.meshes.filter(m=>m.isEnabled()&&m.isVisible&&(/^npc-\\d+$/.test(m.name)||m.name.startsWith('hero-motion-'))).length}})()`)
  for(const c of assembly.cars){assert.ok(c.visibleParts.some(p=>/wheel/i.test(p.name)),`${c.name}: wheels`);assert.ok(c.visibleParts.some(p=>/window/i.test(p.material)),`${c.name}: glass`)}assert.equal(assembly.ghostCount,0);evidence.tests.push({completeAssemblies:assembly})
  const moveTo=async(x,z)=>{
    const before=await snapshot()
    // Test relocation only, not walking evidence. Use the real recenter control
    // and wait for a clear, settled view instead of capturing an intervening wall.
    await evaluate(`(()=>{const h=__dropiTestScene.getTransformNodeByName('hero');h.position.x=${x};h.position.z=${z};h.rotation.y=0;document.getElementById('recenter').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}))})()`)
    return waitForPose('relocation/recenter/clear boom',s=>Math.hypot(s.position.x-x,s.position.z-z)<.01&&!s.camera.recentering&&s.camera.occlusion==='CLEAR'&&s.camera.radius>=3,before.contact.sampleId)
  }
  const interact=async(phase,carry)=>{const before=await snapshot();await evaluate(`document.getElementById('interact').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}))`);return waitForPose(`phase ${phase}/carry ${carry}`,s=>s.phase===phase&&s.contact.hero?.carry===carry,before.contact.sampleId)}
  await moveTo(29,8);await interact(1,false);await frame('02-hq','Existing HQ interaction after explicit recenter')
  await moveTo(-27,-19);await interact(2,true)
  const beforeFront=await snapshot();await evaluate(`__dropiTestScene.getTransformNodeByName('hero').rotation.y=Math.PI`)
  await waitForPose('front grip inspection',s=>s.contact.hero.carry===true&&s.camera.occlusion==='CLEAR',beforeFront.contact.sampleId)
  state=await frame('03-carry','Actual two-hand pose: subject turned in place for front-view inspection, meshes unmodified')
  healthy(state);assert.equal(state.contact.hero.carry,true);assert.ok(Number.isFinite(state.contact.hero.handErrorM)&&state.contact.hero.handErrorM<=.025,'Hand/socket gap');assert.ok(state.contact.hero.minFootClearanceM>=-.002,'Shoe penetration')
  evidence.tests.push('pickup: two-hand sockets <=25mm, no shoe penetration, clear camera')
  await moveTo(8,-3)
  const touchWalk=async(name,sx,sy)=>{
    const before=await snapshot(),pad=await evaluate(`(()=>{const r=document.querySelector('.dropi-joystick-base').getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2,r:Math.max(28,r.width*.34)}})()`)
    const expected=await evaluate(`(()=>{const c=__dropiTestScene.activeCamera,f=c.getTarget().subtract(c.position);f.y=0;f.normalize();return{x:f.z*${sx}-f.x*${sy},z:-f.x*${sx}-f.z*${sy}}})()`)
    try{
      await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:pad.x+sx*pad.r*.8,y:pad.y+sy*pad.r*.8,id:0}]})
      const moved=await waitForPose(name,s=>s.hero.measuredSpeed>.05&&s.hero.walkWeight>.8&&Math.hypot(s.position.x-before.position.x,s.position.z-before.position.z)>.05,before.contact.sampleId)
      const dx=moved.position.x-before.position.x,dz=moved.position.z-before.position.z
      assert.ok((dx*expected.x+dz*expected.z)/Math.hypot(dx,dz)>.7,`${name}: inverted direction`);assert.ok(moved.hero.measuredSpeed<=1.70,`${name}: excessive speed`);assert.equal(moved.hero.animation,'Walk_Loop');assert.equal(moved.contact.hero.carry,true);assert.ok(Number.isFinite(moved.contact.hero.handErrorM)&&moved.contact.hero.handErrorM<=.025,`${name}: hand gap`);assert.ok(moved.contact.hero.minFootClearanceM>=-.002,`${name}: shoe penetration`)
      evidence.tests.push({touchWalk:name,distance:Math.hypot(dx,dz),speed:moved.hero.measuredSpeed,handGapM:moved.contact.hero.handErrorM,footClearanceM:moved.contact.hero.minFootClearanceM})
    }finally{await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})}
    const end=await snapshot();return waitForPose(`${name} stop`,s=>s.hero.measuredSpeed<.02&&s.hero.walkWeight<.01,end.contact.sampleId)
  }
  for(const [name,x,y]of[['forward',0,-1],['right',1,0],['backward',0,1],['left',-1,0]])await touchWalk(name,x,y)
  await frame('04-walk-stop','Four real touch joystick directions with parcel, then stopped')
  await moveTo(34,-30);await interact(3,false);await frame('05-handoff','Mission handoff releases grip')
  await interact(0,false);state=await frame('06-restart','Restart releases parcel and retained hand grip');healthy(state);assert.equal(state.contact.hero.carry,false)
  evidence.tests.push('handoff/restart release carry after fresh completed poses');evidence.status='PASS'
  console.log('Rendered regression PASS: active city recipe, nonblank initial scene, wheels/glass/no ghosts, pickup/grip, four real touch directions/stops, handoff/restart. SOFTWARE WEBGL ONLY; NOT Android acceptance.')
}catch(error){evidence.status='FAIL';evidence.error=error instanceof Error?error.stack:String(error);if(socket?.readyState===WebSocket.OPEN){try{await frame('failure','Failure evidence, not accepted preview')}catch{}}console.error(JSON.stringify(evidence,null,2));throw error}
finally{await writeFile(path.join(evidenceDir,'verification.json'),`${JSON.stringify(evidence,null,2)}\n`);socket?.close();browser.kill('SIGTERM');server.close();await wait(250);await rm(profile,{recursive:true,force:true}).catch(()=>{})}
