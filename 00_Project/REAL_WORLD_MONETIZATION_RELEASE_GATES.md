# Document Information

Document: REAL_WORLD_MONETIZATION_RELEASE_GATES.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Canonical Companion — Real-World Monetization Release Gates
Owner Lane: Agent 12 — Real-World Monetization / Business Model / Revenue Strategy
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-08

---

# DROPi Tycoon Real-World Monetization Release Gates

## Purpose

This document is the cross-agent execution gate for the commercial strategy defined in `00_Project/REAL_WORLD_MONETIZATION_STRATEGY.md`.

It does not define a second monetization model. It records the conditions that must be satisfied before a real-money monetization capability can move from strategy into production.

The governing rule remains:

> **GAME FIRST. MONETIZATION SUPPORTS THE GAME.**

This document was reconciled after Agent 12's initial strategy PR against concurrent specialist findings from:

- Agent 13 — legal/privacy/compliance/IP, PR #576;
- Agent 14 — Android/Google Play release readiness, PR #575;
- Agent 15 — growth/marketing/ASO/launch strategy, PR #577;
- Agent 16 — independent product/release audit, PR #573.

Audit baseline remains `main` commit `8e340b7131c4bdc890c38ba34e88d94858897cb3`. `main` had not advanced at the reconciliation checkpoint.

---

# 1. Commercial Capability States

Every monetization capability must use one of the following states.

| State | Meaning | Production use |
|---|---|---|
| **DISABLED** | Strategy exists, but implementation or compliance prerequisites are missing. | No |
| **IMPLEMENTATION-READY** | Product, fairness and architecture contract is approved; implementation may begin in an isolated PR. | No |
| **TEST-READY** | Implementation exists and automated validation passes, but Play/compliance/owner release evidence is incomplete. | Internal/controlled testing only |
| **RELEASE-READY** | Technical, policy, legal/privacy, purchase-reliability and owner release gates are satisfied for the exact release candidate. | Yes |
| **SUSPENDED** | A previously allowed capability is disabled because a policy, security, reliability or player-harm threshold failed. | No |

No monetization feature becomes `RELEASE-READY` merely because payment code works.

---

# 2. Current Monetization State

As of the reconciliation checkpoint:

- real-money purchases: **DISABLED**;
- subscriptions/VIP billing: **DISABLED**;
- rewarded advertising: **DISABLED**;
- interstitial advertising: **DISABLED**;
- ad-removal purchase: **DISABLED**;
- paid acquisition at meaningful scale: **DISABLED**;
- creator affiliate/paid creator program: **DISABLED**;
- real-money marketplace/cash-out/token economy: **PROHIBITED / OUT OF SCOPE**.

The repository audit still finds no production Play Billing SDK, ad SDK or commercial analytics SDK in the current runtime dependency set.

---

# 3. P0 Gates Before Any Real Purchase Path

A real Google Play digital purchase must not ship until all applicable gates below are closed or explicitly proven in the submitted release candidate.

## 3.1 Play release architecture and artifact gate

Coordinate with Agent 14:

- #567 — production Android app must bundle the Phaser runtime rather than depend on the public Railway webpage for ordinary startup;
- #568 — reproducible production AAB and artifact attestation;
- #569 — privacy, Data Safety and App Content declarations;
- #571 — Play Console verification, Play App Signing, package registration, testing and production-access state.

Monetization code must not be used as a reason to bypass these release blockers.

## 3.2 Security and account authority gate

Coordinate with Agent 13 / account authority owners:

- #560 — authenticate public-profile authority before durable online identity.

A durable entitlement service must never rely on unauthenticated client-supplied actor/account identifiers.

If the first purchase implementation is designed to work without a production user account, entitlement restoration still requires a secure Play purchase-token / device-account strategy that Agent 14 and Agent 13 approve. Do not invent an insecure local-only permanent entitlement authority.

## 3.3 Account deletion and data-rights gate

If production account creation is enabled, #562 is a blocker before commercial account-based entitlements are considered release-ready.

