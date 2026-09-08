import { readFileSync } from 'node:fs'
import type { CountryLocalityCatalog } from '../src/world/countryLayerNodes'
import { describe, expect, it } from 'vitest'
import {
  countryAtMapPoint,
  decodeWorldTopology,
  pointInRing,
  type WorldTopology,
  wrappedRingCopies,
} from '../src/world/globalMapTopology'
import { fitGlobalMapScale, globalMapViewport } from '../src/world/globalMapViewport'
import { resolveNativeBackTarget } from '../src/platform/nativeBackNavigation'

const topology = JSON.parse(readFileSync(
  new URL('../public/data/world-atlas-countries-110m.json', import.meta.url),
  'utf8',
)) as WorldTopology
const localityCatalog = JSON.parse(readFileSync(
  new URL('../public/data/country-representative-localities-v1.json', import.meta.url),
  'utf8',
)) as CountryLocalityCatalog

const configSource = readFileSync(new URL('../src/config/gameConfig.ts', import.meta.url), 'utf8')
const worldSource = readFileSync(new URL('../src/scenes/GameWorldScene.ts', import.meta.url), 'utf8')
const hudSource = readFileSync(new URL('../src/ui/UrbanHUD.ts', import.meta.url), 'utf8')
const mapSource = readFileSync(new URL('../src/scenes/GlobalMapScene.ts', import.meta.url), 'utf8')

describe('Global Map runtime #418', () => {
  it('materializes sparse real-world locality nodes for country drill-down', () => {
    const romania = localityCatalog.countries['642'] ?? []
    const ireland = localityCatalog.countries['372'] ?? []
    expect(romania.find(node => node.role === 'capital')?.name).toMatch(/Bucharest|Bucuresti/)
    expect(ireland.find(node => node.role === 'capital')?.name).toBe('Dublin')
    expect(romania.length).toBeLessThanOrEqual(9)
    expect(ireland.length).toBeLessThanOrEqual(9)
    expect(Object.values(localityCatalog.countries).every(nodes => nodes.length <= 9)).toBe(true)
    expect(localityCatalog.stats.countriesWithRepresentativeNodes).toBeGreaterThan(150)
    expect(localityCatalog.source.upstreamCommit).toBe('ca96624a56bd078437bca8184e78163e5039ad19')
    const northIreland = ireland.find(node => node.role === 'urban' && node.sector === 'N')
    expect(!northIreland || northIreland.populationReference >= 15000 || northIreland.sourceFeatureClass.includes('Admin-1 capital')).toBe(true)
  })

  it('loads the pinned local country topology as real selectable geography', () => {
    const countries = decodeWorldTopology(topology, 1440, 720)
    const names = new Set(countries.map(country => country.name))

    expect(countries.length).toBeGreaterThan(150)
    expect(names.has('Ireland')).toBe(true)
    expect(names.has('Romania')).toBe(true)
    expect(countries.every(country => country.polygons.length > 0)).toBe(true)
    expect(countries.every(country => Number.isFinite(country.area) && country.area > 0)).toBe(true)
  })

  it('selects the smallest containing country geometry rather than hiding it under a larger polygon', () => {
    const big = {
      id: 'big', name: 'Big', area: 100,
      polygons: [[[ { x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 } ]]],
      primaryBounds: { left: 0, top: 0, right: 10, bottom: 10 },
    }
    const small = {
      id: 'small', name: 'Small', area: 4,
      polygons: [[[ { x: 4, y: 4 }, { x: 6, y: 4 }, { x: 6, y: 6 }, { x: 4, y: 6 } ]]],
      primaryBounds: { left: 4, top: 4, right: 6, bottom: 6 },
    }

    expect(pointInRing({ x: 5, y: 5 }, big.polygons[0][0])).toBe(true)
    expect(countryAtMapPoint([big, small], { x: 5, y: 5 }, 100)?.id).toBe('small')
  })

  it('wraps antimeridian geometry without drawing one giant false polygon across the world', () => {
    const ring = [
      { x: 1420, y: 100 }, { x: 1460, y: 100 }, { x: 1460, y: 150 }, { x: 1420, y: 150 },
    ]
    const copies = wrappedRingCopies(ring, 1440)
    expect(copies.length).toBe(2)
    expect(copies.some(copy => copy.some(point => point.x < 30))).toBe(true)
  })

  it('keeps the map touch-sized and bounded on the Android landscape viewport', () => {
    const viewport = globalMapViewport(915, 412)
    const scale = fitGlobalMapScale(viewport)
    expect(viewport.width).toBeGreaterThan(500)
    expect(viewport.height).toBeGreaterThan(300)
    expect(scale).toBeGreaterThan(0)
    expect(mapSource).toContain('TOUCH_TARGET_MIN_PX')
    expect(mapSource).toContain("'Open country view'")
    expect(mapSource).toContain('event.stopPropagation()')
  })

  it('integrates map navigation without using the ordinary save/menu transition', () => {
    expect(configSource).toContain('GlobalMapScene')
    expect(hudSource).toContain("'World map', callbacks.worldMap")
    expect(worldSource).toContain("this.scene.start('GlobalMap')")
    expect(worldSource).toContain('this.syncRuntimeSession()')
    expect(resolveNativeBackTarget('GlobalMap')).toBe('GameWorld')
  })

  it('keeps strategic map inspection non-teleporting and honest about inactive economy overlays', () => {
    expect(mapSource).toContain("simulation: 'GeometryOnly'")
    expect(mapSource).toContain("economy: 'NotActivated'")
    expect(mapSource).toContain("logistics: 'NotActivated'")
    expect(mapSource).toContain('No player, cargo or company state is moved by map inspection.')
    expect(mapSource).not.toContain('player.x =')
    expect(mapSource).not.toContain('player.y =')
    expect(mapSource).toContain('repaintCountryLocalities')
    expect(mapSource).toContain('selectedLocality')
    const applyTransform = mapSource.slice(mapSource.indexOf('private applyMapTransform'), mapSource.indexOf('private screenToMap'))
    expect(applyTransform).not.toContain('repaintCountryLocalities()')
    expect(mapSource).not.toContain('GeometryOnly')
    expect(mapSource).not.toContain('NotActivated')
  })
})
