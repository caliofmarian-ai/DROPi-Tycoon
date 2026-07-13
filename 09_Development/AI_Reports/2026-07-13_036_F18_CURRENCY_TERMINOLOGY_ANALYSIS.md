# Report Metadata

- Report ID: 036
- Report title: F-18 Currency Terminology Analysis — "coins" vs "money" in Live Documents
- Date: 2026-07-13
- Project: DROPi Tycoon
- Task type: Analysis-Only (Audit Finding Verification)
- Agent/model: GitHub Copilot (claude-sonnet-4.6)
- Repository: caliofmarian-ai/DROPi-Tycoon
- Branch: copilot/analyze-audit-finding-f-18
- Base commit: 3c10d09e4652eecf9192ba431a8d1281353fe260
- Resulting commit: N/A (analysis only — no canonical documents modified)
- Pull Request: Pending
- Human approval status: Pending review

---

# Original Task Instruction

Analyze audit finding F-18 from the original full documentation consistency audit for the DROPi-Tycoon repository.

IMPORTANT:
- This is an ANALYSIS / VERIFICATION task only.
- Do NOT modify canonical project documents.
- Do NOT implement corrections yet.
- First fetch and inspect the latest origin/main.
- Verify that all previously merged corrections and reports relevant to F-18 are present on main.
- Follow 09_Development/AI_REPORTING_PROTOCOL.md exactly.
- Create a persistent analysis report in 09_Development/AI_Reports/ using the next available sequential report number.
- Do not modify historical AI reports.

TASK:

1. Locate the exact original F-18 finding in:
   09_Development/AI_Reports/2026-07-12_001_FULL_DOCUMENTATION_CONSISTENCY_AUDIT.md

2. Recover and report:
   - exact original F-18 title;
   - severity;
   - original evidence;
   - original recommendation.

3. Inspect the CURRENT repository state on origin/main, not only the original audit.

4. Determine whether F-18 is:
   - still open;
   - partially resolved;
   - fully resolved by prior corrections;
   - or obsolete because repository structure/content changed.

5. Inspect all live canonical documents relevant to F-18, especially:
   - 09_Development/MOBILE_UI_CONTROLS.md
   - 02_Economy/ECONOMY.md
   - 09_Development/GAME_DATA_STRUCTURE.md
   - 09_Development/CORE_GAMEPLAY_SYSTEMS.md
   - 09_Development/PROTOTYPE_V0.1.md
   - 09_Development/FIRST_PLAYABLE_EXPERIENCE.md
   - 07_UI/UI.md
   - any other live document containing relevant economy/currency terminology.

6. Perform repository-wide searches across live non-historical documents for all relevant terminology, including at minimum:
   - coin
   - coins
   - Coins
   - money
   - Money
   - currency
   - Currency
   - balance
   - reward
   - payment

7. Determine:
   - the exact current inconsistency, if any;
   - every live canonical file affected;
   - whether "coins" and "money" represent the same resource or distinct systems;
   - the canonical terminology that should be used for Prototype v0.1;
   - the canonical owner of economy/currency semantics;
   - whether any technical stored field names differ legitimately from player-facing terminology;
   - whether prior corrections introduced, removed, or changed any F-18 evidence.

8. Clearly separate:
   - required corrections needed to resolve F-18;
   - optional clarity improvements;
   - unrelated findings or terminology that must remain out of scope.

9. Recommend the minimum safe correction strategy.

10. List the exact files that would change if the correction is approved.

11. State whether F-18 would be FULLY RESOLVED after the recommended correction.

12. Validate that:
   - no canonical project document was modified;
   - no historical AI report was modified;
   - only the new persistent analysis report was added;
   - report numbering follows AI_REPORTING_PROTOCOL.md;
   - repository-wide searches were completed;
   - no unrelated scope changes were introduced.

AT COMPLETION, REPORT:
- exact report file created;
- exact original F-18 title and severity;
- evidence sources used;
- current F-18 status;
- root cause summary;
- complete current issue summary;
- canonical terminology decision;
- canonical ownership result;
- exact required files that would change if approved;
- exact optional files;
- unrelated/out-of-scope findings discovered;
- whether F-18 would be fully resolved if corrected;
- validation results;
- remaining contradictions;
- unresolved issues;
- Pull Request link.

Do not implement the correction in this task.

---

# Objective

Verify the current status of audit finding F-18 on origin/main. Determine whether F-18 is still open, partially resolved, fully resolved, or obsolete. Identify all affected live documents and produce a minimum safe correction recommendation for human approval.

---

# Scope

