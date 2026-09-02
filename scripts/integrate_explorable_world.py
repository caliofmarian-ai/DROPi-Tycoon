from pathlib import Path

path = Path('game-web/src/scenes/GameWorldScene.ts')
text = path.read_text()


def replace_once(old: str, new: str) -> None:
    global text
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f'Expected one match, found {count}: {old[:120]!r}')
    text = text.replace(old, new, 1)

replace_once(
    "import { WORLD_HEIGHT, WORLD_WIDTH } from '../state/gameState'\n",
    "import {\n"
    "  DELIVERY_ROUTE_POINTS,\n"
    "  WORLD_BUILDINGS,\n"
    "  WORLD_DECORATIONS,\n"
    "  WORLD_HEIGHT,\n"
    "  WORLD_ROADS,\n"
    "  WORLD_ROUTE_POINTS,\n"
    "  WORLD_SIDEWALKS,\n"
    "  WORLD_WIDTH,\n"
    "  WORLD_ZONES,\n"
    "} from '../world/worldLayout'\n",
)

old_constants = """const ROAD_POSITIONS = [
  { x: 240, y: 200 },
  { x: 272, y: 200 },
  { x: 304, y: 200 },
  { x: 336, y: 200 },
  { x: 432, y: 200 },
  { x: 464, y: 200 },
]

const BUILDINGS = [
  { x: 368, y: 182, texture: 'building_company_small' },
  { x: 80, y: 60, texture: 'building_residential' },
  { x: 160, y: 60, texture: 'building_residential' },
  { x: 580, y: 60, texture: 'building_commercial' },
  { x: 660, y: 60, texture: 'building_commercial' },
]

const DELIVERY_POINTS = [
  { x: 120, y: 490, label: 'PickupZone' },
  { x: 580, y: 470, label: 'DeliveryZone' },
  { x: 660, y: 510, label: 'DeliveryPoint' },
]

"""
replace_once(old_constants, '')

replace_once(
    "  private readonly packagePosition = new Phaser.Math.Vector2(120, 440)\n",
    "  private readonly packagePosition = new Phaser.Math.Vector2(0, 0)\n",
)

replace_once(
    "    this.load.image('environment_road_tile', '/assets/sprites/environment_road_tile.png')\n",
    '',
)

old_render = """    this.add.rectangle(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, WORLD_WIDTH, WORLD_HEIGHT, 0xa7f3d0)

    ROAD_POSITIONS.forEach(({ x, y }) => {
      this.add.image(x, y, 'environment_road_tile')
    })

    BUILDINGS.forEach(({ x, y, texture }) => {
      this.add.image(x, y, texture)
    })

    this.packageSprite = this.add.image(
      this.packagePosition.x,
      this.packagePosition.y,
      'package_delivery',
    )

    DELIVERY_POINTS.forEach(({ x, y, label }) => {
      this.add.image(x, y, 'delivery_point_marker')
      this.add
        .text(x, y + 28, label, {
          fontFamily: 'Arial',
          fontSize: '16px',
          color: '#0f172a',
        })
        .setOrigin(0.5, 0)
    })
"""
new_render = """    this.renderWorldLayout()

    this.packageSprite = this.add.image(
      this.packagePosition.x,
      this.packagePosition.y,
      'package_delivery',
    )
"""
replace_once(old_render, new_render)

replace_once(
    "          DELIVERY_POINTS,\n",
    "          DELIVERY_ROUTE_POINTS,\n",
)
replace_once(
    "    const targetPoint = DELIVERY_POINTS.find(\n",
    "    const targetPoint = DELIVERY_ROUTE_POINTS.find(\n",
)

anchor = """  private createNavigationButtons(): void {
"""
method = """  private renderWorldLayout(): void {
    this.add.rectangle(
      WORLD_WIDTH / 2,
      WORLD_HEIGHT / 2,
      WORLD_WIDTH,
      WORLD_HEIGHT,
      0xa7f3d0,
    )

    WORLD_ZONES.forEach((zone) => {
      this.add
        .rectangle(
          zone.x + zone.width / 2,
          zone.y + zone.height / 2,
          zone.width,
          zone.height,
          zone.fillColor,
          0.45,
        )
        .setStrokeStyle(3, 0x475569, 0.45)

      this.add.text(zone.x + 18, zone.y + 14, zone.label, {
        fontFamily: 'Arial',
        fontSize: '22px',
        color: '#0f172a',
        fontStyle: 'bold',
      })
    })

    WORLD_ROADS.forEach((road) => {
      this.add.rectangle(road.x, road.y, road.width, road.height, 0x64748b)
    })

    WORLD_SIDEWALKS.forEach((sidewalk) => {
      this.add.rectangle(
        sidewalk.x,
        sidewalk.y,
        sidewalk.width,
        sidewalk.height,
        0xe2e8f0,
      )
    })

    WORLD_BUILDINGS.forEach(({ x, y, texture }) => {
      this.add.image(x, y, texture).setScale(1.4)
    })

    WORLD_DECORATIONS.forEach(({ x, y, radius }) => {
      this.add.rectangle(x, y + radius, 7, radius * 1.4, 0x7c4a21)
      this.add.circle(x, y, radius, 0x15803d)
    })

    WORLD_ROUTE_POINTS.forEach(({ x, y, label, kind }) => {
      this.add.image(x, y, 'delivery_point_marker')
      this.add
        .text(x, y + 28, `${kind === 'pickup' ? 'Pickup' : 'Delivery'}: ${label}`, {
          fontFamily: 'Arial',
          fontSize: '15px',
          color: '#0f172a',
          backgroundColor: '#f8fafccc',
          padding: { x: 4, y: 2 },
        })
        .setOrigin(0.5, 0)
    })
  }

""" + anchor
replace_once(anchor, method)

path.write_text(text)
print('Explorable world scene integration: PASS')
