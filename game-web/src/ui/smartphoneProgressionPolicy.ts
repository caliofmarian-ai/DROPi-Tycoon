export type SmartphoneProgressionStage =
  | 'NO_PHONE'
  | 'BASIC_PERSONAL_PHONE'
  | 'REGISTERED_STARTER_ENTITY'
  | 'OPERATIONAL_COMPANY'
  | 'HUMAN_COMPANY'
  | 'REGIONAL_NETWORK'
  | 'GLOBAL_NETWORK'

export type SmartphoneMapScope = 'None' | 'Nearby' | 'Locality' | 'City' | 'Region' | 'World'

export type SmartphoneSurfaceId =
  | 'NearbyMap'
  | 'PublicEconomicPlaces'
  | 'DeliveryClients'
  | 'BusinessMessages'
  | 'CompanyStatus'
  | 'LocalMarketplace'
  | 'Training'
  | 'FleetStatus'
  | 'PartnerDiscovery'
  | 'SharedDispatch'
  | 'RegionalMarketplace'
  | 'GlobalNetworkMap'

export interface SmartphoneProgressionEvidence {
  ownsSmartphone: boolean
  registeredStarterEntity: boolean
  operationalCompanyCapability: boolean
  humanCompanyMembershipActive: boolean
  regionalNetworkCapability: boolean
  globalNetworkCapability: boolean
}

export interface SmartphoneProgressionProjection {
  stage: SmartphoneProgressionStage
  phoneAvailable: boolean
  personalGpsAvailable: boolean
  mapScope: SmartphoneMapScope
  visiblePublicEconomicPlaces: boolean
  visibleDeliveryClients: boolean
  visibleMarketplace: boolean
  partnerDiscoveryAvailable: boolean
  surfaces: readonly SmartphoneSurfaceId[]
}

export interface SmartphoneBusinessOpportunityEvidence {
  opportunityId: string
  localityId: string
  publicPlaceId: string
  legitimateDemandExists: boolean
  companyEligible: boolean
}

const validId = (value: string): boolean => value.trim().length > 0 && value.length <= 180

export const resolveSmartphoneProgressionStage = (
  evidence: SmartphoneProgressionEvidence,
): SmartphoneProgressionStage => {
  if (!evidence.ownsSmartphone) return 'NO_PHONE'
  if (!evidence.registeredStarterEntity) return 'BASIC_PERSONAL_PHONE'
  if (!evidence.operationalCompanyCapability) return 'REGISTERED_STARTER_ENTITY'
  if (!evidence.humanCompanyMembershipActive) return 'OPERATIONAL_COMPANY'
  if (!evidence.regionalNetworkCapability) return 'HUMAN_COMPANY'
  if (!evidence.globalNetworkCapability) return 'REGIONAL_NETWORK'
  return 'GLOBAL_NETWORK'
}