- Finding: F-18 from `09_Development/AI_Reports/2026-07-12_001_FULL_DOCUMENTATION_CONSISTENCY_AUDIT.md`
- Subject: Currency/economy terminology inconsistency — "coins" vs "money" in player-facing content
- Scope boundary: All live canonical `.md` documents in the repository excluding the `09_Development/AI_Reports/` directory
- No canonical documents modified
- No historical AI reports modified

---

# Files Inspected

## Source Finding Document
- `09_Development/AI_Reports/2026-07-12_001_FULL_DOCUMENTATION_CONSISTENCY_AUDIT.md` (lines 806–824)

## Protocol Document
- `09_Development/AI_REPORTING_PROTOCOL.md`

## Primary Documents Named in Original F-18 Finding
- `09_Development/MOBILE_UI_CONTROLS.md`
- `02_Economy/ECONOMY.md`
- `09_Development/CORE_GAMEPLAY_SYSTEMS.md`
- `09_Development/PROTOTYPE_V0.1.md`

## Additional Documents Inspected (Repository-Wide Search Results)
- `09_Development/GAMEPLAY_EVENTS_FLOW.md`
- `09_Development/GAME_DATA_STRUCTURE.md`
- `09_Development/FIRST_PLAYABLE_EXPERIENCE.md`
- `07_UI/UI.md`
- `09_Development/GAME_BALANCING_RULES.md`
- `09_Development/PROTOTYPE_RELEASE_CHECKLIST.md`
- `09_Development/ASSET_IMPORT_GUIDE.md`
- `09_Development/PROTOTYPE_GENERATION_PACKAGE.md`
- `09_Development/GDEVELOP_PROJECT_STRUCTURE.md`
- `01_GameDesign/MISSIONS.md`
- `01_GameDesign/GAMEPLAY.md`
- `01_GameDesign/PROGRESSION.md`
- `02_Economy/PRICING.md`
- `02_Economy/MARKET.md`
- `06_Technical/SAVE_SYSTEM.md`

---

# Files Created

- `09_Development/AI_Reports/2026-07-13_036_F18_CURRENCY_TERMINOLOGY_ANALYSIS.md` (this report)

---

# Files Modified

None.

---

# Files Moved or Renamed

None.

---

# Files Deleted

None.

---

# Actions Performed

1. Fetched origin/main and verified HEAD commit: `3c10d09e4652eecf9192ba431a8d1281353fe260`
2. Identified latest merged PR: #35 (F-19 resolution verification report 035) — confirmed no F-18 corrections have been merged
3. Read the original F-18 finding verbatim from `2026-07-12_001_FULL_DOCUMENTATION_CONSISTENCY_AUDIT.md`
4. Read all documents listed in the original F-18 finding
5. Performed repository-wide grep searches for: `coin`, `coins`, `Coins`, `money`, `Money`, `currency`, `Currency`, `balance`, `Balance`, `reward`, `payment`, `CompanyMoney`, `DeliveryReward`
6. Identified all occurrences of "coins"/"Coins" across live canonical documents
7. Compiled full inventory of "money" occurrences across live canonical documents
8. Assessed whether prior merged corrections (reports 002–035) addressed F-18 — none did
9. Determined canonical ownership and player-facing vs technical field naming distinction

---

# Findings

## F-18 Original Finding (Verbatim from Audit 001)

**FINDING F-18**
**Severity:** MINOR
**Title:** `MOBILE_UI_CONTROLS.md` uses "coins" while all other documents use "money"

**Files Involved:**
- `09_Development/MOBILE_UI_CONTROLS.md`
- `02_Economy/ECONOMY.md`
- `09_Development/CORE_GAMEPLAY_SYSTEMS.md`
- `09_Development/PROTOTYPE_V0.1.md`

**Evidence:**
- `MOBILE_UI_CONTROLS.md`: `"Delivery successful +50 coins"`
- All economy and prototype docs consistently use "money": `"CompanyMoney"`, `"Money"`, `"money value"`

**Recommended Correction:** Decide on one term (recommend "money" or a game-branded currency name) and update `MOBILE_UI_CONTROLS.md` user feedback examples to match.

**Canonical Ownership:** `02_Economy/ECONOMY.md` should define the currency terminology.

---

## Current Repository State Analysis

### F-18 Status: STILL OPEN

The original F-18 evidence has NOT been corrected. The finding is unchanged on origin/main.

### Evidence of "coins"/"Coins" Across Live Canonical Documents

The following occurrences were found:

