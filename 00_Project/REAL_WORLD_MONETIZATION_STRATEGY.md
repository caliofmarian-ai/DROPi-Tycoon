# Document Information

Document: REAL_WORLD_MONETIZATION_STRATEGY.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Canonical — Real-World Monetization Strategy Authority
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-08

---

# DROPi Tycoon Real-World Monetization Strategy

## Purpose

This document is the canonical commercial strategy for how DROPi Tycoon may generate **real-world business revenue for the Project Owner** without corrupting the game design.

It owns the boundary between the fictional game economy and the real commercial economy of the product.

It does **not** define:

- Personal Money;
- Company Money;
- in-game prices, wages, taxes, production costs or company accounting;
- simulated business revenue;
- a premium in-game economic currency;
- blockchain, tokenomics, wallets, NFTs or real-money rewards;
- Google Play release implementation;
- legal/privacy policy;
- marketing creative production.

Those areas remain owned by their respective canonical domains and agents.

The commercial rule is:

> **GAME FIRST. MONETIZATION SUPPORTS THE GAME.**

The player should want to spend money because DROPi Tycoon is worth supporting, personalizing and continuing to experience — not because the game has deliberately made ordinary play frustrating.

---

# 1. Canonical Context and Audit Baseline

This strategy was created against `main` commit:

`8e340b7131c4bdc890c38ba34e88d94858897cb3`

The audit included the latest 30 merged pull requests, current open pull requests and active agent branches on 2026-09-08.

Important active workstreams at the time of this decision include:

- player economy / employee-first gameplay;
- professions and personal capability;
- production and supply-chain foundations;
- World Instance persistence;
- Android visual quality;
- narrative, missions and visual storytelling;
- Brăila / global-world data work;
- CI and Railway hardening.

This document does not take ownership of those files or systems.

The audit also reconciled at least:

- `00_Project/VISION.md`;
- `00_Project/BUSINESS_DESIGN.md`;
- `00_Project/PRODUCT_EXPERIENCE_PRINCIPLES.md`;
- `00_Project/PHASE1_GAME_ARCHITECTURE_DECISION_BASELINE.md`;
- `01_GameDesign/COMPANY_SOCIETY_AND_MULTIPLAYER.md`;
- `06_Technical/ARCHITECTURE.md`;
- `06_Technical/MOBILE_APPLICATION_PLATFORM.md`;
- `06_Technical/DURABLE_AUTHORITY_AND_AUTHENTICATION.md` and current authority direction;
- `07_UI/PLAYER_SMARTPHONE.md`;
- Issue #328 — account/profile/VIP identity foundation;
- Issue #348 — player smartphone + multiplayer company society umbrella.

Repository searches covered:

`monetization`, `advertising`, `ads`, `rewarded`, `premium`, `VIP`, `subscription`, `purchase`, `billing`, `IAP`, `store`, `Google Play`, `revenue`, `analytics`, `pricing`, and `entitlement`.

### Current implementation truth

At this baseline:

- no real-money monetization system is implemented;
- no Google Play Billing dependency is present in `game-mobile/package.json`;
- no advertising SDK is present;
- no commercial analytics SDK is present;
- no production premium-currency system is authorized;
- historical references to `DROPiCoins` as an approved premium wallet/currency are stale and non-canonical;
- the current mobile shell is Expo / React Native hosting the authoritative Phaser runtime;
- Google Play is the intended Android distribution channel;
- Railway is currently a secondary web/backend-capable platform rather than the permanent normal-startup dependency of the installed game;
- the connected Railway account currently exposes one `DROPi-Tycoon` project, one `production` environment and one `DROPi-Tycoon` service, with no attached volumes at the time of audit;
- persistent/server-authoritative multiplayer state is still being staged separately.

Therefore this first commercial PR is strategy and implementation governance only. It does not authorize payment, ad or analytics SDK installation.

---

# 2. Separation of the Two Economies

DROPi Tycoon has two fundamentally different economic layers.

## 2.1 Fictional game economy

Examples:

- Personal Money;
- Company Money;
- wages;
- customer payments;
- company expenses;
- inventory;
- production inputs;
- vehicles;
- property;
- training costs;
- shares and dividends;
- logistics revenue.

These values represent economic power **inside a World Instance**.

## 2.2 Real commercial economy

Examples:

- Google Play purchase revenue;
- subscription revenue;
- advertising revenue;
- supporter-pack revenue;
- sponsorship revenue;
- platform fees;
- infrastructure cost;
- content-production cost;
- customer-support cost;
- marketing spend;
- taxes and accounting obligations;
- owner pre-tax business contribution.

These values belong to the real business operating DROPi Tycoon.

## 2.3 Non-conversion rule

Real money must not convert directly or indirectly into World-Instance economic power.

A purchase must never mint, multiply or guarantee:

- Personal Money;
- Company Money;
- productive inventory;
- fuel/energy;
- productive assets;
- shares;
- wages;
- customer demand;
- production output;
- market liquidity;
- competitive capacity.

Likewise, fictional game wealth is not redeemable for real money.

---

# 3. Monetization Principles

All real-world monetization must satisfy the following principles.

## 3.1 Game first

A non-paying player receives the complete core game loop and a legitimate path through employment, training, company formation, logistics, production and world participation.

The game must be enjoyable without purchases or ad viewing.

## 3.2 No pay-to-win

Real spending buys expression, support, optional content or tightly bounded convenience — never competitive economic dominance.

## 3.3 No manufactured frustration

The game must not deliberately create an artificial problem merely to sell the solution.

Prohibited examples include:

- intentionally slow basic movement followed by a paid speed boost;
- artificial inventory pain followed by paid productive capacity;
- punitive energy/stamina depletion followed by paid refills;
- false scarcity designed around purchase pressure;
- fake countdowns;
- manipulative streak loss;
- intentionally bad mission odds sold back as a paid retry.

## 3.4 Respect player time

