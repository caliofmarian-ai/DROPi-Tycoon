import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  URBAN_HQ, URBAN_ROADS, URBAN_SPATIAL_CELL_SIZE, isUrbanWalkable, moveUrbanPlayer,
} from '../src/world/urbanWorld'
import { CITY_GROUND_TEXTURE_SCALE } from '../src/world/urbanPresentation'

const worldSource = readFileSync(new URL('../src/world/urbanWorld.ts', import.meta.url), 'utf8')
const presentationSource = readFileSync(new URL('../src/world/urbanPresentation.ts', import.meta.url), 'utf8')

describe('STAB-002 Android render and collision performance architecture', () => {
  it('uses bounded static spatial indexes instead of full-city collision scans', () => {
    expect(URBAN_SPATIAL_CELL_SIZE).toBeGreaterThanOrEqual(128)
    expect(URBAN_SPATIAL_CELL_SIZE).toBeLessThanOrEqual(384)
    expect(worldSource).toContain('const BUILDING_INDEX = indexRects(URBAN_BUILDINGS)')
    expect(worldSource).toContain('const TREE_INDEX = indexTrees(WORLD_DECORATIONS)')
    expect(worldSource).toContain('const WALKABLE_SURFACE_INDEX = indexRects(URBAN_SIDEWALKS)')
    expect(worldSource).not.toContain('URBAN_BUILDINGS.some(building => contains(building, x, y, radius))')
    expect(worldSource).not.toContain('WORLD_DECORATIONS.some(tree => Math.hypot')
  })

  it('skips the unused collision axis for cardinal D-pad movement', () => {
    expect(worldSource).toContain('if (stepX !== 0 && isUrbanWalkable(')
    expect(worldSource).toContain('if (stepY !== 0 && isUrbanWalkable(')
    const moved = moveUrbanPlayer(URBAN_HQ, { x: 1, y: 0 }, 1 / 60, 150)
    expect(moved.x).toBeGreaterThan(URBAN_HQ.x)
    expect(moved.y).toBe(URBAN_HQ.y)
    expect(isUrbanWalkable(moved.x, moved.y)).toBe(true)
  })

  it('preserves road-only collision semantics with the spatial index', () => {
    for (const road of URBAN_ROADS) expect(isUrbanWalkable(road.x, road.y, true)).toBe(true)
  })

  it('bakes the world-wide static vector ground once and reuses a bounded texture', () => {
    expect(CITY_GROUND_TEXTURE_SCALE).toBeGreaterThan(0)
    expect(CITY_GROUND_TEXTURE_SCALE).toBeLessThanOrEqual(0.75)
    expect(presentationSource).toContain('ensureCityGroundTexture')
    expect(presentationSource).toContain('.generateTexture(')
    expect(presentationSource).toContain(".setName('city-ground-cache')")
    expect(presentationSource).not.toContain("setName('city-terrain')")
    expect(presentationSource).not.toContain("setName('city-pavement')")
    expect(presentationSource).not.toContain("setName('city-cast-shadows')")
  })

  it('does not retain the previous full-world grass-blade geometry loop', () => {
    expect(presentationSource).not.toContain('terrain.lineBetween')
    expect(presentationSource).not.toContain('Very sparse, deterministic blades')
  })
})
