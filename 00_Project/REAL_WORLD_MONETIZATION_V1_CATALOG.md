# Document Information

Document: REAL_WORLD_MONETIZATION_V1_CATALOG.md
Project: DROPi Tycoon
Version: 1.0.0
Status: IMPLEMENTATION-READY COMMERCIAL CONTRACT — PRODUCTION SALES DISABLED
Owner Lane: DT-12 — Real-World Monetization / Business Model / Revenue Strategy
Baseline: `main` at `65413103c7ae4e1951ac63aacc8e1232643e0bd0`
Coordinates: #328, #560, #565, #569, #571

---

# DROPi Tycoon — V1 Commercial Catalog

## 1. Purpose

This document defines the first implementation-ready real-world commercial catalog for DROPi Tycoon.

It converts the strategy in `00_Project/REAL_WORLD_MONETIZATION_STRATEGY.md` and the release controls in `00_Project/REAL_WORLD_MONETIZATION_RELEASE_GATES.md` into a small, deterministic product catalog that future purchase infrastructure can consume.

This document does **not**:

- enable Google Play Billing;
- create Play Console products;
- accept real payments;
- install a billing, analytics or advertising SDK;
- grant any entitlement in production;
- create cosmetic art assets;
- claim that any catalog cosmetic is already visible in the game;
- define Personal Money or Company Money;
- define a premium economic currency;
- authorize blockchain, token, NFT, cash-out or real-money player trading.

The canonical rule remains:

> **GAME FIRST. MONETIZATION SUPPORTS THE GAME.**

All V1 products are non-economic and must remain incapable of changing World Instance economic power.

---

# 2. Current Commercial State

At this baseline:

- historical monetization PR #572 is merged and canonical;
- there is no production Play Billing implementation;
- there is no production ad SDK;
- there is no production commercial analytics SDK;
- #560 remains open and blocks durable account-backed production entitlements until authenticated authority exists;
- #328 defines the neutral future account/profile/VIP entitlement boundary;
- #565 remains the commercial rights/provenance gate for shipped and sold assets/data;
- Google Play and legal/privacy release gates remain external dependencies.

Therefore the catalog state is:

`IMPLEMENTATION_READY_CONTRACT`

and the production availability state is:

`SELLABLE = false`

No product in this document may be interpreted as a currently purchasable product.

---

# 3. Catalog Design Rules

## 3.1 Small first catalog

V1 contains exactly three planned one-time products.

The first commercial implementation should prove:

- correct product identity;
- correct entitlement mapping;
- exactly-once grant behavior;
- restore behavior;
- refund/revocation behavior;
- supportability;
- non-pay-to-win isolation.

It should not launch with dozens of SKUs.

## 3.2 No consumables in V1

V1 defines no consumable products.

There is no paid currency, coin package, booster, energy refill, skip, retry token, fuel pack, inventory pack or economic resource pack.

## 3.3 No subscription in V1

VIP/subscription remains later-stage because recurring billing requires genuine recurring value and additional legal/Play review.

V1 is deliberately limited to permanent non-consumable ownership.

## 3.4 No gameplay power

Every entitlement granted by V1 must have:

`economicEffect = NONE`

and:

`worldPowerEffect = NONE`

A V1 product must never alter:

- Personal Money;
- Company Money;
- wages;
- mission payouts;
- mission success probability;
- Work Capacity;
- qualification or training progress;
- vehicle performance;
- vehicle cargo capacity;
- fuel consumption;
- maintenance cost;
- route access;
- production capacity;
- inventory capacity;
- customer demand;
- company reputation values used for economic access;
- shares or company control;
- World Instance ownership or infrastructure power.

---

# 4. Identifier Contract

## 4.1 Internal product IDs

Internal product IDs are stable project identifiers and must never be reused for a different meaning.

Pattern:

`commercial.product.<family>.<name>.v<major>`

V1 product IDs:

1. `commercial.product.supporter.early.v1`
2. `commercial.product.cosmetic.phone_theme_pack_01.v1`
3. `commercial.product.cosmetic.vehicle_livery_pack_01.v1`

These IDs are repository/domain identifiers, not proof of Google Play product IDs.

## 4.2 Entitlement IDs

Entitlement IDs represent atomic owned capabilities or cosmetic access.

Pattern:

`commercial.entitlement.<scope>.<family>.<name>.v<major>`

V1 entitlement IDs:

- `commercial.entitlement.account.supporter.early_badge.v1`
- `commercial.entitlement.account.cosmetic.profile_frame.early_supporter.v1`
- `commercial.entitlement.account.cosmetic.phone_theme.early_supporter.v1`
- `commercial.entitlement.account.cosmetic.vehicle_livery.early_supporter.v1`
- `commercial.entitlement.account.cosmetic.phone_theme.pack_01.v1`
- `commercial.entitlement.account.cosmetic.vehicle_livery.pack_01.v1`

The IDs above define entitlement slots. They do not assert that final production art assets already exist.

A runtime asset binding may only be added after the corresponding asset has passed project asset governance and commercial-rights/provenance review.

## 4.3 External store IDs

Future store-specific IDs must be mapped through configuration rather than replacing internal IDs.

The runtime must not assume that an internal product ID is identical to a Google Play product ID.

Recommended conceptual mapping:

`internalProductId -> storeProvider -> externalProductId`

Store-specific IDs, localized prices, offer configuration and eligibility belong to future release implementation, not this catalog document.

---

# 5. V1 Product Catalog

## 5.1 Product A — Early Supporter Pack

### Identity

Internal product ID:

`commercial.product.supporter.early.v1`

Product type:

`NON_CONSUMABLE`

Commercial role:

Primary first-purchase / project-support product.

### Recommended display name

`Early Supporter Pack`

Do not use `Founder Pack` because `Founder` already has a distinct in-game company meaning.

### Reference price target

EUR reference target:

`€9.99`

This is a commercial planning target only.

The actual store price must come from the store/provider product configuration and lawful localized pricing. The game must never hardcode `€9.99` as authoritative purchase price.

### Atomic entitlement bundle

The product grants exactly these entitlement IDs once verified by future purchase authority:

- `commercial.entitlement.account.supporter.early_badge.v1`
- `commercial.entitlement.account.cosmetic.profile_frame.early_supporter.v1`
- `commercial.entitlement.account.cosmetic.phone_theme.early_supporter.v1`
- `commercial.entitlement.account.cosmetic.vehicle_livery.early_supporter.v1`

### Intended player value

- permanent supporter recognition;
- profile presentation customization;
- smartphone presentation customization;
- one vehicle visual customization family.

### Explicit exclusions

The Early Supporter Pack does not grant:

- Personal Money;
- Company Money;
- XP/mastery;
- qualification progress;
- Work Capacity;
- mission reward modifiers;
- faster vehicles;
- increased cargo capacity;
- production/inventory advantages;
- exclusive economic routes;
- company shares;
- World Instance priority;
- ad-free state unless a later product definition explicitly adds such an entitlement after ads exist.

### Readiness state

Contract: `IMPLEMENTATION_READY`

Production sale: `DISABLED`

Content binding: `PENDING_APPROVED_ASSETS`

Authority: `BLOCKED_BY_AUTH/ENTITLEMENT_IMPLEMENTATION`

Commercial rights: `BLOCKED_UNTIL_ASSET_BINDINGS_PASS_#565`

---

## 5.2 Product B — Phone Theme Pack 01

### Identity

Internal product ID:

`commercial.product.cosmetic.phone_theme_pack_01.v1`

Product type:

`NON_CONSUMABLE`

Commercial role:

Low-price presentation-only cosmetic purchase.

### Recommended display name

`Phone Theme Pack 01`

The final marketing/display name may change when actual approved themes exist. The internal product ID must not be repurposed.

### Reference price target

EUR reference target:

`€2.99`

Again, this is a planning target, not a hardcoded runtime price.

### Atomic entitlement bundle

- `commercial.entitlement.account.cosmetic.phone_theme.pack_01.v1`

The entitlement may later unlock multiple approved theme assets through one content bundle manifest.

### Fairness constraints

A paid phone theme may change only presentation such as:

- color treatment;
- wallpaper;
- decorative icon treatment;
- non-functional visual chrome;
- presentation animation that does not obscure required information.

It must not reveal hidden information, improve route planning, expose market data unavailable to free players, shorten input flows in a competitively meaningful way or automate economic decisions.

### Readiness state

Contract: `IMPLEMENTATION_READY`

Production sale: `DISABLED`

Content binding: `PENDING_APPROVED_ASSETS`

---

## 5.3 Product C — Vehicle Livery Pack 01

### Identity

Internal product ID:

`commercial.product.cosmetic.vehicle_livery_pack_01.v1`

Product type:

`NON_CONSUMABLE`

Commercial role:

Vehicle appearance customization without any vehicle-stat impact.

### Recommended display name

`Vehicle Livery Pack 01`

