# Document Information

Document: DIVIDENDS.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Canonical — Dividend Settlement Specialization
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-07

---

# DROPi Tycoon Dividend Settlement

## Purpose

This document defines how fictional company earnings may be distributed to actual shareholders without creating Personal Money from nothing.

It specializes:

- `02_Economy/PERSONAL_FINANCE.md`;
- the canonical 51/49 equity ledger;
- `02_Economy/EQUITY_SETTLEMENT.md`;
- `06_Technical/SHARED_AUTHORITY_CONTRACT.md` for future authoritative replay-safe settlement.

This is an in-game economic system only. It does not represent a real security, real investment return, bank account, cash-out right, or regulated dividend.

---

# 1. Default Cadence

The baseline dividend cadence is **end of season**.

One season may have at most one completed dividend settlement for a company.

A later governance system may decide whether an eligible distribution is authorized, but governance does not change the conservation rules in this document.

---

# 2. Source of Dividend Money

A dividend must originate from actual company economic capacity.

The baseline distributable capacity is constrained by both:

1. a governed percentage of **positive season net profit**; and
2. Company Money available above a protected minimum reserve.

Therefore:

`distributable amount = min(profit-based capacity, Company Money above protected reserve)`

A loss or zero season profit creates no dividend capacity.

A company with insufficient cash above its protected reserve cannot distribute a dividend merely because an accounting profit exists.

---

# 3. Prototype Policy v1

The initial balancing policy is versioned outside historical company/equity state.

Prototype v1 uses:

- 25% of positive season net profit as the profit-based distribution ceiling;
- 100 Company Money units as the protected minimum reserve.

These are replaceable balancing values, not permanent historical rights.

Each completed distribution records the policy version that produced it. Later policy changes must not rewrite prior receipts.

---

# 4. Eligible Equity

Dividend entitlement is based only on **actual shareholder holdings** recorded in the equity ledger.

Both canonical pools participate when units are actually held:

- Internal/Member holdings;
- External Market portfolio holdings.

Treasury-held units do **not** receive dividends.

Unissued, returned, or otherwise treasury-held units therefore cannot redirect company cash back to the company through a fictional self-payment.

---

# 5. Baseline Economic Right per Unit

In this baseline, one held equity unit has the same dividend economic right regardless of whether it belongs to the Internal or External pool.

The 51/49 pool structure governs eligibility and ownership context; it does not create a different dividend rate per unit in this version.

A future explicit share-class policy may specialize economic rights, but no such distinction exists implicitly.

---

# 6. Actor Aggregation

A single Economic Actor may hold units in more than one pool where the relevant ownership rules permit it.

Before dividend allocation, all eligible holdings belonging to the same actor are aggregated.

That actor receives one Personal Money dividend credit for the completed distribution rather than multiple artificial credits merely because their holdings span multiple pools.

---

# 7. Whole-Money Allocation

Personal Money uses whole safe-integer units.

Dividend allocation must therefore be deterministic and conserve the exact distributable amount.

The baseline allocator uses proportional ownership over all outstanding held units followed by deterministic largest-remainder handling:

1. calculate each actor's exact proportional numerator;
2. assign the whole-unit floor amount;
3. calculate each actor's remainder;
4. distribute remaining whole units to the largest remainders;
5. break equal-remainder ties by stable actor ID order.

The sum of all actor allocations must equal the total dividend amount exactly.

No rounding loss may create or destroy Company Money.

---

# 8. Atomic Settlement

A completed distribution is one atomic economic operation across:

1. issuing Company Money;
2. every recipient Personal Money account;
3. the dividend settlement journal.

The equity ledger is the authoritative entitlement input and is not mutated by a dividend payment.

All validation occurs before committed output is returned.

If any required shareholder account is missing, duplicated, forged, corrupted, or otherwise invalid, the entire settlement fails.

If settlement fails:

- Company Money does not decrease;
- no Personal Money account is credited;
- no completed distribution receipt is appended.

There is no partial dividend settlement.

---

# 9. Completed Settlement Effects

On success:

- Company Money decreases by exactly the total dividend amount;
- every positive recipient allocation creates one `DividendIncome` Personal Money ledger entry;
- each ledger entry identifies the issuing company as counterparty;
- the sum of Personal Money credits equals the Company Money debit exactly;
- Company Money remains at or above the protected reserve;
- a completed distribution receipt is recorded.

An allocation rounded to zero creates no zero-value Personal Money ledger entry.

---

# 10. Distribution Receipt

A completed receipt records at minimum:

- stable `distributionId`;
- company ID;
- season ID;
- season net profit basis;
- dividend policy version;
- total outstanding held units;
- total dividend amount;
- Company Money before and after settlement;
- per-actor held units;
- per-actor Personal Money amount;
- Personal Money ledger transaction ID for each positive allocation.

The receipt is both an audit record and an idempotency record for fictional game economics.

---

# 11. Idempotency and Season Uniqueness

A stable `distributionId` identifies one dividend settlement command.

If the same completed `distributionId` is received again with the same company, season, and profit terms:

- the prior receipt is returned;
- Company Money is not debited again;
- Personal Money is not credited again.

If the same `distributionId` is reused with different terms, the request is rejected.

A second new `distributionId` for a season that already has a completed distribution is also rejected.

A later policy change cannot reprice or rewrite an already completed season receipt.

---

# 12. Integrity Requirements

Dividend settlement fails safe when authoritative inputs are structurally invalid, including:

- broken equity supply or holding integrity;
- duplicate Personal Money accounts for one actor;
- forged Personal Money balances inconsistent with their ledgers;
- missing Personal Money account for an entitled shareholder;
- negative or unsafe Company Money;
- invalid policy values;
- mismatched company identity;
- unsafe arithmetic;
- corrupted settlement journal history.

No client/UI-provided balance, ownership, or payout result is authoritative.

---

# 13. Current Runtime Boundary

This document and its initial domain implementation do not yet:

- add equity, Personal Money, or dividend journal data to Save v2;
- expose dividends in the Android UI;
- create governance voting or executive payout controls;
- automatically derive a season boundary from current gameplay;
- change current delivery rewards, salaries, or Company Money runtime behavior;
- activate multiplayer economic settlement.

Persistence, runtime integration, governance, and visible review require later dedicated slices.

---

# 14. Market and Real-World Boundary

This system does not create:

- a live stock exchange;
- an order book;
- speculative market pricing;
- a guaranteed return;
- a real security;
- real-money investment;
- deposits, withdrawals, or cash-out;
- blockchain;
- NFTs;
- wallets;
- tokenized shares;
- the future DROPi ecosystem cryptocurrency.

---

# Canonical Rule

**A DROPi Tycoon dividend may distribute only real fictional company capacity: positive season results and available Company Money above the protected reserve. Treasury shares receive nothing, actual shareholders receive deterministic proportional Personal Money credits, and the issuing company loses exactly the same amount exactly once.**

---

End of Document
