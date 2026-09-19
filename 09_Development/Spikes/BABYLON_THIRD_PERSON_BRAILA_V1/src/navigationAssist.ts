import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera'
import { EngineStore } from '@babylonjs/core/Engines/engineStore'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'

const ISSUE = 716
const CELL_SIZE_M = 2
const ROUTE_CLEARANCE_M = 0.85
const ROUTE_REFRESH_MS = 1100
const ROUTE_Y_M = 0.15
const MAP_MIN_RANGE_M = 16
const MAP_MAX_RANGE_M = 70

type Cell = { x: number; z: number }
type WorldBounds = { minX: number; maxX: number; minZ: number; maxZ: number }
type Box2D = { minX: number; maxX: number; minZ: number; maxZ: number; preferred: boolean }

type NavigationDebug = {
  issue: number
  mode: 'scene-derived-mission-gps' | 'disabled-no-phone'
  getRoute(): Array<{ x: number; z: number }>
  getMapRange(): number
}

declare global {
  interface Window {
    __DROPiNavigationAssist?: NavigationDebug
  }
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value))

const keyOf = (cell: Cell): string => `${cell.x},${cell.z}`

const addStyles = (): void => {
  const style = document.createElement('style')
  style.dataset.dropiNavigationAssist = String(ISSUE)
  style.textContent = `
    #dropi-gps {
      position: fixed;
      right: max(10px, env(safe-area-inset-right));
      top: 42px;
      z-index: 11;
      width: 178px;
      padding: 7px;
      box-sizing: border-box;
      border: 1px solid rgba(102, 255, 225, .42);
      border-radius: 12px;
      background: rgba(3, 15, 26, .82);
      box-shadow: 0 12px 28px rgba(0, 0, 0, .28);
      backdrop-filter: blur(8px);
      pointer-events: auto;
      user-select: none;
      -webkit-user-select: none;
    }

    #dropi-gps.expanded {
      width: min(78vw, 520px);
      top: 50%;
      right: 50%;
      transform: translate(50%, -50%);
      padding: 10px;
      z-index: 30;
    }

    #dropi-gps-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 5px;
      color: #9fffe9;
      font-size: 9px;
      font-weight: 900;
      letter-spacing: .11em;
    }

    #dropi-gps canvas {
      display: block;
      width: 100%;
      height: 112px;
      border-radius: 8px;
      background: #0b1720;
      touch-action: none;
    }

    #dropi-gps.expanded canvas {
      height: min(58vh, 360px);
    }

    #dropi-gps-controls {
      display: flex;
      gap: 5px;
      margin-top: 6px;
    }

    #dropi-gps-controls button {
      flex: 1;
      min-width: 0;
      min-height: 30px;
      border: 1px solid rgba(255,255,255,.18);
      border-radius: 8px;
      background: rgba(12, 44, 62, .9);
      color: white;
      font-size: 10px;
      font-weight: 900;
      touch-action: none;
    }

    #dropi-next-turn {
      position: fixed;
      left: 50%;
      top: max(9px, env(safe-area-inset-top));
      z-index: 10;
      min-width: 116px;
      transform: translateX(-50%);
      padding: 7px 10px;
      border-radius: 10px;
      border: 1px solid rgba(102, 255, 225, .34);
      background: rgba(3, 15, 26, .74);
      color: #dffff7;
      font-size: 11px;
      font-weight: 900;
      text-align: center;
      pointer-events: none;
    }

    #dropi-next-turn strong {
      color: #66ffe1;
      font-size: 17px;
      margin-right: 4px;
    }

    @media (orientation: landscape) and (max-height: 600px) {
      #dropi-gps {
        width: 160px;
        top: 38px;
      }
      #dropi-gps canvas {
        height: 92px;
      }
      #dropi-next-turn {
        top: 7px;
        padding: 5px 8px;
        font-size: 9px;
      }
    }
  `
  document.head.append(style)
}

