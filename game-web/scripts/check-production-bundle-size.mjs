import { appendFile, readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { gzipSync } from 'node:zlib'

const BASELINE = Object.freeze({
  sourceMainSha: '36beafa99a7d711e6c74ce7871e4df304d0277bc',
  totalRawBytes: 4_053_656,
  totalGzipBytes: 1_020_368,
  rawToleranceBytes: 128 * 1024,
  gzipToleranceBytes: 48 * 1024,
})

const assetsDir = new URL('../dist/assets/', import.meta.url)

const listJavascriptFiles = async (directoryUrl) => {
  const entries = await readdir(directoryUrl, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const entryUrl = new URL(`${entry.name}${entry.isDirectory() ? '/' : ''}`, directoryUrl)
    if (entry.isDirectory()) {
      files.push(...await listJavascriptFiles(entryUrl))
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(entryUrl)
    }
  }

  return files.sort((left, right) => left.pathname.localeCompare(right.pathname))
}

const formatBytes = bytes => `${bytes.toLocaleString('en-US')} B (${(bytes / 1000).toFixed(2)} kB)`
const delta = (current, baseline) => current - baseline
const signedBytes = value => `${value >= 0 ? '+' : ''}${value.toLocaleString('en-US')} B`

const files = await listJavascriptFiles(assetsDir)
if (files.length === 0) {
  throw new Error('Bundle budget check found no JavaScript files under dist/assets. Run npm run build first.')
}

const chunks = []
for (const fileUrl of files) {
  const content = await readFile(fileUrl)
  chunks.push({
    name: path.basename(fileUrl.pathname),
    rawBytes: content.byteLength,
    gzipBytes: gzipSync(content, { level: 9 }).byteLength,
  })
}

const totals = chunks.reduce(
  (result, chunk) => ({
    rawBytes: result.rawBytes + chunk.rawBytes,
    gzipBytes: result.gzipBytes + chunk.gzipBytes,
  }),
  { rawBytes: 0, gzipBytes: 0 },
)

const rawLimit = BASELINE.totalRawBytes + BASELINE.rawToleranceBytes
const gzipLimit = BASELINE.totalGzipBytes + BASELINE.gzipToleranceBytes
const rawPassed = totals.rawBytes <= rawLimit
const gzipPassed = totals.gzipBytes <= gzipLimit
const passed = rawPassed && gzipPassed

console.log(`Bundle baseline main: ${BASELINE.sourceMainSha}`)
console.log(`JavaScript chunks: ${chunks.length}`)
for (const chunk of chunks) {
  console.log(`  ${chunk.name}: raw ${formatBytes(chunk.rawBytes)}, gzip-9 ${formatBytes(chunk.gzipBytes)}`)
}
console.log(`BUNDLE_METRIC total_raw_bytes=${totals.rawBytes}`)
console.log(`BUNDLE_METRIC total_gzip_bytes=${totals.gzipBytes}`)
console.log(`Baseline raw: ${formatBytes(BASELINE.totalRawBytes)}; delta ${signedBytes(delta(totals.rawBytes, BASELINE.totalRawBytes))}; limit ${formatBytes(rawLimit)}`)
console.log(`Baseline gzip-9: ${formatBytes(BASELINE.totalGzipBytes)}; delta ${signedBytes(delta(totals.gzipBytes, BASELINE.totalGzipBytes))}; limit ${formatBytes(gzipLimit)}`)
console.log(`Production web bundle regression gate: ${passed ? 'PASS' : 'FAIL'}`)

if (process.env.GITHUB_STEP_SUMMARY) {
  const rows = chunks
    .map(chunk => `| \`${chunk.name}\` | ${chunk.rawBytes.toLocaleString('en-US')} | ${chunk.gzipBytes.toLocaleString('en-US')} |`)
    .join('\n')
  const summary = [
    '## Production web bundle regression gate',
    '',
    `Baseline main: \`${BASELINE.sourceMainSha}\``,
    '',
    '| Metric | Current | Baseline | Tolerance | Limit |',
    '| --- | ---: | ---: | ---: | ---: |',
    `| Total JS raw bytes | ${totals.rawBytes.toLocaleString('en-US')} | ${BASELINE.totalRawBytes.toLocaleString('en-US')} | ${BASELINE.rawToleranceBytes.toLocaleString('en-US')} | ${rawLimit.toLocaleString('en-US')} |`,
    `| Total JS gzip-9 bytes | ${totals.gzipBytes.toLocaleString('en-US')} | ${BASELINE.totalGzipBytes.toLocaleString('en-US')} | ${BASELINE.gzipToleranceBytes.toLocaleString('en-US')} | ${gzipLimit.toLocaleString('en-US')} |`,
    '',
    '| Chunk | Raw bytes | gzip-9 bytes |',
    '| --- | ---: | ---: |',
    rows,
    '',
    `**Result: ${passed ? 'PASS' : 'FAIL'}**`,
    '',
  ].join('\n')
  await appendFile(process.env.GITHUB_STEP_SUMMARY, summary)
}

if (!passed) {
  const failures = []
  if (!rawPassed) failures.push(`raw JS ${totals.rawBytes} > ${rawLimit}`)
  if (!gzipPassed) failures.push(`gzip-9 JS ${totals.gzipBytes} > ${gzipLimit}`)
  throw new Error(`Material production web bundle regression: ${failures.join('; ')}`)
}
