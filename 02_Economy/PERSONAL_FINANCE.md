# Document Information

Document: PERSONAL_FINANCE.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Canonical — Personal Finance Specialization
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-07

---

# DROPi Tycoon Personal Finance

## Purpose

This document canonically separates money owned by a person/player from money owned by a company.

It specializes `02_Economy/ECONOMY.md` and `00_Project/BUSINESS_DESIGN.md` for player-owned funds, wages, dividends, personal spending and investment.

This is fictional game currency/accounting only. It does not represent deposits, electronic money, a bank account, cash-out value, real securities funding, or a real financial service.

---

# 1. Two Ownership Domains

DROPi Tycoon has two distinct financial ownership domains when personal finance is activated:

## Company Money

Owned by a company.

Used for company purposes such as:

- wages and operating costs;
- vehicles;
- maintenance;
- infrastructure;
- departments/construction;
- research;
- expansion;
- company investments authorized by future governance.

## Personal Money

Owned by an individual Economic Actor/person.

May be used for personal purposes such as:

- personal training/education costs where applicable;
- personal purchases;
- future investment in company shares;
- other player-life expenses added through explicit canon.

Company Money and Personal Money are not interchangeable balances.

---

# 2. Anti-Circularity Rule

A member cannot purchase shares in a company using that same company's Company Money as if it were the member's personal cash.

That would make the company effectively pay itself while granting ownership to an individual.

Therefore future treasury-share purchases follow this direction:

`buyer's Personal Money -> issuing company's Company Money/treasury`

Only after the payment succeeds may the corresponding treasury shares move to the buyer.

The full transaction must eventually be atomic under authoritative settlement.

---

# 3. Personal Income

Personal Money may be earned through governed player-life income sources, including future:

- wages/salary paid to the player as a worker/member;
- dividends paid to an eligible shareholder;
- other explicit fictional gameplay income.

Company payment and personal receipt are separate sides of one economic movement.

Money must never be created merely by crediting the personal account without an authorized source unless the gameplay system explicitly defines a source such as a starting grant/reward.

---

# 4. Personal Spending and Investment

Personal Money may be debited for governed purposes, including:

- share purchases;
- personal training;
- personal expenses;
- future player-life purchases.

A debit cannot make the Personal Money balance negative.

---

# 5. Ledger Integrity

Every Personal Money mutation requires an explicit ledger entry.

A ledger entry records at minimum:

- stable transaction ID;
- deterministic sequence;
- actor identity;
- signed amount;
- reason;
- company counterparty when applicable.

The stored balance must equal the balance derived from ledger history.

Invalid/tampered state must fail safe during future persistence integration.

---

# 6. Treasury Share Purchases

The owner-approved equity rules remain binding:

- final company exit forfeits all remaining Internal/Member shares to the company Internal treasury pool;
- forfeited units are not deleted;
- forfeited units are not redistributed for free;
- eligible active members may later purchase available Internal treasury units;
- the buyer must fund that purchase from Personal Money;
- purchase proceeds belong to the issuing company and increase its Company Money/treasury through authoritative settlement;
- valuation provides a reference price basis but does not itself transfer money or shares.

---

# 7. Dividends

Future dividends are a company-to-person transfer.

They must:

- originate from actual distributable company results under the dividend rules;
- reduce the paying company's distributable cash as governed;
- credit the shareholder's Personal Money;
- never create money from nothing;
- use authoritative share ownership at the applicable record/settlement point.

The default long-term cadence remains end-of-season unless canon changes explicitly.

---

# 8. Wages

Future player wages are also a company-to-person transfer.

The current NPC employee/payroll simulation is not silently reinterpreted as a personal player wallet.

Player wage activation requires a dedicated integration slice so company debit and personal credit settle consistently.

---

# 9. Current Runtime Boundary

The current gameplay runtime still uses Company Money as its active financial balance.

This document and the initial Personal Money domain do not automatically add a visible wallet, change current rewards, migrate Save v2, or redirect existing company expenses.

Activation must be staged and tested separately.

---

# 10. Multiplayer Authority

When real-player economic interaction is activated, Personal Money must become server-authoritative under `06_Technical/SHARED_AUTHORITY_CONTRACT.md`.

The client cannot be trusted to declare:

- its balance;
- a successful debit;
- a successful dividend/wage receipt;
- a share purchase settlement;
- a transfer result.

Replay/idempotency rules must prevent duplicate payments or duplicate share acquisition.

---

# 11. Real-World Boundary

Personal Money is fictional in-game value.

This system does not authorize:

- real deposits;
- withdrawals/cash-out;
- fiat conversion;
- real-money investment;
- regulated payment services;
- blockchain;
- NFT;
- wallets;
- tokenized securities.

---

# Canonical Rule

**Company Money belongs to the company. Personal Money belongs to the person. A transfer between them must be explicit, balanced, and authoritative; one balance must never masquerade as the other.**

---

End of Document
