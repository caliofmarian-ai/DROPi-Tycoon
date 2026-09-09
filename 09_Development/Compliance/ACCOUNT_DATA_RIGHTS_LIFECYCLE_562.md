# Issue #562 — Account Deletion, Retention and Data-Rights Lifecycle

Status: **IMPLEMENTATION CONTRACT — NOT PRODUCTION COMPLIANCE**
Date: 2026-09-09
Baseline main: `36beafa99a7d711e6c74ce7871e4df304d0277bc`
Owner lane: DT-13 — Legal / Privacy / IP
Coordinates: #328, #335, #363, #560, #562, #564, #568, #569, #571

## 1. Purpose

This document defines the implementation-ready privacy lifecycle that DROPi Tycoon must use **before production account creation is enabled**.

It governs:

- account-deletion requests;
- access requests;
- rectification/correction requests;
- portability requests where legally applicable;
- retention exceptions;
- deletion propagation to authoritative stores, processors and backups;
- minimal completion/audit evidence;
- the required in-app and external/web account-deletion surfaces for Google Play readiness.

This document does **not**:

- activate production accounts;
- select an authentication provider;
- create a production deletion endpoint;
- make client-supplied account/actor IDs authoritative;
- submit Google Play forms;
- state that future data categories are collected today;
- establish final jurisdiction-specific lawful bases or retention periods;
- replace qualified legal advice.

The pure implementation contract lives at:

`game-web/src/privacy/accountDataRightsLifecycle.ts`

Deterministic contract coverage lives at:

`game-web/tests/account-data-rights-lifecycle.test.ts`

---

## 2. Current release truth

The current production-source data-flow evidence remains governed by:

`09_Development/Compliance/CURRENT_RELEASE_DATA_FLOW_569.md`

At the audited release boundary:

- Android production uses the bundled Phaser runtime;
- ordinary gameplay state is stored locally on the device;
- the local `accountId` / World Instance / hero identity is technical offline game identity, not production authentication;
- no production online account registration/login is active;
- no production client call to `/api/authority/*` was found in the audited runtime;
- no current ads, application analytics, Play Billing, player chat/UGC or application crash-reporting flow was identified in the production source audit.

Since that evidence pack, a provider-neutral commercial entitlement **domain contract** has been merged. That does not itself activate Google Play Billing, account persistence, purchase transmission or a new current user-data flow. If a commercial provider/billing/account integration activates later, #569 must be re-audited and the corresponding account-data categories in this contract must be activated deliberately.

### Current-vs-future invariant

A category marked `FutureConditional` in the lifecycle contract is a preparedness category only. It must not be described in the Privacy Policy or Play Data Safety form as current collection merely because the contract knows how it would be deleted later.

---

## 3. Hard security dependency — #560

Issue #560 remains a hard dependency before production account rights can execute against online account data.

Current prototype server authority reports authentication as `not-configured`. Client-supplied `actorId`, `aggregateId`, local `accountId`, profile ID, username or request-body account ID must **never** become proof that a requester owns an account.

### Required authorization boundary

A production data-rights operation may become `Authorized` only when:

1. the server has a real authenticated session/account context;
2. identity verification appropriate to the request is complete;
3. the authenticated account identity is derived server-side;
4. that server-derived account identity matches the target account;
5. any elevated/manual support flow uses a separately governed staff authorization model with auditability and least privilege.

The pure contract therefore returns `AuthenticationNotConfigured` while #560 authentication is absent.

### Forbidden implementation shortcuts

Do not authorize deletion because:

- the client sent the same `accountId` stored locally;
- the client sent the same `actorId` used by the authority prototype;
- a display name matches;
- a public profile aggregate ID is known;
- a request knows a receipt/command ID;
- an email/support message merely claims ownership without a governed verification process.

No production account-deletion endpoint should be exposed until #560 establishes the authenticated/server-authorized boundary.

---

## 4. Governed request lifecycle

Canonical states:

1. `Received`
2. `AwaitingIdentityVerification`
3. `Authorized`
4. `Processing`
5. `AwaitingProcessorCompletion`
6. `RetentionReview`
7. `Completed`
8. `Rejected`

### State semantics

#### `Received`

