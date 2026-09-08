import type { CapabilityDefinition, WorkActivityDefinition } from './capabilityModel'

export const CAPABILITY_POLICY_VERSION = 1 as const

export interface CapabilityPolicy {
  version: typeof CAPABILITY_POLICY_VERSION
  policyId: string
  starterWalkingWorkCapacityUnits: number
  bicycleWorkCapacityUnits: number
}

/** Prototype balancing data only; capability semantics are independent from these values. */
export const PROTOTYPE_CAPABILITY_POLICY: Readonly<CapabilityPolicy> = Object.freeze({
  version: CAPABILITY_POLICY_VERSION,
  policyId: 'phase1-personal-capability-v1',
  starterWalkingWorkCapacityUnits: 1,
  bicycleWorkCapacityUnits: 2,
})

export const CAPABILITY_DEFINITIONS: readonly CapabilityDefinition[] = [
  {
    id: 'DeliveryAppLiteracy',
    label: 'Delivery App Literacy',
    family: 'Foundation',
    acquisitionRequirements: [],
  },
  {
    id: 'WalkingCourierFundamentals',
    label: 'Walking Courier Fundamentals',
    family: 'Foundation',
    acquisitionRequirements: [
      { kind: 'capability', capabilityId: 'DeliveryAppLiteracy', label: 'Delivery App Literacy' },
    ],
  },
  {
    id: 'BicycleOperation',
    label: 'Bicycle Operation',
    family: 'Bicycle',
    acquisitionRequirements: [
      { kind: 'capability', capabilityId: 'WalkingCourierFundamentals', label: 'Walking Courier Fundamentals' },
      { kind: 'theory', evidenceId: 'bicycle-road-theory', label: 'Bicycle road theory' },
      { kind: 'practicalTraining', evidenceId: 'bicycle-handling-practical', label: 'Bicycle handling practice' },
    ],
  },
  {
    id: 'BicycleMaintenance',
    label: 'Bicycle Maintenance',
    family: 'Technical',
    acquisitionRequirements: [
      { kind: 'capability', capabilityId: 'BicycleOperation', label: 'Bicycle Operation' },
      { kind: 'theory', evidenceId: 'bicycle-maintenance-theory', label: 'Basic bicycle maintenance theory' },
      { kind: 'practicalTraining', evidenceId: 'bicycle-maintenance-practical', label: 'Basic bicycle maintenance practice' },
    ],
  },
  {
    id: 'ElectricScooterOperation',
    label: 'Electric Scooter Operation',
    family: 'PoweredTwoWheel',
    acquisitionRequirements: [
      { kind: 'capability', capabilityId: 'WalkingCourierFundamentals', label: 'Walking Courier Fundamentals' },
      { kind: 'theory', evidenceId: 'powered-two-wheel-theory', label: 'Powered two-wheel theory' },
      { kind: 'practicalTraining', evidenceId: 'powered-two-wheel-practical', label: 'Powered two-wheel practice' },
      { kind: 'qualification', evidenceId: 'powered-two-wheel-qualification', label: 'Powered two-wheel qualification' },
    ],
  },
  {
    id: 'MotorcycleOperation',
    label: 'Motorcycle Operation',
    family: 'PoweredTwoWheel',
    acquisitionRequirements: [
      { kind: 'capability', capabilityId: 'ElectricScooterOperation', label: 'Electric Scooter Operation' },
      { kind: 'practicalTraining', evidenceId: 'motorcycle-practical', label: 'Motorcycle handling practice' },
      { kind: 'qualification', evidenceId: 'motorcycle-qualification', label: 'Motorcycle qualification' },
    ],
  },
  {
    id: 'CarOperation',
    label: 'Car Operation',
    family: 'RoadVehicle',
    acquisitionRequirements: [
      { kind: 'capability', capabilityId: 'WalkingCourierFundamentals', label: 'Walking Courier Fundamentals' },
      { kind: 'theory', evidenceId: 'road-vehicle-theory', label: 'Road vehicle theory' },
      { kind: 'practicalTraining', evidenceId: 'car-operation-practical', label: 'Car operation practice' },
      { kind: 'qualification', evidenceId: 'car-operation-qualification', label: 'Car operation qualification' },
    ],
  },
  {
    id: 'DeliveryVanOperation',
    label: 'Delivery Van Operation',
    family: 'RoadVehicle',
    acquisitionRequirements: [
      { kind: 'capability', capabilityId: 'CarOperation', label: 'Car Operation' },
      { kind: 'practicalTraining', evidenceId: 'van-cargo-practical', label: 'Van cargo-handling practice' },
      { kind: 'supervisedExperience', evidenceId: 'road-delivery-supervised', label: 'Supervised road-delivery experience', minimumUnits: 1 },
      { kind: 'qualification', evidenceId: 'delivery-van-qualification', label: 'Delivery van qualification' },
    ],
  },
  {
    id: 'DispatchOperations',
    label: 'Dispatch Operations',
    family: 'Operations',
    acquisitionRequirements: [
      { kind: 'capability', capabilityId: 'DeliveryAppLiteracy', label: 'Delivery App Literacy' },
      { kind: 'theory', evidenceId: 'dispatch-route-theory', label: 'Dispatch and route theory' },
      { kind: 'practicalTraining', evidenceId: 'dispatch-route-practical', label: 'Dispatch and route practice' },
    ],
  },
  {
    id: 'WarehouseOperations',
    label: 'Warehouse Operations',
    family: 'Operations',
    acquisitionRequirements: [
      { kind: 'capability', capabilityId: 'WalkingCourierFundamentals', label: 'Walking Courier Fundamentals' },
      { kind: 'practicalTraining', evidenceId: 'warehouse-sorting-practical', label: 'Warehouse sorting practice' },
      { kind: 'qualification', evidenceId: 'warehouse-operations-qualification', label: 'Warehouse operations qualification' },
    ],
  },
  {
    id: 'VehicleMaintenance',
    label: 'Vehicle Maintenance',
    family: 'Technical',
    acquisitionRequirements: [
      { kind: 'capability', capabilityId: 'BicycleMaintenance', label: 'Bicycle Maintenance' },
      { kind: 'practicalTraining', evidenceId: 'technical-maintenance-practical', label: 'Technical maintenance practice' },
      { kind: 'infrastructure', infrastructureId: 'maintenance-workshop', label: 'Maintenance workshop' },
      { kind: 'qualification', evidenceId: 'technical-maintenance-qualification', label: 'Technical maintenance qualification' },
    ],
  },
  {
    id: 'Entrepreneurship',
    label: 'Entrepreneurship',
    family: 'Business',
    acquisitionRequirements: [
      { kind: 'capability', capabilityId: 'DeliveryAppLiteracy', label: 'Delivery App Literacy' },
      { kind: 'theory', evidenceId: 'business-foundations-theory', label: 'Business foundations theory' },
    ],
  },
] as const

