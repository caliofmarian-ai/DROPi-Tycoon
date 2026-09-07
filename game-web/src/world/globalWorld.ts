export const WORLD_MAP_LAYERS = [
  'Global',
  'Country',
  'AdministrativeRegion',
  'RepresentativeNode',
  'DetailedLocal',
] as const
export type WorldMapLayer = (typeof WORLD_MAP_LAYERS)[number]

export interface GeoPoint {
  latitude: number
  longitude: number
}

export const REPRESENTATIVE_LOCALITY_ROLES = [
  'Capital',
  'UrbanNorth',
  'UrbanEast',
  'UrbanSouth',
  'UrbanWest',
  'RuralNorthEast',
  'RuralSouthEast',
  'RuralSouthWest',
  'RuralNorthWest',
] as const
export type RepresentativeLocalityRole = (typeof REPRESENTATIVE_LOCALITY_ROLES)[number]

export const LOCALITY_KINDS = ['Capital', 'Urban', 'RuralSmall'] as const
export type LocalityKind = (typeof LOCALITY_KINDS)[number]

export const EXTERNAL_ECONOMIC_NODE_KINDS = [
  'Farm',
  'LivestockFarm',
  'Forestry',
  'Mine',
  'Quarry',
  'Steelworks',
  'PaperMill',
  'ChemicalPlant',
  'FertilizerPlant',
  'Refinery',
  'PowerPlant',
  'FoodProcessor',
  'ConstructionMaterialsPlant',
  'MachineryPlant',
  'Warehouse',
  'DistributionCenter',
  'IndustrialPort',
  'RailFreightTerminal',
  'AirportCargoTerminal',
] as const
export type ExternalEconomicNodeKind = (typeof EXTERNAL_ECONOMIC_NODE_KINDS)[number]

export const STRATEGIC_TRANSPORT_MODES = [
  'Road',
  'Rail',
  'Air',
  'River',
  'Sea',
  'Drone',
  'LastMile',
] as const
export type StrategicTransportMode = (typeof STRATEGIC_TRANSPORT_MODES)[number]

export const PRODUCT_GROUPS = [
  'Food',
  'Agriculture',
  'Chemicals',
  'Fertilizer',
  'Steel',
  'PaperPackaging',
  'ConstructionMaterials',
  'Energy',
  'Fuel',
  'Machinery',
  'ConsumerGoods',
  'Medical',
  'Technology',
  'RawMaterials',
] as const
export type ProductGroup = (typeof PRODUCT_GROUPS)[number]

export interface EconomicSummary {
  population: number
  populationTrend: 'Declining' | 'Stable' | 'Growing'
  demandIndex: number
  supplyIndex: number
  employmentDemandIndex: number
  specialistAvailabilityIndex: number
  infrastructureIndex: number
}

export interface TransportSummary {
  modes: StrategicTransportMode[]
  capacityIndex: number
  congestionIndex: number
  reliabilityIndex: number
}

export interface RepresentativeLocalityNode {
  nodeId: string
  name: string
  role: RepresentativeLocalityRole
  kind: LocalityKind
  position: GeoPoint
  administrativeRegionId?: string
  economy: EconomicSummary
  transport: TransportSummary
}

export interface ExternalEconomicNode {
  nodeId: string
  name: string
  kind: ExternalEconomicNodeKind
  position: GeoPoint
  administrativeRegionId?: string
  ownerCompanyId?: string
  inputGroups: ProductGroup[]
  outputGroups: ProductGroup[]
  capacityIndex: number
  inventoryIndex: number
  transport: TransportSummary
}

export interface AdministrativeRegionState {
  regionId: string
  name: string
  divisionLabel: string
  position: GeoPoint
  economy: EconomicSummary
  transport: TransportSummary
}

export interface CountryWorldState {
  countryId: string
  isoCode: string
  name: string
  position: GeoPoint
  administrativeDivisionLabel: string
  regions: AdministrativeRegionState[]
  representativeLocalities: RepresentativeLocalityNode[]
  externalEconomicNodes: ExternalEconomicNode[]
  economy: EconomicSummary
  transport: TransportSummary
}

export interface WorldClockState {
  worldInstanceId: string
  year: number
  season: 'Spring' | 'Summer' | 'Autumn' | 'Winter'
  dayOfSeason: number
  hour: number
  minute: number
}

export interface GlobalWorldState {
  worldInstanceId: string
  baselineVersion: string
  mapDatasetVersion: string
  clock: WorldClockState
  countries: CountryWorldState[]
}

export interface ProductionRecipe {
  recipeId: string
  inputGroups: ProductGroup[]
  outputGroups: ProductGroup[]
  minimumSpecialistIndex: number
  minimumInfrastructureIndex: number
  productionCycles: number
}

export const MAX_REPRESENTATIVE_LOCALITIES_PER_COUNTRY = 9
export const MAX_URBAN_DELIVERY_COMPETITORS = 5
export const MAX_RURAL_DELIVERY_COMPETITORS = 2

export const localityCompetitionCap = (kind: LocalityKind): number =>
  kind === 'RuralSmall' ? MAX_RURAL_DELIVERY_COMPETITORS : MAX_URBAN_DELIVERY_COMPETITORS

export const isGeoPointValid = ({ latitude, longitude }: GeoPoint): boolean =>
  Number.isFinite(latitude)
  && Number.isFinite(longitude)
  && latitude >= -90
  && latitude <= 90
  && longitude >= -180
  && longitude <= 180

export interface CountryNodePolicyResult {
  valid: boolean
  reasons: string[]
}

export const validateCountryNodePolicy = (country: CountryWorldState): CountryNodePolicyResult => {
  const reasons: string[] = []
  const nodes = country.representativeLocalities

  if (nodes.length > MAX_REPRESENTATIVE_LOCALITIES_PER_COUNTRY) {
    reasons.push(`country has ${nodes.length} representative localities; maximum is ${MAX_REPRESENTATIVE_LOCALITIES_PER_COUNTRY}`)
  }

  const roles = new Set<RepresentativeLocalityRole>()
  for (const node of nodes) {
    if (roles.has(node.role)) reasons.push(`duplicate representative locality role: ${node.role}`)
    roles.add(node.role)
    if (!isGeoPointValid(node.position)) reasons.push(`invalid geo position for locality ${node.nodeId}`)
  }

  const capitals = nodes.filter(node => node.role === 'Capital')
  if (capitals.length !== 1) reasons.push(`country must contain exactly one capital node; found ${capitals.length}`)
  if (capitals[0] && capitals[0].kind !== 'Capital') reasons.push('Capital role must use Capital locality kind')

  for (const node of country.externalEconomicNodes) {
    if (!isGeoPointValid(node.position)) reasons.push(`invalid geo position for economic node ${node.nodeId}`)
  }

  if (!isGeoPointValid(country.position)) reasons.push(`invalid geo position for country ${country.countryId}`)

  return { valid: reasons.length === 0, reasons }
}

export const selectCountryById = (
  world: GlobalWorldState,
  countryId: string,
): CountryWorldState | undefined => world.countries.find(country => country.countryId === countryId)

export const timeOfDay = (clock: WorldClockState): 'Night' | 'Morning' | 'Day' | 'Evening' => {
  if (clock.hour < 6 || clock.hour >= 22) return 'Night'
  if (clock.hour < 11) return 'Morning'
  if (clock.hour < 18) return 'Day'
  return 'Evening'
}
