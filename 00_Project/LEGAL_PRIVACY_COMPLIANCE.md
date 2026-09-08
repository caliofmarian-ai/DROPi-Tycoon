# DROPi Tycoon — Legal, Privacy & Compliance Dossier

Version: 1.1.0
Status: CANONICAL COMPLIANCE BASELINE — **DRAFT FOR PROFESSIONAL LEGAL REVIEW BEFORE COMMERCIAL LAUNCH**
Audit date: 2026-09-08
Continuation review: 2026-09-09
Audit baseline: `main` at `8e340b7131c4bdc890c38ba34e88d94858897cb3`
Owner lane: Agent 13 — Legal / Privacy / Compliance / Intellectual Property
Coordinates: #328, #330, #335, #348, #363, #409, #411, #412, #560, #561, #562, #563, #564, #565, #568, #569, #570, #571

---

## 1. Purpose and legal boundary

This document is the canonical engineering compliance baseline for the real-world commercial operation and distribution of DROPi Tycoon.

It covers:

- privacy and GDPR readiness;
- Google Play policy dependencies;
- accounts, profiles, deletion and data-subject rights;
- minors and target-age decisions;
- multiplayer, chat and user-generated content;
- analytics, crash reporting and advertising;
- purchases, subscriptions and promotions;
- security/privacy by design;
- intellectual property, trademarks and third-party licensing;
- source/data provenance;
- release evidence and legal-review gates.

It does **not** implement or interpret fictional in-game law. It is structured legal/compliance research and engineering guidance, not legal advice and not a substitute for qualified counsel.

The future DROPi token/crypto project is out of scope. Any later blockchain, wallet, crypto-payment, NFT or token-reward integration requires a separate financial/regulatory review before implementation.

---

## 2. Audited repository and production state

### 2.1 Repository state

The original audit and continuation checkpoint reviewed:

- latest `main`;
- the latest merged-PR stream;
- all current open PRs;
- active specialist branches;
- issues #328, #330, #335, #348, #363, #409, #411 and #412;
- current account/profile authority;
- browser save/persistence;
- World Instance and server-authority work;
- smartphone, multiplayer, chat, analytics, advertising and monetization references;
- `08_Assets/**` and `game-web/public/assets/**`;
- world-data provenance including GeoNames, OpenStreetMap-derived data and Natural Earth;
- `game-web/package.json` and the production lockfile;
- Railway production configuration.

At the continuation checkpoint, `main` remained at `8e340b7131c4bdc890c38ba34e88d94858897cb3`, so this branch remains based on the current `main` baseline.

### 2.2 Production runtime boundary

The Railway production service is sourced from `caliofmarian-ai/DROPi-Tycoon`, branch `main`, root `/game-web`.

At audit time no production variable selected the PostgreSQL authority store. `game-web/server/server.mjs` therefore defaults to the in-memory session authority registry.

The current production service must not be described as having a production-grade authenticated account system merely because authority endpoints exist.

### 2.3 Account/profile prototype finding

`game-web/server/session-authority.mjs` supports a public-profile prototype including:

- `CreatePublicProfile`;
- `SetDisplayName`;
- public profile reads;
- command receipts;
- client-provided `actorId`, `aggregateId` and `commandId`;
- `authentication: not-configured`.

`game-web/server/postgres-authority.mjs` can durably persist profile, command and event records but also declares `authentication: not-configured`.

**Release conclusion:** the current authority surface is a prototype, not a commercial account authority. Durable or commercially relied-on identity is blocked by #560 until authenticated server-side ownership and authorization exist.

### 2.4 Local save boundary

`game-web/src/persistence/browserSaveStorage.ts` uses `window.localStorage` when available.

Current local game save/progression is therefore device/browser-local unless another implementation explicitly transmits it. Local save deletion/reset must remain conceptually separate from deletion of a future online account.

### 2.5 Analytics, ads, crash reporting and chat boundary

No production analytics, advertising, crash-reporting, advertising-identifier or chat SDK was identified in the audited runtime dependency set.

