# Document Information

Document: PERSONAL_FINANCE.md
Project: DROPi Tycoon
Version: 1.1.0
Status: Canonical — Personal Finance Specialization
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-08

---

# DROPi Tycoon Personal Finance

## Purpose

This document canonically separates money and obligations owned by a person/player from money and obligations owned by a company.

It specializes `02_Economy/ECONOMY.md`, `00_Project/BUSINESS_DESIGN.md`, and `00_Project/PHASE1_GAME_ARCHITECTURE_DECISION_BASELINE.md` for wages, living costs, personal assets, dividends, spending, investment, insolvency, and recovery.

This is fictional game currency/accounting only. It does not represent deposits, electronic money, a bank account, cash-out value, real securities funding, or a real financial service.

---

# 1. Distinct Ownership Domains

DROPi Tycoon has distinct financial ownership domains.

## Company Money

Owned by a company.

Used for company purposes such as:

- wages and operating costs;
- inventory/procurement;
- vehicles/equipment;
- fuel/energy;
- maintenance;
- infrastructure;
- departments/construction;
- research;
- expansion;
- governed investments/acquisitions.

## Personal Money

Owned by an individual Economic Actor/person.

Used for personal purposes such as:

- food/water/living costs;
- rent/housing;
- personal training/education;
- personal equipment;
- personally owned transport/assets;
- share/investment purchases;
- travel or service fees paid personally;
- other explicit player-life expenses.

Company Money and Personal Money are not interchangeable balances.

The ownership domain is distinct from currency denomination. Future national currencies may give each balance a currency dimension without collapsing personal/company ownership.

---

# 2. One Person per World Instance

One economic hero exists per account per World Instance.

Personal Money, productive qualifications, reputation, personally owned economic assets, and other economic power are World-Instance-local by default.

A fresh World Instance does not import mature-world Personal Money or productive economic power.

Non-economic account history such as settings, cosmetics, achievements/history, or tutorial familiarity may follow the account where separately authorized.

---

# 3. Personal Income

Personal Money may be earned through governed sources including:

- wages/salary for actual work;
- contract/self-employment income where the player legitimately acts as the paid person/business counterpart;
- dividends from eligible external/investment ownership;
- proceeds from legitimate personal asset/share sales;
- other explicitly defined fictional gameplay income.

Company payment and personal receipt are separate sides of one economic movement.

Normal income must have a legitimate counterparty/source. Money must never be created merely by crediting the personal account unless a system explicitly defines a bounded faucet such as an approved tutorial/public grant.

---

# 4. Wages and Work

Starter compensation is primarily day/shift wage paid by the fictional incumbent employer for real work performed.

A wage settlement must connect:

- employer/company;
- worker/person;
- role/shift/work record;
- wage basis;
- company debit;
- personal credit;
- stable transaction identity.

Offline absence does not manufacture starter wages.

The current runtime's per-delivery Company Money reward is a legacy/prototype implementation and must not be silently reinterpreted as personal wage income.

---

# 5. Personal Living Costs

The person is an economic consumer.

Canonical living-cost categories include:

- food;
- water;
- housing/rent or equivalent living cost;
- personal equipment/transport upkeep where personally owned;
- education/training costs where applicable;
- other explicitly approved living/service costs.

Exact costs and consumption rates are balancing data.

The game should model meaningful economic pressure without turning ordinary play into constant survival clicking.

---

# 6. Work Capacity and Recovery

Finite Work Capacity limits sustained labor.

Work Capacity may respond to:

- work performed;
- rest;
- food/water state;
- equipment/transport assistance;
- injuries/conditions only if later explicitly designed;
- training/efficiency where appropriate.

Work Capacity is not a purchasable real-money energy bar and must not become a dark-pattern refill mechanic.

Exact rates are balancing data.

---

# 7. Housing, Poverty and Personal Bankruptcy

Housing can genuinely be lost when the person cannot meet legitimate obligations.

Possible recoverable states include:

- financially stable;
- financially stressed;
- arrears/default warning;
- No Housing / Emergency Housing;
- personal bankruptcy/recovery.

Normal personal bankruptcy does **not** delete:

- human identity;
- world history;
- valid earned qualifications;
- account achievements/cosmetics;
- legitimate historical records.

Assets/money may be lost or sold according to governed rules, but the player must retain access to the lowest legitimate productive rung from which rebuilding is possible.

The intended recovery fantasy is a comeback story, not an account softlock.

---

# 8. Personal Spending and Investment

Personal Money may be debited for governed purposes including:

- living costs;
- personal purchases;
- personal training;
- travel/services;
- share purchases;
- personal asset purchases;
- other explicitly personal expenses.

A normal purchase cannot make the Personal Money balance negative unless a later credit/debt system explicitly authorizes borrowing.

Debt/credit is not implied merely because bankruptcy exists.

