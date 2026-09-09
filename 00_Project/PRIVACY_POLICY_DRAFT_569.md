# Privacy Policy — DROPi Tycoon

Status: **DRAFT — NOT READY FOR PUBLICATION OR PLAY CONSOLE SUBMISSION**
Draft date: 2026-09-09
Current-source baseline: `647adfe31e38c47ad73e3a4e98ece70407ffa28c`

> This draft contains required owner/legal placeholders. It must not be published with `OWNER INPUT REQUIRED` text. It is engineering-prepared wording aligned with the audited current release and is not a substitute for qualified legal advice.

## 1. Who we are

DROPi Tycoon is provided by:

**Developer / data controller:** OWNER INPUT REQUIRED — exact legal name/entity that will appear on the Google Play listing.

**Privacy contact:** OWNER INPUT REQUIRED — public email address or other reliable inquiry mechanism.

**Postal/business address:** OWNER INPUT REQUIRED — include the legally appropriate address/details for the publishing entity and applicable jurisdictions.

This Privacy Policy applies to the Android application **DROPi Tycoon**, package `com.dropi.tycoon`, for the release behavior described below.

## 2. Current privacy design

The current production release is designed as a locally running game. The Phaser game runtime is packaged inside the installed Android application and is served to the in-app WebView from a loopback address on the user's own device.

At the audited source baseline, ordinary gameplay does not require a DROPi Tycoon online account and no implemented production path was found that sends gameplay save data, local game identifiers or player activity to DROPi Tycoon servers.

Before this policy is published for a release, these statements must be revalidated against the exact signed Android App Bundle and its observed network behavior.

## 3. Data stored locally on your device

DROPi Tycoon stores game progress and settings in application/WebView local storage so that gameplay can continue between sessions.

Local game data can include:

- fictional company name and company progression;
- virtual company money, level and reputation;
- game employee records, roles, salaries and assignments;
- game payroll and virtual financial totals;
- delivery/order and customer-review state;
- purchased game upgrades;
- owned game vehicles and assignments;
- headquarters progression;
- tutorial and sound settings;
- merchant onboarding and selected game transport;
- fictional personal capability/progression state;
- other simulation/ownership state required to continue the game.

The game also uses local technical identifiers for its World Instance/account/hero model. In the audited release these are game-local identifiers used for deterministic simulation. They are not login credentials and are not evidence of a registered online user account.

At the audited source baseline, this local game data is not transmitted off the device by an implemented production client flow.

## 4. Data we currently collect from the app

**Audited current release: no user data collection identified in production source.**

For Google Play Data Safety purposes, collection generally means transmitting data from the app off the user's device. The audited production source currently keeps ordinary gameplay state on-device and does not include an implemented analytics, advertising, real-money billing, chat/UGC, account-authentication or application crash-reporting flow.

This statement is release-specific. It must be changed before publication if final Android artifact inspection or network testing shows that an included library or SDK transmits user or device data.

## 5. Data we currently share

**Audited current release: no user-data sharing identified in production source.**

The current release does not intentionally send user data to advertising networks, analytics providers or other third parties from ordinary gameplay.

Final Android artifact and SDK verification is required before this statement becomes publication-ready.

## 6. Accounts and authentication

The audited current release does not offer production online account registration or login.

The internal/local `accountId` used by the game is a technical game identifier and is not a registered account with an email address, password or social-login credential.

If online accounts are enabled in a future release, this Privacy Policy will be updated before that release and account deletion/data-rights functionality must be implemented as required by applicable law and Google Play policy.

## 7. Analytics

The audited current release does not intentionally use an application analytics service and no analytics SDK or gameplay telemetry endpoint was found in current release source.

If analytics are added later, this policy and Google Play Data Safety disclosures will be updated before release to explain the data, purposes, providers, retention and user choices where applicable.

## 8. Advertising

The audited current release does not contain an implemented advertising service or advertising SDK.

The game does not intentionally use an Advertising ID in the audited source baseline.

If advertising is added later, this policy, Google Play Ads declaration, Data Safety declaration and any child/family compliance requirements will be re-reviewed before release.

## 9. Purchases and subscriptions

The audited current release does not implement Google Play Billing, real-money in-app purchases or subscriptions.

DROPi Tycoon contains a fictional virtual economy. Spending virtual company money inside the game is gameplay and does not mean the app has received payment-card or other real-world financial information.

Any future real-money purchase system will require updated disclosures before release.

## 10. Chat, multiplayer messages and user-generated content

The audited current release does not provide public player chat, player-to-player messaging, public posting or user-generated-content uploads.

If those features are enabled later, this policy will be updated and the required safety, moderation, report/block, retention and deletion controls will be implemented before release.

## 11. Device location

The audited current release does not intentionally request or collect the device's precise or approximate physical location.

The game contains maps and geographic data representing real-world places. Selecting or viewing a place inside the game is game-map interaction and is not the same as reading the user's GPS/device location.

This statement must be checked against the final merged Android permission manifest before publication.

## 12. Photos, camera, microphone, contacts, files and other sensitive device data

The audited current release does not intentionally provide features that require access to:

- camera/photos/videos;
- microphone or voice recordings;
- contacts;
- calendar;
- SMS/MMS;
- call logs;
- user documents/files;
- health data.

The application copies its own packaged game files into application-private storage to run the bundled game. That is not access to the user's personal documents.

Final AAB permission inspection remains required before publication.