Purchases may make the experience more expressive or easier to organize, but must not invalidate time invested by non-paying players.

## 3.5 Transparent value

Every product must clearly state what the player receives.

No paid random reward whose value is unclear or whose odds create gambling-like pressure is part of the recommended model.

## 3.6 Global accessibility

The base game remains free at launch unless later commercial evidence justifies a different model.

Regional store pricing should use lawful platform localization and purchasing-power-aware price testing where supported, not sensitive personal profiling.

## 3.7 Offline resilience

Core offline/local play remains functional where canonically intended.

A paid entitlement that is not inherently online must have a recovery/restore strategy and must not make the entire game unusable during a temporary backend failure.

## 3.8 Account-wide cosmetics, world-local power

The Phase-1 architecture allows explicitly non-economic account state such as cosmetics to follow an account between World Instances.

That makes cosmetic entitlement a suitable commercial layer.

Economic power remains World-Instance-local.

---

# 4. Hard Fairness Rules

Real money must never allow a player to:

1. bypass profession requirements;
2. bypass education or practical certification;
3. bypass safety/capability requirements;
4. create Personal Money or Company Money;
5. buy guaranteed competitive dominance;
6. bypass city/world permissions or territorial capacity;
7. bypass production inputs or inventory constraints;
8. teleport cargo;
9. bypass cargo custody or mission rules;
10. remove legitimate operating costs;
11. buy permanent route priority over non-paying players;
12. obtain exclusive productive infrastructure that free players can never counter;
13. buy shares or company control with real money;
14. buy a better economic RNG outcome;
15. buy protection from bankruptcy or economic failure;
16. buy shorter qualification/training time when that timing represents earned capability;
17. import mature economic power into a fresh World Instance;
18. buy irreversible multiplayer advantages.

### Cosmetic implementation guard

A cosmetic may not secretly change gameplay.

Examples:

- vehicle skins must not alter speed, cargo capacity, handling, collision shape or visibility in a competitively meaningful way;
- avatar cosmetics must not alter qualifications, NPC reaction, wages or mission access;
- HQ decoration must not add production/storage capacity;
- company liveries must not change reputation or customer acquisition unless an equivalent non-paid visual system would have the same non-economic presentation effect.

---

# 5. Recommended Revenue Model

The recommended commercial model is:

> **Free base game + cosmetic/supporter purchases first + carefully introduced opt-in rewarded advertising + optional ad removal + later cosmetic/status subscription + later authored content and brand/creator revenue.**

This model gives DROPi Tycoon a large acquisition funnel while keeping monetization separate from the economic simulation.

## 5.1 Launch recommendation

Do **not** launch as a mandatory paid game by default.

Reasons:

- DROPi Tycoon is intended to become a global game;
- future multiplayer/economic society benefits from population density;
- a free acquisition funnel makes organic sharing and testing easier;
- cosmetics/supporter products can monetize high-intent players without blocking everyone else;
- paid acquisition can be measured against lifetime value later.

A paid upfront model may be re-evaluated only if retention/monetization evidence shows that a premium single-player positioning creates better lifetime contribution than free-to-play.

Do not fragment the player base into incompatible paid/free worlds merely to create another SKU.

---

# 6. Revenue Stream Comparison

| Revenue stream | Recommended status | Earliest timing | Fairness / product rule |
| --- | --- | --- | --- |
| Free base game | **YES — core model** | Launch | Core progression remains legitimate without payment. |
| Paid game upfront | NOT launch default | Re-evaluate later | Only if evidence supports premium positioning without harming population growth. |
| Cosmetic purchases | **YES — primary** | First commercial release | Account-level expression only; zero economic power. |
| Avatar/profile cosmetics | **YES** | After #328 identity contract | Frames, poses, outfits, profile themes, badges with no gameplay stats. |
| Vehicle skins/liveries | **YES** | After visual asset governance | Appearance only; identical physics/capacity/performance. |
| Company cosmetics | **YES** | After company identity/permissions | Livery/logo/decor only; no reputation or market boost. |
| HQ visual customization | **YES** | After HQ visual system | Decorative only; no capacity/department bypass. |
| Smartphone themes | **YES** | Early | Themes, icon packs, wallpapers, radio/UI skins; no hidden information advantage. |
| Early Supporter Pack | **YES — primary** | First commercial release | Fixed known cosmetics + supporter status; no economic currency. |
| Rewarded advertising | **YES, bounded** | After retention + compliance baseline | User initiated; cosmetic/non-economic reward only. |
| Ad removal | **YES, after ads exist** | Same phase as real ads | Removes third-party ad opportunities; must not remove access to earned gameplay. |
| Banner ads | NOT recommended | Only reconsider with evidence | Poor visual fit and generally low yield; risks degrading premium mobile presentation. |
| Forced interstitial ads | **NO at launch** | Exceptional later experiment only | Never during active logistics/missions. Default remains disabled. |
| Premium convenience | LIMITED | Later | Organization/presentation convenience only; cannot accelerate productive progression. |
| VIP/subscription | LATER | After recurring value exists | Cosmetics, status and ad-free benefits; no economic bonuses. |
| Expansion/content packs | LATER | After base retention proven | Authored side campaigns/content; must not sell competitive world access/power. |
| Seasonal content | LATER, non-manipulative | After content cadence proven | Avoid irreversible FOMO; important content should return/archive. |
| Brand sponsorships | LATER | Meaningful audience scale | Clearly disclosed, licensed, tasteful, no performance advantage. |
| Creator program | LATER | Community scale | Revenue-share/referral around real commercial sales; no in-game economic kickback. |
| UGC marketplace fees | FAR FUTURE | After server/moderation/legal maturity | Requires separate legal, payments, moderation and fraud governance. |
| Real-value/token monetization | **NOT AUTHORIZED HERE** | Separate future project only | No wallet, crypto, NFT, cash-out or speculative economy. |
| Loot boxes / paid random rewards | **NO** | Never under current strategy | Conflicts with transparent value and adds legal/ethical risk. |
| Energy/stamina sales | **NO** | Never under current strategy | Manufactured frustration / progression pressure. |
| Paid economic boosters | **NO** | Never | Pay-to-win. |