A request has entered a governed channel. No deletion or disclosure is authorized yet.

Permitted next states:

- `AwaitingIdentityVerification`
- `Rejected`

#### `AwaitingIdentityVerification`

The system is verifying the request against the authenticated account or the approved external identity-verification process.

Permitted next states:

- `Authorized`
- `Rejected`

#### `Authorized`

The server-side authorization boundary has confirmed that the requester is allowed to exercise the request for the target account.

Permitted next states:

- `Processing`
- `Rejected`

#### `Processing`

Authoritative stores are applying the request. For deletion this means resolving the active data-category plan and deleting, irreversibly de-identifying, propagating, or isolating only the justified retained subset.

Permitted next states:

- `AwaitingProcessorCompletion`
- `RetentionReview`
- `Completed`
- `Rejected`

#### `AwaitingProcessorCompletion`

A processor/subprocessor or remote authoritative store has not yet returned governed completion evidence.

Permitted next states:

- `Processing`
- `RetentionReview`
- `Completed`
- `Rejected`

#### `RetentionReview`

One or more records may be subject to a documented retention exception. The review must narrow retention to the minimum justified subset and attach a policy/reference plus a bounded expiry trigger.

Permitted next states:

- `Processing`
- `Completed`
- `Rejected`

#### `Completed`

Terminal. The operation is complete according to the authoritative plan and required processor confirmations. A minimal audit record may remain according to its own governed retention rule.

#### `Rejected`

Terminal. Rejection must have a governed reason and, where applicable, user-facing information about why the request could not be fulfilled and what review/complaint route applies.

### Transition invariant

A request cannot move directly from `Received` to `Authorized`. Identity verification is mandatory for production account data.

---

## 5. Data-category and retention matrix

No fixed retention duration is invented by this engineering contract. Exact periods and legal bases must be approved before the relevant category activates.

| Category | Current status | Account-associated? | Default deletion action | Retention rule / release requirement | Legal review |
|---|---|---:|---|---|---:|
| `LocalGameSave` | CURRENT LOCAL ONLY | No | Separate local reset | Account deletion and local save reset are separate choices. Do not silently erase local gameplay merely because an online account is deleted. | No for separation rule; backup/platform behavior still needs release verification |
| `AccountCore` | FUTURE CONDITIONAL | Yes | Delete | Delete on authorized account deletion unless a documented legal exception covers a minimum subset. | Required before activation |
| `PublicProfile` | FUTURE CONDITIONAL | Yes | Delete | Remove profile and public/private account linkage. | Required before activation |
| `AvatarMedia` | FUTURE CONDITIONAL | Yes | Delete | Delete account-owned media and revoke public references/CDN/object-store access. | Required before activation |
| `CloudGameState` | FUTURE CONDITIONAL | Yes | Delete | Delete account-linked cloud game state unless a documented exception covers a specific minimum subset. | Required before activation |
| `CommercialEntitlementRecord` | FUTURE CONDITIONAL | Yes | Irreversibly de-identify by default | If real billing activates, accounting/refund/fraud/legal obligations and minimum retained fields must be determined before release. | Required |
| `SecurityAndAbuseRecord` | FUTURE CONDITIONAL | Yes | Irreversibly de-identify by default | Retain only a justified minimum subset where security/fraud/legal-claims needs apply. No blanket indefinite retention. | Required |
| `SupportCorrespondence` | FUTURE CONDITIONAL | Yes | Delete | Delete/de-identify after support purpose and any justified retention need ends. | Required |
| `UGCModerationRecord` | FUTURE CONDITIONAL | Yes | Irreversibly de-identify by default | If UGC activates, define safety/moderation/legal retention and minor-safety treatment first. | Required |
| `ProcessorReplica` | FUTURE CONDITIONAL | Yes | Delete at processor | Propagate deletion through the active processor/subprocessor contract and collect completion confirmation. | Required |
| `BackupReplica` | FUTURE CONDITIONAL | Yes | Suppress restore + expire | Deleted account data must not be restored into live service; backup copies expire under a validated backup-retention policy. | Required |

### Why the matrix has future categories

The matrix is a release guard. It prevents a future account/profile/avatar/cloud/billing/chat feature from being added without also defining how its data leaves the system.

