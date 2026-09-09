# Document Information

Document: COMMERCIAL_ENTITLEMENT_CONTRACT.md
Project: DROPi Tycoon
Version: 1.0.0
Status: IMPLEMENTATION-READY TECHNICAL CONTRACT — NO PAYMENT PROVIDER IMPLEMENTATION
Owner Lane: DT-12 — Real-World Monetization / Business Model / Revenue Strategy
Baseline: `main` at `65413103c7ae4e1951ac63aacc8e1232643e0bd0`
Coordinates: #328, #560, #565, #569, #571
Companion: `00_Project/REAL_WORLD_MONETIZATION_V1_CATALOG.md`

---

# DROPi Tycoon — Commercial Entitlement Contract

## 1. Purpose

This document defines the neutral entitlement architecture that future real-money purchase infrastructure must use.

It exists so DT-14 can later integrate an approved store/payment provider without making the provider SDK the source of gameplay truth and without allowing a client callback to mutate account ownership directly.

This contract is provider-neutral.

It does **not**:

- add Google Play Billing;
- accept or verify a real payment;
- create a database migration;
- create an authenticated account system;
- add an analytics SDK;
- add an ad SDK;
- grant production entitlements;
- modify the player economy;
- modify Company Money;
- modify World Instance progression;
- define crypto/token/NFT ownership.

---

# 2. Core Authority Rule

The entitlement authority must follow this chain:

```text
store/provider evidence
        ↓
trusted verification adapter
        ↓
commercial entitlement authority
        ↓
read-only client entitlement projection
        ↓
presentation-only cosmetic consumers
```

The client UI must never be the permanent entitlement authority.

A successful purchase screen, callback, deep link, local receipt cache or client boolean is not sufficient evidence for a permanent entitlement grant.

Production commercial ownership requires trusted verification and durable idempotent state.

---

# 3. Domain Separation

Commercial entitlements are not gameplay economy state.

The commercial entitlement domain may answer:

- does this commercial subject own a cosmetic entitlement?;
- is the entitlement active, revoked, expired or suspended?;
- which verified commercial source produced the entitlement?;
- which content IDs may be projected from that entitlement?;
- when was ownership granted or revoked?;
- has the same source evidence already been processed?;
- can the entitlement be restored after reinstall/device change?

The commercial entitlement domain must not answer or mutate:

- how much Personal Money the player owns;
- how much Company Money a company owns;
- which jobs the hero can perform;
- qualification or profession state;
- Work Capacity;
- wages;
- mission settlement;
- inventory;
- production;
- cargo custody;
- vehicle ownership;
- company ownership;
- shares;
- world access;
- infrastructure power.

---

# 4. Subject Contract

## 4.1 Commercial subject

A production entitlement must belong to a durable authenticated commercial subject.

Conceptual type:

```text
CommercialSubjectId
```

The preferred future production binding is an authenticated account identity.

Until #560 is resolved, durable production account-backed commercial entitlements remain blocked.

The current unauthenticated public-profile authority must never be used as commercial ownership authority.

## 4.2 No hero-only ownership

Commercial ownership must not be keyed only by `heroActorId` because:

- heroes are World Instance-scoped;
- the same account may participate in multiple World Instances;
- cosmetics are intended to remain account-level presentation state;
- a hero identity must not become a hidden payment identity.

## 4.3 No World Instance ownership key

Commercial entitlements must not be stored as a World Instance economic property.

A World Instance may project eligible account cosmetics, but it must not own the commercial purchase.

---

# 5. Product and Entitlement Identity

## 5.1 Product ID

Conceptual type:

```text
CommercialProductId
```

Product IDs come from the canonical commercial catalog.

They identify what was sold, not what a store provider happened to call it.

## 5.2 Entitlement ID

Conceptual type:

```text
CommercialEntitlementId
```

An entitlement is an atomic owned commercial capability.

A product may grant one or multiple entitlement IDs.

## 5.3 External provider product ID

Conceptual type:

```text
ExternalStoreProductId
```

This identifier belongs to the provider adapter and must be mapped to an internal `CommercialProductId`.

External IDs are never allowed to directly select gameplay behavior.

---

# 6. Commercial Product Definition

Conceptual schema:

```text
CommercialProductDefinition
  catalogVersion: string
  productId: CommercialProductId
  productType: NON_CONSUMABLE | SUBSCRIPTION | CONSUMABLE
  entitlementIds: CommercialEntitlementId[]
  economicEffect: NONE
  worldPowerEffect: NONE
  availabilityState: CatalogAvailabilityState
```