| File | Line | Exact Text | Status |
|---|---|---|---|
| `09_Development/MOBILE_UI_CONTROLS.md` | 222 | `"Delivery successful +50 coins"` | **Original F-18 evidence — uncorrected** |
| `09_Development/GAMEPLAY_EVENTS_FLOW.md` | 236 | `"Delivery Completed +50 Coins"` | **New evidence — not in original F-18 finding** |

No other occurrences of "coin", "coins", or "Coins" were found in any live canonical document.

### Evidence of "money"/"Money" — Dominant Canonical Terminology

All other canonical documents use "money" or "Money" for the player-facing currency:

| File | Representative Occurrences |
|---|---|
| `02_Economy/ECONOMY.md` | "Company Money", "money", "Money" throughout |
| `09_Development/PROTOTYPE_V0.1.md` | "earn money", "Receive Payment", "Current money" |
| `09_Development/CORE_GAMEPLAY_SYSTEMS.md` | "Money is earned from:" |
| `09_Development/GAME_DATA_STRUCTURE.md` | "Money" (line 109, 127), "CompanyData Money Increased" (line 311) |
| `09_Development/GAME_BALANCING_RULES.md` | "Earn money" multiple occurrences |
| `09_Development/PROTOTYPE_RELEASE_CHECKLIST.md` | "Money value updates correctly", "Money is visible" |
| `09_Development/FIRST_PLAYABLE_EXPERIENCE.md` | "money", "Reward" (no "coins") |
| `07_UI/UI.md` | "Money" (line 148) |
| `09_Development/ASSET_IMPORT_GUIDE.md` | "money", "icon_money" |
| `09_Development/GAMEPLAY_EVENTS_FLOW.md` | "add money reward" (line 184), "available money" (line 206) |

### Are "coins" and "money" the Same Resource?

Yes. Analysis of all documents confirms that "coins" and "money" refer to the same single player-facing financial resource. There is no second currency system in Prototype v0.1. The inconsistency is purely a terminology error in two player-facing notification examples, not a system design divergence.

### Technical Field Names vs Player-Facing Terminology

The following technical stored field names are legitimate and intentionally differ from player-facing "money":

- `CompanyMoney` — technical variable name in `GAME_DATA_STRUCTURE.md`, `PROTOTYPE_GENERATION_PACKAGE.md`, `GDEVELOP_PROJECT_STRUCTURE.md`
- `DeliveryReward` — technical variable name in `GAME_DATA_STRUCTURE.md`
- `MoneyReceived` — event data field name in `GAMEPLAY_EVENTS_FLOW.md` (line 306)

These technical names are NOT part of the F-18 inconsistency. They are internal implementation identifiers, not player-facing display text.

### Prior Corrections and F-18

Reports 002–035 were reviewed at a high level. No prior report corrects or references F-18 as implemented. F-18 appears in report 001 only. None of the merged PRs modified `MOBILE_UI_CONTROLS.md` or `GAMEPLAY_EVENTS_FLOW.md` in ways that addressed the "coins" terminology.

### New Evidence Not in Original F-18 Finding

`09_Development/GAMEPLAY_EVENTS_FLOW.md` line 236 contains `"Delivery Completed +50 Coins"`. This is a UI notification example that uses "Coins" (capital C) instead of the canonical "money". This file was **not** listed in the original F-18 finding. It represents an additional instance of the same inconsistency that must be corrected alongside the original finding to fully resolve F-18.

---

## Canonical Terminology Decision

**Canonical player-facing term: `money`**

Evidence for this decision:
1. `02_Economy/ECONOMY.md` (canonical owner) exclusively uses "money" and "Company Money"
2. `09_Development/PROTOTYPE_V0.1.md` uses "money" throughout
3. `09_Development/MOBILE_UI_CONTROLS.md` itself uses "Money" in the UI layout section (`| Money   Level |`) and Company Status section ("Money")
4. `07_UI/UI.md` uses "Money"
5. No document outside the two affected notification examples uses "coins" or "Coins"

The term "money" is already used in 10+ documents and in the UI layout section of `MOBILE_UI_CONTROLS.md` itself, making "coins" in the notification example an isolated error within the same file.

## Canonical Ownership Result

**`02_Economy/ECONOMY.md` is the canonical owner** of economy/currency semantics, as stated in the original F-18 finding and confirmed by repository structure. `ECONOMY.md` is the primary document for all financial resource definitions.

---

# Recommendations

## Required Corrections (Minimum Safe Correction to Resolve F-18)

Two player-facing notification examples must be updated to replace "coins"/"Coins" with "money":

### Correction 1 — MOBILE_UI_CONTROLS.md (Original F-18 Evidence)
- **File:** `09_Development/MOBILE_UI_CONTROLS.md`
- **Current text (line 222):** `"Delivery successful +50 coins"`
- **Required change:** Replace "coins" with "money"
- **Corrected text:** `"Delivery successful +50 money"`