It does not establish that any `FutureConditional` category exists in the current production release.

---

## 6. Retention exceptions

Erasure is not an instruction to destroy every record in every circumstance. Some jurisdictions may permit or require limited retention for legal obligations, fraud/security prevention, or legal claims. Those exceptions are legal decisions, not developer guesses.

Canonical engineering exception reasons:

- `LegalObligation`
- `FraudOrSecurity`
- `LegalClaims`

Every exception must contain:

- exact data category;
- controlled reason;
- approved policy/legal reference;
- description of the **minimum retained subset**;
- a bounded `expiresWhen` criterion.

The contract rejects:

- empty policy references;
- empty retained scope;
- `indefinite`, `forever` or `never` expiry language;
- exceptions for categories that are not eligible for account-retention exceptions.

### Professional legal review required

Before production accounts activate, qualified review must determine:

- lawful basis/purpose for each active category;
- actual retention period or objective retention trigger;
- applicable statutory/accounting/tax/refund/fraud obligations if billing activates;
- legal-claims retention;
- child/minor request and parental-authority rules if relevant;
- international processor/transfer rules;
- UGC/moderation/safety evidence rules if relevant.

---

## 7. Deletion execution plan

Deletion operates only on categories confirmed active for the release/account.

A deletion worker/service must never treat the existence of a row in the matrix as proof that data exists.

### Default operation

For each active account-associated category:

1. resolve the canonical policy;
2. check whether a valid approved retention exception applies;
3. if no exception applies, execute the default deletion/de-identification action;
4. if a processor owns a replica, propagate the operation and await confirmation where required;
5. if a backup may contain the data, prevent restoration to the deleted account and let the copy expire through the approved backup policy;
6. record only minimal completion evidence.

### If a retention exception applies

Do not keep the full record by convenience.

Retain only the documented subset and remove/de-identify fields outside that scope where technically and legally appropriate.

The retained subset must not be used for a new incompatible purpose merely because deletion was requested.

---

## 8. Processor and subprocessor propagation

Before an online account category uses a processor/subprocessor, the processing inventory must record:

- provider/service;
- data categories;
- purpose;
- authoritative/replica role;
- deletion API/process;
- expected deletion confirmation mechanism;
- backup behavior;
- contract/DPA reference where applicable;
- subprocessor handling where applicable;
- international-transfer review where applicable.

### Completion rule

A request that requires processor deletion should not be marked complete merely because the primary database row disappeared if a required processor operation is still outstanding.

Use `AwaitingProcessorCompletion` until governed confirmation or an approved operational exception exists.

### Evidence rule

Store confirmation/reference IDs needed to prove the operation, not a copy of the personal payload being deleted.

---

## 9. Backups

Backups require a distinct lifecycle because immediate selective mutation of immutable backup media may not be technically appropriate.

Before production account storage activates, the backup policy must define:

- backup scope;
- encryption/access controls;
- retention/expiry schedule;
- restore controls;
- how deletion markers/suppression prevent erased accounts from returning to live service after restore;
- whether restored systems re-run deletion/tombstone reconciliation;
- who is authorized to perform restores;
- how backup expiry is evidenced.

No fixed backup retention period is approved by this document.

**OWNER / OPERATIONS / LEGAL INPUT REQUIRED.**

---

## 10. Minimal completion and audit evidence

A rights system needs enough evidence to show that a governed request completed without retaining the deleted personal payload unnecessarily.

The pure contract's completion evidence intentionally omits:

- account ID;
- target account ID;
- email;
- username/display name;
- avatar;
- request body/payload;
- copies of deleted records.

It may contain:

- opaque request ID/reference;
- request type;
- completion timestamp;
- outcome;
- category + action outcomes;
- retention exception policy references;
- processor confirmation references.

The retention period for even this minimal audit evidence must be governed before production activation.

---

## 11. Access requests

When legally applicable, an authenticated user must be able to obtain the personal data and processing information required by the governing privacy regime.

Engineering requirements once account data exists:

- source only from authoritative active stores;
- verify requester identity before disclosure;
- do not disclose another user's data through cross-account references;
- redact third-party personal data where required;
- return understandable data plus required processing context;
- record completion without storing an unnecessary duplicate export forever.

