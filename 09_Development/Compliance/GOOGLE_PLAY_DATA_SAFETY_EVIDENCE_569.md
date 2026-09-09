# Issue #569 — Google Play Data Safety Evidence Snapshot

Status: PROPOSED ANSWERS — DO NOT SUBMIT UNTIL FINAL AAB VERIFICATION
Date: 2026-09-09
Source baseline: `647adfe31e38c47ad73e3a4e98ece70407ffa28c`
Primary evidence: `09_Development/Compliance/CURRENT_RELEASE_DATA_FLOW_569.md`
Owner lane: DT-13 Legal / Privacy / IP
Artifact verification owner: DT-14 / #568

## Purpose

Translate the current production-source data-flow audit into a proposed Google Play Data Safety response set while preserving the distinction between source evidence and the exact signed AAB that will be submitted.

No answer in this document has been entered into Play Console.

## Official rule snapshot — reviewed 2026-09-09

Google Play currently requires a Data Safety form for apps on closed, open and production testing tracks, including apps that collect no user data. Developers are responsible for third-party SDK/library behavior.

Google Play defines `collect` as transmitting data from the app off the user's device. Access that occurs solely on-device does not need to be declared as collection when the data is never transmitted off-device. WebView/library/SDK transmissions controlled by the app remain relevant.

Official source:

https://support.google.com/googleplay/android-developer/answer/10787469

Google Play also requires all apps to provide a privacy policy, including apps that do not access personal/sensitive user data:

https://support.google.com/googleplay/android-developer/answer/10144311

## Proposed top-level Data Safety answers

### Does the app collect or share any of the required user data types?

**PROPOSED: NO.**

Basis:

- production profile uses the bundled local Phaser runtime;
- ordinary game save is WebView/local device storage;
- explicit client `fetch` calls found in current runtime resolve to relative bundled game-data paths;
- no production `/api/authority` client wiring was found;
- no analytics, ads, Play Billing or application crash-reporting SDK/configuration was found in release source;
- no login/account creation, chat/UGC or support-submission flow is active.

### Is data shared with third parties?

**PROPOSED: NO.**

No current production source flow transferring user data to another company/service was found.

### Finalization condition

The two answers above are **NOT AUTHORIZED FOR PLAY CONSOLE SUBMISSION** until #568 supplies evidence from the exact production AAB that:

1. confirms the final merged permission list;
2. confirms the resolved native SDK/dependency inventory;
3. checks applicable SDK provider disclosures / Play SDK Index entries;
4. executes an installed-build network observation covering cold start, gameplay, save/reload, map use, settings, background/foreground and exit;
5. records every contacted non-loopback hostname/IP and explains its purpose;
6. confirms there is no automatic analytics/crash/identifier/device-data transmission by included SDKs.

If any user data is observed leaving the device, this proposed `NO` answer must be replaced with category-specific declarations before submission.

## Data-type evidence table

Google Play categories are evaluated below against current source behavior. `Not collected` means no off-device transmission was found in the audited production source, not that the app never processes any local game state.

