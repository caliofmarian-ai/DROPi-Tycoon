import Phaser from 'phaser'
import {
  boundsCenter,
  countryAtMapPoint,
  decodeWorldTopology,
  type GlobalCountryGeometry,
  type MapBounds,
  type MapPoint,
  type WorldTopology,
  wrappedRingCopies,
} from '../world/globalMapTopology'
import { COLORS, RADII, TOUCH_TARGET_MIN_PX, TYPOGRAPHY } from '../ui/theme'
import {
  geometryIdentityByRenderedName,
  localityNodesForCountry,
  nearestLocalityNode,
  projectLocalityToGlobalMap,
  type CountryLocalityCatalog,
  type CountryLocalityNode,
} from '../world/countryLayerNodes'
import {
  semanticEntryForCountry,
  semanticPlaceRoleForLocality,
  type CountrySemanticCatalog,
} from '../world/countrySemanticMetadata'
import {
  fitGlobalMapScale,
  GLOBAL_MAP_HEIGHT as MAP_HEIGHT,
  GLOBAL_MAP_WIDTH as MAP_WIDTH,
  globalMapViewport,
  type GlobalMapViewportRect as ViewportRect,
} from '../world/globalMapViewport'

const MAX_ZOOM_MULTIPLIER = 8
const COUNTRY_DATA_KEY = 'global-country-topology'
const COUNTRY_DATA_URL = 'data/world-atlas-countries-110m.json'
const LOCALITY_DATA_KEY = 'country-representative-localities'
const LOCALITY_DATA_URL = 'data/country-representative-localities-v1.json'
const SEMANTIC_DATA_KEY = 'country-semantic-metadata'
const SEMANTIC_DATA_URL = 'data/country-semantic-metadata-v1.json'

type MapLevel = 'Global' | 'Country'

interface PointerDrag {
  pointerId: number
  startX: number
  startY: number
  originX: number
  originY: number
  moved: boolean
}

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value))

export class GlobalMapScene extends Phaser.Scene {
  private countries: GlobalCountryGeometry[] = []
  private localityCatalog: CountryLocalityCatalog | null = null
  private semanticCatalog: CountrySemanticCatalog | null = null
  private selected: GlobalCountryGeometry | null = null
  private selectedLocality: CountryLocalityNode | null = null
  private level: MapLevel = 'Global'
  private viewport!: ViewportRect
  private mapLayer!: Phaser.GameObjects.Container
  private countryGraphics!: Phaser.GameObjects.Graphics
  private localityGraphics!: Phaser.GameObjects.Graphics
  private localityLabels: Phaser.GameObjects.Text[] = []
  private selectionTitle!: Phaser.GameObjects.Text
  private selectionBody!: Phaser.GameObjects.Text
  private breadcrumb!: Phaser.GameObjects.Text
  private drillHit!: Phaser.GameObjects.Rectangle
  private drillChrome!: Phaser.GameObjects.Graphics
  private drillLabel!: Phaser.GameObjects.Text
  private mapScale = 1
  private fitScale = 1
  private mapX = 0
  private mapY = 0
  private drag: PointerDrag | null = null

  constructor() {
    super('GlobalMap')
  }

  preload(): void {
    if (!this.cache.json.exists(COUNTRY_DATA_KEY)) this.load.json(COUNTRY_DATA_KEY, COUNTRY_DATA_URL)
    if (!this.cache.json.exists(LOCALITY_DATA_KEY)) this.load.json(LOCALITY_DATA_KEY, LOCALITY_DATA_URL)
    if (!this.cache.json.exists(SEMANTIC_DATA_KEY)) this.load.json(SEMANTIC_DATA_KEY, SEMANTIC_DATA_URL)
  }

