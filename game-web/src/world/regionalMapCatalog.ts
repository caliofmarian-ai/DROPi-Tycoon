import type { CountryLocalityNode } from './countryLayerNodes'
export interface RegionalUnit {
  admin1Code: string
  regionName?: string
  regionSourceName: string
  regionSourceRef: string
  representativeLocality: {
    localityId: string; sourceRef: string; name: string; asciiName: string
    latitude: number; longitude: number; populationSourceValue: number; featureCode: string
  }
}
export interface RegionalCatalog {
  country: { geometryId: string; renderedName: string }
  continent: string
  administrativeModel: { nativeTerm?: string; nativeTermSingular?: string }
  units: RegionalUnit[]
}
export interface RegionalCatalogIndex { countryId: string; url: string }
declare const __REGIONAL_CATALOGS__: RegionalCatalogIndex[]
export const regionalCatalogIndex: RegionalCatalogIndex[] = typeof __REGIONAL_CATALOGS__ === 'undefined' ? [] : __REGIONAL_CATALOGS__

export interface MapLocality extends Omit<CountryLocalityNode, 'sector'> { sector?: CountryLocalityNode['sector']; localityId?: string; region?: RegionalUnit }
const normalizedName = (name: string): string => name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '')

/** Preserve political roles and source coordinates; replace only reconciled visual duplicates. */
export const regionalMapLocalities = (anchors: CountryLocalityNode[], catalog?: RegionalCatalog | null): MapLocality[] => {
  if (!catalog) return anchors
  const used = new Set<CountryLocalityNode>()
  const regional = catalog.units.map(region => {
    const place = region.representativeLocality
    const anchor = anchors.find(a => {
      const sameName = normalizedName(a.name) === normalizedName(place.name) || normalizedName(a.name) === normalizedName(place.asciiName)
      // A source first-order capital can match a source PPLC only inside the same country.
      const sameCapital = a.role === 'capital' && place.featureCode === 'PPLC'
      return !used.has(a) && (sameName || sameCapital) && Math.hypot(a.longitude - place.longitude, a.latitude - place.latitude) < 0.4
    })
    if (anchor) used.add(anchor)
    return { ...anchor, name: anchor?.name ?? place.name, longitude: place.longitude, latitude: place.latitude,
      role: anchor?.role ?? 'urban', sector: anchor?.sector,
      populationReference: place.populationSourceValue, admin1: region.regionName ?? region.regionSourceName,
      sourceFeatureClass: place.featureCode, sourceRef: place.sourceRef, localityId: place.localityId, region } as MapLocality
  })
  return [...regional, ...anchors.filter(a => !used.has(a))]
}
