from pathlib import Path
import re


def read(path: str) -> str:
    return Path(path).read_text(encoding='utf-8')


def write(path: str, text: str) -> None:
    Path(path).write_text(text, encoding='utf-8')


def replace_row(path: str, identifier: str, row: str) -> None:
    text = read(path)
    pattern = rf'^\| {re.escape(identifier)} \|.*$'
    updated, count = re.subn(pattern, row, text, count=1, flags=re.MULTILINE)
    if count != 1:
        raise SystemExit(f'Expected exactly one row for {identifier} in {path}, got {count}')
    write(path, updated)


def replace_once(path: str, old: str, new: str) -> None:
    text = read(path)
    if old not in text:
        raise SystemExit(f'Expected text not found in {path}: {old[:100]!r}')
    write(path, text.replace(old, new, 1))


def update_yaml_block(path: str, item_id: str, fields: dict[str, str], label_from: str | None = None, label_to: str | None = None) -> None:
    text = read(path)
    start_match = re.search(rf'(?m)^- id: {re.escape(item_id)}\s*$', text)
    if not start_match:
        raise SystemExit(f'YAML item {item_id} not found')
    next_match = re.search(r'(?m)^- id: ', text[start_match.end():])
    end = start_match.end() + next_match.start() if next_match else len(text)
    block = text[start_match.start():end]
    for key, value in fields.items():
        pattern = rf'(?m)^  {re.escape(key)}:.*$'
        replacement = f"  {key}: '{value.replace(chr(39), chr(39)*2)}'"
        block, count = re.subn(pattern, replacement, block, count=1)
        if count != 1:
            raise SystemExit(f'Field {key} not found in YAML item {item_id}')
    if label_from and label_to:
        if label_from not in block:
            raise SystemExit(f'Label {label_from} not found in YAML item {item_id}')
        block = block.replace(label_from, label_to, 1)
    write(path, text[:start_match.start()] + block + text[end:])


# Canonical milestone/batch/epic transition.
replace_row(
    '09_Development/Planning/MILESTONE_ARCHITECTURE.md',
    'M-008',
    '| M-008 | 1 | Prototype v0.1 Verification & Release | COMPLETED — owner accepted Prototype v0.1 as the Phase-2 foundation on 2026-09-02 | E-016, E-017 | RBATCH-015, RBATCH-016, RBATCH-017 | M-007 | RESOLVED 2026-09-02 — corrected Android/Railway build accepted; game evolution authorized |',
)
replace_row(
    '09_Development/Planning/MILESTONE_ARCHITECTURE.md',
    'M-009',
    '| M-009 | 2 | Employee & Financial Systems | In Progress | E-018, E-019, E-020 | RBATCH-018, RBATCH-019, RBATCH-020, RBATCH-021 | M-008 | RESOLVED 2026-09-02 — owner authorized Phase-2 progression |',
)
replace_once('09_Development/Planning/MILESTONE_ARCHITECTURE.md', 'Version: 1.2.0', 'Version: 1.3.0')
replace_once('09_Development/Planning/MILESTONE_ARCHITECTURE.md', 'Last Updated: 2026-08-02', 'Last Updated: 2026-09-02')

replace_row(
    '09_Development/Planning/BATCH_ARCHITECTURE.md',
    'RBATCH-015',
    '| RBATCH-015 | 1 | M-008 | E-016 | Mobile Optimization | COMPLETED — merged PR #263 and accepted on Android/public runtime 2026-09-02 | RBATCH-010, RBATCH-014 | BATCH-014 | RESOLVED 2026-09-02 — owner mobile/public acceptance |',
)
replace_row(
    '09_Development/Planning/BATCH_ARCHITECTURE.md',
    'RBATCH-017',
    '| RBATCH-017 | 1 | M-008 | E-017 | Release-Checklist Verification Package | COMPLETED — release evidence plus final owner progression sign-off recorded 2026-09-02 | RBATCH-016 | BATCH-016 | RESOLVED 2026-09-02 — owner accepted Prototype v0.1 as Phase-2 foundation |',
)
replace_row(
    '09_Development/Planning/BATCH_ARCHITECTURE.md',
    'RBATCH-018',
    '| RBATCH-018 | 2 | M-009 | E-018 | Employee Hiring & Onboarding | READY FOR IMPLEMENTATION — M-009 activated 2026-09-02 | RBATCH-017 | — | RESOLVED 2026-09-02 — owner authorized game evolution / Phase-2 progression |',
)

