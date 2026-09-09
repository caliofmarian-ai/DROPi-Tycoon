# Issue #569 — Google Play Release Declaration Checklist

Status: PRE-SUBMISSION CONTROL CHECKLIST
Date: 2026-09-09
Source baseline: `647adfe31e38c47ad73e3a4e98ece70407ffa28c`
Owner lane: DT-13 Legal / Privacy / IP
Coordinates: #568, #569, #571

## Rule

Do not submit DROPi Tycoon to a closed/open/production Google Play track using stale or guessed declarations.

The final declaration set must be produced from:

1. the exact signed/release AAB;
2. actual production runtime/network behavior;
3. current Google Play policy/form wording at submission time;
4. verified owner/developer identity and contact information;
5. exact enabled gameplay/social/monetization functionality.

This checklist does not authorize Play Console submission.

## A. Owner / legal input

- [ ] **OWNER INPUT REQUIRED — exact developer/publishing legal name/entity.**
- [ ] **OWNER INPUT REQUIRED — public privacy contact mechanism.**
- [ ] **OWNER INPUT REQUIRED — legally appropriate business/postal details where required.**
- [ ] **OWNER INPUT REQUIRED — effective date for final Privacy Policy.**
- [ ] **OWNER INPUT REQUIRED — target audience age group(s).**
- [ ] Owner confirms store creative/marketing actually matches the chosen audience.
- [ ] Qualified review completed for jurisdiction-sensitive controller/contact, child/minor, privacy-rights, retention and international-transfer wording.
- [ ] Qualified review conclusion recorded without representing it as broader legal approval than was actually obtained.

## B. Final Android artifact — DT-14 / #568

- [ ] Exact AAB SHA/hash recorded.
- [ ] App package confirmed as `com.dropi.tycoon`.
- [ ] Version name/versionCode recorded.
- [ ] Production profile confirmed `bundled`, not remote development/preview runtime.
- [ ] Final merged Android manifest exported/reviewed.
- [ ] Full permission list recorded.
- [ ] High-risk/sensitive permissions: none, or every one justified and declared correctly.
- [ ] Native services/providers/receivers relevant to data handling inventoried.
- [ ] Final resolved SDK/native dependency inventory recorded.
- [ ] Play SDK Index/provider data-practice evidence reviewed where applicable.
- [ ] Installed release-equivalent build network observation completed.
- [ ] Cold start checked for non-loopback traffic.
- [ ] Start/continue gameplay checked for non-loopback traffic.
- [ ] Save/reload checked for non-loopback traffic.
- [ ] World/regional map navigation checked for non-loopback traffic.
- [ ] Settings/sound checked for non-loopback traffic.
- [ ] Background/foreground transition checked for non-loopback traffic.
- [ ] Exit/relaunch checked for non-loopback traffic.
- [ ] Every contacted non-loopback hostname/IP classified by provider, data type and purpose.
- [ ] Any automatic SDK telemetry reconciled into Data Safety + Privacy Policy.

## C. Current data-flow evidence — DT-13

- [x] Current production data-flow inventory prepared.
- [x] Bundled local runtime boundary documented.
- [x] Local save categories documented.
- [x] Local World Instance/account/hero technical identity documented.
- [x] Current explicit relative/local map-data fetches documented.
- [x] Current lack of `/api/authority` client wiring documented.
- [x] Analytics source audit documented.
- [x] Ads source audit documented.
- [x] Real-money purchase source audit documented.
- [x] Chat/UGC source audit documented.
- [x] Crash/error telemetry source audit documented.
- [x] Support/contact source audit documented.
- [x] Server application logging boundary documented.
- [x] Provider-level server/SDK behavior explicitly left for artifact/provider verification where source cannot prove it.

Primary record:

`09_Development/Compliance/CURRENT_RELEASE_DATA_FLOW_569.md`

## D. Google Play Data Safety