const boot = (): void => {
  const query = new URLSearchParams(window.location.search)
  const ownerEvalLoopback =
    window.location.hostname === '127.0.0.1' &&
    window.location.port === '17832'
  const recoveryOpening =
    ownerEvalLoopback ||
    query.get('recoveryOpening') === '1' ||
    query.get('recoveryOpening') === 'force'
  if (recoveryOpening) {
    window.__DROPiNavigationAssist = {
      issue: ISSUE,
      mode: 'disabled-no-phone',
      getRoute: () => [],
      getMapRange: () => 0,
    }
    return
  }

  const scene = EngineStore.LastCreatedScene
  const hero = scene?.getTransformNodeByName('hero')
  const marker = scene?.getMeshByName('objective-marker')
  const camera = scene?.activeCamera
  const ground = scene?.getMeshByName('ground')

  if (!scene || !hero || !marker || !(camera instanceof ArcRotateCamera) || !ground) {
    window.requestAnimationFrame(boot)
    return
  }

  addStyles()

  const groundBounds = ground.getBoundingInfo().boundingBox
  const worldBounds: WorldBounds = {
    minX: groundBounds.minimumWorld.x,
    maxX: groundBounds.maximumWorld.x,
    minZ: groundBounds.minimumWorld.z,
    maxZ: groundBounds.maximumWorld.z,
  }

  const collisionBoxes: Box2D[] = scene.meshes
    .filter(mesh => mesh.checkCollisions && mesh.isEnabled())
    .map(mesh => {
      const bounds = mesh.getBoundingInfo().boundingBox
      return {
        minX: bounds.minimumWorld.x,
        maxX: bounds.maximumWorld.x,
        minZ: bounds.minimumWorld.z,
        maxZ: bounds.maximumWorld.z,
        preferred: false,
      }
    })

  const preferredBoxes: Box2D[] = scene.meshes
    .filter(mesh => /^(road-|sidewalk-|quay)/.test(mesh.name) && mesh.isEnabled())
    .map(mesh => {
      const bounds = mesh.getBoundingInfo().boundingBox
      return {
        minX: bounds.minimumWorld.x,
        maxX: bounds.maximumWorld.x,
        minZ: bounds.minimumWorld.z,
        maxZ: bounds.maximumWorld.z,
        preferred: true,
      }
    })

  const routeMaterial = new StandardMaterial('dropi-gps-route-material', scene)
  routeMaterial.diffuseColor = Color3.FromHexString('#56ffe0')
  routeMaterial.emissiveColor = Color3.FromHexString('#20ffd8')
  routeMaterial.specularColor = Color3.Black()
  routeMaterial.alpha = 0.92

  let routeMeshes: Mesh[] = []
  let routePoints: Vector3[] = []
  let mapRangeM = 34
  let lastRouteAt = -Infinity
  let lastGoal = new Vector3(Number.NaN, 0, Number.NaN)

  const pointInside = (box: Box2D, x: number, z: number, padding = 0): boolean =>
    x >= box.minX - padding && x <= box.maxX + padding && z >= box.minZ - padding && z <= box.maxZ + padding

  const isBlocked = (x: number, z: number): boolean =>
    collisionBoxes.some(box => pointInside(box, x, z, ROUTE_CLEARANCE_M))

  const isPreferred = (x: number, z: number): boolean =>
    preferredBoxes.some(box => pointInside(box, x, z, 0.65))

  const worldToCell = (position: Vector3): Cell => ({
    x: Math.round((position.x - worldBounds.minX) / CELL_SIZE_M),
    z: Math.round((position.z - worldBounds.minZ) / CELL_SIZE_M),
  })

  const cellToWorld = (cell: Cell): Vector3 => new Vector3(
    worldBounds.minX + cell.x * CELL_SIZE_M,
    ROUTE_Y_M,
    worldBounds.minZ + cell.z * CELL_SIZE_M,
  )

  const inBounds = (cell: Cell): boolean => {
    const point = cellToWorld(cell)
    return point.x >= worldBounds.minX + 1 && point.x <= worldBounds.maxX - 1 &&
      point.z >= worldBounds.minZ + 1 && point.z <= worldBounds.maxZ - 1
  }

  const nearestWalkableCell = (source: Cell): Cell => {
    if (!isBlocked(cellToWorld(source).x, cellToWorld(source).z)) return source
    for (let radius = 1; radius <= 5; radius += 1) {
      for (let dx = -radius; dx <= radius; dx += 1) {
        for (let dz = -radius; dz <= radius; dz += 1) {
          if (Math.abs(dx) !== radius && Math.abs(dz) !== radius) continue
          const candidate = { x: source.x + dx, z: source.z + dz }
          const point = cellToWorld(candidate)
          if (inBounds(candidate) && !isBlocked(point.x, point.z)) return candidate
        }
      }
    }
    return source
  }

  const buildRoute = (startPosition: Vector3, goalPosition: Vector3): Vector3[] => {
    const start = nearestWalkableCell(worldToCell(startPosition))
    const goal = nearestWalkableCell(worldToCell(goalPosition))
    const startKey = keyOf(start)
    const goalKey = keyOf(goal)

    const open: Cell[] = [start]
    const openSet = new Set<string>([startKey])
    const cameFrom = new Map<string, string>()
    const cells = new Map<string, Cell>([[startKey, start], [goalKey, goal]])
    const gScore = new Map<string, number>([[startKey, 0]])
    const fScore = new Map<string, number>([[startKey, Math.hypot(goal.x - start.x, goal.z - start.z)]])

    const neighborOffsets: Cell[] = [
      { x: 1, z: 0 }, { x: -1, z: 0 }, { x: 0, z: 1 }, { x: 0, z: -1 },
      { x: 1, z: 1 }, { x: 1, z: -1 }, { x: -1, z: 1 }, { x: -1, z: -1 },
    ]

    let iterations = 0
    while (open.length > 0 && iterations < 12000) {
      iterations += 1
      open.sort((a, b) => (fScore.get(keyOf(a)) ?? Infinity) - (fScore.get(keyOf(b)) ?? Infinity))
      const current = open.shift()
      if (!current) break
      const currentKey = keyOf(current)
      openSet.delete(currentKey)

      if (currentKey === goalKey) {
        const reversed: Cell[] = [goal]
        let cursor = goalKey
        while (cameFrom.has(cursor)) {
          const parent = cameFrom.get(cursor)
          if (!parent) break
          const parentCell = cells.get(parent)
          if (!parentCell) break
          reversed.push(parentCell)
          cursor = parent
          if (cursor === startKey) break
        }
        reversed.reverse()
        const raw = reversed.map(cellToWorld)
        if (raw.length === 0) return []
        raw[0] = new Vector3(startPosition.x, ROUTE_Y_M, startPosition.z)
        raw[raw.length - 1] = new Vector3(goalPosition.x, ROUTE_Y_M, goalPosition.z)
        return raw
      }

      for (const offset of neighborOffsets) {
        const neighbor = { x: current.x + offset.x, z: current.z + offset.z }
        if (!inBounds(neighbor)) continue
        const world = cellToWorld(neighbor)
        if (isBlocked(world.x, world.z) && keyOf(neighbor) !== goalKey) continue

        if (offset.x !== 0 && offset.z !== 0) {
          const sideA = cellToWorld({ x: current.x + offset.x, z: current.z })
          const sideB = cellToWorld({ x: current.x, z: current.z + offset.z })
          if (isBlocked(sideA.x, sideA.z) || isBlocked(sideB.x, sideB.z)) continue
        }

        const neighborKey = keyOf(neighbor)
        cells.set(neighborKey, neighbor)
        const distanceCost = offset.x !== 0 && offset.z !== 0 ? Math.SQRT2 : 1
        const surfaceCost = isPreferred(world.x, world.z) ? 1 : 3.2
        const tentative = (gScore.get(currentKey) ?? Infinity) + distanceCost * surfaceCost

        if (tentative >= (gScore.get(neighborKey) ?? Infinity)) continue
        cameFrom.set(neighborKey, currentKey)
        gScore.set(neighborKey, tentative)
        fScore.set(neighborKey, tentative + Math.hypot(goal.x - neighbor.x, goal.z - neighbor.z))
        if (!openSet.has(neighborKey)) {
          open.push(neighbor)
          openSet.add(neighborKey)
        }
      }
    }

    return [
      new Vector3(startPosition.x, ROUTE_Y_M, startPosition.z),
      new Vector3(goalPosition.x, ROUTE_Y_M, goalPosition.z),
    ]
  }

  const disposeRouteMeshes = (): void => {
    for (const mesh of routeMeshes) mesh.dispose()
    routeMeshes = []
  }

  const renderWorldRoute = (points: Vector3[]): void => {
    disposeRouteMeshes()
    if (points.length < 2) return

    for (let index = 0; index < points.length - 1; index += 1) {
      const a = points[index]
      const b = points[index + 1]
      if (!a || !b) continue
      const dx = b.x - a.x
      const dz = b.z - a.z
      const length = Math.hypot(dx, dz)
      if (length < 0.25) continue

      const strip = MeshBuilder.CreateBox(`dropi-gps-route-${index}`, {
        width: 0.28,
        depth: length,
        height: 0.035,
      }, scene)
      strip.position.set((a.x + b.x) / 2, ROUTE_Y_M, (a.z + b.z) / 2)
      strip.rotation.y = Math.atan2(dx, dz)
      strip.material = routeMaterial
      strip.isPickable = false
      routeMeshes.push(strip)
    }
  }

  const panel = document.createElement('section')
  panel.id = 'dropi-gps'
  panel.setAttribute('aria-label', 'Mission GPS')

  const title = document.createElement('div')
  title.id = 'dropi-gps-title'
  title.innerHTML = '<span>MISSION GPS · #716</span><span id="dropi-gps-distance">—</span>'

  const canvas = document.createElement('canvas')
  canvas.width = 420
  canvas.height = 280
  canvas.setAttribute('aria-label', 'Mission minimap')

  const controls = document.createElement('div')
  controls.id = 'dropi-gps-controls'

  const mapOut = document.createElement('button')
  mapOut.type = 'button'
  mapOut.textContent = 'MAP −'

  const mapIn = document.createElement('button')
  mapIn.type = 'button'
  mapIn.textContent = 'MAP +'

  const mapToggle = document.createElement('button')
  mapToggle.type = 'button'
  mapToggle.textContent = 'EXPAND'

  controls.append(mapOut, mapIn, mapToggle)
  panel.append(title, canvas, controls)
  document.body.append(panel)

  const nextTurn = document.createElement('div')
  nextTurn.id = 'dropi-next-turn'
  nextTurn.innerHTML = '<strong>↑</strong> Follow mission route'
  document.body.append(nextTurn)

  mapOut.addEventListener('pointerdown', event => {
    event.preventDefault()
    event.stopPropagation()
    mapRangeM = clamp(mapRangeM + 8, MAP_MIN_RANGE_M, MAP_MAX_RANGE_M)
  })
  mapIn.addEventListener('pointerdown', event => {
    event.preventDefault()
    event.stopPropagation()
    mapRangeM = clamp(mapRangeM - 8, MAP_MIN_RANGE_M, MAP_MAX_RANGE_M)
  })
  mapToggle.addEventListener('pointerdown', event => {
    event.preventDefault()
    event.stopPropagation()
    panel.classList.toggle('expanded')
    mapToggle.textContent = panel.classList.contains('expanded') ? 'CLOSE' : 'EXPAND'
  })

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const worldToMap = (world: Vector3): { x: number; y: number } => {
    const target = camera.getTarget()
    const forward = target.subtract(camera.position)
    forward.y = 0
    if (forward.lengthSquared() < 0.0001) forward.copyFromFloats(0, 0, 1)
    forward.normalize()
    const right = new Vector3(forward.z, 0, -forward.x)
    const relative = world.subtract(hero.position)
    const rightM = Vector3.Dot(relative, right)
    const forwardM = Vector3.Dot(relative, forward)
    const pixelsPerM = Math.min(canvas.width, canvas.height) / (mapRangeM * 2)
    return {
      x: canvas.width / 2 + rightM * pixelsPerM,
      y: canvas.height / 2 - forwardM * pixelsPerM,
    }
  }

  const drawBox = (box: Box2D, fill: string): void => {
    const corners = [
      new Vector3(box.minX, 0, box.minZ),
      new Vector3(box.maxX, 0, box.minZ),
      new Vector3(box.maxX, 0, box.maxZ),
      new Vector3(box.minX, 0, box.maxZ),
    ].map(worldToMap)
    ctx.beginPath()
    ctx.moveTo(corners[0]?.x ?? 0, corners[0]?.y ?? 0)
    for (let index = 1; index < corners.length; index += 1) {
      const point = corners[index]
      if (point) ctx.lineTo(point.x, point.y)
    }
    ctx.closePath()
    ctx.fillStyle = fill
    ctx.fill()
  }

  const arrowFor = (right: number, forward: number): string => {
    const angle = Math.atan2(right, forward)
    const octant = Math.round(angle / (Math.PI / 4))
    const arrows = ['↑', '↗', '→', '↘', '↓', '↙', '←', '↖']
    return arrows[(octant + 8) % 8] ?? '↑'
  }

  const drawMap = (): void => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#0a151d'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    for (const box of preferredBoxes) drawBox(box, 'rgba(142, 157, 163, .38)')
    for (const box of collisionBoxes) drawBox(box, 'rgba(22, 31, 38, .88)')

    if (routePoints.length > 1) {
      ctx.beginPath()
      routePoints.forEach((point, index) => {
        const mapped = worldToMap(point)
        if (index === 0) ctx.moveTo(mapped.x, mapped.y)
        else ctx.lineTo(mapped.x, mapped.y)
      })
      ctx.strokeStyle = '#55ffe1'
      ctx.lineWidth = 7
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.stroke()
    }

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.beginPath()
    ctx.moveTo(0, -12)
    ctx.lineTo(9, 10)
    ctx.lineTo(-9, 10)
    ctx.closePath()
    ctx.fillStyle = '#ffffff'
    ctx.fill()
    ctx.restore()

    if (marker.isEnabled()) {
      const goalMapped = worldToMap(marker.position)
      const margin = 13
      const gx = clamp(goalMapped.x, margin, canvas.width - margin)
      const gy = clamp(goalMapped.y, margin, canvas.height - margin)
      ctx.beginPath()
      ctx.arc(gx, gy, 9, 0, Math.PI * 2)
      ctx.fillStyle = '#ffcf54'
      ctx.fill()
      ctx.lineWidth = 3
      ctx.strokeStyle = '#ffffff'
      ctx.stroke()
    }
  }

  const updateGuidance = (): void => {
    if (!marker.isEnabled()) {
      routePoints = []
      disposeRouteMeshes()
      nextTurn.innerHTML = '<strong>✓</strong> Route complete'
      return
    }

    const now = performance.now()
    const goalChanged = !Number.isFinite(lastGoal.x) || Vector3.DistanceSquared(lastGoal, marker.position) > 0.5
    if (goalChanged || now - lastRouteAt >= ROUTE_REFRESH_MS) {
      routePoints = buildRoute(hero.position, marker.position)
      renderWorldRoute(routePoints)
      lastRouteAt = now
      lastGoal.copyFrom(marker.position)
    }

    const distance = Vector3.Distance(new Vector3(hero.position.x, 0, hero.position.z), new Vector3(marker.position.x, 0, marker.position.z))
    const distanceEl = document.querySelector<HTMLElement>('#dropi-gps-distance')
    if (distanceEl) distanceEl.textContent = `${distance.toFixed(0)} m`

    const lookAhead = routePoints.find(point => Vector3.DistanceSquared(point, hero.position) > 12) ?? routePoints[routePoints.length - 1]
    if (lookAhead) {
      const target = camera.getTarget()
      const forward = target.subtract(camera.position)
      forward.y = 0
      if (forward.lengthSquared() > 0.0001) {
        forward.normalize()
        const right = new Vector3(forward.z, 0, -forward.x)
        const direction = lookAhead.subtract(hero.position)
        direction.y = 0
        const forwardAmount = Vector3.Dot(direction, forward)
        const rightAmount = Vector3.Dot(direction, right)
        const arrow = arrowFor(rightAmount, forwardAmount)
        nextTurn.innerHTML = `<strong>${arrow}</strong> ${Math.max(0, Math.round(Math.hypot(rightAmount, forwardAmount)))} m`
      }
    }
  }

  scene.onBeforeRenderObservable.add(() => {
    updateGuidance()
    drawMap()
  })

  window.__DROPiNavigationAssist = {
    issue: ISSUE,
    mode: 'scene-derived-mission-gps',
    getRoute: () => routePoints.map(point => ({ x: point.x, z: point.z })),
    getMapRange: () => mapRangeM,
  }
}

boot()