### Correction 2 — GAMEPLAY_EVENTS_FLOW.md (New Evidence, Same Inconsistency)
- **File:** `09_Development/GAMEPLAY_EVENTS_FLOW.md`
- **Current text (line 236):** `"Delivery Completed +50 Coins"`
- **Required change:** Replace "Coins" with "money"
- **Corrected text:** `"Delivery Completed +50 money"`

Both corrections are in player-facing UI notification examples. Both use the same incorrect "coins"/"Coins" term. Both must be corrected to fully resolve the F-18 inconsistency category.

## Optional Clarity Improvements

None identified. The notification examples are illustrative only. No additional wording changes beyond the "coins" → "money" substitution are recommended.

## Out-of-Scope Findings (Must Not Be Changed as Part of F-18)

- `CompanyMoney`, `DeliveryReward`, `MoneyReceived` — technical field names; intentionally different from player-facing text; must not be changed under F-18
- "balance" occurrences in `GAME_BALANCING_RULES.md`, `TDD.md`, routing/logistics docs — these refer to gameplay balance design, not the currency resource
- "reward" occurrences throughout — these refer to delivery reward values and are consistent with the canonical data structure; no terminology change needed
- "payment" in `PROTOTYPE_V0.1.md` — refers to the "Receive Payment" action label, not a currency name; consistent and intentional

---

# Exact Files That Would Change If Correction Is Approved

## Required (F-18 Resolution)
1. `09_Development/MOBILE_UI_CONTROLS.md` — change "coins" to "money" in one notification example (line 222)
2. `09_Development/GAMEPLAY_EVENTS_FLOW.md` — change "Coins" to "money" in one UI notification example (line 236)

## Optional
None.

## Would F-18 Be FULLY RESOLVED?

**Yes.** After the two corrections above:
- All player-facing currency terminology across all live canonical documents would use "money" or "Money" exclusively
- No remaining "coins" or "Coins" occurrences would exist in any live document
- The original F-18 evidence would be corrected
- The new discovered instance in GAMEPLAY_EVENTS_FLOW.md would also be corrected
- F-18 status: FULLY RESOLVED

---

# Validation Performed

1. Verified origin/main HEAD commit: `3c10d09e4652eecf9192ba431a8d1281353fe260`
2. Verified most recent merged PR is #35 (F-19 verification) — no F-18 corrections present
3. Confirmed no canonical project documents were modified during this analysis task
4. Confirmed no historical AI reports were modified
5. Confirmed report number 036 is the next sequential number after the highest existing report (035)
6. Confirmed repository-wide grep searches were completed for all required terms
7. Confirmed no unrelated scope changes were introduced

---

# Validation Results

| Check | Result |
|---|---|
| No canonical document modified | PASS |
| No historical AI report modified | PASS |
| Only new report 036 added | PASS |
| Report numbering follows protocol (036 = next after 035) | PASS |
| Repository-wide searches completed for all required terms | PASS |
| No unrelated scope changes introduced | PASS |
| F-18 original finding recovered verbatim | PASS |
| All live documents relevant to F-18 inspected | PASS |

---

# Unresolved Issues

1. **F-18 remains open** — the original "coins" in `MOBILE_UI_CONTROLS.md` has not been corrected
2. **New evidence discovered** — `GAMEPLAY_EVENTS_FLOW.md` contains a matching "Coins" instance not listed in the original F-18 finding; this additional instance must be corrected together with the original finding

---

# Final Result/Status

**Analysis complete. F-18 is STILL OPEN.**

- Root cause: Two isolated player-facing UI notification examples use "coins"/"Coins" instead of the canonical term "money". This is a copy inconsistency, not a system design divergence. Both occurrences appear in mock UI text strings used as documentation examples.
- No prior correction has addressed F-18.
- Canonical term is confirmed as "money" by multiple authoritative documents including `02_Economy/ECONOMY.md` (canonical owner) and the UI layout in `MOBILE_UI_CONTROLS.md` itself.
- Technical field names (`CompanyMoney`, `DeliveryReward`, `MoneyReceived`) are legitimate and out of scope.
- Correction requires changes to exactly two files, each requiring one word change.
- After correction, F-18 would be FULLY RESOLVED.

---

# Follow-up Actions

1. Human approval required before implementing correction
2. If approved: implement Correction 1 and Correction 2 as described in the Recommendations section
3. After implementation: create a new implementation report referencing this analysis (report 036)
4. Update F-18 status to RESOLVED in the implementation report

---

End of Report
