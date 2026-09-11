import {
  PLAYABLE_CITY_DETAIL_MIN_ZOOM,
  PLAYABLE_CITY_DETAIL_SECTOR_LIMIT,
  PLAYABLE_CITY_DETAIL_SECTOR_SIZE,
} from './playableCityScale'
import { reserveLabel, type MapViewport, type SemanticMapLevel } from './semanticMapCamera'

/**
 * Locality-neutral semantic presentation contract.
 *
 * No locality identity, geography, topology, route classification, mission behavior, simulation
 * state or persistence fact is owned here. Locality-specific visual character may specialize
 * presentation around this contract without turning one locality's urban design into the global
 * template.
 */
export const LOCALITY_PRESENTATION_PROFILE_VERSION = 1

export type LocalityLabelRole =
  | 'district'
  | 'street'
  | 'landmark'
  | 'storefront'
  | 'interaction'
  | 'route'
  | 'address'
  | 'detail'

export interface LocalityScreenBox {
  left: number
  top: number
  right: number
  bottom: number
}

export interface LocalityLabelRule {
  levels: readonly SemanticMapLevel[]
  priority: number
  fixedScreenSize: boolean
  gap: number
}

export interface LocalityPresentationProfile {
  version: number
  labelRules: Readonly<Record<LocalityLabelRole, LocalityLabelRule>>
  minScreenCompensation: number
  maxScreenCompensation: number
}

export interface LocalityScreenLabelCandidate {
  id: string
  role: LocalityLabelRole
  box: LocalityScreenBox
  priority?: number
}

/**
 * Android detail budget is global presentation infrastructure, not a locality-size rule.
 * The numeric sector authority remains in playableCityScale; this profile only exposes it to
 * semantic-presentation consumers. Larger or denser localities gain more possible sectors, never
 * an unbounded resident/materialization budget.
 */
export const LOCALITY_ANDROID_PRESENTATION_BUDGET = Object.freeze({
  detailSectorSize: PLAYABLE_CITY_DETAIL_SECTOR_SIZE,
  maxResidentDetailSectors: PLAYABLE_CITY_DETAIL_SECTOR_LIMIT,
  minDetailZoom: PLAYABLE_CITY_DETAIL_MIN_ZOOM,
  maxMaterializedDetailSectorsPerFrame: 1,
})

const BASELINE_LABEL_RULES: Readonly<Record<LocalityLabelRole, LocalityLabelRule>> = Object.freeze({
  district: { levels: ['City', 'District'], priority: 90, fixedScreenSize: true, gap: 7 },
  street: { levels: ['District', 'Area', 'Hero'], priority: 70, fixedScreenSize: true, gap: 5 },
  landmark: { levels: ['District', 'Area', 'Hero'], priority: 110, fixedScreenSize: true, gap: 7 },
  storefront: { levels: ['Area', 'Hero'], priority: 82, fixedScreenSize: true, gap: 5 },
  interaction: { levels: ['Hero'], priority: 120, fixedScreenSize: true, gap: 7 },
  // `route` is a label attached to route information supplied by another authority. It neither
  // computes nor classifies route topology.
  route: { levels: ['Hero'], priority: 88, fixedScreenSize: true, gap: 5 },
  address: { levels: ['Hero'], priority: 52, fixedScreenSize: true, gap: 3 },
  detail: { levels: ['Hero'], priority: 45, fixedScreenSize: true, gap: 4 },
})

/** Reference calibration that any locality can consume without inheriting another locality's identity. */
export const LOCALITY_PRESENTATION_BASELINE: LocalityPresentationProfile = Object.freeze({
  version: LOCALITY_PRESENTATION_PROFILE_VERSION,
  labelRules: BASELINE_LABEL_RULES,
  minScreenCompensation: 0.4,
  maxScreenCompensation: 1024,
})

const inflate = (box: LocalityScreenBox, gap: number): LocalityScreenBox => ({
  left: box.left - gap,
  top: box.top - gap,
  right: box.right + gap,
  bottom: box.bottom + gap,
})

export const isLocalityLabelVisibleAtLevel = (
  profile: LocalityPresentationProfile,
  role: LocalityLabelRole,
  level: SemanticMapLevel,
): boolean => profile.labelRules[role].levels.includes(level)

/** Stable priority + collision selection for labels already projected into screen space. */
export const selectLocalityScreenLabels = (
  profile: LocalityPresentationProfile,
  candidates: readonly LocalityScreenLabelCandidate[],
  level: SemanticMapLevel,
  viewport: MapViewport,
  reserved: readonly LocalityScreenBox[] = [],
): readonly string[] => {
  const occupied: LocalityScreenBox[] = [...reserved]
  const ranked = candidates
    .map((candidate, index) => ({ candidate, index }))
    .filter(({ candidate }) => isLocalityLabelVisibleAtLevel(profile, candidate.role, level))
    .sort((a, b) =>
      (b.candidate.priority ?? profile.labelRules[b.candidate.role].priority) -
        (a.candidate.priority ?? profile.labelRules[a.candidate.role].priority) ||
      a.index - b.index,
    )

  const accepted: string[] = []
  for (const { candidate } of ranked) {
    const box = inflate(candidate.box, profile.labelRules[candidate.role].gap)
    if (!reserveLabel(occupied, box, viewport)) continue
    accepted.push(candidate.id)
  }
  return accepted
}

/** Keeps fixed-screen labels readable while preserving caller-owned semantic zoom/camera policy. */
export const localityLabelScaleCompensation = (
  profile: LocalityPresentationProfile,
  role: LocalityLabelRole,
  zoom: number,
): number => {
  if (!profile.labelRules[role].fixedScreenSize) return 1
  const safeZoom = Number.isFinite(zoom) && zoom > 0 ? zoom : 1
  return Math.max(
    profile.minScreenCompensation,
    Math.min(profile.maxScreenCompensation, 1 / Math.max(0.001, safeZoom)),
  )
}