Purchase records that must be retained for accounting, fraud, refund or legal obligations must be separated from ordinary gameplay/profile data and governed by a documented retention rule. This document does not determine the legal retention period.

## 3.4 Third-party rights and commercial distribution gate

#565 is a commercial distribution blocker until shipped assets/data/dependencies have release-facing provenance, attribution and licensing evidence.

Do not sell a cosmetic, supporter pack, sponsored visual, avatar item, vehicle skin or other digital product whose commercial rights chain is unresolved.

## 3.5 Target audience / minors gate

Before ads, personalized monetization, subscriptions or paid social mechanics are enabled:

- final target-age strategy must be explicit;
- Play target-audience declarations must match the release;
- Agent 13 must review minors/consent/consumer-protection implications;
- Agent 14 must verify Play Families / ads / billing requirements where applicable.

A child-inclusive target audience must be treated as a materially different commercial design constraint, not as a later checkbox.

---

# 4. Purchase Architecture Gate

After strategy approval, the first monetization implementation stream should define a neutral entitlement architecture before adding a catalog of products.

Minimum requirements:

1. stable product ID contract;
2. stable entitlement ID contract;
3. clear distinction between consumable, non-consumable and subscription products;
4. server- or Play-verifiable purchase state where required;
5. purchase-token / order identity handling without exposing secrets;
6. idempotent grant semantics;
7. duplicate callback/retry safety;
8. pending purchase handling;
9. cancelled purchase handling;
10. refund/revocation handling;
11. restore/reinstall handling;
12. account change / device change behavior;
13. offline behavior for already-valid non-online entitlements;
14. explicit failure/recovery UI;
15. audit trail suitable for customer support;
16. no mutation of Personal Money, Company Money or World-Instance productive power.

A successful client purchase callback alone is not authoritative proof that an entitlement should remain permanently granted.

---

# 5. Recommended First Commercial Catalog Gate

The first paid catalog should remain intentionally small.

Recommended initial candidates after all release prerequisites permit implementation:

- **Early Supporter Pack** — permanent account badge/title plus clearly bounded cosmetic items;
- one or more **avatar/profile cosmetic packs** once profile/avatar ownership and privacy contracts are stable;
- **company visual customization** that changes presentation only;
- **vehicle skins/liveries** that do not alter speed, capacity, fuel use, maintenance, handling, route access or operating economics;
- optional **ad removal** only after ads actually exist and the exact removed placements are defined.

Every catalog item must pass:

- fairness review;
- legal/IP rights review;
- Play product-type/billing review;
- restore/revoke test;
- Android UI/UX review;
- truthful store-copy review.

Do not launch dozens of SKUs before purchase reliability, customer-support volume and conversion behavior are understood.

---

# 6. Rewarded Advertising Gate

Rewarded advertising remains a later feature, not a launch dependency.

It may move to implementation only when:

- retention is measurable and the game is demonstrably worth returning to without ads;
- an approved analytics/privacy design exists;
- target-age/minor rules are resolved;
- the ad provider and SDK pass Agent 13 privacy/data-transfer review;
- Agent 14 confirms Play declarations and Families compatibility where applicable;
- the reward is non-economic or so tightly bounded that it cannot become pay-to-win by another route;
- frequency caps and daily exposure limits are defined;
- every placement is genuinely opt-in;
- declining an ad does not block normal progression.

Rewarded ads must not grant:

- Personal Money;
- Company Money;
- qualification/certification progress;
- Work Capacity refills;
- productive inventory;
- cargo capacity;
- vehicle performance;
- guaranteed mission success;
- competitive market advantage.

The preferred reward families are cosmetic discovery, presentation-only personalization, optional lore/media access or another explicitly non-economic benefit.

---

# 7. Interstitial and Banner Gate

## Banners

Banner advertising is not part of the recommended product model and should remain **DISABLED** unless a later evidence-based design review demonstrates a non-destructive placement.

## Interstitials

Forced interstitial advertising is not recommended at launch.

A future interstitial experiment requires all of the following:

