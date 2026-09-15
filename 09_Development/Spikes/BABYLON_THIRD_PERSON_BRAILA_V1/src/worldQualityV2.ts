import { EngineStore } from '@babylonjs/core/Engines/engineStore'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color'
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { ShaderMaterial } from '@babylonjs/core/Materials/shaderMaterial'
import { ImageProcessingConfiguration } from '@babylonjs/core/Materials/imageProcessingConfiguration'
import { Texture } from '@babylonjs/core/Materials/Textures/texture'
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight'
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight'
import { ShadowGenerator } from '@babylonjs/core/Lights/Shadows/shadowGenerator'
import type { Material } from '@babylonjs/core/Materials/material'
import type { Scene } from '@babylonjs/core/scene'
import type { GraphicsMode } from './renderResolution'
import { compileArchitecture } from './architectureMesh'
import type { GeometryBuffers } from './architectureMesh'

// Local bindings only. The compiler/material fields are locality-independent.
// No default city fallback, duplicate economic state, or map/source changes.
const BINDINGS = [
  { id:'dropi-hq', wall:'stucco', color:'#dfddd0', roof:'mansard', roofColor:'#646d72' },
  { id:'maras-market', wall:'stucco', color:'#e6d5bd', roof:'hip', roofColor:'#9b6550' },
  { id:'customer-block', wall:'stucco', color:'#d5cfc4', roof:'mansard', roofColor:'#5e676d' },
  { id:'building-0', wall:'brick', color:'#b27b63', roof:'hip', roofColor:'#6b6661' },
  { id:'building-1', wall:'stucco', color:'#ddd2b7', roof:'hip', roofColor:'#96705c' },
  { id:'building-2', wall:'stucco', color:'#cbd4cf', roof:'mansard', roofColor:'#666c6b' },
  { id:'building-4', wall:'brick', color:'#b27b63', roof:'hip', roofColor:'#6b6661' },
  { id:'building-5', wall:'stucco', color:'#d5cfc4', roof:'mansard', roofColor:'#5e676d' },
  { id:'building-7', wall:'stucco', color:'#ddd2b7', roof:'hip', roofColor:'#96705c' },
  { id:'building-9', wall:'stucco', color:'#cbd4cf', roof:'mansard', roofColor:'#666c6b' },
] as const

