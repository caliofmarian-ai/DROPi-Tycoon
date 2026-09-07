import type { DividendPolicy } from '../types/dividend'

/**
 * Replaceable prototype balancing policy. Dividend history records the policy
 * version used; changing this configuration must not rewrite prior distributions.
 */
export const DIVIDEND_POLICY_V1: DividendPolicy = {
  version: 'dividend-v1',
  payoutBasisPoints: 2_500,
  minimumCompanyReserve: 100,
}
