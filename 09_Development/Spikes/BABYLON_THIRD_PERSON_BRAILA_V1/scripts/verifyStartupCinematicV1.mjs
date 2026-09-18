import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'

const index = await readFile('index.html', 'utf8')
const source = await readFile('src/startupCinematicV1.ts', 'utf8')
const stage = await readFile('scripts/prepareAndroidEvaluationStage.mjs', 'utf8')
const sourceConfig = JSON.parse(await readFile('startup-cinematic-source.json', 'utf8'))
const videoBytes = await readFile('public/assets/cinematics/startup-world-presentation-v1.mp4')

assert.match(index, /startupCinematicV1\.ts/)
assert.match(source, /CONTINUE TO GAME/)
assert.match(source, /__DROPiEvaluationReadiness/)
assert.match(source, /READY_TO_CONTINUE/)
assert.match(source, /VIDEO_UNAVAILABLE/)
assert.match(source, /dropi:presentation:startup-world-film:v1/)
assert.match(source, /window\.localStorage\.setItem/)
assert.match(source, /video\.addEventListener\('error'/)
assert.match(source, /startupCinematic/)
assert.match(stage, /startupCinematic=1/)
assert.match(stage, /source=\{\{ uri: gameUrl \}\}/)

console.log('Startup cinematic v1 contract PASS')
