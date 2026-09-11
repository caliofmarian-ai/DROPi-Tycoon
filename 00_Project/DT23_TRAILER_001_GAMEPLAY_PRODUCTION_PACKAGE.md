# DROPi Tycoon — DT-23 Trailer 001 Gameplay Production Package

## Document information

- Project: DROPi Tycoon
- Owner: Marian / caliofmarian-ai
- Specialist: DT-23 — Creative Marketing / Advertising / Cinematics
- Production ID: `DT23-TR-001`
- Working title: `ONE DELIVERY`
- Parent creative: `From One Delivery to a Living World`
- Format produced by this package: 30-second gameplay-first master
- Status: `IN PRODUCTION — CAPTURE PACKAGE READY`
- Baseline canonical main audited for this package: `cb9b9282b8b49c77e2743f41cead730833b6af3f`
- Parent issue: #692

---

# 1. Production decision

This trailer must look like **DROPi Tycoon the game**, not like a live-action film, photoreal movie, or unrelated cinematic universe.

The visual grammar is therefore:

`real game world -> real HUD -> real phone -> real objective -> real movement -> real delivery -> real result -> real narrative presentation -> branded end card`

The player must recognize that the trailer is showing a playable game within the first second.

No generated photoreal actor, live-action van, fake driving cockpit, invented city shot, fake 3D menu, fabricated map UI, or fake progression screen may be inserted and presented as gameplay.

The only non-gameplay element in the 30-second master is the final branded end card and simple editorial typography/transitions.

---

# 2. Verified runtime anchors used by the production

This production is built around player-facing runtime surfaces already present on the audited main.

## 2.1 Game-world presentation

`game-web/src/scenes/GameWorldScene.ts` already composes the player-visible world with:

- `UrbanHUD`;
- `NarrativePresentationOverlay`;
- `UrbanZoomGesture`;
- the player visual;
- objective/world presentation.

This is the primary image source for Trailer 001.

## 2.2 Real in-world smartphone

`game-web/src/ui/PlayerSmartphone.ts` exposes three live apps:

- `Delivery`;
- `Map`;
- `Money & Assets`.

The phone is a fixed-screen overlay and does not replace/restart the world context.

Trailer 001 uses only values produced by the captured runtime. No route, reward, money, cargo, fleet, employee, HQ, share or objective value may be replaced in post-production.

## 2.3 Real visual-story presentation

`game-web/src/ui/NarrativePresentation.ts` is a bounded Phaser overlay, not a separate fake cinematic scene.

`game-web/src/narrative/visualStorytelling.ts` contains the player-facing opportunity chapter label:

`YOUR WORK LEAVES A MARK`

Trailer 001 may use this phrase as a real-game presentation beat only when the captured run legitimately triggers it.

If it does not trigger in the capture candidate, the trailer must not manufacture the overlay.

## 2.4 Deliberately excluded from Trailer 001

The production/supply adapter is not yet wired into the current visible `GameWorldScene` / phone delivery loop. Therefore Trailer 001 does not claim or fake a full visible production-supply-demand chain.

Global multi-locality play is not proven for public use. Therefore Trailer 001 does not show renamed fake cities, global travel, or decorative map pins as playable destinations.

Production AAB / Google Play release status remains outside this trailer's truth authority. Therefore the end card must not include `Available now`, a release date, download counts, ratings, awards or store badges until the corresponding release evidence exists.

---

# 3. Creative target

The 30-second cut communicates one complete idea:

> **You are inside the game. You have one real job. You move through the city, complete it, and the game tells you that the work mattered.**

It deliberately does not try to explain every long-term DROPi Tycoon system.

The emotional progression is:

`small task -> movement -> completion -> meaning -> possibility`

The visual progression is:

`Hero -> Phone -> Route -> Pickup -> City movement -> Delivery -> Story beat -> State -> Logo`

---

# 4. Master cut — 30 seconds

## SHOT 01 — `THE GAME STARTS HERE`

**Time:** `00:00.000–00:02.500`

**Truth class:** `AUTHENTIC GAMEPLAY`

**Image:**
- direct capture from `GameWorldScene`;
- hero visible inside playable Brăila;
- normal game HUD remains visible;
- use Hero or Area-scale zoom, whichever gives the strongest readable game frame;
- no fake depth-of-field, fake character close-up or live-action insert.

**Editorial super:**

`ONE JOB.`

**Edit:**
- hard cold-open directly into gameplay;
- no studio-style cinematic pre-roll;
- optional 2–3 frame logo sting only if it does not delay recognition of gameplay.