type QualityState = { status:'LOADING'|'ACTIVE'|'FAIL'; error:string; buildings:number; recessedWindows:number; ownedMeshes:number; ownedTextures:number; originalColliderBoundsPreserved:boolean; texturePixels:number; graphicsMode:GraphicsMode; antiAliasing:string; shadowMapSize:number; shadowFrustumMeters:number; visualAcceptance:'UNKNOWN'; runtimeClass:'INTERNAL_EVALUATION_ONLY' }
const installations = new WeakMap<Scene, {dispose():void}>()
export async function installWorldQuality(scene: Scene): Promise<void> {
  if (installations.has(scene) || scene.isDisposed) return
  const state: QualityState = {status:'LOADING',error:'',buildings:0,recessedWindows:0,ownedMeshes:0,ownedTextures:0,originalColliderBoundsPreserved:false,texturePixels:1024,graphicsMode:'HD',antiAliasing:'UNKNOWN',shadowMapSize:0,shadowFrustumMeters:46,visualAcceptance:'UNKNOWN',runtimeClass:'INTERNAL_EVALUATION_ONLY'}
  const publish=():void=>{(window as unknown as {__DROPiWorldQualityV2:QualityState}).__DROPiWorldQualityV2={...state}}
  publish()
  const owned: Mesh[] = [], mats: Material[] = [], textures = new Map<string,Texture>(), pending: Promise<void>[] = []
  const hidden = new Map<Mesh,boolean>(), priorMaterials = new Map<Mesh,Material|null>(), restoreTransforms: Array<()=>void> = []
  let removed=false
  const hide=(mesh:Mesh):void=>{if(!hidden.has(mesh))hidden.set(mesh,mesh.isVisible);mesh.isVisible=false}
  const cleanup=():void=>{
    if(removed)return;removed=true
    for(const [mesh,material]of priorMaterials)if(!mesh.isDisposed())mesh.material=material
    for(const [mesh,visible]of hidden)if(!mesh.isDisposed())mesh.isVisible=visible
    restoreTransforms.reverse().forEach(restore=>restore())
    owned.forEach(mesh=>{if(!mesh.isDisposed())mesh.dispose(false,false)})
    mats.forEach(material=>material.dispose(false,false));textures.forEach(texture=>texture.dispose())
    installations.delete(scene)
  }
  installations.set(scene,{dispose:cleanup})
  scene.onDisposeObservable.addOnce(cleanup)
  try {
    const anchors=BINDINGS.map(binding=>{
      const source=scene.getMeshByName(binding.id)
      if(!(source instanceof Mesh)||!source.isEnabled()||!source.isVisible||source.parent||!source.checkCollisions)throw new Error(`Missing eligible architecture/collision anchor: ${binding.id}`)
      source.computeWorldMatrix(true)
      const b=source.getBoundingInfo().boundingBox
      return {binding,source,min:b.minimumWorld.clone(),max:b.maximumWorld.clone(),center:b.centerWorld.clone()}
    })
    const load=(family:string,kind:string):Texture=>{
      const key=`${family}-${kind}`
      const cached=textures.get(key);if(cached)return cached
      let texture:Texture
      const promise=new Promise<void>((resolve,reject)=>{
        const timeout=window.setTimeout(()=>reject(new Error(`Quality map timeout: ${key}`)),30000)
        texture=new Texture(`/assets/environment/quality-v2/${key}.png`,scene,false,false,Texture.TRILINEAR_SAMPLINGMODE,()=>{clearTimeout(timeout);resolve()},message=>{clearTimeout(timeout);reject(new Error(`Quality texture failed: ${key}: ${message}`))})
      })
      // Register a rejection handler immediately while constructing the remaining materials.
      void promise.catch(()=>{});pending.push(promise)
      texture!.name=`quality-v2/${key}`;texture!.gammaSpace=kind==='color'
      texture!.wrapU=Texture.WRAP_ADDRESSMODE;texture!.wrapV=Texture.WRAP_ADDRESSMODE
      texture!.anisotropicFilteringLevel=Math.min(8,scene.getEngine().getCaps().maxAnisotropy||1)
      textures.set(key,texture!);return texture!
    }
    const cache=new Map<string,PBRMaterial>()
    const finish=(family:string,color:string):PBRMaterial=>{
      const key=`${family}/${color}`,previous=cache.get(key);if(previous)return previous
      const material=new PBRMaterial(`quality-v2/${key}`,scene);mats.push(material);cache.set(key,material)
      material.albedoColor=Color3.FromHexString(color).toLinearSpace();material.albedoTexture=load(family,'color')
      material.bumpTexture=load(family,'normal');material.metallicTexture=load(family,'orm')
      material.metallic=1;material.roughness=1
      material.useRoughnessFromMetallicTextureAlpha=false;material.useRoughnessFromMetallicTextureGreen=true
      material.useMetallnessFromMetallicTextureBlue=true;material.useAmbientOcclusionFromMetallicTextureRed=false
      material.environmentIntensity=.7;material.maxSimultaneousLights=2
      return material
    }
    const glass=new PBRMaterial('quality-v2/recessed-glazing',scene);mats.push(glass)
    glass.albedoColor=Color3.FromHexString('#455d68').toLinearSpace();glass.roughness=.16;glass.metallic=.12;glass.environmentIntensity=1.2
    const trim=new PBRMaterial('quality-v2/window-reveals',scene);mats.push(trim)
    trim.albedoColor=Color3.FromHexString('#bbb9ae').toLinearSpace();trim.roughness=.6;trim.metallic=.08
    const mount=(name:string,buffers:GeometryBuffers,material:PBRMaterial,x:number,y:number,z:number,cast=false):Mesh=>{
      const mesh=new Mesh(`quality-v2/${name}`,scene);owned.push(mesh)
      const data=new VertexData();data.positions=buffers.positions;data.normals=buffers.normals;data.uvs=buffers.uvs;data.indices=buffers.indices;data.applyToMesh(mesh,false)
      mesh.position.set(x,y,z);mesh.material=material;mesh.isPickable=false;mesh.checkCollisions=false;mesh.receiveShadows=true
      mesh.metadata={dropiQualityCaster:cast,dropiQualityPresentation:true,gameplayAuthority:false}
      mesh.computeWorldMatrix(true);mesh.freezeWorldMatrix();return mesh
    }
    for(const {binding,source,min,max,center}of anchors){
      const geometry=compileArchitecture({width:max.x-min.x,depth:max.z-min.z,height:max.y-min.y,bevel:.14,roof:binding.roof})
      mount(`${binding.id}/walls`,geometry.walls,finish(binding.wall,binding.color),center.x,min.y,center.z,true)
      mount(`${binding.id}/roof`,geometry.roof,finish('roof',binding.roofColor),center.x,min.y,center.z,true)
      mount(`${binding.id}/glazing`,geometry.glazing,glass,center.x,min.y,center.z)
      mount(`${binding.id}/reveals`,geometry.reveals,trim,center.x,min.y,center.z)
      hide(source);state.buildings++;state.recessedWindows+=geometry.windowCount
    }
    // These legacy groups only contain the ten procedural roofs; P3 imported
    // buildings own their complete glTF roof meshes and remain untouched.
    for(const mesh of scene.meshes)if(mesh instanceof Mesh&&['perf-merged-roofs','perf-merged-v2-cornices','perf-merged-target-parapets-light','perf-merged-target-parapets-dark'].includes(mesh.name))hide(mesh)
    const swap=(mesh:Mesh,material:PBRMaterial):void=>{if(!priorMaterials.has(mesh))priorMaterials.set(mesh,mesh.material);mesh.material=material}
    for(const mesh of [...scene.meshes]) {
      if(!(mesh instanceof Mesh)||!mesh.isVisible||!mesh.isEnabled())continue
      if(mesh.name.startsWith('city-visual/surface/'))swap(mesh,finish(mesh.material?.name.includes('asphalt')?'asphalt':'paving',mesh.material?.name.includes('asphalt')?'#5a6063':'#ded9cb'))
      else if(mesh.material?.name.includes('city-visual/glass/'))swap(mesh,glass)
    }
    // Refine existing surface sampling; no texture duplication or UV changes on
    // authored atlases (their regional layouts must not be treated as tile maps).
    for(const material of scene.materials) {
      if(material instanceof PBRMaterial){if(material.albedoTexture)material.albedoTexture.anisotropicFilteringLevel=Math.min(8,scene.getEngine().getCaps().maxAnisotropy||1)}
      if(material instanceof StandardMaterial&&material.diffuseTexture)material.diffuseTexture.anisotropicFilteringLevel=Math.min(8,scene.getEngine().getCaps().maxAnisotropy||1)
    }
    // Human-scale existing signage and canopy; their positions/interaction owners survive.
    for(const mesh of scene.meshes)if(mesh instanceof Mesh&&(mesh.name.startsWith('sign-plane-')||mesh.name==='realism-hq-canopy')){
      const scale=mesh.scaling.clone();const wasFrozen=mesh.isWorldMatrixFrozen
      restoreTransforms.push(()=>{if(mesh.isDisposed())return;mesh.unfreezeWorldMatrix();mesh.scaling.copyFrom(scale);if(wasFrozen)mesh.freezeWorldMatrix()})
      mesh.unfreezeWorldMatrix()
      if(mesh.name.startsWith('sign-plane-'))mesh.scaling.scaleInPlace(.64)
      else{mesh.scaling.x*=.75;mesh.scaling.z*=.58}
      mesh.computeWorldMatrix(true);if(wasFrozen)mesh.freezeWorldMatrix()
    }
    await Promise.all(pending)
    if(scene.isDisposed||removed)throw new Error('Scene disposed while preparing quality materials')
    for(const anchor of anchors){anchor.source.computeWorldMatrix(true);const b=anchor.source.getBoundingInfo().boundingBox;if(!b.minimumWorld.equalsWithEpsilon(anchor.min)||!b.maximumWorld.equalsWithEpsilon(anchor.max)||!anchor.source.checkCollisions||!anchor.source.isEnabled())throw new Error('Architecture changed collision authority')}
    state.originalColliderBoundsPreserved=true
    state.ownedTextures=textures.size;state.ownedMeshes=owned.length
    if(state.buildings!==10||state.ownedMeshes>40||state.ownedTextures>15)throw new Error('Quality sector resource budget exceeded')
    // Legacy StandardMaterial instances were frozen for the previous Poisson
    // shadow sampler. Refresh their shader variants before switching to PCF;
    // retaining the old sampler variant can make the ground/road paint disappear.
    const frozenMaterials=scene.materials.filter(material=>material.isFrozen)
    frozenMaterials.forEach(material=>material.unfreeze())
    restoreTransforms.push(()=>{if(!scene.isDisposed)frozenMaterials.forEach(material=>material.freeze())})
    configureQualityLighting(scene,state,owned,mats,restoreTransforms)
    await new Promise<void>((resolve,reject)=>{
      const timeout=window.setTimeout(()=>reject(new Error('Quality shader readiness timeout')),30000)
      scene.whenReadyAsync().then(()=>{clearTimeout(timeout);resolve()},error=>{clearTimeout(timeout);reject(error)})
    })
    if(scene.isDisposed||removed)throw new Error('Scene disposed while preparing quality shaders')
    frozenMaterials.forEach(material=>material.freeze())
    state.ownedMeshes=owned.length
    bindQualityControl(scene,state,publish)
    for(const material of cache.values())material.freeze()
    const canvas=scene.getEngine().getRenderingCanvas()
    const context=canvas?.getContext('webgl2')??canvas?.getContext('webgl')
    state.antiAliasing=context?.getContextAttributes()?.antialias?'CONTEXT_MSAA':'CONTEXT_NO_MSAA'
    scene.metadata={...(scene.metadata??{}),dropiWorldQualityV2:true};state.status='ACTIVE';publish()
  }catch(error){cleanup();state.status='FAIL';state.error=error instanceof Error?error.message:String(error);publish()}
}