replace_row(
    '09_Development/Planning/EPIC_CATALOG.md',
    'E-016',
    '| E-016 | 1 | M-008 | Mobile Optimization | COMPLETED — merged PR #263; Android/public acceptance recorded 2026-09-02 | RBATCH-015 | E-015 |',
)
replace_row(
    '09_Development/Planning/EPIC_CATALOG.md',
    'E-017',
    '| E-017 | 1 | M-008 | Full-Loop Integration Verification | COMPLETED — RBATCH-016/RBATCH-017 merged; final owner progression sign-off recorded 2026-09-02 | RBATCH-016, RBATCH-017 | E-016 |',
)
replace_row(
    '09_Development/Planning/EPIC_CATALOG.md',
    'E-018',
    '| E-018 | 2 | M-009 | Employee Management System | READY — M-009 activated by owner progression authorization 2026-09-02 | RBATCH-018 | E-017 |',
)

replace_row(
    '09_Development/Planning/ISSUE_CATALOG.md',
    'ISSUE-018',
    '| ISSUE-018 | Implement mobile viewport fit strategy for supported Android targets | RBATCH-015 | E-016 | M-008 | implementation | COMPLETED — merged PR #263; Android/public acceptance recorded 2026-09-02 | type:implementation, phase:1, batch:rbatch-015, epic:mobile-optimization, status:done | — | Fit the Android-first web runtime to supported target matrix selected during implementation. | No unapproved portrait/landscape canon is implied. |',
)
replace_row(
    '09_Development/Planning/ISSUE_CATALOG.md',
    'ISSUE-019',
    '| ISSUE-019 | Optimize touch interaction targets for comfortable tapping | RBATCH-015 | E-016 | M-008 | implementation | COMPLETED — merged PR #263; Android/public acceptance recorded 2026-09-02 | type:implementation, phase:1, batch:rbatch-015, epic:mobile-optimization, status:done | — | Adjust hit areas for qualitative touch comfort. | Numeric thresholds remain implementation detail, not canon. |',
)
replace_row(
    '09_Development/Planning/ISSUE_CATALOG.md',
    'ISSUE-024',
    '| ISSUE-024 | Design employee data model | RBATCH-018 | E-018 | M-009 | design | READY — canonical detailing authorized 2026-09-02 | type:design, phase:2, batch:rbatch-018, epic:employee-management, status:ready | RESOLVED 2026-09-02 — M-009 activated by owner progression authorization | Define employee attributes, salary fields, and onboarding state. | Employee model is documented before deeper implementation. |',
)
replace_row(
    '09_Development/Planning/ISSUE_CATALOG.md',
    'ISSUE-026',
    '| ISSUE-026 | Implement salary deduction system | RBATCH-018 | E-018 | M-009 | implementation | READY — implementation authorized after ISSUE-024 model 2026-09-02 | type:implementation, phase:2, batch:rbatch-018, epic:employee-management, status:ready | RESOLVED 2026-09-02 — M-009/RBATCH-018 activated | Deduct salaries on each approved salary cycle. | Salary deductions are deterministic, eligibility-aware, and exactly-once per cycle. |',
)
replace_row(
    '09_Development/Planning/ISSUE_CATALOG.md',
    'ISSUE-032',
    '| ISSUE-032 | Implement employee hiring and onboarding workflow | RBATCH-018 | E-018 | M-009 | implementation | READY — implementation authorized after ISSUE-024 model 2026-09-02 | type:implementation, phase:2, batch:rbatch-018, epic:employee-management, status:ready | RESOLVED 2026-09-02 — M-009/RBATCH-018 activated | Implement hiring flow and onboarding state transitions. | Employees can be hired, onboarded, and become active without duplicate state. |',
)

