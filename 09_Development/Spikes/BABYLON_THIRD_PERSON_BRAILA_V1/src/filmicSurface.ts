import type { VisualKit } from './cityVisualRecipe'
import { surfacePixels } from './cityVisualRecipe'

export type FilmicSurfaceFamily = 'paving' | 'asphalt'
export type FilmicSurfacePixels = { color: Uint8Array; normal: Uint8Array; orm: Uint8Array }

/**
 * Builds locality-neutral PBR companion maps from the existing authored-code
 * surface colour. No fetched photos or generated third-party imagery.
 */
export const filmicSurfacePixels = (kit: VisualKit, family: FilmicSurfaceFamily, size = 256): FilmicSurfacePixels => {
  const color = surfacePixels(kit, family, size)
  const normal = new Uint8Array(color.length)
  const orm = new Uint8Array(color.length)
  const height = new Float32Array(size * size)
  const hash = (x: number, y: number): number => {
    let n = Math.imul(x + 11, 1597334677) ^ Math.imul(y + 29, -48271) ^ Math.imul(kit.seed + 31, 1103515245)
    n = Math.imul(n ^ (n >>> 15), -2048144789)
    return ((n ^ (n >>> 13)) >>> 0) / 4294967295
  }
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const i = (y * size + x) * 4
    const luma = (color[i]! * .2126 + color[i + 1]! * .7152 + color[i + 2]! * .0722) / 255
    const micro = (hash(x, y) - .5) * (family === 'asphalt' ? .055 : .025)
    height[y * size + x] = luma + micro
  }
  const at = (x: number, y: number): number => height[((y + size) % size) * size + ((x + size) % size)]!
  const strength = family === 'asphalt' ? 2.1 : 3.0
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const i = (y * size + x) * 4
    const nx = (at(x - 1, y) - at(x + 1, y)) * strength
    const ny = (at(x, y - 1) - at(x, y + 1)) * strength
    const len = Math.hypot(nx, ny, 1)
    normal.set([
      Math.round((nx / len * .5 + .5) * 255),
      Math.round((ny / len * .5 + .5) * 255),
      Math.round((1 / len * .5 + .5) * 255),
      255,
    ], i)
    const roughBase = family === 'asphalt' ? 226 : 202
    const roughVariation = Math.round((hash(x + 47, y + 71) - .5) * (family === 'asphalt' ? 10 : 16))
    orm.set([255, Math.max(150, Math.min(245, roughBase + roughVariation)), 0, 255], i)
  }
  return { color, normal, orm }
}