## 13. Maps and third-party data

DROPi Tycoon packages governed geographic/game datasets, including data derived from or attributed to sources such as OpenStreetMap, GeoNames and Natural Earth. These datasets describe the game world; they are not sources of personal information about the person playing the game.

Third-party licensing/attribution information is provided separately through the game's Third-Party Notices.

## 14. Network services and server infrastructure

The audited Android production profile starts the game from bundled local assets rather than loading the public Railway website as its game page.

The project also maintains hosted server/backend prototypes for development and future online functionality. The current Android source audit did not find a production client call to the prototype authority endpoints.

If a future release connects to hosted services, this policy must be updated to describe relevant technical request data, user/account/game data, service providers, purposes, retention and international transfers where applicable.

Infrastructure providers may process technical network metadata when a service is actually contacted. Provider-specific logging/retention for future backend traffic must be reviewed before activation rather than assumed from application source.

## 15. Crash reports and diagnostics

The audited current source does not intentionally send application crash reports or diagnostic telemetry to DROPi Tycoon or a dedicated crash-reporting provider.

Final release SDK/network verification must confirm this before publication. If crash or diagnostics services are introduced, this policy will be updated to describe what is transmitted and why.

## 16. Support communications

The current app does not contain an in-app support-message submission service.

**OWNER INPUT REQUIRED — define the privacy/support contact mechanism that will be published.**

If a user voluntarily contacts the developer by email or another external support channel, the final policy must identify the responsible provider/process and describe what support data is received, why it is used, how long it is kept and how deletion/privacy requests are handled.

## 17. Retention and deletion

### Local game data

Local save data remains on the device according to the game's save behavior and Android/WebView application storage lifecycle. It may be overwritten during gameplay. Users can remove application-local data using Android app-data controls or by uninstalling the application, subject to Android/device backup behavior that must be verified for the final release configuration.

### Online account data

The audited current release has no production online account creation and therefore no DROPi Tycoon online account dataset to delete.

If account creation is enabled in a future release, the release will require a readily discoverable in-app deletion path, an external deletion/request resource and documented deletion/retention handling before publication.

### Support data

OWNER INPUT REQUIRED — retention/deletion rules for the selected privacy/support channel.

## 18. Security

DROPi Tycoon uses an app-local bundled runtime for the audited production release and restricts bundled WebView navigation to its local runtime origin.

No security measure can be described as eliminating all risk. Before any user data is transmitted to an online service in a future release, appropriate transport security, access controls and data-minimization measures must be implemented and documented.

## 19. Children and target audience

**OWNER INPUT REQUIRED — final Google Play target-audience age groups.**

This draft does not claim that DROPi Tycoon is child-directed or that it excludes children as a legal conclusion. The product owner must select the actual intended audience consistently with the game's content and marketing.

If any target audience includes children, Google Play Families requirements and applicable child-privacy laws must be reviewed and satisfied before release. Definitions and consent requirements vary by jurisdiction and require qualified review where applicable.

## 20. International transfers

The audited production gameplay flow was not found to transmit user data off-device, so no ordinary gameplay international transfer is identified in this source baseline.

OWNER INPUT REQUIRED / QUALIFIED REVIEW REQUIRED for any published support channel or future hosted service that processes personal data across jurisdictions.

## 21. Your privacy rights

Applicable privacy rights depend on the user's location and on what personal data the developer actually processes.

For the audited current gameplay flow, ordinary game progress is stored locally and is not held in a DROPi Tycoon user account database.

The final published policy must provide a working privacy contact for requests and must accurately explain any rights and processes applicable to support communications or future online data processing.

**OWNER INPUT REQUIRED — privacy request contact/mechanism.**

Qualified legal review is required before publication for jurisdiction-specific rights wording.

## 22. Changes to this policy

If the app's data practices materially change — for example through accounts, cloud saves, backend gameplay, analytics, advertising, crash reporting, purchases, notifications, chat/UGC or support forms — this policy and the Google Play Data Safety/App Content declarations must be updated before the changed release is submitted.

The final policy should identify its effective date and, where appropriate, how material changes are communicated.

**Effective date: OWNER INPUT REQUIRED.**

## 23. Contact

Privacy questions and requests:

**OWNER INPUT REQUIRED — publishable privacy contact.**

Developer/controller:

**OWNER INPUT REQUIRED — exact publishing legal entity/name.**

## Publication gate

Do not publish this draft or submit it to Google Play until all of the following are complete:

1. all `OWNER INPUT REQUIRED` placeholders are replaced with verified information;
2. DT-14/#568 verifies the exact production AAB permission/SDK/network behavior;
3. the policy is reconciled with the final Data Safety form;
4. qualified legal review addresses jurisdiction-sensitive controller/contact, child/privacy-rights, retention and international-transfer wording;
5. the final policy is hosted at an active, publicly accessible, non-geofenced HTTPS URL that is not a PDF and is not user-editable;
6. the privacy policy is accessible within the app and linked in Play Console.

## Google Play policy references reviewed 2026-09-09

- User Data / Privacy Policy: https://support.google.com/googleplay/android-developer/answer/10144311
- Data Safety: https://support.google.com/googleplay/android-developer/answer/10787469
- Account deletion: https://support.google.com/googleplay/android-developer/answer/13327111
- Target audience: https://support.google.com/googleplay/android-developer/answer/9867159
- Families: https://support.google.com/googleplay/android-developer/answer/9893335
