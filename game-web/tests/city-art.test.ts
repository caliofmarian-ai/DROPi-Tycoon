import type Phaser from 'phaser'
import { describe, expect, it, vi } from 'vitest'
import { CITY_COLORS, COLORS } from '../src/ui/theme'
import { drawCityBuilding, ensureNeighborTexture, ensureTreeTexture, storefrontIdentity } from '../src/world/cityArt'
import { drawCityPavement, roadCrossings } from '../src/world/cityGround'
import { drawNeighborhoodNPC, getHQGrowth, renderUrbanNeighborhood } from '../src/world/urbanPresentation'
import { URBAN_BUILDINGS, URBAN_ROADS, URBAN_SIDEWALKS } from '../src/world/urbanWorld'
import { WORLD_ROUTE_POINTS } from '../src/world/worldLayout'
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
    expect(mock.raw.add.image).toHaveBeenCalledWith(0, 0, 'dropi-original-neighbor-v2-shop-1')
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

  it('batches the entire city into six static Graphics while retaining real NPCs and labeled landmarks', () => {
    const mock = mockCityScene()
    expect(renderUrbanNeighborhood(mock.scene)).toBeNull()
    expect(mock.raw.add.graphics).toHaveBeenCalledTimes(6)
    expect(mock.raw.add.container).toHaveBeenCalledTimes(WORLD_ROUTE_POINTS.length)
    const labels = mock.raw.add.text.mock.calls as unknown as [number, number, string][]
    expect(labels.some(([, , text]) => text === 'DROPi')).toBe(true)
    expect(labels.some(([, , text]) => text === 'MAIN DRONEPORT')).toBe(true)
    expect(labels.some(([, , text]) => text === 'FUTURE · LOCKED')).toBe(true)
    expect(labels.some(([, , text]) => text === 'PARCEL STAGING')).toBe(true)
    expect(mock.textures.size).toBeLessThanOrEqual(16)
    expect(mock.calls.some(call => call.method === 'generateTexture' &&
      typeof call.args[1] === 'number' && call.args[1] > 128)).toBe(false)
  })

  it('adds a parked bicycle only when owned, with honest progression and no autonomous activation', () => {
    const company = createInitialCompanyState()
    expect(getHQGrowth(company).ownsBicycle).toBe(false)
    company.vehicles.push({ vehicleId: 'owned-bike', typeId: 'Bicycle' })
    company.level = 3
    const before = structuredClone(company)
    const mock = mockCityScene()
    expect(renderUrbanNeighborhood(mock.scene, company)).not.toBeNull()
    expect(mock.raw.add.graphics).toHaveBeenCalledTimes(7)
    expect(getHQGrowth(company)).toMatchObject({ tier: 3, ownsBicycle: true })
    expect(company).toEqual(before)
  })
})