**Audio:**
- captured city ambience if clean;
- one subtle UI/start pulse from cleared project-owned audio when available;
- otherwise silence + later cleared sound design.

---

## SHOT 02 — `CHECK THE WORK`

**Time:** `00:02.500–00:06.000`

**Truth class:** `AUTHENTIC GAMEPLAY`

**Image:**
- open the real Player Phone;
- select `Delivery`;
- show the real `CURRENT DELIVERY` projection;
- let the real status, objective, route, cargo and reward remain readable for approximately two seconds.

**Editorial super:**

`CHECK THE DELIVERY.`

**Critical rule:**
No reward value, destination, status or route may be typed over the real phone UI.

**Transition:**
Phone-close action itself becomes the cut transition back into world movement.

---

## SHOT 03 — `MOVE`

**Time:** `00:06.000–00:09.000`

**Truth class:** `AUTHENTIC GAMEPLAY`

**Image:**
- player begins moving toward the current objective;
- keep HUD and world context visible;
- if the current active transport is walking, show walking;
- if the exact captured state legitimately uses another transport, show that exact real state;
- never substitute a faster vehicle purely for trailer spectacle.

**Editorial super:** none.

**Edit:**
- one straight three-second movement beat;
- avoid excessive speed ramping that could misrepresent gameplay speed.

---

## SHOT 04 — `PICKUP`

**Time:** `00:09.000–00:12.500`

**Truth class:** `AUTHENTIC GAMEPLAY`

**Image:**
- reach the legitimate pickup/objective state;
- perform the real action;
- visibly retain the game result/carry state that follows.

**Editorial super:**

`PICK IT UP.`

**Audio:**
- real action/UI sound if licensed/owned and present;
- otherwise one later-produced cleared confirmation sound.

**Critical rule:**
Do not cut from an unrelated pickup to a different delivery instance.

---

## SHOT 05 — `THE CITY IS THE ROUTE`

**Time:** `00:12.500–00:17.000`

**Truth class:** `AUTHENTIC GAMEPLAY`

**Image:**
- continue the same delivery;
- show meaningful movement through Brăila;
- include one legitimate in-game zoom change using the existing urban zoom system if it improves spatial understanding;
- the shot should still look like normal DROPi gameplay.

**Editorial super:**

`MOVE THROUGH BRĂILA.`

**Edit:**
- maximum two cuts inside this block;
- a match cut may connect Hero/Area view to wider City view only if both are actual captures of the same game/runtime language;
- no satellite footage or real-world aerial video.

---

## SHOT 06 — `DELIVER`

**Time:** `00:17.000–00:20.500`

**Truth class:** `AUTHENTIC GAMEPLAY`

**Image:**
- reach the legitimate delivery endpoint;
- perform the actual completion interaction;
- show the authoritative completion/result state long enough to read its core feedback.

**Editorial super:**

`DELIVER.`

**Critical rule:**
Money, XP, loyalty, reward or any other settlement feedback can appear only if generated by the real captured runtime. No post-production number replacement.

---

## SHOT 07 — `THE MARK`

**Time:** `00:20.500–00:24.500`

**Truth class:** `AUTHENTIC GAMEPLAY` **only if naturally triggered by the captured run**.

**Image:**
- the real `NarrativePresentationOverlay` opportunity/result beat;
- preferred visible chapter text: `YOUR WORK LEAVES A MARK` when the runtime legitimately presents it.

**Editorial super:** none. The game presentation itself owns this moment.

**Fallback if the runtime beat does not trigger:**
- remain in gameplay;
- use only editorial typography `YOUR WORK LEAVES A MARK.` over the real post-delivery world frame;
- classification for the typography layer: `CINEMATIC / NON-GAMEPLAY`;
- do not fabricate a fake narrative UI card.

**Audio:**
- music/sound opens slightly here;
- no Hollywood impact boom;
- use a restrained game-achievement lift.

---

## SHOT 08 — `STATE CHANGED`

**Time:** `00:24.500–00:27.000`

**Truth class:** `AUTHENTIC GAMEPLAY`

**Image option A — preferred:**
- open `Money & Assets` on the real phone after the completed job;
- show actual runtime state.

**Image option B:**
- stay in world if the phone surface is visually too dense for a 2.5-second read.

**Editorial super:**

`ONE STEP FORWARD.`

**Critical rule:**
This shot is not permission to claim that one delivery creates a company, HQ, fleet or global empire. It only shows actual state present in the captured build.

---

## SHOT 09 — `END CARD`

