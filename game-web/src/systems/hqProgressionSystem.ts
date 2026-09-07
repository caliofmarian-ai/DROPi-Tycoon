import { BALANCING } from '../config/balancing'
import type { CompanyState, HQDepartmentId, HQProgressionState } from '../types/game'

export interface HQDepartmentDefinition {
  id: HQDepartmentId
  name: string
  minCompanyLevel: number
  constructionCost: number
  initiallyConstructed: boolean
}

export const HQ_DEPARTMENT_DEFINITIONS: Readonly<Record<HQDepartmentId, HQDepartmentDefinition>> = {
  Core: {
    id: 'Core',
    name: 'Core Headquarters',
    minCompanyLevel: 1,
    constructionCost: 0,
    initiallyConstructed: true,
  },
  Maintenance: {
    id: 'Maintenance',
    name: 'Maintenance Wing',
    minCompanyLevel: BALANCING.HQ_MAINTENANCE_WING_MIN_LEVEL,
    constructionCost: BALANCING.HQ_MAINTENANCE_WING_CONSTRUCTION_COST,
    initiallyConstructed: false,
  },
}

export interface HQConstructionStatus {
  department: HQDepartmentDefinition
  constructed: boolean
  canConstruct: boolean
  missingCompanyLevels: number
  missingMoney: number
}

const canonicalDepartments = (progression: HQProgressionState): HQDepartmentId[] => {
  const unique = new Set<HQDepartmentId>(['Core'])
  progression.constructedDepartments.forEach((departmentId) => {
    if (Object.prototype.hasOwnProperty.call(HQ_DEPARTMENT_DEFINITIONS, departmentId)) unique.add(departmentId)
  })
  return [...unique]
}

export const normalizeHQProgression = (progression?: HQProgressionState): HQProgressionState => ({
  constructedDepartments: canonicalDepartments(progression ?? { constructedDepartments: ['Core'] }),
})

export const isHQDepartmentConstructed = (
  company: Pick<CompanyState, 'hq'>,
  departmentId: HQDepartmentId,
): boolean => normalizeHQProgression(company.hq).constructedDepartments.includes(departmentId)

export const getHQConstructionStatus = (
  company: CompanyState,
  departmentId: HQDepartmentId,
): HQConstructionStatus => {
  const department = HQ_DEPARTMENT_DEFINITIONS[departmentId]
  const constructed = isHQDepartmentConstructed(company, departmentId)
  const missingCompanyLevels = Math.max(0, department.minCompanyLevel - company.level)
  const missingMoney = Math.max(0, department.constructionCost - company.money)
  return {
    department,
    constructed,
    canConstruct: !constructed && missingCompanyLevels === 0 && missingMoney === 0,
    missingCompanyLevels,
    missingMoney,
  }
}

export type ConstructHQDepartmentResult =
  | { constructed: true; company: CompanyState; message: string }
  | { constructed: false; company: CompanyState; message: string }

export const constructHQDepartment = (
  company: CompanyState,
  departmentId: HQDepartmentId,
): ConstructHQDepartmentResult => {
  const status = getHQConstructionStatus(company, departmentId)
  if (status.constructed) {
    return { constructed: false, company, message: `${status.department.name} is already constructed.` }
  }
  if (status.missingCompanyLevels > 0) {
    return {
      constructed: false,
      company,
      message: `${status.department.name} requires Company Level ${status.department.minCompanyLevel}.`,
    }
  }
  if (status.missingMoney > 0) {
    return {
      constructed: false,
      company,
      message: `${status.department.name} needs $${status.missingMoney} more Company Money.`,
    }
  }

  const hq = normalizeHQProgression(company.hq)
  return {
    constructed: true,
    company: {
      ...company,
      money: company.money - status.department.constructionCost,
      hq: {
        constructedDepartments: [...hq.constructedDepartments, departmentId],
      },
    },
    message: `${status.department.name} constructed. Workshop foundation is now operational.`,
  }
}
