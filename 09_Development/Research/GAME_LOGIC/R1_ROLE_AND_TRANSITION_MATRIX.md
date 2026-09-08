# R1 — Role and Transition Matrix

Status: **RESEARCH ONLY — NON-CANONICAL**
Parent: #423
Track: #424

## Purpose

Close the ambiguity around what a human player `is` at any moment.

The research conclusion is that DROPi Tycoon should avoid a single exclusive player-role enum. The player is one persistent person whose profession, employment, membership, authority, ownership and location change independently.

---

## 1. Orthogonal player state families

| State family | Examples | Can coexist with other families? | Recommended ownership |
|---|---|---:|---|
| Account identity | account ID, profile, moderation identity, cosmetics/history | Yes | account-wide |
| World hero identity | world actor ID, current World Instance | Yes | world-local |
| Profession capability | courier, mechanic, dispatcher, pilot, mariner, finance | Multiple | world-local |
| Employment | unemployed, gig worker, employee, specialist contract | Yes, governed | world-local |
| Company membership | internal member of a company | Recommended one active primary membership | world-local |
| Founder history | historical founder of one or more companies | Yes | durable world history |
| Executive authority | CEO/executive/authorized manager | Yes, permission-bound | world-local company relationship |
| Investment | external shares in companies | Many companies | world-local personal ownership |
| Personal assets | money, tools, vehicles, housing/property | Yes | world-local personal ownership |
| Company-controlled assets | fleet, warehouses, factories, HQ, inventory | No personal ownership inference | company aggregate |
| Operational permissions | drive company van, manage warehouse, approve dispatch | Multiple, scope-limited | company/facility authority |
| World presence | city, region, transit, facility | One current physical state | world-local |
| Reputation/track record | personal service history, profession trust | Yes | world-local economic reputation |

---

## 2. Why this matters

Example valid person:

> Elena is a qualified mechanic and van driver, works for Company A, is an internal member of Company A, owns external shares in Companies B and C, founded an older company D years ago but no longer manages it, owns a personal car, and is currently travelling to another region for an advanced maintenance course.

No single label such as `Mechanic`, `Employee`, `Founder` or `Investor` can represent this correctly.

---

## 3. Primary life states

These are presentation states, not exclusive domain roles.

### A. World Newcomer / Resident

Has:
- stable world hero identity;
- starter access;
- no required company ownership;
- basic world presence;
- entry work/training routes.

Transitions to:
- independent worker;
- employee/apprentice;
- student/trainee.

### B. Independent Worker

May:
- take delivery gigs;
- accept service contracts;
- use personal equipment;
- build profession experience;
- apply for company employment;
- later form a company if eligible.

### C. Employee

Has an employment relationship with a company.

May also be:
- a specialist;
- an internal member;
- an external investor elsewhere;
- a historical founder elsewhere.

Employment does not automatically grant ownership or governance.

### D. Specialist

A capability state, not an employer state.

May be:
- independent;
- employee;
- manager;
- founder;
- contractor.

### E. Company Member

Receives internal organizational eligibility/rights under future governance rules.

Research recommendation:
- one active internal company membership at a time;
- membership is separate from employment;
- a member may leave employment without automatically erasing historical membership until exit rules settle;
- final membership exit triggers the canonical Internal/Member share consequence when applicable.

### F. Founder

Founder is permanent historical identity for each company the player created.

Founder does **not** imply forever:
- executive control;
- employment;
- internal membership;
- majority ownership.

A person may historically found more than one company over a long career, subject to R2 anti-monopoly/company-formation rules.

### G. Executive / Manager

An authority relationship with a company.

Can be held by:
- founder;
- internal member;
- potentially a professional non-founder executive if R2 approves that model.

Executive power must always come from authoritative company permissions, never from historical founder status alone.

### H. Investor

Owns external portfolio interests.

Can coexist with almost every profession/employment path.

Investment must not silently grant:
- facility access;
- employee authority;
- dispatch permission;
- internal membership.

### I. Legacy / Mentor / Senior Specialist

Late-game person whose value may come from:
- rare qualifications;
- mentoring/training;
- world history;
- infrastructure expertise;
- governance experience;
- investment;
- complex contracts;
- restoration/development projects.

Does not require company ownership.

---

## 4. Recommended compatibility rules

### Profession + profession

**Compatible.**

One hero may accumulate multiple qualifications. Prerequisites and time/cost create specialization naturally without hard classes.

### Employment + profession

**Compatible.**

Employment may require a profession, but does not own that qualification.