function configureQualityLighting(scene:Scene,state:QualityState,owned:Mesh[],materials:Material[],restores:Array<()=>void>):void{
  const sun=scene.getLightByName('sun'),ambient=scene.getLightByName('ambient')
  if(!(sun instanceof DirectionalLight)||!(ambient instanceof HemisphericLight))throw new Error('Missing daylight authority')
  const previous={sunIntensity:sun.intensity,sunDiffuse:sun.diffuse.clone(),position:sun.position.clone(),direction:sun.direction.clone(),ambientIntensity:ambient.intensity,ambientDiffuse:ambient.diffuse.clone(),ground:ambient.groundColor.clone(),clear:scene.clearColor.clone(),fog:scene.fogColor.clone(),density:scene.fogDensity,exposure:scene.imageProcessingConfiguration.exposure,contrast:scene.imageProcessingConfiguration.contrast,tone:scene.imageProcessingConfiguration.toneMappingType}
  sun.intensity=2.0;sun.diffuse=new Color3(1,.96,.9)
  ambient.intensity=.75;ambient.diffuse=new Color3(.84,.91,1);ambient.groundColor=new Color3(.23,.22,.2)
  scene.clearColor=new Color4(.76,.82,.85,1);scene.fogColor=new Color3(.76,.82,.85);scene.fogDensity=.0014
  const processing=scene.imageProcessingConfiguration;processing.toneMappingType=ImageProcessingConfiguration.TONEMAPPING_ACES;processing.exposure=1.2;processing.contrast=1.04
  const shadows=sun.getShadowGenerator()
  const originalShadow=shadows instanceof ShadowGenerator?{size:shadows.mapSize,pcf:shadows.usePercentageCloserFiltering,bias:shadows.bias,normalBias:shadows.normalBias,frustum:sun.shadowFrustumSize,auto:sun.autoUpdateExtends,min:sun.shadowMinZ,max:sun.shadowMaxZ}:null
  if(shadows instanceof ShadowGenerator){
    shadows.mapSize=Math.min(1536,scene.getEngine().getCaps().maxTextureSize);shadows.usePercentageCloserFiltering=true
    shadows.filteringQuality=ShadowGenerator.QUALITY_MEDIUM;shadows.bias=.00025;shadows.normalBias=.02;shadows.frustumEdgeFalloff=.12
    sun.shadowFrustumSize=state.shadowFrustumMeters;sun.autoUpdateExtends=false;sun.shadowMinZ=1;sun.shadowMaxZ=160
    state.shadowMapSize=shadows.mapSize
  }
  const direction=new Vector3(-.42,-.82,.39).normalize(),right=Vector3.Cross(Vector3.Up(),direction).normalize(),up=Vector3.Cross(direction,right).normalize()
  sun.direction.copyFrom(direction)
  const tick=scene.onBeforeRenderObservable.add(()=>{
    const hero=scene.getTransformNodeByName('hero');if(!hero)return
    const t=state.shadowFrustumMeters/Math.max(1,state.shadowMapSize),p=hero.position
    const a=Vector3.Dot(p,right),b=Vector3.Dot(p,up)
    // Light-space texel snapping, rather than stretching one map over the whole city.
    sun.position.copyFrom(p).addInPlace(right.scale(Math.round(a/t)*t-a)).addInPlace(up.scale(Math.round(b/t)*t-b)).subtractInPlace(direction.scale(72))
  })
  const sky=MeshBuilder.CreateSphere('quality-v2/daylight-sky',{diameter:360,segments:16},scene);owned.push(sky)
  sky.infiniteDistance=true;sky.isPickable=false;sky.checkCollisions=false;sky.applyFog=false
  const material=new ShaderMaterial('quality-v2/daylight-sky',scene,{
    vertexSource:'precision highp float;attribute vec3 position;uniform mat4 worldViewProjection;varying vec3 direction;void main(){direction=normalize(position);gl_Position=worldViewProjection*vec4(position,1.0);}',
    fragmentSource:'precision highp float;varying vec3 direction;void main(){vec3 d=normalize(direction);float h=clamp(d.y,0.0,1.0);vec3 sky=mix(vec3(.78,.83,.86),vec3(.27,.49,.72),pow(h,.48));float sun=pow(max(0.0,dot(d,normalize(vec3(.42,.82,-.39)))),128.0);sky+=vec3(.20,.17,.12)*sun;gl_FragColor=vec4(sky,1.0);}',
  },{attributes:['position'],uniforms:['worldViewProjection']});materials.push(material)
  material.backFaceCulling=false;material.disableDepthWrite=true;sky.material=material
  restores.push(()=>{
    scene.onBeforeRenderObservable.remove(tick);sun.intensity=previous.sunIntensity;sun.diffuse=previous.sunDiffuse;sun.position.copyFrom(previous.position);sun.direction.copyFrom(previous.direction)
    ambient.intensity=previous.ambientIntensity;ambient.diffuse=previous.ambientDiffuse;ambient.groundColor=previous.ground;scene.clearColor=previous.clear;scene.fogColor=previous.fog;scene.fogDensity=previous.density
    processing.exposure=previous.exposure;processing.contrast=previous.contrast;processing.toneMappingType=previous.tone
    if(!scene.isDisposed&&shadows instanceof ShadowGenerator&&originalShadow){shadows.mapSize=originalShadow.size;shadows.usePercentageCloserFiltering=originalShadow.pcf;shadows.bias=originalShadow.bias;shadows.normalBias=originalShadow.normalBias;sun.shadowFrustumSize=originalShadow.frustum;sun.autoUpdateExtends=originalShadow.auto;sun.shadowMinZ=originalShadow.min;sun.shadowMaxZ=originalShadow.max}
  })
}
function bindQualityControl(scene:Scene,state:QualityState,publish:()=>void):void{
  const control=(window as unknown as {__DROPiGraphicsControl?:{setMode(mode:GraphicsMode):void;getMode():GraphicsMode}}).__DROPiGraphicsControl
  if(!control)throw new Error('No single render-quality owner')
  const button=document.createElement('button');button.id='dropi-image-quality';button.type='button';button.setAttribute('aria-label','Graphics quality: HD or adaptive balanced')
  Object.assign(button.style,{position:'fixed',left:'112px',top:'100px',zIndex:'35',padding:'8px 10px',border:'1px solid rgba(205,230,240,.4)',background:'rgba(5,20,30,.8)',color:'#eaf4f7',borderRadius:'7px',font:'600 9px/1.2 system-ui'})
  const update=():void=>{state.graphicsMode=control.getMode();button.textContent=`GRAPHICS · ${state.graphicsMode}`;button.setAttribute('aria-pressed',String(state.graphicsMode==='HD'));publish()}
  // An explicit previous choice may be restored; device overload never silently switches HD off.
  control.setMode('HD')
  try{const saved=localStorage.getItem('dropi.eval.graphics.v2');if(saved==='HD'||saved==='BALANCED')control.setMode(saved)}catch{/* Private/denied storage does not prevent gameplay. */}
  button.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();control.setMode(control.getMode()==='HD'?'BALANCED':'HD');try{localStorage.setItem('dropi.eval.graphics.v2',control.getMode())}catch{}update()})
  document.body.append(button);update();scene.onDisposeObservable.addOnce(()=>button.remove())
}
let timer:ReturnType<typeof setTimeout>|undefined
const boot=():void=>{
  const scene=EngineStore.LastCreatedScene
  if(scene?.isDisposed)return
  if(!scene?.metadata?.dropiSurfaceFinish){timer=setTimeout(boot,100);return}
  void installWorldQuality(scene)
}
if(typeof window!=='undefined'&&typeof document!=='undefined'){boot();window.addEventListener('pagehide',()=>clearTimeout(timer),{once:true})}