| Play data type | Proposed collection answer | Proposed sharing answer | Current evidence / rationale | Release verification |
|---|---|---|---|---|
| Name | Not collected | Not shared | No user identity/name input or online profile active; fictional company/employee names stay in game save | AAB/network verify |
| Email address | Not collected | Not shared | No login/support form/email field found | AAB/network verify |
| User IDs | Not collected | Not shared | Local game `accountId`/`heroActorId` are offline technical IDs; no current client transmission path found | Re-audit if #560/#562 activates |
| Address | Not collected | Not shared | No user address input | AAB/network verify |
| Phone number | Not collected | Not shared | No phone/login flow | AAB/network verify |
| Race and ethnicity | Not collected | Not shared | No user input or collection | AAB/network verify |
| Political or religious beliefs | Not collected | Not shared | No user input or collection | AAB/network verify |
| Sexual orientation | Not collected | Not shared | No user input or collection | AAB/network verify |
| Other personal info | Not collected | Not shared | No production personal-profile collection found | Re-audit before profiles |
| User payment info | Not collected | Not shared | No Play Billing/payment SDK or real-money checkout | Re-audit before monetization |
| Purchase history | Not collected | Not shared | No real-money purchase implementation; virtual game purchases remain local simulation state | Re-audit before Play Billing |
| Credit score | Not collected | Not shared | Not applicable | AAB/network verify |
| Other financial info | Not collected | Not shared | Virtual company economy is fictional/local game state, not real financial data | Re-audit if financial services/token integration ever added |
| Approximate location | Not collected | Not shared | No device location API/permission found; map location is game geography | Final manifest/network verify |
| Precise location | Not collected | Not shared | No device geolocation flow found | Final manifest/network verify |
| Emails | Not collected | Not shared | No mail access | Final manifest verify |
| SMS/MMS | Not collected | Not shared | No SMS permission/API | Final manifest verify |
| Other in-app messages | Not collected | Not shared | Player chat/UGC not active | #564 required before activation |
| Photos | Not collected | Not shared | No upload/photo picker/camera flow found | Final manifest verify |
| Videos | Not collected | Not shared | No upload/video flow found | Final manifest verify |
| Audio files | Not collected | Not shared | No user audio upload | Final manifest verify |
| Voice or sound recordings | Not collected | Not shared | No microphone/recording flow found | Final manifest verify |
| Music files | Not collected | Not shared | No user media access | Final manifest verify |
| Files and docs | Not collected | Not shared | App copies its own packaged files; no user document access/upload | Final manifest verify |
| Calendar events | Not collected | Not shared | No calendar API | Final manifest verify |
| Contacts | Not collected | Not shared | No contacts API | Final manifest verify |
| App interactions | Not collected | Not shared | Gameplay/progression is processed/stored locally; no analytics transmission found | AAB/network verify |
| In-app search history | Not collected | Not shared | No transmitted search telemetry | AAB/network verify |
| Installed apps | Not collected | Not shared | No package inventory use found | Final manifest/SDK verify |
| Other user-generated content | Not collected | Not shared | No active UGC surface | #564 required before activation |
| Web browsing history | Not collected | Not shared | Production WebView is constrained to bundled local runtime, not general web browsing | AAB/network verify |
| Crash logs | Not collected | Not shared | No application crash telemetry SDK/endpoint found | **Must verify included native SDKs** |
| Diagnostics | Not collected | Not shared | No application diagnostics transmission found | **Must verify included native SDKs** |
| Other app performance data | Not collected | Not shared | No performance telemetry implementation found | **Must verify included native SDKs** |
| Device or other IDs | Not collected | Not shared | No Advertising ID/device-ID use found in source | **Final AAB/SDK/network verification mandatory** |

## Security-practices answers

### Is all user data collected by the app encrypted in transit?

If the final top-level answer remains `No data collected`, there is no app-collected user data transmission to characterize under this source baseline.

Do not interpret this as permission for future plaintext network traffic. Any future production user-data transmission must use appropriate transport security and be re-declared.

### Can users request that data is deleted?

Current release does not offer production online account creation and does not hold a user account dataset on the DROPi Tycoon backend.

Local save data is stored on the device. The current app has no documented remote user-data deletion request because there is no remote user dataset in the release baseline.

Google Play's account deletion rule becomes mandatory if account creation is enabled. #562 remains the release gate for that future state.

Official account-deletion reference:

https://support.google.com/googleplay/android-developer/answer/13327111

## Data sharing exceptions

Do not rely on a sharing exception unless a real data transfer exists and its facts have been reviewed. Current proposed answer is based on **no transfer found**, not on an exception theory.

## Third-party SDK evidence

Current direct mobile runtime declarations include framework/local runtime packages but no direct ads/analytics/billing/crash-reporting SDK.

This is insufficient by itself to finalize Data Safety. Google Play expressly places responsibility on the developer for data sent by included libraries/SDKs.

#568 final artifact evidence must therefore record:

- exact resolved native packages;
- Play SDK Index/provider data-practice evidence where available;
- merged manifest permissions/services/providers/receivers;
- observed network endpoints from the signed/release-equivalent build.

## Privacy Policy consistency gate

The published privacy policy and Data Safety form must tell the same story.

Before submission:

- replace every `OWNER INPUT REQUIRED` field in `00_Project/PRIVACY_POLICY_DRAFT_569.md`;
- publish the final policy at an active, public, non-geofenced HTTPS page (not PDF);
- add the same policy URL in Play Console;
- provide an in-app privacy-policy link/text as required by current Google Play User Data policy;
- ensure any SDK/network finding from #568 is reflected in both the policy and this Data Safety snapshot.

## Drift triggers

The proposed `NO collection / NO sharing` answer becomes stale immediately if any of these activate:

- authenticated accounts or cloud profiles;
- server-synced game saves;
- analytics or crash telemetry;
- ads/Advertising ID;
- Play Billing or subscription services;
- push notifications;
- chat/UGC;
- support/contact submission inside the app;
- external uploads/media;
- remote config or personalization;
- any production backend request carrying user/device/game identifiers.

## Sign-off state

| Gate | State |
|---|---|
| Source-level data-flow audit | COMPLETE for baseline |
| Proposed Data Safety answers | PREPARED |
| Exact final AAB permissions | PENDING #568 |
| Exact final AAB SDK inventory | PENDING #568 |
| Installed release network capture | PENDING #568 / release verification |
| Public privacy policy | BLOCKED — OWNER INPUT REQUIRED + publication |
| In-app privacy link | NOT IMPLEMENTED / separate release action |
| Play Console Data Safety submission | NOT PERFORMED |
| Qualified legal review where jurisdiction-sensitive | PENDING |