---

# 9. Anti-Circularity Rule

A member cannot purchase shares in a company using that same company's Company Money as if it were the member's personal cash.

That would make the company effectively pay itself while granting ownership to an individual.

Therefore treasury-share purchases follow this direction:

`buyer's Personal Money -> issuing company's Company Money/treasury`

Only after the payment succeeds may the corresponding treasury shares move to the buyer.

The full transaction must be atomic under authoritative settlement.

---

# 10. Treasury Share Purchases

The owner-approved equity rules remain binding:

- final company exit forfeits all remaining Internal/Member shares to the company's Internal treasury pool;
- forfeited units are not deleted;
- forfeited units are not redistributed for free;
- eligible active members may later purchase available Internal treasury units;
- the buyer must fund that purchase from Personal Money;
- purchase proceeds belong to the issuing company and increase Company Money/treasury through authoritative settlement;
- valuation provides a reference price basis but does not itself transfer money or shares.

A player has one primary Internal/Member company relationship at a time, while unrelated External portfolio holdings remain separate investment assets.

---

# 11. Dividends

Dividends are a company-to-person transfer.

They must:

- originate from actual distributable company results under dividend rules;
- reduce the paying company's distributable cash as governed;
- credit the shareholder's Personal Money;
- never create money from nothing;
- use authoritative share ownership at the applicable record/settlement point.

The current design target remains end-of-season settlement unless canon changes explicitly.

---

# 12. Personal Assets

Personal assets may include, when implemented:

- bicycle/vehicle;
- personal work equipment;
- home/property or housing rights;
- investment shares;
- collectible/history objects;
- other explicitly personal property.

Personal assets are distinct from company-owned fleet/equipment/property.

Use of a company asset does not imply personal ownership.

---

# 13. Offline Personal Economy

World time may continue while the player is offline.

Canonical offline principles:

- legitimate fixed obligations/basic living consumption may continue;
- active-use costs such as driving fuel do not accrue when no driving occurs;
- starter wages require actual work;
- no generic magical offline-income multiplier exists;
- catch-up/settlement must be bounded, explainable, and idempotent under shared authority.

When returning after material absence, the player should receive a concise causal summary of what changed and a visible recovery path if conditions deteriorated.

---

# 14. Currency Denomination — Staged Future System

Personal Money is an ownership/accounting domain, not a claim that all worlds permanently use one universal currency.

The architecture should support future national game currencies and FX settlement.

Until multi-currency mechanics are implemented, the runtime may use a common gameplay denomination.

No real-world cash-out/fiat promise is implied.

---

# 15. Ledger Integrity

Every Personal Money mutation requires an explicit ledger entry.

A ledger entry records at minimum:

- stable transaction ID;
- deterministic sequence/time;
- actor identity;
- signed amount;
- reason;
- counterparty when applicable;
- currency/denomination when multi-currency is later active.

The stored balance must equal the authoritative ledger-derived result under the chosen persistence model.

Invalid/tampered state must fail safe during persistence integration.

---

# 16. Multiplayer Authority

When real-player economic interaction is activated, Personal Money and personal economic settlement must become server/trusted-authoritative under `06_Technical/SHARED_AUTHORITY_CONTRACT.md`.

The client cannot be trusted to declare:

- its balance;
- a successful debit;
- wage/dividend receipt;
- share/asset purchase settlement;
- transfer result;
- bankruptcy/recovery settlement;
- cross-world economic import.

Replay/idempotency rules must prevent duplicate payments, duplicate assets, or duplicate share acquisition.

---

# 17. Current Runtime Boundary

The current gameplay runtime still uses Company Money as the active visible financial balance and rewards completed deliveries directly into that company balance.

This canonical Personal Money model does not automatically migrate Save data, create the final player wallet UI, redirect existing rewards, or change current company expenses.

Activation must be staged through explicit migration slices.

Until migration, the runtime implementation is legacy compatibility truth and this document is design authority for the target model.

---

# 18. Banking/Credit Boundary

Future personal loans/credit may exist only after the core economy is stable and only with explicit:

- principal;
- interest;
- repayment;
- collateral/eligibility;
- default/recovery.

This document does not authorize hidden negative balances or predatory monetization.

---

# 19. Real-World Boundary

Personal Money is fictional in-game value.

This system does not authorize:

- real deposits;
- withdrawals/cash-out;
- fiat conversion;
- real-money investment;
- regulated payment services;
- blockchain;
- NFT;
- tokenized securities.

---

# Canonical Rule

**Company Money belongs to the company. Personal Money belongs to the person. The person earns through legitimate work/investment, pays real modeled living/personal costs, may suffer recoverable poverty or bankruptcy, and any transfer between ownership domains must be explicit, balanced, authoritative, and isolated to the relevant World Instance.**

---

End of Document
