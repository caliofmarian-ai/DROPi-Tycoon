# Document Information

Document: GROWTH_MARKETING_LAUNCH_STRATEGY.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Canonical Growth / Marketing / ASO / Community / Launch Strategy
Owner Lane: Agent 15 — Growth / Marketing / ASO / Community / Launch Strategy
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-08

---

# DROPi Tycoon — Growth, Marketing and Launch Strategy

## Purpose

This document defines how DROPi Tycoon should become discoverable, understandable, installable, shareable and worth returning to without allowing marketing to outrun the product.

It governs:

- commercial positioning;
- target audiences;
- competitor and adjacent-market learning;
- Google Play ASO;
- store creative strategy;
- organic content;
- creators and press;
- community foundations;
- launch phases;
- localization priorities;
- paid-acquisition rules;
- marketing KPIs;
- 30/60/90-day preparation;
- zero/low-budget acquisition;
- scale rules after product-market evidence.

This document does **not** authorize gameplay implementation, monetization design, legal conclusions, Google Play technical release decisions, or fabricated promotional material.

The canonical marketing rule is:

> **Market the playable truth. Describe the roadmap as a roadmap. Never sell documentation as gameplay.**

---

# 0. Audit Baseline — 2026-09-08

## Repository and release state audited

Audit baseline:

- repository: `caliofmarian-ai/DROPi-Tycoon`;
- audited `main`: `8e340b7131c4bdc890c38ba34e88d94858897cb3`;
- latest 30 merged PRs reviewed;
- current open PRs reviewed;
- issues reviewed: #406, #317, #348, #552, #553, #554;
- current branding, runtime assets, Android shell, gameplay scenes and opening-flow evidence reviewed;
- current competitor/store research performed on 2026-09-08.

## Current product truth

DROPi Tycoon is canonically broader than a delivery simulator. `00_Project/VISION.md` defines it as a human-scale living economic/logistics society combining Urban RPG, Business Tycoon, Local Marketplace, Multimodal Logistics, Infrastructure Building and a future Drone Network simulation.

The present playable/runtime foundation already supports important proof points:

- Phaser remains the authoritative gameplay runtime;
- an installed Expo/React Native Android shell exists and is Android-only, landscape-first;
- Android package identity is `com.dropi.tycoon`;
- physical Android builds have been exercised by the owner;
- the player is represented in the game world rather than existing only as a management dashboard;
- Brăila has been moved materially toward real-map-derived geography, streets, addresses and building footprints;
- hero-to-world map/zoom continuity has been implemented;
- delivery/order, company, employee, finance, review, save/load, camera and in-world smartphone foundations exist in the runtime;
- a controlled Android build line exists, but current semantic version remains `0.0.0`;
- the project remains under the owner quality gate in #317.

## Critical marketing constraint

The product vision is currently ahead of the complete player-facing experience.

Several powerful differentiators are in active development or canonical planning but are **not yet safe production-store claims**, including the complete poor employee-first opening, full profession/certification progression, authored first-hour narrative mission chain, deeply visible supply-chain causality, full competitive company society, global operating gameplay and multiplayer.

Open work such as #548, #552, #553, #554, #555 and #556 can become strong launch material only after it is merged, integrated, owner-validated on Android and materially experienced by a normal player.

## Current visual/brand readiness

The repository contains approved branding and governed asset infrastructure, but the public commercial creative inventory is still thin relative to the ambition of the product.

Current runtime-facing evidence includes:

- `game-web/public/assets/branding/dropi-tycoon-logo.png`;
- approved mobile icon/splash identity in `game-mobile/`;
- governed production asset adoption beginning with `icon-orders.webp`;
- simple runtime sprites and increasingly real-map-derived city presentation;
- broader approved references and production governance under `08_Assets/`.

Issue #317 remains binding: concept/reference art is a target direction, not permission to make fake gameplay screenshots.

## Claim-status system

Every marketing claim and creative asset must use one of these internal statuses:

| Status | Meaning | Public production-store use |
|---|---|---|
| GREEN | Implemented, integrated and owner-validated on current Android release candidate | Allowed |
| AMBER | Implemented or merged but not yet fully validated / release-complete | Internal testing, devlog with explicit context; not production promise |
| BLUE | Canonical roadmap/design direction not yet playable | Roadmap/devlog only, clearly labelled |
| RED | Unsupported, obsolete, contradictory or speculative | Never use |

Before every store update, trailer, creator pack or paid campaign, the current claim matrix must be re-audited against the release candidate.

---

# 1. Positioning

## Category definition

DROPi Tycoon should not be positioned as a generic delivery simulator and should not attempt to win by claiming the largest number of trucks, cities or transport modes.

The intended commercial category is:

**Human-scale logistics RPG + business tycoon simulation.**

Supporting category language:

- urban business simulation;
- logistics tycoon;
- management simulation;
- career-to-company progression;
- living-city economic simulation.

## Positioning statement

For players who enjoy tycoon, management, logistics and progression games, DROPi Tycoon is a human-scale logistics/business simulation where the player begins as a person inside a living city and earns the path from local work toward professional capability, company building and larger logistics networks.

Unlike logistics games that begin with the player abstractly owning a fleet or production empire, DROPi Tycoon is designed around the transformation of the **person first, business second** and around visible consequences in the world.

## Strongest selling propositions

### USP 1 — From person to logistics power

**Commercial phrase:** `Start small. Work your way up.`

Longer promise when release-ready:

**Start on foot, take your first work, build capability, and grow from employee to logistics entrepreneur.**

Why this matters:

- many mobile logistics competitors start with a company, fleet, plant or management layer;
- DROPi can make progression emotionally legible because the player experiences the early struggle personally;
- the first promotion, vehicle, qualification, employee and facility can each become a shareable milestone rather than a number increase.

Claim gate:

- the complete employee-first version is a release-target proposition until its runtime integration is GREEN;
- current devlogs may discuss this as the canonical design direction, not pretend it is already the complete opening.

### USP 2 — A city you inhabit, not only a map you manage

**Commercial phrase:** `Live the logistics world from street level.`

Why this matters:

- Brăila now provides a real-map-inspired urban foundation;
- the player is embodied and can interact with a city/world rather than operating only through spreadsheets/cards;
- hero-to-world scale can become visually distinctive if the transition is polished and purposeful.

This is the safest near-term differentiation because substantial runtime foundations already exist.

### USP 3 — Your work leaves a mark

**Commercial phrase:** `Deliveries become a business. Business changes the world.`

The mature fantasy is not endless courier repetition. Deliveries, companies, production, infrastructure and regional expansion should connect causally so the player can see consequences.

This proposition should become a production-store headline only when the causal economy and visible consequences are demonstrably playable. Until then, it is a roadmap/devlog narrative.

## Recommended launch tagline family

Primary:

**Start local. Build a logistics legacy.**

Supporting options for testing:

- `Start small. Move a city. Build an empire.`
- `One person. One city. A logistics future.`
- `Work. Grow. Build. Move the world.`

Avoid:

- `the world's first`;
- `the most realistic`;
- `the ultimate`;
- `unlimited`;
- `real economy` unless the wording cannot be confused with real-money economics;
- promises of multiplayer, drones, global operations, production depth or professions before those systems are GREEN.

---

# 2. Audience

## Primary launch audience

### Persona A — Tycoon / management progression player

Motivation:

- starts with little and wants visible upward progression;
- likes optimization but also wants ownership and long-term goals;
- enjoys unlocking capability more than pure reflex gameplay.

Hooks:

- employee-to-company arc;
- money/capability/company progression;
- visible HQ/fleet/company growth;
- meaningful choices rather than idle timers.

Priority: **highest**.

### Persona B — Simulation / logistics enthusiast

Motivation:

- likes routes, vehicles, cargo, demand, production and efficiency;
- notices whether systems connect causally;
- tolerates depth if the UI explains it.

Hooks:

- real-map-inspired Brăila;
- delivery and logistics flow;
- future multimodal and production relationships;
- world-scale planning.

Priority: **highest**.

### Persona C — Open-world progression / life-sim adjacent player

Motivation:

- enjoys being a person in a world;
- values an upward-life arc and environmental identity;
- wants the business to feel attached to a character journey.

Hooks:

- street-level hero;
- narrative cast and mission arcs when implemented;
- jobs, qualifications and visible lifestyle/progression consequences.

Priority: **second wave**, especially once Agents 8 and 10 make the story visible.

## Secondary audiences

### Logistics/transport fans

Useful for creator coverage and organic communities, but DROPi should not compete directly with high-fidelity driving simulators on licensed-vehicle realism.

### Mobile strategy players

Relevant once company competition, production choices and persistent systems are legible.

### Entrepreneurial/business-simulation fans

High fit for the employee-to-founder journey. Big Ambitions demonstrates that `start with little -> become entrepreneur` is understandable commercial language even outside mobile.

### Casual logistics players

Do not target first. Casual audiences require extremely clean onboarding, fast comprehension and polished visuals. Broad targeting before the first-session experience is proven would produce low-quality installs and misleading feedback.

## Initial target order

1. tycoon/management players;
2. logistics/simulation enthusiasts;
3. entrepreneurial/open-world progression players;
4. mobile strategy players;
5. broader casual logistics audience only after onboarding and retention evidence.

---

# 3. Competitor and Adjacent Landscape

Market data below is a point-in-time research snapshot from 2026-09-08. Store ratings/download bands change continuously and must be refreshed before any formal investor/press claim.

## Mobile direct/adjacent competitors

| Game | Current store signal | Positioning / monetization | Strength | Sampled complaints / weakness | DROPi opportunity |
|---|---|---|---|---|---|
| Transport Tycoon Empire: City | Google Play ~4.3, ~247K reviews, 10M+ downloads | Free-to-play, ads + IAP; collect/upgrade train/truck/ship/plane fleet; contracts + city building | Broad transport fantasy, strong vehicle collection, events/content cadence | Recent reviews sampled on Play complain about heavy grind, many upgrade layers, waiting, offers and ad load | Avoid timer/grind-first identity; sell human progression and consequential choices |
| Logistics Empire Truck Manager | Google Play ~4.1–4.2, ~2K+ reviews, 100K+ downloads | Ads + IAP; real-world map, truck routing, production chains, hometown/HQ fantasy | Very close map/logistics proposition; strong `your city` hook | Sampled reviews cite state/update bugs, expensive/slow early progress and pressure to spend; praise relaxed pace/graphics | Differentiate with embodied employee-first journey, story, professions and visible city life rather than claiming map novelty |
| Truck Simulator : Ultimate | Google Play ~4.3, ~2.5M reviews, 100M+ downloads | Ads + IAP; driving simulation + company/fleet layer; licensed trucks | Massive reach, strong driving fantasy, branded vehicles, direct control | Sampled reviews cite ad overload, AI traffic/spawn glitches and progress loss/crashes | Do not compete on driving fidelity; compete on broader career/business/economy arc and cleaner monetization |
| Transit King: Truck Simulator | Google Play ~4.0, ~54K reviews, 5M+ downloads | Ads + IAP; fleet, facilities, production, routes, idle progress | Accessible logistics network loop and long operating history | Prominent historical reviews complain about pay-to-progress pressure and subscription/IAP friction | Position DROPi as active consequential play rather than passive idle timers and monetization gates |
| Package Inc - Management Games | Google Play ~4.3, ~6.3K reviews, 100K+ downloads; paid + IAP | Minimalist delivery-network management in growing cities | Clear visual identity, calm-to-complex progression, focused network puzzle | Sampled reviews cite routing/balancing frustration, later-stage crashes and content bugs | Learn from clarity: every screenshot and first session must communicate one understandable problem/decision |

## Adjacent PC reference products

### Big Ambitions

Steam released 2026-08-28. Current listing describes a role-playing business simulation that goes from little to major entrepreneurship in New York; English review signal was ~91% positive at audit time.

Learning:

- the **human life -> business** fantasy is commercially legible;
- role-playing and business management can reinforce each other;
- DROPi should own a logistics-specific version of that transformation rather than presenting itself as a generic fleet manager.

### Workers & Resources: Soviet Republic

