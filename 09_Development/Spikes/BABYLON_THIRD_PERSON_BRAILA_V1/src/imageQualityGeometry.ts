/** Locality-neutral presentation geometry. No world IDs, saves or gameplay authority. */
export type QualityGeometry = { positions: number[]; indices: number[]; uvs: number[] }
export type RoofShape = 'hip' | 'gable'
type Point = readonly [number, number, number]
const positive = (...values: number[]): void => {
  if (!values.every(value => Number.isFinite(value) && value > 0 && value <= 256)) throw new Error('Invalid bounded visual dimensions')
}
const polygon = (out: QualityGeometry, points: readonly Point[], tile: number, projection: 'wall' | 'roof' = 'wall'): void => {
  const offset = out.positions.length / 3
  const dx = points[1]![0] - points[0]![0], dz = points[1]![2] - points[0]![2]
  const alongX = Math.abs(dx) >= Math.abs(dz)
  for (const p of points) {
    out.positions.push(...p)
    out.uvs.push((alongX ? p[0] : p[2]) / tile, (projection === 'roof' ? (alongX ? p[2] : p[0]) : p[1]) / tile)
  }
  for (let i = 1; i < points.length - 1; i++) out.indices.push(offset, offset + i, offset + i + 1)
}
/** Chamfered, not voxel, envelope inside the unchanged original collision mass. */
export const bevelledEnvelope = (width: number, depth: number, height: number, bevel: number, tile = 2): QualityGeometry => {
  positive(width, depth, height, bevel, tile)
  if (bevel * 4 >= Math.min(width, depth, height)) throw new Error('Bevel exceeds building envelope')
  const out: QualityGeometry = { positions: [], indices: [], uvs: [] }
  const ring = (y: number, inset: number): Point[] => {
    const x = width / 2 - inset, z = depth / 2 - inset, c = bevel
    return [[-x + c,y,-z],[x - c,y,-z],[x,y,-z + c],[x,y,z - c],[x - c,y,z],[-x + c,y,z],[-x,y,z - c],[-x,y,-z + c]]
  }
  const rings = [ring(0, bevel), ring(bevel, 0), ring(height - bevel, 0), ring(height, bevel)]
  for (let level = 0; level < rings.length - 1; level++) for (let i = 0; i < 8; i++) {
    const j = (i + 1) % 8
    polygon(out, [rings[level]![i]!, rings[level + 1]![i]!, rings[level + 1]![j]!, rings[level]![j]!], tile)
  }
  polygon(out, rings[0]!, tile, 'roof')
  polygon(out, [...rings[3]!].reverse(), tile, 'roof')
  return out
}
/** Explicit roof family; dimensions and selection are supplied by the locality binding. */
export const roofEnvelope = (width: number, depth: number, rise: number, shape: RoofShape, tile = 2): QualityGeometry => {
  positive(width, depth, rise, tile)
  if (!['hip', 'gable'].includes(shape) || rise > Math.min(width, depth) / 2) throw new Error('Invalid roof profile')
  const out: QualityGeometry = { positions: [], indices: [], uvs: [] }
  const x = width / 2, z = depth / 2
  const a: Point = [-x,0,-z], b: Point = [x,0,-z], c: Point = [x,0,z], d: Point = [-x,0,z]
  const inset = shape === 'hip' ? Math.min(width, depth) * .23 : 0
  const e: Point = [-x + inset,rise,0], f: Point = [x - inset,rise,0]
  polygon(out, [a,e,f,b], tile, 'roof'); polygon(out, [b,f,c], tile, 'roof')
  polygon(out, [c,f,e,d], tile, 'roof'); polygon(out, [d,e,a], tile, 'roof')
  polygon(out, [d,a,b,c], tile, 'roof')
  return out
}
export type SurfaceFamily = 'plaster' | 'stone' | 'roof'
/** Seamless, authored-code microstructure: linear normals and packed roughness; not photos. */
export const materialPixels = (size: number, family: SurfaceFamily, seed: number): { color: Uint8Array; normal: Uint8Array; orm: Uint8Array } => {
  if (![256, 512, 1024].includes(size) || !['plaster','stone','roof'].includes(family) || !Number.isSafeInteger(seed)) throw new Error('Invalid quality material request')
  const color = new Uint8Array(size * size * 4), normal = new Uint8Array(size * size * 4), orm = new Uint8Array(size * size * 4)
  const heights = new Float32Array(size * size), tone = new Float32Array(size * size)
  const hash = (x: number, y: number): number => {
    let n = Math.imul(x + seed, 374761393) ^ Math.imul(y + 17, 668265263)
    n = Math.imul(n ^ (n >>> 13), 1274126177)
    return ((n ^ (n >>> 16)) >>> 0) / 4294967295
  }
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const u = x / size, v = y / size, n = hash(x,y)
    const grain = Math.sin(u * Math.PI * 12) * Math.sin(v * Math.PI * 10)
    let h = .45 + (n - .5) * .06 + grain * .018, t = .92 + (n - .5) * .09 + grain * .025
    if (family === 'stone') {
      const row = Math.floor(v * 4), ux = ((u * 4 + (row % 2) * .5) % 1), vy = (v * 4) % 1
      const joint = Math.min(ux, 1 - ux, vy, 1 - vy) < .012
      if (joint) { h = .18; t = .74 }
    } else if (family === 'roof') {
      const stripe = (u * 12) % 1, row = (v * 8) % 1
      h = .38 + Math.sin(stripe * Math.PI) * .18 + n * .015
      t = .84 + Math.sin(stripe * Math.PI) * .12 + n * .03
      if (row < .025) { h -= .12; t -= .13 }
    }
    heights[y * size + x] = h; tone[y * size + x] = t
  }
  const at = (x: number, y: number): number => heights[((y + size) % size) * size + ((x + size) % size)]!
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const i = (y * size + x) * 4, c = Math.round(tone[y * size + x]! * 255)
    const nx = (at(x-1,y) - at(x+1,y)) * 2.4, ny = (at(x,y-1) - at(x,y+1)) * 2.4, len = Math.hypot(nx,ny,1)
    color.set([c,c,c,255],i)
    normal.set([Math.round((nx / len * .5 + .5) * 255),Math.round((ny / len * .5 + .5) * 255),Math.round((1 / len * .5 + .5) * 255),255],i)
    orm.set([255, family === 'roof' ? 196 : 228, 0,255],i)
  }
  return { color, normal, orm }
}
