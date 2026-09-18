import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const config = JSON.parse(await readFile('startup-cinematic-source.json', 'utf8'))
const outputDir = path.resolve('public/assets/cinematics')
const outputPath = path.join(outputDir, 'startup-world-presentation-v1.mp4')

if (!/^https:\/\//.test(config.sourceUrl)) {
  throw new Error('Startup cinematic sourceUrl must be HTTPS.')
}
if (!/^[0-9a-f]{64}$/.test(config.sha256)) {
  throw new Error('Startup cinematic sha256 must be a lowercase SHA-256 digest.')
}

const response = await fetch(config.sourceUrl)
if (!response.ok) {
  throw new Error(`Startup cinematic download failed: ${response.status} ${response.statusText}`)
}
const bytes = Buffer.from(await response.arrayBuffer())
const digest = createHash('sha256').update(bytes).digest('hex')

if (digest !== config.sha256) {
  throw new Error(`Startup cinematic hash mismatch: expected ${config.sha256}, got ${digest}`)
}
if (bytes.length !== config.media.bytes) {
  throw new Error(`Startup cinematic byte length mismatch: expected ${config.media.bytes}, got ${bytes.length}`)
}

await mkdir(outputDir, { recursive: true })
await writeFile(outputPath, bytes)

console.log(`Startup cinematic prepared: ${outputPath} (${bytes.length} bytes, sha256 ${digest})`)
