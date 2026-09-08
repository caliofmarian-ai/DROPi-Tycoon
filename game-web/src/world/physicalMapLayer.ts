import Phaser from 'phaser'
import type { MapBounds } from './globalMapTopology'
import { boundsOverlap } from './semanticMapCamera'

export interface PhysicalFeature {
  id: string; kind: 'river' | 'lake' | 'landform'; name: string; class: string; rank: number
  bounds: [number, number, number, number]; label: [number, number]; paths: [number, number][][]
}
export interface ReliefTile { id: string; url: string; bounds: [number, number, number, number] }
export interface ReliefManifest { tiles: ReliefTile[]; maximumActiveTiles: number }
export const geoBoundsToMap = ([west, south, east, north]: number[]): MapBounds =>
  ({ left: (west + 180) * 4, top: (90 - north) * 4, right: (east + 180) * 4, bottom: (90 - south) * 4 })
export const geoPathToMap = (path: [number, number][]): { x: number; y: number }[] =>
  path.map(([lon, lat]) => ({ x: (lon + 180) * 4, y: (90 - lat) * 4 }))

/** Six resident detail tiles, two requests at a time. Overview remains visible through loading/failure. */
export class ReliefTileLayer {
  private readonly scene: Phaser.Scene
  private readonly layer: Phaser.GameObjects.Container
  private readonly manifest: ReliefManifest
  private desired: ReliefTile[] = []
  private readonly resident = new Map<string, Phaser.GameObjects.Image>()
  private readonly pending = new Map<string, HTMLImageElement>()
  private readonly failed = new Set<string>()
  private alive = true
  constructor(scene: Phaser.Scene, layer: Phaser.GameObjects.Container, manifest: ReliefManifest) {
    this.scene = scene; this.layer = layer; this.manifest = manifest
  }
  update(bounds: MapBounds, detail: boolean): void {
    const cx = (bounds.left + bounds.right) / 2, cy = (bounds.top + bounds.bottom) / 2
    this.desired = detail ? this.manifest.tiles.filter(t => boundsOverlap(geoBoundsToMap(t.bounds), bounds))
      .sort((a, b) => {
        const x = geoBoundsToMap(a.bounds), y = geoBoundsToMap(b.bounds)
        return Math.hypot((x.left + x.right) / 2 - cx, (x.top + x.bottom) / 2 - cy) -
          Math.hypot((y.left + y.right) / 2 - cx, (y.top + y.bottom) / 2 - cy)
      }).slice(0, Math.min(6, this.manifest.maximumActiveTiles)) : []
    this.reconcile()
  }
  private reconcile(): void {
    if (!this.alive) return
    const desiredIds = new Set(this.desired.map(t => t.id))
    for (const [id, sprite] of this.resident) {
      if (desiredIds.has(id)) continue
      sprite.destroy(); this.scene.textures.remove(`relief-detail-${id}`); this.resident.delete(id)
    }
    for (const tile of this.desired) {
      if (this.pending.size >= 2) break
      if (this.resident.has(tile.id) || this.pending.has(tile.id) || this.failed.has(tile.id)) continue
      const bitmap = new Image()
      this.pending.set(tile.id, bitmap)
      bitmap.onload = () => {
        this.pending.delete(tile.id)
        if (!this.alive) return
        if (this.desired.some(t => t.id === tile.id)) {
          const key = `relief-detail-${tile.id}`
          if (!this.scene.textures.exists(key)) this.scene.textures.addImage(key, bitmap)
          const b = geoBoundsToMap(tile.bounds)
          const sprite = this.scene.add.image(b.left, b.top, key).setOrigin(0, 0).setDisplaySize(b.right - b.left, b.bottom - b.top)
          this.layer.add(sprite); this.resident.set(tile.id, sprite)
        }
        this.reconcile()
      }
      bitmap.onerror = () => { this.pending.delete(tile.id); this.failed.add(tile.id); this.reconcile() }
      bitmap.src = tile.url
    }
  }
  destroy(): void {
    this.alive = false
    for (const bitmap of this.pending.values()) { bitmap.onload = null; bitmap.onerror = null; bitmap.src = '' }
    this.pending.clear()
    for (const [id, sprite] of this.resident) { sprite.destroy(); this.scene.textures.remove(`relief-detail-${id}`) }
    this.resident.clear()
  }
}
