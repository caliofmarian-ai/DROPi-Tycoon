import { describe, expect, it } from 'vitest'
import {
  canBrowseLocalMarketplace,
  canExposeDeliveryClient,
  projectSmartphoneProgression,
} from '../src/ui/smartphoneProgressionPolicy'

const base = {
  ownsSmartphone: false,
  registeredStarterEntity: false,
  operationalCompanyCapability: false,
  humanCompanyMembershipActive: false,
  regionalNetworkCapability: false,
  globalNetworkCapability: false,
}

describe('earned smartphone progression', () => {
  it('starts with no phone, no personal GPS, no clients and no marketplace', () => {
    expect(projectSmartphoneProgression(base)).toEqual({
      stage: 'NO_PHONE',
      phoneAvailable: false,
      personalGpsAvailable: false,
      mapScope: 'None',
      visiblePublicEconomicPlaces: false,
      visibleDeliveryClients: false,
      visibleMarketplace: false,
      partnerDiscoveryAvailable: false,
      surfaces: [],
    })
  })

  it('basic purchased phone exposes nearby public businesses but not delivery clients or marketplace', () => {
    const phone = projectSmartphoneProgression({ ...base, ownsSmartphone: true })
    expect(phone.stage).toBe('BASIC_PERSONAL_PHONE')
    expect(phone.mapScope).toBe('Nearby')
    expect(phone.visiblePublicEconomicPlaces).toBe(true)
    expect(phone.visibleDeliveryClients).toBe(false)
    expect(phone.visibleMarketplace).toBe(false)
    expect(phone.surfaces).toEqual(['NearbyMap', 'PublicEconomicPlaces'])
  })

  it('registered starter entity opens local clients, wider locality map and local marketplace', () => {
    const phone = projectSmartphoneProgression({
      ...base,
      ownsSmartphone: true,
      registeredStarterEntity: true,
    })
    expect(phone.stage).toBe('REGISTERED_STARTER_ENTITY')
    expect(phone.mapScope).toBe('Locality')
    expect(phone.visibleDeliveryClients).toBe(true)
    expect(phone.visibleMarketplace).toBe(true)
    expect(phone.surfaces).toContain('CompanyStatus')
    expect(phone.surfaces).toContain('LocalMarketplace')
    expect(phone.partnerDiscoveryAvailable).toBe(false)
  })

  it('does not expose a business as a client just because its public location is visible', () => {
    const basicPhone = projectSmartphoneProgression({ ...base, ownsSmartphone: true })
    const evidence = {
      opportunityId: 'opportunity:factory:delivery',
      localityId: 'locality:braila',
      publicPlaceId: 'place:factory:1',
      legitimateDemandExists: true,
      companyEligible: true,
    }
    expect(canExposeDeliveryClient(basicPhone, evidence, 'locality:braila')).toBe(false)

    const businessPhone = projectSmartphoneProgression({
      ...base,
      ownsSmartphone: true,
      registeredStarterEntity: true,
    })
    expect(canExposeDeliveryClient(businessPhone, evidence, 'locality:braila')).toBe(true)
    expect(canExposeDeliveryClient(businessPhone, { ...evidence, legitimateDemandExists: false }, 'locality:braila')).toBe(false)
    expect(canExposeDeliveryClient(businessPhone, { ...evidence, companyEligible: false }, 'locality:braila')).toBe(false)
    expect(canExposeDeliveryClient(businessPhone, evidence, 'locality:dublin')).toBe(false)
  })

  it('marketplace browsing is local and never implies ownership or custody', () => {
    const phone = projectSmartphoneProgression({
      ...base,
      ownsSmartphone: true,
      registeredStarterEntity: true,
    })
    expect(canBrowseLocalMarketplace(phone, 'locality:braila', 'locality:braila')).toBe(true)
    expect(canBrowseLocalMarketplace(phone, 'locality:dublin', 'locality:braila')).toBe(false)
    expect(phone).not.toHaveProperty('ownsListing')
    expect(phone).not.toHaveProperty('cargoTransferred')
  })

  it('human-company membership unlocks partner/shared-company surfaces without jumping to global map', () => {
    const phone = projectSmartphoneProgression({
      ...base,
      ownsSmartphone: true,
      registeredStarterEntity: true,
      operationalCompanyCapability: true,
      humanCompanyMembershipActive: true,
    })
    expect(phone.stage).toBe('HUMAN_COMPANY')
    expect(phone.partnerDiscoveryAvailable).toBe(true)
    expect(phone.surfaces).toContain('SharedDispatch')
    expect(phone.mapScope).toBe('City')
    expect(phone.surfaces).not.toContain('GlobalNetworkMap')
  })

  it('world map appears only after global-network capability', () => {
    const regional = projectSmartphoneProgression({
      ...base,
      ownsSmartphone: true,
      registeredStarterEntity: true,
      operationalCompanyCapability: true,
      humanCompanyMembershipActive: true,
      regionalNetworkCapability: true,
    })
    expect(regional.stage).toBe('REGIONAL_NETWORK')
    expect(regional.mapScope).toBe('Region')

    const global = projectSmartphoneProgression({
      ...base,
      ownsSmartphone: true,
      registeredStarterEntity: true,
      operationalCompanyCapability: true,
      humanCompanyMembershipActive: true,
      regionalNetworkCapability: true,
      globalNetworkCapability: true,
    })
    expect(global.stage).toBe('GLOBAL_NETWORK')
    expect(global.mapScope).toBe('World')
    expect(global.surfaces).toContain('GlobalNetworkMap')
  })
})