**Legal review required** for exact scope, exemptions and response wording.

---

## 12. Rectification / correction

The rights service must distinguish:

- user-editable account/profile fields;
- immutable audit/transaction facts;
- computed gameplay projections;
- data that is inaccurate and must be corrected;
- data where a requested change must be rejected for a governed reason.

A correction must propagate to authoritative processors/replicas where required.

Public profile presentation must not be used as a hidden private-account store.

---

## 13. Portability

Do not promise universal export portability for every category.

The contract marks portability as `ConditionalLegalReview` because applicability depends on legal conditions including the nature of the data and the legal basis/processing context.

Where portability applies, export should be:

- authenticated;
- structured;
- commonly used;
- machine-readable;
- limited to applicable user data;
- delivered without exposing third-party/private system data.

Final category-by-category applicability requires qualified review.

---

## 14. Response-time operations

Where GDPR applies, operational design should support the statutory response framework, including the ordinary one-month response period and permitted extensions/notifications for qualifying complex requests.

This is an operational planning requirement, not a promise that every jurisdiction uses the same deadline.

The production implementation should therefore record:

- received timestamp;
- verification/authorization timestamp;
- deadline/status;
- extension notification where legally permitted/required;
- completion/rejection timestamp.

Do not hard-code one global legal deadline into the domain without jurisdiction-aware policy review.

---

## 15. In-app deletion surface — required before account creation

If production account creation is enabled, the app must provide a readily discoverable path to initiate deletion from inside the app.

Implementation requirements:

- visible under account/profile/settings rather than hidden behind support prose;
- clear distinction between `Delete online account` and `Reset local game save`;
- explain material consequences before confirmation;
- re-authenticate/verify as required by the security model;
- do not require the user to know an internal account ID;
- do not claim immediate full deletion if documented retention/backup completion remains pending;
- provide request status/completion feedback where appropriate.

No visible production control should be added until #560 can authorize it safely.

---

## 16. External/web deletion path — required before account creation

For Google Play readiness, an app that permits account creation must also provide a discoverable external resource through which a user can request account/data deletion without relying on having the app installed.

The external resource must:

- be a stable public HTTPS URL;
- clearly identify DROPi Tycoon/app/developer;
- provide a governed deletion-request path;
- verify identity safely;
- not ask users to publish credentials/secrets;
- explain which associated data is deleted and any justified retained categories in the final legally reviewed wording;
- integrate with the same server-authoritative request lifecycle as the in-app path rather than creating a second untracked deletion queue.

**OWNER INPUT REQUIRED:** final public domain/URL and publishing identity.

---

## 17. Local save reset is not account deletion

The current release has local gameplay state without a production online account.

Therefore:

- clearing the local Save v2 data is not evidence of deleting an online account;
- deleting a future online account must not silently erase local gameplay unless the user explicitly chooses that outcome and the product contract supports it;
- uninstall/app-data clearing is an OS-level local-data action, not a substitute for a future server account deletion route;
- if cloud sync later links local and online state, the distinction and consequences must be re-reviewed.

This separation is enforced by the `LocalGameSave` category using `SeparateLocalReset`.

---

## 18. Owner/controller/contact fields

The production privacy lifecycle cannot be publicly finalized until the publishing/controller identity is known.

Current required owner inputs remain:

- **Developer / data controller legal identity:** `OWNER INPUT REQUIRED`
- **Privacy contact:** `OWNER INPUT REQUIRED`
- **Business/postal details where legally required:** `OWNER INPUT REQUIRED`
- **Public privacy-policy URL/domain:** `OWNER INPUT REQUIRED`
- **External account-deletion URL:** `OWNER INPUT REQUIRED`
- **Final target-audience age groups:** `OWNER INPUT REQUIRED`

Do not infer these from a GitHub username, repository email, Railway account or app package name.

---

## 19. Privacy Policy / Data Safety synchronization

Before production account creation becomes active:

1. update `CURRENT_RELEASE_DATA_FLOW_569.md` from the exact implemented release;
2. update the Privacy Policy to describe only active data categories;
3. update Play Data Safety based on exact AAB + active backend/processor behavior;
4. update account-deletion wording and external URL;
5. re-audit SDKs, backend logs, authentication, support, billing, chat/UGC and processors;
6. preserve a dated declaration/evidence snapshot.

