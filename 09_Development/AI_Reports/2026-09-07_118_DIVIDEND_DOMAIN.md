# AI Implementation Report 118 — End-of-Season Dividend Domain

Date: 2026-09-07
Issue: #386
Pull Request: #387
Branch: `openai/issue-386-dividend-domain`
Scope: non-visible economy/domain foundation

## Objective

Create a deterministic end-of-season dividend domain where shareholder Personal Money is funded by actual issuing-company economic capacity instead of creating money from nothing.

## Implemented

- Added `02_Economy/DIVIDENDS.md` as the canonical dividend specialization.
- Added versioned `DIVIDEND_POLICY_V1` with replaceable prototype balancing values:
  - 25% of positive season net profit as the profit-based payout ceiling;
  - 100 Company Money units as protected minimum reserve.
- Added deterministic distributable-capacity calculation:
  - `min(profit-based capacity, Company Money above reserve)`.
- Loss or zero season profit produces no dividend capacity.
- Treasury-held Internal and External units receive no dividend.
- Actual shareholder holdings across both pools participate with the same baseline economic right per held unit.
- Holdings owned by one Economic Actor across multiple pools are aggregated into one Personal Money dividend credit.
- Added deterministic largest-remainder whole-money allocation with stable actor-ID tie breaking and exact total conservation.
- Added atomic settlement:
  - issuing Company Money decreases by the exact total dividend amount;
  - every positive recipient receives one `DividendIncome` Personal Money ledger entry naming the issuing company;
  - all recipient credits and Company Money debit succeed together or none are returned as committed state.
- Added stable `distributionId` receipts.
- Exact replay returns the prior receipt without another debit or credit.
- Conflicting reuse of a distribution ID is rejected.
- A second distribution ID for an already completed `seasonId` is rejected.
- Added fail-safe validation for corrupted equity, duplicate/missing/forged Personal Money accounts, invalid Company Money, invalid policy, mismatched company identity and unsafe arithmetic.

## Automated Verification

GitHub Actions CI run #267 (`34119954929`) on PR #387 head `078f34cfcb9bf354a626ae1e4888c071ea095030` completed successfully.

Results:

- 67 / 67 test files passed;
- 993 / 993 tests passed;
- 16 / 16 dividend-domain tests passed;
- TypeScript + Vite production build passed;
- production server HTTP smoke passed;
- PR-range whitespace validation passed;
- archived `Game/` runtime unchanged;
- canonical planning YAML validation passed;
- active planning crosswalk passed;
- Prototype v0.1 owner progression gate passed.

## Known Non-Blocking Warnings

These existing warnings remain and are not represented as resolved by this slice:

- Vite production bundle remains above the 500 kB warning threshold (CI output: ~1,390.10 kB, gzip ~376.90 kB).
- `npm audit` reports 2 vulnerabilities: 1 moderate and 1 high.
- GitHub Actions reports that `actions/checkout@v4` and `actions/setup-node@v4` target deprecated Node 20 while the runner forces Node 24; project Node setup remains 22.12.0.

## Boundaries Preserved

This slice does not add:

- governance voting or CEO dividend discretion;
- Save v2/runtime activation;
- visible Android UI;
- automatic current-game season boundaries;
- live stock-market/order-book trading;
- loans, taxes, real securities or real-money settlement;
- blockchain, NFT, wallet, tokenized shares, or the future DROPi cryptocurrency;
- Railway configuration changes.

## Owner Verification

No Android owner action is required for this non-visible domain slice.

Issue #386 may close only after the report-inclusive head passes final CI, PR #387 is merged, and the exact merge commit reaches `SUCCESS` on the canonical Railway production service.
