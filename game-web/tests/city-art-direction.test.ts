import { describe, expect, it } from 'vitest'
import { CITY_ART_DIRECTION, CITY_COLORS } from '../src/ui/theme'

const rgb = (color: number) => ({
  r: (color >> 16) & 0xff,
  g: (color >> 8) & 0xff,
  b: color & 0xff,
})

const luminance = (color: number) => {
  const { r, g, b } = rgb(color)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

describe('canonical city art direction', () => {
  it('binds runtime city styling to the owner-approved reference family without using a reference as gameplay geometry', () => {
    expect(CITY_ART_DIRECTION.version).toBe(2)
    expect(CITY_ART_DIRECTION.referenceFamily).toBe('08_Assets/Approved_References')
    expect(CITY_ART_DIRECTION.identity).toBe('dropi-blue-cyan-warm-daylight')
    expect(CITY_ART_DIRECTION.principles).toEqual({
      dropiBlueCyanIdentity: true,
      warmArchitecturalHighlights: true,
      coolDimensionalShadows: true,
      saturatedFoliage: true,
      warmReadableStreetSurfaces: true,
    })
  })

  it('keeps structural world tones blue/cyan while architecture and street highlights stay warm', () => {
    for (const color of [CITY_COLORS.water, CITY_COLORS.waterLight, CITY_COLORS.glass, CITY_COLORS.roofBlue]) {
      const { r, b } = rgb(color)
      expect(b).toBeGreaterThan(r)
    }

    for (const color of [CITY_COLORS.sidewalk, CITY_COLORS.curb, CITY_COLORS.wall, CITY_COLORS.cream]) {
      const { r, b } = rgb(color)
      expect(r).toBeGreaterThan(b)
    }
  })

  it('uses a darker cool edge/shadow layer to keep streets and buildings dimensional at Android scale', () => {
    expect(luminance(CITY_COLORS.roadEdge)).toBeLessThan(luminance(CITY_COLORS.road))
    expect(luminance(CITY_COLORS.shadow)).toBeLessThan(luminance(CITY_COLORS.roadEdge))
    expect(luminance(CITY_COLORS.wallShade)).toBeLessThan(luminance(CITY_COLORS.wall))
    expect(luminance(CITY_COLORS.glassShade)).toBeLessThan(luminance(CITY_COLORS.glass))
  })

  it('preserves distinct saturated foliage layers instead of a single flat green', () => {
    const foliage = new Set([
      CITY_COLORS.grassShade,
      CITY_COLORS.grass,
      CITY_COLORS.lawn,
      CITY_COLORS.leafDark,
      CITY_COLORS.leaf,
      CITY_COLORS.leafLight,
      CITY_COLORS.leafSun,
    ])
    expect(foliage.size).toBe(7)
    expect(luminance(CITY_COLORS.leafDark)).toBeLessThan(luminance(CITY_COLORS.leafSun))
  })
})
