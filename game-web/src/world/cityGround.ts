import type Phaser from 'phaser'
import { CITY_COLORS as C } from '../ui/theme'
import type { WorldDecorationLayout, WorldRectLayout, WorldZoneLayout } from './worldLayout'

export interface CityDistrictAccent extends WorldRectLayout { kind: 'canal' | 'garden' }

/** Decorative pockets must remain outside every sidewalk, entrance, building and tree trunk. */
export const cityDistrictAccents = (
  zones: readonly WorldZoneLayout[], surfaces: readonly WorldRectLayout[],
  buildings: readonly WorldRectLayout[], trees: readonly WorldDecorationLayout[],
): readonly CityDistrictAccent[] => {
  const accents: CityDistrictAccent[] = []
  const blocked = [...surfaces, ...buildings]
  for (const zone of zones) {
    if (zone.id !== 'waterfront' && zone.id !== 'garden') continue
    for (const [index, offset] of [330, 1100].entries()) {
      const accent: CityDistrictAccent = {
        id: `${zone.id}-landscape-${index}`, kind: zone.id === 'waterfront' ? 'canal' : 'garden',
        x: zone.x + offset, y: zone.y + (zone.id === 'waterfront' ? 644 : 607),
        width: index ? 540 : 560, height: zone.id === 'waterfront' ? 40 : 38,
      }
      const left = accent.x - accent.width / 2
      const right = accent.x + accent.width / 2
      const top = accent.y - accent.height / 2
      const bottom = accent.y + accent.height / 2
      if (left < zone.x || right > zone.x + zone.width || top < zone.y || bottom > zone.y + zone.height) continue
      if (blocked.some(rect =>
        Math.abs(rect.x - accent.x) <= (rect.width + accent.width) / 2 + 6 &&
        Math.abs(rect.y - accent.y) <= (rect.height + accent.height) / 2 + 6)) continue
      if (trees.some(tree => Math.hypot(
        tree.x - Math.max(left, Math.min(right, tree.x)),
        tree.y - Math.max(top, Math.min(bottom, tree.y)),
      ) < tree.radius + 6)) continue
      accents.push(accent)
    }
  }
  return accents
}

export const drawCityDistrictAccents = (
  g: Phaser.GameObjects.Graphics, accents: readonly CityDistrictAccent[],
): void => {
  for (const accent of accents) {
    const left = accent.x - accent.width / 2
    const top = accent.y - accent.height / 2
    const { width, height } = accent
    if (accent.kind === 'canal') {
      g.fillStyle(C.metal).fillRoundedRect(left, top, width, height, 12)
      g.fillStyle(C.water).fillRoundedRect(left + 3, top + 3, width - 6, height - 6, 10)
      g.lineStyle(2, C.waterLight, 0.72)
      for (let x = left + 19; x < left + width - 30; x += 53) {
        g.lineBetween(x, top + 13, x + 20, top + 13)
          .lineBetween(x + 11, top + 25, x + 34, top + 25)
      }
      for (const x of [left + 55, left + width - 75]) {
        g.fillStyle(C.trunk).fillRoundedRect(x, top + 1, 20, 17, 2)
        g.lineStyle(1, C.wallShade).lineBetween(x + 5, top + 3, x + 5, top + 16)
          .lineBetween(x + 11, top + 3, x + 11, top + 16)
        g.fillStyle(C.cream).fillCircle(x + 2, top + 3, 2).fillCircle(x + 18, top + 3, 2)
      }
    } else {
      g.fillStyle(C.leafDark).fillRoundedRect(left, top, width, height, 12)
      g.fillStyle(C.lawn).fillRoundedRect(left + 4, top + 4, width - 8, height - 8, 9)
      for (let x = left + 16; x < left + width - 12; x += 22) {
        for (const y of [top + 10, top + height - 10]) {
          g.fillStyle(C.leaf).fillEllipse(x, y, 17, 11)
          g.fillStyle(C.leafSun).fillEllipse(x - 3, y - 2, 9, 6)
          g.fillStyle(Math.round(x / 22) % 2 ? C.flowerPink : C.flower).fillCircle(x + 2, y - 1, 3)
          g.fillStyle(C.windowLight).fillCircle(x + 2, y - 1, 1)
        }
      }
    }
  }
}