- no interruption during active delivery, navigation, dialogue, training, purchase, safety-critical interaction or high-attention gameplay;
- natural session boundary only;
- strict frequency cap;
- no deceptive close behavior;
- no placement that makes paid ad removal feel like relief from manufactured harassment;
- measurable retention guardrail;
- immediate rollback if session abandonment or sentiment materially worsens.

The default commercial assumption remains that cosmetics/supporter purchases are strategically preferable to intrusive ad pressure.

---

# 8. Subscription / VIP Gate

VIP must not be created merely because recurring revenue is attractive.

A subscription becomes implementation-eligible only when the game can deliver genuine recurring non-pay-to-win value every billing period.

Possible value families:

- rotating cosmetic drops;
- profile/company visual customization;
- supporter recognition;
- cosmetic archive access;
- presentation/media/lore benefits;
- convenience related to organization or cosmetics that does not change productive capability.

Subscription must not provide:

- increased wages or profit;
- lower productive operating costs;
- faster qualification;
- increased Work Capacity;
- better mission odds;
- productive asset multipliers;
- inventory/cargo/vehicle advantages;
- privileged territorial/world access;
- multiplayer economic dominance.

Before release, Agent 13 must review recurring-billing disclosure/cancellation/consumer rights, and Agent 14 must validate Play subscription configuration and user-facing billing behavior.

---

# 9. Analytics Gate Before Monetization Optimization

Agent 12 requires measurement before optimization, but no SDK may be added merely to satisfy a dashboard desire.

The first analytics implementation requires Agent 13 privacy review and Agent 14 release-declaration coordination.

At minimum, the commercial funnel should eventually support privacy-approved measurement of:

- install;
- first launch;
- tutorial start;
- tutorial complete;
- mission accepted;
- mission completed;
- first-session duration;
- D1 return;
- D7 return;
- D30 return;
- ad opportunity;
- ad viewed;
- store opened;
- product viewed;
- purchase started;
- purchase completed;
- purchase failed/pending;
- entitlement granted;
- refund/revocation where operationally measurable;
- subscription started;
- renewal state where available;
- cancellation;
- churn.

Data minimization rule: measure events needed for product/commercial decisions without collecting unrelated personal/device data simply because an SDK exposes it.

---

# 10. Paid User Acquisition Gate

Agent 15's PR #577 correctly keeps meaningful paid acquisition disabled until product evidence exists.

Agent 12's commercial gate for paid UA is:

1. store listing truthfulness and real capture assets are ready (#561 / #570);
2. attribution/analytics design is privacy-approved;
3. D1/D7 retention is measurable;
4. payer and/or ad monetization is measurable if the campaign objective is revenue;
5. cohort LTV has enough maturity to support a conservative estimate;
6. CAC/CPI stop-loss thresholds are defined before spend;
7. no scale decision is made from top-line install volume alone;
8. campaign spend is treated as an experiment budget until payback evidence exists.

The growth claim-status system from Agent 15 should be adopted commercially:

- `GREEN` — safe current product claim;
- `AMBER` — internal/test context;
- `BLUE` — roadmap only;
- `RED` — never market.

Monetization must not improve revenue by advertising roadmap-only capabilities as current product functionality.

---

# 11. Creator, Sponsorship and Brand Partnership Gate

These revenue streams remain later-stage and require separate contracts/rights review.

Before any paid creator, affiliate, sponsorship or real-brand integration:

- Agent 15 owns audience/creative fit;
- Agent 13 reviews disclosure, IP, contest/promotion, contract and minor/community implications;
- Agent 12 verifies unit economics and commercial terms;
- real brands must never be represented as partners without written authorization;
- sponsorship cannot override gameplay balance or force intrusive product placement;
- sponsored cosmetics/content must remain clearly disclosed where law/platform policy requires it.

Coordinate with #563 for creator package preparation.

---

# 12. Current Release-Blocker Matrix for Monetization

| Issue | Owner lane | Why Agent 12 depends on it | Monetization effect |
|---|---|---|---|
| #560 | Security / privacy / account authority | Prevent entitlement/account impersonation when durable identity is used | Blocks account-backed durable monetization |
| #562 | Privacy / account lifecycle | Deletion, retention and rights handling for production accounts | Blocks production account commerce until resolved |
| #565 | Legal / IP / licensing | Commercial rights/provenance for shipped/sold assets and data | Blocks commercial distribution of unresolved material |
| #567 | Android release | Production app startup architecture | Blocks production Play release path |
| #568 | Android release | Reproducible/attested AAB | Blocks trusted commercial artifact |
| #569 | Play compliance + legal | Privacy policy, Data Safety, target audience, IARC, ads declarations | Blocks closed/public commercial release |
| #570 | Play listing + growth | Truthful compliant store listing assets/copy | Blocks commercial store launch |
| #571 | Owner + Play release | Account verification, signing, package registration, testing/production access | Blocks actual Play production release |
| #561 | Growth/store creative | Authentic owner-validated gameplay capture | Blocks credible paid/organic acquisition creative |
| #563 | Growth/creator | Creator/press package and disclosure coordination | Blocks structured creator monetization/outreach, not core game release |

This matrix records dependencies; it does not transfer ownership of those issues to Agent 12.

---

# 13. P0 Release Principle

The commercial launch sequence must optimize for **trustworthy product readiness**, not first possible payment capture.

A purchase path is not a release milestone if:

- active gameplay state can be lost;
- the production Android artifact is not reproducible;
- privacy/App Content declarations are incomplete;
- entitlement authority can be impersonated;
- refunds/revocations cannot be reconciled;
- sold content has unresolved commercial rights;
- players cannot obtain support for a failed purchase.

Agent 16's independent release audit identifies #566 — active player/mission/cargo state continuity across save/load — as a P0 release blocker. Although #566 is not monetization-owned, Agent 12 treats it as a prerequisite for commercial launch confidence: asking players to spend while the core current-session work loop can lose active state would create avoidable refund, review and trust risk.

---

# 14. Commercial Implementation Sequence

After the central orchestrator approves the canonical strategy, use this order unless later evidence changes it:

1. close or sequence the product/release P0s that block a trustworthy commercial candidate, including #566 and Agent 14 release gates;
2. approve privacy-safe analytics/event architecture without yet optimizing monetization;
3. define neutral entitlement and product contracts coordinated with #328 and #560;
4. define Google Play Billing architecture with Agent 14;
5. define support/refund/revocation/audit operations;
6. prepare a very small cosmetic + Early Supporter catalog with rights provenance;
7. implement purchase flow in an isolated monetization PR;
8. test pending/cancel/refund/reinstall/device/account cases;
9. complete exact release-candidate Play/privacy declarations;
10. enter internal/closed Play testing as permitted;
11. release real purchases only after the exact candidate is `RELEASE-READY`;
12. gather retention, conversion, ARPU/ARPDAU, refund and sentiment evidence;
13. consider rewarded ads only after the privacy/age/retention gates pass;
14. consider VIP only when genuine recurring value exists;
15. consider paid acquisition scaling only after conservative LTV/CAC evidence exists.

---

# 15. Explicitly Wait

The following must not be pulled forward merely because they could increase theoretical revenue:

- premium economic currency;
- progression boosters;
- paid Work Capacity / energy;
- paid profession or qualification bypass;
- loot boxes/gacha;
- paid productive vehicle statistics;
- paid production capacity;
- real-money marketplace settlement;
- player cash-out;
- crypto/token/NFT integration;
- real-money company shares/control;
- forced interstitial-heavy monetization;
- paid UA before retention/LTV evidence;
- subscription before recurring value exists;
- personalized ads before age/privacy/legal review.

---

# Canonical Gate Rule

**DROPi Tycoon monetization may enter production only when the exact commercial capability is fair, technically authoritative, purchase-reliable, legally/privacy reviewed, Google Play compliant, commercially supportable and attached to a release candidate whose core gameplay is trustworthy. Revenue opportunity never overrides those gates.**

---

End of Document
