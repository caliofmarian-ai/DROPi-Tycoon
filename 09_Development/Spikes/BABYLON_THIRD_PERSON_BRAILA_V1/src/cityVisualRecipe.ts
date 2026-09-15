/** Presentation-only kit. Inputs are supplied by the locality adapter, never inferred from a country. */
export type Point3 = readonly [number, number, number]
export type Finish = 'stone' | 'trim' | 'metal' | 'glass' | 'accent'
export type VisualKit = {
  id: string; revision: number; seed: number
  palette: Record<Finish, string>
  pavingColor: string; asphaltColor: string; pavingTileMeters: number
  frameWidth: number; windowWidth: number; windowHeight: number
}
export type FacadeInput = {
  id: string; origin: Point3; yaw: number; width: number; height: number
  /** Existing opening centres, in facade coordinates. No mission endpoints are generated. */
  windows: ReadonlyArray<readonly [number, number]>
  door: { x: number; width: number; height: number }
}
export type DetailBox = { id: string; finish: Finish; center: Point3; size: Point3; yaw: number }
const finite = (value: number): boolean => Number.isFinite(value)
const bounded = (value: number, low: number, high: number): boolean => finite(value) && value >= low && value <= high
const identifier = (s: string): boolean => typeof s === 'string' && /^[\w./:-]{1,160}$/.test(s)
const hex = (s: string): boolean => typeof s === 'string' && /^#[0-9a-f]{6}$/i.test(s)
export const validateVisualKit = (kit: VisualKit): void => {
  if (!kit || !identifier(kit.id) || !Number.isSafeInteger(kit.revision) || kit.revision < 1 || !Number.isSafeInteger(kit.seed)) throw new Error('Invalid visual kit identity')
  if (!kit.palette || !['stone', 'trim', 'metal', 'glass', 'accent'].every(key => hex(kit.palette[key as Finish])) || !hex(kit.pavingColor) || !hex(kit.asphaltColor)) throw new Error('Missing explicit visual palette')
  if (!bounded(kit.pavingTileMeters, .5, 8) || !bounded(kit.frameWidth, .04, .2) || !bounded(kit.windowWidth, .8, 2) || !bounded(kit.windowHeight, .8, 2)) throw new Error('Visual kit exceeds human-scale detail bounds')
}
export const facadePoint = (facade: FacadeInput, right: number, up: number, outward: number): Point3 => {
  const c = Math.cos(facade.yaw), s = Math.sin(facade.yaw)
  return [facade.origin[0] + c * right - s * outward, facade.origin[1] + up, facade.origin[2] - s * right - c * outward]
}
export const compileFacade = (kit: VisualKit, facade: FacadeInput): DetailBox[] => {
  validateVisualKit(kit)
  if (!facade || !identifier(facade.id) || !facade.origin || facade.origin.length !== 3 || !facade.origin.every(finite) || !finite(facade.yaw) || !bounded(facade.width, 4, 40) || !bounded(facade.height, 4, 40)) throw new Error('Invalid facade anchor')
  if (!Array.isArray(facade.windows) || facade.windows.length > 96 || !facade.door || !bounded(facade.door.width, .8, 4) || !bounded(facade.door.height, 1.9, 3) || !finite(facade.door.x) || Math.abs(facade.door.x) + facade.door.width / 2 + .3 >= facade.width / 2) throw new Error('Invalid or unbounded facade openings')
  const seen = new Set<string>()
  const result: DetailBox[] = []
  const add = (id: string, finish: Finish, x: number, y: number, z: number, w: number, h: number, d: number): void => {
    if (![x, y, z, w, h, d].every(finite) || Math.min(w, h, d) <= 0) throw new Error('Invalid detail geometry')
    result.push({ id: `${facade.id}/${id}`, finish, center: facadePoint(facade, x, y, z), size: [w, h, d], yaw: facade.yaw })
  }
  const half = facade.width / 2, gap = facade.door.width / 2 + .22, dx = facade.door.x
  for (const [tag, left, right] of [['left', -half, dx - gap], ['right', dx + gap, half]] as const) {
    add(`plinth-${tag}`, 'stone', (left + right) / 2, .34, .06, right - left, .64, .12)
  }
  add('cornice-shadow', 'stone', 0, facade.height - .34, .07, facade.width + .12, .14, .2)
  add('cornice-cap', 'trim', 0, facade.height - .20, .13, facade.width + .3, .14, .32)
  for (let y = 3.3; y < facade.height - 1; y += 3) add(`belt-${y}`, 'trim', 0, y, .04, facade.width, .09, .10)
  const surround = (name: string, x: number, y: number, w: number, h: number, door: boolean): void => {
    const frame = kit.frameWidth
    // Solid jambs and header surround an opening; no slab fills the doorway.
    for (const side of [-1, 1]) add(`${name}/jamb-${side}`, 'trim', x + side * (w + frame) / 2, y, .13, frame, h + frame * 2, .24)
    add(`${name}/header`, 'trim', x, y + (h + frame) / 2, .13, w, frame, .24)
    if (!door) {
      add(`${name}/sill`, 'stone', x, y - (h + frame) / 2, .19, w + frame * 3, frame, .34)
      add(`${name}/glazing`, 'glass', x, y, .055, w, h, .035)
      add(`${name}/mullion`, 'metal', x, y, .10, .045, h, .065)
      add(`${name}/transom`, 'metal', x, y + h * .12, .10, w, .04, .065)
    }
  }
  for (const point of facade.windows) {
    if (!Array.isArray(point) || point.length !== 2 || !point.every(finite)) throw new Error('Malformed window centre')
    const [x, y] = point, key = `${x}:${y}`
    if (seen.has(key)) throw new Error('Duplicate window binding')
    seen.add(key)
    if (Math.abs(x) + kit.windowWidth / 2 + kit.frameWidth * 2 >= half || y - kit.windowHeight / 2 - kit.frameWidth <= 0 || y + kit.windowHeight / 2 + kit.frameWidth >= facade.height) throw new Error('Window outside facade')
    if (y - kit.windowHeight / 2 <= facade.door.height + .25 && Math.abs(x - dx) < (facade.door.width + kit.windowWidth) / 2 + .25) continue
    surround(`window-${key}`, x, y, kit.windowWidth, kit.windowHeight, false)
  }
  surround('door', dx, facade.door.height / 2 + .015, facade.door.width + .18, facade.door.height, true)
  add('door-accent', 'accent', dx, facade.door.height + .23, .145, facade.door.width + .5, .12, .28)
  return result
}
/** Small, opaque, periodically tiled authored material. No fetched/generated third-party image. */
export const surfacePixels = (kit: VisualKit, family: 'paving' | 'asphalt', size = 256): Uint8Array => {
  validateVisualKit(kit)
  if (!['paving', 'asphalt'].includes(family) || !Number.isInteger(size) || size < 32 || size > 256 || (size & (size - 1))) throw new Error('Invalid surface texture budget')
  const color = family === 'paving' ? kit.pavingColor : kit.asphaltColor
  const rgb = [1, 3, 5].map(i => parseInt(color.slice(i, i + 2), 16))
  const out = new Uint8Array(size * size * 4), cell = size / 4
  const hash = (x: number, y: number): number => {
    let n = Math.imul(x + 1, 374761393) ^ Math.imul(y + 1, 668265263) ^ kit.seed
    n = Math.imul(n ^ (n >>> 13), 1274126177)
    return (n ^ (n >>> 16)) >>> 0
  }
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const row = Math.floor(y / cell), u = (x + (row % 2) * cell / 2) % size
    const seam = family === 'paving' && (u % cell < 1 || y % cell < 1)
    const slab = family === 'paving' ? hash(Math.floor(u / cell), row) % 9 - 4 : 0
    const grain = hash(x, y) % (family === 'paving' ? 7 : 13) - (family === 'paving' ? 3 : 6)
    const tone = (seam ? -24 : slab) + grain
    const i = (y * size + x) * 4
    for (let c = 0; c < 3; c++) out[i + c] = Math.max(0, Math.min(255, rgb[c]! + tone))
    out[i + 3] = 255
  }
  return out
}
