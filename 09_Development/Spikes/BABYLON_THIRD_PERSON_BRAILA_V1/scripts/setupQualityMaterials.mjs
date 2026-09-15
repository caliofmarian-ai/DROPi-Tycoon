import { mkdir, writeFile, readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { deflateSync } from 'node:zlib'

// Original deterministic material fields, not photographs or third-party art.
// Generated at build time, never on the phone's render thread.
export const MATERIAL_FAMILIES = ['stucco', 'brick', 'roof', 'asphalt', 'paving', 'grass']
const fract = x => x - Math.floor(x)
const smooth = x => { const t = Math.max(0, Math.min(1, x)); return t * t * (3 - 2 * t) }
const hash = (x, y, seed) => {
  let n = Math.imul(x ^ seed, 374761393) ^ Math.imul(y, 668265263)
  n = Math.imul(n ^ n >>> 13, 1274126177)
  return ((n ^ n >>> 16) >>> 0) / 4294967295
}
const noise = (u, v, frequency, seed) => {
  const x = Math.floor(u * frequency), y = Math.floor(v * frequency)
  const a = smooth(fract(u * frequency)), b = smooth(fract(v * frequency))
  const h = (dx, dy) => hash((x + dx) % frequency, (y + dy) % frequency, seed)
  return (h(0, 0) * (1 - a) + h(1, 0) * a) * (1 - b) + (h(0, 1) * (1 - a) + h(1, 1) * a) * b
}
export function materialFields(family, size = 1024) {
  if (!MATERIAL_FAMILIES.includes(family) || ![256, 512, 1024].includes(size)) throw new Error('Invalid material family/size')
  const height = new Float32Array(size * size), color = new Uint8Array(size * size * 4), rough = new Uint8Array(size * size)
  const tileMeters = family === 'grass' ? 4 : 2
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const u = x / size, v = y / size, i = y * size + x
    const grain = hash(x, y, 7314) - .5, clouds = noise(u, v, 8, 4207) - .5
    let c = 213 + grain * 5 + clouds * 6, h = grain * .0006, r = .84
    if (family === 'brick' || family === 'paving') {
      const columns = family === 'brick' ? 8 : 4, rows = family === 'brick' ? 24 : 8
      const row = Math.floor(v * rows), col = Math.floor(u * columns + (row % 2) * .5)
      const a = fract(u * columns + (row % 2) * .5), b = fract(v * rows)
      const edge = Math.min(a, 1 - a, Math.min(b, 1 - b) * (columns / rows))
      const fill = smooth(edge / (family === 'brick' ? .030 : .016))
      const variation = hash(col, row, 9845) - .5
      c = family === 'brick' ? 158 + fill * (64 + variation * 22) : 144 + fill * (72 + variation * 13)
      c += grain * 7 + clouds * 4; h = fill * .007 + grain * .0006; r = .88 - fill * .06
    } else if (family === 'roof') {
      const a = fract(u * 6), b = fract(v * 8), ridge = Math.sin(a * Math.PI)
      c = 182 + ridge * 22 + grain * 6 + clouds * 8
      h = ridge * .018 + smooth(b / .08) * .010; r = .75
    } else if (family === 'asphalt') {
      c = 199 + grain * 22 + clouds * 8; h = grain * .0018 + clouds * .0005; r = .94
    } else if (family === 'grass') {
      c = 174 + grain * 42 + clouds * 30 + (noise(u, v, 64, 572) - .5) * 12
      h = grain * .0018; r = .98
    }
    const p = i * 4
    color[p] = color[p + 1] = color[p + 2] = Math.round(Math.min(255, Math.max(0, c)))
    color[p + 3] = 255; height[i] = h; rough[i] = Math.round(r * 255)
  }
  const normal = new Uint8Array(size * size * 4), orm = new Uint8Array(size * size * 4)
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const i = y * size + x, p = i * 4
    const dx = (height[y * size + ((x + 1) % size)] - height[y * size + ((x + size - 1) % size)]) * size / (2 * tileMeters)
    const dy = (height[((y + 1) % size) * size + x] - height[((y + size - 1) % size) * size + x]) * size / (2 * tileMeters)
    const d = Math.hypot(dx, dy, 1)
    normal[p] = Math.round((-.5 * dx / d + .5) * 255)
    normal[p + 1] = Math.round((.5 * dy / d + .5) * 255)
    normal[p + 2] = Math.round((.5 / d + .5) * 255); normal[p + 3] = 255
    orm[p] = 255; orm[p + 1] = rough[i]; orm[p + 2] = 0; orm[p + 3] = 255
  }
  return { color, normal, orm, tileMeters }
}
const crcTable = Uint32Array.from({ length: 256 }, (_, i) => {
  let c = i; for (let n = 0; n < 8; n++) c = c & 1 ? 0xedb88320 ^ c >>> 1 : c >>> 1; return c >>> 0
})
const crc32 = data => { let c = 0xffffffff; for (const b of data) c = crcTable[(c ^ b) & 255] ^ c >>> 8; return (c ^ 0xffffffff) >>> 0 }
export const png = (rgba, size) => {
  if (rgba.length !== size * size * 4) throw new Error('Invalid PNG pixels')
  const chunk = (name, data) => {
    const payload = Buffer.concat([Buffer.from(name), data]), length = Buffer.alloc(4), crc = Buffer.alloc(4)
    length.writeUInt32BE(data.length); crc.writeUInt32BE(crc32(payload)); return Buffer.concat([length, payload, crc])
  }
  const header = Buffer.alloc(13); header.writeUInt32BE(size, 0); header.writeUInt32BE(size, 4); header[8] = 8; header[9] = 6
  const rows = Buffer.alloc((size * 4 + 1) * size)
  for (let y = 0; y < size; y++) rows.set(rgba.subarray(y * size * 4, (y + 1) * size * 4), y * (size * 4 + 1) + 1)
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk('IHDR', header), chunk('IDAT', deflateSync(rows, { level: 9 })), chunk('IEND', Buffer.alloc(0))])
}
export async function buildQualityMaterials() {
  const root = 'public/assets/environment/quality-v2'
  await mkdir(root, { recursive: true })
  const manifest = { schema: 1, source: 'ORIGINAL_CODE_AUTHORED_PROCEDURAL_MATERIALS', commercialQualification: 'UNKNOWN', generatorSha256: createHash('sha256').update(await readFile(new URL(import.meta.url))).digest('hex'), files: [] }
  for (const family of MATERIAL_FAMILIES) {
    const fields = materialFields(family)
    for (const kind of ['color', 'normal', 'orm']) {
      const bytes = png(fields[kind], 1024), name = `${family}-${kind}.png`
      await writeFile(`${root}/${name}`, bytes)
      manifest.files.push({ name, width: 1024, height: 1024, tileMeters: fields.tileMeters, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'), colorSpace: kind === 'color' ? 'SRGB' : 'LINEAR' })
    }
  }
  await writeFile(`${root}/PROVENANCE.json`, `${JSON.stringify(manifest, null, 2)}\n`)
  console.log(`Generated ${manifest.files.length} original 1024px material maps; no downloaded content; release qualification UNKNOWN.`)
}
if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) await buildQualityMaterials()