# Machine-readable planning mirror.
yaml_path = '09_Development/Planning/github_creation_plan.yaml'
update_yaml_block(yaml_path, 'M-008', {
    'status': 'COMPLETED — owner accepted Prototype v0.1 as Phase-2 foundation 2026-09-02',
    'owner_gates': 'RESOLVED 2026-09-02 — corrected Android/Railway build accepted; game evolution authorized',
})
update_yaml_block(yaml_path, 'M-009', {
    'status': 'In Progress',
    'owner_gates': 'RESOLVED 2026-09-02 — owner authorized Phase-2 progression',
})
update_yaml_block(yaml_path, 'RBATCH-015', {
    'status': 'COMPLETED — merged PR #263 and accepted on Android/public runtime 2026-09-02',
    'owner_gates': 'RESOLVED 2026-09-02 — owner mobile/public acceptance',
})
update_yaml_block(yaml_path, 'RBATCH-017', {
    'status': 'COMPLETED — release evidence plus final owner progression sign-off recorded 2026-09-02',
    'owner_gates': 'RESOLVED 2026-09-02 — owner accepted Prototype v0.1 as Phase-2 foundation',
})
update_yaml_block(yaml_path, 'RBATCH-018', {
    'status': 'READY FOR IMPLEMENTATION — M-009 activated 2026-09-02',
    'owner_gates': 'RESOLVED 2026-09-02 — owner authorized game evolution / Phase-2 progression',
})
update_yaml_block(yaml_path, 'E-016', {'status': 'COMPLETED — Android/public acceptance recorded 2026-09-02'})
update_yaml_block(yaml_path, 'E-017', {'status': 'COMPLETED — final owner progression sign-off recorded 2026-09-02'})
update_yaml_block(yaml_path, 'E-018', {'status': 'READY — M-009 activated by owner progression authorization 2026-09-02'})
update_yaml_block(yaml_path, 'ISSUE-018', {'status': 'COMPLETED — Android/public acceptance recorded 2026-09-02'})
update_yaml_block(yaml_path, 'ISSUE-019', {'status': 'COMPLETED — Android/public acceptance recorded 2026-09-02'})
update_yaml_block(yaml_path, 'ISSUE-024', {
    'status': 'READY — canonical detailing authorized 2026-09-02',
    'blocked_or_owner_gate': 'RESOLVED 2026-09-02 — M-009 activated by owner progression authorization',
}, 'status:needs-design', 'status:ready')
update_yaml_block(yaml_path, 'ISSUE-026', {
    'status': 'READY — implementation authorized after ISSUE-024 model 2026-09-02',
    'blocked_or_owner_gate': 'RESOLVED 2026-09-02 — M-009/RBATCH-018 activated',
}, 'status:future', 'status:ready')
update_yaml_block(yaml_path, 'ISSUE-032', {
    'status': 'READY — implementation authorized after ISSUE-024 model 2026-09-02',
    'blocked_or_owner_gate': 'RESOLVED 2026-09-02 — M-009/RBATCH-018 activated',
}, 'status:future', 'status:ready')

# Final owner sign-off/progression evidence. Historical HOLD text remains as history; this section supersedes it.
checklist_path = '09_Development/PROTOTYPE_RELEASE_CHECKLIST.md'
checklist = read(checklist_path)
if 'FINAL OWNER SIGN-OFF RECORDED — PHASE-2 PROGRESSION AUTHORIZED' not in checklist:
    checklist += '''\n\n---\n\n# Final Owner Progression Decision — 2026-09-02\n\n**FINAL OWNER SIGN-OFF RECORDED — PHASE-2 PROGRESSION AUTHORIZED**\n\nAfter the focused M-008 Android/Railway remediation cycle, the Project Owner confirmed the corrected public build works and explicitly requested progression to the evolution of the game. Prototype v0.1 is accepted as the technical/gameplay foundation for Phase 2.\n\nThis acceptance does **not** assert that every historical manual regression checkbox was individually re-observed in the final session. Any such residual verification is retained as regression debt and must not be fabricated. It is no longer a blocker to M-009 execution.\n\nThe current placeholder visual quality is explicitly not the final quality target.\n'''
write(checklist_path, checklist)

owner_path = '09_Development/Release_Evidence/PROTOTYPE_V0.1_OWNER_REVIEW_PACKAGE.md'
owner = read(owner_path)
if 'FINAL OWNER PROGRESSION SIGN-OFF — RECORDED 2026-09-02' not in owner:
    owner += '''\n\n---\n\n## Final owner progression sign-off — 2026-09-02\n\n**FINAL OWNER PROGRESSION SIGN-OFF — RECORDED 2026-09-02**\n\nFollowing PR #282 and the Railway redeploy, the Project Owner confirmed the corrected Android build works and requested that development move on to the evolution of the game. This supersedes the earlier HOLD state for M-008 progression purposes.\n\nM-009 / RBATCH-018 may now be activated. This is acceptance of Prototype v0.1 as a Phase-2 foundation, not acceptance of the prototype graphics as final product quality.\n'''
write(owner_path, owner)