Final marketing/display name follows actual approved art.

### Reference price target

EUR reference target:

`€4.99`

This remains a planning target only.

### Atomic entitlement bundle

- `commercial.entitlement.account.cosmetic.vehicle_livery.pack_01.v1`

The entitlement may unlock one or more approved livery assets through a later content manifest.

### Hard gameplay invariants

A paid livery must not modify:

- speed;
- acceleration;
- braking;
- handling;
- collision shape;
- cargo capacity;
- vehicle class;
- route permissions;
- fuel/energy use;
- maintenance;
- breakdown probability;
- insurance;
- mission eligibility;
- NPC/customer reaction in a way that changes economic outcomes.

### Readiness state

Contract: `IMPLEMENTATION_READY`

Production sale: `DISABLED`

Content binding: `PENDING_APPROVED_ASSETS`

---

# 6. Catalog Manifest Contract

Future implementation should represent the catalog as deterministic data rather than scattered conditionals.

Conceptual product record:

```text
CommercialProductDefinition
  catalogVersion
  productId
  productType
  displayNameKey
  descriptionKey
  entitlementIds[]
  storeMappings{}
  availabilityState
  economicEffect
  worldPowerEffect
  contentReadiness
  legalReadiness
```

Required V1 values:

- `catalogVersion = commercial-v1`
- `productType = NON_CONSUMABLE`
- `economicEffect = NONE`
- `worldPowerEffect = NONE`
- `availabilityState = DISABLED` until release gates are satisfied.

The catalog must fail closed if an unknown product ID or entitlement ID is encountered.

---

# 7. Catalog Versioning Rules

## 7.1 Immutable meaning

Once a product ID is used in a real store, its meaning must never be silently changed.

Do not reuse an old product ID to sell a different bundle.

## 7.2 Retired products remain restorable

A product may become:

`RETIRED_FOR_NEW_SALES`

while its existing owners continue to restore and use valid entitlements.

Retirement must not orphan legitimate owners.

## 7.3 Bundle evolution

Do not remove already-promised permanent entitlements from an owned non-consumable product.

If a materially different bundle is needed, create a new product major version.

## 7.4 Display names are mutable; IDs are not

Localization, store copy and approved marketing names may evolve.

Internal identity and entitlement semantics must remain stable.

---

# 8. Price Contract

Price is store authority, not game authority.

The V1 reference targets are:

| Internal product | EUR planning target |
|---|---:|
| `commercial.product.supporter.early.v1` | €9.99 |
| `commercial.product.cosmetic.phone_theme_pack_01.v1` | €2.99 |
| `commercial.product.cosmetic.vehicle_livery_pack_01.v1` | €4.99 |

Rules:

1. do not hardcode numeric store prices in gameplay logic;
2. display price only from trusted current store/product metadata when real commerce exists;
3. support lawful regional/localized pricing;
4. no fake discounts;
5. no false countdowns;
6. no hidden recurring charge;
7. no subscription semantics for these V1 products;
8. no dynamic price discrimination using sensitive personal attributes.

---

# 9. Ownership Scope

All V1 entitlements are intended to be:

`ACCOUNT_PRESENTATION_ONLY`

They are not World Instance economic state.

When a player creates or enters a fresh World Instance, owned cosmetic presentation may be available, but the entitlement must never import:

- money;
- inventory;
- vehicles as productive assets;
- company ownership;
- shares;
- infrastructure;
- qualifications;
- reputation/economic influence;
- mission completion;
- cargo;
- productive progression.

A livery entitlement means permission to apply an appearance to an otherwise legitimately owned/usable vehicle. It does not grant the vehicle itself.

A phone-theme entitlement means presentation access to the phone UI. It does not grant the smartphone if gameplay rules say the player does not have access to one.

---

# 10. Content Binding Rules

Commercial product definitions must remain separate from art asset files.

A future content binding record should map:

`entitlementId -> approvedRuntimeContentIds[]`

A binding becomes production-eligible only when:

- the asset exists;
- provenance is recorded;
- commercial rights are cleared;
- required attribution/notice handling is complete;
- runtime adoption is approved under project asset governance;
- Android presentation is tested where visible;
- the content does not alter gameplay power.

If an asset is removed for legal/safety reasons, the owner must receive a non-deceptive replacement or another consumer-support resolution approved by the relevant legal/Play owners. Do not silently remove paid value.

---

# 11. Catalog Availability State Machine

Each product should have one of these catalog states:

- `DEFINED`
- `CONTENT_PENDING`
- `IMPLEMENTATION_READY`
- `TEST_ONLY`
- `SELLABLE`
- `SUSPENDED`
- `RETIRED_FOR_NEW_SALES`

Current V1 state:

- commercial definitions: `IMPLEMENTATION_READY`
- content: `CONTENT_PENDING`
- real purchase infrastructure: not implemented
- production sales: not authorized

The catalog must not transition to `SELLABLE` solely because art is ready.

All release, authority, purchase-reliability, Play and compliance gates still apply.

---

# 12. Store Copy Guardrails

Future store/product descriptions must state only what the player actually receives.

Acceptable pattern:

`Permanent cosmetic/supporter items. No gameplay or economic advantage.`

Prohibited claims include:

- `earn more`;
- `progress faster`;
- `exclusive profitable routes`;
- `priority missions`;
- `better vehicle performance`;
- `economic boost`;
- `guaranteed success`;
- any roadmap-only feature presented as included current functionality.

No product may use artificial scarcity or a fake deadline.

If Early Supporter availability is ever time-limited, the deadline must be real, documented, consistently enforced and legally/Play reviewed. The default V1 contract does not require a time limit.

---

# 13. Customer-Support Contract

Every V1 product must be supportable.

A support operator must eventually be able to determine, without exposing secrets:

- internal product ID;
- entitlement IDs expected from that product;
- current entitlement status;
- verification status;
- grant/revocation history;
- whether the product is retired;
- whether a content binding is unavailable;
- whether a restore attempt succeeded or failed.

Support must never manually edit Personal Money or Company Money as compensation for a purchase problem unless a separately governed gameplay support policy explicitly authorizes such an action. Commercial entitlement remediation should remain in the commercial entitlement domain.

---

# 14. V1 Explicit Exclusions

V1 contains no:

- paid currency;
- paid resource;
- paid boost;
- paid Work Capacity;
- paid qualification;
- paid training skip;
- paid mission success;
- paid mission retry advantage;
- paid cargo capacity;
- paid vehicle-stat upgrade;
- paid company ownership;
- paid shares;
- paid economic reputation;
- paid route privilege;
- subscription;
- loot box;
- random paid reward;
- ad-removal SKU;
- rewarded-ad SKU;
- NFT;
- token;
- blockchain item;
- real-money marketplace item;
- cash-out capability.

Ad removal is intentionally excluded because no advertising system currently exists.

---

# 15. Implementation Dependencies

The catalog contract may be implemented as data before production commerce, but real sale remains blocked until the relevant external owners close their gates.

Key dependencies:

- #328 — neutral account/profile/VIP representation;
- #560 — authenticated durable authority before account-backed commercial ownership;
- #565 — rights/provenance for sold cosmetic content;
- #569 — exact release privacy/Data Safety/App Content declarations;
- #571 — Play Console/signing/testing/production access;
- DT-14 — future Play Billing architecture and provider integration;
- DT-13 — legal/privacy/consumer/IP review;
- DT-15 — truthful product/store creative and copy;
- asset governance — approved production cosmetic content.

This document does not transfer ownership of those dependencies to DT-12.

---

# 16. Acceptance Criteria for a Future Catalog Implementation PR

A future code/data implementation based on this contract must prove:

1. all three internal product IDs are stable and unique;
2. all entitlement IDs are stable and unique;
3. all V1 products are non-consumable;
4. no product maps to an economy/progression entitlement;
5. unknown products fail closed;
6. product-to-entitlement mapping is deterministic;
7. catalog version is explicit;
8. store price is not hardcoded as commercial authority;
9. retired products can still be restored for legitimate owners;
10. World Instance creation/import does not gain economic power from account entitlements;
11. a livery entitlement cannot grant a vehicle;
12. a phone-theme entitlement cannot grant gameplay information or economic automation;
13. content binding is blocked until approved assets exist;
14. production sale remains disabled without entitlement verification and release gates.

---

# Canonical V1 Catalog Decision

The first DROPi Tycoon commercial catalog is intentionally small and non-economic:

1. **Early Supporter Pack** — one-time permanent supporter/cosmetic bundle;
2. **Phone Theme Pack 01** — one-time presentation-only phone customization;
3. **Vehicle Livery Pack 01** — one-time appearance-only vehicle customization.

All three are defined for implementation but are **not authorized for real sale yet**.

The purpose of V1 is to prove trustworthy ownership and fair cosmetic value before the project attempts subscriptions, advertising or any larger commercial catalog.