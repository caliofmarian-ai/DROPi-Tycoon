import Phaser from 'phaser'
import { countryAtMapPoint, decodeWorldTopology, wrappedRingCopies, type GlobalCountryGeometry, type MapBounds, type MapPoint, type WorldTopology } from '../world/globalMapTopology'
import { COLORS, RADII, TOUCH_TARGET_MIN_PX, TYPOGRAPHY } from '../ui/theme'
import { geometryIdentityByRenderedName, localityNodesForCountry, projectLocalityToGlobalMap, type CountryLocalityCatalog } from '../world/countryLayerNodes'
import { semanticEntryForCountry, semanticPlaceRoleForLocality, type CountrySemanticCatalog } from '../world/countrySemanticMetadata'
import { fitGlobalMapScale, GLOBAL_MAP_HEIGHT as MAP_HEIGHT, GLOBAL_MAP_WIDTH as MAP_WIDTH, globalMapViewport, type GlobalMapViewportRect as ViewportRect } from '../world/globalMapViewport'
import { cameraForBounds, boundsOverlap, clamp, reserveLabel, visibleMapBounds, zoomMapCamera, type MapCamera } from '../world/semanticMapCamera'
import { regionalCatalogIndex, regionalMapLocalities, type MapLocality, type RegionalCatalog } from '../world/regionalMapCatalog'
import { ReliefTileLayer, geoBoundsToMap, geoPathToMap, type PhysicalFeature, type ReliefManifest } from '../world/physicalMapLayer'

const COUNTRY_DATA_KEY = 'global-country-topology'
const COUNTRY_DATA_URL = 'data/world-atlas-countries-110m.json'
const LOCALITY_DATA_KEY = 'country-representative-localities'
const SEMANTIC_DATA_KEY = 'country-semantic-metadata'
const MAX_ZOOM_MULTIPLIER = 12000
const LABEL_BUDGET = 64

type MapLevel = 'Global' | 'Continent' | 'Country' | 'Region' | 'County' | 'Locality'
interface HomeLocation {
  countryId: string; countryName: string; continent: string; name: string; localityId: string
  regionName: string; countySourceRef: string; regionCountyNames: string[]
  longitude: number; latitude: number; geoBounds: number[]; width: number; height: number
}
interface CountyShape { name: string; regionSourceRef: string; paths: [number, number][][] }
interface MapSnapshot { camera: MapCamera; level: MapLevel; selectedId?: string; localityName?: string; regionName?: string }
const normalized = (text: string): string => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const pathBounds = (paths: { x: number; y: number }[][]): MapBounds => {
  const points = paths.flat()
  return { left: Math.min(...points.map(p => p.x)), top: Math.min(...points.map(p => p.y)),
    right: Math.max(...points.map(p => p.x)), bottom: Math.max(...points.map(p => p.y)) }
}

