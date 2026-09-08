import { readFileSync } from 'node:fs'
import type { CountryLocalityCatalog } from '../src/world/countryLayerNodes'
import {
  semanticEntryForCountry,
  semanticPlaceRoleForLocality,
  validateSemanticEntrySources,
  type CountrySemanticCatalog,
} from '../src/world/countrySemanticMetadata'
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
const semanticCatalog = JSON.parse(readFileSync(
  new URL('../public/data/country-semantic-metadata-v1.json', import.meta.url),
  'utf8',
)) as CountrySemanticCatalog
const roleOverrideRegistry = JSON.parse(readFileSync(
  new URL('../../04_World/Country_Catalog/COUNTRY_LOCALITY_ROLE_OVERRIDES.json', import.meta.url),
  'utf8',
)) as {
  version: string
  source: { upstreamCommit: string }
  entries: Record<string, unknown>
}

const configSource = readFileSync(new URL('../src/config/gameConfig.ts', import.meta.url), 'utf8')
const worldSource = readFileSync(new URL('../src/scenes/GameWorldScene.ts', import.meta.url), 'utf8')
const hudSource = readFileSync(new URL('../src/ui/UrbanHUD.ts', import.meta.url), 'utf8')
const mapSource = readFileSync(new URL('../src/scenes/GlobalMapScene.ts', import.meta.url), 'utf8')

const PINNED_POPULATED_PLACES_COMMIT = 'ca96624a56bd078437bca8184e78163e5039ad19'
const CAPITAL_ROLE_OVERRIDE_IDS = ['068', '104', '108', '144', '152', '204', '226', '275', '376', '384', '392', '710', '834']