### Employment + independent contract

**Conditionally compatible.**

Recommended rule:
- outside gig/service work can be accepted when it does not conflict with an exclusive employment clause, active shift or company confidentiality/competition rules defined later;
- do not globally prohibit side work.

### Multiple simultaneous continuing employers

**Research recommendation: restrict initially.**

One primary continuing employment relationship is simpler for payroll, scheduling, anti-collusion and offline behavior. Temporary external contracts can remain available.

R3 may later justify part-time multi-employer contracts.

### Internal membership in multiple companies

**Research recommendation: no, initially.**

Use one active internal member company at a time.

Reason:
- protects governance clarity;
- makes member-share eligibility coherent;
- reduces collusion/self-dealing;
- preserves meaningful company identity.

### External investment in multiple companies

**Compatible.**

Already aligned with existing direction, subject to future market-integrity rules.

### Founder of multiple companies over lifetime

**Potentially compatible.**

Founder is history. R2 must control active company creation, executive bandwidth and anti-monopoly effects rather than erasing historical founder records.

### Founder + employee of another company

**Potentially compatible after final exit from active control/membership of the first company.**

Historical founder identity must not trap the person permanently.

### Executive + outside executive

**Recommended restricted.**

One hero should not simultaneously exercise unlimited executive authority over direct competitors. R2 governance/competition research must define exact conflict rules.

### Investor + competitor employee

**Compatible with disclosure/market-integrity rules later.**

External investment alone does not grant operational information or authority.

---

## 5. Transition rules to research/approve

### Newcomer -> Employee

Requires:
- accepted employment/apprenticeship offer;
- employer capacity;
- required baseline qualification if any;
- authoritative contract acceptance.

### Employee -> Specialist

Capability is earned through training/practice; it is not a promotion flag.

### Employee -> Member

Requires a deliberate membership action/eligibility rule. Employment alone does not create internal ownership rights.

### Worker -> Founder

Requires company-formation prerequisites defined in R2:
- entrepreneurship capability;
- startup resources;
- local authorization/capacity;
- required service capability;
- physical/administrative step where retained.

### Founder -> Non-executive Founder

Occurs when executive authority changes legitimately.

Historical Founder identity persists.

### Member -> Exit

Must settle:
- company permissions;
- equipment custody;
- employment;
- internal shares;
- outstanding contracts;
- personal vs company property.

### Employee -> Fired / Quit

Must settle:
- wages owed;
- assigned equipment;
- unfinished tasks;
- permissions;
- next-work eligibility;
- reputation consequences only when justified.

### Active -> Inactive

Inactivity must not equal deletion.

Possible governed outcomes over time:
- stop accepting new tasks;
- no new work-based wages;
- temporary suspension of operational permissions;
- succession/delegation for executive duties;
- contract expiry according to known terms.

### Inactive -> Returned

Requires authoritative catch-up and restoration of eligible personal state, not replaying every missed frame/day.

---

## 6. Player progression signals should remain separate

Research recommendation: do not merge the following into one `level`.

### Experience

Evidence that the player performed relevant work.

### Qualification

Permission/capability gate earned through defined training/assessment/prerequisites.

### Proficiency / Mastery

Degree of expertise that may improve efficiency, quality or access to advanced work.

### Reputation

How other market actors/world systems evaluate past reliability/trust/performance.

### Organizational Authority

What the player is currently allowed to do for a company.

### Wealth / Ownership

What the player owns.

A wealthy player is not automatically skilled; a skilled player is not automatically an executive; a founder is not automatically the best operator.

---

## 7. Anti-softlock requirements

Every player state must have a route back to meaningful activity.

| Failure/state | Minimum recovery route |
|---|---|
| zero Personal Money | basic work / employment / asset sale / relocation support |
| no employer | gigs, job market, training |
| lost qualification prerequisite path | accessible retraining/practice path |
| fired | new employment, independent work |
| company collapse | person retains identity/capability and can work elsewhere |
| executive removed | specialist/employee/investor/founder-history paths remain |
| remote region with no demand | public/market relocation path |
| mature world dominated by large companies | apprenticeship, starter work, labor-short regions, NPC fallback |
| long inactivity | catch-up summary + available work; no identity deletion |

---

## 8. Provisional model for owner review

The strongest R1 model is a **single flexible world-local economic hero** whose capabilities and relationships form a portfolio rather than a class ladder.

The person's identity survives employment changes, company failure and leadership loss. Their qualifications create labor value; companies create organizational capability; ownership creates financial influence; none of those domains should impersonate the others.
