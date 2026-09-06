import type Phaser from 'phaser'
import { describe, expect, it, vi } from 'vitest'
import { CITY_COLORS, COLORS } from '../src/ui/theme'
import {
  cityBuildingSign, drawCityBuilding, ensureBuildingTexture, ensureNeighborTexture, ensureTreeTexture, storefrontIdentity,
  NEIGHBOR_ANCHOR, NEIGHBOR_CELL,
} from '../src/world/cityArt'
import { cityDistrictAccents, drawCityDistrictAccents, drawCityPavement, roadCrossings } from '../src/world/cityGround'
import {
  CITY_GROUND_TEXTURE_SCALE, drawNeighborhoodNPC, getHQGrowth, renderUrbanNeighborhood,
} from '../src/world/urbanPresentation'
import { isUrbanWalkable, URBAN_BUILDINGS, URBAN_ROADS, URBAN_SIDEWALKS } from '../src/world/urbanWorld'
import {
  WORLD_DECORATIONS, WORLD_HEIGHT, WORLD_ROUTE_POINTS, WORLD_WIDTH, WORLD_ZONES,
} from '../src/world/worldLayout'
import { createInitialCompanyState } from '../src/state/gameState'

const mockCityScene = () => {
  const textures = new Set<string>()
  const calls: { method: string; args: unknown[] }[] = []
  const graphics = () => {
    const chain = new Proxy({}, {
      get: (_target, method: string) => (...args: unknown[]) => {
        calls.push({ method, args })
        if (method === 'generateTexture') textures.add(args[0] as string)
        return chain
      },
    })
    return chain
  }
  const chain = {
    x: 0, y: 0, width: 80,
    setOrigin: vi.fn().mockReturnThis(), setDepth: vi.fn().mockReturnThis(),
    setScale: vi.fn().mockReturnThis(), setName: vi.fn().mockReturnThis(),
    setAlpha: vi.fn().mockReturnThis(),
  }
  const scene = {
    textures: { exists: (key: string) => textures.has(key) },
    make: { graphics: vi.fn(graphics) },
    add: {
      graphics: vi.fn(graphics), image: vi.fn(() => ({ ...chain })),
      text: vi.fn(() => ({ ...chain })),
      container: vi.fn(() => ({ ...chain })),
    },
  }
  return { scene: scene as unknown as Phaser.Scene, raw: scene, calls, graphics, textures }
}

