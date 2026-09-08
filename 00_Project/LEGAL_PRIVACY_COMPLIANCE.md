# DROPi Tycoon — Legal, Privacy & Compliance Dossier

Version: 1.0.0  
Status: CANONICAL COMPLIANCE BASELINE — **DRAFT FOR PROFESSIONAL LEGAL REVIEW BEFORE COMMERCIAL LAUNCH**  
Audit date: 2026-09-08  
Audit baseline: `main` at `8e340b7131c4bdc890c38ba34e88d94858897cb3`  
Owner lane: Agent 13 — Legal / Privacy / Compliance / Intellectual Property  
Coordinates: #328, #330, #335, #348, #363, #409, #411, #412, #560, #562, #564, #565

---

## 1. Purpose and boundary

This document is the canonical engineering compliance baseline for the real-world commercial operation and distribution of DROPi Tycoon.

It covers:

- privacy and GDPR readiness;
- Google Play policy dependencies;
- accounts, profiles and deletion;
- minors and age strategy;
- multiplayer, chat and user-generated content;
- advertising, analytics and purchases;
- security/privacy by design;
- intellectual property, trademarks and third-party licensing;
- source/data provenance;
- release evidence and professional legal-review gates.

It does **not** implement or interpret fictional in-game law. It is not legal advice and is not a substitute for qualified counsel. Jurisdiction-specific conclusions, final consumer contracts, trademark clearance, child-safety obligations and material licensing questions must be reviewed professionally before commercial launch.

The future DROPi token/crypto project is out of scope. Any future blockchain, wallet, crypto-payment, NFT or token-reward integration requires a separate financial/regulatory review before implementation.

---

## 2. Audit snapshot — 2026-09-08

### 2.1 Repository and production state reviewed

The audit reviewed the latest `main`, the latest merged-PR stream, current open PRs and active `agent/*` branches as of the audit date.

Relevant active work includes:

- #545 World Instance B2 durable PostgreSQL persistence;
- #548 player economy / employee-first identity-adjacent state;
- #549 CI/Railway production hardening;
- #555 personal capability/professions;
- #556 production/supply chain;
- #557 narrative;
- active world/locality, Brăila visual and visual-storytelling branches.

The current production Railway service is sourced from `caliofmarian-ai/DROPi-Tycoon`, branch `main`, root `/game-web`, and uses the normal `npm run build` / `npm run start` path. At audit time no Railway service variable selected a PostgreSQL authority store, so the server defaults to the session authority registry.

### 2.2 Current account/profile authority boundary

Current `game-web/server/server.mjs` exposes `/api/authority/*` and defaults to the session authority registry.

`game-web/server/session-authority.mjs` currently supports:

- `CreatePublicProfile`;
- `SetDisplayName`;
- read of a public profile by aggregate ID;
- command receipts;
- client-supplied `actorId`, `aggregateId` and `commandId`;
- `authentication: not-configured`.

The session implementation is process-memory only. The PostgreSQL implementation exists in `game-web/server/postgres-authority.mjs` and can persist profile, command and event records, but it also declares `authentication: not-configured`.

**Compliance conclusion:** this is an explicit prototype boundary, not a production account system. It may remain available for non-sensitive prototype testing only while it stores no private account data and is not represented as secure identity. Durable or commercially relied-on online identity is blocked by #560 until authenticated server-side ownership/authorization exists.

### 2.3 Current save boundary

The active web runtime has browser-local persistence through `game-web/src/persistence/browserSaveStorage.ts`, which returns `window.localStorage` when available.

This means ordinary game save/progression data is presently device/browser-local unless another system explicitly sends it to the server. Local save state must not be conflated with a cloud account record.

### 2.4 Current analytics, advertising and chat boundary

No production analytics, advertising, crash-reporting, ad-identifier or chat SDK implementation was identified in the audited runtime dependency set.

Repository references to player analytics, A/B testing, advertising, rewarded systems, multiplayer chat and world-market communication are future/planned capabilities.

Therefore:

- do not declare that such collection occurs today if the build does not do it;
- do not declare that it never occurs after an SDK is added;
- adding any auth/analytics/crash/ads/chat SDK is a compliance-triggering change requiring data-map and Google Play declaration review.

---

## 3. Compliance severity model

| Severity | Meaning |
|---|---|
| **BLOCKER** | Must be resolved before the affected commercial capability or store release can ship. |
| **HIGH** | Material legal/policy/security exposure; should normally be treated as a release gate unless the affected feature is disabled. |
| **MEDIUM** | Required governance or hardening work that may not block the current prototype but must be planned before scale. |
| **LOW** | Cleanup/documentation improvement with limited immediate exposure. |
| **INFORMATIONAL** | Boundary or evidence note; no defect by itself. |

