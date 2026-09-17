import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { Matrix, Quaternion, Vector3 } from '@babylonjs/core'

const out = path.resolve('public/assets/characters/human-motion')
const mirror = 'RRG314/WorldExplorer3D', commit = 'b5a6a32448fcaa7c5e079ccb78d9d6030de29a00'
const base = `https://raw.githubusercontent.com/${mirror}/${commit}/app/assets/models/characters`
const sources = [
  { id: 'casualMale', file: 'casual-man.glb', url: `${base}/city-explorer-v1.glb`, sha256: '0dba57f454956ca5886a2d72e6c5a65f6dc9d45987dc3d47bfe419ff0d0b82b4', bytes: 1558208, author: 'Quaternius', title: 'Ultimate Modular Men / Casual Hoodie', licenseSource: 'https://quaternius.com/packs/ultimatemodularcharacters.html' },
  { id: 'casualFemale', file: 'casual-woman.glb', url: `${base}/city-explorer-woman-casual-v1.glb`, sha256: 'e406f91a5fc6f94cc2ee0df0bfcfcc4c8c4e3949412daeac586201b75df244a6', bytes: 1579380, author: 'Quaternius', title: 'Ultimate Modular Women / Casual', licenseSource: 'https://quaternius.com/packs/ultimatemodularwomen.html' },
]
const digest = data => createHash('sha256').update(data).digest('hex')
const normalize = name => String(name).split('|').at(-1).toLowerCase().replace(/[^a-z0-9]/g, '')
const parse = bytes => {
  if (bytes.readUInt32LE(0) !== 0x46546c67 || bytes.readUInt32LE(4) !== 2 || bytes.readUInt32LE(8) !== bytes.length) throw new Error('Invalid GLB header')
  const chunks = []
  for (let offset = 12; offset < bytes.length;) {
    const length = bytes.readUInt32LE(offset), type = bytes.readUInt32LE(offset + 4)
    if (offset + 8 + length > bytes.length) throw new Error('Truncated GLB chunk')
    chunks.push({ type, data: bytes.subarray(offset + 8, offset + 8 + length) }); offset += 8 + length
  }
  if (chunks[0]?.type !== 0x4e4f534a) throw new Error('Missing GLB JSON')
  return { json: JSON.parse(chunks[0].data.toString('utf8').trim()), chunks }
}
const repack = ({ json, chunks }) => {
  const text = Buffer.from(JSON.stringify(json)), padded = Buffer.alloc(Math.ceil(text.length / 4) * 4, 0x20); text.copy(padded)
  const result = [{ type: 0x4e4f534a, data: padded }, ...chunks.slice(1)]
  const header = Buffer.alloc(12); header.writeUInt32LE(0x46546c67, 0); header.writeUInt32LE(2, 4)
  header.writeUInt32LE(12 + result.reduce((sum, chunk) => sum + 8 + chunk.data.length, 0), 8)
  return Buffer.concat([header, ...result.flatMap(chunk => {
    const h = Buffer.alloc(8); h.writeUInt32LE(chunk.data.length); h.writeUInt32LE(chunk.type, 4)
    return [h, chunk.data]
  })])
}
const fetchPinned = async source => {
  let last
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(source.url, { signal: AbortSignal.timeout(45000) })
      if (!response.ok) throw new Error(`${source.id}: HTTP ${response.status}`)
      const bytes = Buffer.from(await response.arrayBuffer())
      if (bytes.length !== source.bytes || digest(bytes) !== source.sha256) throw new Error(`${source.id}: pinned asset identity mismatch`)
      return bytes
    } catch (error) { last = error; if (attempt < 2) await new Promise(resolve => setTimeout(resolve, 700 * (attempt + 1))) }
  }
  throw last
}
const chooseClip = (json, kind) => {
  const animations = json.animations ?? []
  const exact = kind === 'walk' ? ['walkfwdloop', 'walkforwardloop', 'walkloop', 'walkingloop', 'walking', 'walk'] : ['idleloop', 'idle', 'standingidle', 'idle01']
  for (const key of exact) {
    const found = animations.filter(animation => normalize(animation.name) === key)
    if (found.length === 1) return found[0]
  }
  const candidates = animations.filter(animation => {
    const name = normalize(animation.name)
    return kind === 'walk' ? /^walk/.test(name) && !/back|left|right|strafe|crouch|zombie|combat|injur|carry/.test(name) : /^idle/.test(name)
  })
  if (candidates.length !== 1) throw new Error(`No unambiguous ${kind} clip: ${animations.map(a => a.name).join(', ')}`)
  return candidates[0]
}
const validateClip = (json, clip) => {
  const names = new Set(), rotated = new Set()
  for (const channel of clip.channels ?? []) {
    const node = json.nodes[channel.target?.node]
    if (!node?.name) throw new Error(`Unnamed animation target in ${clip.name}`)
    names.add(node.name)
    if (channel.target.path === 'rotation') rotated.add(node.name)
    if (channel.target.path === 'translation' && /^(root|armature)$/i.test(node.name)) throw new Error(`${clip.name}: root translation requires a no-root-motion derivative`)
  }
  if (rotated.size < 8) throw new Error(`${clip.name}: not a skeletal locomotion clip`)
  return [...names]
}
const addFootReferences = json => {
  const jointNames = [...new Set((json.skins ?? []).flatMap(skin => skin.joints.map(index => json.nodes[index].name)))]
  console.log('Native joint names:', jointNames.join(', '))
  const roles = Object.fromEntries(Object.entries({ leftFoot: ['footl', 'leftfoot', 'footleft'], rightFoot: ['footr', 'rightfoot', 'footright'] }).map(([role, aliases]) => {
    const matches = jointNames.filter(name => aliases.some(key => normalize(name).endsWith(key)))
    if (matches.length !== 1) throw new Error(`Ambiguous/missing ${role}: ${jointNames.join(', ')}`)
    return [role, matches[0]]
  }))
  const parents = new Map(), cache = new Map()
  json.nodes.forEach((node, parent) => (node.children ?? []).forEach(child => parents.set(child, parent)))
  const world = index => {
    if (cache.has(index)) return cache.get(index)
    const node = json.nodes[index]
    const local = node.matrix ? Matrix.FromArray(node.matrix) : Matrix.Compose(Vector3.FromArray(node.scale ?? [1, 1, 1]), Quaternion.FromArray(node.rotation ?? [0, 0, 0, 1]), Vector3.FromArray(node.translation ?? [0, 0, 0]))
    const result = parents.has(index) ? local.multiply(world(parents.get(index))) : local
    cache.set(index, result); return result
  }
  const left = json.nodes.findIndex(node => node.name === roles.leftFoot), right = json.nodes.findIndex(node => node.name === roles.rightFoot)
  const leftPosition = Vector3.TransformCoordinates(Vector3.Zero(), world(left)), rightPosition = Vector3.TransformCoordinates(Vector3.Zero(), world(right))
  const offset = Math.max(0.01, Vector3.Distance(leftPosition, rightPosition) * 0.5)
  // The pack has no deforming toe joints. PT.L/PT.R remain untouched. These
  // are explicitly virtual, non-skin foot references built from the pinned
  // source +Z forward / +Y up contract; no skeletal joint is misclassified.
  for (const [role, index, side] of [['leftToe', left, 'L'], ['rightToe', right, 'R']]) {
    const name = `DROPi_Toe_Reference_${side}`
    if (json.nodes.some(node => node.name === name)) throw new Error('Duplicate foot reference name')
    const footWorld = world(index)
    if (Math.abs(footWorld.determinant()) < 1e-12) throw new Error('Singular foot frame')
    const position = Vector3.TransformCoordinates(Vector3.Zero(), footWorld).add(new Vector3(0, 0, offset))
    const translation = Vector3.TransformCoordinates(position, Matrix.Invert(footWorld)).asArray()
    const child = json.nodes.length
    json.nodes.push({ name, translation, extras: { dropiVirtualFootReference: true, notDeformingToeJoint: true } })
    ;(json.nodes[index].children ??= []).push(child)
    roles[role] = name
  }
  return roles
}
await mkdir(out, { recursive: true })
const manifest = { status: 'CANDIDATE_NOT_RELEASE_CLEARED', hero: null, pedestrians: [], sources: [], rigCompatibility: 'NATIVE_CLIPS_ON_ORIGINAL_RIG_NO_CROSS_RIG_RETARGET' }
for (const source of sources) {
  const bytes = await fetchPinned(source), model = parse(bytes), json = model.json
  if ((json.buffers ?? []).some(buffer => buffer.uri) || (json.images ?? []).some(image => image.uri && !image.uri.startsWith('data:'))) throw new Error(`${source.id}: unexpected external runtime dependency`)
  console.log(`${source.id} original clips:`, (json.animations ?? []).map(animation => animation.name).join(', '))
  const walk = chooseClip(json, 'walk'), idle = chooseClip(json, 'idle')
  const targets = validateClip(json, walk); validateClip(json, idle)
  const roles = addFootReferences(json), originalWalk = walk.name, originalIdle = idle.name
  json.animations = [{ ...idle, name: 'Idle_Loop' }, { ...walk, name: 'Walk_Loop' }]
  const spec = { file: source.file, idle: 'Idle_Loop', walk: 'Walk_Loop', originalWalk, originalIdle, roles, skeletons: json.skins.length, targetCount: targets.length, nativeRig: true, sourceForwardAxis: 'z', sourceUpAxis: 'y', virtualToeReferences: true, frameEvidence: `https://github.com/${mirror}/blob/${commit}/app/js/assets/model-asset-catalog.js` }
  manifest.pedestrians.push(spec)
  if (source.id === 'casualMale') manifest.hero = { ...spec, clothing: 'AUTHORED_CASUAL_HOODIE', targetHeightM: 1.78 }
  const derivative = repack(model)
  await writeFile(path.join(out, source.file), derivative)
  manifest.sources.push({ ...source, upstreamLicense: 'CC0-1.0', qualification: 'CANDIDATE_NOT_RELEASE_CLEARED', derivativeSha256: digest(derivative), transformation: 'Preserved body/clothing geometry, native skin and animations, materials and binary buffer. Kept native idle/walk only; added two non-deforming virtual foot references using the pinned source frame. No cross-rig transfer, PT-joint reinterpretation or jog relabeling.' })
  console.log(`${source.id}: verified ${originalWalk}; targets=${targets.length}; output=${derivative.length} bytes`)
}
await writeFile(path.join(out, 'MANIFEST.json'), `${JSON.stringify(manifest, null, 2)}\n`)
await writeFile(path.join(out, 'PROVENANCE.json'), `${JSON.stringify({ ...manifest, evidenceDate: '2026-09-14', mirrorAttribution: `https://github.com/${mirror}/blob/${commit}/app/assets/models/ATTRIBUTION.md`, notes: 'Primary author pages declare CC0 for upstream packs. Mirror derivatives remain candidates pending project legal/asset acceptance. No Runway target-match or production clearance. UAL2 transfer was rejected for incompatible rest rotations and is not used.' }, null, 2)}\n`)
console.log('Native authored human asset preparation complete; visual acceptance remains UNKNOWN.')