describe('original dimensional city architecture', () => {
  it.each([
    ["Mara's Market", 'market'], ['SUNBEAM CAFÉ', 'cafe'], ['CITY PHARMACY', 'pharmacy'],
    ['Cedar Bakery', 'bakery'], ['Garden Florist', 'flowers'], ['BLOOM & STEM', 'flowers'],
    ['Canal Grocers', 'market'], ['Neighborhood Co-op', 'market'], ['Quayside Kitchen', 'cafe'],
  ])('identifies the %s storefront', (name, expected) => {
    expect(storefrontIdentity(name)).toBe(expected)
  })

  it.each(['home', 'shop', 'hq', 'depot'] as const)('draws layered %s art from the collision footprint', kind => {
    const mock = mockCityScene()
    const building = URBAN_BUILDINGS.find(entry => entry.kind === kind)!
    const sign = drawCityBuilding(mock.graphics() as Phaser.GameObjects.Graphics,
      mock.graphics() as Phaser.GameObjects.Graphics, building, { name: 'MARA MARKET', variant: 2 })
    expect(sign.signX).toBe(building.x)
    expect(sign.signWidth).toBeLessThan(building.width)
    expect(mock.calls.some(call => call.method === 'fillStyle' && call.args[0] === CITY_COLORS.shadow)).toBe(true)
    expect(mock.calls.some(call => call.method === 'fillStyle' && call.args[0] === CITY_COLORS.cream)).toBe(true)
    expect(mock.calls.filter(call => call.method.startsWith('fill')).length).toBeGreaterThan(25)
    if (kind === 'hq') expect(mock.calls.some(call => call.method === 'fillStyle' && call.args[0] === COLORS.accentStrong)).toBe(true)
  })

  it('draws the modeled northern door, rather than pointing its access path at blank masonry', () => {
    const mock = mockCityScene()
    const building = URBAN_BUILDINGS.find(entry => entry.entranceFacing === 'up')!
    drawCityBuilding(mock.graphics() as Phaser.GameObjects.Graphics, mock.graphics() as Phaser.GameObjects.Graphics,
      building, { name: 'CO-OP', variant: 0 })
    expect(mock.calls.some(call => call.method === 'fillRect' &&
      call.args[0] === building.door.x - 15 && call.args[1] === building.door.y &&
      call.args[2] === 30 && call.args[3] === 20)).toBe(true)
  })

  it('shares multi-lobed original tree textures and does not allocate Graphics per tree instance', () => {
    const mock = mockCityScene()
    const key = ensureTreeTexture(mock.scene, 0)
    expect(ensureTreeTexture(mock.scene, 4)).toBe(key)
    expect(mock.raw.make.graphics).toHaveBeenCalledTimes(1)
    expect(mock.calls.filter(call => call.method === 'fillCircle')).toHaveLength(12)
    expect(mock.calls.filter(call => call.method === 'fillEllipse').length).toBeGreaterThan(12)
    expect(mock.calls.find(call => call.method === 'generateTexture')?.args).toEqual([key, 96, 104])
  })

  it('gives neighbors reusable dressed-person textures, capped at six variants per role', () => {
    const mock = mockCityScene()
    expect(ensureNeighborTexture(mock.scene, true, 1)).toBe(ensureNeighborTexture(mock.scene, true, 7))
    expect(mock.raw.make.graphics).toHaveBeenCalledTimes(1)
    drawNeighborhoodNPC(mock.scene, 300, 400, true, 7)
    expect(mock.raw.make.graphics).toHaveBeenCalledTimes(1)
    expect(mock.raw.add.container).toHaveBeenCalledWith(300, 400, expect.any(Array))
    expect(mock.raw.add.image).toHaveBeenCalledWith(0, 0, 'dropi-original-neighbor-v3-shop-1')
    expect(mock.raw.add.image.mock.results[0].value.setOrigin).toHaveBeenCalledWith(
      NEIGHBOR_ANCHOR.x / NEIGHBOR_CELL, NEIGHBOR_ANCHOR.y / NEIGHBOR_CELL)
  })

  it('gives every small shop a rooftop identity badge and a category-specific awning', () => {
    const building = URBAN_BUILDINGS.find(entry => entry.kind === 'shop')!
    for (const [identity, color] of [
      ['pharmacy', CITY_COLORS.leafDark], ['flowers', CITY_COLORS.flowerPink], ['goods', CITY_COLORS.roofBlue],
    ] as const) {
      const mock = mockCityScene()
      drawCityBuilding(mock.graphics() as Phaser.GameObjects.Graphics,
        mock.graphics() as Phaser.GameObjects.Graphics, building, { name: identity, identity, variant: 0 })
      expect(mock.calls.some(call => call.method === 'strokeCircle' && call.args[2] === 13)).toBe(true)
      expect(mock.calls.some(call => call.method === 'fillStyle' && call.args[0] === color)).toBe(true)
    }
  })

  it('adds bounded rooftop panels as HQ grows without changing its footprint', () => {
    const building = URBAN_BUILDINGS.find(entry => entry.kind === 'hq')!
    for (const tier of [1, 2, 3, 99]) {
      const mock = mockCityScene()
      drawCityBuilding(mock.graphics() as Phaser.GameObjects.Graphics,
        mock.graphics() as Phaser.GameObjects.Graphics, building, { name: 'DROPi', variant: 0, growthTier: tier })
      expect(mock.calls.filter(call => call.method === 'strokeRoundedRect' &&
        call.args[2] === building.width - 55 && call.args[3] === 9)).toHaveLength(Math.min(3, tier))
    }
  })

  it('shares small padded facade textures by appearance, not world position or shop name', () => {
    const mock = mockCityScene()
    const building = URBAN_BUILDINGS.find(entry => entry.kind === 'shop')!
    const art = { name: 'Cedar Bakery', variant: 1 }
    const key = ensureBuildingTexture(mock.scene, building, art)
    expect(ensureBuildingTexture(mock.scene, { ...building, id: 'another-bakery', x: 2000, y: 2000 },
      { ...art, name: 'Bread Shop', variant: 4 })).toBe(key)
    expect(mock.raw.make.graphics).toHaveBeenCalledTimes(1)
    expect(mock.calls.find(call => call.method === 'generateTexture')?.args).toEqual([
      key, building.width + 48, building.height + 48,
    ])
    expect(ensureBuildingTexture(mock.scene, building, { name: 'Pharmacy', variant: 1 })).not.toBe(key)
    expect(ensureBuildingTexture(mock.scene, {
      ...building, entranceFacing: building.entranceFacing === 'up' ? 'down' : 'up',
    }, art)).not.toBe(key)
    const direct = drawCityBuilding(mock.graphics() as Phaser.GameObjects.Graphics,
      mock.graphics() as Phaser.GameObjects.Graphics, building, art)
    expect(cityBuildingSign(building, art)).toEqual(direct)
  })

  it('derives crosswalks from actual intersections, deduplicating contiguous road segments', () => {
    const roads = [
      { id: 'left', x: 50, y: 100, width: 100, height: 30 },
      { id: 'right', x: 150, y: 100, width: 100, height: 30 },
      { id: 'vertical', x: 100, y: 150, width: 40, height: 200 },
      { id: 'unconnected', x: 400, y: 400, width: 30, height: 100 },
    ]
    expect(roadCrossings(roads)).toEqual([{ x: 100, y: 100, width: 40, height: 30 }])
  })

  it('paints the exact road/pavement model using central warm cream and blue asphalt tokens', () => {
    const mock = mockCityScene()
    drawCityPavement(mock.graphics() as Phaser.GameObjects.Graphics, URBAN_ROADS, URBAN_SIDEWALKS)
    for (const road of URBAN_ROADS) {
      expect(mock.calls.some(call => call.method === 'fillRect' &&
        JSON.stringify(call.args) === JSON.stringify([road.x - road.width / 2, road.y - road.height / 2, road.width, road.height]))).toBe(true)
    }
    for (const color of [CITY_COLORS.road, CITY_COLORS.sidewalk, CITY_COLORS.curb]) {
      expect(mock.calls.some(call => call.method === 'fillStyle' && call.args[0] === color)).toBe(true)
    }
  })

  it('places original canals and garden beds only in non-traversable district gaps', () => {
    const accents = cityDistrictAccents(WORLD_ZONES, URBAN_SIDEWALKS, URBAN_BUILDINGS, WORLD_DECORATIONS)
    expect(accents.filter(accent => accent.kind === 'canal')).toHaveLength(2)
    expect(accents.filter(accent => accent.kind === 'garden')).toHaveLength(2)
    expect(cityDistrictAccents(WORLD_ZONES, URBAN_SIDEWALKS, URBAN_BUILDINGS, WORLD_DECORATIONS)).toEqual(accents)
    for (const accent of accents) {
      for (let x = accent.x - accent.width / 2; x <= accent.x + accent.width / 2; x += 16) {
        for (let y = accent.y - accent.height / 2; y <= accent.y + accent.height / 2; y += 8) {
          expect(isUrbanWalkable(x, y, false, 0), `${accent.id}: ${x},${y}`).toBe(false)
        }
      }
    }
    const mock = mockCityScene()
    drawCityDistrictAccents(mock.graphics() as Phaser.GameObjects.Graphics, accents)
    for (const color of [CITY_COLORS.water, CITY_COLORS.waterLight, CITY_COLORS.flowerPink, CITY_COLORS.leafSun]) {
      expect(mock.calls.some(call => ['fillStyle', 'lineStyle'].includes(call.method) && call.args.includes(color))).toBe(true)
    }
  })

  it('omits a landscape pocket if a new path, building or tree occupies it', () => {
    const accents = cityDistrictAccents(WORLD_ZONES, URBAN_SIDEWALKS, URBAN_BUILDINGS, WORLD_DECORATIONS)
    const pocket = accents[0]
    const intrusion = { id: 'new-path', x: pocket.x, y: pocket.y, width: 5, height: 5 }
    expect(cityDistrictAccents(WORLD_ZONES, [...URBAN_SIDEWALKS, intrusion], URBAN_BUILDINGS, WORLD_DECORATIONS))
      .not.toContainEqual(pocket)
    expect(cityDistrictAccents(WORLD_ZONES, URBAN_SIDEWALKS, [...URBAN_BUILDINGS, intrusion], WORLD_DECORATIONS))
      .not.toContainEqual(pocket)
    expect(cityDistrictAccents(WORLD_ZONES, URBAN_SIDEWALKS, URBAN_BUILDINGS, [...WORLD_DECORATIONS, {
      id: 'new-tree', x: pocket.x, y: pocket.y, radius: 14, zoneId: 'waterfront',
    }])).not.toContainEqual(pocket)
  })

  it('caches static ground and keeps only local HQ Graphics with shared facade sprites', () => {
    const mock = mockCityScene()
    expect(renderUrbanNeighborhood(mock.scene)).toBeNull()
    expect(mock.raw.add.graphics).toHaveBeenCalledTimes(1)
    expect(mock.raw.add.container).toHaveBeenCalledTimes(WORLD_ROUTE_POINTS.length)
    const labels = mock.raw.add.text.mock.calls as unknown as [number, number, string][]
    expect(labels.some(([, , text]) => text === 'DROPi')).toBe(true)
    expect(labels.some(([, , text]) => text === 'MAIN DRONEPORT')).toBe(true)
    expect(labels.some(([, , text]) => text === 'FUTURE · LOCKED')).toBe(true)
    expect(labels.some(([, , text]) => text === 'PARCEL STAGING')).toBe(true)
    expect(mock.textures.size).toBeLessThanOrEqual(49)
    const groundTexture = mock.calls.find(call => call.method === 'generateTexture' &&
      call.args[0] === 'dropi-city-static-ground-v1')
    expect(groundTexture?.args).toEqual([
      'dropi-city-static-ground-v1',
      Math.ceil(WORLD_WIDTH * CITY_GROUND_TEXTURE_SCALE),
      Math.ceil(WORLD_HEIGHT * CITY_GROUND_TEXTURE_SCALE),
    ])
    const generatedBytes = mock.calls.filter(call => call.method === 'generateTexture')
      .reduce((sum, call) => sum + (call.args[1] as number) * (call.args[2] as number) * 4, 0)
    expect(generatedBytes).toBeLessThan(12 * 1024 * 1024)
    expect(mock.raw.add.image).toHaveBeenCalledTimes(1 + URBAN_BUILDINGS.length +
      WORLD_DECORATIONS.length + WORLD_ROUTE_POINTS.length)
    expect(mock.raw.add.image).toHaveBeenCalledWith(0, 0, 'dropi-city-static-ground-v1')
    for (const tree of WORLD_DECORATIONS) {
      const index = mock.raw.add.image.mock.calls.findIndex(args => (args as unknown[])[0] === tree.x &&
        (args as unknown[])[1] === tree.y)
      const image = mock.raw.add.image.mock.results[index].value
      expect(image.setOrigin).toHaveBeenCalledWith(0.5, 94 / 104)
      expect(image.setScale).toHaveBeenCalledWith(tree.radius / 16)
      expect(96 * tree.radius / 16).toBeGreaterThanOrEqual(75)
    }
  })

  it('adds a parked bicycle only when owned, with honest progression and no autonomous activation', () => {
    const company = createInitialCompanyState()
    expect(getHQGrowth(company).ownsBicycle).toBe(false)
    company.vehicles.push({ vehicleId: 'owned-bike', typeId: 'Bicycle' })
    company.level = 3
    const before = structuredClone(company)
    const mock = mockCityScene()
    expect(renderUrbanNeighborhood(mock.scene, company)).not.toBeNull()
    expect(mock.raw.add.graphics).toHaveBeenCalledTimes(2)
    expect(getHQGrowth(company)).toMatchObject({ tier: 3, ownsBicycle: true })
    expect(company).toEqual(before)
  })

  it('labels the actual company level even after its bounded HQ art reaches the final stage', () => {
    const company = createInitialCompanyState()
    company.level = 7
    const before = structuredClone(company)
    const mock = mockCityScene()
    renderUrbanNeighborhood(mock.scene, company)
    expect(getHQGrowth(company)).toMatchObject({ level: 7, tier: 3 })
    const labels = mock.raw.add.text.mock.calls as unknown as [number, number, string][]
    expect(labels.some(([, , text]) => text === 'LEVEL 7 DEPOT')).toBe(true)
    expect(labels.some(([, , text]) => text === 'LEVEL 3 DEPOT')).toBe(false)
    expect(company).toEqual(before)
  })
})