/** A geographic camera over shared data. Inspection never mutates player, cargo or company state. */
export class GlobalMapScene extends Phaser.Scene {
  private countries: GlobalCountryGeometry[] = []
  private localityCatalog: CountryLocalityCatalog | null = null
  private semanticCatalog: CountrySemanticCatalog | null = null
  private regional: RegionalCatalog | null = null
  private readonly regionalCache = new Map<string, RegionalCatalog>()
  private requestVersion = 0
  private selected: GlobalCountryGeometry | null = null
  private selectedLocality: MapLocality | null = null
  private visibleLocalities: MapLocality[] = []
  private focusedRegionName?: string
  private level: MapLevel = 'Global'
  private home!: HomeLocation
  private counties: CountyShape[] = []
  private physical: PhysicalFeature[] = []
  private viewport!: ViewportRect
  private mapLayer!: Phaser.GameObjects.Container
  private countryGraphics!: Phaser.GameObjects.Graphics
  private waterGraphics!: Phaser.GameObjects.Graphics
  private localityGraphics!: Phaser.GameObjects.Graphics
  private tiles?: ReliefTileLayer
  private labels: Phaser.GameObjects.Text[] = []
  private selectionTitle!: Phaser.GameObjects.Text
  private selectionBody!: Phaser.GameObjects.Text
  private breadcrumb!: Phaser.GameObjects.Text
  private scaleLabel!: Phaser.GameObjects.Text
  private drillLabel!: Phaser.GameObjects.Text
  private camera: MapCamera = { x: 0, y: 0, scale: 1 }
  private fitScale = 1
  private pointers = new Map<number, MapPoint>()
  private drag: { id: number; x: number; y: number; moved: boolean } | null = null
  private suppressTap = false
  private dirty = true
  private lastPaint = 0
  private snapshot?: MapSnapshot
  private initialFocus?: string
  private loadingRegion = false
  private regionFailed = false
  private pendingLocalityName?: string
  private panelScrollY = 0
  private panelDragY?: number
  private panelBodyTop = 0
  private panelBodyHeight = 0
  constructor() { super('GlobalMap') }
  init(data?: { focus?: string; snapshot?: MapSnapshot }): void {
    this.initialFocus = data?.focus; this.snapshot = data?.snapshot
    this.focusedRegionName = data?.snapshot?.regionName
    this.pendingLocalityName = data?.snapshot?.localityName; this.panelDragY = undefined; this.panelScrollY = 0
    this.pointers.clear(); this.drag = null; this.suppressTap = false
    this.selected = null; this.selectedLocality = null; this.regional = null; this.level = 'Global'
    this.loadingRegion = false; this.regionFailed = false; this.dirty = true; this.lastPaint = 0
  }
  preload(): void {
    for (const [key, url] of [
      [COUNTRY_DATA_KEY, COUNTRY_DATA_URL], [LOCALITY_DATA_KEY, 'data/country-representative-localities-v1.json'],
      [SEMANTIC_DATA_KEY, 'data/country-semantic-metadata-v1.json'],
      ['physical-features', 'data/physical-geography-v1/features.json'],
      ['relief-manifest', 'data/physical-geography-v1/manifest.json'],
      ['playable-location', 'data/playable-city-location-v1.json'],
      ['romania-counties', 'data/physical-geography-v1/romania-counties.json'],
    ]) if (!this.cache.json.exists(key)) this.load.json(key, url)
    if (!this.textures.exists('world-relief')) this.load.image('world-relief', 'data/physical-geography-v1/relief-overview.webp')
  }
  create(): void {
    this.localityCatalog = this.cache.json.get(LOCALITY_DATA_KEY) ?? null
    this.semanticCatalog = this.cache.json.get(SEMANTIC_DATA_KEY) ?? null
    const topology = this.cache.json.get(COUNTRY_DATA_KEY) as WorldTopology | undefined
    this.countries = topology ? decodeWorldTopology(topology, MAP_WIDTH, MAP_HEIGHT, geometryIdentityByRenderedName(this.localityCatalog)) : []
    this.home = this.cache.json.get('playable-location')
    this.counties = this.cache.json.get('romania-counties')?.features ?? []
    this.physical = this.cache.json.get('physical-features')?.features ?? []
    this.viewport = globalMapViewport(this.scale.width, this.scale.height)
    this.fitScale = fitGlobalMapScale(this.viewport)
    this.createMapLayer()
    this.createInterface()
    this.fitWorld(false)
    if (this.snapshot) {
      this.camera = this.snapshot.camera; this.level = this.snapshot.level
      this.selected = this.countries.find(c => c.id === this.snapshot?.selectedId) ?? null
      if (this.selected) void this.loadRegional(this.selected.id)
    } else if (this.initialFocus === 'home' && this.home) this.focusHome('County', false)
    this.applyMapTransform(); this.refreshSelectionPanel()
    this.input.addPointer(Math.max(0, 4 - this.input.manager.pointers.length))
    this.input.on('pointerdown', this.beginPointer)
    this.input.on('pointermove', this.movePointer)
    this.input.on('pointerup', this.endPointer)
    this.input.on('pointerupoutside', this.endPointer)
    this.input.on('wheel', this.onWheel)
    this.input.on('gameout', this.clearGesture)
    this.input.keyboard?.on('keydown-ESC', this.returnToWorld, this)
    this.scale.on(Phaser.Scale.Events.RESIZE, this.handleResize)
    this.game.events.on(Phaser.Core.Events.BLUR, this.clearGesture)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this)
  }
  update(time: number): void {
    if (this.dirty && time - this.lastPaint >= 65) {
      this.repaintCountries(); this.repaintPhysical(); this.repaintCountryLocalities()
      this.tiles?.update(visibleMapBounds(this.camera, this.viewport), this.camera.scale > this.fitScale * 4)
      this.lastPaint = time; this.dirty = false
    }
  }
  private createMapLayer(): void {
    this.cameras.main.setBackgroundColor(0x031b2b)
    this.mapLayer = this.add.container(0, 0)
    this.mapLayer.add(this.add.rectangle(MAP_WIDTH / 2, MAP_HEIGHT / 2, MAP_WIDTH, MAP_HEIGHT, 0x86b8c1))
    if (this.textures.exists('world-relief')) this.mapLayer.add(this.add.image(0, 0, 'world-relief').setOrigin(0, 0).setDisplaySize(MAP_WIDTH, MAP_HEIGHT))
    const tileContainer = this.add.container(0, 0)
    this.mapLayer.add(tileContainer)
    const manifest = this.cache.json.get('relief-manifest') as ReliefManifest | undefined
    if (manifest) this.tiles = new ReliefTileLayer(this, tileContainer, manifest)
    this.countryGraphics = this.add.graphics(); this.waterGraphics = this.add.graphics(); this.localityGraphics = this.add.graphics()
    this.mapLayer.add([this.countryGraphics, this.waterGraphics, this.localityGraphics])
    const mask = this.make.graphics({ x: 0, y: 0 }).fillStyle(0xffffff).fillRect(this.viewport.left, this.viewport.top, this.viewport.width, this.viewport.height)
    this.mapLayer.setMask(mask.createGeometryMask())
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => mask.destroy())
  }
  private createInterface(): void {
    const { width, height } = this.scale
    const panelLeft = this.viewport.left + this.viewport.width + 12
    const panelWidth = width - panelLeft - 12
    this.add.graphics().fillStyle(COLORS.surface, 0.98).fillRect(0, 0, width, 52)
      .lineStyle(1, COLORS.accent, 0.55).lineBetween(0, 52, width, 52)
    this.add.text(16, 14, 'DROPi · WORLD', { fontFamily: TYPOGRAPHY.family, fontSize: '18px', color: COLORS.textPrimary, fontStyle: 'bold' })
    this.createButton(width - 68, 26, 120, 44, 'Back to hero', this.returnToWorld)
    this.breadcrumb = this.add.text(188, 19, '', { fontFamily: TYPOGRAPHY.family, fontSize: '12px', color: COLORS.textGold })
    this.add.graphics().fillStyle(COLORS.surface, 0.98).fillRoundedRect(panelLeft, this.viewport.top, panelWidth, this.viewport.height, RADII.panel)
      .lineStyle(1, COLORS.surfaceBorder).strokeRoundedRect(panelLeft, this.viewport.top, panelWidth, this.viewport.height, RADII.panel)
    this.selectionTitle = this.add.text(panelLeft + 14, this.viewport.top + 16, '', {
      fontFamily: TYPOGRAPHY.family, fontSize: '19px', color: COLORS.textGold, fontStyle: 'bold', wordWrap: { width: panelWidth - 28 },
    })
    this.selectionBody = this.add.text(panelLeft + 14, this.viewport.top + 56, '', {
      fontFamily: TYPOGRAPHY.family, fontSize: '12px', color: COLORS.textPrimary, lineSpacing: 4, wordWrap: { width: panelWidth - 28 },
    })
    const drill = this.createButton(panelLeft + panelWidth / 2, height - 44, panelWidth - 24, 48, 'Open country view', () => this.drillDown())
    this.drillLabel = drill.label
    this.createButton(this.viewport.left + 28, height - 40, 48, 48, '−', () => this.zoomStep(-1))
    this.createButton(this.viewport.left + 82, height - 40, 48, 48, '+', () => this.zoomStep(1))
    this.createButton(this.viewport.left + 154, height - 40, 86, 48, 'World', () => this.fitWorld())
    if (this.home) this.createButton(this.viewport.left + 252, height - 40, 100, 48, this.home.name, () => this.focusHome('County'))
    this.scaleLabel = this.add.text(this.viewport.left + 10, this.viewport.top + 8, '', {
      fontFamily: TYPOGRAPHY.family, fontSize: '12px', color: '#ffffff', backgroundColor: '#073354', padding: { x: 8, y: 5 },
    })
    this.add.text(this.viewport.left + 8, height - 76, 'Natural Earth · GeoNames CC BY 4.0', {
      fontFamily: TYPOGRAPHY.family, fontSize: '10px', color: '#e9f8ff', backgroundColor: '#073354', padding: { x: 4, y: 2 },
    })
    this.createButton(panelLeft + panelWidth / 2, height - 102, panelWidth - 24, 44, '↑ One level up', () => this.levelUp())
    const bodyMask = this.make.graphics({ x: 0, y: 0 })
    this.selectionBody.setMask(bodyMask.createGeometryMask())
    this.selectionBody.setData('clip-graphics', bodyMask)
    this.selectionBody.setInteractive({ useHandCursor: true }).on('pointerdown', (p: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation(); this.panelDragY = p.y
    })
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => bodyMask.destroy())

  }
  private createButton(x: number, y: number, width: number, height: number, label: string, callback: () => void): { label: Phaser.GameObjects.Text } {
    const chrome = this.add.graphics().setPosition(x, y)
    chrome.fillStyle(COLORS.surfaceRaised).fillRoundedRect(-width / 2, -height / 2, width, height, RADII.button)
      .lineStyle(1, COLORS.accent, .72).strokeRoundedRect(-width / 2, -height / 2, width, height, RADII.button)
    const hit = this.add.rectangle(x, y, Math.max(TOUCH_TARGET_MIN_PX, width), Math.max(TOUCH_TARGET_MIN_PX, height), 0xffffff, .001).setInteractive({ useHandCursor: true })
    hit.on('pointerdown', (_p: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => { event.stopPropagation(); this.clearGesture(); callback() })
    return { label: this.add.text(x, y, label, { fontFamily: TYPOGRAPHY.family, fontSize: '12px', fontStyle: 'bold', color: COLORS.textPrimary, align: 'center', wordWrap: { width: width - 8 } }).setOrigin(.5) }
  }
  private repaintCountries(): void {
    const g = this.countryGraphics.clear(), inv = 1 / this.camera.scale
    const view = visibleMapBounds(this.camera, this.viewport)
    for (const country of this.countries) {
      const selected = country.id === this.selected?.id
      for (const polygon of country.polygons) for (const ring of wrappedRingCopies(polygon[0], MAP_WIDTH)) {
        if (!boundsOverlap(pathBounds([ring]), view)) continue
        if (selected) g.fillStyle(COLORS.gold, .13).fillPoints(ring, true)
        g.lineStyle((selected ? 1.8 : .65) * inv, selected ? 0xffffff : 0x466954, selected ? .9 : .55).strokePoints(ring, true)
      }
    }
    if (this.selected?.id === this.home?.countryId && ['Country', 'Region', 'County', 'Locality'].includes(this.level)) {
      for (const county of this.counties) {
        const active = county.regionSourceRef === (this.selectedLocality?.region?.regionSourceRef ?? this.home.countySourceRef)
        for (const path of county.paths) {
          const points = geoPathToMap(path)
          if (!boundsOverlap(pathBounds([points]), view)) continue
          g.lineStyle((active ? 1.8 : .8) * inv, active ? COLORS.gold : 0x397265, active ? 1 : .55).strokePoints(points, true)
          if (active && ['County', 'Locality'].includes(this.level)) g.fillStyle(COLORS.gold, .08).fillPoints(points, true)
        }
      }
    }
  }
  private repaintPhysical(): void {
    const g = this.waterGraphics.clear(), view = visibleMapBounds(this.camera, this.viewport), inv = 1 / this.camera.scale
    const detail = this.camera.scale / this.fitScale
    const visible = this.physical.filter(f => f.kind !== 'landform' && boundsOverlap(geoBoundsToMap(f.bounds), view) && (detail > 4 || f.rank <= 2))
      .sort((a, b) => a.rank - b.rank || a.id.localeCompare(b.id)).slice(0, 260)
    for (const feature of visible) for (const path of feature.paths) {
      const points = geoPathToMap(path)
      if (points.some((p, i) => i > 0 && Math.abs(p.x - points[i - 1].x) > MAP_WIDTH / 2)) continue
      g.lineStyle((feature.kind === 'river' ? 1.5 : .7) * inv, 0x2388bc, .9).strokePoints(points, feature.kind === 'lake')
    }
  }
  private nodes(): MapLocality[] {
    const anchors = this.selected ? localityNodesForCountry(this.localityCatalog, this.selected.id) : []
    return ['Region', 'County', 'Locality'].includes(this.level) ? regionalMapLocalities(anchors, this.regional) : anchors
  }
  private repaintCountryLocalities(): void {
    for (const label of this.labels) label.destroy()
    this.labels = []; this.visibleLocalities = []
    this.localityGraphics.clear()
    const occupied: MapBounds[] = [], inv = 1 / this.camera.scale
    const addLabel = (point: MapPoint, title: string, color: string, size = 12): void => {
      const x = this.camera.x + point.x * this.camera.scale, y = this.camera.y + point.y * this.camera.scale
      const box = { left: x + 10, top: y - 8, right: x + 16 + title.length * size * .56, bottom: y + 10 }
      if (this.labels.length >= LABEL_BUDGET || !reserveLabel(occupied, box, { ...this.viewport, top: this.viewport.top + 36, height: this.viewport.height - 116 })) return
      this.labels.push(this.add.text(x + 10, y - 8, title, { fontFamily: TYPOGRAPHY.family, fontSize: `${size}px`, color,
        fontStyle: 'bold', stroke: '#073354', strokeThickness: 3 }).setDepth(1))
    }
    if (this.selected && !['Global', 'Continent'].includes(this.level)) {
      const nodes = this.nodes().sort((a, b) => Number(b.localityId === this.home?.localityId) - Number(a.localityId === this.home?.localityId) ||
        Number(b.role === 'capital') - Number(a.role === 'capital') || b.populationReference - a.populationReference || a.name.localeCompare(b.name))
      for (const node of nodes) {
        const p = projectLocalityToGlobalMap(node, MAP_WIDTH, MAP_HEIGHT)
        const sx = this.camera.x + p.x * this.camera.scale, sy = this.camera.y + p.y * this.camera.scale
        if (!this.pointInsideViewport(sx, sy) || this.visibleLocalities.length >= 80) continue
        this.visibleLocalities.push(node)
        const selected = node.name === this.selectedLocality?.name
        const color = node.role === 'capital' ? COLORS.gold : COLORS.accent
        const radius = (selected ? 8 : node.role === 'capital' ? 6 : 4) * inv
        this.localityGraphics.fillStyle(0x073354, .9).fillCircle(p.x, p.y, radius + 2 * inv)
          .fillStyle(color).fillCircle(p.x, p.y, radius)
          .lineStyle(1.4 * inv, 0xffffff).strokeCircle(p.x, p.y, radius)
        addLabel(p, node.name, node.role === 'capital' ? '#fff1b3' : '#ffffff')
      }
    }
    if (this.camera.scale < this.fitScale * 5) {
      for (const country of [...this.countries].sort((a, b) => b.area - a.area)) {
        if (country.area * this.camera.scale ** 2 < 1500) continue
        const b = country.primaryBounds
        addLabel({ x: (b.left + b.right) / 2, y: (b.top + b.bottom) / 2 }, country.name, '#e9f7e1', 11)
      }
    } else {
      for (const feature of this.physical.filter(f => f.kind === 'landform' || (this.camera.scale > this.fitScale * 14 && f.rank < 4))) {
        addLabel({ x: (feature.label[0] + 180) * 4, y: (90 - feature.label[1]) * 4 }, feature.name, feature.kind === 'landform' ? '#f4e5b7' : '#b5eeff', 11)
      }
    }
    if (this.home && this.selected?.id === this.home.countryId && ['County', 'Locality'].includes(this.level)) {
      const b = geoBoundsToMap(this.home.geoBounds)
      this.localityGraphics.lineStyle(2 * inv, COLORS.accent).strokeRect(b.left, b.top, b.right - b.left, b.bottom - b.top)
      addLabel({ x: b.left, y: b.top }, `${this.home.name} · playable city`, '#c2fbff')
    }
  }
  private refreshSelectionPanel(): void {
    if (!this.selectionBody) return
    const place = this.selectedLocality
    const semantics = this.selected ? semanticEntryForCountry(this.semanticCatalog, this.selected.id) : undefined
    const roleOverride = place ? semanticPlaceRoleForLocality(semantics, place.name) : undefined
    this.selectionTitle.setText(place?.name ?? (this.isHomeCountyView() ? `${this.home.name} County` : this.level === 'Region' && this.focusedRegionName ? this.focusedRegionName : this.selected?.name) ?? 'Explore the world')
    const lines = place ? [roleOverride?.label ?? (place.role === 'capital' ? 'National capital' : 'Representative locality'), place.admin1,
      place.localityId === this.home?.localityId ? 'Your playable city' : 'City plan pending', roleOverride?.note ?? '', semantics?.statusSummary ?? ''] : this.selected ? [
      this.level === 'Global' || this.level === 'Continent' ? 'Open the country to explore.' : `${this.nodes().length} places at this scale`,
      this.level === 'Region' || this.level === 'County' ? 'Tap a place to look closer.' : 'Zoom closer for regional places.',
      this.loadingRegion ? 'Loading regional places…' : this.regionFailed ? 'Regional places unavailable.' : '',
      semantics?.statusLabel ?? '', semantics?.statusSummary ?? '', semantics?.coverageNote ?? '',
    ] : ['Real terrain, rivers and lakes.', 'Tap a country. Drag to explore.', 'Pinch, scroll or use + / −.']
    const body = lines.filter(Boolean).join('\n')
    if (body !== this.selectionBody.text) this.panelScrollY = 0
    this.selectionBody.setText(body)
    this.panelBodyTop = this.selectionTitle.y + this.selectionTitle.height + 12
    this.panelBodyHeight = Math.max(30, this.scale.height - 132 - this.panelBodyTop)
    const clip = this.selectionBody.getData('clip-graphics') as Phaser.GameObjects.Graphics
    clip.clear().fillStyle(0xffffff).fillRect(this.selectionBody.x - 2, this.panelBodyTop, this.scale.width - this.selectionBody.x - 18, this.panelBodyHeight)
    this.scrollPanel(0)
    this.breadcrumb.setText(this.level === 'Global' ? 'WORLD' : `${this.level.toUpperCase()}${this.selected ? ` · ${this.selected.name}` : ''}`)
    this.breadcrumb.setScale(Math.min(1, Math.max(60, this.scale.width - 350) / Math.max(1, this.breadcrumb.width)))
    const nearHome = place?.localityId === this.home?.localityId || (!place && this.isHomeCountyView())
    this.drillLabel.setText(nearHome ? `Enter ${this.home.name}` : place ? 'Look closer' : this.level === 'Country' ? 'Explore regions' : this.level === 'Global' || this.level === 'Continent' ? 'Open country view' : 'Zoom closer')
    this.scaleLabel.setText(`${this.level === 'Global' ? 'WORLD' : this.level.toUpperCase()} · ${this.scaleDistance()}`)
  }
  private scaleDistance(): string {
    const lat = clamp(90 - ((this.viewport.top + this.viewport.height / 2 - this.camera.y) / this.camera.scale) / 4, -85, 85)
    const km = 100 / this.camera.scale / 4 * 111.32 * Math.cos(lat * Math.PI / 180)
    return `100 px ≈ ${km < 1 ? `${Math.round(km * 1000)} m` : `${Math.round(km).toLocaleString()} km`}`
  }
  private async loadRegional(countryId: string): Promise<void> {
    this.regional = this.regionalCache.get(countryId) ?? null
    const ticket = ++this.requestVersion
    this.regionFailed = false
    const entry = regionalCatalogIndex.find(e => e.countryId === countryId)
    if (!entry || this.regional) { this.loadingRegion = false; this.restoreLocality(); this.dirty = true; return }
    this.loadingRegion = true
    try {
      const response = await fetch(entry.url)
      if (!response.ok) throw new Error('Regional catalog unavailable')
      const catalog = await response.json() as RegionalCatalog
      if (catalog.country?.geometryId !== countryId || !Array.isArray(catalog.units)) throw new Error('Invalid regional catalog')
      this.regionalCache.set(countryId, catalog)
      if (ticket !== this.requestVersion || !this.scene.isActive()) return
      this.regional = catalog
    } catch { if (ticket === this.requestVersion) this.regionFailed = true }
    if (ticket === this.requestVersion && this.scene.isActive()) {
      this.loadingRegion = false; this.restoreLocality(); this.dirty = true; this.refreshSelectionPanel()
    }
  }
  private restoreLocality(): void {
    if (!this.pendingLocalityName) return
    this.selectedLocality = this.nodes().find(n => n.name === this.pendingLocalityName) ?? null
    if (this.selectedLocality) this.pendingLocalityName = undefined
  }
  private scrollPanel(delta: number): void {
    this.panelScrollY = clamp(this.panelScrollY + delta, 0, Math.max(0, this.selectionBody.height - this.panelBodyHeight))
    this.selectionBody.setY(this.panelBodyTop - this.panelScrollY)
  }
  private isHomeCountyView(): boolean {
    if (!this.home || this.level !== 'County' || this.selected?.id !== this.home.countryId) return false
    const shape = this.counties.find(c => c.regionSourceRef === this.home.countySourceRef)
    if (!shape) return false
    const center = this.screenToMap(this.viewport.left + this.viewport.width / 2, this.viewport.top + this.viewport.height / 2)
    const b = pathBounds(shape.paths.map(geoPathToMap))
    return center.x >= b.left && center.x <= b.right && center.y >= b.top && center.y <= b.bottom
  }
  private levelUp(): void {
    if (this.isHomeCountyView()) { this.focusHome('Region'); return }
    if (this.level === 'Region' && this.selected) { this.level = 'Country'; this.selectedLocality = null; this.focusBounds(this.selected.primaryBounds); return }
    if (this.level === 'Country' && this.selected) {
      const b = this.selected.primaryBounds, w = b.right - b.left, h = b.bottom - b.top
      this.level = 'Continent'; this.selectedLocality = null
      this.focusBounds({ left: b.left - w, right: b.right + w, top: b.top - h, bottom: b.bottom + h }); return
    }
    if (this.level === 'Global' || this.level === 'Continent') { this.fitWorld(); return }
    this.zoomAt(this.viewport.left + this.viewport.width / 2, this.viewport.top + this.viewport.height / 2, 1 / 3)
  }
  private readonly beginPointer = (pointer: Phaser.Input.Pointer): void => {
    if (!this.pointInsideViewport(pointer.x, pointer.y) || this.pointers.size >= 2) return
    this.tweens.killTweensOf(this.camera)
    this.focusedRegionName = undefined
    this.pointers.set(pointer.id, { x: pointer.x, y: pointer.y })
    if (this.pointers.size === 2) { this.suppressTap = true; this.drag = null }
    else this.drag = { id: pointer.id, x: pointer.x, y: pointer.y, moved: false }
  }
  private readonly movePointer = (pointer: Phaser.Input.Pointer): void => {
    if (this.panelDragY !== undefined && pointer.isDown) { this.scrollPanel(this.panelDragY - pointer.y); this.panelDragY = pointer.y; return }
    const previous = this.pointers.get(pointer.id)
    if (!pointer.isDown || !previous) return
    const before = [...this.pointers.values()].map(p => ({ ...p }))
    const dx = pointer.x - previous.x, dy = pointer.y - previous.y
    previous.x = pointer.x; previous.y = pointer.y
    if (this.pointers.size === 2) {
      const after = [...this.pointers.values()]
      const oldDistance = Phaser.Math.Distance.BetweenPoints(before[0], before[1])
      const newDistance = Phaser.Math.Distance.BetweenPoints(after[0], after[1])
      const oldCenter = { x: (before[0].x + before[1].x) / 2, y: (before[0].y + before[1].y) / 2 }
      if (oldDistance > 20 && newDistance > 20) this.zoomAt(oldCenter.x, oldCenter.y, newDistance / oldDistance)
      this.camera.x += (after[0].x + after[1].x) / 2 - oldCenter.x
      this.camera.y += (after[0].y + after[1].y) / 2 - oldCenter.y
    } else {
      if (this.drag && Math.hypot(pointer.x - this.drag.x, pointer.y - this.drag.y) > 7) this.drag.moved = true
      this.camera.x += dx; this.camera.y += dy
    }
    this.clampMapPosition(); this.applyMapTransform()
  }
  private readonly endPointer = (pointer: Phaser.Input.Pointer): void => {
    this.panelDragY = undefined
    if (!this.pointers.has(pointer.id)) return
    const tap = this.drag?.id === pointer.id && !this.drag.moved && !this.suppressTap && this.pointInsideViewport(pointer.x, pointer.y)
    this.pointers.delete(pointer.id); this.drag = null
    if (!this.pointers.size) this.suppressTap = false
    if (!tap) return
    this.pendingLocalityName = undefined
    const point = this.screenToMap(pointer.x, pointer.y)
    const nearest = this.visibleLocalities.map(node => ({ node, p: projectLocalityToGlobalMap(node, MAP_WIDTH, MAP_HEIGHT) }))
      .map(entry => ({ ...entry, distance: Math.hypot(entry.p.x - point.x, entry.p.y - point.y) * this.camera.scale }))
      .filter(entry => entry.distance <= 22).sort((a, b) => a.distance - b.distance)[0]
    if (nearest) {
      if (this.selectedLocality?.name === nearest.node.name) { this.drillDown(); return }
      this.selectedLocality = nearest.node
    } else {
      const country = countryAtMapPoint(this.countries, point, MAP_WIDTH)
      if (country?.id !== this.selected?.id) {
        this.selected = country; this.selectedLocality = null; this.regional = null
        if (country) void this.loadRegional(country.id)
        else { this.requestVersion++; this.level = 'Global' }
      } else this.selectedLocality = null
    }
    this.dirty = true; this.refreshSelectionPanel()
  }
  private readonly clearGesture = (): void => { this.pointers.clear(); this.drag = null; this.suppressTap = false; this.panelDragY = undefined }
  private readonly onWheel = (pointer: Phaser.Input.Pointer, _objects: unknown, _dx: number, dy: number): void => {
    if (!this.pointInsideViewport(pointer.x, pointer.y)) {
      if (pointer.x >= this.selectionBody.x && pointer.y >= this.panelBodyTop && pointer.y <= this.panelBodyTop + this.panelBodyHeight) this.scrollPanel(dy)
      return
    }
    this.tweens.killTweensOf(this.camera)
    this.zoomAt(pointer.x, pointer.y, Math.exp(-clamp(dy, -200, 200) * .003))
  }
  private zoomStep(direction: number): void {
    if (direction > 0 && this.level === 'Global' && this.selected) { this.drillDown(); return }
    this.zoomAt(this.viewport.left + this.viewport.width / 2, this.viewport.top + this.viewport.height / 2, direction > 0 ? 1.65 : 1 / 1.65)
  }
  private zoomAt(x: number, y: number, factor: number): void {
    this.tweens.killTweensOf(this.camera)
    this.camera = zoomMapCamera(this.camera, { x, y }, factor, this.fitScale, this.fitScale * MAX_ZOOM_MULTIPLIER)
    const center = this.screenToMap(this.viewport.left + this.viewport.width / 2, this.viewport.top + this.viewport.height / 2)
    if (!this.selected && factor > 1) {
      this.selected = countryAtMapPoint(this.countries, center, MAP_WIDTH)
      if (this.selected) void this.loadRegional(this.selected.id)
    }
    const ratio = this.camera.scale / this.fitScale
    const countryFit = this.selected ? cameraForBounds(this.selected.primaryBounds, this.viewport).scale : this.fitScale * 8
    this.level = ratio < 1.7 ? 'Global' : this.camera.scale < countryFit * .7 ? 'Continent' :
      this.camera.scale < countryFit * 2 ? 'Country' : this.camera.scale < countryFit * 6 ? 'Region' : this.camera.scale < countryFit * 25 ? 'County' : 'Locality'
    if (this.home && factor > 1 && this.selected?.id === this.home.countryId) {
      const homeBounds = geoBoundsToMap(this.home.geoBounds)
      const view = visibleMapBounds(this.camera, this.viewport)
      if (boundsOverlap(view, homeBounds) && view.right - view.left < (homeBounds.right - homeBounds.left) * 1.6) { this.enterCity(); return }
    }
    this.clampMapPosition(); this.applyMapTransform(); this.refreshSelectionPanel()
  }
  private drillDown(): void {
    if (!this.selected) { if (this.home) this.focusHome('Country'); return }
    if (this.selectedLocality?.localityId === this.home?.localityId ||
        (this.isHomeCountyView() && !this.selectedLocality)) { this.enterCity(); return }
    if (this.selectedLocality) {
      const point = projectLocalityToGlobalMap(this.selectedLocality, MAP_WIDTH, MAP_HEIGHT)
      const shape = this.counties.find(c => c.regionSourceRef === this.selectedLocality?.region?.regionSourceRef)
      this.level = shape && this.level !== 'County' ? 'County' : 'Locality'
      this.focusBounds(shape && this.level === 'County' ? pathBounds(shape.paths.map(geoPathToMap)) : { left: point.x - .18, right: point.x + .18, top: point.y - .14, bottom: point.y + .14 })
    } else if (this.level === 'Global' || this.level === 'Continent') {
      this.level = 'Country'; this.focusBounds(this.selected.primaryBounds)
    } else {
      this.level = 'Region'
      const b = visibleMapBounds(this.camera, this.viewport), cx = (b.left + b.right) / 2, cy = (b.top + b.bottom) / 2
      this.focusBounds({ left: cx - (b.right - b.left) / 5, right: cx + (b.right - b.left) / 5,
        top: cy - (b.bottom - b.top) / 5, bottom: cy + (b.bottom - b.top) / 5 })
    }
    this.refreshSelectionPanel()
  }
  private focusHome(level: 'Continent' | 'Country' | 'Region' | 'County', animated = true): void {
    if (!this.home) return
    this.selected = this.countries.find(c => c.id === this.home.countryId) ?? null
    this.selectedLocality = null; this.level = level
    this.focusedRegionName = level === 'Region' ? this.home.regionName : undefined
    void this.loadRegional(this.home.countryId)
    let bounds = this.selected?.primaryBounds
    if (level === 'Continent') {
      // Geographic camera around the home country. This is a view extent, never a continent boundary claim.
      const p = projectLocalityToGlobalMap(this.home, MAP_WIDTH, MAP_HEIGHT)
      bounds = { left: p.x - 125, right: p.x + 105, top: p.y - 100, bottom: p.y + 75 }
    } else if (level === 'Region' || level === 'County') {
      const names = new Set(this.home.regionCountyNames.map(normalized))
      const shapes = this.counties.filter(c => level === 'County' ? c.regionSourceRef === this.home.countySourceRef : names.has(normalized(c.name)))
      if (shapes.length) bounds = pathBounds(shapes.flatMap(c => c.paths.map(geoPathToMap)))
    }
    if (bounds) this.focusBounds(bounds, animated)
    this.refreshSelectionPanel()
  }
  private focusBounds(bounds: MapBounds, animated = true): void {
    const target = cameraForBounds(bounds, this.viewport)
    target.scale = clamp(target.scale, this.fitScale, this.fitScale * MAX_ZOOM_MULTIPLIER)
    target.x = this.viewport.left + this.viewport.width / 2 - (bounds.left + bounds.right) / 2 * target.scale
    target.y = this.viewport.top + this.viewport.height / 2 - (bounds.top + bounds.bottom) / 2 * target.scale
    this.tweens.killTweensOf(this.camera)
    if (animated) this.tweens.add({ targets: this.camera, ...target, duration: 440, ease: 'Sine.easeInOut', onUpdate: () => { this.applyMapTransform(); this.refreshSelectionPanel() } })
    else { this.camera = target; this.applyMapTransform() }
    this.dirty = true
  }
  private fitWorld(animated = true): void {
    this.level = 'Global'; this.selected = null; this.selectedLocality = null; this.regional = null; this.requestVersion++
    this.focusBounds({ left: 0, right: MAP_WIDTH, top: 0, bottom: MAP_HEIGHT }, animated)
    this.refreshSelectionPanel()
  }
  private clampMapPosition(): void {
    const v = this.viewport, width = MAP_WIDTH * this.camera.scale, height = MAP_HEIGHT * this.camera.scale
    this.camera.x = width < v.width ? v.left + (v.width - width) / 2 : clamp(this.camera.x, v.left + v.width - width, v.left)
    this.camera.y = height < v.height ? v.top + (v.height - height) / 2 : clamp(this.camera.y, v.top + v.height - height, v.top)
  }
  private applyMapTransform(): void { this.mapLayer.setPosition(this.camera.x, this.camera.y).setScale(this.camera.scale); this.dirty = true }
  private screenToMap(x: number, y: number): MapPoint { return { x: (x - this.camera.x) / this.camera.scale, y: (y - this.camera.y) / this.camera.scale } }
  private pointInsideViewport(x: number, y: number): boolean { const v = this.viewport; return x >= v.left && x <= v.left + v.width && y >= v.top && y <= v.top + v.height }
  private enterCity(): void { this.registry.set('map-local-view', 'City'); this.returnToWorld() }
  private readonly returnToWorld = (): void => {
    // Opening the map never moves the player, cargo or company.
    if (!this.registry.get('map-local-view')) this.registry.set('map-local-view', 'Hero')
    if (this.scene.isSleeping('GameWorld')) { this.scene.wake('GameWorld'); this.scene.stop() }
    else this.scene.start('GameWorld')
  }
  private readonly handleResize = (): void => {
    const center = this.screenToMap(this.viewport.left + this.viewport.width / 2, this.viewport.top + this.viewport.height / 2)
    const next = globalMapViewport(this.scale.width, this.scale.height)
    const camera = { ...this.camera, x: next.left + next.width / 2 - center.x * this.camera.scale, y: next.top + next.height / 2 - center.y * this.camera.scale }
    this.scene.restart({ snapshot: { camera, level: this.level, selectedId: this.selected?.id, localityName: this.selectedLocality?.name, regionName: this.focusedRegionName } })
  }
  private shutdown(): void {
    this.requestVersion++; this.tiles?.destroy(); this.tiles = undefined
    this.clearGesture(); this.labels = []
    this.input.off('pointerdown', this.beginPointer); this.input.off('pointermove', this.movePointer)
    this.input.off('pointerup', this.endPointer); this.input.off('pointerupoutside', this.endPointer)
    this.input.off('wheel', this.onWheel); this.input.off('gameout', this.clearGesture)
    this.input.keyboard?.off('keydown-ESC', this.returnToWorld, this)
    this.scale.off(Phaser.Scale.Events.RESIZE, this.handleResize)
    this.game.events.off(Phaser.Core.Events.BLUR, this.clearGesture)
  }
}
