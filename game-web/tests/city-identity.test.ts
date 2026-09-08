import type Phaser from 'phaser'
import { describe, expect, it } from 'vitest'
import {
  CITY_ADDRESS_PLAQUES,
  CITY_STREET_SIGNS,
  DISTRICT_IDENTITY_PROFILES,
  STREET_NAME_BY_ROAD_ID,
  drawDistrictIdentityGround,
} from '../src/world/cityIdentity'
import { WORLD_BUILDINGS, WORLD_ROADS, WORLD_ZONES } from '../src/world/worldLayout'

const graphicsRecorder = () => {
  const calls: { method: string; args: unknown[] }[] = []
  const chain = new Proxy({}, {
    get: (_target, method: string) => (...args: unknown[]) => {
      calls.push({ method, args })
      return chain
    },
  })
  return { graphics: chain as Phaser.GameObjects.Graphics, calls }
}

describe('Cedar City visible district identity', () => {
  it('gives every existing district a unique authored visual cue', () => {
    expect(DISTRICT_IDENTITY_PROFILES).toHaveLength(WORLD_ZONES.length)
    expect(new Set(DISTRICT_IDENTITY_PROFILES.map(profile => profile.zoneId))).toEqual(
      new Set(WORLD_ZONES.map(zone => zone.id)),
    )
    expect(new Set(DISTRICT_IDENTITY_PROFILES.map(profile => profile.cueKind)).size).toBe(6)
    expect(DISTRICT_IDENTITY_PROFILES.every(profile => Number.isInteger(profile.accent))).toBe(true)
  })

  it('draws district storytelling into one bounded static graphics pass', () => {
    const mock = graphicsRecorder()
    drawDistrictIdentityGround(mock.graphics)
    expect(mock.calls.length).toBeGreaterThan(45)
    expect(mock.calls.length).toBeLessThan(180)
    expect(mock.calls.some(call => call.method === 'fillRoundedRect')).toBe(true)
    expect(mock.calls.some(call => call.method === 'strokeRoundedRect')).toBe(true)
    expect(mock.calls.some(call => call.method === 'fillCircle')).toBe(true)
    expect(mock.calls.some(call => call.method === 'lineBetween')).toBe(true)
  })

  it('publishes a small stable street-sign set backed by real authored roads', () => {
    expect(CITY_STREET_SIGNS.length).toBeGreaterThanOrEqual(8)
    expect(CITY_STREET_SIGNS.length).toBeLessThanOrEqual(12)
    expect(new Set(CITY_STREET_SIGNS.map(sign => sign.roadId)).size).toBe(CITY_STREET_SIGNS.length)
    expect(new Set(CITY_STREET_SIGNS.map(sign => sign.name)).size).toBe(CITY_STREET_SIGNS.length)
    for (const sign of CITY_STREET_SIGNS) {
      expect(WORLD_ROADS.some(road => road.id === sign.roadId), sign.roadId).toBe(true)
      expect(STREET_NAME_BY_ROAD_ID[sign.roadId]).toBe(sign.name)
      expect(Number.isFinite(sign.x) && Number.isFinite(sign.y)).toBe(true)
    }
    expect(CITY_STREET_SIGNS.some(sign => sign.name === 'Cedar Avenue')).toBe(true)
    expect(CITY_STREET_SIGNS.some(sign => sign.name === 'Station Street')).toBe(true)
    expect(CITY_STREET_SIGNS.some(sign => sign.name === 'Foundry Road')).toBe(true)
    expect(CITY_STREET_SIGNS.some(sign => sign.name === 'Garden Walk')).toBe(true)
  })

  it('keeps address plaques bounded, stable and attached to physical buildings', () => {
    expect(CITY_ADDRESS_PLAQUES.length).toBeGreaterThanOrEqual(12)
    expect(CITY_ADDRESS_PLAQUES.length).toBeLessThanOrEqual(18)
    expect(new Set(CITY_ADDRESS_PLAQUES.map(plaque => plaque.buildingId)).size).toBe(CITY_ADDRESS_PLAQUES.length)
    expect(CITY_ADDRESS_PLAQUES.find(plaque => plaque.buildingId === 'main-hq')?.number).toBe(1)
    expect(CITY_ADDRESS_PLAQUES.find(plaque => plaque.buildingId === 'business-1')?.number).toBe(10)
    for (const plaque of CITY_ADDRESS_PLAQUES) {
      const building = WORLD_BUILDINGS.find(candidate => candidate.id === plaque.buildingId)
      expect(building, plaque.buildingId).toBeDefined()
      expect(plaque.number).toBeGreaterThan(0)
      expect(plaque.number).toBeLessThan(100)
      expect(plaque.x).toBeGreaterThanOrEqual(building!.x - building!.width / 2)
      expect(plaque.x).toBeLessThanOrEqual(building!.x + building!.width / 2)
      expect(plaque.y).toBeGreaterThanOrEqual(building!.y - building!.height / 2)
      expect(plaque.y).toBeLessThanOrEqual(building!.y + building!.height / 2)
    }
  })
})