Steam maintains a strong positive review signal and is positioned around deep production chains, population, transport and a simulated economy.

Learning:

- there is an audience for causal economic depth;
- depth earns loyalty when systems are understandable and coherent;
- DROPi must progressively reveal complexity rather than dump it into the first mobile session.

## Competitive white space

The strongest gap is **not** `real-world map logistics`; Logistics Empire already uses that language aggressively.

The more defensible combination is:

1. embodied person inside the city;
2. employee-first upward career fantasy;
3. logistics/business systems with visible world consequences;
4. story and recurring characters woven into a serious tycoon simulation.

This combination should be protected as the commercial identity.

## Competitive lessons to institutionalize

- Never use monetization to manufacture waiting so that paying becomes the relief.
- Do not overwhelm a player with parallel currencies/upgrades/offers.
- State correctness is marketing: lost progress, broken money/inventory or route bugs destroy reviews and creator confidence.
- Visual clarity matters as much as depth.
- A narrow first-session promise is stronger than listing every eventual system.

---

# 4. Google Play ASO Strategy

Agent 14 owns final Google Play release/compliance decisions. All metadata below is marketing strategy and must be revalidated against the release candidate and current Play rules before publication.

## Current Google Play metadata limits

At audit time Google Play documents:

- app name: 30 characters;
- short description: 80 characters;
- full description: 4,000 characters;
- store icon: 512x512 PNG;
- feature graphic: 1024x500;
- at least two screenshots required to publish, while Google highly recommends at least three 16:9 landscape screenshots at minimum 1920x1080 for games seeking recommendation surfaces.

## Recommended title

Primary candidate:

**DROPi Tycoon: Logistics**

Length: 23 characters.

Why:

- retains product brand;
- adds the most valuable high-intent category word;
- does not reduce the product to `Delivery Simulator`;
- leaves room for brand recognition.

Do not keyword-stuff the title.

## Recommended short description

Release-target candidate:

**Start on foot, take delivery jobs, and grow toward a logistics empire.**

This copy is gated by the employee-first opening being GREEN. If the release candidate does not yet start this way, replace it with truthful current-game wording rather than weakening the truthfulness rule.

## Long-description structure

The final 4,000-character description should use a benefit-first hierarchy:

1. one-sentence fantasy;
2. what the player does in the first minutes;
3. what progression becomes;
4. 4–6 concrete GREEN features;
5. world/city identity;
6. replay/progression value;
7. truthful network/offline requirements;
8. no roadmap feature list presented as current functionality.

### Draft release-target copy framework

`You do not begin as the owner of an empire. You begin as one person trying to build a future.`

`Take local delivery work, learn the city, earn money and capability, and turn small opportunities into a logistics career. As your options grow, your decisions can expand from personal work into company operations, people, assets and larger networks.`

Then list only release-candidate GREEN features, for example:

- explore a living, real-map-inspired Brăila at street level;
- accept and complete delivery work through the in-world experience;
- manage money and progression without leaving the game world behind;
- build toward company capability and larger logistics decisions;
- move between street-level action and wider strategic map views;
- save and continue your evolving run on Android.

The exact bullets must be regenerated from the final claim matrix.

## Keyword themes

Use natural language, not spam repetition.

Primary themes:

- logistics tycoon;
- business tycoon;
- delivery game;
- management simulation;
- transport management;
- business simulator;
- logistics simulator.

Secondary, only when supported:

- career simulation;
- city economy;
- supply chain;
- production management;
- company management;
- open-world business;
- transport network.

Do not build ASO around `drone`, `multiplayer`, `global economy`, `stock market` or other future features until they are material player-facing functionality.

## ASO test sequence

When enough store traffic exists, test one meaningful variable at a time using Play Store Listing Experiments:

1. icon silhouette;
2. first screenshot message/crop;
3. feature graphic;
4. short description;
5. screenshot 2/3 ordering;
6. localized variants.

Google Play currently supports graphics experiments and localized text/graphics experiments with install/open/pre-registration click metrics. Do not declare a winner from tiny samples outside Play's statistical result.

---

# 5. Store Creative Strategy

Tracking issue: #561.

## Creative principle

Every screenshot sells **one player benefit** and demonstrates it with real gameplay.

The first three screenshots carry the highest commercial responsibility. They must show gameplay, not menus alone, not a concept-art montage and not future systems.

## Release-target screenshot narrative

The preferred sequence, once each stage is GREEN:

1. **Start from nothing** — hero visibly at human scale in Brăila; early situation is understandable.
2. **Work your first job** — actual delivery/work interaction and clear objective.
3. **Explore a living city** — strong street/world identity and movement.
4. **Build your career** — qualification/profession/capability shown through real gameplay, not a fake tree.
5. **Grow your company** — real company/HQ/team progression.
6. **Manage logistics** — orders/routes/cargo/fleet with meaningful choices.
7. **Connect the economy** — production/demand/inventory consequence, only after causal loop is visible.
8. **Expand your reach** — wider strategic/world progression, only if the release actually supports the advertised interaction.

## Safe current capture candidates

Before the full employee/narrative release slice is complete, internal/test-track marketing can focus on already material runtime proof:

- player moving through real-map-derived Brăila;
- recognizable roads/addresses/district identity;
- in-world smartphone/order surface;
- delivery completion flow;
- company/HQ/employee management where #317 quality permits;
- hero-to-world strategic zoom.

## Feature graphic

Concept:

- player/courier in foreground;
- recognizable stylized Brăila/logistics city context behind;
- one visual hint of growth such as HQ/vehicle progression only if represented in release gameplay;
- restrained branding;
- optional short tagline: `Start local. Build a logistics legacy.`

No fake screenshot composition should be presented as captured gameplay. The feature graphic can be promotional illustration, but it must not imply nonexistent systems and must follow Agent 13 IP/legal review and Agent 14 metadata policy review.

## Trailer concept

Length target: 20–30 seconds for the core store cut.

Structure:

- 0–3s: one person / one city / immediate movement;
- 3–8s: work/order appears;
- 8–13s: pickup/delivery action and reward/progression feedback;
- 13–19s: broader company/career capability;
- 19–25s: street-to-strategic scale;
- final: logo + launch-safe tagline.

