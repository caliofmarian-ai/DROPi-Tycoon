from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read(relative: str) -> tuple[Path, str, str]:
    path = ROOT / relative
    raw = path.read_bytes().decode('utf-8')
    newline = '\r\n' if '\r\n' in raw else '\n'
    return path, raw.replace('\r\n', '\n'), newline


def write(path: Path, text: str, newline: str) -> None:
    path.write_bytes(text.replace('\n', newline).encode('utf-8'))


def required_replace(text: str, old: str, new: str, expected: int = 1) -> str:
    count = text.count(old)
    if count != expected:
        raise RuntimeError(f'Expected {expected} occurrence(s) of {old!r}, found {count}')
    return text.replace(old, new)


def table_row(text: str, prefix: str, replacement: str) -> str:
    lines = text.split('\n')
    matches = [i for i, line in enumerate(lines) if line.startswith(prefix)]
    if len(matches) != 1:
        raise RuntimeError(f'Expected one table row for {prefix!r}, found {len(matches)}')
    lines[matches[0]] = replacement
    return '\n'.join(lines)


def reconcile_batch_architecture() -> None:
    path, text, nl = read('09_Development/Planning/BATCH_ARCHITECTURE.md')
    text = table_row(text, '| BATCH-010b | RBATCH-011 |', '| BATCH-010b | RBATCH-011 | MERGED in PR #255 — pending Railway/public verification | M-005 / E-012 | 09_Development/Planning/BATCH_ARCHITECTURE.md | 09_Development/Implementation_Preparation/IMPLEMENTATION_BATCH_PLAN.md |')
    text = table_row(text, '| BATCH-011 | RBATCH-012 |', '| BATCH-011 | RBATCH-012 | PR #256 — validation complete; pending merge | M-006 / E-013 | 09_Development/Planning/BATCH_ARCHITECTURE.md | 09_Development/Implementation_Preparation/IMPLEMENTATION_BATCH_PLAN.md |')
    text = table_row(text, '| RBATCH-011 | 1 | M-005 | E-012 | MainMenu Flow |', '| RBATCH-011 | 1 | M-005 | E-012 | MainMenu Flow | MERGED in PR #255 — pending Railway/public verification | RBATCH-002 | BATCH-010b | — |')
    text = table_row(text, '| RBATCH-012 | 1 | M-006 | E-013 | CompanyManagement + Upgrade Purchase Flow |', '| RBATCH-012 | 1 | M-006 | E-013 | CompanyManagement + Upgrade Purchase Flow | PR #256 — validation complete; pending merge | RBATCH-009, RBATCH-010 | BATCH-011 | — |')
    write(path, text, nl)


def reconcile_epics() -> None:
    path, text, nl = read('09_Development/Planning/EPIC_CATALOG.md')
    text = table_row(text, '| E-012 | 1 | M-005 | MainMenu & Game Flow |', '| E-012 | 1 | M-005 | MainMenu & Game Flow | MERGED in PR #255 — pending Railway/public verification | RBATCH-011 | E-003 |')
    text = table_row(text, '| E-013 | 1 | M-006 | Company Management Scene |', '| E-013 | 1 | M-006 | Company Management Scene | PR #256 — validation complete; pending merge | RBATCH-012 | E-010, E-011 |')
    write(path, text, nl)


def reconcile_milestones() -> None:
    path, text, nl = read('09_Development/Planning/MILESTONE_ARCHITECTURE.md')
    text = table_row(text, '| M-006 | 1 | Company Management & Bicycle |', '| M-006 | 1 | Company Management & Bicycle | In Progress | E-013, E-014 | RBATCH-012, RBATCH-013 | M-005 | — |')
    write(path, text, nl)