References to analytics, A/B testing, advertising, rewarded systems and multiplayer chat are currently planned/future capabilities.

Every new auth, analytics, crash, ads, attribution, chat or support SDK is a compliance-triggering change. Its data behavior must be audited before release and Google Play declarations must be updated to match the shipped build.

### 2.6 Cross-agent reconciliation

The continuation review found new specialist work that should consume this dossier rather than duplicate it:

- **#569 / Agent 14:** owns publication of the production Privacy Policy and completion of Play Data Safety / App Content declarations. It must use this dossier's actual-data map and may not claim unimplemented behavior.
- **#571 / Agent 14:** owns owner-only Play Console submission/publishing actions. Agent 13 supplies legal/privacy/IP evidence but does not perform Play Console actions.
- **#570 and #561 / Agents 14 and 15:** store listing and launch creative require Agent 13 IP, trademark, attribution and disclosure review before publication.
- **#563 and #564 / Agents 15 and 13:** creator/community launch rules and in-product chat/UGC must share one acceptable-use, moderation, reporting, blocking and minor-safety baseline.
- **#568 / Agent 16:** governed analytics/error evidence remains subject to this dossier's purpose, minimization, processor, retention, age, consent/lawful-basis and Data Safety requirements.
- **Agent 12 / monetization:** ads, IAP and subscriptions remain gated by the privacy, consumer-protection and Play declarations defined here and in #569.

No duplicate issues are required for those findings.

---

## 3. Severity model

| Severity | Meaning |
|---|---|
| **BLOCKER** | Must be resolved before the affected capability or commercial release can ship. |
| **HIGH** | Material legal, policy, security or commercial exposure; normally a release gate unless the affected feature is disabled. |
| **MEDIUM** | Governance/hardening required before scale but not necessarily a current prototype blocker. |
| **LOW** | Limited immediate exposure; cleanup/documentation improvement. |
| **INFORMATIONAL** | Boundary/evidence note rather than a defect. |

A feature-specific blocker does not require removal of unrelated offline gameplay. The preferred response is to keep the affected feature disabled until its gate is satisfied.

---

## 4. Real data inventory

The state labels below mean **CURRENT**, **CURRENT PROTOTYPE**, **PLANNED**, or **NOT FOUND** in the audited build/repository.

