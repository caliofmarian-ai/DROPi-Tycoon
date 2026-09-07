# AI Implementation Report 114 — Equity Ledger Domain

Date: 2026-09-07
Issue: #378
Parent: #362
Pull Request: #379
Branch: `openai/issue-378-equity-ledger-domain`

## Scope

This non-visible equity/governance slice establishes company share-supply integrity and the owner-approved member-exit rule before valuation, pricing, dividends, market UI or persistence activation.

## Canon reconciled

`00_Project/BUSINESS_DESIGN.md` and `01_GameDesign/COMPANY_SOCIETY_AND_MULTIPLAYER.md` now state the same owner-approved rule:

- company equity has a protected 51% Internal/Member pool and 49% External Market pool;
- a player who definitively leaves a company forfeits all remaining Internal/Member shares held in that company;
- forfeited internal units return to company treasury;
- returned treasury shares are not destroyed and are not redistributed for free;
- other eligible active company members may later purchase returned treasury shares through an explicit paid transaction once valuation/pricing/payment settlement exists;
- unrelated External portfolio holdings remain the departing player's investment assets.

The previous gameplay-specialization wording that allowed a member to normally sell/transfer/redeem internal holdings before departure was removed to prevent two conflicting canonical truths.

## Implemented domain

- Integer company equity supply: 10,000 units.
- Internal/Member structural pool: 5,100 units.
- External Market structural pool: 4,900 units.
- Treasury units explicitly account for all unallocated/returned shares.
- Treasury plus actor holdings must equal each pool's supply.
- Holdings cannot duplicate, become negative or exceed structural supply.
- Internal ownership requires active membership.
- External holdings do not require operational membership.
- Founder historical actor identity is permanently distinct from current executive actor identity.
- Current executive can change without rewriting Founder history.
- Internal transfers require eligible recipient membership.
- Final member exit returns all remaining Internal/Member units to treasury.
- External holdings survive membership exit.
- Returned treasury units can structurally be acquired by another active member after a later paid settlement layer authorizes the transaction.
- Sanitizer rejects invalid supply, invalid pool topology, unknown pools, duplicate/invalid holdings and broken membership eligibility.

## Deliberate boundaries

- No company valuation formula.
- No share-price formula.
- No actual Company Money purchase settlement yet.
- No dividends.
- No stock-market/trading UI.
- No Save v2/runtime activation.
- No real securities or real-money investment.
- No blockchain/NFT/wallet/token implementation.
- No Railway configuration changes.

## Verification

GitHub Actions run #255 passed before this report commit:

- 63/63 test files passed.
- 939/939 tests passed.
- `equity-ledger-domain.test.ts`: 14/14 passed.
- TypeScript and Vite production build passed.
- Production HTTP smoke passed.
- PR-range whitespace validation passed.
- Archived `Game/` runtime unchanged gate passed.
- Canonical planning YAML syntax/count gate passed.
- Active planning crosswalk gate passed.
- Prototype v0.1 owner progression gate passed.

Known non-blocking repository warnings remain unchanged: npm reports 2 vulnerabilities (1 moderate, 1 high), Vite reports a >500 kB bundle warning, and GitHub Actions warns that checkout/setup-node actions target Node 20 while the runner forces Node 24. Project Node remains 22.12.0.

## Acceptance boundary

#378 may close after the final head including this report receives green CI, PR #379 is merged, and the canonical Railway production service successfully deploys the exact merge commit. Parent #362 remains open for valuation fundamentals, treasury-share purchase pricing/settlement, dividends, governance actions, persistence/runtime activation and Android owner review.
