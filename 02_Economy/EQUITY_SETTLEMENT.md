# Document Information

Document: EQUITY_SETTLEMENT.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Canonical — Internal Treasury Share Settlement Specialization
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-07

---

# DROPi Tycoon Internal Treasury Share Settlement

## Purpose

This document defines the authoritative economic settlement for paid purchases of available **Internal/Member treasury shares**.

It specializes:

- `02_Economy/PERSONAL_FINANCE.md`;
- `02_Economy/VALUATION.md`;
- the canonical 51/49 equity ledger established under issue #378;
- `06_Technical/SHARED_AUTHORITY_CONTRACT.md` for future multiplayer authority and replay safety.

This is fictional in-game economics only. It does not represent real securities, real investment, real-money settlement, banking, or tokenized ownership.

---

# 1. Owner-Approved Lifecycle

The canonical Internal share lifecycle is:

`member holds Internal shares`

→ final company exit

→ all remaining Internal shares held by that member are forfeited

→ those units return to the issuing company's Internal treasury pool

→ another eligible active member may later request a paid purchase

→ buyer Personal Money is debited

→ issuing company Company Money is credited

→ purchased Internal units move from treasury to the buyer

Forfeited Internal shares are never deleted and are never redistributed free of charge.

External portfolio holdings remain outside this exit-forfeiture rule.

---

# 2. Funding Rule

Every Internal treasury purchase is funded by the **buyer's Personal Money**.

The target company's Company Money cannot be used as if it belonged personally to the buyer.

Settlement direction is:

`buyer Personal Money -> issuing company Company Money`

Only after the payment is valid may the corresponding treasury shares move to the buyer.

---

# 3. Eligibility

A buyer must:

- have a stable EconomicActor identity;
- be an active eligible member of the issuing company;
- request a positive whole number of Internal units;
- request no more units than are currently available in the Internal treasury pool;
- have sufficient Personal Money to pay the full governed settlement amount.

Internal shares cannot be acquired by an actor who is not an active eligible company member.

---

# 4. Quote Basis

Company valuation provides `referenceEquityUnitValue` as an economic reference basis.

Treasury settlement converts that reference basis into a payable amount through a **versioned treasury pricing policy**.

Prototype policy v1 uses:

- the current valuation reference unit value;
- a governed reference-value multiplier;
- whole Personal Money settlement rounding;
- a minimum total paid amount of at least 1 Personal Money unit.

The quote therefore remains paid even if a distressed company currently has a zero reference equity unit value.

The quote is not:

- a live exchange price;
- a speculative order-book quote;
- a guaranteed future resale value;
- a real-world security price.

---

# 5. Atomic Settlement

A purchase is one atomic economic operation across three ownership domains:

1. buyer Personal Money ledger;
2. issuing company Company Money balance;
3. issuing company Internal equity ledger.

Before any mutation, settlement must verify all required identities, balances, ownership integrity, treasury availability, pricing inputs, and safe-integer constraints.

If any requirement fails:

- Personal Money is not debited;
- Company Money is not credited;
- treasury shares are not moved;
- no completed settlement receipt is created.

There is no partial success state.

---

# 6. Completed Settlement Effects

A successful purchase performs all of the following together:

- appends an `EquityPurchase` debit to the buyer's Personal Money ledger;
- reduces buyer Personal Money by the full quoted amount;
- increases issuing company Company Money by exactly the same amount;
- reduces Internal treasury units by the purchased quantity;
- increases the buyer's Internal holding by that quantity;
- creates a stable settlement receipt.

The money amount paid and the share quantity received must be explainable from that receipt.

---

# 7. Settlement Receipt

A completed receipt records at minimum:

- stable `purchaseId`;
- company ID;
- buyer actor ID;
- units purchased;
- valuation policy version;
- treasury pricing policy version;
- valuation reference equity unit value used at first settlement;
- total Personal Money paid;
- Personal Money ledger transaction ID;
- Company Money before and after;
- buyer Internal units after settlement;
- Internal treasury units after settlement.

The receipt is an idempotency record and an audit record for fictional game economics.

---

# 8. Idempotency and Replay

A stable `purchaseId` identifies one treasury purchase command.

If the same completed `purchaseId` is received again with the same company, buyer, and unit terms:

- the prior receipt is returned;
- Personal Money is not debited again;
- Company Money is not credited again;
- shares are not allocated again.

If the same `purchaseId` is reused with different purchase terms, the request is rejected as a conflict.

A later valuation change does not rewrite or reprice an already completed settlement receipt.

---

# 9. Integrity Requirements

Settlement must fail safe when any authoritative input is structurally invalid, including:

- corrupted equity supply/treasury integrity;
- forged or ledger-inconsistent Personal Money balance;
- negative or unsafe Company Money balance;
- unsafe Company Money credit overflow;
- invalid valuation reference values;
- invalid pricing policy;
- mismatched company or buyer identities.

No UI-provided balance or ownership claim is authoritative.

---

# 10. Current Runtime Boundary

This specialization is currently a non-visible domain foundation.

It does not yet:

- add Personal Money to Save v2;
- expose share purchasing in the Android UI;
- activate a live company share market;
- create dividend flows;
- persist the settlement journal in current gameplay state;
- alter current delivery rewards or Company Money behavior outside explicit future integration.

Runtime and persistence activation require dedicated later slices.

---

# 11. External Market Boundary

This document covers **Internal/Member treasury shares only**.

The 49% External Market pool remains a future separately governed system.

No external order book, player-to-player speculative trading, public exchange, or live market price is created by this settlement domain.

---

# 12. Real-World Boundary

This system does not implement or authorize:

- real securities;
- real-money investment;
- deposits or withdrawals;
- cash-out;
- fiat conversion;
- guaranteed returns;
- blockchain;
- NFTs;
- wallets;
- tokenized shares;
- the future DROPi ecosystem cryptocurrency.

---

# Canonical Rule

**An Internal treasury share can move to an eligible active member only through an explicit paid atomic settlement: Personal Money leaves the buyer, the same amount enters the issuing company as Company Money, and the purchased treasury units move to the buyer exactly once.**

---

End of Document