A future feature PR that activates an account-data category without updating this lifecycle/data inventory is incomplete.

---

## 20. Implementation contract provided in this slice

`accountDataRightsLifecycle.ts` provides:

- request-type vocabulary;
- lifecycle states and allowed transitions;
- #560 authentication hard gate;
- server-derived account-identity authorization rule;
- current-local vs future-conditional data-category registry;
- default deletion actions;
- documented/bounded retention-exception validation;
- deterministic deletion-plan construction;
- processor/backup action semantics;
- minimal completion-evidence construction;
- access/rectification/portability handling rules;
- Play deletion-surface readiness check.

It deliberately provides **no HTTP route, database table, authentication provider or production UI**.

---

## 21. Deterministic acceptance coverage

Tests prove that:

- terminal lifecycle states cannot reopen;
- a request cannot skip identity verification;
- `NotConfigured` authentication blocks production authorization;
- unauthenticated or account-mismatched requests are rejected;
- server-authenticated matching account context can authorize the pure contract;
- local save reset is separate from online account deletion;
- processor deletion and backup suppression/expiry are distinct actions;
- retention exceptions must be documented, scoped and bounded;
- invalid/unbounded retention exceptions fail closed;
- minimal completion evidence does not retain account ID or deleted payload;
- portability remains conditional rather than universally promised;
- Play readiness requires real production authentication plus both in-app and external/web deletion paths;
- future-conditional categories are not misclassified as current collection.

---

## 22. Remaining blockers after this contract

This slice does **not** close #562 by itself.

Before #562 can close and production account creation can be enabled, the project still needs:

1. #560 production authentication/authorization;
2. actual production account schema/provider selection;
3. controller/privacy-contact owner input;
4. final lawful-basis and retention matrix for every category that actually activates;
5. processor/subprocessor inventory and contracts where applicable;
6. backup policy and restore-suppression implementation;
7. server-side rights request persistence/workers with access control;
8. production in-app deletion surface;
9. stable external HTTPS deletion resource;
10. actual access/rectification/export implementation for activated account data;
11. qualified legal review for jurisdiction-sensitive conclusions;
12. #568 exact release-artifact evidence and #569 declaration refresh before Play submission.

Until these are complete, **production account creation remains blocked**.

---

## 23. Professional legal-review markers

Qualified review is explicitly required for:

- controller/legal-entity wording;
- privacy notice language;
- lawful bases;
- exact retention periods/triggers;
- erasure exceptions;
- legal/accounting/tax/refund/fraud record retention if billing activates;
- portability applicability;
- child/minor requests and parental authority;
- UGC/moderation evidence retention;
- support/legal-claims records;
- international processors/transfers;
- jurisdiction-specific response deadlines/exemptions;
- final public deletion-policy wording.

No repository document or test result is a substitute for that review.

---

## 24. Official policy / regulatory sources

Recheck these sources immediately before implementation/release because platform policy and regulatory guidance can change:

Google Play — Account deletion requirements:
https://support.google.com/googleplay/android-developer/answer/13327111

Google Play — User Data policy:
https://support.google.com/googleplay/android-developer/answer/10144311

European Commission — Dealing with requests from individuals:
https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/dealing-requests-individuals_en

European Commission — Rights for citizens:
https://commission.europa.eu/law/law-topic/data-protection/information-individuals_en

European Data Protection Board — Data subject rights:
https://www.edpb.europa.eu/topics/key-gdpr-concepts/data-subject-rights_en

European Data Protection Board — Frequently asked questions:
https://www.edpb.europa.eu/contact/frequently-asked-questions_en

European Data Protection Board — 2026 right-to-erasure implementation findings:
https://www.edpb.europa.eu/news/edpb-identifies-challenges-hindering-the-full-implementation-of-the-right-to-erasure_en

---

## 25. Canonical invariant

> **No production account without authenticated authority. No account deletion without verified authorization. No retention without a documented purpose and bounded rule. No future data category may be presented as current collection until the release actually activates it.**