**Time:** `00:27.000–00:30.000`

**Truth class:** `CINEMATIC / NON-GAMEPLAY`

**Image:**
- freeze or softly defocus the final actual gameplay frame;
- overlay the approved DROPi Tycoon wordmark/logo;
- preserve the game's palette and UI visual identity;
- no live-action city skyline.

**Text:**

`DROPi TYCOON`

`YOUR WORK LEAVES A MARK.`

Optional third line for internal/dev presentation only:

`GAMEPLAY DEVELOPMENT FOOTAGE`

**Forbidden until release evidence exists:**
- `Available now`;
- store badges;
- ratings;
- review quotes;
- awards;
- download counts;
- launch date;
- `Play every city in the world`.

---

# 5. Capture manifest

Capture these as separate raw clips. Do not record the entire trailer as one staged take.

| Capture ID | Required raw capture | Minimum useful length | Required state |
| --- | --- | ---: | --- |
| `CAP-001` | Hero/Area Brăila gameplay idle + short movement | 8s | normal HUD, no debug overlay |
| `CAP-002` | Phone open -> Delivery app -> close | 8s | active legitimate delivery |
| `CAP-003` | Movement toward pickup | 8s | same delivery instance |
| `CAP-004` | Pickup interaction + resulting cargo state | 8s | legitimate pickup |
| `CAP-005` | Same-job travel, Hero/Area/City-scale options | 15s | cargo/order continuity preserved |
| `CAP-006` | Delivery completion + result | 10s | same delivery instance |
| `CAP-007` | Narrative opportunity/consequence presentation | 10s | only when legitimately triggered |
| `CAP-008` | Phone Money & Assets after delivery | 8s | same run, unedited values |
| `CAP-009` | Clean final gameplay frame for logo end card | 6s | no open debug/dev surface |

Keep every raw file even when only 2–4 seconds appear in the final cut.

---

# 6. Capture identity record

Every raw clip intended for external use must record:

- source commit SHA;
- Android/build identity when captured from mobile candidate;
- date/time of capture;
- device/model or capture environment;
- orientation and resolution;
- exact delivery/order run identity if available;
- whether the clip contains authentic audio;
- whether any crop, stabilization or retime was applied later;
- truth class;
- known acceptance limitations.

A desktop/browser capture may be used for internal edit development, but it must not silently become an Android release proof.

---

# 7. Edit language

## 7.1 What the edit should feel like

- readable game trailer;
- crisp cuts tied to player actions;
- player input and UI are part of the visual rhythm;
- camera language comes from the game first;
- progression is communicated through action/result, not through movie spectacle.

## 7.2 What the edit must avoid

- fake camera flythroughs unavailable to the player presented as gameplay;
- photoreal inserts;
- generated actors;
- fake driving footage;
- fake smartphone screens;
- fake Brăila aerial photography mixed into gameplay without explicit non-gameplay framing;
- giant film-trailer letterboxing that hides game UI;
- excessive bloom/lens flare;
- speed ramps that materially distort travel speed;
- fake controller/touch inputs;
- montage cuts that splice different jobs into one apparent continuous job without disclosure.

## 7.3 Typography

Editorial text should behave like a game trailer HUD extension:

- short phrases;
- large mobile-readable type;
- no paragraph cards;
- safe-area placement away from game HUD;
- use approved DROPi typography/branding when available;
- never cover factual game UI values that support the shot's truth.

---

# 8. Audio production direction

Trailer 001 should initially be cut **without voice-over**.

Reason: the first proof must let the game itself carry the experience.

Target mix layers:

1. authentic in-game/UI sounds where rights are known;
2. restrained city ambience;
3. rhythmic percussive bed that grows from sparse to confident;
4. small transition ticks keyed to phone open, pickup, delivery and result;
5. one modest musical lift on `YOUR WORK LEAVES A MARK`;
6. no blockbuster brass, trailer booms or heroic-orchestral imitation.

Until DT-13 clearance exists for a concrete audio source, music/SFX references are direction only and must not be published as cleared production assets.

---

# 9. 9:16 vertical production

The 30-second vertical version uses the same authentic clips.

Rules:

- crop/reframe actual gameplay, never regenerate it;
- preserve the player, objective and key UI;
- if the phone becomes unreadable in crop, use a brief full-frame phone capture rather than enlarging/faking its text;
- supers move into top/bottom safe areas rather than covering the center action;
- end card becomes stacked: logo -> `YOUR WORK LEAVES A MARK.`

Recommended vertical pacing:

- `0–2s`: hero gameplay + `ONE JOB.`
- `2–5s`: phone delivery;
- `5–10s`: pickup;
- `10–16s`: movement;
- `16–21s`: delivery;
- `21–26s`: real consequence/opportunity beat;
- `26–30s`: logo/end card.

---

# 10. 16:9 and 1:1 variants

## 16:9

This is the master composition. Preserve the Android landscape visual language and as much native UI geometry as possible.

## 1:1

Use center-safe crops from the 16:9 master. If a crop removes necessary phone/HUD truth, switch that shot to a dedicated square composition built from the same raw capture rather than fabricating a UI layout.

---

# 11. A/B production variants

## Variant A — `ONE JOB`

Hook:

`ONE JOB.`

Focus: delivery loop and meaning.

Use for: first gameplay proof, store/social testing after release gates.

## Variant B — `THIS IS DROPi`

Hook:

`THIS IS DROPi TYCOON.`

First 2.5 seconds show game world + HUD with no abstract setup.

Focus: immediate game identity recognition.

## Variant C — `YOUR WORK LEAVES A MARK`

Hook starts with the real post-delivery presentation, then reverse-builds through delivery/pickup/phone/world.

Use only when the runtime beat is captured cleanly and the edit does not imply chronology that did not happen.

---

# 12. Future 60–75 second extension

The flagship `From One Delivery to a Living World` may later grow this 30-second gameplay master into a 60–75 second trailer.

The extension slots are intentionally locked until their gameplay evidence exists:

| Extension slot | Desired image | Current production class |
| --- | --- | --- |
| company growth | actual company/HQ/team/fleet gameplay | `FUTURE CREATIVE — NOT PUBLIC CLAIM READY` until capture evidence |
| wider causal economy | real supply/demand -> work -> settlement -> consequence loop | `FUTURE CREATIVE — NOT PUBLIC CLAIM READY` |
| relationships | real recurring-character consequence in normal play | `FUTURE CREATIVE — NOT PUBLIC CLAIM READY` until clean captured integration |
| second locality | actual functional second locality | `FUTURE CREATIVE — NOT PUBLIC CLAIM READY` |
| world opening | real relocation/world-to-locality lifecycle | `FUTURE CREATIVE — NOT PUBLIC CLAIM READY` |

These slots must never be filled with AI-generated pseudo-gameplay simply to make the trailer appear larger.

---

# 13. Immediate production status

## Ready now

- edit structure;
- shot IDs;
- capture instructions;
- on-screen text;
- end-card layout logic;
- EDL;
- subtitle/caption master;
- silent-feed version design;
- landscape/vertical/square adaptation rules;
- gameplay truth rules.

## Requires real capture

- every `AUTHENTIC GAMEPLAY` shot;
- exact delivery values;
- exact hero/camera framing;
- actual pickup and completion states;
- actual narrative presentation trigger;
- exact phone state after completion.

## Requires later evidence before public release use

- exact release-candidate build provenance;
- Android/Play release evidence where the destination requires it;
- legal/commercial clearance for music/SFX/logo/assets used in final media;
- claim review against the exact captured build.

---

# 14. Definition of done for Trailer 001

Trailer 001 is production-complete only when all of the following are true:

- [ ] `CAP-001` through `CAP-009` are captured or explicitly waived with reason;
- [ ] every gameplay shot is tied to one exact source/build identity;
- [ ] no fake gameplay UI exists;
- [ ] no AI-generated pseudo-gameplay frame is used as gameplay;
- [ ] the delivery shown is internally coherent across the edit;
- [ ] values shown are real captured values;
- [ ] `YOUR WORK LEAVES A MARK` is either a real runtime beat or clearly editorial typography, never fake runtime UI;
- [ ] 16:9 master exists;
- [ ] 9:16 derivative exists;
- [ ] 1:1 derivative exists when needed;
- [ ] silent/subtitled version exists;
- [ ] audio sources have traceable rights before external publication;
- [ ] final claim review is tied to the exact build represented.

Until those capture/release gates are satisfied, this package is a real **production blueprint**, not a claim that the final public trailer already exists.

---

# 15. Production command

The production team should now capture the game in the following order:

`CAP-002 -> CAP-004 -> CAP-005 -> CAP-006 -> CAP-007 -> CAP-008 -> CAP-001 -> CAP-003 -> CAP-009`

This order prioritizes the fragile state-dependent sequence first: one legitimate delivery, its completion and its immediate consequence/state.

Do not restart or manufacture the game state between those state-dependent captures unless the run is intentionally restarted and the footage is treated as a separate take.