| Data category | State | Purpose | Storage / exposure | Retention / deletion | Compliance dependency |
|---|---|---|---|---|---|
| Local account identifier | CURRENT | Local World Instance identity | Local save/runtime | Save lifetime today | Re-audit when server sync begins |
| World Instance ID / hero actor ID | CURRENT | World/hero identity | Local save/runtime | Save lifetime today | Becomes online identifier if transmitted |
| Public-profile aggregate/actor/command IDs | CURRENT PROTOTYPE | Authority prototype | Server process memory by default; PG path exists | Session-only in current default; durable path needs policy | #560 before durable activation |
| Display name | CURRENT PROTOTYPE capability | Public profile label | Public-profile API if created | Session-only in current production default | Moderation/privacy rules before production |
| Username | PLANNED | Stable social identity | Future account service | TBD | #560/#562 before production |
| Avatar | PLANNED (#335) | Public profile expression | Future object storage/CDN | Replace/delete lifecycle required | File safety, moderation, DPA, deletion |
| Email | NOT FOUND / MAY BE INTRODUCED | Auth/recovery/support | Must remain private server-side | Purpose-specific | Notice, lawful basis, deletion/retention before collection |
| Passwords/auth tokens | NOT CONFIGURED | Authentication | Future secure auth/session service | Minimized/short-lived as applicable | Never expose in saves/public profiles |
| Device identifiers | NOT FOUND | No current justified purpose | None identified | N/A | Re-audit before introduction |
| IP/network metadata | INFRASTRUCTURE-INHERENT | Delivery/security | Hosting/proxy layer may process | Provider/configuration-specific | Processor/retention/transfer review |
| Local game save | CURRENT | Offline continuity | Browser `localStorage` | Until reset/cleared/overwritten | Separate from account deletion |
| Progression/economy state | CURRENT locally | Core gameplay | Local save; server authority planned | TBD for cloud | Personal data when account-linked |
| Purchase/subscription data | PLANNED | Monetization/entitlements | Play + publisher records when implemented | Accounting/legal needs may differ | Consumer/payment/privacy review |
| Analytics/A-B data | PLANNED; SDK NOT FOUND | Measurement | TBD | TBD | #568 + lawful-basis/consent/Play review |
| Crash reports | NOT FOUND / FUTURE | Reliability/security | TBD vendor/server | Minimize and bound | Do not include tokens/messages/private data |
| Chat messages | PLANNED | Multiplayer communication | Future server | TBD moderation/privacy retention | #564 blocker |
| Moderation reports/sanctions | PLANNED | Safety enforcement | Future moderation backend | Evidence/appeal retention must be justified | #564 blocker |
| User-generated content | PLANNED | Social interaction | Future backend/CDN | Content lifecycle required | Terms/report/block/moderation gate |
| Support communications | NOT IMPLEMENTED as product system | Support | Future provider/email | Purpose-based | Provider/access/retention review |
| Player real-world location | NOT FOUND | No current purpose | None identified | N/A | Permission/data map required before collection |
| Advertising ID/ad profile | NOT FOUND | No current ad SDK | None identified | N/A | Age/consent/Families/ads review before use |
| Geographic world datasets | CURRENT, non-user data | Authentic world | Repo/runtime | Versioned snapshots | License/provenance gate #565 |

### 4.1 Data-map invariant

Before a new external SDK/service merges into a release branch, record:

1. provider and exact SDK/service/version;
2. data categories collected or generated;
3. purpose;
4. destination/recipient;
5. controller/processor/other role assessment;
6. retention/deletion behavior;
7. international transfer path where applicable;
8. lawful basis/consent dependency;
9. minor/target-age dependency;
10. Google Play Data Safety impact;
11. opt-out/account-deletion propagation behavior.

---

## 5. GDPR / privacy engineering requirements

### 5.1 Core principles

For EU/EEA personal-data processing, engineering must support lawfulness, fairness and transparency; purpose limitation; data minimization; accuracy; storage limitation; integrity/confidentiality; and accountability.

Canonical source: Regulation (EU) 2016/679, Article 5.

https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng

The application must not collect information merely because it may be useful later.

### 5.2 Privacy notice

Before production personal-data collection, a public privacy notice must accurately describe, as applicable:

- controller identity/contact;
- privacy/DPO contact where required;
- processing purposes;
- approved lawful basis per purpose;
- recipients/categories of recipients;
- international transfers and safeguards;
- retention periods or criteria;
- access, rectification, erasure, restriction, objection and portability rights where applicable;
- consent withdrawal where consent is used;
- supervisory-authority complaint right;
- material automated decision-making/profiling where applicable;
- minor/age handling;
- account deletion route;
- material processors/subprocessors or a maintained disclosure route.

#569 is the Play/release implementation owner for publishing the production policy and declarations. Final legal wording requires qualified review.

### 5.3 Lawful basis

Lawful basis is a legal/privacy decision, not a code constant. Engineering must maintain a purpose-to-basis register after professional approval.

Do not:

- use consent as a blanket basis for all processing;
- make unnecessary processing mandatory by burying it in Terms;
- introduce analytics/ads/device storage without reviewing ePrivacy/consent implications;
- assume security/fraud, marketing and core service processing all use the same basis.

### 5.4 Rights and account deletion

Production architecture must support applicable rights including access, correction, erasure, restriction/objection and portability where Article 20 applies.

Before account creation is commercially enabled:

- provide an in-app account deletion path;
- provide the external deletion/request mechanism required for the Play listing when applicable;
- delete or irreversibly de-identify associated personal data unless a documented legal exception applies;
- propagate deletion to relevant processors/subprocessors;
- define backup expiry behavior;
- keep local save reset distinct from online account deletion;
- produce auditable deletion/retention evidence.

#562 owns the engineering lifecycle gate.

Google Play account-deletion policy reference:

https://support.google.com/googleplay/android-developer/answer/13327111

### 5.5 Retention

No production personal-data store may acquire accidental indefinite retention.

Each data family needs:

- purpose;
- retention period or criterion;
- deletion/anonymization trigger;
- backup expiry behavior;
- justified legal/security hold exception if applicable;
- owner;
- test/evidence path.

### 5.6 Privacy by design/default

At minimum:

- private account data is private by default;
- public profile fields are a positive allowlist;
- collect only necessary information;
- use least privilege;
- avoid exposing internal identifiers without need;
- schema-control telemetry rather than sending arbitrary object dumps;
- configure new SDKs for least data by default;
- propagate deletion to active stores and bounded backups;
- keep secrets and private keys out of clients and saves.

### 5.7 Processors/subprocessors and transfers

Before a production provider handles personal data, record:

- legal entity/service;
- purpose and data categories;
- processing locations;
- DPA/data-processing terms;
- subprocessors;
- deletion/return terms;
- security commitments;
- international transfer mechanism where required.

This dossier does not conclude that any particular Railway/database/auth/analytics/ads/support configuration is legally sufficient; the actual commercial configuration and contract require review.

---

## 6. Account/profile security gate

Before durable online identity is enabled:

1. authenticate the account server-side;
2. derive/authorize ownership server-side rather than trusting client ownership fields;
3. separate public profile from private account data;
4. enforce authorization for profile mutation;
5. rate-limit and abuse-protect public endpoints;
6. prevent enumeration where it exposes non-public information;
7. test impersonation, replay, stale commands and unauthorized mutation;
8. define deletion/retention before durable persistence;
9. update privacy notice/Data Safety to match behavior.

#560 is a **BLOCKER before durable production identity**.

The current unauthenticated prototype must not be extended to collect passwords, email, payment IDs, private settings, access/refresh tokens, private support data or private moderation data.

---

## 7. Children, minors and target audience

### 7.1 Decision still required before commercial launch

The repository does not yet establish a professionally reviewed commercial target-age strategy.

The lowest-complexity initial release posture is to **avoid intentionally targeting children** unless the owner deliberately chooses a child-inclusive product and funds/designs the corresponding safeguards. This is a product recommendation, not a legal conclusion that age declarations alone eliminate minor obligations.

Store listing, imagery, wording, marketing channels and actual design must be consistent with the declared audience.

### 7.2 If minors are permitted

The release design must address, as applicable:

- Google Play target-audience/Families rules;
- age-appropriate privacy disclosures;
- restrictions on behavioral/personalized advertising;
- age-appropriate SDK selection/configuration;
- account/profile discoverability;
- default privacy settings;
- chat/contact risks;
- reporting/blocking/moderation;
- parental-consent requirements where the chosen lawful basis/jurisdiction requires them;
- data minimization and retention.

Google Play Families reference:

https://support.google.com/googleplay/android-developer/answer/9893335

GDPR Article 8 provides special rules where consent is relied upon for an information-society service offered directly to a child. The Member State/jurisdiction and actual service design require professional review.

---

## 8. Multiplayer, chat and UGC

#330 may not ship public chat/UGC merely because transport and message schemas work.

Before enablement, #564 requires:

- Terms/User Policy acceptance before UGC creation;
- Community Guidelines / Acceptable Use rules;
- rules against harassment, threats, hate/abuse, sexual exploitation, spam, scams, impersonation and unlawful content;
- report-user and report-message/content paths;
- mute/block controls with server-enforced semantics;
- rate limits/spam controls;
- moderation queue and responsible operator;
- sanctions and evidence-retention rules;
- appeal/review path where appropriate;
- privacy handling for chat/report records;
- minor-safety rules tied to target age;
- separation of private account fields from public chat/profile payloads;
- tests proving report/block/sanction behavior.

Google Play UGC policy reference:

https://support.google.com/googleplay/android-developer/answer/9876937

#563's creator/community launch policy must not establish a second contradictory moderation policy. It should reference the same canonical rules.

---

## 9. Analytics, crash reporting and measurement

No analytics/crash SDK is currently treated as approved merely because product/QA teams want measurement.

Before #568 or another analytics implementation becomes production-visible, define:

- exact questions the telemetry answers;
- minimum event schema;
- account/device identifiers, if any;
- payload fields prohibited from telemetry;
- vendor and processor role;
- region/transfers;
- retention;
- lawful basis and consent/opt-out where applicable;
- target-age/minor impact;
- account deletion propagation;
- Play Data Safety impact.

Logs and crash reports must not contain credentials, auth tokens, message bodies, email addresses, precise location or complete save-state dumps unless specifically justified and protected.

---

## 10. Advertising and monetization compliance

Coordinate with Agent 12 and Agent 14.

### 10.1 Ads

Before any ad or rewarded-ad SDK ships:

- audit SDK/vendor data collection;
- determine contextual vs personalized behavior;
- determine lawful basis/consent requirements;
- account for target age/Families restrictions;
- update privacy notice and Data Safety;
- ensure rewards are truthful and actually granted;
- prohibit disguised real-world advertising inside required gameplay;
- keep fictional in-world advertising distinct from paid external advertising.

### 10.2 IAP/subscriptions

Before paid digital goods/subscriptions ship:

- use the required Google Play billing path where policy applies;
- state price, renewal, duration and material limitations clearly;
- provide entitlement/restoration handling;
- do not misrepresent probability, scarcity or benefits;
- define refund/cancellation/support handoff;
- ensure paid mechanics match the actual store listing;
- document financial/accounting retention separately from ordinary game data.

Final EU/EEA consumer-contract, cancellation/refund and promotional wording requires professional review.

---

## 11. Terms and player-facing legal documents

Engineering-ready requirements may be drafted in-repository, but final launch contracts must be marked:

**DRAFT FOR PROFESSIONAL LEGAL REVIEW.**

Required document families as features activate:

1. Privacy Policy / Privacy Notice;
2. Terms of Service / End User Terms;
3. Community Guidelines / Acceptable Use;
4. account deletion/data-rights instructions;
5. purchase/subscription terms;
6. UGC licence/moderation rules;
7. future marketplace rules;
8. third-party notices/licence acknowledgements.

Terms should address, where applicable:

- eligibility/age;
- account obligations;
- licence to use the game;
- prohibited conduct;
- UGC rights and moderation;
- virtual goods/currency;
- purchases/subscriptions;
- service changes/termination;
- disclaimers and liability only as legally appropriate;
- governing law/dispute terms only after qualified jurisdiction-specific review.

Do not invent a final jurisdiction-specific contract and represent it as lawyer-approved.

---

## 12. Security / privacy by design

Required architecture rules:

- no service secrets/private keys in client bundles or saves;
- no client-authoritative account ownership or sensitive economic settlement;
- server authority for shared account/economic actions;
- separate public/private profile schemas;
- least-privilege database/service access;
- secure transport;
- bounded request bodies and abuse/rate controls;
- no unnecessary personal data in logs;
- deletion propagation across stores/processors;
- authenticated support/admin operations;
- security incident logging without excessive content collection;
- dependency/security scanning appropriate to production.

Agent 13 does not own the technical implementation of #560 but treats it as a legal/privacy release dependency.

---

## 13. Intellectual property and real brands

### 13.1 Project identity

Before commercial launch, obtain qualified trademark/name clearance for at least:

- `DROPi`;
- `DROPi Tycoon`;
- logo/wordmark;
- app icon;
- material recurring commercial/company names that will be promoted externally.

Repository ownership or domain use does not establish trademark clearance.

### 13.2 Real companies and brands

Default game-content rule:

- use fictionalized commercial companies/products;
- do not reproduce real logos, packaging, storefront trade dress or vehicle liveries without explicit rights review;
- real geographic/city identity does not grant permission to use private trademarks;
- store screenshots/trailers/creator materials must follow the same rule.

#561 and #570 require Agent 13 IP/disclosure review before public launch creative/listing publication.

### 13.3 Assets and generated art

Every material shipped asset family needs provenance sufficient to answer:

- who/what created it;
- source/provider;
- licence or provider terms applicable at creation/acquisition;
- commercial-use status;
- modification and redistribution rights;
- attribution requirements;
- reference/input provenance;
- human edits/derivatives;
- source/runtime hashes where feasible.

Owner visual approval is a product-quality decision, not by itself a complete chain-of-title analysis.

#565 owns the release-facing third-party/provenance closure gate.

---

## 14. Google Play consistency gate

Coordinate with Agent 14.

Before submission, Play Console declarations must match the exact shipped artifact and live backend behavior.

Required consistency checks include:

- target audience/content declarations;
- Data Safety categories and purposes;
- data sharing/processing declarations;
- account creation/deletion behavior;
- ads declaration;
- permissions;
- UGC/chat behavior;
- purchases/subscriptions;
- privacy-policy URL/content;
- developer/contact information;
- third-party SDK behavior.

#569 owns the Privacy Policy/Data Safety/App Content release work. #571 owns the owner-only Play Console submission/publishing gates.

Agent 13 may provide review evidence, but must not represent a Play Console declaration as completed without actual Console evidence.

---

## 15. Third-party data and dependency rule

The canonical release register is:

`00_Project/THIRD_PARTY_LICENSE_REGISTER.md`

Key governed families include:

- OpenStreetMap-derived Brăila data — ODbL 1.0, with visible attribution already present in the audited HUD;
- GeoNames locality data — CC BY 4.0, requiring attribution/compliance in shipped notices;
- Natural Earth — public-domain source, with provenance still retained;
- direct and transitive software dependencies;
- generated art and runtime derivatives;
- fonts/icons/audio/reference imagery when introduced.

Do not assume that material found online is commercially reusable merely because it is publicly accessible.

---

## 16. Compliance matrix

| Requirement | Current state | Risk | Required action | Owner | Release blocker? | Evidence |
|---|---|---|---|---|---|---|
| Authenticated production identity | Prototype is unauthenticated | BLOCKER | Implement authenticated server authorization | Account/server owner; #560 | Yes before durable accounts | `session-authority.mjs`, `postgres-authority.mjs` |
| Account deletion/data rights | Not production-ready | BLOCKER | Implement deletion, retention, rights and propagation | Account/privacy; #562 | Yes before accounts | #562 |
| Privacy Policy + Play Data Safety/App Content | Not release-complete | BLOCKER | Publish truthful policy and declarations | Agent 14 + Agent 13; #569 | Yes before Play submission | #569 |
| Target-age strategy | Unresolved | HIGH | Owner/product choice + legal review + matching store/design | Owner + Agent 13/14 | Yes before commercial launch | This dossier |
| Chat/UGC safety | Planned, not ready | BLOCKER | Terms, report, block, moderation, retention, minors | Multiplayer + Agent 13; #564 | Yes before UGC | #330/#564 |
| Creator/community rules | Planned | HIGH | Align launch/community rules to canonical moderation baseline | Agent 15 + Agent 13; #563 | Yes before creator/community launch if UGC/social interaction is enabled | #563/#564 |
| Analytics/error telemetry | Not implemented | HIGH if introduced | Govern purpose/schema/vendor/retention/consent/Play declarations | Agent 16/engineering + Agent 13; #568 | Yes before production telemetry lacking approval | #568 |
| Ads | Not implemented | BLOCKER if introduced without design | SDK/privacy/age/consent/Data Safety review | Agent 12/13/14 | Yes before ads | Monetization + #569 |
| IAP/subscriptions | Planned | HIGH | Billing, entitlement, disclosure, privacy and consumer review | Agent 12/14 + Agent 13 | Yes before paid launch | Monetization dossier |
| Third-party data/assets | Governance exists; release register incomplete | BLOCKER | Close notices/provenance/licence obligations | Agent 13/assets; #565 | Yes before unresolved material ships | Third-party register |
| OSM | Attribution visible; exact distribution boundary needs review | HIGH | Preserve attribution and professionally review ODbL distribution obligations | Agent 13/world-data | Yes before commercial distribution if unresolved | Brăila source/layout/HUD |
| GeoNames | Source/licence recorded | HIGH | Include shipped attribution/source/change record | Agent 13/world-data | Yes before relevant data ships | Country Catalog audit |
| Natural Earth | Public-domain provenance recorded | LOW | Retain source/version/hash evidence | World-data + Agent 13 | No if provenance intact | World-data governance |
| Generated runtime art | Governance exists; legal chain needs strengthening | HIGH | Provider/terms/input/edit/hash record per shipped family | Assets + Agent 13; #565 | Yes for unresolved runtime asset | Asset registries |
| Trademark/name clearance | Not professionally completed | HIGH | Qualified clearance for product marks | Owner + qualified IP counsel | Yes before commercial brand launch | This dossier |
| Store/launch creative rights | Planned | HIGH | Review screenshots/video/music/logos/claims/disclosures | Agents 14/15 + Agent 13; #561/#570 | Yes before publication | #561/#570 |
| Processor/subprocessor/transfer register | Not final | HIGH | Review actual commercial vendors/regions/contracts | Agent 13 + owner/operator | Yes before personal-data production | This dossier |
| Secrets in client | Architecture forbids | HIGH | Continue CI/code review enforcement | Security/architecture | Yes if violated | #363/shared authority canon |
| DROPi token/crypto | Explicitly out of scope | INFORMATIONAL | Separate regulatory review if ever proposed | Separate future project | N/A now | #348 boundary |

---

## 17. Professional legal-review checklist

The following items require qualified legal/IP/privacy review before commercial launch:

- final Privacy Policy and Terms;
- controller identity/contact and jurisdiction-specific notices;
- target-age/minor strategy;
- GDPR lawful bases and ePrivacy/consent design;
- international transfer mechanisms for actual providers;
- consumer terms for IAP/subscriptions/promotions;
- UGC/community terms and child-safety obligations;
- trademark clearance for `DROPi`, `DROPi Tycoon`, logo/icon and promoted names;
- exact ODbL treatment of distributed databases/derived databases/produced works;
- generated-art chain-of-title/protectability for material brand/runtime art;
- dispute/governing-law/liability language;
- any future real-money marketplace or financial feature.

Engineering can directly implement, without pretending to make final legal conclusions:

- authentication/authorization;
- public/private schema separation;
- deletion/retention/export tooling;
- processor inventory plumbing;
- telemetry minimization controls;
- reporting/blocking/moderation mechanics;
- third-party notices surface;
- provenance hashes/manifests;
- dependency licence inventory;
- feature flags that keep non-compliant capabilities disabled;
- tests and release evidence.

---

## 18. Release rule

DROPi Tycoon is not **LEGAL/PRIVACY RELEASE READY** merely because this dossier exists.

A commercial release may be marked compliant only when:

1. the exact shipped build and backend are re-audited;
2. all applicable blocker rows are closed or the affected features are disabled;
3. #569 declarations match actual behavior;
4. third-party notices/provenance are complete;
5. target-age and store content are settled;
6. owner-only Play Console steps are evidenced by Agent 14/#571;
7. required professional legal review is documented;
8. no document claims functionality, collection, consent or safeguards that the build does not actually provide.

Any material change to accounts, SDKs, ads, analytics, chat, payments, location, UGC, processors or shipped third-party assets reopens the relevant compliance review.

---

End of canonical dossier.