Rules:

- capture real gameplay;
- no long logo intro;
- readable with sound off;
- any text overlays must be short and localized;
- no feature that cannot be reached in the distributed build;
- no copyrighted music without rights;
- preview video ads must be disabled to comply with Google Play preview-video requirements.

## Icon testing

Test for recognition at small size, not detail.

Variants should preserve DROPi Tycoon identity while exploring:

- stronger symbol silhouette;
- courier/person + logistics cue;
- simplified brand mark;
- high contrast against Play surfaces.

Do not mimic competitor icons or use truck imagery so strongly that users expect a dedicated truck-driving simulator.

---

# 6. Content Marketing Engine

## Content objective

Organic content is not a substitute for finishing the game. It is a proof stream that repeatedly demonstrates why the project is different and invites the right players into testing.

## Content pillars

### Pillar A — The climb

Repeatable formats:

- `Starting with €0: what can the hero actually do?` once release-ready;
- walking courier -> first vehicle;
- first wage -> first meaningful purchase;
- employee -> qualification -> company capability;
- `What changed after 10 in-game days?`.

### Pillar B — The living city

- real Brăila road vs game interpretation;
- district reveal;
- one street before/after visual pass;
- hero view -> district -> world zoom;
- why addresses and crossings matter to gameplay.

### Pillar C — Systems with consequences

- where an order comes from;
- what cargo custody means;
- how demand can create work after #556 is integrated;
- why a company can fail;
- why no item/money should appear from nowhere.

### Pillar D — Story and people

After Agents 8/10 deliver GREEN material:

- recurring character reveal;
- first mission moment;
- `a delivery that changed a relationship`;
- district story;
- campaign choice/consequence without major spoilers.

### Pillar E — Build in public

- one visible improvement per devlog;
- bug before/fix after;
- Android performance challenge;
- why a feature was delayed instead of faked;
- community test result and what changed because of it.

## Platform roles

### TikTok / YouTube Shorts / Reels

Primary discovery format.

Cadence target during active development: 3 strong reusable short-form clips per week, cross-posted with native captions.

Clip pattern:

1. hook in first second;
2. visual proof immediately;
3. one idea only;
4. 10–30 seconds;
5. light CTA such as `follow the build`, `join testing` or later `pre-register`.

### YouTube

Use for trust and depth, not high-volume filler.

- 2–5 minute feature devlogs;
- 5–10 minute monthly state-of-the-game;
- launch trailer;
- later tutorials only where players need them.

### Reddit

Use selectively and obey each community's self-promotion rules.

Good posts:

- technical/visual before-and-after;
- design question with actual context;
- playtest findings;
- real-map world-building discussion;
- transparent launch/postmortem data.

Bad posts:

- repeated `wishlist/pre-register my game` spam;
- generic trailers with no community context;
- pretending to be an ordinary player;
- posting the same copy across unrelated subreddits.

### Discord

Discord is a retention/community surface, not an acquisition engine by itself. Open it when there are enough testers/followers to create conversation rather than an empty server.

### X

Optional secondary channel for dev/network visibility, creator contacts and short progress clips. Do not make it a core KPI unless it produces measurable traffic or relationships.

### Website

A simple official landing page becomes useful once there is:

- stable branding;
- a strong real-gameplay hero clip/image;
- testing/pre-registration destination;
- press/creator contact;
- privacy-compliant analytics/consent where used.

Do not spend early budget on an elaborate marketing site.

## Reuse workflow

One meaningful game change should produce:

- 1 master capture;
- 1 short-form vertical edit;
- 1 landscape/devlog edit when warranted;
- 3–5 still frames;
- 1 concise community update;
- 1 creator/press fact that can enter the kit.

This lowers content cost and keeps every channel grounded in the same product truth.

---

# 7. Creator and Press Strategy

Tracking issue: #563.

## Creator priority

Start with audience fit, not fame.

Priority bands:

1. micro creators focused on tycoon/management/simulation;
2. logistics/trucking/transport creators willing to cover broader business simulation;
3. Romanian gaming creators for the Brăila/authentic-origin angle;
4. English-language indie/mobile/strategy creators;
5. regional creators as more countries gain meaningful playable identity;
6. large creators only after conversion/retention and a polished build justify the opportunity cost.

## Creator selection criteria

Score creators on:

- genre fit;
- actual average views, not follower count alone;
- comments/community quality;
- history of covering indie games;
- willingness to show real gameplay;
- geographic/language fit;
- audience platform fit with Android;
- sponsored-content saturation;
- prior conversion evidence where available.

## Outreach model

Phase 1: 10–20 personalized unpaid contacts.

Phase 2: learn which pitch and footage produce replies/views.

Phase 3: expand to 50–100 segmented contacts around beta/pre-launch.

Paid creator deals require Agent 12 economics, Agent 13 disclosure/legal review and measurable attribution. Never buy positive opinions.

## Outreach template

Subject concept: `Indie logistics RPG/tycoon — Android test build`

Message framework:

`Hi [name], I am building DROPi Tycoon, an Android-first logistics/business game where the long-term journey starts with the person in the city rather than an abstract fleet manager.`

`I thought of your channel because [specific relevant video/series]. The current build lets players [2–3 verified features only].`

`If it fits your audience, I can share a test build plus a small pack of real gameplay footage/screenshots and known issues. There is no requirement for positive coverage.`

`Current status: [alpha/beta]. Release timing: [only Agent-14-validated information].`

`Thanks, [developer identity/contact].`

Never send a generic 500-word feature dump.

## Press/creator kit contents

- one-page fact sheet;
- 1-sentence and 50-word descriptions;
- current claim matrix;
- logo/icon/key art with usage guidance;
- 5–8 real screenshots;
- short B-roll clips;
- trailer;
- Android build/test instructions;
- known issues;
- developer/project background;
- contact;
- release/test timing;
- legal disclosure notes where compensation/affiliate relationships exist;
- spoiler guidance when story content matters.

## Embargo / access

Use embargoes only for a real coordinated launch/update where multiple creators benefit from preparation time. Early alpha testers generally need confidentiality/feedback rules rather than artificial hype embargoes.