def reconcile_issues() -> None:
    path, text, nl = read('09_Development/Planning/ISSUE_CATALOG.md')
    rows = {
        'ISSUE-005': '| ISSUE-005 | Implement active-order HUD panel | RBATCH-010 | E-011 | M-005 | implementation | COMPLETED — merged PR #253; Railway/public verification pending at RBATCH-010 level | type:implementation, phase:1, batch:rbatch-010, epic:hud-notifications, status:done | — | Show destination/status/package state in HUD. | HUD appears only when order active. |',
        'ISSUE-006': '| ISSUE-006 | Implement Accept Order button in HUD | RBATCH-010 | E-011 | M-005 | implementation | COMPLETED — merged PR #253; Railway/public verification pending at RBATCH-010 level | type:implementation, phase:1, batch:rbatch-010, epic:hud-notifications, status:done | — | Connect HUD button to the shared canonical acceptance path. | Available orders can be accepted once from HUD without world-input side effects. |',
        'ISSUE-007': '| ISSUE-007 | Implement delivery status notifications | RBATCH-010 | E-011 | M-005 | implementation | COMPLETED — merged PR #253; Railway/public verification pending at RBATCH-010 level | type:implementation, phase:1, batch:rbatch-010, epic:hud-notifications, status:done | — | Show notifications for Accepted/PickedUp/Completed/Failed. | Notification appears once on each canonical state change. |',
        'ISSUE-008': '| ISSUE-008 | Implement required MainMenu flow | RBATCH-011 | E-012 | M-005 | implementation | COMPLETED — merged PR #255; Railway/public verification pending at RBATCH-011 level | type:implementation, phase:1, batch:rbatch-011, epic:mainmenu-gameflow, status:done | — | Implement Start Game, Settings and Information without save-dependent behavior. | MainMenu actions are mobile-friendly, deterministic and persistence-independent. |',
        'ISSUE-010': '| ISSUE-010 | Implement upgrade purchase flow | RBATCH-012 | E-013 | M-006 | implementation | PR #256 implementation validated — pending merge | type:implementation, phase:1, batch:rbatch-012, epic:company-management, status:in-progress | — | Purchase upgrades with affordability enforcement using canonical company and purchased-upgrade state. | Player cannot buy unaffordable upgrades; successful purchase deducts cost once and cannot charge a maxed upgrade twice. |',
        'ISSUE-011': '| ISSUE-011 | Implement CompanyManagement scene navigation | RBATCH-012 | E-013 | M-006 | implementation | PR #256 implementation validated — pending merge | type:implementation, phase:1, batch:rbatch-012, epic:company-management, status:in-progress | — | Move between GameWorld and CompanyManagement using the active in-memory runtime session. | Scene transitions preserve company/world state without implementing persistent Save/Load. |',
    }
    for issue_id, row in rows.items():
        text = table_row(text, f'| {issue_id} |', row)
    write(path, text, nl)