For V1:

- every product is `NON_CONSUMABLE`;
- `CONSUMABLE` is not used;
- `SUBSCRIPTION` is not used;
- `economicEffect` must equal `NONE`;
- `worldPowerEffect` must equal `NONE`.

A future implementation should reject V1 configuration that violates these invariants.

---

# 7. Entitlement Definition

Conceptual schema:

```text
CommercialEntitlementDefinition
  entitlementId: CommercialEntitlementId
  scope: ACCOUNT_PRESENTATION_ONLY
  family: SUPPORTER | PROFILE_COSMETIC | PHONE_COSMETIC | VEHICLE_COSMETIC
  economicEffect: NONE
  worldPowerEffect: NONE
  contentBindingRequired: boolean
```

Allowed V1 scope:

`ACCOUNT_PRESENTATION_ONLY`

Not allowed:

- `WORLD_ECONOMIC`
- `PLAYER_ECONOMIC`
- `COMPANY_ECONOMIC`
- `CAPABILITY`
- `QUALIFICATION`
- `MISSION_ADVANTAGE`
- `PRODUCTION_ADVANTAGE`
- `MARKET_ADVANTAGE`

Any entitlement definition attempting to use one of those prohibited scopes must fail validation.

---

# 8. Entitlement Record

A durable entitlement record should conceptually contain:

```text
CommercialEntitlementRecord
  entitlementRecordId
  subjectId
  entitlementId
  status
  sourceType
  sourceEvidenceId
  sourceProductId
  grantedAt
  revokedAt?
  expiresAt?
  revision
  lastVerifiedAt
```

For V1 non-consumables, `expiresAt` is normally absent.

The record must not contain:

- plaintext payment secrets;
- private signing material;
- complete unnecessary payment-card information;
- Personal Money;
- Company Money;
- World Instance economic state.

---

# 9. Entitlement Status State Machine

Canonical entitlement statuses:

- `PENDING_VERIFICATION`
- `ACTIVE`
- `REVOKED`
- `SUSPENDED`
- `EXPIRED`

V1 normally uses:

`PENDING_VERIFICATION -> ACTIVE -> REVOKED`

`EXPIRED` is reserved for future time-bounded/subscription entitlements.

`SUSPENDED` is reserved for exceptional fraud/security/legal/support situations where ownership projection must temporarily stop while the authoritative commercial record remains auditable.

## 9.1 Pending verification

No permanent commercial cosmetic may be projected as owned from a merely pending record.

A UI may show a non-authoritative `purchase pending` state if DT-14 later defines such behavior.

## 9.2 Active

Only an `ACTIVE` entitlement may be projected as owned.

## 9.3 Revoked

A revoked entitlement must stop granting its commercial cosmetic access after the client receives authoritative state.

Revocation must not erase audit history.

## 9.4 Suspended

Suspension is not a normal refund flow.

It must require a reason and audit record.

---

# 10. Source Evidence Contract

The future provider adapter must translate provider-specific evidence into a neutral verification result.

Conceptual schema:

```text
VerifiedCommercialEvidence
  provider
  evidenceId
  externalProductId
  mappedProductId
  subjectBinding
  state
  verifiedAt
  rawEvidenceReference?
```

Allowed neutral evidence states:

- `VERIFIED_OWNED`
- `PENDING`
- `CANCELLED`
- `REFUNDED`
- `REVOKED`
- `INVALID`

The raw provider payload should not be copied indiscriminately into gameplay state.

Store only the minimum information required for verification, fraud prevention, support, legal/accounting obligations and reliable restoration, subject to DT-13 review.

---

# 11. Exactly-Once Processing

Commercial evidence must be idempotent.

The same verified evidence processed repeatedly must converge to the same entitlement state.

Required invariant:

```text
same evidenceId + same product mapping + same subject
=> no duplicate grant
```

Duplicate callbacks, retries, application restarts or backend redelivery must not create duplicate ownership records.

V1 products are non-consumable, so duplicate processing must be especially simple: repeated valid ownership evidence means the entitlement remains active, not multiplied.

---

# 12. Product-to-Entitlement Grant Contract

A verified product does not directly toggle arbitrary feature flags.

The authority must resolve:

```text
verified product
  -> canonical CommercialProductDefinition
  -> entitlementIds[]
  -> idempotent entitlement grants
```

