import assert from 'node:assert/strict'
import { readFile,writeFile,mkdir,rm } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import ts from 'typescript'
import { NullEngine,Scene,SceneLoader,TransformNode,MeshBuilder,Vector3,Quaternion } from '@babylonjs/core'
import '@babylonjs/loaders/glTF/index.js'

const dir=path.resolve(`.contact-lifecycle-${process.pid}`)
await mkdir(dir,{recursive:true})
for(const name of ['authoredWalk','authoredPedestrians','contactKinematics','humanContactPose','presentationCoherenceFix']) {
  const code=ts.transpileModule(await readFile(`src/${name}.ts`,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText
    .replace(/(['"])@babylonjs\/loaders\/glTF\1/g,'$1@babylonjs/loaders/glTF/index.js$1')
    .replace(/(['"])(@babylonjs\/core\/[A-Za-z0-9_/.-]+)\1/g,(_,q,s)=>`${q}${s.endsWith('.js')?s:s+'.js'}${q}`)
    .replace(/(['"])\.\/([A-Za-z0-9]+)\1/g,'$1./$2.mjs$1')
  await writeFile(path.join(dir,`${name}.mjs`),code)
}
const load=name=>import(pathToFileURL(path.join(dir,`${name}.mjs`)).href)
const {tryFootPlant,HumanContactPose}=await load('humanContactPose')
const {createPedestrian}=await load('authoredPedestrians')
const {travelledHeading}=await load('presentationCoherenceFix')
const engine=new NullEngine(),scene=new Scene(engine)
let passed=0,poseCount=0,releases=0
const check=(name,test)=>{test();passed++;console.log(`PASS ${name}`)}
const near=(a,b,e=.00001)=>assert.ok(Math.abs(a-b)<e,`${a} != ${b}`)
const geometryOnly=bytes=>{
  const len=bytes.readUInt32LE(12),json=JSON.parse(bytes.subarray(20,20+len).toString().trim()),binLen=bytes.readUInt32LE(20+len)
  const bin=bytes.subarray(28+len,28+len+binLen)
  delete json.images;delete json.textures;delete json.samplers
  for(const m of json.materials??[]) {
    delete m.normalTexture;delete m.occlusionTexture;delete m.emissiveTexture
    if(m.pbrMetallicRoughness){delete m.pbrMetallicRoughness.baseColorTexture;delete m.pbrMetallicRoughness.metallicRoughnessTexture}
  }
  json.buffers[0].uri=`data:application/octet-stream;base64,${bin.toString('base64')}`
  return `data:${JSON.stringify(json)}`
}
try {
  check('relocation cannot rewrite hero yaw or redirect recenter behind a wall',()=>{
    assert.equal(travelledHeading(31,-12,.05),null)
    assert.equal(travelledHeading(0,0,.05),null)
    assert.equal(travelledHeading(.1,0,5),null)
    near(travelledHeading(0,.05,.05),0);near(travelledHeading(.05,0,.05),Math.PI/2)
    near(travelledHeading(0,-.05,.8),Math.PI)
  })
  for(const mirror of [1,-1]) {
    const root=new TransformNode(`root-${mirror}`,scene);root.scaling.z=mirror
    const a=new TransformNode('a',scene),b=new TransformNode('b',scene),foot=new TransformNode('foot',scene),tip=new TransformNode('tip',scene)
    a.parent=root;b.parent=a;foot.parent=b;tip.parent=b;b.position.y=-.32;foot.position.y=-.30;tip.position.y=-.30
    a.rotationQuaternion=Quaternion.FromEulerAngles(.12,0,.04);b.rotationQuaternion=Quaternion.Identity()
    const saved=[a,b,foot].map(n=>({q:n.rotationQuaternion?.asArray()??null,p:n.position.asArray()}))
    check(`unreachable support ${mirror}: release restores exact native pose and bone lengths`,()=>{
      const result=tryFootPlant(a,b,foot,tip,new Vector3(3,-4,2),new Vector3(.5,0,.3))
      assert.equal(result.planted,false);assert.ok(result.errorM>.015)
      for(const [i,n]of[a,b,foot].entries()) {assert.deepEqual(n.rotationQuaternion?.asArray()??null,saved[i].q);assert.deepEqual(n.position.asArray(),saved[i].p)}
      near(b.position.length(),.32);near(foot.position.length(),.30)
    })
    check(`reachable support ${mirror}: geometric solution still executes`,()=>{
      const result=tryFootPlant(a,b,foot,tip,new Vector3(.16,-.48,.08),new Vector3(.5,0,.3))
      assert.equal(result.planted,true);assert.ok(result.errorM<.015)
    })
    root.dispose()
  }
  const manifest=JSON.parse(await readFile('public/assets/characters/human-motion/MANIFEST.json','utf8'))
  for(const [assetIndex,spec]of manifest.pedestrians.entries()) {
    const asset=await SceneLoader.LoadAssetContainerAsync('',geometryOnly(await readFile(`public/assets/characters/human-motion/${spec.file}`)),scene,undefined,'.gltf')
    const authority=new TransformNode(`lifecycle-authority-${assetIndex}`,scene),visual=new TransformNode('visual',scene);visual.parent=authority
    const human=createPedestrian(scene,asset,spec,`lifecycle-${assetIndex}`,1.78);human.root.parent=visual
    const parcel=MeshBuilder.CreateBox('parcel',{width:.36,height:.24,depth:.24},scene);parcel.parent=visual;parcel.setEnabled(false)
    const pose=new HumanContactPose(human.root,visual,x=>x>3.03?.16:.06,parcel)
    human.entries.animationGroups.forEach(g=>g.stop())
    const walk=human.entries.animationGroups.find(g=>g.name.endsWith('/Walk_Loop'));walk.start(true,1);walk.setWeightForAllAnimatables(1)
    let t=0
    // Unlike the older per-pose test, retain support locks across frames.
    // Exercise heading changes, support invalidation and long visible frames.
    for(let frame=0;frame<180;frame++) {
      const dt=[1/60,1/30,.10,.18,.75,.04][frame%6];t+=dt
      pose.restore();walk.goToFrame(walk.from+(walk.to-walk.from)*(t%1))
      authority.position.set(3+Math.sin(t*.28)*.6,0,4)
      authority.rotation.y=frame>=90?Math.PI/2:0
      parcel.setEnabled(frame%40>=20)
      const before=authority.position.clone()
      const report=pose.apply(dt,.4)
      assert.equal(report.status,'PASS',`${spec.file} lifecycle ${frame}: ${JSON.stringify(report)}`)
      assert.ok(report.minFootClearanceM>=-.002)
      if(report.carry)assert.ok(Number.isFinite(report.handErrorM)&&report.handErrorM<=.025)
      if(dt>.2)assert.equal(report.plantedFeet,0,'Long frame reacquired a stale plant')
      assert.ok(authority.position.equals(before),'Contact moved simulation authority')
      releases+=report.releasedPlants;poseCount++
    }
    check(`${spec.file}: continuous native walk/carry/curb/turn lifecycle retains ground and grip bounds`,()=>assert.ok(poseCount>=180))
    pose.dispose();human.dispose();parcel.dispose();authority.dispose();asset.dispose()
  }
  console.log(`Contact lifecycle: ${passed} PASS; ${poseCount} continuous poses, ${releases} safely released unreachable plants. Geometric evidence only, not Android visual acceptance.`)
}finally{scene.dispose();engine.dispose();await rm(dir,{recursive:true,force:true})}