export const createWorkActivityDefinitions = (
  policy: CapabilityPolicy = PROTOTYPE_CAPABILITY_POLICY,
): readonly WorkActivityDefinition[] => [
  {
    id: 'walking-light-document-delivery',
    label: 'Walking / light-document delivery',
    requirements: [
      { kind: 'capability', capabilityId: 'DeliveryAppLiteracy', label: 'Delivery App Literacy' },
      { kind: 'capability', capabilityId: 'WalkingCourierFundamentals', label: 'Walking Courier Fundamentals' },
      { kind: 'employment', label: 'Active delivery employment' },
      { kind: 'employerPermission', permissionId: 'light-delivery', label: 'Light delivery authorization' },
      { kind: 'equipment', equipmentId: 'smartphone', label: 'Smartphone' },
      { kind: 'cargoCapability', cargoCapabilityId: 'light-document', label: 'Light-document handling' },
      { kind: 'workCapacity', minimumUnits: policy.starterWalkingWorkCapacityUnits, label: 'Walking delivery Work Capacity' },
      { kind: 'shiftAvailability', label: 'Current shift availability' },
    ],
  },
  {
    id: 'bicycle-light-parcel-delivery',
    label: 'Bicycle / light-parcel delivery',
    requirements: [
      { kind: 'capability', capabilityId: 'BicycleOperation', label: 'Bicycle Operation' },
      { kind: 'theory', evidenceId: 'bicycle-road-theory', label: 'Bicycle road theory' },
      { kind: 'practicalTraining', evidenceId: 'bicycle-handling-practical', label: 'Bicycle handling practice' },
      { kind: 'employment', label: 'Active delivery employment' },
      { kind: 'employerPermission', permissionId: 'bicycle-light-delivery', label: 'Bicycle delivery authorization' },
      { kind: 'equipment', equipmentId: 'basic-bicycle', label: 'Basic bicycle' },
      { kind: 'vehicleClass', vehicleClass: 'Bicycle', label: 'Bicycle' },
      { kind: 'cargoCapability', cargoCapabilityId: 'light-parcel', label: 'Light-parcel handling' },
      { kind: 'workCapacity', minimumUnits: policy.bicycleWorkCapacityUnits, label: 'Bicycle delivery Work Capacity' },
      { kind: 'shiftAvailability', label: 'Current shift availability' },
    ],
  },
]
