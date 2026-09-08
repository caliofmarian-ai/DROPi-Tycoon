export interface CountrySemanticSource {
  publisher: string
  title: string
  url: string
  publishedOn?: string
  accessedOn: string
  note: string
}

export interface CountrySemanticPlaceRole {
  locality: string
  role: string
  label: string
  note?: string
}

export interface CountrySemanticTerritoryStatus {
  classification: string
  label: string
  finalStatusResolved: boolean
  note?: string
}

export interface CountrySemanticEntry {
  issue: number
  renderedName: string
  statusLabel: string
  statusSummary: string
  territoryStatus?: CountrySemanticTerritoryStatus
  coverageNote?: string
  placeRoles: CountrySemanticPlaceRole[]
  sourceRefs: string[]
}

export interface CountrySemanticCatalog {
  version: string
  reviewedOn: string
  purpose: string
  governance: {
    geographyDoesNotAssertSovereignty: boolean
    projectGeometryIdsAreNonISO: boolean
    statusTextMustBeSourceGoverned: boolean
    localityCoordinatesRemainSourceBacked: boolean
  }
  sources: Record<string, CountrySemanticSource>
  entries: Record<string, CountrySemanticEntry>
}

export const semanticEntryForCountry = (
  catalog: CountrySemanticCatalog | null | undefined,
  countryId: string,
): CountrySemanticEntry | null => catalog?.entries?.[countryId] ?? null

export const semanticPlaceRoleForLocality = (
  entry: CountrySemanticEntry | null | undefined,
  localityName: string,
): CountrySemanticPlaceRole | null => entry?.placeRoles.find(role => role.locality === localityName) ?? null

export const validateSemanticEntrySources = (
  catalog: CountrySemanticCatalog,
  entry: CountrySemanticEntry,
): boolean => entry.sourceRefs.length > 0 && entry.sourceRefs.every(sourceRef => Boolean(catalog.sources[sourceRef]))