---

# 7. Launch Product Catalog — Candidate, Not Final Pricing

Prices below are **planning candidates**, not permanent canonical prices. Final SKUs require Google Play, legal/tax and market review.

## 7.1 Early Supporter Pack

Suggested planning range: **€5.99–€14.99 one-time**.

Possible contents:

- exclusive supporter profile frame;
- supporter badge/title;
- smartphone theme;
- one or more vehicle liveries;
- decorative HQ objects/themes when HQ customization exists;
- soundtrack/radio cosmetic pack where rights are clear.

No Personal Money, Company Money, XP, qualification, company share, productive asset or mission advantage.

Use `Early Supporter` terminology rather than `Founder` where confusion with the canonical in-game company Founder role would be possible.

## 7.2 Individual cosmetic items

Suggested planning range: **€0.99–€4.99**.

## 7.3 Cosmetic bundles

Suggested planning range: **€4.99–€14.99**.

## 7.4 Ad removal

Suggested planning range: **€3.99–€6.99 one-time**, only after third-party ads are actually activated.

A player who buys ad removal must retain a non-ad path to any cosmetic content that an ad viewer could obtain.

## 7.5 VIP / Supporter subscription

Do not launch until there is genuine recurring value.

Candidate planning range after validation:

- **€3.99–€5.99 monthly**;
- optional annual equivalent after churn/renewal behavior is understood.

Possible benefits:

- recurring cosmetic bundle;
- profile/status visuals;
- smartphone themes;
- cosmetic loadout slots;
- photo-mode/presentation presets;
- ad-free experience;
- supporter recognition.

Explicitly excluded:

- more money;
- more XP;
- faster training;
- better mission rewards;
- faster vehicles;
- more cargo capacity;
- privileged production;
- exclusive economic routes;
- extra competitive company slots;
- paid route optimization that produces an economic advantage unavailable through skill.

## 7.6 Expansion / story packs

Candidate planning range: **€5.99–€14.99** after the core campaign proves retention.

Suitable examples:

- authored side-story campaigns;
- cinematic/narrative packs;
- decorative city/HQ presentation packs;
- soundtrack/media packs where rights permit.

Do not sell access to economically mandatory countries, transport modes, qualifications or markets in a way that fragments fair multiplayer competition.

---

# 8. Rewarded Advertising Design

Rewarded ads are the only advertising format recommended for deliberate early experimentation.

They must be:

- opt-in;
- clearly labeled as ads;
- absent from the initial tutorial;
- absent from active pickup/delivery/cargo execution;
- absent from safety/training/certification gates;
- frequency-capped;
- remotely disableable;
- compliant with age/privacy policy;
- economically neutral.

## 8.1 Suitable rewarded-ad benefits

Prefer temporary or cosmetic-only value, for example:

- temporary cosmetic livery/theme trial selected by the player;
- temporary phone/theme presentation unlock;
- cosmetic preview access;
- optional sponsor cosmetic presentation.

Any permanent cosmetic earn path linked to ads must also have a reasonable non-ad path so buying ad removal never makes the player worse off.

## 8.2 Prohibited rewarded-ad benefits

Never reward ads with:

- Personal Money;
- Company Money;
- mission payout multipliers;
- XP/mastery;
- Work Capacity;
- food/water or living-cost relief;
- fuel/energy;
- production inputs;
- inventory;
- shares;
- qualification progress;
- training time skip;
- cargo capacity;
- better vehicle performance;
- teleportation;
- guaranteed mission success;
- competitive market advantage.

## 8.3 Interstitial boundary

Forced interstitials are **disabled by default**.

Only reconsider them if all of the following become true:

1. the core game already has healthy retention;
2. rewarded ads + purchases are commercially insufficient;
3. a natural session boundary exists;
4. the experiment has a strict frequency cap;
5. tutorial and active gameplay remain ad-free;
6. legal/privacy/age requirements are satisfied;
7. retention, reviews and session-quality guardrails do not degrade.

An example upper-bound experiment might be one interstitial at a genuine session boundary after long play, not a repeating timer. The exact cap is an experiment, not canon.

---

# 9. Sponsorships and Brand Partnerships

Brand revenue can eventually fit DROPi Tycoon because logistics, vehicles, tools, infrastructure and urban commerce naturally contain brand-like surfaces.

Possible future partnerships include:

- vehicle manufacturers;
- logistics equipment providers;
- mobility brands;
- technology brands;
- fictionalized/authorized local commerce campaigns;
- licensed branded cosmetic liveries;
- sponsored non-economic narrative events.

Rules:

- sponsorship must be clearly disclosed where required;
- real brands require permission/licensing;
- sponsored assets must fit the visual world;
- no brand may buy gameplay superiority;
- a sponsored vehicle skin cannot have better stats;
- a sponsored mission cannot be economically mandatory;
- players must retain a generic/non-sponsored path through core progression;
- minors and advertising law require Agent 13 review;
- Google Play declaration/policy requirements require Agent 14 review.

Direct brand sponsorship is business-to-business revenue, but the in-app implementation still requires platform/policy review.

---

# 10. Creator Program

A creator program may become valuable after the game has a real audience.

Possible later mechanisms:

- creator codes attached to eligible cosmetic/supporter purchases;
- revenue share from attributable commercial sales;
- creator cosmetic collections under governed licensing;
- sponsored community challenges with non-economic rewards;
- featured creator content.

Do not pay creators with World-Instance economic advantages.

A real-money UGC marketplace is **not** part of the launch roadmap. It requires separate fraud, moderation, tax, payment, rights, consumer and child-safety governance.

---

