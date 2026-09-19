import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const config = JSON.parse(await readFile('recovery-film1-sources.json', 'utf8'))
const outputDir = path.resolve('public/assets/cinematics')
await mkdir(outputDir, { recursive: true })

const entries = [
  ['male', 'recovery-awakening-male-v1.mp4'],
  ['female', 'recovery-awakening-female-v1.mp4'],
]

for (const [key, filename] of entries) {
  const candidate = config.candidates[key]
  if (!candidate) throw new Error(`Missing recovery Film 1 candidate: ${key}`)
  if (!/^https:\/\//.test(candidate.sourceUrl)) throw new Error(`${key} sourceUrl must be HTTPS`)
  if (!/^[0-9a-f]{64}$/.test(candidate.sha256)) throw new Error(`${key} sha256 invalid`)

  const response = await fetch(candidate.sourceUrl)
  if (!response.ok) throw new Error(`${key} download failed: ${response.status} ${response.statusText}`)
  const bytes = Buffer.from(await response.arrayBuffer())
  const digest = createHash('sha256').update(bytes).digest('hex')
  if (digest !== candidate.sha256) throw new Error(`${key} hash mismatch: expected ${candidate.sha256}, got ${digest}`)
  if (bytes.length !== candidate.bytes) throw new Error(`${key} byte length mismatch: expected ${candidate.bytes}, got ${bytes.length}`)

  const target = path.join(outputDir, filename)
  await writeFile(target, bytes)
  console.log(`Prepared ${key} recovery Film 1: ${target} (${bytes.length} bytes, sha256 ${digest})`)
}