A feature-specific BLOCKER does not require removing unrelated offline gameplay. The preferred response is to keep the affected online/monetized/UGC capability disabled until its gate is satisfied.

---

## 4. Real data inventory

The following inventory distinguishes **CURRENT**, **CURRENT PROTOTYPE**, **PLANNED**, and **NOT FOUND**. Storage/retention values must be updated when implementation changes.

| Data category | State now | Purpose | Storage / exposure | Retention / deletion | Controller / processor considerations | Dependency / risk |
|---|---|---|---|---|---|---|
| Local account identifier | **CURRENT** | Bind account/world/hero identity in local world-instance model | Local save/runtime state | Save lifetime; explicit user-facing reset/delete behavior must remain distinguishable from account deletion | If never transmitted it remains local-device data; once synced, publisher becomes controller for server copy | **MEDIUM** — update map when sync/auth arrives |
| World instance ID / hero actor ID | **CURRENT** | World identity and deterministic hero identity | Local save/runtime state | Save lifetime today | Can become online identifier if transmitted | **MEDIUM** |
| Server public-profile aggregate/actor/command IDs | **CURRENT PROTOTYPE** | Authority prototype | Server process memory by default; PostgreSQL code path exists but is not production-authenticated | Session memory until process ends in current production default; durable path would be indefinite absent policy | Publisher controls purpose if activated; hosting/database vendors become processors or service providers subject to contract/role review | **BLOCKER before durable activation** — #560 |
| Display name | **CURRENT PROTOTYPE capability** | Public player profile label | `/api/authority/*`; public profile intentionally readable if created | Session-only in current default; durable PG path exists | Public visibility must be clearly disclosed; username/display-name moderation needed | **HIGH** |
| Username | **PLANNED** (#328) | Stable player identity / social systems | TBD server account system | TBD | Public/private separation required | **BLOCKER before production account** |
| Avatar | **PLANNED** (#328/#335) | Public profile expression | TBD object storage/CDN | Replacement/deletion lifecycle required | File validation, access control, content/moderation and provider DPA required | **BLOCKER before upload launch** |
| Email | **NOT FOUND / MAY BE INTRODUCED** | Authentication, recovery, support | Must remain private server-side | Purpose-specific retention; delete unless required by documented exception | Direct personal data; do not expose in public profile | **BLOCKER to document before collection** |
| Authentication credentials/tokens | **NOT CONFIGURED** | Account authentication | Future secure server/session/auth provider | Shortest practical token/session lifetime; secrets never in public save | Processor/subprocessor and transfer review may apply | **BLOCKER before accounts** |
| Device identifiers | **NOT FOUND** | No current justified purpose | None identified | N/A today | Do not add persistent identifiers merely because an SDK offers them | **HIGH if introduced** |
| IP/network request metadata | **INHERENT HOSTING LAYER / APP DOES NOT EXPLICITLY LOG REQUEST IP** | Network delivery, abuse/security, infrastructure operation | Railway/proxy/server infrastructure may process connection metadata | Provider/configuration-specific; must be documented before launch | Hosting processor/service-provider role and DPA/transfer review required | **HIGH documentation item** |
| Browser/local game save | **CURRENT** | Offline continuity and progression | `window.localStorage` on user device/browser | Until overwritten, app/site data is cleared, or a future reset flow removes it | Not server-held unless synced | **LOW current privacy exposure; HIGH once cloud sync exists** |
| Player progression/economy state | **CURRENT locally; online authority expanding** | Core gameplay | Local save now; future server authority planned | TBD for cloud state | If tied to an account it is personal data/online identifier-linked state | **HIGH before cloud persistence** |
| Purchases/subscriptions | **PLANNED** | Commercial monetization | Google Play + publisher entitlement records when implemented | Financial/legal/accounting retention may differ from gameplay data | Google/payment roles must be documented; exact legal basis/retention requires counsel | **BLOCKER before IAP** |
| Analytics / A-B testing | **PLANNED; SDK NOT FOUND** | Product measurement | TBD vendor/server | TBD | Lawful basis/consent/ePrivacy and processor/transfer review required | **BLOCKER before collection without approved design** |
| Crash reports | **NOT FOUND / likely future** | Reliability and security | TBD vendor/server | Minimize stack metadata and retention | Ensure reports do not accidentally include messages, email, auth tokens or precise location | **HIGH if introduced** |
| Chat messages | **PLANNED** (#330/#348) | Multiplayer communication | Future server storage | Retention/deletion/moderation evidence policy TBD | UGC, minors, moderation, safety and privacy rights apply | **BLOCKER before enablement** — #564 |
| Moderation reports / sanctions | **PLANNED** | Safety and policy enforcement | Future moderation backend | Separate retention for evidence/appeals; must be justified | May include sensitive allegations; least-access controls required | **BLOCKER before chat/UGC** |
| User-generated content | **PLANNED** | Social/gameplay interaction | Future server/CDN | Content-specific lifecycle | Terms acceptance, report/block/moderation required | **BLOCKER before enablement** |
| Support communications | **NOT IMPLEMENTED as product system** | Customer support | Future support provider/email | Purpose-based retention | Processor and support-access controls required | **MEDIUM** |
| User precise/approximate location | **NOT FOUND** | No current user-location purpose | None identified | N/A | Real-world map geography is not the same as collecting a player device's location | **HIGH if permission/collection is added** |
| Advertising identifier / ad profile | **NOT FOUND** | No current ad SDK | None identified | N/A | Especially sensitive to age/consent/Google Families constraints | **BLOCKER before personalized ads** |
| Real-world geographic datasets | **CURRENT, non-user data** | Build authentic game world | Repository/runtime datasets | Versioned source snapshots | Licensing/provenance obligation, not player privacy by itself | **BLOCKER if attribution/license obligations unresolved** — #565 |

### Data-map invariant

Every new external SDK/service must be registered **before merge to a release branch** with:

1. exact SDK/service and version;
2. data categories collected/generated;
3. purpose;
4. server/vendor destinations;
5. controller/processor or other role analysis;
6. retention/deletion behavior;
7. international transfer path where applicable;
8. consent/lawful-basis dependency;
9. age/minor dependency;
10. Play Data safety impact;
11. opt-out/deletion propagation behavior.

---

## 5. GDPR / privacy engineering requirements

### 5.1 Core principles

For EU/EEA personal-data processing, engineering must support the GDPR principles of lawfulness/fairness/transparency, purpose limitation, data minimization, accuracy, storage limitation, integrity/confidentiality and accountability.

Canonical source: Regulation (EU) 2016/679, Article 5:  
https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng

The product must not collect data merely because it might be useful later. A purpose and retention rule must exist before collection begins.

### 5.2 Privacy notice

Before production personal-data collection, a public Privacy Policy / notice must accurately describe at least:

- controller identity and contact;
- DPO/contact where legally applicable;
- categories/purposes of processing;
- lawful basis for each purpose;
- recipients/categories of recipients;
- international transfer mechanism where applicable;
- retention period or criteria;
- access, rectification, erasure, restriction, objection and portability rights where applicable;
- consent withdrawal where consent is used;
- complaint right to the competent supervisory authority;
- automated decision-making/profiling where applicable;
- child/minor handling;
- account deletion route;
- material processors/subprocessors or a maintained subprocessor disclosure route.

Canonical source: GDPR Article 13.

**Never publish a notice that describes planned behavior as if it already exists, or omits behavior that a shipped SDK actually performs.**

### 5.3 Lawful basis register

The final lawful basis is a legal decision, not a code constant. An engineering register must nevertheless map each production purpose to the basis approved by counsel/privacy owner.

Illustrative decision areas:

- core account/game service may often depend on contract necessity for genuinely necessary processing;
- security/abuse prevention may involve legitimate interests and/or legal obligations depending on the activity;
- marketing, certain analytics/device storage technologies and personalized advertising may require consent under applicable data-protection/ePrivacy rules;
- financial records may have statutory retention obligations.

Do not use consent as a blanket basis for processing that is actually necessary to perform the service, and do not make unnecessary processing mandatory merely by placing it in Terms.

### 5.4 Data subject rights

The production system must be able to operationalize applicable rights, including:

- access;
- correction;
- erasure;
- restriction/objection where applicable;
- portability where the Article 20 conditions are met.

Account deletion is not identical to all GDPR erasure rights, but the engineering architecture should share a controlled deletion pipeline.

#562 owns the implementation gate before production account creation.

### 5.5 Retention

No production server table/bucket/log category containing personal data may have `indefinite` as an accidental default.

Each category needs:

- purpose;
- active retention period or retention criterion;
- deletion/anonymization trigger;
- backup expiration behavior;
- litigation/security/fraud hold exception if legally justified;
- owner;
- test/evidence path.

### 5.6 Privacy by design/default

GDPR Article 25 requires data protection by design and by default. For DROPi Tycoon this means, at minimum:

- private account data is not public by default;
- public profile fields are a separate allowlist;
- only necessary data is collected;
- retention is bounded;
- access is least privilege;
- identifiers are not needlessly exposed;
- deletion propagates across active stores and expires from backups according to policy;
- new SDKs default to the least-data configuration;
- telemetry payloads are schema-controlled, not arbitrary object dumps.

### 5.7 Processors/subprocessors and transfers

Before production use of Railway, database/auth/object-storage/analytics/ads/crash/support providers for personal data, maintain:

- provider legal entity/service;
- processing purpose;
- data categories;
- processing locations;
- DPA/data-processing terms;
- subprocessors;
- deletion/return terms;
- security commitments;
- transfer mechanism for third-country transfers where required.

GDPR Article 28 requires processors offering sufficient guarantees and contractual controls. Chapter V governs transfers to third countries/international organizations.

This dossier does not conclude that any particular provider configuration is sufficient; that requires review of the actual account, region and contract at launch.

---

## 6. Accounts, deletion and profile privacy

### 6.1 Production account release gate

Before an authenticated account can be enabled commercially:

1. server-authenticated account identity exists;
2. authorization does not trust client-supplied ownership IDs;
3. public profile and private account schemas are separate;
4. privacy notice is live;
5. retention is defined;
6. account deletion exists in-app;
7. an external web deletion/request route exists for Google Play;
8. deletion propagates to applicable processors/stores;
9. access/correction/export operations exist where applicable;
10. abuse/rate limits protect public endpoints;
11. Data safety declarations match runtime behavior.

Google Play's current account-deletion policy requires an in-app path and an external web route when an app enables account creation.

Official reference:  
https://support.google.com/googleplay/android-developer/answer/13327111

### 6.2 Current authority prototype

The existing unauthenticated authority prototype must not accept:

- email;
- passwords;
- access/refresh tokens;
- payment identifiers;
- private settings;
- real names as required identity;
- private support/moderation data.

If production cannot guarantee this boundary, disable the public prototype routes until #560 is resolved.

---

## 7. Children, minors and target-age strategy

### 7.1 Unresolved product decision

The repository does not yet contain a final, legally reviewed commercial target-age declaration.

**Release blocker:** Agent 14 / product owner / qualified counsel must align:

- actual game content;
- store imagery and marketing;
- Play Console Target Audience and Content selections;
- IARC content rating;
- account/chat/ads behavior;
- privacy notice and age safeguards.

A declaration must reflect the product as actually designed and marketed. Selecting an older audience solely to avoid child rules is not an acceptable compliance strategy if the product is in fact directed at children.

### 7.2 Initial risk-minimizing product position

For the first commercial release, the lowest-complexity engineering path is to **avoid intentionally targeting children** and avoid child-directed marketing/creative unless the owner deliberately chooses to build the additional child-safety/compliance stack.

This is a product recommendation, not a final legal classification. A game can still have teen users even if it is not child-directed, and minors retain heightened protections.

### 7.3 Google Play Families dependency

Google Play requires accurate target-audience declarations. If a selected target audience includes children, the Families requirements apply, including specific data/SDK/advertising restrictions. Google also states that imagery/terminology can affect its assessment of the declared audience.

Official reference:  
https://support.google.com/googleplay/android-developer/answer/9893335

If children are included:

- child personal/sensitive data collection must be accurately disclosed;
- restricted identifiers must not be transmitted from children/users of unknown age as applicable;
- child-directed ads require compliant/certified SDK handling and no personalized advertising to children;
- mixed-audience ad designs need an appropriate neutral age screen and child-safe SDK configuration;
- location and social/chat features face additional restrictions;
- child safety must be reviewed country-by-country where law differs.

### 7.4 GDPR child consent

GDPR Article 8 states that where consent is the Article 6(1)(a) basis for an information-society service offered directly to a child, the default EU threshold is 16, while Member States may lower it to no less than 13. Reasonable efforts to verify parental authorization are required in the cases covered by that rule.

This does **not** mean every game processing operation must use consent or that age 13 is a universal global threshold. Counsel must map relevant countries and legal bases.

Official reference:  
https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng

---

## 8. Multiplayer, chat and user-generated content

### 8.1 No launch before safety stack

#330 defines important technical extension points, but chat/UGC must remain disabled until #564 is satisfied.

The minimum production stack is:

- Community Guidelines / Acceptable Use policy;
- Terms/User Policy acceptance before UGC creation;
- report user;
- report message/content;
- mute and block;
- server-enforced block semantics;
- spam/rate limits;
- moderation queue and operator workflow;
- sanction model;
- evidence retention with access controls;
- escalation route for threats/child-safety/illegal content as legally required;
- appeal/review mechanism appropriate to the sanctions offered;
- chat/report retention and deletion rules;
- minor/age safeguards;
- abuse metrics that do not create unnecessary surveillance.

Google Play's UGC policy requires robust, effective and ongoing moderation, Terms/User Policy acceptance before UGC creation, in-app reporting and appropriate blocking/reporting behavior for interactive experiences.

Official reference:  
https://support.google.com/googleplay/android-developer/answer/9876937

### 8.2 Public/private separation

Chat presence may expose only approved public identity fields. It must never expose by default:

- email;
- authentication identifiers/tokens;
- purchase/payment details;
- IP address;
- private moderation notes;
- private support messages;
- internal anti-abuse scores;
- device identifiers.

### 8.3 Chat retention

Retention must balance:

- user privacy;
- moderation evidence;
- abuse investigations;
- legal obligations;
- storage limitation.

The exact period is a professional legal/product decision. Engineering must make the period configurable, documented and enforceable rather than accidental.

---

## 9. Advertising, analytics and monetization

### 9.1 General rule

Agent 12 owns business strategy; Agent 14 owns Play implementation/declarations; Agent 13 owns legal/privacy review.

No ads/analytics/IAP SDK may be added to a commercial build without updating:

- data inventory;
- processor/subprocessor register;
- privacy notice;
- consent/lawful-basis design;
- age/minor analysis;
- Play Data safety answers;
- SDK version/license/security review.

### 9.2 Ads

The preferred first-release privacy posture is contextual/non-personalized advertising, if ads are used at all, until age/consent and data flows are mature.

Personalized advertising creates materially higher consent, profiling and minor-safety complexity and must be separately approved.

If children are in the Play target audience, Families ads restrictions apply. Google currently requires Families-compliant ad handling and prohibits interest-based advertising/remarketing to children.

### 9.3 Rewarded ads

Rewarded ads must be clearly identifiable as advertising, optional, and must not manipulate the user into accidental engagement. The in-game reward must not falsely imply a real-world financial return.

### 9.4 In-app purchases/subscriptions

Digital goods/features/subscriptions distributed through Google Play generally require Google Play billing unless a current policy exception/program applies. Pricing, subscription terms and cancellation behavior must be clear and consistent with the store flow.

Official reference:  
https://support.google.com/googleplay/android-developer/answer/9858738

Agent 12 must not finalize a monetization mechanic that assumes an external payment route inside the Play-distributed app without Agent 14/current policy review.

### 9.5 Loot/randomized purchases

If paid randomized virtual items are ever introduced, Google Play currently requires odds disclosure. DROPi Tycoon should avoid introducing paid randomization without an explicit consumer-protection, age-rating and jurisdictional review.

---

## 10. Security / privacy by design requirements

The following are canonical release requirements:

- no secrets, private keys or privileged API credentials in client bundles;
- no passwords/private tokens in local game saves;
- authenticated server authority for sensitive shared/account/economic actions;
- client IDs are identifiers, not authorization evidence;
- public profile is an explicit field allowlist;
- private account data is deny-by-default;
- rate limiting on public/auth/account/UGC endpoints;
- input/body/file-size limits;
- avatar/file MIME validation and safe storage keys;
- security headers/TLS through production infrastructure;
- structured audit logs without unnecessary message bodies or private data;
- log redaction for auth, email, payment and secrets;
- defined breach-response owner/process before production personal-data storage;
- least-privilege database/service credentials;
- dependency/security update process;
- deletion propagation and backup expiry;
- privacy/security regression tests around account/profile/chat/delete surfaces.

GDPR Article 32 requires security measures appropriate to the risk, including appropriate confidentiality/integrity/availability and regular testing/evaluation.

---

## 11. Intellectual property and branding

### 11.1 Trademark clearance

The repository contains approved `DROPi Tycoon` branding, logo, icon and splash assets. Owner approval of a design does not replace trademark clearance.

Before commercial launch, qualified trademark/IP review must assess at least:

- `DROPi`;
- `DROPi Tycoon`;
- logo/device marks;
- app icon;
- major recurring commercial brand/company names intended to function as source identifiers;
- priority launch jurisdictions/classes.

**Status: HIGH / commercial-launch blocker until clearance decision is recorded.**

### 11.2 Real-world companies and brands

Real geographic identity does not grant trademark permission.

Canonical content rule:

- use real city/road/geographic information only where data/source rights permit;
- use fictional companies, products, store branding, packaging and vehicle liveries by default;
- do not reproduce real logos/trade dress/brand packaging as game partners without explicit lawful authorization;
- do not imply sponsorship, endorsement or partnership with real businesses unless documented.

`08_Assets/Production/Manifests/BATCH_001_WORLD_FOUNDATION_MANIFEST.md` already requires generic fictional product/cargo art rather than copied real-world brand packaging; that rule is now also a legal release invariant.

### 11.3 Generated artwork

Generated art requires provenance even when no third-party image was intentionally copied.

For each production/runtime generated asset or source family, record where feasible:

- provider/tool/model family;
- generation date;
- account/plan or governing terms version/reference;
- prompt/project instruction reference;
- input/reference-image provenance;
- whether a real person/brand/character/reference image was involved;
- human edits/derivatives;
- source and runtime hashes;
- promotion/approval state.

Do not claim universal copyright ownership/protectability of AI-generated material. Those questions vary by jurisdiction and by human authorship. Key brand art and final commercial character art require professional IP review.

### 11.4 Fonts, icons, audio/music

No assumption of `free online = commercially reusable` is permitted.

Before any font, icon pack, music, sound effect, voice or external reference image enters a production/runtime path, register:

- source/provider;
- exact license/terms;
- commercial-use right;
- redistribution/embedding right;
- modification right;
- attribution requirement;
- prohibited uses;
- proof/source snapshot where practical.

---

## 12. Geographic and third-party data

The canonical release register is `00_Project/THIRD_PARTY_LICENSE_REGISTER.md`.

### 12.1 GeoNames

Current locality governance identifies GeoNames under Creative Commons Attribution 4.0 and preserves source snapshots/references.

A shipped legal/about/third-party notices surface must carry required attribution and identify modifications/derived use appropriately.

Official provider reference:  
https://www.geonames.org/

### 12.2 OpenStreetMap

Brăila uses OpenStreetMap-derived geographic/layout data under ODbL 1.0. Existing implementation already displays `© OpenStreetMap contributors · ODbL` in the Urban HUD and retains source/transformation metadata.

That is a strong baseline but not by itself a final legal conclusion about every distributed derivative database/produced work.

Before commercial release containing OSM-derived databases:

- preserve visible attribution appropriate to the medium;
- make clear that OSM data is available under ODbL;
- preserve source/licence links/notices;
- identify which shipped artifacts are databases, derivative databases or produced works;
- document any share-alike/source-offer obligation triggered by the actual distribution form;
- keep retained source inputs and deterministic transformation scripts available as required by the approved compliance design.

Official reference:  
https://www.openstreetmap.org/copyright

**Professional ODbL review required before final binary distribution.**

### 12.3 Natural Earth

Natural Earth is recorded in world-data governance as a pinned public-domain source. Preserve provenance/version/source hashes even where attribution is not legally required. This helps reproducibility and prevents later accidental substitution with a differently licensed dataset.

---

## 13. Terms and policy document set

The following are required before the corresponding capabilities ship.

All final legal texts are **DRAFT FOR PROFESSIONAL LEGAL REVIEW** until counsel approval is recorded.

| Document | Required before | Minimum engineering/content dependency |
|---|---|---|
| Privacy Policy / Privacy Notice | Any production personal-data collection and Play submission | Actual data map, controller details, vendors, retention, rights, transfers, age handling |
| Terms of Service / End User Terms | Production account/commercial service | Service description, account rules, license, suspension/termination, disclaimers, governing-law/country-specific review |
| Community Guidelines / Acceptable Use | Chat/UGC | Prohibited conduct/content, reports, blocks, sanctions, escalation |
| Account Deletion help page | Production accounts / Play listing | In-app deletion path, external request route, what is deleted/retained and why |
| Purchase/subscription terms | IAP/subscriptions | SKU, price, renewal/cancel/refund behavior, Play billing alignment |
| UGC license/rules | UGC upload/posting | User rights/permissions to content, moderation/removal, complaints |
| Marketplace rules | Any future player marketplace with user offers | Fraud/abuse, prohibited goods/content, settlement rules, consumer-law analysis |
| Third-party notices | Any commercial build containing third-party licensed material | `THIRD_PARTY_LICENSE_REGISTER.md` and generated notice output |

No agent may invent a statement such as “we never collect X” unless the release build and all SDKs support that statement.

---

## 14. Google Play declaration alignment

Agent 14 owns store-policy execution, but Agent 13 establishes the consistency gate.

Before each production Play submission, compare the actual release artifact against:

- Data safety form;
- Target Audience and Content;
- ads declaration;
- IARC content rating;
- account deletion declaration/link;
- privacy-policy URL;
- permissions;
- SDK inventory;
- in-app purchases/subscriptions;
- UGC/chat behavior;
- location behavior;
- child/family status.

**Release rule:** declarations must describe the submitted binary, not the roadmap.

---

## 15. Compliance matrix

| REQUIREMENT | CURRENT STATE | RISK | REQUIRED ACTION | OWNER | RELEASE BLOCKER? | EVIDENCE |
|---|---|---|---|---|---|---|
| Authenticated account/profile authority | Prototype authority is unauthenticated; session default in production | **BLOCKER** | Implement server-authenticated ownership and authorization; isolate/disable unsafe production use | Server/identity engineering + Agent 13 review | **YES before durable online identity** | `server.mjs`, `session-authority.mjs`, `postgres-authority.mjs`, #560 |
| Public/private profile separation | Canon requires separation; prototype exposes only aggregate/revision/displayName | **HIGH** | Keep explicit public allowlist and private account schema | #328/#363 owners | **YES before accounts** | #328, #363 |
| Privacy notice | No canonical public Privacy Policy found | **BLOCKER** | Draft from actual data map; professional review; publish and link in app/store | Agent 13 + counsel + Agent 14 | **YES before personal-data production launch** | Repository search + this dossier |
| Account deletion | Not implemented | **BLOCKER** | In-app + external web route; deletion propagation and evidence | Account engineering | **YES before account creation** | #562; Google Play deletion policy |
| GDPR rights operations | Not implemented | **HIGH** | Access/correction/erasure/export where applicable; request verification/audit | Account/backend engineering + privacy owner | **YES before scaled production accounts** | GDPR Arts. 12–22; #562 |
| Retention schedule | No product-wide schedule | **HIGH** | Define/test retention by category and backup expiry | Agent 13 + data owners | **YES for server-held personal data** | Data inventory above |
| Processor/subprocessor register | Not canonical | **HIGH** | Record Railway/auth/db/storage/analytics/ads/support roles, DPA, locations, subprocessors | Agent 13 + owner | **YES before relevant provider processes personal data** | GDPR Art. 28 |
| International transfers | Not assessed for launch configuration | **HIGH** | Review actual service regions/contracts/transfer mechanisms | Qualified privacy counsel | **YES where applicable** | GDPR Chapter V |
| Target-age strategy | Not finalized | **BLOCKER** | Product decision + counsel + Agent 14 declarations aligned to content/marketing | Owner + Agent 13 + Agent 14 + counsel | **YES before Play submission** | Google Play Families/Target Audience policy |
| Children data/ads handling | Not implemented because target strategy unresolved | **BLOCKER if children included** | Age-appropriate design, SDK restrictions, consent/parental rules as applicable | Agent 13/14 + engineering | **YES if children targeted/permitted under applicable rules** | Google Families; GDPR Art. 8 |
| Chat/UGC moderation | Planned only | **BLOCKER** | Terms acceptance, report, block, moderation, sanctions, retention, appeals as appropriate | #330 owner + Agent 13 | **YES before chat/UGC** | #330, #564, Google UGC policy |
| Advertising privacy | No production ad SDK found | **INFORMATIONAL now / HIGH future** | Vendor/data/consent/age review before SDK integration | Agent 12 + Agent 13/14 | **YES before ads if unresolved** | Current package audit |
| Analytics/crash privacy | No production analytics/crash SDK found | **INFORMATIONAL now / HIGH future** | Event schema, minimization, lawful basis/consent, vendor review | Product analytics + Agent 13 | **YES before collection if unresolved** | Current package/code audit |
| IAP/subscriptions | Not implemented | **HIGH future** | Play Billing/current program review, pricing/cancel/refund disclosures, entitlement security | Agent 12 + Agent 14 | **YES before monetized release** | Google Payments policy |
| GeoNames attribution | Source governance is strong; release-facing notice not yet canonical | **HIGH** | Add shipped attribution/change/source notice | World data + Agent 13 | **YES if GeoNames data ships** | Country Catalog audits; CC BY 4.0 |
| OSM ODbL | Visible HUD attribution + retained source/transforms exist | **HIGH** | Final derived-DB/produced-work distribution analysis and notice/source path | World data + qualified IP/data counsel | **YES if OSM-derived DB ships unresolved** | City Plans + UrbanHUD + #565 |
| Natural Earth | Pinned public-domain provenance | **LOW** | Preserve version/source evidence | World data | No, if provenance remains valid | World-data audit history |
| Generated art provenance | Family registries exist but legal chain-of-title/tool-terms fields are incomplete | **HIGH** | Extend provenance records; review key commercial art | Asset governance + Agent 13/counsel | **YES for unresolved runtime assets** | `08_Assets/Production/Approved_Sources/*`, #565 |
| Runtime `icon-orders.webp` | Approved generated runtime asset; legal provenance not complete in current source register | **HIGH** | Link exact source/generation/tool/terms/hash chain | Asset governance | **YES before commercial release if unresolved** | `game-web/public/assets/production/icon-orders.webp`, #565 |
| Dependency licenses | `package-lock.json` contains license metadata; no generated release notice found | **MEDIUM** | Produce repeatable dependency license inventory/notices and review exceptions | Build/release + Agent 13 | **YES if required notices unresolved** | `game-web/package.json`, lockfile, #565 |
| Real brands/trade dress | Canon trends toward fictional goods; no global legal gate previously | **HIGH** | Automated/manual brand audit before runtime promotion; licenses for exceptions | Assets/narrative/world + Agent 13 | **YES for unlicensed material** | #409/#411 + this dossier |
| DROPi / DROPi Tycoon trademark clearance | No professional clearance evidence found | **HIGH** | Professional search/filing strategy in launch jurisdictions | Owner + qualified trademark counsel | **YES before commercial brand launch** | Branding registry + this dossier |
| Security logs / IP metadata | App does not explicitly log request IP; host infrastructure may process it | **MEDIUM** | Provider/log retention/data-map review; avoid unnecessary application logging | Infra + Agent 13 | Before personal-data launch | Railway architecture + GDPR online identifier rules |
| Crypto/token | Out of scope | **INFORMATIONAL** | Separate financial/regulatory review before any integration | Separate future program | **YES before any crypto feature** | Owner boundary |

---

## 16. Release compliance gates

A commercial release candidate is **NOT LEGAL/PRIVACY READY** until all applicable gates below have evidence:

### Gate A — offline-only prototype

May proceed while:

- no production account claim is made;
- no sensitive user data is collected;
- no ads/analytics SDK silently collects data;
- third-party assets/data used in the distributed build have valid provenance/licensing;
- Play declarations accurately match the binary.

### Gate B — accounts/cloud save

Requires #560 and #562 plus:

- privacy notice;
- auth/security review;
- deletion/rights/retention;
- processor/transfer register;
- Play Data safety alignment.

### Gate C — multiplayer/chat/UGC

Requires #564 plus:

- Community Guidelines;
- Terms acceptance;
- report/block/moderation operations;
- minor safety decision;
- retention/deletion and appeals/escalation design.

### Gate D — ads/analytics

Requires:

- SDK/vendor register;
- data/consent/lawful-basis analysis;
- age handling;
- Data safety update;
- Agent 12/13/14 sign-off boundary.

### Gate E — purchases/subscriptions

Requires:

- current Google Play billing-policy compliance;
- clear price/renewal/cancellation/refund information;
- entitlement security;
- consumer-law review for target markets.

### Gate F — commercial IP/data release

Requires #565 plus:

- third-party notices;
- dependency license report;
- GeoNames/OSM compliance evidence;
- runtime asset provenance;
- real-brand audit;
- trademark clearance decision.

---

## 17. Professional legal review required

The following cannot be closed solely by engineering assertions:

1. final Privacy Policy and Terms in the publisher's actual legal entity/jurisdictions;
2. lawful-basis and cookie/ePrivacy/consent design for analytics/ads;
3. child/minor target-age, consent and parental requirements across launch countries;
4. OSM ODbL characterization/share-alike obligations for the exact shipped derived databases/produced works;
5. `DROPi` / `DROPi Tycoon` trademark clearance and filing strategy;
6. rights/protectability and infringement risk for key AI-generated commercial artwork;
7. international-transfer mechanism for actual processor configurations;
8. consumer-law terms for subscriptions, refunds, promotions and randomized purchases if any;
9. UGC moderation/escalation obligations in launch jurisdictions;
10. any future crypto/token integration.

Engineering can and should solve the factual architecture, controls, evidence, data map, deletion mechanics, moderation tooling, provenance register and declaration accuracy before counsel review.

---

## 18. Official policy/legal references checked for this baseline

- EU GDPR — Regulation (EU) 2016/679: https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng
- Google Play Families Policies: https://support.google.com/googleplay/android-developer/answer/9893335
- Google Play account deletion requirements: https://support.google.com/googleplay/android-developer/answer/13327111
- Google Play User Generated Content policy: https://support.google.com/googleplay/android-developer/answer/9876937
- Google Play Payments policy: https://support.google.com/googleplay/android-developer/answer/9858738
- OpenStreetMap copyright/licensing: https://www.openstreetmap.org/copyright
- GeoNames: https://www.geonames.org/

These references are time-sensitive. Agent 13/14 must re-check current policies before each store release rather than relying permanently on the 2026-09-08 snapshot.

---

## 19. Canonical compliance invariant

**Implementation, documentation and store declarations must always agree.**

No roadmap promise, legal template, privacy notice, Data safety answer, age declaration, attribution notice or Terms clause is evidence of compliance unless the shipped system actually behaves as described.

When behavior changes, compliance documentation changes in the same release program.