- [x] Proposed source-level answer set prepared.
- [ ] #568 final AAB/SDK/network evidence reconciled.
- [ ] If no off-device user-data transmission remains: confirm top-level **No data collected / No data shared** answer against exact form wording.
- [ ] If any off-device user-data transmission is found: abandon the `No` proposal and complete every affected data type/purpose/required-vs-optional/sharing/security field accurately.
- [ ] Confirm library/SDK behavior is included, not only first-party code.
- [ ] Confirm WebView behavior reflects bundled release, not development/preview configuration.
- [ ] Confirm local-only app interactions/save state are not incorrectly declared as collected when they never leave device.
- [ ] Confirm account/data deletion questions match final account behavior.
- [ ] Confirm Data Safety answers match Privacy Policy exactly.
- [ ] Preserve a dated copy/screenshot/export of final answers as release evidence.

Primary record:

`09_Development/Compliance/GOOGLE_PLAY_DATA_SAFETY_EVIDENCE_569.md`

## E. Privacy Policy

- [x] Current-behavior draft prepared.
- [ ] All `OWNER INPUT REQUIRED` placeholders replaced.
- [ ] Final AAB/network findings incorporated.
- [ ] Developer/controller identity matches Play listing or policy clearly names the app/entity as required.
- [ ] Privacy contact is operational and monitored.
- [ ] Local-storage description is accurate for final save behavior.
- [ ] Accounts/auth section matches final build.
- [ ] Ads/analytics/crash/billing sections match final build.
- [ ] Chat/UGC section matches final build.
- [ ] Device-location/permission statements match final AAB.
- [ ] Support provider/data/retention disclosed if a support channel processes personal data.
- [ ] Retention/deletion wording finalized.
- [ ] Child/minor wording reconciled with owner target audience decision.
- [ ] Jurisdiction-sensitive sections receive qualified review.
- [ ] Final policy hosted at active public non-geofenced HTTPS URL.
- [ ] Final policy is not a PDF and is not user-editable.
- [ ] Privacy policy URL entered in Play Console.
- [ ] Privacy policy link/text accessible from within the app.
- [ ] Published page checked from logged-out/mobile browser.

Draft:

`00_Project/PRIVACY_POLICY_DRAFT_569.md`

## F. Ads declaration

Current source-level proposal: **No, app does not contain ads.**

- [x] No ads SDK/implementation found in source audit.
- [ ] Final AAB confirms no ads SDK/ad-serving component.
- [ ] Installed release test confirms no ads/ad overlays.
- [ ] Play Console Ads declaration set to `No` only after above confirmation.
- [ ] Store listing does not imply ads/rewarded ads that do not exist.

If ads are added, stop and re-audit before submission.

## G. App access / reviewer credentials

Current source-level proposal: **All functionality is available without special access.**

- [x] No current login/account creation/authenticated content gate found.
- [ ] Final release build confirms no sign-in restriction.
- [ ] If still unrestricted, select the Play response for all functionality being available without special access.
- [ ] If auth activates, provide dedicated valid test credentials/instructions — never a production user's credentials.

## H. Target audience / Families

- [ ] **OWNER INPUT REQUIRED — select actual intended age group(s).**
- [ ] Selection is based on design/marketing reality, not policy avoidance.
- [ ] Store copy, screenshots, characters and creative are reviewed against age selection.
- [ ] If any selected group includes children, complete Google Play Families compliance before release.
- [ ] If mixed audience with child users later has ads, neutral age screen/ad SDK requirements are implemented before release.
- [ ] Child-privacy implications receive qualified review for applicable jurisdictions.

Do not let an agent infer the final target age from visual style alone.

## I. IARC / content rating

- [x] Current factual feature evidence prepared.
- [ ] Exact final gameplay/story/visual content reviewed.
- [ ] Violence/fear/language/substances/sexual-content/user-interaction categories reviewed from submitted build.
- [ ] Current absence of public chat/UGC reconfirmed.
- [ ] Current absence of real-money gambling/wagering reconfirmed.
- [ ] Current absence of ads reconfirmed.
- [ ] Current absence of real-money IAP/Play Billing reconfirmed.
- [ ] Questionnaire completed in Play Console from facts, not projected roadmap.
- [ ] Resulting rating retained in release evidence.

## J. Accounts and deletion

Current source-level state: **no production online account creation**.