describe('Global Map runtime #418', () => {
  it('materializes sparse real-world locality nodes for country drill-down', () => {
    const romania = localityCatalog.countries['642'] ?? []
    const ireland = localityCatalog.countries['372'] ?? []
    const unitedKingdom = localityCatalog.countries['826'] ?? []
    const kosovo = localityCatalog.countries['XKX'] ?? []
    const northernCyprus = localityCatalog.countries['XNC'] ?? []
    const somaliland = localityCatalog.countries['XSL'] ?? []
    const japan = localityCatalog.countries['392'] ?? []
    const myanmar = localityCatalog.countries['104'] ?? []
    const sriLanka = localityCatalog.countries['144'] ?? []
    const chile = localityCatalog.countries['152'] ?? []

    expect(romania.find(node => node.role === 'capital')?.name).toMatch(/Bucharest|Bucuresti/)
    expect(ireland.find(node => node.role === 'capital')?.name).toBe('Dublin')
    expect(unitedKingdom.find(node => node.role === 'capital')?.name).toBe('London')
    expect(unitedKingdom.some(node => node.name === 'Hamilton')).toBe(false)
    expect(kosovo.find(node => node.role === 'capital')?.name).toBe('Pristina')
    expect(northernCyprus).toEqual([])
    expect(somaliland.find(node => node.role === 'capital')?.name).toBe('Hargeysa')

    expect(japan.find(node => node.role === 'capital')?.name).toBe('Tokyo')
    expect(japan.find(node => node.name === 'Kyoto')?.role).not.toBe('capital')
    expect(myanmar.find(node => node.role === 'capital')?.name).toBe('Nay Pyi Taw')
    expect(myanmar.find(node => node.name === 'Yangon')?.role).not.toBe('capital')
    expect(sriLanka.find(node => node.role === 'capital')?.name).toBe('Sri Jayewardenepura Kotte')
    expect(sriLanka.find(node => node.name === 'Colombo')?.role).not.toBe('capital')
    expect(chile.find(node => node.role === 'capital')?.name).toBe('Santiago')
    expect(chile.find(node => node.name === 'Valparaíso')?.role).not.toBe('capital')

    expect(localityCatalog.geometryIdentity?.byRenderedName['N. Cyprus']).toBe('XNC')
    expect(localityCatalog.geometryIdentity?.byRenderedName.Somaliland).toBe('XSL')
    expect(localityCatalog.geometryIdentity?.byRenderedName.Kosovo).toBe('XKX')
    expect(localityCatalog.countries.None).toBeUndefined()
    expect(romania.length).toBeLessThanOrEqual(9)
    expect(ireland.length).toBeLessThanOrEqual(9)
    expect(Object.values(localityCatalog.countries).every(nodes => nodes.length <= 9)).toBe(true)
    expect(localityCatalog.stats.countriesWithRepresentativeNodes).toBeGreaterThan(150)
    expect(localityCatalog.source.upstreamCommit === PINNED_POPULATED_PLACES_COMMIT).toBe(true)
    const northIreland = ireland.find(node => node.role === 'urban' && node.sector === 'N')
    expect(!northIreland || northIreland.populationReference >= 15000 || northIreland.sourceFeatureClass.includes('Admin-1 capital')).toBe(true)
  })

  it('governs source-backed capital corrections without hardcoded coordinates', () => {
    expect(roleOverrideRegistry.version).toBe('1.6.0')
    expect(roleOverrideRegistry.source.upstreamCommit).toBe(PINNED_POPULATED_PLACES_COMMIT)
    expect(Object.keys(roleOverrideRegistry.entries).sort()).toEqual(CAPITAL_ROLE_OVERRIDE_IDS)
    expect(JSON.stringify(roleOverrideRegistry)).not.toContain('longitude')
    expect(JSON.stringify(roleOverrideRegistry)).not.toContain('latitude')

    expect(localityCatalog.version).toBe('1.9.0')
    expect(localityCatalog.localityRoleOverrides?.registryVersion).toBe(roleOverrideRegistry.version)
    expect(localityCatalog.localityRoleOverrides?.sourceCommit).toBe(PINNED_POPULATED_PLACES_COMMIT)
    expect(localityCatalog.localityRoleOverrides?.countryIds).toEqual(CAPITAL_ROLE_OVERRIDE_IDS)
  })

  it('keeps special-status and current-capital semantics source-governed', () => {
    const kosovo = semanticEntryForCountry(semanticCatalog, 'XKX')
    const northernCyprus = semanticEntryForCountry(semanticCatalog, 'XNC')
    const somaliland = semanticEntryForCountry(semanticCatalog, 'XSL')
    const japan = semanticEntryForCountry(semanticCatalog, '392')
    const myanmar = semanticEntryForCountry(semanticCatalog, '104')
    const sriLanka = semanticEntryForCountry(semanticCatalog, '144')
    const chile = semanticEntryForCountry(semanticCatalog, '152')

    expect(semanticCatalog.version).toBe('1.9.0')
    expect(semanticCatalog.governance.geographyDoesNotAssertSovereignty).toBe(true)
    expect(semanticCatalog.governance.projectGeometryIdsAreNonISO).toBe(true)
    expect(semanticCatalog.governance.localityCoordinatesRemainSourceBacked).toBe(true)
    expect(Object.values(semanticCatalog.entries).every(entry => validateSemanticEntrySources(semanticCatalog, entry))).toBe(true)
    expect(Object.values(semanticCatalog.sources).every(source => source.url.startsWith('https://'))).toBe(true)

    expect(kosovo?.issue).toBe(478)
    expect(semanticPlaceRoleForLocality(kosovo, 'Pristina')?.label).toBe('Capital / administrative centre')
    expect(kosovo?.statusSummary).toContain('without taking a sovereignty position')

    expect(northernCyprus?.issue).toBe(481)
    expect(northernCyprus?.placeRoles).toEqual([])
    expect(northernCyprus?.coverageNote).toContain('leaves locality coverage empty rather than inventing places')

    expect(somaliland?.issue).toBe(482)
    expect(semanticPlaceRoleForLocality(somaliland, 'Hargeysa')?.label).toBe('Principal administrative centre')
    expect(somaliland?.statusSummary).toContain('26 December 2025')

    expect(japan?.issue).toBe(464)
    expect(semanticPlaceRoleForLocality(japan, 'Tokyo')?.label).toBe('National capital')
    expect(semanticPlaceRoleForLocality(japan, 'Kyoto')?.label).toBe('Representative city')

    expect(myanmar?.issue).toBe(465)
    expect(semanticPlaceRoleForLocality(myanmar, 'Nay Pyi Taw')?.label).toBe('National capital')
    expect(semanticPlaceRoleForLocality(myanmar, 'Yangon')?.label).toBe('Commercial hub')

    expect(sriLanka?.issue).toBe(466)
    expect(semanticPlaceRoleForLocality(sriLanka, 'Sri Jayewardenepura Kotte')?.label).toBe('Administrative / national capital')
    expect(semanticPlaceRoleForLocality(sriLanka, 'Colombo')?.label).toBe('Commercial capital')

    expect(chile?.issue).toBe(473)
    expect(semanticPlaceRoleForLocality(chile, 'Santiago')?.label).toBe('National capital')
    expect(semanticPlaceRoleForLocality(chile, 'Valparaíso')?.label).toBe('National Congress seat / representative city')
  })

  it('loads the pinned local country topology as real selectable geography', () => {
    const countries = decodeWorldTopology(topology, 1440, 720, localityCatalog.geometryIdentity?.byRenderedName ?? {})
    const names = new Set(countries.map(country => country.name))

    expect(countries.length).toBeGreaterThan(150)
    expect(names.has('Ireland')).toBe(true)
    expect(names.has('Romania')).toBe(true)
    expect(countries.find(country => country.name === 'N. Cyprus')?.id).toBe('XNC')
    expect(countries.find(country => country.name === 'Somaliland')?.id).toBe('XSL')
    expect(countries.find(country => country.name === 'Kosovo')?.id).toBe('XKX')
    expect(countries.every(country => !country.id.startsWith('unresolved:'))).toBe(true)
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
    expect(mapSource).toContain('country-semantic-metadata-v1.json')
    expect(mapSource).toContain('semanticEntryForCountry')
    expect(mapSource).toContain('roleOverride?.label')
  })

  it('integrates map navigation without using the ordinary save/menu transition', () => {
    expect(configSource).toContain('GlobalMapScene')
    expect(hudSource).toContain("'World map', callbacks.worldMap")
    expect(worldSource).toContain("this.scene.launch('GlobalMap', { focus })")
    expect(worldSource).toContain('this.syncRuntimeSession()')
    expect(resolveNativeBackTarget('GlobalMap')).toBe('GameWorld')
  })

  it('keeps strategic inspection non-teleporting and honest about simulation boundaries', () => {
    expect(mapSource).toContain('Real terrain, rivers and lakes.')
    expect(mapSource).toContain('City plan pending')
    expect(mapSource).toContain('Opening the map never moves the player, cargo or company.')
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