# 11. Google Play Commercial Boundary

Google Play is the target Android distribution channel.

As of the 2026-09-08 policy review, Google states that its billing system is normally required for in-app purchases of digital goods and services in Play-distributed apps, including digital items, avatars, subscriptions, ad-free functionality and other digital features, unless a specific permitted program/exception applies.

Official policy reference:

https://support.google.com/googleplay/android-developer/answer/10281818?hl=en

Google Play service fees vary by program, geography, install timing and transaction type.

Official fee reference:

https://support.google.com/googleplay/android-developer/answer/112622?hl=en

### Planning fee assumption

For commercial modeling, this document uses:

- **15% effective platform deduction on eligible Google Play digital commerce as the base planning assumption**;
- **15–30% sensitivity range** until Agent 14 validates the exact developer-program enrollment, transaction type, geography and then-current rules.

This is a financial planning assumption, not a promise of the fee that will apply to every transaction.

### No evasion architecture

DROPi Tycoon must not create web links, alternate checkout or payment-routing behavior whose purpose is to evade Google Play policy.

Alternative billing/external-offer mechanisms may be considered only if Agent 14 confirms that the exact geography/program/app qualifies and all current terms are satisfied.

Default implementation direction for Play-distributed digital goods is Google Play Billing.

### Store declarations

If ads are introduced, Play Console declarations must accurately state that the app contains ads.

Current Play review guidance:

https://support.google.com/googleplay/android-developer/answer/9859455?hl=en_EN

---

# 12. Children, Teens, Privacy and Advertising Boundary

The target-audience decision materially changes monetization architecture.

Google Play imposes additional requirements when apps target children or mixed audiences, including restrictions around personalized ads, ads SDKs, data practices and age screening.

Current policy references:

https://support.google.com/googleplay/android-developer/answer/9893335?hl=en

https://support.google.com/googleplay/android-developer/answer/12918983

No ad or analytics SDK should be integrated until Agent 13 and Agent 14 jointly resolve:

- target-age declaration;
- whether the game is adult-only, teen-inclusive or mixed audience;
- neutral age screen requirements where relevant;
- consent and lawful basis;
- personalized vs non-personalized advertising;
- SDK data collection;
- device identifiers;
- privacy policy / Data Safety declarations;
- retention/deletion rules;
- regional child/teen requirements.

This document is business planning, not legal advice.

---

# 13. Monetization Timing

Monetization should follow product maturity rather than appear everywhere at once.

## Phase M0 — Pre-commercial game quality

**Current / immediate.**

Goals:

- core employee-first gameplay works;
- story/mission loop becomes compelling;
- Android presentation reaches product quality;
- first-hour experience is understandable;
- crashes/blockers are controlled;
- privacy-safe measurement architecture is designed.

Commercial state:

- no forced ads;
- no premium currency;
- no pay-to-win;
- no payment SDK merely because monetization is planned.

## Phase M1 — Measurement foundation

Before optimizing revenue, measure:

- acquisition;
- tutorial completion;
- missions;
- session quality;
- retention;
- store interest;
- conversion;
- entitlement outcomes.

No analytics SDK is authorized by this document. Agent 13/14 must approve the privacy/platform path.

## Phase M2 — First ethical revenue

Activate a small, understandable commercial catalog:

- Early Supporter Pack;
- account cosmetics;
- profile/phone/vehicle visual customization.

Do not build dozens of SKUs.

The purpose is to validate willingness to pay without distorting gameplay.

## Phase M3 — Rewarded advertising + ad removal

Only after:

- retention is credible;
- target-age/privacy architecture is settled;
- rewarded placement is proven non-disruptive;
- the app has enough DAU to produce meaningful ad data.

## Phase M4 — VIP subscription

Only after the product can genuinely deliver recurring value every month.

A subscription with weak recurring value creates churn, refunds and distrust.

## Phase M5 — Content expansion + sponsorship + creator growth

Add only after the base game, store, retention and operations are stable.

## Phase M6 — Mature commercial ecosystem

Possible later systems:

- content seasons;
- richer brand partnerships;
- creator programs;
- carefully governed marketplace opportunities.

Real-money UGC markets, crypto/token integration and real-value player economies remain separate future legal/economic programs and are not implied by M6.

---

# 14. Metrics and Definitions

Commercial decisions must use measured cohorts, not intuition alone.

## 14.1 Core audience metrics

### DAU

Daily Active Users.

### MAU

Monthly Active Users.

### DAU / MAU

A rough stickiness measure:

`average DAU / MAU`

It can also be interpreted approximately as average active days per MAU divided by 30.

### Retention

- D1 — user returns one day after acquisition/start cohort;
- D7 — returns around day 7;
- D30 — returns around day 30.

Retention definitions must be fixed in analytics governance so dashboard changes do not silently change the metric.

### Session count

Average sessions per DAU.

### Session duration

Measure distributions, not only the mean. Very long sessions may be healthy engagement or a sign of UI friction.

## 14.2 Commerce metrics

### Payer conversion

`monthly paying users / MAU`

Use a stable definition for whether subscription-only players count as payers.

### ARPPU

Average Revenue Per Paying User for the defined period.

### ARPU

`gross monthly revenue / MAU`

### ARPDAU

`gross daily revenue / DAU`

For scenario modeling in this document:

`monthly gross revenue / (average DAU × 30)`

### Subscription conversion

`active paid subscribers / MAU`

Also track:

- trial-to-paid conversion if trials are ever used;
- renewal rate;
- voluntary cancellation;
- payment failure;
- refund rate;
- subscriber churn.

## 14.3 Advertising metrics

Track:

- ad opportunity;
- ad request;
- fill;
- impression/view;
- completion;
- reward grant;
- reward failure;
- impressions per DAU;
- engaged-ad-user rate;
- eCPM by country/region;
- ad ARPU / ad ARPDAU;
- retention difference between ad-engaged and non-ad-engaged cohorts.

