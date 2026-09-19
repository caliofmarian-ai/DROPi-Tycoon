import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'

const [main, navigation, recovery, recoveryDawn, immersiveAudio, surfaceFinish, stage, config, male, female] = await Promise.all([
  readFile('src/main.ts', 'utf8'),
  readFile('src/navigationAssist.ts', 'utf8'),
  readFile('src/recoveryOpeningOwnerEvalV1.ts', 'utf8'),
  readFile('src/recoveryDawnPresentationV1.ts', 'utf8'),
  readFile('src/immersiveAudioV1.ts', 'utf8'),
  readFile('src/surfaceFinish.ts', 'utf8'),
  readFile('scripts/prepareAndroidEvaluationStage.mjs', 'utf8'),
  readFile('recovery-film1-sources.json', 'utf8').then(JSON.parse),
  readFile('public/assets/cinematics/recovery-awakening-male-v1.mp4'),
  readFile('public/assets/cinematics/recovery-awakening-female-v1.mp4'),
])

assert.match(stage, /startupCinematic=1&recoveryOpening=1/)
assert.match(main, /RECOVERY_OWNER_EVAL/)
assert.match(main, /Walk the streets and look for work opportunities\./)
assert.match(main, /createBuilding\('dropi-hq', 29, 15, 18, 12, 14/)
assert.match(main, /createBuilding\('maras-market', -27, -13, 14, 10, 9/)
assert.match(main, /RECOVERY_OWNER_EVAL \? undefined : \{ text: "MARA'S MARKET", accent: '#c98425' \}/)
assert.match(main, /RECOVERY_OWNER_EVAL \? \[\] : \[/)
assert.match(main, /interactButton\.hidden = true/)
assert.match(main, /parcel\.setEnabled\(false\)/)

assert.match(navigation, /disabled-no-phone/)
assert.match(navigation, /getRoute: \(\) => \[\]/)
assert.match(navigation, /getMapRange: \(\) => 0/)

assert.match(recovery, /hero-sex:male|data-hero="male"/)
assert.match(recovery, /hero-sex:female|data-hero="female"/)
assert.match(recovery, /RECOVERY · ON FOOT · NO PHONE · NO GPS/)
assert.match(recovery, /Story Film 1 · Recovery Awakening/)
assert.match(recovery, /SKIP FILM/)
assert.match(recovery, /CONTINUE AS GUEST/)
assert.match(recovery, /SIGN IN \/ CREATE ACCOUNT/)
assert.match(recovery, /dropi:guest-profile:v1/)
assert.match(recovery, /guest-local-eval/)
assert.match(recovery, /ACCOUNT_NOT_ENABLED/)
assert.match(recovery, /blocked WORK_SEARCH without explicit Guest access/)
assert.match(recovery, /state\.accessMode !== 'guest'/)
assert.match(recovery, /dropi:startup-cinematic-dismissed/)
assert.match(recovery, /dropi:recovery-access-choice-visible/)
assert.match(recovery, /ownerEvalLoopback/)
assert.match(recovery, /window\.location\.port === '17832'/)
assert.match(recovery, /dropi:story:recovery-rise:v2:/)
assert.match(recovery, /REPLAY STORY FILM/)
assert.match(recovery, /CHANGE HERO \(EVAL\)/)
assert.match(recovery, /dropi:cinematic-audio-state/)
assert.match(recovery, /classList\.add\('handoff'\)/)
assert.match(immersiveAudio, /cinematicActive/)
assert.match(immersiveAudio, /dropi:cinematic-audio-state/)
assert.match(immersiveAudio, /applyMasterMix/)
assert.match(stage, /allowBackup: false/)
assert.match(recovery, /dropi:recovery-work-search-start/)
assert.match(recoveryDawn, /RECOVERY_PREDAWN_PRESENTATION/)
assert.match(recoveryDawn, /PRESENTATION_ONLY_NOT_WORLD_CLOCK/)
assert.match(recoveryDawn, /recovery-sleeping-cardboard/)
assert.match(recoveryDawn, /recovery-sleeping-blanket/)
assert.match(recoveryDawn, /recovery-overhang-canopy/)
assert.match(recovery, /Walk the streets and look for work opportunities\./)

assert.equal(createHash('sha256').update(male).digest('hex'), config.candidates.male.sha256)
assert.equal(male.length, config.candidates.male.bytes)
assert.equal(createHash('sha256').update(female).digest('hex'), config.candidates.female.sha256)
assert.equal(female.length, config.candidates.female.bytes)
assert.equal(config.candidates.male.durationSeconds >= 40, true, 'Male Recovery Film 1 must be at least 40 seconds')
assert.equal(config.candidates.female.durationSeconds >= 40, true, 'Female Recovery Film 1 must be at least 40 seconds')
assert.equal(config.environment?.elementId, 'eb818fef-4317-40d0-8108-38734b88fc06')

assert.equal(config.beatId, 'beat:recovery:origin:rise')
assert.equal(config.canonicalFactId, 'fact:recovery:prologue-seen')
assert.equal(config.candidates.male.heroPresentationId, 'hero-sex:male')
assert.equal(config.candidates.female.heroPresentationId, 'hero-sex:female')

console.log('Recovery opening owner-eval v1 contract PASS')