evidence_path = '09_Development/Release_Evidence/PROTOTYPE_V0.1_RELEASE_EVIDENCE.md'
evidence = read(evidence_path)
if 'FINAL OWNER SIGN-OFF RECORDED — PHASE-2 PROGRESSION AUTHORIZED' not in evidence:
    evidence += '''\n\n---\n\n## Final owner progression evidence — 2026-09-02\n\n**FINAL OWNER SIGN-OFF RECORDED — PHASE-2 PROGRESSION AUTHORIZED**\n\nEvidence chain:\n- PR #282 merged as `a9f39df2486522764df5444ce8c63036890a6e52`;\n- permanent PR CI `33674562397`: SUCCESS, 361/361 tests;\n- post-merge `main` CI `33674673217`: SUCCESS;\n- real Android/public Railway recheck: owner confirmed the corrected build works;\n- owner explicitly requested progression to game evolution.\n\nNo unobserved historical manual check is fabricated. Residual deep regression items remain technical debt rather than a Phase-2 execution blocker.\n'''
write(evidence_path, evidence)

# Current project status and changelog.
status_path = '00_Project/PROJECT_STATUS.md'
status = read(status_path)
status = re.sub(r'Last Updated: .*', 'Last Updated: 2026-09-02 (M-008 owner progression sign-off recorded; M-009/RBATCH-018 activated)', status, count=1)
status = re.sub(r'Prototype v0\.1 — RBATCH-010 through RBATCH-017 MERGED; automated implementation/integration evidence complete; M-008 remains open only for final human/device/public review and owner release sign-off', 'Phase 2 — M-009 Employee & Financial Systems activated; RBATCH-018 Employee Hiring & Onboarding is next', status, count=1)
status = re.sub(r'Perform the final Prototype v0\.1 owner review.*?owner explicitly signs off\.', 'Implement RBATCH-018 Employee Hiring & Onboarding, beginning with the canonical employee data model, then hiring/onboarding and salary-cycle integration.', status, count=1, flags=re.DOTALL)
write(status_path, status)

changelog_path = '09_Development/CHANGELOG.md'
changelog = read(changelog_path)
entry = '''\n\n## 2026-09-02 — M-008 owner progression sign-off / M-009 activation\n\n- Owner confirmed the corrected Android/Railway build works after PR #282.\n- Prototype v0.1 accepted as the Phase-2 foundation; current temporary graphics remain below the final quality target.\n- M-009 activated and RBATCH-018 / E-018 / ISSUE-024 / ISSUE-026 / ISSUE-032 prepared for execution.\n- No unobserved historical manual verification is fabricated; residual regression debt remains non-blocking.\n'''
if 'M-008 owner progression sign-off / M-009 activation' not in changelog:
    changelog += entry
write(changelog_path, changelog)

report_path = Path('09_Development/AI_Reports/2026-09-02_099_M008_OWNER_SIGNOFF_M009_ACTIVATION.md')
report_path.write_text('''# M-008 Owner Sign-off / M-009 Activation\n\nDate: 2026-09-02\nProject: DROPi Tycoon\n\n## Result\n\nThe Project Owner confirmed the corrected public Android/Railway runtime works after PR #282 and explicitly requested progression to game evolution. Prototype v0.1 is accepted as the Phase-2 foundation.\n\nM-009 is activated and RBATCH-018 is prepared for implementation.\n\n## Evidence\n\n- PR #282 merge: `a9f39df2486522764df5444ce8c63036890a6e52`\n- PR CI: `33674562397` — SUCCESS, 361/361 tests\n- post-merge main CI: `33674673217` — SUCCESS\n- #276 and #273 closed as owner-verified\n- RBATCH-015 and E-016 closed as owner-verified\n\n## Truth boundary\n\nNo unobserved historical manual check is fabricated. Remaining deep regression debt from earlier Phase-1 batches is retained as maintenance evidence debt and is not represented as newly observed. Owner acceptance is specifically the authorization to treat Prototype v0.1 as a sufficient foundation and move into Phase 2.\n\nCurrent prototype graphics are not the final product-quality target. The architecture must continue separating simulation/state/economy from rendering so later visual upgrades remain feasible.\n''', encoding='utf-8')