Creator codes/keys should not be promised until a real distribution/attribution mechanism exists.

---

# 8. Community Foundation

## Community objective

Create a place where early players improve the product, understand what is actually being built and become comfortable sharing their own runs.

## Minimum viable Discord structure

Keep it intentionally small:

- `#start-here-and-rules`;
- `#announcements`;
- `#devlog`;
- `#alpha-beta-news`;
- `#general`;
- `#feedback`;
- `#bug-reports`;
- `#suggestions`;
- `#screenshots-and-clips`;
- `#help`;
- private tester/creator channels only when needed.

Do not create dozens of empty profession/country/company channels before the community exists.

## Feedback taxonomy

Every substantive report should be classifiable as:

- crash/blocker;
- first-session confusion;
- UX/control;
- visual quality;
- balance/economy;
- mission/story;
- performance/device;
- save/state correctness;
- suggestion;
- store expectation mismatch.

## Roadmap communication

Public roadmap labels:

- `Now` — active validated scope;
- `Next` — reasonably committed after current gate;
- `Later` — direction, no date promise;
- `Exploring` — non-commitment.

Avoid public hard dates until Agent 14 confirms release readiness and dependencies are controlled.

## Moderation principles

- no harassment or hate;
- no doxxing/private-person data;
- no scams or impersonation;
- no malware/piracy;
- no exploit instructions intended to damage shared systems;
- criticism of the game is allowed;
- bug reports should not be deleted because they are embarrassing;
- moderation actions should be consistent and appealable where practical.

Agent 13 must review final community rules, privacy treatment, minors considerations, contests/giveaways and creator disclosures before commercial launch.

## Community events

Do not begin with prize contests.

Early low-risk events:

- screenshot of the week;
- route-efficiency challenge using no real-world prize;
- community poll on visual variants;
- named playtest sessions;
- dev Q&A.

Any contest with prizes, eligibility rules or user-generated-content rights requires Agent 13 review.

---

# 9. Launch Phases

## PRE-ALPHA — Current posture

Objective: establish identity and evidence, not hype.

Do now:

- stable developer/product identity;
- weekly or biweekly factual devlogs;
- capture every major Android-visible improvement;
- maintain claim matrix;
- collect first small tester group;
- begin creator research list;
- reserve consistent social/community names;
- prepare simple landing/press facts only when visuals justify them.

Do not:

- buy installs;
- start a 90-day Play pre-registration clock;
- announce a release date;
- advertise roadmap systems as present;
- launch a large Discord with no audience.

## ALPHA

Entry conditions:

- reliable installable Android test build;
- coherent 10–20 minute first session;
- #317 has materially converged for the slice being shown;
- basic analytics/feedback capture exists;
- no routine progress-loss/blocker defects.

Actions:

- 50–300 controlled testers over waves;
- structured first-session survey;
- Discord opens when conversation can be sustained;
- creator seed to a small group under clear alpha wording;
- test ASO concepts privately/test-track where useful;
- publish honest build-in-public clips.

## BETA

Entry conditions:

- first-session fantasy understandable without developer explanation;
- retention measurable;
- crash/performance acceptable on target Android devices;
- story/mission/progression slice coherent enough to market;
- monetization, if present, is testable and legally/policy ready.

Actions:

- broader Google Play testing;
- 500–5,000 cumulative qualified testers as feasible;
- creator seeding increases;
- store listing assets reach production-candidate quality;
- descriptions/screenshots tested for expectation match;
- customer support/review response process rehearsed;
- attribution conventions implemented.

## PRE-LAUNCH

Entry conditions:

- Agent 14 confirms production path and launch window;
- Agent 13 clears privacy/legal/store claims;
- Agent 12 monetization behavior is launch-ready if monetization is enabled;
- final first-session, D1 and technical metrics support acquisition;
- store creative is based on the actual production candidate.

Actions:

- final trailer;
- press/creator kit;
- segmented creator outreach;
- final Play listing and localizations;
- pre-registration only if a production launch within Google's 90-day limit is credible;
- schedule launch-week content;
- prepare FAQ, known issues and response templates.

## LAUNCH

- one clear launch trailer/message;
- synchronized creator/press availability where earned;
- daily review of crashes, reviews, store conversion and funnel;
- rapid but calm issue communication;
- community launch session/event;
- creator/community UGC reposting only with permission;
- do not mask product problems with more spend.

## POST-LAUNCH

- regular patch notes written for players;
- visible before/after updates;
- creator reactivation around meaningful features, not every patch;
- retention-driven content cadence;
- store experiments;
- localized expansion only where product quality and support can sustain it;
- paid UA scaled only under the rules below.

---

# 10. Localization Strategy

## Principle

Localization is not merely translating the long description. Store text, screenshot overlays, onboarding language, story/dialogue and support expectations must agree.

## Tier 0 — Development/default

**English**

Reason:

- global creator/press reach;
- repository/product development language;
- default international commercial surface.

## Tier 1 — Authenticity and founder-market wedge

**Romanian**

Reason:

- opening city is Brăila;
- authentic local storytelling and Romanian creator outreach can create an early identity advantage;
- lower-cost direct community feedback is possible;
- Romania can become a credibility proof, not the limit of the global brand.

## Tier 2 — High-fit European/international testing

Candidate order, to validate with actual traffic before full localization spend:

- German;
- Polish;
- French;
- Spanish;
- Portuguese (Brazil);
- Turkish.

These languages have substantial simulation/management communities and/or appear strongly across adjacent simulation products, but rollout should be driven by Play acquisition data, creator response and support capacity rather than assumption alone.

## Localization gates

Do not add a language because machine translation is cheap if:

- in-game onboarding cannot support it;
- story text would remain mostly untranslated;
- support/legal pages are unavailable;
- screenshots still contain English-only marketing overlays that confuse users.

Start with localized Play metadata/creative experiments only where the underlying game can reasonably serve the user.

---

# 11. Paid Acquisition Rules

## Core rule

**Paid acquisition amplifies product economics. It does not repair them.**

No meaningful paid spend until retention and monetization are instrumented enough to estimate value.

## Industry context