  create(): void {
    const topology = this.cache.json.get(COUNTRY_DATA_KEY) as WorldTopology | undefined
    this.localityCatalog = (this.cache.json.get(LOCALITY_DATA_KEY) as CountryLocalityCatalog | undefined) ?? null
    this.semanticCatalog = (this.cache.json.get(SEMANTIC_DATA_KEY) as CountrySemanticCatalog | undefined) ?? null
    this.countries = topology
      ? decodeWorldTopology(topology, MAP_WIDTH, MAP_HEIGHT, geometryIdentityByRenderedName(this.localityCatalog))
      : []
    this.viewport = globalMapViewport(this.scale.width, this.scale.height)
    this.fitScale = fitGlobalMapScale(this.viewport)
    this.mapScale = this.fitScale

    this.drawBackdrop()
    this.createMapLayer()
    this.createInterface()
    this.fitWorld()
    this.repaintCountries()
    this.refreshSelectionPanel()

    this.input.addPointer(Math.max(0, 4 - this.input.manager.pointers.length))
    this.input.on('pointerdown', this.beginPointer)
    this.input.on('pointermove', this.movePointer)
    this.input.on('pointerup', this.endPointer)
    this.input.on('pointerupoutside', this.endPointer)
    this.input.keyboard?.on('keydown-ESC', this.returnToWorld, this)
    this.scale.on(Phaser.Scale.Events.RESIZE, this.handleResize)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this)
  }

  private drawBackdrop(): void {
    const { width, height } = this.scale
    this.add.rectangle(width / 2, height / 2, width, height, 0x03111d)
    const header = this.add.graphics()
    header.fillStyle(COLORS.surface, 0.98).fillRect(0, 0, width, 52)
    header.lineStyle(2, COLORS.accent, 0.82).lineBetween(0, 52, width, 52)
    this.add.text(16, 10, 'DROPi TYCOON · WORLD MAP', {
      fontFamily: TYPOGRAPHY.family,
      fontSize: '20px',
      color: COLORS.textPrimary,
      fontStyle: 'bold',
    })
  }

  private createMapLayer(): void {
    this.mapLayer = this.add.container(0, 0)
    const ocean = this.add.graphics()
    ocean.fillStyle(0x082c45, 1).fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT)
    ocean.lineStyle(1, 0x2c6683, 0.22)
    for (let longitude = 0; longitude <= MAP_WIDTH; longitude += MAP_WIDTH / 12) {
      ocean.lineBetween(longitude, 0, longitude, MAP_HEIGHT)
    }
    for (let latitude = 0; latitude <= MAP_HEIGHT; latitude += MAP_HEIGHT / 6) {
      ocean.lineBetween(0, latitude, MAP_WIDTH, latitude)
    }
    this.countryGraphics = this.add.graphics()
    this.localityGraphics = this.add.graphics()
    this.mapLayer.add([ocean, this.countryGraphics, this.localityGraphics])
  }

  private createInterface(): void {
    const { width, height } = this.scale
    const panelLeft = this.viewport.left + this.viewport.width + 12
    const panelWidth = Math.max(216, width - panelLeft - 12)
    const panel = this.add.graphics()
    panel.fillStyle(COLORS.surface, 0.96)
      .fillRoundedRect(panelLeft, this.viewport.top, panelWidth, this.viewport.height, RADII.panel)
    panel.lineStyle(2, COLORS.accent, 0.72)
      .strokeRoundedRect(panelLeft, this.viewport.top, panelWidth, this.viewport.height, RADII.panel)

    this.breadcrumb = this.add.text(this.viewport.left, 18, 'GLOBAL', {
      fontFamily: TYPOGRAPHY.family,
      fontSize: '12px',
      color: COLORS.textGold,
      fontStyle: 'bold',
    })

    this.createButton(width - 62, 26, 104, 44, 'Back to city', this.returnToWorld)

    const zoomY = this.viewport.top + this.viewport.height - 27
    this.createButton(this.viewport.left + 28, zoomY, 48, 48, '−', () => this.zoomAtViewportCenter(0.8))
    this.createButton(this.viewport.left + 82, zoomY, 48, 48, '+', () => this.zoomAtViewportCenter(1.25))
    this.createButton(this.viewport.left + 151, zoomY, 82, 48, 'World', () => this.fitWorld())

    this.selectionTitle = this.add.text(panelLeft + 16, this.viewport.top + 18, 'WORLD', {
      fontFamily: TYPOGRAPHY.family,
      fontSize: '18px',
      color: COLORS.textGold,
      fontStyle: 'bold',
      wordWrap: { width: panelWidth - 32 },
    })
    this.selectionBody = this.add.text(panelLeft + 16, this.viewport.top + 54, '', {
      fontFamily: TYPOGRAPHY.family,
      fontSize: '12px',
      color: COLORS.textPrimary,
      lineSpacing: 7,
      wordWrap: { width: panelWidth - 32 },
    })

    const drillY = Math.min(height - 38, this.viewport.top + this.viewport.height - 32)
    const drill = this.createButton(panelLeft + panelWidth / 2, drillY, panelWidth - 28, 48, 'Select a country', () => this.toggleCountryView())
    this.drillHit = drill.hit
    this.drillChrome = drill.chrome
    this.drillLabel = drill.label
  }

  private createButton(
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    callback: () => void,
  ): { hit: Phaser.GameObjects.Rectangle; chrome: Phaser.GameObjects.Graphics; label: Phaser.GameObjects.Text } {
    const safeWidth = Math.max(TOUCH_TARGET_MIN_PX, width)
    const safeHeight = Math.max(TOUCH_TARGET_MIN_PX, height)
    const chrome = this.add.graphics().setPosition(x, y)
    chrome.fillStyle(COLORS.surfaceRaised, 0.98)
      .fillRoundedRect(-width / 2, -height / 2, width, height, RADII.button)
    chrome.lineStyle(2, COLORS.accent, 0.82)
      .strokeRoundedRect(-width / 2, -height / 2, width, height, RADII.button)
    const hit = this.add.rectangle(x, y, safeWidth, safeHeight, 0xffffff, 0.001)
      .setInteractive({ useHandCursor: true })
    hit.on('pointerdown', (
      _pointer: Phaser.Input.Pointer,
      _localX: number,
      _localY: number,
      event: Phaser.Types.Input.EventData,
    ) => {
      event.stopPropagation()
      callback()
    })
    const text = this.add.text(x, y, label, {
      fontFamily: TYPOGRAPHY.family,
      fontSize: '12px',
      color: COLORS.textPrimary,
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: width - 10 },
    }).setOrigin(0.5)
    return { hit, chrome, label: text }
  }

  private repaintCountries(): void {
    this.countryGraphics.clear()
    for (const country of this.countries) {
      const selected = country.id === this.selected?.id
      const fill = selected ? COLORS.gold : 0x4f8165
      const stroke = selected ? 0xffed9c : 0x9bc1ae
      for (const polygon of country.polygons) {
        const outer = polygon[0]
        for (const ring of wrappedRingCopies(outer, MAP_WIDTH)) {
          this.countryGraphics.fillStyle(fill, selected ? 0.96 : 0.88).fillPoints(ring, true)
          this.countryGraphics.lineStyle(selected ? 2.2 : 1, stroke, selected ? 1 : 0.72).strokePoints(ring, true)
        }
      }
    }
  }

  private repaintCountryLocalities(): void {
    if (!this.localityGraphics) return
    this.localityGraphics.clear()
    for (const label of this.localityLabels) label.destroy()
    this.localityLabels = []
    if (this.level !== 'Country' || !this.selected) return

    const nodes = localityNodesForCountry(this.localityCatalog, this.selected.id)
    const inverseScale = 1 / Math.max(0.001, this.mapScale)
    for (const node of nodes) {
      const point = projectLocalityToGlobalMap(node, MAP_WIDTH, MAP_HEIGHT)
      const selected = node === this.selectedLocality
      const screenRadius = node.role === 'capital' ? 7 : node.role === 'urban' ? 5.5 : 4.5
      const radius = screenRadius * inverseScale
      const fill = selected ? COLORS.review : node.role === 'capital' ? COLORS.gold : node.role === 'urban' ? COLORS.accent : COLORS.success
      this.localityGraphics.fillStyle(fill, 1).fillCircle(point.x, point.y, radius)
      this.localityGraphics.lineStyle((selected ? 2.4 : 1.5) * inverseScale, 0xffffff, 0.9).strokeCircle(point.x, point.y, radius)
      const label = this.add.text(point.x + 8 * inverseScale, point.y - 9 * inverseScale, node.name, {
        fontFamily: TYPOGRAPHY.family,
        fontSize: `${11 * inverseScale}px`,
        color: node.role === 'capital' ? COLORS.textGold : COLORS.textPrimary,
        fontStyle: node.role === 'capital' ? 'bold' : 'normal',
        stroke: '#041c38',
        strokeThickness: 3 * inverseScale,
      })
      this.mapLayer.add(label)
      this.localityLabels.push(label)
    }
  }

  private refreshSelectionPanel(): void {
    if (!this.selected) {
      this.selectionTitle.setText('WORLD')
      this.selectionBody.setText([
        `${this.countries.length} countries on the global map`,
        'Tap a country to inspect it.',
        'Drag the map to pan.',
        'Use + / − to zoom.',
        '',
        'Country layers use real geography. Economic and transport activity appears only when its authoritative simulation is connected.',
      ].join('\n'))
      this.setDrillEnabled(false, 'Select a country')
      this.breadcrumb.setText('GLOBAL')
      return
    }

    const nodes = localityNodesForCountry(this.localityCatalog, this.selected.id)
    const capital = nodes.find(node => node.role === 'capital')
    const urbanCount = nodes.filter(node => node.role === 'urban').length
    const secondaryCount = nodes.filter(node => node.role === 'secondary').length
    const semantics = semanticEntryForCountry(this.semanticCatalog, this.selected.id)
    if (this.selectedLocality) {
      const locality = this.selectedLocality
      const roleOverride = semanticPlaceRoleForLocality(semantics, locality.name)
      const kind = roleOverride?.label ?? (locality.role === 'capital' ? 'National capital' : locality.role === 'urban' ? 'Representative city' : 'Smaller locality')
      this.selectionTitle.setText(locality.name.toUpperCase())
      this.selectionBody.setText([
        kind,
        locality.admin1 ? `Region: ${locality.admin1}` : this.selected.name,
        locality.populationReference > 0 ? `Population reference: ${locality.populationReference.toLocaleString('en-US')}` : 'Population reference: unavailable',
        `Geographic sector: ${locality.sector}`,
        roleOverride?.note ?? '',
        '',
        `Part of ${this.selected.name}'s sparse strategic map.`,
        'Opening the map never moves the player, cargo or company.',
      ].filter(Boolean).join('\n'))
    } else {
      const placeRoleLines = semantics?.placeRoles.map(place => `${place.label}: ${place.locality}`) ?? []
      const capitalLines = placeRoleLines.length > 0
        ? placeRoleLines
        : [capital ? `Capital: ${capital.name}` : 'Capital: source coverage unavailable']
      const semanticLines = semantics
        ? [
            '',
            `Status: ${semantics.statusLabel}`,
            semantics.statusSummary,
            semantics.coverageNote ?? '',
          ].filter(Boolean)
        : []
      this.selectionTitle.setText(this.selected.name.toUpperCase())
      this.selectionBody.setText([
        ...capitalLines,
        `Representative places: ${nodes.length}`,
        `Representative city nodes: ${urbanCount}`,
        `Smaller locality nodes: ${secondaryCount}`,
        ...semanticLines,
        '',
        this.level === 'Country'
          ? 'Tap a locality marker to inspect it. Economy and transport overlays will appear only when authoritative simulation is connected.'
          : 'Open country view to inspect its representative settlement network.',
      ].join('\n'))
    }
    this.setDrillEnabled(true, this.level === 'Global' ? 'Open country view' : 'Return to world view')
    this.breadcrumb.setText(this.level === 'Global' ? `GLOBAL  ›  ${this.selected.name}` : `GLOBAL  ›  ${this.selected.name}  ›  COUNTRY`)
  }

  private setDrillEnabled(enabled: boolean, label: string): void {
    if (this.drillHit.input) this.drillHit.input.enabled = enabled
    this.drillHit.setAlpha(enabled ? 1 : 0.45)
    this.drillChrome.setAlpha(enabled ? 1 : 0.45)
    this.drillLabel.setAlpha(enabled ? 1 : 0.55).setText(label)
  }

  private readonly beginPointer = (pointer: Phaser.Input.Pointer): void => {
    if (!this.pointInsideViewport(pointer.x, pointer.y)) return
    this.drag = {
      pointerId: pointer.id,
      startX: pointer.x,
      startY: pointer.y,
      originX: this.mapX,
      originY: this.mapY,
      moved: false,
    }
  }

  private readonly movePointer = (pointer: Phaser.Input.Pointer): void => {
    if (!pointer.isDown || this.drag?.pointerId !== pointer.id) return
    const dx = pointer.x - this.drag.startX
    const dy = pointer.y - this.drag.startY
    if (Math.hypot(dx, dy) > 7) this.drag.moved = true
    this.mapX = this.drag.originX + dx
    this.mapY = this.drag.originY + dy
    this.clampMapPosition()
    this.applyMapTransform()
  }

  private readonly endPointer = (pointer: Phaser.Input.Pointer): void => {
    if (this.drag?.pointerId !== pointer.id) return
    const wasTap = !this.drag.moved && this.pointInsideViewport(pointer.x, pointer.y)
    this.drag = null
    if (!wasTap) return
    const mapPoint = this.screenToMap(pointer.x, pointer.y)
    if (this.level === 'Country' && this.selected) {
      const nodes = localityNodesForCountry(this.localityCatalog, this.selected.id)
      this.selectedLocality = nearestLocalityNode(nodes, mapPoint, MAP_WIDTH, MAP_HEIGHT, 18 / this.mapScale)
      this.repaintCountryLocalities()
      this.refreshSelectionPanel()
      return
    }
    const country = countryAtMapPoint(this.countries, mapPoint, MAP_WIDTH)
    this.selected = country
    this.selectedLocality = null
    if (!country) this.level = 'Global'
    this.repaintCountries()
    this.repaintCountryLocalities()
    this.refreshSelectionPanel()
  }

  private toggleCountryView(): void {
    if (!this.selected) return
    this.selectedLocality = null
    if (this.level === 'Country') {
      this.level = 'Global'
      this.fitWorld()
    } else {
      this.level = 'Country'
      this.focusBounds(this.selected.primaryBounds)
    }
    this.repaintCountryLocalities()
    this.refreshSelectionPanel()
  }

  private normalizeBounds(bounds: MapBounds): MapBounds {
    let left = bounds.left
    let right = bounds.right
    while (right < 0) { left += MAP_WIDTH; right += MAP_WIDTH }
    while (left > MAP_WIDTH) { left -= MAP_WIDTH; right -= MAP_WIDTH }
    return { ...bounds, left, right }
  }

  private focusBounds(bounds: MapBounds): void {
    const normalized = this.normalizeBounds(bounds)
    const center = boundsCenter(normalized)
    const width = Math.max(34, normalized.right - normalized.left)
    const height = Math.max(28, normalized.bottom - normalized.top)
    const targetScale = Math.min(
      this.viewport.width / (width * 1.45),
      this.viewport.height / (height * 1.45),
      this.fitScale * MAX_ZOOM_MULTIPLIER,
    )
    this.mapScale = Math.max(this.fitScale, targetScale)
    this.mapX = this.viewport.left + this.viewport.width / 2 - center.x * this.mapScale
    this.mapY = this.viewport.top + this.viewport.height / 2 - center.y * this.mapScale
    this.clampMapPosition()
    this.applyMapTransform()
    this.repaintCountryLocalities()
  }

  private fitWorld(): void {
    this.level = 'Global'
    this.selectedLocality = null
    this.mapScale = this.fitScale
    this.mapX = this.viewport.left + (this.viewport.width - MAP_WIDTH * this.mapScale) / 2
    this.mapY = this.viewport.top + (this.viewport.height - MAP_HEIGHT * this.mapScale) / 2
    this.applyMapTransform()
    this.repaintCountryLocalities()
    if (this.selectionTitle) this.refreshSelectionPanel()
  }

  private zoomAtViewportCenter(factor: number): void {
    const x = this.viewport.left + this.viewport.width / 2
    const y = this.viewport.top + this.viewport.height / 2
    this.zoomAt(x, y, factor)
  }

  private zoomAt(screenX: number, screenY: number, factor: number): void {
    const oldScale = this.mapScale
    const nextScale = clamp(oldScale * factor, this.fitScale, this.fitScale * MAX_ZOOM_MULTIPLIER)
    if (Math.abs(nextScale - oldScale) < 0.0001) return
    const localX = (screenX - this.mapX) / oldScale
    const localY = (screenY - this.mapY) / oldScale
    this.mapScale = nextScale
    this.mapX = screenX - localX * nextScale
    this.mapY = screenY - localY * nextScale
    this.clampMapPosition()
    this.applyMapTransform()
    this.repaintCountryLocalities()
  }

  private clampMapPosition(): void {
    const scaledWidth = MAP_WIDTH * this.mapScale
    const scaledHeight = MAP_HEIGHT * this.mapScale
    if (scaledWidth <= this.viewport.width) {
      this.mapX = this.viewport.left + (this.viewport.width - scaledWidth) / 2
    } else {
      this.mapX = clamp(this.mapX, this.viewport.left + this.viewport.width - scaledWidth, this.viewport.left)
    }
    if (scaledHeight <= this.viewport.height) {
      this.mapY = this.viewport.top + (this.viewport.height - scaledHeight) / 2
    } else {
      this.mapY = clamp(this.mapY, this.viewport.top + this.viewport.height - scaledHeight, this.viewport.top)
    }
  }

  private applyMapTransform(): void {
    this.mapLayer.setPosition(this.mapX, this.mapY).setScale(this.mapScale)
  }

  private screenToMap(x: number, y: number): MapPoint {
    return { x: (x - this.mapX) / this.mapScale, y: (y - this.mapY) / this.mapScale }
  }

  private pointInsideViewport(x: number, y: number): boolean {
    return x >= this.viewport.left && x <= this.viewport.left + this.viewport.width &&
      y >= this.viewport.top && y <= this.viewport.top + this.viewport.height
  }

  private readonly returnToWorld = (): void => {
    this.scene.start('GameWorld')
  }

  private readonly handleResize = (): void => {
    this.scene.restart()
  }

  private shutdown(): void {
    this.input.off('pointerdown', this.beginPointer)
    this.input.off('pointermove', this.movePointer)
    this.input.off('pointerup', this.endPointer)
    this.input.off('pointerupoutside', this.endPointer)
    this.input.keyboard?.off('keydown-ESC', this.returnToWorld, this)
    this.scale.off(Phaser.Scale.Events.RESIZE, this.handleResize)
    this.drag = null
  }
}