export const DROPi_NATIVE_BACK_EVENT = 'dropi:native-back'

const NATIVE_BACK_TARGETS: Readonly<Record<string, string>> = {
  EmployeeManagement: 'CompanyManagement',
  FinancialReport: 'CompanyManagement',
  CustomerReviews: 'CompanyManagement',
  VehicleFleet: 'CompanyManagement',
  CompanyManagement: 'GameWorld',
  GameWorld: 'MainMenu',
}

export const resolveNativeBackTarget = (sceneKey: string): string | null =>
  NATIVE_BACK_TARGETS[sceneKey] ?? null