GameAnalytics' 2026 benchmark report states that 2025 median mobile retention was approximately:

- D1 ~22%;
- D7 just under 4%;
- D30 roughly 0.7–0.8% globally.

Europe median in the same report was approximately D1 22.2%, D7 4.06%, D30 0.92%, while top-10% performance was materially higher.

DROPi should not scale spend merely because it beats the median. A niche tycoon/simulation game needs enough returning players to support its deeper progression and any sustainable monetization.

## Marketing readiness gates

These are operating gates, not promises and not permanent genre laws.

### No paid UA

If any of the following is true:

- D1 is not measured reliably;
- D7 is not measured reliably;
- store conversion is not measured;
- acquisition source cannot be attributed at least at campaign/channel level;
- monetization is enabled but payer/LTV data cannot be estimated;
- major progress-loss or crash defects remain;
- first-session completion is not understood.

### Small creative-test eligibility

Minimum directional health before small paid experiments:

- D1 >= 25% for qualified test cohorts;
- D7 >= 7%;
- no severe crash/save integrity issue;
- store conversion has a stable baseline;
- at least one monetization/LTV model exists if the objective is revenue, coordinated with Agent 12.

### Scale-candidate health

Aim to see repeatable cohorts around or above:

- D1 >= 30%;
- D7 >= 10%;
- D30 >= 3% or a clearly improving long-tail curve;
- monetization/retention does not deteriorate materially for paid users versus qualified organic users.

Do not turn these into vanity targets by manipulating notifications/rewards in ways that make the game worse.

## Test budget discipline

Until LTV is robust:

- use very small geo/creative experiments;
- test one acquisition hypothesis at a time;
- predefine a maximum loss per test;
- never increase spend because a campaign `feels promising`;
- do not borrow or commit essential development budget to UA.

A reasonable early owner-approved test can be in the low hundreds of euros total, not thousands, but Agent 12 and the owner control actual budget.

## Stop-loss rules

Pause a campaign if:

- CPI remains >125% of its predefined target after enough conversions to be meaningful;
- paid D1 is >20% relatively worse than comparable organic/creator cohorts;
- store conversion falls sharply because creative sets false expectations;
- crash/ANR/save failures spike for the acquired device/geography mix;
- payer/LTV assumptions break;
- review sentiment reveals the ad creative promised something the build does not deliver.

## Scale rule

Scale only when cohort evidence supports a conservative payback model.

Preferred commercial test:

`forecast cohort LTV / fully loaded acquisition cost >= 1.3`

at the chosen payback window, with sensitivity cases for worse retention and revenue.

Agent 12 owns the revenue/LTV model. Agent 15 owns campaign acquisition discipline. Neither may unilaterally manufacture optimistic assumptions to justify spend.

---

# 12. KPIs and Measurement

## Acquisition funnel

Track:

- impressions;
- store listing visitors;
- unique install clicks;
- store visitor -> install conversion;
- installs;
- organic vs paid installs;
- source/channel/campaign;
- creator-attributed installs;
- pre-registrations when enabled;
- CPI.

## Activation / first session

Track at minimum:

- install -> first open;
- first-session start;
- first meaningful movement/action;
- first work/order viewed;
- first work/order accepted;
- first pickup/objective milestone;
- first completed delivery/work event;
- first progression reward understood;
- first session duration;
- tutorial/intro abandonment point.

Exact event names belong to analytics implementation, not hardcoded marketing copy.

## Retention

- D1;
- D7;
- D30;
- returning sessions/player;
- cohort retention by acquisition source;
- cost per D1 retained player;
- cost per D7 retained player;
- cost per D30 retained player.

Cost per retained player is often more useful than raw CPI.

## Commercial

Coordinate with Agent 12:

- payer conversion;
- ad-viewer rate if ads exist;
- ARPDAU/ARPU where relevant;
- revenue by source;
- cohort LTV;
- ROAS;
- payback period;
- revenue concentration / whale dependence;
- monetization-driven churn indicators.

## Creative/content

- hook/3-second view rate;
- average watch time;
- completion rate;
- click-through rate;
- store visits from content;
- installs from content/creator;
- saves/shares/comments quality;
- creator reply rate;
- creator coverage rate;
- installs per creator;
- retained players per creator.

## Community

- weekly active members;
- unique feedback contributors;
- bugs with reproducible reports;
- suggestion-to-implementation signal;
- unanswered help posts;
- moderation incidents;
- UGC posts/creators;
- test cohort participation.

Do not use Discord member count as a primary success metric.

---

# 13. 30 / 60 / 90-Day Launch Preparation

This roadmap starts from approval/merge of this strategy, not from an invented public release date.

## Days 0–30 — Establish proof

### Product/claim work

- maintain GREEN/AMBER/BLUE/RED claim matrix against `main`;
- audit every visible merge for a marketing proof opportunity;
- identify the exact 10–20 minute vertical slice intended to sell the game;
- define first-session capture checklist with #406/#317.

### Brand/creative

- lock consistent developer/product naming;
- prepare store-creative capture specification under #561;
- select 2–3 icon/feature-graphic concepts, not final false gameplay art;
- build a reusable raw-capture folder convention.

### Content

- begin 2–3 short proof-based posts/week if current visuals are acceptable;
- publish one deeper devlog explaining the `person -> logistics company` vision and what is actually playable today;
- build 30-post idea backlog from real planned checkpoints.

### Creators/community

- build first 50-creator research sheet;
- identify 10 high-fit micro creators;
- draft creator fact sheet under #563;
- do not mass outreach yet;
- reserve Discord structure but launch only if tester demand exists.

### Measurement

- define attribution/retention event requirements with future analytics owner;
- establish Play/store metric reporting format.

## Days 31–60 — Validate the pitch

- capture improved Android gameplay after visible quality merges;
- produce first internal 6–8 screenshot storyboard;
- test 2–3 tagline/thumbnail hooks organically;
- invite first controlled creator/tester contacts when build quality supports it;
- collect first-session comprehension interviews/surveys;
- track why testers stop;
- revise short description based on what players actually say the game is;
- prepare Romanian + English store copy candidates;
- create minimal Discord if cohort activity is sufficient;
- build FAQ/known-issues template.

