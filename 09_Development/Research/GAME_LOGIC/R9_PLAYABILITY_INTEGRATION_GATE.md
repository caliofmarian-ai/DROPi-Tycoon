# R9 — Playability Integration Gate

Status: **RESEARCH WORKING PAPER — NON-CANONICAL**
Parent: #423
Track: #433

## Purpose

Turn R9 from design inspiration into a repeatable acceptance gate for later canonical reconciliation, issue design, implementation PRs and owner verification.

A feature can be technically correct and economically causal yet still fail the product if it is dull, invisible, confusing or socially meaningless.

---

# 1. Mandatory feature test

Every major gameplay system must answer the following before implementation is considered complete.

## A. Player purpose

- What does the player want to accomplish here?
- Why does the player care?
- Is the purpose understandable without reading a design document?

## B. Meaningful choice / autonomy

- What decision can the player make?
- Are at least two credible approaches possible where strategy should exist?
- Does the choice have a real trade-off rather than cosmetic wording?

## C. Competence / mastery

- What can the player learn to do better?
- Does player knowledge or execution matter?
- What feedback explains success, inefficiency or failure?

## D. Economic causality

- What need caused the activity?
- What inputs, money, labor, energy, time or infrastructure are used?
- Who pays?
- What output/state changes?
- What happens when the activity fails?

## E. Visible consequence

At least one meaningful consequence must be perceivable through the world or a clear contextual surface.

Examples:

- physical inventory changes;
- construction stage changes;
- business/facility resumes or degrades;
- vehicle/worker appears;
- traffic/routing changes;
- customer/NPC reacts;
- personal property improves;
- company/HQ evolves;
- market/city state changes.

A number increasing in a menu is insufficient by itself for important progression.

## F. Attachment / ownership

Ask whether the system can strengthen attachment to at least one of:

- the hero;
- equipment/vehicle;
- home/property;
- profession/career;
- company/team;
- recurring NPC/business relationship;
- locality/region/country;
- world history.

Not every small action needs ownership, but major progression should create it repeatedly.

## G. Variety

- What changes between repetitions?
- Can geography, cargo, route, timing, traffic, demand, facility state, weather, equipment or market conditions alter the decision?
- Is the system generating different problems, or only different text labels?

## H. Social/community meaning

If relevant:

- Can another human benefit, compete, cooperate or observe the consequence?
- Can contribution happen asynchronously?
- Does solo/NPC continuity remain valid?
- Is recognition separated from unfair economic power?

## I. Failure and recovery

- What does failure cost?
- Does the player understand why it happened?
- Does it create another decision/problem to solve?
- Is there a legitimate recovery path?

## J. Session usability

The mechanic should identify which session scales it supports:

- `QUICK` — approximately 2 minutes;
- `SHORT` — approximately 10 minutes;
- `STANDARD` — approximately 30 minutes;
- `LONG` — extended play.

No major progression family may require LONG sessions exclusively.

## K. Mobile/Android feel

- Are controls readable and responsive in landscape?
- Does UI preserve enough world visibility?
- Are touch targets reasonable?
- Are repeated actions ergonomically tolerable?
- Does the presentation remain performant at target scale?

## L. Anti-dark-pattern

The system must not depend on:

- pay-to-win power;
- paid stamina/work-energy refill;
- essential loot boxes;
- daily-login punishment;
- fake urgency;
- notification spam;
- intentionally tedious waiting that can only be skipped by spending;
- hidden economic purchase consequences.

---

# 2. Required consequence trace

For major economic actions, implementation planning should provide a trace like:

```text
PLAYER INTENT
-> ELIGIBILITY / CHOICE
-> ECONOMIC EVENT
-> AUTHORITATIVE STATE CHANGE
-> VISUAL / AUDIO / HAPTIC FEEDBACK
-> PERSONAL / COMPANY / WORLD CONSEQUENCE
-> NEXT MEANINGFUL CHOICE
```

Example:

```text
player chooses construction-material route
-> van/capacity/time checked
-> cargo transferred and delivered
-> project inventory receives concrete
-> construction site changes visibly
-> project reaches next physical stage
-> player chooses another contribution, saves earnings, or takes different work
```

This trace prevents `backend success + toast message` from becoming the default gameplay experience.

---

# 3. Cross-track R1–R8 playability requirements

| Track | Must feel like | R9 requirement |
|---|---|---|
| R1 Hero | a life/career authored by the player | needs, work and progression create choices; equipment/home/career visibly change |
| R2 Company | building an organization, not editing a spreadsheet | employees, fleet, HQ, contracts and facilities physically reflect company growth/decline |
| R3 Professions | becoming capable and valuable | training changes verbs/eligibility; mastery has understandable feedback and specialist identity |
| R4 Economy | finding and solving real opportunities | shortages/surpluses/prices create decisions; cargo movement produces downstream effects |
| R5 City | contributing to a living place | shops, construction, employment, traffic, cleanliness, architecture and population react visibly |
| R6 Country | participating in regional/national transformation | infrastructure, trade, industry, migration and development appear on strategic maps and local nodes |
| R7 Multiplayer | belonging to a persistent society | companies, contracts, mentoring, projects, competition and appreciation add meaning asynchronously |
| R8 Time | a world with rhythm and history | day/night/seasons/offline change conditions and stories without coercive login schedules |

If a track becomes numerically deep but cannot satisfy its R9 row, it is not ready for canonical implementation.

---

# 4. Playability scorecard for implementation PRs

For a substantial gameplay PR, reviewers should record:

- `FUN`: PASS / PARTIAL / FAIL
- `CHOICE`: PASS / PARTIAL / FAIL
- `CLARITY`: PASS / PARTIAL / FAIL
- `VISIBLE_CONSEQUENCE`: PASS / PARTIAL / FAIL
- `ECONOMIC_CAUSALITY`: PASS / PARTIAL / FAIL
- `VARIETY`: PASS / PARTIAL / FAIL
- `RECOVERY`: PASS / PARTIAL / N/A / FAIL
- `ASYNC_SOLO_CONTINUITY`: PASS / PARTIAL / N/A / FAIL
- `ANDROID_WORLD_VISIBILITY`: PASS / PARTIAL / FAIL

A feature should not be promoted as a finished player-facing slice when core applicable items are FAIL.

Small technical/internal PRs are exempt from pretending they are fun; the gate applies when the feature is presented as a player-facing capability.

---

# 5. Owner checkpoint policy

Owner review should focus on **meaningful batches**, not trivial isolated cosmetic changes.

Request owner verification when a batch demonstrates a material experience such as:

- first complete work shift;
- first meaningful vehicle progression;
- new map layer/navigation experience;
- visible construction/economic consequence chain;
- company growth/HQ transformation;
- multiplayer/community project loop;
- city/regional transformation.

Do not interrupt the owner merely to verify a single small icon or decorative prop unless it blocks usability or defines a new visual family.

---

# 6. Research exit criterion added by R9

The Game Logic Research program is not complete merely when every resource and payment has a causal explanation.

It must also be possible to explain:

1. what the player enjoys doing moment to moment;
2. what the player chooses;
3. how the player becomes better;
4. what visibly changes because of the action;
5. what the player becomes attached to;
6. why the player has a personally meaningful next goal;
7. how other humans add meaning without becoming mandatory;
8. why returning later is interesting rather than coerced.

Final principle:

> **Causal simulation creates credibility; satisfying interaction, visible authorship and attachment turn that simulation into a game. DROPi needs both.**