def reconcile_project_status() -> None:
    path, text, nl = read('00_Project/PROJECT_STATUS.md')
    text = required_replace(text, 'Last Updated: 2026-09-01 (RBATCH-010 merged; RBATCH-011 MainMenu Flow draft PR)', 'Last Updated: 2026-09-01 (RBATCH-011 merged; RBATCH-012 CompanyManagement validated on PR #256)')
    text = required_replace(text, 'Prototype v0.1 — RBATCH-010 HUD + Notifications MERGED in PR #253 pending Railway/public verification; RBATCH-011 MainMenu Flow implemented on PR #255 pending independent review', 'Prototype v0.1 — RBATCH-010 HUD + Notifications and RBATCH-011 MainMenu Flow MERGED pending Railway/public verification; RBATCH-012 CompanyManagement + Upgrade Purchase Flow validated on PR #256 pending merge')
    text = required_replace(text, 'Keep the merged RBATCH-010 runtime stable while completing independent review of PR #254 (RBATCH-011 MainMenu Flow) without entering RBATCH-014 Save/Load scope early.', 'Complete final review and merge of PR #256 (RBATCH-012 CompanyManagement + Upgrade Purchase Flow), preserving the merged RBATCH-010/011 runtime and excluding RBATCH-013 speed effects and RBATCH-014 persistent Save/Load.')
    old_steps = """1. Correct and independently review PR #253 (RBATCH-010 HUD + Notifications) on branch `copilot/rbatch-010-hud-notifications`.
2. Preserve the public Railway-verified BATCH-008 and RBATCH-009 runtime evidence in documentation and reports.
3. Proceed to merge/deploy/public verification of PR #253 only after independent approval; no RBATCH-011+ behavior exists."""
    new_steps = """1. Complete final-head validation and merge PR #256 for RBATCH-012 CompanyManagement + Upgrade Purchase Flow.
2. After merge, verify the public Railway runtime without claiming visual/touch acceptance until observed.
3. Proceed to RBATCH-013 Bicycle Ownership + Speed Increase; keep persistent Save/Load blocked behind ODR-001 and ODR-003."""
    text = required_replace(text, old_steps, new_steps)
    text = required_replace(text, 'RBATCH-011 MAINMENU FLOW PR #255 OPEN — VALIDATION/REVIEW IN PROGRESS', 'RBATCH-011 MAINMENU FLOW MERGED IN PR #255 — PENDING RAILWAY/PUBLIC VERIFICATION; RBATCH-012 COMPANYMANAGEMENT + UPGRADE PURCHASE FLOW PR #256 VALIDATED — PENDING MERGE')
    text = required_replace(text, '- E-012 status: PR #255 — validation/review in progress', '- E-012 status: MERGED in PR #255 — pending Railway/public verification\n- E-013 status: PR #256 — validation complete; pending merge')
    text = required_replace(text, '- RBATCH-011 status: PR #255 — validation/review in progress', '- RBATCH-011 status: MERGED in PR #255 — pending Railway/public verification\n- RBATCH-012 status: PR #256 — validation complete; pending merge')
    text = required_replace(text, '- ISSUE-008 status: PR #255 implementation exists — validation/review in progress', '- ISSUE-008 status: completed and merged through PR #255; GitHub issue closed; Railway/public verification remains at RBATCH-011 level\n- ISSUE-010/ISSUE-011 status: PR #256 implementation validated — pending merge')
    text = text.replace('RBATCH-010 HUD + Notifications draft PR #253 exists — pending independent review', 'RBATCH-010 HUD + Notifications merged in PR #253 — Railway/public verification pending')
    text = text.replace('RBATCH-010 HUD + Notifications draft PR #253 exists — pending independent review; no RBATCH-011+ implementation exists', 'RBATCH-010 HUD + Notifications and RBATCH-011 MainMenu are merged; RBATCH-012 is validated on PR #256; Railway/public verification remains tracked separately')
    write(path, text, nl)


def reconcile_changelog() -> None:
    path, text, nl = read('09_Development/CHANGELOG.md')
    text = required_replace(text, 'Last Updated: 2026-09-01 (RBATCH-010 MERGE + RBATCH-011 MAINMENU FLOW)', 'Last Updated: 2026-09-01 (RBATCH-011 MERGE + RBATCH-012 COMPANY MANAGEMENT)')
    marker = '# [2026-09-01] - RBATCH-010 MERGE AND RBATCH-011 MAINMENU FLOW'
    entry = """# [2026-09-01] - RBATCH-011 MERGE AND RBATCH-012 COMPANY MANAGEMENT

## Added

- PR #255 / RBATCH-011 merged into `main` as `34a8383f85e9bf45fd7680dfc26ad48b5fa56e27`; Railway/public gameplay verification remains pending and is not claimed.
- RBATCH-012 branch `openai/rbatch-012-company-management-upgrades` and PR #256.
- Expanded canonical runtime `CompanyState` fields for company name, level, and purchased upgrade levels.
- Pure upgrade catalog/purchase domain logic and in-memory `gameSession` scene-transition state.
- CompanyManagement economy overview, Bicycle purchase path, purchase feedback, and safe return-to-world navigation.
- `company-management.test.ts` with 22 deterministic RBATCH-012 tests.

## Changed

- GameWorld and CompanyManagement navigation now use one input owner per action and preserve the same in-memory runtime state.
- Delivery settlement now preserves unrelated company progression fields.
- Bicycle cost is centralized at 100 money as a replaceable Prototype v0.1 balancing value so the current single-order runtime can reach the first purchase after one successful 100-money delivery.
- Legacy RBATCH-009 tests now validate money/reputation without incorrectly forbidding newly added canonical company fields.

## Verified

- PR #256 clean-head GitHub Actions run `33554869280`: **204/204 tests PASS**; TypeScript/Vite build, HTTP smoke, CRLF-aware diff check, archived `Game/` guard, planning YAML syntax/count and active crosswalk all PASS.
- Bicycle movement-speed effect is not implemented in RBATCH-012; it remains RBATCH-013.
- No localStorage, save serialization, autosave, or persistence across app restarts is introduced; persistent Save/Load remains RBATCH-014.

"""
    text = required_replace(text, marker, entry + marker)
    write(path, text, nl)