Never optimize eCPM alone while retention falls.

---

# 15. Required Product Analytics Events

At minimum, future analytics governance must be capable of measuring:

- `install`;
- `first_launch`;
- `tutorial_start`;
- `tutorial_complete`;
- `mission_accepted`;
- `mission_completed`;
- first-session duration;
- session start/end;
- day-1 return;
- day-7 return;
- day-30 return;
- `ad_opportunity`;
- `ad_viewed`;
- `store_opened`;
- `purchase_started`;
- `purchase_completed`;
- `purchase_restored`;
- `purchase_refunded` where available;
- `entitlement_granted`;
- `entitlement_revoked`;
- `subscription_started`;
- subscription renewal where available;
- `subscription_cancelled` where available;
- payer conversion;
- churn.

Retention, conversion and churn are usually derived cohort metrics rather than literal client events.

### Data minimization

Analytics should collect the minimum information required to answer product/business questions.

Do not include private chat, precise personal data, advertising identifiers or account secrets merely because an SDK can collect them.

Event schema, consent, SDK selection, retention and Data Safety declarations require privacy review before implementation.

---

# 16. Ad eCPM Planning Assumptions by Geography

Ad revenue is highly volatile by country, platform, season, consent state, ad format, fill, mediation and advertiser demand.

Therefore the following are **planning bands**, not forecasts or guarantees.

For Android rewarded video:

| Geography planning group | Rewarded-video eCPM planning band | Interstitial sensitivity band | Commercial interpretation |
| --- | ---: | ---: | --- |
| Tier A — US, Canada, UK, Ireland, Australia, Switzerland/Nordics, Japan, South Korea and similar high-value markets | €8–€16 | €5–€12 | High advertiser value but often higher acquisition cost. |
| Tier B — broader Europe, selected GCC/APAC markets and middle-value markets | €3–€8 | €2–€6 | Useful balance of volume and yield. |
| Tier C — many LATAM, MEA, India/SEA and lower-yield markets | €1–€4 | €0.6–€3 | Revenue depends more on scale; must not justify aggressive frequency. |
| Global blended base model | **€5.50 rewarded** | not used in launch model | Deliberately conservative relative to some Tier-A benchmarks. |

Benchmark anchor used during this strategy review:

Appodeal, *The Latest eCPM Report 2025*, reporting Q4 2024 mobile-game data across 100,000+ apps and 70+ ad networks. The report shows rewarded video as the highest-eCPM format and reports Android rewarded examples including approximately US $13.2, UK $8.9 and Ireland $16.3.

https://appodeal.com/wp-content/uploads/2025/03/Appodeal-The-Latest-eCPM-Report-2025.pdf

The benchmark is historical and seasonal. DROPi Tycoon must replace these assumptions with its own observed country-level data before scaling ad forecasts.

---

# 17. Commercial Scenario Model

The following scenarios are **not revenue promises**. They are sensitivity models showing what would have to be true for different business outcomes.

All figures are approximate euro-equivalent planning values before owner/business income tax.

## 17.1 Scenario assumptions

| Metric | Conservative | Realistic / Base | Strong-growth | Breakout |
| --- | ---: | ---: | ---: | ---: |
| MAU example | 25,000 | 100,000 | 300,000 | 1,000,000 |
| DAU / MAU | 12% | 20% | 27% | 33% |
| Example DAU | 3,000 | 20,000 | 81,000 | 330,000 |
| D1 retention | 22% | 35% | 42% | 48% |
| D7 retention | 7% | 15% | 22% | 28% |
| D30 retention | 3% | 7% | 12% | 17% |
| Sessions / DAU | 1.3 | 1.8 | 2.1 | 2.4 |
| Rewarded impressions / DAU / day | 0.25 | 0.60 | 1.00 | 1.30 |
| Blended rewarded eCPM | €2.50 | €5.50 | €8.00 | €10.00 |
| Monthly IAP payer conversion | 0.6% | 1.8% | 3.5% | 5.0% |
| IAP ARPPU / month | €4.50 | €7.50 | €9.50 | €12.00 |
| Subscription conversion | 0.10% | 0.40% | 0.90% | 1.50% |
| Subscription planning price | €3.99 | €4.99 | €5.99 | €6.99 |
| Gross ARPU / MAU / month | ~€0.033 | ~€0.175 | ~€0.451 | ~€0.834 |
| Gross ARPDAU | ~€0.009 | ~€0.029 | ~€0.056 | ~€0.084 |

These assumptions intentionally keep rewarded-ad frequency low compared with ad-heavy mobile games.

## 17.2 Scenario P&L illustrations

The model applies:

- 15% platform deduction to modeled digital-commerce revenue;
- 2% commerce reserve for refunds/payment leakage;
- infrastructure/support assumptions that rise with scale;
- content/art reinvestment;
- marketing reinvestment;
- no tax deduction.

| Scenario | Gross monthly revenue | Platform deduction | Refund/payment reserve | Infra/support planning cost | Content/art reserve | Marketing reserve | Estimated pre-tax business contribution |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Conservative — 25k MAU | ~€831 | ~€116 | ~€15 | ~€650 | ~€66 | ~€42 | **~−€59** |
| Base — 100k MAU | ~€17,476 | ~€2,324 | ~€310 | ~€2,650 | ~€1,748 | ~€2,621 | **~€7,823** |
| Strong-growth — 300k MAU | ~€135,363 | ~€17,388 | ~€2,318 | ~€10,750 | ~€16,244 | ~€24,365 | **~€64,297** |
| Breakout — 1m MAU | ~€833,550 | ~€105,728 | ~€14,097 | ~€50,500 | ~€125,033 | ~€183,381 | **~€354,812** |

The conservative scenario deliberately demonstrates that tens of thousands of MAU can still produce little or no profit when retention/conversion/yield are weak.

The breakout scenario is an upside model, not an expected result.