# Permanent CI: protect the new owner/progression gate and M-009 readiness.
ci_path = '.github/workflows/rbatch-010-ci.yml'
ci = read(ci_path)
ci = ci.replace("assert milestones['M-008']['status'] == 'In Progress'", "assert milestones['M-008']['status'].startswith('COMPLETED')\n          assert milestones['M-009']['status'] == 'In Progress'")
ci = ci.replace("assert milestones['M-008']['owner_gates'].startswith('Final Prototype v0.1 owner release sign-off')", "assert milestones['M-008']['owner_gates'].startswith('RESOLVED 2026-09-02')\n          assert milestones['M-009']['owner_gates'].startswith('RESOLVED 2026-09-02')")
ci = ci.replace("for batch_id in ('RBATCH-010', 'RBATCH-011', 'RBATCH-012', 'RBATCH-013', 'RBATCH-014', 'RBATCH-015', 'RBATCH-016', 'RBATCH-017'):", "for batch_id in ('RBATCH-010', 'RBATCH-011', 'RBATCH-012', 'RBATCH-013', 'RBATCH-014', 'RBATCH-016'):")
ci = ci.replace("assert batches['RBATCH-017']['owner_gates'].startswith('RESOLVED 2026-09-01')", "assert batches['RBATCH-015']['status'].startswith('COMPLETED')\n          assert batches['RBATCH-017']['status'].startswith('COMPLETED')\n          assert batches['RBATCH-017']['owner_gates'].startswith('RESOLVED 2026-09-02')\n          assert batches['RBATCH-018']['status'].startswith('READY FOR IMPLEMENTATION')\n          assert batches['RBATCH-018']['owner_gates'].startswith('RESOLVED 2026-09-02')")
ci = ci.replace("for epic_id in ('E-011', 'E-012', 'E-013', 'E-014', 'E-015', 'E-016'):", "for epic_id in ('E-011', 'E-012', 'E-013', 'E-014', 'E-015'):")
ci = ci.replace("assert epics['E-017']['status'].startswith('COMPLETED')", "assert epics['E-016']['status'].startswith('COMPLETED')\n          assert epics['E-017']['status'].startswith('COMPLETED')\n          assert epics['E-018']['status'].startswith('READY')")
marker = "          for issue_id in ('ISSUE-022', 'ISSUE-023'):\n              assert issues[issue_id]['batch_id'] == 'RBATCH-017'"
if marker not in ci:
    raise SystemExit('CI issue marker not found')
insert_after = "          for issue_id in ('ISSUE-022', 'ISSUE-023'):\n              assert issues[issue_id]['batch_id'] == 'RBATCH-017'\n              assert issues[issue_id]['epic_id'] == 'E-017'\n              assert issues[issue_id]['milestone_id'] == 'M-008'\n              assert issues[issue_id]['status'].startswith('COMPLETED')\n              assert issues[issue_id]['blocked_or_owner_gate'].startswith('RESOLVED 2026-09-01')\n              assert 'status:done' in issues[issue_id]['label_names']\n"
replacement = insert_after + "\n          for issue_id in ('ISSUE-024', 'ISSUE-026', 'ISSUE-032'):\n              assert issues[issue_id]['batch_id'] == 'RBATCH-018'\n              assert issues[issue_id]['epic_id'] == 'E-018'\n              assert issues[issue_id]['milestone_id'] == 'M-009'\n              assert issues[issue_id]['status'].startswith('READY')\n              assert issues[issue_id]['blocked_or_owner_gate'].startswith('RESOLVED 2026-09-02')\n              assert 'status:ready' in issues[issue_id]['label_names']\n"
if insert_after not in ci:
    raise SystemExit('CI ISSUE-022/023 block not found')
ci = ci.replace(insert_after, replacement, 1)
ci = ci.replace("report = Path('09_Development/AI_Reports/2026-09-01_098_RBATCH_017_POST_MERGE_CLOSURE_CHECKPOINT.md').read_text(encoding='utf-8')", "report = Path('09_Development/AI_Reports/2026-09-02_099_M008_OWNER_SIGNOFF_M009_ACTIVATION.md').read_text(encoding='utf-8')")
ci = ci.replace("assert 'FINAL OWNER SIGN-OFF PENDING' in checklist", "assert 'FINAL OWNER SIGN-OFF RECORDED — PHASE-2 PROGRESSION AUTHORIZED' in checklist")
ci = ci.replace("assert '- [x]' not in checklist.lower()", "assert '2026-09-02' in checklist")
ci = ci.replace("assert 'EVIDENCE PACKAGE MERGED — FINAL RELEASE SIGN-OFF NOT YET RECORDED' in evidence", "assert 'FINAL OWNER SIGN-OFF RECORDED — PHASE-2 PROGRESSION AUTHORIZED' in evidence")
ci = ci.replace("assert 'APPROVE PROTOTYPE v0.1 RELEASE' in owner\n          assert 'HOLD PROTOTYPE v0.1 RELEASE' in owner", "assert 'FINAL OWNER PROGRESSION SIGN-OFF — RECORDED 2026-09-02' in owner")
ci = ci.replace("assert 'M-008 remains In Progress' in report", "assert 'M-009 is activated' in report")
ci = ci.replace("assert 'No Railway/public/physical-device or subjective observation is invented' in report", "assert 'No unobserved historical manual check is fabricated' in report")
write(ci_path, ci)