const projectionForStage = (stage: SmartphoneProgressionStage): SmartphoneProgressionProjection => {
  switch (stage) {
    case 'NO_PHONE':
      return {
        stage,
        phoneAvailable: false,
        personalGpsAvailable: false,
        mapScope: 'None',
        visiblePublicEconomicPlaces: false,
        visibleDeliveryClients: false,
        visibleMarketplace: false,
        partnerDiscoveryAvailable: false,
        surfaces: [],
      }
    case 'BASIC_PERSONAL_PHONE':
      return {
        stage,
        phoneAvailable: true,
        personalGpsAvailable: true,
        mapScope: 'Nearby',
        visiblePublicEconomicPlaces: true,
        visibleDeliveryClients: false,
        visibleMarketplace: false,
        partnerDiscoveryAvailable: false,
        surfaces: ['NearbyMap', 'PublicEconomicPlaces'],
      }
    case 'REGISTERED_STARTER_ENTITY':
      return {
        stage,
        phoneAvailable: true,
        personalGpsAvailable: true,
        mapScope: 'Locality',
        visiblePublicEconomicPlaces: true,
        visibleDeliveryClients: true,
        visibleMarketplace: true,
        partnerDiscoveryAvailable: false,
        surfaces: [
          'NearbyMap',
          'PublicEconomicPlaces',
          'DeliveryClients',
          'BusinessMessages',
          'CompanyStatus',
          'LocalMarketplace',
        ],
      }
    case 'OPERATIONAL_COMPANY':
      return {
        stage,
        phoneAvailable: true,
        personalGpsAvailable: true,
        mapScope: 'City',
        visiblePublicEconomicPlaces: true,
        visibleDeliveryClients: true,
        visibleMarketplace: true,
        partnerDiscoveryAvailable: false,
        surfaces: [
          'NearbyMap',
          'PublicEconomicPlaces',
          'DeliveryClients',
          'BusinessMessages',
          'CompanyStatus',
          'LocalMarketplace',
          'Training',
          'FleetStatus',
        ],
      }
    case 'HUMAN_COMPANY':
      return {
        stage,
        phoneAvailable: true,
        personalGpsAvailable: true,
        mapScope: 'City',
        visiblePublicEconomicPlaces: true,
        visibleDeliveryClients: true,
        visibleMarketplace: true,
        partnerDiscoveryAvailable: true,
        surfaces: [
          'NearbyMap',
          'PublicEconomicPlaces',
          'DeliveryClients',
          'BusinessMessages',
          'CompanyStatus',
          'LocalMarketplace',
          'Training',
          'FleetStatus',
          'PartnerDiscovery',
          'SharedDispatch',
        ],
      }
    case 'REGIONAL_NETWORK':
      return {
        stage,
        phoneAvailable: true,
        personalGpsAvailable: true,
        mapScope: 'Region',
        visiblePublicEconomicPlaces: true,
        visibleDeliveryClients: true,
        visibleMarketplace: true,
        partnerDiscoveryAvailable: true,
        surfaces: [
          'NearbyMap',
          'PublicEconomicPlaces',
          'DeliveryClients',
          'BusinessMessages',
          'CompanyStatus',
          'LocalMarketplace',
          'Training',
          'FleetStatus',
          'PartnerDiscovery',
          'SharedDispatch',
          'RegionalMarketplace',
        ],
      }
    case 'GLOBAL_NETWORK':
      return {
        stage,
        phoneAvailable: true,
        personalGpsAvailable: true,
        mapScope: 'World',
        visiblePublicEconomicPlaces: true,
        visibleDeliveryClients: true,
        visibleMarketplace: true,
        partnerDiscoveryAvailable: true,
        surfaces: [
          'NearbyMap',
          'PublicEconomicPlaces',
          'DeliveryClients',
          'BusinessMessages',
          'CompanyStatus',
          'LocalMarketplace',
          'Training',
          'FleetStatus',
          'PartnerDiscovery',
          'SharedDispatch',
          'RegionalMarketplace',
          'GlobalNetworkMap',
        ],
      }
  }
}

export const projectSmartphoneProgression = (
  evidence: SmartphoneProgressionEvidence,
): SmartphoneProgressionProjection => projectionForStage(resolveSmartphoneProgressionStage(evidence))

/**
 * A basic phone may reveal that a public business/place exists. A delivery-client marker is
 * business intelligence and only appears when the player has a registered entity AND the
 * authoritative demand/eligibility evidence says the opportunity is real.
 */
export const canExposeDeliveryClient = (
  phone: SmartphoneProgressionProjection,
  evidence: SmartphoneBusinessOpportunityEvidence,
  currentLocalityId: string,
): boolean => phone.visibleDeliveryClients &&
  validId(currentLocalityId) &&
  validId(evidence.opportunityId) &&
  validId(evidence.localityId) &&
  validId(evidence.publicPlaceId) &&
  evidence.localityId === currentLocalityId &&
  evidence.legitimateDemandExists &&
  evidence.companyEligible

/**
 * Marketplace visibility means browsing is allowed. It does not mean purchase settlement,
 * ownership transfer or physical custody has happened.
 */
export const canBrowseLocalMarketplace = (
  phone: SmartphoneProgressionProjection,
  listingLocalityId: string,
  currentLocalityId: string,
): boolean => phone.visibleMarketplace &&
  validId(listingLocalityId) &&
  validId(currentLocalityId) &&
  listingLocalityId === currentLocalityId