---

# 18. Player Requirements for Owner Revenue Targets

The table below uses the **Base scenario unit economics**, including reinvestment and a fixed operating floor.

Base planning formula:

- gross ARPU: ~€0.175 / MAU / month;
- 15% platform fee on modeled digital-commerce portion;
- 2% commerce refund/payment reserve;
- infrastructure + data + monitoring: ~€0.015/MAU + €100 fixed;
- customer support: ~€0.010/MAU + €50 fixed;
- content/art reserve: 10% of gross revenue;
- marketing reserve: 15% of gross revenue;
- taxes excluded.

| Desired monthly pre-tax business contribution | Approx. MAU required | Approx. DAU at 20% stickiness | Approx. gross monthly revenue | Approx. platform deduction | Approx. operating + support | Approx. content reserve | Approx. marketing reserve |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| €500 | ~8,200 | ~1,600 | ~€1,425 | ~€190 | ~€354 | ~€142 | ~€214 |
| €1,000 | ~14,400 | ~2,900 | ~€2,521 | ~€335 | ~€511 | ~€252 | ~€378 |
| €2,500 | ~33,200 | ~6,600 | ~€5,809 | ~€773 | ~€981 | ~€581 | ~€871 |
| €5,000 | ~64,600 | ~12,900 | ~€11,290 | ~€1,502 | ~€1,765 | ~€1,129 | ~€1,693 |
| €10,000 | ~127,300 | ~25,500 | ~€22,251 | ~€2,960 | ~€3,333 | ~€2,225 | ~€3,338 |
| €25,000 | ~315,500 | ~63,100 | ~€55,133 | ~€7,335 | ~€8,037 | ~€5,513 | ~€8,270 |
| €50,000 | ~629,100 | ~125,800 | ~€109,937 | ~€14,626 | ~€15,877 | ~€10,994 | ~€16,491 |

The 2% commerce reserve is not shown as its own column above, so gross minus the displayed columns is not exactly equal to contribution.

These figures are not salary or take-home income. They are an approximate **pre-tax business contribution after modeled operating/reinvestment costs**.

If real ARPU, retention or conversion is lower, required MAU rises sharply. If organic acquisition, conversion or regional yield is stronger, required MAU falls.

---

# 19. Operating Cost Model

## 19.1 Platform fees

Model digital purchases/subscriptions separately from ad revenue.

Ad-network eCPM should be treated as publisher-side ad yield after the network/mediation auction economics; do not also apply Google Play IAP service fees to normal ad revenue.

## 19.2 Railway / backend

Railway's current public pricing is usage-based with plan minimums and compute/storage/egress charges.

Reference reviewed 2026-09-08:

https://docs.railway.com/pricing

Published examples at review time include:

- Hobby minimum: $5/month;
- Pro minimum: $20/month;
- RAM: $10/GB/month;
- CPU: $20/vCPU/month;
- network egress: $0.05/GB;
- volume storage: $0.15/GB/month.

These values are vendor pricing snapshots, not permanent canon.

DROPi Tycoon currently has only one production Railway service and no attached volume in the connected project. Future PostgreSQL, authoritative multiplayer, purchase receipt validation, entitlement services and real-time systems will materially change cost.

## 19.3 Database

Model separately:

- persistent identity;
- entitlement records;
- receipt/purchase audit records;
- multiplayer state;
- transaction/event history;
- backup/recovery.

Do not assume the database cost is zero merely because the current prototype is small.

## 19.4 Storage/CDN

Potential cost drivers:

- avatars/profile images;
- downloadable cosmetics/assets;
- content updates;
- logs;
- backups;
- future UGC.

Large static game assets should be packaged/cached efficiently so ordinary gameplay does not create avoidable recurring egress.

## 19.5 Analytics/monitoring

Begin with the smallest privacy-compliant system that answers actual product questions.

Do not buy an expensive analytics stack before event volume requires it.

## 19.6 Customer support

At small scale the owner/team can handle support, but this is still a real cost.

Scale drivers include:

- purchase restoration;
- refunds;
- account recovery;
- subscription questions;
- entitlement mismatch;
- moderation;
- multiplayer disputes;
- localization.

## 19.7 Art/content

Cosmetic monetization only works if cosmetics are attractive and consistently produced.

Content/art is therefore a real business reinvestment category, not an optional afterthought.

Base model reserves 10% of gross revenue for content/art. Stronger growth scenarios reserve more.

## 19.8 Marketing

Marketing is a controlled investment, not a requirement to spend money before product-market fit.

Base model reserves 15% of gross revenue for marketing once there is evidence worth scaling.

Paid user acquisition should scale only when expected contribution LTV exceeds CAC with a safety margin.

A useful commercial rule is:

> Do not buy growth to hide weak retention.

---

# 20. LTV and CAC Discipline

Before meaningful paid acquisition:

1. estimate 30/60/90-day contribution LTV by cohort;
2. separate organic and paid cohorts;
3. include platform fees, refunds, backend, support and content costs;
4. include ad and purchase revenue;
5. measure geography separately;
6. keep a margin for forecast error.

A conservative scaling rule is to avoid paid acquisition where CAC approaches the full predicted LTV.

Initial planning guardrail:

- target paid CAC at **no more than roughly 30–40% of credible 90-day contribution LTV** until longer-term retention is known.

This is a risk-control heuristic, not a universal industry law.

---

# 21. Experimentation Strategy

Monetization should be improved through controlled experiments.

## 21.1 Experiment one meaningful variable at a time

Examples:

- supporter pack composition;
- cosmetic price point;
- store presentation;
- rewarded-ad placement;
- subscription value proposition.

Avoid changing price, placement, reward and onboarding simultaneously because the result becomes uninterpretable.

## 21.2 Define guardrails before launching

At minimum monitor:

- tutorial completion;
- mission completion;
- D1/D7/D30 retention;
- session count/duration;
- crash/ANR rate;
- refund rate;
- purchase failures;
- store rating/review sentiment;
- customer-support complaints;
- ad opt-out/engagement;
- payer conversion;
- ARPDAU.

## 21.3 Revenue is not the only success metric

Reject a monetization experiment that increases short-term ARPDAU while materially damaging:

- retention;
- trust;
- reviews;
- mission flow;
- fairness;
- long-term payer conversion.

## 21.4 No dark-pattern testing

Do not A/B test manipulative coercion such as:

- obscured close buttons;
- fake urgency;
- confusing subscription cancellation disclosures;
- preselected expensive offers;
- loss-aversion traps aimed at minors;
- hidden recurring billing.

---

# 22. Legal / Privacy / Consumer Dependencies — Agent 13

Before monetization ships, Agent 13 must review at least:

- privacy policy;
- analytics consent / lawful basis;
- advertising consent;
- personalized ads;
- target-age/minors treatment;
- subscription disclosures;
- recurring billing;
- cancellation and renewal communication;
- refunds/consumer rights;
- promotions;
- contests/sweepstakes;
- brand sponsorship disclosure;
- creator programs;
- user-generated marketplace systems;
- taxation/VAT/sales-tax dependencies;
- data processors and SDK contracts;
- future real-value/token connections.

This document is not legal, tax or accounting advice.

A qualified accountant/tax adviser should verify the owner's business structure, income tax, VAT/sales-tax and cross-border reporting obligations before revenue becomes material.

---

# 23. Google Play / Android Dependencies — Agent 14

Agent 14 owns implementation-level verification of:

- current Google Play Billing requirements;
- approved billing library/version;
- purchase product types;
- subscription configuration;
- restore/reconcile flows;
- receipt/purchase-token validation architecture;
- pending purchases;
- refunds/revocation;
- testing tracks/licenses;
- Play Console product setup;
- service-fee program eligibility;
- regional billing/external-offer rules if ever relevant;
- `Contains ads` declaration;
- Data Safety coordination;
- target-audience declarations;
- release compliance.

No implementation should assume this 2026-09-08 policy snapshot is permanent.

---

# 24. Marketing / Creative Dependencies — Agent 15

Agent 15 may market commercial features, but monetization claims must remain truthful.

Marketing must not imply:

- guaranteed financial success inside or outside the game;
- real DROPi employment/business opportunities that do not exist;
- that paid cosmetics create economic power;
- that VIP is required to compete;
- that a future token has guaranteed value;
- false limited availability.

Commercial asset needs may include:

- store screenshots showing cosmetics honestly;
- supporter-pack art;
- cosmetic bundle key art;
- brand-partnership disclosure templates;
- creator-program assets;
- localized product descriptions.

Agent 12 does not create those marketing assets in this strategy PR.

---

# 25. Technical Entitlement Boundary

When implementation begins, real purchases should produce **entitlements**, not mutate game-economy balances.

A future conceptual flow is:

`Google Play purchase -> verified transaction -> durable entitlement -> presentation/content unlock`

not:

`Google Play purchase -> Company Money / Personal Money / economic advantage`

The entitlement system should eventually support:

- product/SKU identity;
- account identity;
- transaction/purchase reference;
- entitlement type;
- grant timestamp;
- expiry when applicable;
- revoke/refund state;
- restoration;
- audit history;
- offline cached proof where safe;
- server reconciliation when online authority exists.

Issue #328 already requires a generic governed entitlement/badge model for VIP/rank without hard-coded monetization. Commercial implementation should extend that neutral boundary rather than creating a second incompatible identity system.

### World Instance rule

Non-economic cosmetics/status may be account-wide.

No commercial entitlement may import World-Instance economic power.

---

# 26. Purchase Reliability Requirements

Before accepting real money, implementation must safely handle:

- duplicate callbacks;
- delayed/pending purchases;
- app restart during checkout;
- restored purchases;
- refunded/revoked purchases;
- subscription expiry;
- network failure;
- backend failure;
- receipt/token replay;
- duplicate entitlement grants;
- account changes;
- reinstall/device migration;
- support investigation.

The commercial transaction must be idempotent.

A player must not lose a valid permanent purchase because one client save file disappears.

---

# 27. Subscription Quality Gate

Do not create VIP merely because recurring revenue is attractive.

VIP can launch only when all are true:

1. there is ongoing monthly cosmetic/presentation value;
2. entitlement persistence/restore is reliable;
3. cancellation/expiry behavior is clearly defined;
4. the player retains all ordinary gameplay after cancellation;
5. expired subscribers do not lose earned World-Instance economic state;
6. advertising behavior after expiry is clear;
7. support can resolve entitlement problems;
8. legal/Play review is complete;
9. recurring billing is disclosed clearly;
10. churn can be measured.

---

# 28. Monetization Red Lines

The following are explicitly outside the approved strategy:

- paid Personal Money;
- paid Company Money;
- paid productive currency conversion;
- paid qualifications;
- paid Work Capacity;
- paid mission success;
- paid cargo teleportation;
- paid inventory/production inputs;
- paid competitive infrastructure monopoly;
- paid share ownership/control;
- paid better vehicle stats;
- paid route performance advantage;
- mandatory ads to continue ordinary play;
- ads during active cargo handling/logistics;
- fake timers/countdowns;
- punitive streak monetization;
- paid loot boxes / gacha;
- real-money gambling;
- NFT sales;
- blockchain wallet integration;
- crypto cash-out;
- player-to-player real-money conversion;
- speculative token rewards;
- bypassing Google Play payment policy;
- undeclared ad tracking;
- manipulative monetization targeted at minors.

Any proposal that crosses one of these lines requires explicit owner approval and a canonical strategy revision, plus legal/platform review where applicable.

---

# 29. Roadmap from Zero Revenue to Sustainable Commercial Product

## Stage 0 — Build a game worth monetizing

Current priority.