def yaml_block(lines: list[str], marker: str) -> tuple[int, int]:
    starts = [i for i, line in enumerate(lines) if line == marker]
    if len(starts) != 1:
        raise RuntimeError(f'{marker}: expected one block, found {len(starts)}')
    start = starts[0]
    end = len(lines)
    for i in range(start + 1, len(lines)):
        if lines[i].startswith('- id: ') or lines[i].startswith('- legacy_id: '):
            end = i
            break
    return start, end


def yaml_set_field(lines: list[str], marker: str, field: str, value: str) -> None:
    start, end = yaml_block(lines, marker)
    prefix = f'  {field}:'
    matches = [i for i in range(start + 1, end) if lines[i].startswith(prefix)]
    if len(matches) != 1:
        raise RuntimeError(f'{marker}: {field} count={len(matches)}')
    lines[matches[0]] = f'  {field}: {value}'


def yaml_replace_label(lines: list[str], marker: str, old: str, new: str) -> None:
    start, end = yaml_block(lines, marker)
    matches = [i for i in range(start + 1, end) if lines[i] == f'  - {old}']
    if len(matches) != 1:
        raise RuntimeError(f'{marker}: label {old} count={len(matches)}')
    lines[matches[0]] = f'  - {new}'


def reconcile_yaml() -> None:
    path, text, nl = read('09_Development/Planning/github_creation_plan.yaml')
    lines = text.split('\n')
    yaml_set_field(lines, '- id: M-006', 'status', 'In Progress')
    yaml_set_field(lines, '- id: E-012', 'status', "'MERGED in PR #255 — pending Railway/public verification'")
    yaml_set_field(lines, '- id: E-013', 'status', "'PR #256 — validation complete; pending merge'")
    yaml_set_field(lines, '- id: RBATCH-011', 'status', "'MERGED in PR #255 — pending Railway/public verification'")
    yaml_set_field(lines, '- id: RBATCH-012', 'status', "'PR #256 — validation complete; pending merge'")
    for issue_id in ('ISSUE-005', 'ISSUE-006', 'ISSUE-007'):
        marker = f'- id: {issue_id}'
        yaml_set_field(lines, marker, 'status', "'COMPLETED — merged PR #253; Railway/public verification pending at RBATCH-010 level'")
        yaml_replace_label(lines, marker, 'status:in-progress', 'status:done')
    yaml_set_field(lines, '- id: ISSUE-008', 'status', "'COMPLETED — merged PR #255; Railway/public verification pending at RBATCH-011 level'")
    yaml_replace_label(lines, '- id: ISSUE-008', 'status:in-progress', 'status:done')
    yaml_set_field(lines, '- id: ISSUE-010', 'status', "'PR #256 implementation validated — pending merge'")
    yaml_replace_label(lines, '- id: ISSUE-010', 'status:ready', 'status:in-progress')
    yaml_set_field(lines, '- id: ISSUE-011', 'status', "'PR #256 implementation validated — pending merge'")
    yaml_replace_label(lines, '- id: ISSUE-011', 'status:ready', 'status:in-progress')
    yaml_set_field(lines, '- legacy_id: BATCH-010b', 'historical_status', "'MERGED in PR #255 — pending Railway/public verification'")
    yaml_set_field(lines, '- legacy_id: BATCH-011', 'historical_status', "'PR #256 — validation complete; pending merge'")
    write(path, '\n'.join(lines), nl)


def main() -> None:
    reconcile_batch_architecture()
    reconcile_epics()
    reconcile_milestones()
    reconcile_issues()
    reconcile_project_status()
    reconcile_changelog()
    reconcile_yaml()
    print('RBATCH-012 planning reconciliation complete')


if __name__ == '__main__':
    main()