V1 mapping:

## Early Supporter Pack

`commercial.product.supporter.early.v1`

maps to:

- `commercial.entitlement.account.supporter.early_badge.v1`
- `commercial.entitlement.account.cosmetic.profile_frame.early_supporter.v1`
- `commercial.entitlement.account.cosmetic.phone_theme.early_supporter.v1`
- `commercial.entitlement.account.cosmetic.vehicle_livery.early_supporter.v1`

## Phone Theme Pack 01

`commercial.product.cosmetic.phone_theme_pack_01.v1`

maps to:

- `commercial.entitlement.account.cosmetic.phone_theme.pack_01.v1`

## Vehicle Livery Pack 01

`commercial.product.cosmetic.vehicle_livery_pack_01.v1`

maps to:

- `commercial.entitlement.account.cosmetic.vehicle_livery.pack_01.v1`

No V1 product maps to an economic or progression entitlement.

---

# 13. Content Projection Contract

Commercial ownership and runtime content are separate concepts.

The client should receive a safe projection such as:

```text
CommercialEntitlementProjection
  entitlementId
  active
  contentIds[]
```

The runtime may then allow a cosmetic selector to use approved `contentIds`.

The entitlement service must not directly mutate Phaser world/economy state.

## 13.1 Vehicle livery projection

A livery entitlement may make a cosmetic appearance available to a legitimately owned/usable vehicle.

It must not:

- create a vehicle;
- change vehicle class;
- change stats;
- change route access;
- change cargo capacity.

## 13.2 Phone theme projection

A phone-theme entitlement may expose a theme to presentation code.

It must not:

- grant hidden market data;
- grant mission intelligence unavailable to free players;
- automate profitable decisions;
- shorten qualification or work flows;
- alter economic state.

## 13.3 Supporter/profile projection

A supporter badge/profile frame is presentation identity only.

It must not cause:

- higher wages;
- NPC economic preference;
- better mission access;
- company reputation gain;
- multiplayer priority.

---

# 14. World Instance Boundary

Commercial account presentation may cross World Instance boundaries.

World Instance economic power may not.

Required invariant:

```text
account commercial entitlements
  may project cosmetics
  must not import economic state
```

Creating a fresh World Instance must still create a fresh world-local economic journey according to canonical world rules.

The entitlement service must not import:

- mature-world money;
- inventory;
- productive vehicles;
- company ownership;
- shares;
- qualifications;
- world reputation/economic influence;
- infrastructure;
- mission completion;
- cargo.

---

# 15. Restore Contract

Permanent non-consumables require restoration after legitimate reinstall/device change/account recovery.

A restore operation should conceptually:

1. establish an authenticated commercial subject;
2. query/revalidate trusted ownership evidence;
3. map external products to canonical internal product IDs;
4. rebuild the expected entitlement set idempotently;
5. revoke stale entitlements where authoritative evidence says ownership is no longer valid;
6. return a safe client projection.

Restore must not rely only on an old local save boolean.

Restore must not duplicate grants.

---

# 16. Refund and Revocation Contract

A refunded/revoked non-consumable must reconcile back to entitlement authority.

Required behavior:

- provider evidence becomes authoritative input through the future verification adapter;
- affected entitlement records transition to `REVOKED` when the product no longer authorizes ownership;
- audit history is retained;
- client projection eventually removes paid cosmetic access;
- gameplay economic state is never used as compensation or punishment;
- any support exception requires a separately audited commercial support action.

The exact provider APIs and timing belong to DT-14's future implementation.

---

# 17. Offline Behavior

Offline play remains important, but offline mode must not become an ownership forgery path.

For already verified non-consumable cosmetics, a future client may cache a last-known entitlement projection for offline presentation.

The cache is:

- a projection, not authority;
- safe only for already verified non-economic cosmetics;
- unable to grant a newly purchased entitlement without trusted verification;
- unable to mutate economic state;
- replaceable by authoritative state after reconnect.

If the cache is corrupt or unknown, fail closed for paid ownership rather than inventing access.

Core gameplay must remain playable without a commercial entitlement service where canonical offline play permits it.

---

# 18. Local Save Boundary

Commercial entitlement ownership must not be serialized as an authoritative permanent boolean inside ordinary Save v2.

A save may store harmless presentation preferences such as:

- selected theme ID;
- selected livery ID;
- selected frame ID;

but entitlement validity must be checked against the entitlement projection before those selections are applied.

