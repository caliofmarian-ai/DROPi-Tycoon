import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const facadePath = path.resolve(scriptDirectory, '../src/babylonFacade.ts')
const facadeSource = await readFile(facadePath, 'utf8')
const collisionImport = /^import\s+['"]@babylonjs\/core\/Collisions\/collisionCoordinator['"]\s*;?\s*$/m

if (!collisionImport.test(facadeSource)) {
  throw new Error(
    'babylonFacade.ts must import the collision coordinator side effect before camera collisions are enabled.',
  )
}

const { Scene } = await import('@babylonjs/core/scene.js')

let missingRegistrationError = ''
try {
  Scene.CollisionCoordinatorFactory()
} catch (error) {
  missingRegistrationError = error instanceof Error ? error.message : String(error)
}

if (!missingRegistrationError.includes('DefaultCollisionCoordinator needs to be imported before')) {
  throw new Error('Pinned Babylon collision registration precondition changed; re-audit the runtime facade.')
}

await import('@babylonjs/core/Collisions/collisionCoordinator.js')
const coordinator = Scene.CollisionCoordinatorFactory()

if (coordinator.constructor.name !== 'DefaultCollisionCoordinator') {
  throw new Error(`Unexpected Babylon collision coordinator: ${coordinator.constructor.name}`)
}

const [
  { NullEngine },
  { ArcRotateCamera },
  { Vector3 },
] = await Promise.all([
  import('@babylonjs/core/Engines/nullEngine.js'),
  import('@babylonjs/core/Cameras/arcRotateCamera.js'),
  import('@babylonjs/core/Maths/math.vector.js'),
])

const engine = new NullEngine({
  renderWidth: 320,
  renderHeight: 180,
  textureSize: 256,
  deterministicLockstep: true,
  lockstepMaxSteps: 1,
})
const scene = new Scene(engine)

try {
  scene.collisionsEnabled = true
  const camera = new ArcRotateCamera('collision-registration-test', 0, 1, 6, Vector3.Zero(), scene)
  camera.checkCollisions = true
  camera.getViewMatrix(true)

  if (scene.collisionCoordinator.constructor.name !== 'DefaultCollisionCoordinator') {
    throw new Error('Collision-enabled camera did not receive DefaultCollisionCoordinator.')
  }
} finally {
  scene.dispose()
  engine.dispose()
}

console.log('Babylon collision-enabled ArcRotateCamera registration verified.')
