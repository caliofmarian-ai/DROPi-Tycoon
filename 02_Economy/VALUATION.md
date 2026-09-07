# Document Information

Document: VALUATION.md
Project: DROPi Tycoon
Version: 1.1.0
Status: Canonical — Company Valuation Specialization
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-07

---

# DROPi Tycoon Company Valuation

## Purpose

This document owns the detailed in-game company valuation model beneath `00_Project/BUSINESS_DESIGN.md`.

It defines how a company receives an explainable economic reference valuation for future treasury-share pricing, governance, reporting, and simulated investment systems.

It does **not** define a real security, real investment product, guaranteed return, live exchange quote, or real-world valuation methodology.

---

# 1. Core Rule

Company valuation must emerge from multiple business fundamentals.

No single reputation score, revenue number, technology flag, company level, or player action may directly become "the share price".

The valuation model separates:

1. tangible economic base;
2. sustainable earnings and cash generation;
3. customer/market strength;
4. strategic capability;
5. growth adjustment;
6. liabilities;
7. operational risk and reliability.

The final result is an in-game **reference valuation**, not a live market price.

---

# 2. Valuation Inputs

A governed valuation snapshot may contain:

- Company Money/cash;
- productive tangible assets;
- liabilities/obligations;
- trailing revenue;
- trailing operating profit;
- trailing free cash flow;
- trailing revenue growth;
- customer strength;
- reputation;
- demand strength;
- infrastructure capability;
- technology capability;
- trained specialist capability;
- operational reliability;
- material operational risk.

Scores representing qualitative fundamentals use normalized 0..100 domain values. Their upstream calculation must eventually come from authoritative simulation state rather than arbitrary UI values.

---

# 3. Tangible Value

Gross tangible value is:

`cash + productive tangible assets`

Liabilities are not ignored merely because they exceed tangible assets. They are deducted from the broader valuation subtotal, while `net tangible value` remains separately visible as:

`max(0, gross tangible value - liabilities)`

This prevents debt from being hidden behind intangible or operational value.

---

# 4. Sustainable Earnings Value

The prototype valuation engine combines three operating signals:

- trailing revenue support;
- trailing operating profit;
- trailing free cash flow.

Profit and free cash flow are signed inputs. Sustained losses or negative free cash flow can therefore reduce the earnings component rather than allowing revenue alone to imply a healthy company.

Exact multiples are governed balancing policy and may change through explicit policy versioning.

---

# 5. Market Strength

Market/customer strength combines:

- customer strength;
- reputation;
- demand strength.

The result is a bounded index used against a capped portion of trailing revenue.

This makes market strength economically relevant while preventing a single reputation increase from dominating total company value.

---

# 6. Strategic Capability

Strategic capability combines:

- infrastructure;
- technology;
- trained specialist capability.

Strategic value is capped as a percentage of an existing economic base.

A company with zero assets, zero revenue, zero profit, and zero cash flow cannot become highly valuable merely because one technology/capability score is high.

---

# 7. Growth

Growth modifies the pre-deduction valuation only within governed positive and negative caps.

Extreme one-period growth therefore cannot multiply the company without limit, and an extreme decline cannot create a negative company valuation.

---

# 8. Liabilities and Risk

Liabilities are deducted explicitly before operational-risk haircut.

Operational-risk haircut combines:

- material operational risk;
- reliability deficit.

The haircut is capped by policy.

Risk must reduce valuation in a visible, explainable way rather than being hidden inside an opaque score.

---

# 9. Reference Equity Unit Value

The canonical equity ledger contains 10,000 integer units:

- 5,100 Internal/Member units;
- 4,900 External Market units.

The valuation engine may expose:

`reference equity unit value = total reference valuation / 10,000`

This is a **reference basis only**.

It is not automatically:

- a live market price;
- a guaranteed sale price;
- a guaranteed treasury purchase price;
- an exchange quote;
- a real-money value.

Future treasury-share purchases may use this reference as one governed input to an explicit settlement funded by the buyer's **Personal Money**. The issuing company receives the purchase proceeds as Company Money only through that future atomic settlement.

See `02_Economy/PERSONAL_FINANCE.md`.

---

# 10. Member Exit and Treasury Shares

The owner-approved rule remains binding:

- final company exit forfeits all Internal/Member shares still held by the departing player;
- those units return to the Internal treasury pool;
- the units are not deleted;
- the units are not redistributed for free;
- other eligible active company members may later purchase those treasury units through an explicit paid transaction funded from the buyer's Personal Money;
- purchase proceeds belong to the issuing company and become Company Money only through authoritative settlement;
- external portfolio holdings are independent and are not confiscated because operational membership changes.

Valuation does not itself execute that purchase. It only provides a future reference basis.

---

# 11. Policy Versioning

Valuation multiples, caps, and weights are balancing policy, not immutable historical company state.

The runtime must identify which policy version produced a valuation result.

Changing policy must not rewrite company ownership history or silently mutate the 51/49 equity structure.

---

# 12. Multiplayer Authority

When real-player company ownership is activated, valuation inputs used for authoritative transactions must come from server-authoritative state under `06_Technical/SHARED_AUTHORITY_CONTRACT.md`.

The client must never be trusted to submit its own authoritative balance, share ownership, valuation, or transaction result.

---

# 13. Safety Boundary

This is fictional game economics.

This system does not implement or authorize:

- real securities;
- real-money investment;
- investment advice;
- guaranteed returns;
- blockchain;
- NFT ownership;
- wallets;
- tokenized shares;
- conversion of Company Money or Personal Money into real financial claims.

---

# Canonical Rule

**Company valuation in DROPi Tycoon is an explainable, multi-factor simulation result grounded in economic fundamentals and bounded by policy. It is never a single arbitrary score and never automatically a market price.**

---

End of Document
