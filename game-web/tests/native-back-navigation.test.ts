import { describe, expect, it } from 'vitest'
import { resolveNativeBackTarget } from '../src/platform/nativeBackNavigation'

describe('native Android back navigation', () => {
  it('returns from Company Management to the Game World', () => {
    expect(resolveNativeBackTarget('CompanyManagement')).toBe('GameWorld')
  })

  it.each(['EmployeeManagement', 'FinancialReport', 'CustomerReviews'])(
    'returns from %s to Company Management',
    (sceneKey) => {
      expect(resolveNativeBackTarget(sceneKey)).toBe('CompanyManagement')
    },
  )

  it('returns from the Game World to the Main Menu', () => {
    expect(resolveNativeBackTarget('GameWorld')).toBe('MainMenu')
  })

  it('does not invent a target for the Main Menu or an unknown scene', () => {
    expect(resolveNativeBackTarget('MainMenu')).toBeNull()
    expect(resolveNativeBackTarget('UnknownScene')).toBeNull()
  })
})