## Days 61–90 — Prepare a launchable growth loop

If product gates are met:

- finalize store creative candidate pack;
- create launch/alpha trailer from actual build;
- expand creator outreach;
- run Play store-listing experiments when enough traffic exists;
- localize first priority metadata/creative;
- establish weekly funnel/retention dashboard;
- prepare pre-registration decision packet for Agent 14/owner.

If product gates are **not** met:

- do not force pre-registration or paid spend;
- continue alpha content/testing;
- use the next 30 days to fix the first-session or visual problem shown by evidence.

The 90-day plan is a readiness loop, not a deadline that can override quality.

---

# 14. Zero / Low-Budget Marketing Strategy

## Objective

Reach the first meaningful audience through specificity and proof rather than media spend.

## Zero-budget acquisition stack

### 1. Build-in-public proof

Every major visible Android improvement can become content.

Best near-term topics:

- Brăila real-map transformation;
- hero-to-world zoom;
- why the player starts as a person rather than a company;
- before/after #317 visual convergence;
- first narrative character when playable;
- first causal supply-chain job when playable.

### 2. Founder/developer authenticity

The project has an unusual authentic origin: a Romanian-led logistics/business game beginning in Brăila but designed to expand globally.

Use this as a human story, not nationalist exclusivity and not a claim that every city is already playable.

### 3. Micro-creator earned coverage

Ten strong-fit creators with personalized outreach can be more valuable than one broad paid placement.

Offer:

- direct developer access;
- transparent build status;
- test build;
- clean footage/press kit;
- useful context;
- freedom to criticize.

### 4. Community participation before promotion

Participate in tycoon/simulation/indiedev communities by sharing useful design/technical insight. Promotion should be a consequence of being relevant, not the only reason for appearing.

### 5. Searchable long-form content

Create occasional durable posts/videos around topics players search for:

- building a logistics tycoon from street level;
- designing a real-map-inspired game city;
- making a mobile tycoon without pay-to-win pressure;
- connecting production demand to delivery missions.

### 6. Player-made proof

Once alpha players exist, make it easy to share:

- screenshots;
- company progress;
- route challenges;
- unusual economic outcomes;
- story moments.

The best organic creative eventually becomes what players choose to show, not what the marketing plan predicts.

## Low-budget priorities

Spend first on things that improve reusable conversion assets:

1. necessary store/creative production support that cannot be produced internally;
2. localization quality review;
3. creator tooling/asset preparation;
4. tiny measurable creative tests;
5. paid acquisition only after retention/LTV gates.

Do **not** spend early money on:

- mass influencer blasts;
- generic mobile ad networks;
- bought followers;
- giveaway-only communities;
- expensive PR retainers without evidence;
- cinematic trailers that hide weak gameplay;
- fake app-store mockups.

---

# 15. Scale Strategy After Product-Market Evidence

## Evidence required

Scale is justified only when multiple signals agree:

- players understand the fantasy quickly;
- retention is healthy and repeatable;
- reviews/feedback match the intended positioning;
- store conversion is stable;
- creators can explain the game accurately after playing it;
- monetization does not undermine trust;
- LTV/CPI supports paid tests;
- technical quality survives broader device/geography mix.

## Scale ladder

### Stage A — Organic niche proof

Target: first core community and repeatable organic message.

Channels:

- Shorts/TikTok/Reels;
- Reddit/dev communities;
- micro creators;
- Romanian/English niche coverage;
- Play testing.

### Stage B — Creator repeatability

Identify which creator segments produce not only installs but D7/D30 retained players.

Create custom landing/store variants only when volume supports measurement.

### Stage C — Small paid UA

Use 2–3 geographies and several real-gameplay creative concepts.

Test:

- `person-to-empire`;
- `living city`;
- `deep logistics/economy`.

Select based on retained-player economics, not cheapest CPI.

### Stage D — Localization growth

Expand store/game localization where organic signals or paid tests show product fit.

Use regional creators and country/city reveals only where those areas have meaningful player-facing content.

### Stage E — Live-content growth

After stable launch:

- meaningful feature updates;
- story chapters;
- new cities/countries when playable;
- new profession/business/logistics capability;
- community challenges;
- creator reactivation;
- Play promotional content/events where Agent 14 confirms eligibility/compliance.

### Stage F — Major UA

Only after:

- LTV model is robust;
- monetization policy is stable;
- D30 cohorts exist across channels;
- infrastructure/support can handle growth;
- marginal ROAS remains healthy as spend increases.

---

# Launch Thesis

DROPi Tycoon should **not** launch its marketing identity as `another delivery simulator` and should not try to win by listing the largest future feature set.

The launch thesis is:

> **Prove the transformation.** Show one person inside a believable city, doing understandable work, earning capability and visibly growing into larger logistics responsibility. Let the depth reveal itself after the fantasy is clear.

The opening city, the human-scale view, the employee-first journey and the growing business must become the marketing story because they are also the game story.

The correct growth order is:

`clear first-session fantasy -> retained players -> trusted community/creators -> optimized store -> monetization evidence -> paid scale`.

Never reverse that order.

---

# Immediate Marketing: Start Now vs Later

## Start now

- factual build-in-public identity;
- claim matrix;
- competitor monitoring;
- capture of every owner-validated Android-visible improvement;
- Brăila/world-building proof content;
- developer story;
- creator research;
- English/Romanian copy development;
- store screenshot storyboard;
- press/creator kit structure;
- analytics event requirements;
- community rules draft with Agent 13;
- Google Play metadata preparation with Agent 14.

## Start after #317 / first-session quality proof

- regular gameplay-led Shorts/TikTok/Reels;
- public Discord;
- active alpha recruitment;
- creator build seeding;
- final feature graphic;
- store screenshot publication.

## Start only after measurable beta health

- pre-registration;
- broader creator push;
- PR/media outreach;
- store A/B experiments with meaningful traffic;
- small paid acquisition tests.

## Start only after LTV / retention evidence

- paid creator sponsorships;
- scaled Google/Meta/TikTok UA;
- large localization spend;
- significant launch advertising.

---

# Asset Requirements

Required before commercial launch:

