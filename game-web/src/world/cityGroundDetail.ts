import type Phaser from 'phaser'
import { LOCALITY_ANDROID_PRESENTATION_BUDGET } from './localityPresentationProfile'
import { drawCityGround } from './urbanPresentation'
import { WORLD_WIDTH, WORLD_HEIGHT } from './worldLayout'

export const CITY_DETAIL_TILE_SIZE = LOCALITY_ANDROID_PRESENTATION_BUDGET.detailSectorSize
export const CITY_DETAIL_TILE_LIMIT = LOCALITY_ANDROID_PRESENTATION_BUDGET.maxResidentDetailSectors
export const CITY_DETAIL_MIN_ZOOM = LOCALITY_ANDROID_PRESENTATION_BUDGET.minDetailZoom
export const CITY_DETAIL_MATERIALIZE_PER_FRAME = LOCALITY_ANDROID_PRESENTATION_BUDGET.maxMaterializedDetailSectorsPerFrame
interface Tile { id: string; x: number; y: number }
export const cityGroundTiles = (view: { x: number; y: number; width: number; height: number }, zoom: number): Tile[] => {
  if (zoom < CITY_DETAIL_MIN_ZOOM || view.width <= 0 || view.height <= 0) return []
  const tiles: Tile[] = [], size = CITY_DETAIL_TILE_SIZE
  for (let row = Math.max(0, Math.floor(view.y / size)); row <= Math.min(Math.ceil(WORLD_HEIGHT / size) - 1, Math.floor((view.y + view.height) / size)); row++) {
    for (let col = Math.max(0, Math.floor(view.x / size)); col <= Math.min(Math.ceil(WORLD_WIDTH / size) - 1, Math.floor((view.x + view.width) / size)); col++) {
      tiles.push({ id: `${col}-${row}`, x: col * size, y: row * size })
    }
  }
  return tiles.sort((a, b) => Math.hypot(a.x + size / 2 - view.x - view.width / 2, a.y + size / 2 - view.y - view.height / 2) -
    Math.hypot(b.x + size / 2 - view.x - view.width / 2, b.y + size / 2 - view.y - view.height / 2)).slice(0, CITY_DETAIL_TILE_LIMIT)
}

/**
 * Crisp local pavement over a cheap city overview. Enlarging any governed city increases total
 * possible world sectors, never the resident Android detail budget: at most five local textures
 * and one newly materialized tile per frame. DT-04 may add chunk-level guardrails underneath this
 * stable presentation contract without changing locality geometry.
 */
export class CityGroundDetail {
  private resident = new Map<string, Phaser.GameObjects.Image>()
  private readonly scene: Phaser.Scene
  constructor(scene: Phaser.Scene) { this.scene = scene }
  update(view: { x: number; y: number; width: number; height: number }, zoom: number): void {
    const tiles = cityGroundTiles(view, zoom), wanted = new Set(tiles.map(t => t.id))
    for (const [id, sprite] of this.resident) if (!wanted.has(id)) {
      sprite.destroy(); this.scene.textures.remove(`city-detail-${id}`); this.resident.delete(id)
    }
    const [next] = tiles.filter(t => !this.resident.has(t.id)).slice(0, CITY_DETAIL_MATERIALIZE_PER_FRAME)
    if (!next) return
    const size = CITY_DETAIL_TILE_SIZE, key = `city-detail-${next.id}`
    const g = this.scene.make.graphics({ x: 0, y: 0 })
    g.save().translateCanvas(-next.x, -next.y)
    drawCityGround(g, { left: next.x, top: next.y, right: next.x + size, bottom: next.y + size })
    g.restore().generateTexture(key, size, size); g.destroy()
    const sprite = this.scene.add.image(next.x, next.y, key).setOrigin(0, 0).setDepth(.5)
    this.scene.cameras.getCamera('FixedScreenUI')?.ignore(sprite)
    this.resident.set(next.id, sprite)
  }
  destroy(): void {
    for (const [id, sprite] of this.resident) { sprite.destroy(); this.scene.textures.remove(`city-detail-${id}`) }
    this.resident.clear()
  }
}
