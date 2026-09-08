import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { cameraForBounds, cityFitZoom, cityScaleLevel, reserveLabel, SEMANTIC_MAP_LEVELS, visibleMapBounds, zoomMapCamera } from '../src/world/semanticMapCamera'
import { cityGroundTiles, CITY_DETAIL_TILE_LIMIT, CITY_DETAIL_TILE_SIZE } from '../src/world/cityGroundDetail'
import { regionalMapLocalities } from '../src/world/regionalMapCatalog'
import { WORLD_CONTEXT_BUILDINGS, WORLD_HEIGHT, WORLD_WIDTH } from '../src/world/worldLayout'
import { crossingPoint, CENTRAL_CONTROLLED_CROSSING, sampleControlledCrossingPedestrian, yieldHorizontalTrafficAtCrossing } from '../src/world/cityTrafficRules'
import { isUrbanWalkable } from '../src/world/urbanWorld'

const json = (path: string) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'))
const home = json('../public/data/playable-city-location-v1.json')

describe('source-backed semantic zoom', () => {
  it('reaches city detail without the former eight-times world cap and preserves the focal point', () => {
    const focal = { x: 480, y: 220 }, initial = { x: 12, y: 70, scale: .4 }
    const close = zoomMapCamera(initial, focal, 5000, .4, 4800)
    expect(close.scale).toBeGreaterThan(initial.scale * 8)
    expect((focal.x - close.x) / close.scale).toBeCloseTo((focal.x - initial.x) / initial.scale, 8)
    expect((focal.y - close.y) / close.scale).toBeCloseTo((focal.y - initial.y) / initial.scale, 8)
    expect(zoomMapCamera(close, focal, 1 / 5000, .4, 4800)).toEqual(initial)
  })
  it('fits and exposes the full geographic bounds on Android landscape', () => {
    const viewport = { left: 12, top: 62, width: 632, height: 338 }
    const [w,s,e,n] = home.geoBounds
    const b = { left: (w+180)*4, right: (e+180)*4, top: (90-n)*4, bottom: (90-s)*4 }
    const fit = cameraForBounds(b, viewport), visible = visibleMapBounds(fit, viewport)
    expect(visible.left).toBeLessThan(b.left); expect(visible.right).toBeGreaterThan(b.right)
    expect(visible.top).toBeLessThan(b.top); expect(visible.bottom).toBeGreaterThan(b.bottom)
    expect(fit.scale).toBeLessThan(.4 * 12000)
  })
  it('covers the hero-to-world vocabulary and gives the full city a viewport-dependent fit', () => {
    expect(SEMANTIC_MAP_LEVELS).toEqual(['World','Continent','Country','Region','County','City','District','Area','Hero'])
    const fit = cityFitZoom(915, 412, WORLD_WIDTH, WORLD_HEIGHT)
    expect(fit * WORLD_WIDTH).toBeLessThan(915)
    expect(fit * WORLD_HEIGHT).toBeLessThan(412)
    expect([fit,.2,.8,2].map(z => cityScaleLevel(z,fit))).toEqual(['City','District','Area','Hero'])
  })
  it('keeps labels in screen bounds and rejects overlaps', () => {
    const viewport = { left: 12, top: 98, width: 632, height: 210 }, boxes: any[] = []
    expect(reserveLabel(boxes, { left: 20, top: 100, right: 120, bottom: 120 }, viewport)).toBe(true)
    expect(reserveLabel(boxes, { left: 100, top: 110, right: 200, bottom: 130 }, viewport)).toBe(false)
    expect(reserveLabel(boxes, { left: 20, top: 300, right: 120, bottom: 330 }, viewport)).toBe(false)
  })
  it('joins regional records without duplicating the source-reconciled capital or changing national anchors', () => {
    const catalog = json('../public/data/country-representative-localities-v1.json')
    const regional = json('../public/data/europe-romania-regional-localities-v1.json')
    const anchors = catalog.countries['642'], before = structuredClone(anchors)
    const nodes = regionalMapLocalities(anchors, regional)
    expect(anchors).toEqual(before); expect(anchors.length).toBeLessThanOrEqual(9)
    expect(nodes.filter(n => n.role === 'capital')).toHaveLength(1)
    expect(nodes.filter(n => n.localityId === home.localityId)).toHaveLength(1)
    expect(nodes.find(n => n.localityId === home.localityId)).toMatchObject({ name: 'Brăila', latitude: home.latitude, longitude: home.longitude })
    expect(nodes.length).toBeGreaterThanOrEqual(42)
    expect(regionalMapLocalities(anchors, null)).toEqual(anchors)
  })
  it('retains checksum-pinned street and building sources and uses the sourced Romanian county identity', () => {
    const config = json('../../04_World/City_Plans/BRAILA_CONFIG.json')
    for (const [path, hash] of [[config.retainedStreetSource, config.streetSourceSha256], [config.retainedBuildingSource, config.buildingSourceSha256]]) {
      expect(createHash('sha256').update(readFileSync(new URL(`../../${path}`, import.meta.url))).digest('hex')).toBe(hash)
    }
    expect(WORLD_CONTEXT_BUILDINGS.length).toBeGreaterThan(5000)
    const counties = json('../public/data/physical-geography-v1/romania-counties.json')
    expect(counties.features).toHaveLength(42)
    expect(counties.features.find((c: any) => c.regionSourceRef === home.countySourceRef)?.name).toBe('Brăila')
  })
  it('limits decoded terrain and city detail memory independently of worldwide/city footprint counts', () => {
    const manifest = json('../public/data/physical-geography-v1/manifest.json')
    expect(manifest.maximumActiveTiles).toBeLessThanOrEqual(6)
    expect(manifest.tiles).toHaveLength(50)
    const view = { x: 0, y: 0, width: WORLD_WIDTH, height: WORLD_HEIGHT }
    expect(cityGroundTiles(view, .1)).toEqual([])
    const close = cityGroundTiles(view, 1)
    expect(close).toHaveLength(CITY_DETAIL_TILE_LIMIT)
    expect(new Set(close.map(t => t.id)).size).toBe(close.length)
    expect(CITY_DETAIL_TILE_LIMIT * CITY_DETAIL_TILE_SIZE ** 2 * 4).toBeLessThanOrEqual(27 * 1024 * 1024)
  })
  it('keeps rotated pedestrians and yielding traffic on the source pavement', () => {
    const c = CENTRAL_CONTROLLED_CROSSING
    expect(Math.abs(c.roadAngle ?? 0)).toBeGreaterThan(0)
    for (let t=0;t<12;t+=.1) {
      const p = sampleControlledCrossingPedestrian(c,t,{ x:0,y:0,facing:'down',moving:false })
      expect(isUrbanWalkable(p.x,p.y,false,6)).toBe(true)
    }
    const vehicle = { ...crossingPoint(c,-30,0), facing: 'right' as const, moving:true }
    yieldHorizontalTrafficAtCrossing(c,2,vehicle)
    const stop = crossingPoint(c,-c.approachStopOffset,0)
    expect(vehicle.x).toBeCloseTo(stop.x,8); expect(vehicle.y).toBeCloseTo(stop.y,8)
    expect(vehicle.moving).toBe(false); expect(isUrbanWalkable(vehicle.x,vehicle.y,true,6)).toBe(true)
  })
})