- [x] Current local `accountId` classified as technical/offline, not registered authentication.
- [ ] Final release reconfirms no account registration/login.
- [ ] If no account creation: do not falsely advertise account deletion support for a non-existent account service.
- [ ] If accounts activate: block release until #562 provides in-app deletion + external deletion URL + associated-data lifecycle.
- [ ] Data Safety and Privacy Policy updated if account behavior changes.

## K. Chat / UGC

Current source-level state: **absent**.

- [x] No active public chat/UGC found.
- [ ] Final release reconfirms absent.
- [ ] If chat/UGC activates: block release under #564 until Terms/Community Guidelines, moderation, report/block, enforcement, evidence/retention and child-safety controls are implemented.
- [ ] Re-answer Data Safety/IARC/target-audience/App Content as needed.

## L. Real-money monetization

Current source-level state: **not implemented**.

- [x] No Play Billing dependency/flow found.
- [x] Virtual game economy distinguished from real-world financial data.
- [ ] Final release reconfirms no real-money purchases/subscriptions.
- [ ] If Play Billing/IAP activates, re-audit Data Safety, Privacy Policy, payments disclosure and content rating before submission.
- [ ] If ads activate, re-audit Ads/Families/Data Safety.
- [ ] Crypto/token integration remains separate financial/regulatory review and must not be introduced under this checklist.

## M. Server / infrastructure

- [x] Current Android production client does not load Railway as the game document.
- [x] No current `/api/authority` client reference found in `game-web/src`.
- [x] App server code does not explicitly log request IP/User-Agent/body.
- [ ] Before any backend activation, Railway/reverse-proxy access-log data categories and retention reviewed.
- [ ] Processor/subprocessor and international-transfer terms reviewed before personal data is sent to hosted service.
- [ ] Backend privacy/security behavior reconciled with Data Safety and Privacy Policy.

## N. In-app legal surfaces

- [x] Third-Party Notices surface exists from #565/#589.
- [ ] Privacy Policy link/text added to the app before Play submission.
- [ ] Link target is final public policy, not draft repository text.
- [ ] Legal links are reachable without login.
- [ ] Legal surfaces are included in the bundled production runtime/AAB.

## O. Release evidence freeze

Immediately before Play submission, create/retain one immutable evidence snapshot containing:

- submitted AAB hash/versionCode;
- merged manifest/permissions;
- dependency/SDK inventory;
- network observation result;
- Data Safety answers and date;
- Ads declaration and date;
- App access answer/instructions and date;
- target audience selections and date;
- IARC response/result and date;
- privacy policy URL + content revision/hash/date;
- account-deletion answer/URL if applicable;
- UGC/chat state;
- release commit SHA.

Do not treat a previous release's declaration snapshot as valid for a later release without drift review.

## P. Current blockers before #569 can close

1. **OWNER INPUT REQUIRED:** publishing legal identity/privacy contact and target audience.
2. Privacy Policy is a draft only; stable public HTTPS publication and in-app policy access are not complete.
3. #568 exact AAB permission/SDK/network evidence is pending.
4. IARC questionnaire/result is not complete for the exact submitted build.
5. Play Console Data Safety/Ads/App Access/Target Audience declarations have not been submitted and must remain with DT-14/owner release workflow.
6. Any feature changes before submission require reconciliation.

## Official Google Play references reviewed 2026-09-09

- Data Safety: https://support.google.com/googleplay/android-developer/answer/10787469
- User Data / Privacy Policy: https://support.google.com/googleplay/android-developer/answer/10144311
- Account deletion: https://support.google.com/googleplay/android-developer/answer/13327111
- App Content / review: https://support.google.com/googleplay/android-developer/answer/9859455
- Target audience: https://support.google.com/googleplay/android-developer/answer/9867159
- Families: https://support.google.com/googleplay/android-developer/answer/9893335
- Content rating: https://support.google.com/googleplay/android-developer/answer/9859655
- Ads: https://support.google.com/googleplay/android-developer/answer/9857753
- Permissions declaration: https://support.google.com/googleplay/android-developer/answer/9214102