- stabilize first-hour gameplay;
- employee-first lifecycle;
- missions/story;
- visual quality;
- Android quality;
- retention-worthy progression;
- world and economy causal foundations.

Revenue target: **€0 is acceptable while product quality is unproven.**

## Stage 1 — Measure product-market signals

- privacy-compliant analytics architecture;
- cohort retention;
- session quality;
- first-hour funnel;
- crash/ANR monitoring;
- mission funnel.

Decision gate: do players voluntarily return?

## Stage 2 — Validate willingness to pay ethically

- Early Supporter Pack;
- a small cosmetic catalog;
- account entitlement foundation;
- purchase reliability/support process.

Decision gate: do players buy expression/support without progression pressure?

## Stage 3 — Add bounded ad revenue

- opt-in rewarded ads;
- cosmetic-only reward;
- ad removal;
- frequency/retention experiments.

Decision gate: does ad revenue increase contribution without hurting retention/trust?

## Stage 4 — Establish recurring commercial cadence

- recurring cosmetics/content;
- only then VIP/subscription;
- cohort renewal/churn measurement.

Decision gate: can recurring value justify recurring billing?

## Stage 5 — Scale acquisition and operations

- country-level LTV/CAC;
- paid UA only where profitable;
- better support;
- backend/monitoring scaling;
- localization;
- content production pipeline.

Decision gate: can incremental marketing spend generate contribution, not just installs?

## Stage 6 — Diversify revenue

- authored expansions;
- sponsorships;
- licensed cosmetics;
- creator programs;
- seasonal content without manipulative FOMO.

Decision gate: does diversification make the business more resilient without compromising the game?

## Stage 7 — Mature online commercial systems

Only after multiplayer authority, moderation, fraud protection, legal governance and support are mature should the project consider complex marketplace models.

Token/crypto/real-value systems remain a separate project and require their own legal/economic governance.

---

# 30. What Should Be Implemented First

After this strategy is reviewed and approved, the first implementation work should be:

1. **privacy/compliance analytics contract** — event definitions and consent/data boundary, not blindly installing an SDK;
2. **neutral durable entitlement contract** coordinated with #328 and World Instance identity;
3. **Google Play product/billing architecture design** owned with Agent 14, including restore/revoke/idempotency;
4. **small launch cosmetic catalog and Early Supporter Pack design** coordinated with Agent 15/assets;
5. **commercial support/audit flow** so a real purchase can be investigated safely;
6. only after those are stable, implement the first real purchase path.

Rewarded ads should come **after** retention, target-age/privacy and store-compliance foundations.

Subscription should come later still.

---

# 31. What Should Explicitly Wait

Do not implement yet:

- premium economic currency;
- paid progression boosters;
- VIP gameplay advantage;
- subscription before recurring value exists;
- forced interstitials;
- large SKU catalog;
- real-money UGC marketplace;
- player cash-out;
- crypto/token integration;
- NFT assets;
- paid competitive world access;
- marketplace transaction fees tied to player real-money trading;
- complex sponsorship SDKs;
- aggressive paid user acquisition before retention/LTV exists.

---

# 32. Commercial Decision Gates

Before each major commercial step, the owner should receive a measurable go/no-go review.

## Gate A — First purchase

Required:

- stable Android build;
- entitlement design;
- billing compliance;
- legal/privacy baseline;
- restore/refund/support path;
- clear non-P2W SKU.

## Gate B — Ads

Required:

- target audience resolved;
- ad/privacy compliance;
- tutorial and active gameplay protected;
- frequency cap;
- retention baseline;
- remote kill switch.

## Gate C — Subscription

Required:

- recurring content value;
- reliable entitlement expiry/restore;
- cancellation disclosures;
- support readiness;
- measured demand.

## Gate D — Paid acquisition scaling

Required:

- 30/60/90-day LTV evidence;
- geography-specific performance;
- retention stability;
- contribution margin after fees/costs;
- CAC safety margin.

## Gate E — Marketplace/creator economy

Required:

- multiplayer authority;
- moderation;
- fraud prevention;
- tax/legal/payment governance;
- IP/UGC rights;
- dispute resolution;
- support capacity.

---

# 33. Business Dashboard — Minimum Owner View

When real monetization exists, the owner should be able to see at least:

- installs;
- DAU;
- MAU;
- DAU/MAU;
- D1/D7/D30 retention;
- sessions/DAU;
- tutorial completion;
- mission completion;
- payer conversion;
- active subscribers;
- subscription conversion;
- ARPPU;
- ARPU;
- ARPDAU;
- ad impressions/DAU;
- ad eCPM by geography;
- gross revenue by stream;
- Google Play/platform deductions;
- refunds;
- backend/database/storage cost;
- support cost;
- content/art spend;
- marketing spend;
- CAC;
- LTV;
- estimated pre-tax business contribution.

No metric should combine fictional Company Money with real business revenue.

---

# 34. Strategic Recommendation

DROPi Tycoon should **not** try to become profitable by selling power.

Its strongest commercial fit is to monetize the identity and pride created by the game:

- the person the player becomes;
- the company visual identity they build;
- the vehicles and HQ they personalize;
- the smartphone/profile they carry;
- the story/content they want more of;
- the desire to support a world they value.

The economic simulation is the product's competitive moat. Selling shortcuts through that simulation would weaken the very thing that can make DROPi Tycoon distinctive.

The recommended sequence is therefore:

**retention -> measurement -> cosmetics/support -> reliable entitlements -> bounded rewarded ads -> recurring cosmetic value -> VIP -> scalable acquisition -> expansions/sponsorship/creators.**

---

# Canonical Rule

**Real money may buy support, expression, optional authored content and carefully bounded non-economic convenience. It may never buy DROPi Tycoon economic truth. Personal Money, Company Money, qualifications, productive capacity, cargo, markets, world permissions and competitive power must continue to be earned through the game.**

---

End of Document