export interface CityCrossing { x: number; y: number; width: number; height: number }
export const roadCrossings = (roads: readonly WorldRectLayout[]): readonly CityCrossing[] => {
  const crossings: CityCrossing[] = []
  const seen = new Set<string>()
  roads.filter(road => road.width > road.height).forEach(horizontal => {
    roads.filter(road => road.height > road.width).forEach(vertical => {
      if (Math.abs(horizontal.x - vertical.x) > (horizontal.width + vertical.width) / 2 ||
        Math.abs(horizontal.y - vertical.y) > (horizontal.height + vertical.height) / 2) return
      const key = `${vertical.x}:${horizontal.y}`
      if (seen.has(key)) return
      seen.add(key)
      crossings.push({ x: vertical.x, y: horizontal.y, width: vertical.width, height: horizontal.height })
    })
  })
  return crossings
}

export const drawCityPavement = (
  g: Phaser.GameObjects.Graphics, roads: readonly WorldRectLayout[], sidewalks: readonly WorldRectLayout[],
): void => {
  for (const sidewalk of sidewalks) {
    const left = sidewalk.x - sidewalk.width / 2
    const top = sidewalk.y - sidewalk.height / 2
    g.fillStyle(C.pavingLine).fillRect(left + 2, top + 3, sidewalk.width, sidewalk.height)
    g.fillStyle(C.sidewalk).fillRect(left, top, sidewalk.width, sidewalk.height)
    g.lineStyle(1, C.pavingLine, 0.65)
    if (sidewalk.width > sidewalk.height) {
      for (let x = left + 22; x < left + sidewalk.width; x += 28) {
        g.lineBetween(x, top, x, top + sidewalk.height)
      }
      g.lineBetween(left, top + 12, left + sidewalk.width, top + 12)
        .lineBetween(left, top + sidewalk.height - 12, left + sidewalk.width, top + sidewalk.height - 12)
    } else {
      for (let y = top + 22; y < top + sidewalk.height; y += 28) {
        g.lineBetween(left, y, left + sidewalk.width, y)
      }
      g.lineBetween(left + 12, top, left + 12, top + sidewalk.height)
        .lineBetween(left + sidewalk.width - 12, top, left + sidewalk.width - 12, top + sidewalk.height)
    }
  }
  for (const road of roads) {
    const left = road.x - road.width / 2
    const top = road.y - road.height / 2
    g.fillStyle(C.roadEdge).fillRect(left - 3, top - 3, road.width + 6, road.height + 6)
    g.lineStyle(3, C.curb).strokeRect(left - 4, top - 4, road.width + 8, road.height + 8)
  }
  // Union all asphalt before markings so intersecting roads never retain a curb.
  roads.forEach(road => g.fillStyle(C.road).fillRect(road.x - road.width / 2,
    road.y - road.height / 2, road.width, road.height))
  const crossings = roadCrossings(roads)
  roads.forEach(road => {
    const horizontal = road.width > road.height
    const length = horizontal ? road.width : road.height
    const start = (horizontal ? road.x : road.y) - length / 2
    for (let offset = 17; offset < length - 23; offset += 55) {
      const x = horizontal ? start + offset : road.x
      const y = horizontal ? road.y : start + offset
      if (crossings.some(crossing => Math.abs(x - crossing.x) < crossing.width / 2 + 34 &&
        Math.abs(y - crossing.y) < crossing.height / 2 + 34)) continue
      g.fillStyle(C.lane, 0.72)
      if (horizontal) g.fillRoundedRect(x, y - 1, 24, 2, 1)
      else g.fillRoundedRect(x - 1, y, 2, 24, 1)
    }
  })
  for (const crossing of crossings) {
    const { x, y, width, height } = crossing
    g.fillStyle(C.curb, 0.92)
    for (let offset = -width / 2 + 9; offset < width / 2 - 6; offset += 15) {
      g.fillRect(x + offset, y - height / 2 - 19, 8, 15)
      g.fillRect(x + offset, y + height / 2 + 4, 8, 15)
    }
    for (let offset = -height / 2 + 8; offset < height / 2 - 6; offset += 15) {
      g.fillRect(x - width / 2 - 19, y + offset, 15, 8)
      g.fillRect(x + width / 2 + 4, y + offset, 15, 8)
    }
    g.fillStyle(C.parcel, 0.8)
    for (const dx of [-1, 1]) for (const dy of [-1, 1]) {
      g.fillRect(x + dx * (width / 2 + 16) - 4, y + dy * (height / 2 + 16) - 4, 8, 8)
    }
  }
}