A copied or edited save must not manufacture commercial ownership.

This contract deliberately does not take ownership of #566 or the Save schema.

---

# 19. Account Change and Device Change

Future implementation must define deterministic behavior for:

- sign-out;
- sign-in as a different account;
- reinstall;
- new Android device;
- account recovery;
- multiple devices using the same valid account;
- stale local entitlement cache from a previous account.

Minimum rule:

A new commercial subject must never inherit the previous subject's cached entitlements merely because the device is the same.

On subject change, client entitlement projection must be cleared before the new subject's authoritative entitlements are loaded.

---

# 20. Administrative/Support Adjustment Contract

If future customer support requires a manual entitlement correction, it must use a dedicated audited command rather than database editing or gameplay-state manipulation.

Conceptual command:

```text
AdjustCommercialEntitlement
  commandId
  subjectId
  entitlementId
  action: GRANT | REVOKE
  reasonCode
  operatorReference
```

Requirements:

- authenticated privileged operator;
- explicit reason;
- idempotent command ID;
- immutable audit history;
- no Personal Money/Company Money mutation;
- no hidden permanent override without provenance.

This is a contract only; no admin endpoint is authorized here.

---

# 21. Audit Trail Contract

Future entitlement authority must preserve enough history to answer:

- what product was verified?;
- which subject owned it?;
- which entitlements were granted?;
- which evidence caused the grant?;
- was the same evidence retried?;
- was ownership restored?;
- was the product refunded/revoked?;
- when did the projection change?;
- was a support adjustment applied?;
- why was an entitlement suspended or revoked?

The audit trail must not expose payment secrets to ordinary client APIs.

Retention and deletion rules require DT-13/legal review.

---

# 22. Privacy and Data-Minimization Boundary

The entitlement system should collect only data required for:

- ownership verification;
- restoration;
- refund/revocation reconciliation;
- fraud/security;
- customer support;
- required accounting/legal obligations.

Do not collect unrelated device/profile data merely because a provider SDK exposes it.

Commercial entitlement data must remain separate from public profile data.

Before production activation:

- privacy policy must describe actual behavior;
- Data Safety declarations must match actual data flows;
- retention/deletion handling must be documented;
- account deletion behavior must distinguish ordinary game/profile deletion from legally required purchase/accounting retention where applicable.

DT-13 owns legal/privacy interpretation.

---

# 23. Security Boundary

Commercial ownership is high-trust state.

Future implementation must defend against at least:

- client-forged product IDs;
- client-forged entitlement IDs;
- impersonated account/subject IDs;
- replayed provider evidence;
- duplicate callbacks;
- stale refunded ownership;
- cross-account cache leakage;
- unauthorized admin adjustments;
- enumeration of private purchase history;
- secrets in logs;
- secrets in Save v2;
- trusting unauthenticated `/api/authority/*` profile commands as commercial identity.

#560 remains an explicit blocker before durable account-backed production entitlements.

---

# 24. Failure Contract

Commercial failure must fail closed without breaking core gameplay.

Examples:

## Verification unavailable

- do not mint entitlement;
- show pending/retry state when appropriate;
- do not remove already verified permanent cosmetics solely because a transient network request failed if an approved cached projection exists;
- core game remains usable.

## Unknown product

- do not grant anything;
- record diagnostic evidence without secrets;
- surface support-safe error.

## Unknown entitlement mapping

- fail the grant atomically;
- do not partially grant a malformed bundle unless future implementation has an explicit transaction/reconciliation design.

## Refund/revocation sync delayed

- reconcile on next authoritative verification;
- preserve audit history;
- do not mutate gameplay economy.

---

# 25. Transaction Boundary

For a product that grants multiple entitlements, grant semantics should be atomic at the commercial-domain level.

For example, Early Supporter Pack should not end in a permanent half-granted state such as badge active but phone/livery ownership missing because one internal write failed.

Recommended conceptual rule:

```text
one verified source product
=> one idempotent commercial fulfillment transaction
=> complete expected entitlement set
```

If partial persistence occurs, reconciliation must converge to the complete canonical set rather than duplicating grants.

---

# 26. Catalog and Entitlement Validation Rules

A future implementation should include startup/build-time validation that rejects:

- duplicate product IDs;
- duplicate entitlement IDs;
- unknown entitlement references;
- V1 consumable products;
- V1 subscriptions;
- economic-effect values other than `NONE`;
- world-power values other than `NONE`;
- prohibited entitlement scope;
- product definitions with zero entitlements;
- external store mapping to an unknown internal product;
- two materially different products reusing one internal product ID.

---

# 27. Required Future Automated Tests

The implementation PR that materializes this contract should prove at minimum:

1. identical verified evidence processed twice grants once;
2. duplicate callbacks remain idempotent;
3. unknown product grants nothing;
4. unknown entitlement mapping fails closed;
5. Early Supporter Pack grants exactly four expected entitlements;
6. Phone Theme Pack grants exactly its phone-theme entitlement;
7. Vehicle Livery Pack grants exactly its livery entitlement;
8. refund/revocation removes active projection without deleting audit history;
9. restore after clean local state rebuilds legitimate entitlements;
10. stale cache from account A is never exposed to account B;
11. fresh World Instance receives no economic benefit from account cosmetics;
12. livery entitlement cannot grant a vehicle;
13. phone-theme entitlement cannot grant market/gameplay intelligence;
14. supporter entitlement cannot change wage/mission/reputation logic;
15. local save editing cannot forge entitlement ownership;
16. transient network failure does not break core offline gameplay;
17. malformed catalog fails validation;
18. retired product ownership remains restorable;
19. support adjustment is audited and idempotent;
20. client APIs expose no provider/payment secrets.

---

# 28. Implementation Layering

Recommended future code ownership split:

```text
commercial/catalog
  product definitions
  entitlement definitions
  validation

commercial/domain
  entitlement aggregate
  grant/revoke/reconcile rules
  idempotency

commercial/provider
  provider-neutral verification port
  future Google Play adapter owned/coordinated by DT-14

commercial/projection
  safe client DTOs
  no payment secrets

ui/cosmetics
  consumes read-only entitlement projection
  presentation only
```

Do not put billing SDK calls inside economy, mission, profession, production or vehicle-performance modules.

---

# 29. Provider Port

The entitlement domain should depend on a narrow provider-neutral port rather than a Google-specific object graph.

Conceptual interface:

```text
CommercialOwnershipVerificationPort
  verifyEvidence(...)
  restoreOwnership(...)
  refreshOwnership(...)
```

The port returns neutral verified evidence.

DT-14 may later implement the Google Play adapter according to then-current policy and APIs.

DT-12 retains the rule that verified provider ownership maps only to approved non-pay-to-win commercial entitlements.

---

# 30. Client Projection Port

Gameplay/presentation code should consume a read-only interface such as:

```text
CommercialEntitlementView
  has(entitlementId): boolean
  listActive(): CommercialEntitlementId[]
  contentFor(entitlementId): RuntimeContentId[]
```

This view must not expose:

- purchase tokens;
- order IDs unless required for a support-only surface;
- raw receipts;
- provider secrets;
- private account fields.

Presentation code must not be able to grant or revoke entitlements through this read port.

---

# 31. Current V1 Production Gate

This contract is implementation-ready but production commercial activation remains blocked.

At minimum, production sale requires the relevant gates from `REAL_WORLD_MONETIZATION_RELEASE_GATES.md`, including:

- authenticated durable authority / #560 when account-backed ownership is used;
- commercial rights/provenance / #565;
- exact privacy/Data Safety/App Content release consistency / #569;
- Play Console, signing, testing and production-access state / #571;
- DT-14-approved provider integration;
- purchase restore/refund/revocation validation;
- customer-support readiness;
- trustworthy release candidate.

No line in this document overrides those blockers.

---

# 32. Explicit Non-Goals

This contract does not authorize:

- Google Play Billing code;
- Stripe or alternate checkout;
- payment steering;
- ads;
- rewarded ads;
- subscription/VIP billing;
- paid currency;
- boosters;
- consumables;
- loot boxes;
- gambling;
- NFT ownership;
- blockchain wallet;
- player cash-out;
- real-money shares/company control;
- paid economic advantages.

---

# Canonical Entitlement Decision

DROPi Tycoon commercial ownership must be represented by a separate, durable, idempotent, account-presentation-only entitlement domain.

The authority model is:

**verified store ownership -> canonical product -> atomic entitlement set -> read-only cosmetic projection**.

It must never become:

**client purchase callback -> gameplay power**.

V1 proves permanent cosmetic/supporter ownership only. Billing/provider integration remains a later DT-14-coordinated implementation after release, security, legal/privacy and commercial-rights gates permit it.