- final Play store icon;
- 1024x500 feature graphic;
- 6–8 real Android gameplay screenshots, first 3 optimized for discovery;
- 20–30 second store trailer;
- 60–90 second press/YouTube trailer if useful;
- approved logo/key art package;
- English and first-priority localized overlays;
- fact sheet;
- press/creator kit;
- raw B-roll library;
- current-feature/roadmap claim matrix;
- FAQ/known issues;
- official privacy/support/store links coordinated with Agents 13/14;
- attribution conventions.

Implementation issues created from this audit:

- #561 — truthful Google Play store creative capture pack;
- #563 — launch press kit and creator outreach package.

---

# Major Risks

## 1. Vision-to-runtime gap

Largest risk. Documentation can make the game sound far larger than what a new Android player currently experiences.

Mitigation: claim-status gate and release-candidate audit before every commercial asset.

## 2. Visual quality gap

If screenshots still look like prototype/debug presentation, ASO cannot solve conversion.

Mitigation: #317 remains a precondition for mass promotion.

## 3. First-session identity confusion

If the old starter-company loop survives beside the new employee-first story without coherent migration, marketing promise and gameplay will conflict.

Mitigation: #406/#548/#552/#553 must converge into one understandable opening.

## 4. Overexpansion messaging

Hundreds of world/locality data nodes are technically impressive but are not equivalent to hundreds of playable cities.

Mitigation: market world-data expansion as development/world-building until the player can meaningfully act there.

## 5. Monetization trust

Competitor reviews show strong sensitivity to grind, waiting, ad overload and pay-to-progress pressure.

Mitigation: Agent 12 must protect player trust and Agent 15 must measure retention impact, not only revenue.

## 6. Creator expectation mismatch

A creator who receives an inflated pitch can permanently damage credibility with the core niche.

Mitigation: creator claim matrix + known issues + real footage.

## 7. Empty-community syndrome

Launching a large Discord too early makes the project appear abandoned.

Mitigation: open only when tester/community activity can sustain conversation; keep channels minimal.

## 8. Pre-registration clock misuse

Google Play currently limits pre-registration campaigns to 90 days before production launch in enabled countries.

Mitigation: Agent 14/owner must authorize pre-registration only when the release window is credible and a test track has already been exercised.

---

# Cross-Agent Dependencies

## Agent 8 — Narrative Director

Marketing needs:

- canonical opening conflict and campaign spine;
- recurring cast identities;
- spoiler-safe story hooks;
- chapter/mission language only after runtime integration.

Agent 15 must not market Story Bible content as playable until implemented.

## Agent 10 — Visual Storytelling

Marketing needs:

- recognizable characters;
- visually memorable story moments;
- environmental consequence shots;
- approved capture-worthy presentation;
- key-art/creative cooperation consistent with real runtime.

#561 depends heavily on Agent 10 + #317.

## Agent 12 — Monetization / Business Model

Marketing needs:

- launch monetization model;
- payer/LTV assumptions;
- ad/IAP/subscription boundaries;
- commercial payback model;
- budget/ROAS guardrails.

Agent 15 controls acquisition efficiency; Agent 12 controls revenue economics.

## Agent 13 — Legal / Privacy / Compliance / IP

Marketing needs review for:

- privacy/analytics/consent;
- creator sponsorship disclosures;
- contests/giveaways;
- community rules/minors;
- trademarks and third-party asset usage;
- testimonials/reviews;
- music/video rights;
- email/community acquisition data.

## Agent 14 — Google Play / Android Release

Marketing needs:

- production-build readiness;
- track/release timing;
- package/store status;
- content declarations;
- store metadata compliance;
- pre-registration decision/timing;
- screenshot/video technical acceptance;
- supported-device facts;
- policy-complete production listing.

Agent 15 does not independently announce a Google Play production date.

---

# Source Register — Market / Platform Research

External sources are evidence, not project canon. Accessed 2026-09-08 unless noted.

## Google Play / Android

- Google Play Console Help — Create and set up your app / metadata limits: https://support.google.com/googleplay/android-developer/answer/9859152
- Google Play Console Help — Add preview assets to showcase your app: https://support.google.com/googleplay/android-developer/answer/9866151
- Google Play Console Help — Store listing best practices: https://support.google.com/googleplay/android-developer/answer/13393723
- Google Play Console Help — Run A/B tests on your store listing: https://support.google.com/googleplay/android-developer/answer/12053285
- Google Play Console Help — Custom store listings: https://support.google.com/googleplay/android-developer/answer/9867158
- Google Play Console Help — Pre-registration: https://support.google.com/googleplay/android-developer/answer/9859047
- Google Play Console Help — Publishing truthfulness guidance: https://support.google.com/googleplay/android-developer/answer/15191715

## Competitors

- Transport Tycoon Empire: City: https://play.google.com/store/apps/details?id=tycoon.building.simulator.games.aldagames.com
- Logistics Empire Truck Manager: https://play.google.com/store/apps/details?id=com.xyrality.bb
- Truck Simulator : Ultimate: https://play.google.com/store/apps/details?id=com.zuuks.truck.simulator.ultimate
- Transit King: Truck Simulator: https://play.google.com/store/apps/details?id=fi.bongames.transitking
- Package Inc - Management Games: https://play.google.com/store/apps/details?id=com.infinitygames.packageinc
- Big Ambitions: https://store.steampowered.com/app/1331550/Big_Ambitions/
- Workers & Resources: Soviet Republic: https://store.steampowered.com/app/784150/Workers__Resources_Soviet_Republic/

## Benchmarks

- GameAnalytics — 2026 Mobile & PC Gaming Benchmarks, updated 2026-08-24: https://www.gameanalytics.com/cn/reports/2026-mobile-pc-gaming-benchmarks

Benchmark figures are planning references only. DROPi Tycoon's own cohorts become authoritative for marketing decisions once sufficient data exists.

---

# Final Strategic Rule

DROPi Tycoon should earn growth by becoming increasingly easy to explain in one sentence and increasingly difficult to stop playing after the first session.

Marketing begins now as documentation of proof.

Promotion begins when the proof is visually compelling.

Paid scale begins only when retained-player economics justify it.
