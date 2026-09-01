from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read_preserving_newline(relative: str) -> tuple[Path, str, str]:
    path = ROOT / relative
    raw = path.read_bytes().decode('utf-8')
    newline = '\r\n' if '\r\n' in raw else '\n'
    return path, raw.replace('\r\n', '\n'), newline


def write_preserving_newline(path: Path, text: str, newline: str) -> None:
    path.write_bytes(text.replace('\n', newline).encode('utf-8'))


def replace_required(text: str, old: str, new: str, *, expected: int = 1) -> str:
    count = text.count(old)
    if count != expected:
        raise RuntimeError(f'Expected {expected} occurrence(s) of {old!r}, found {count}')
    return text.replace(old, new)


def replace_table_row(text: str, prefix: str, replacement: str) -> str:
    lines = text.split('\n')
    matches = [index for index, line in enumerate(lines) if line.startswith(prefix)]
    if len(matches) != 1:
        raise RuntimeError(f'Expected one table row starting {prefix!r}, found {len(matches)}')
    lines[matches[0]] = replacement
    return '\n'.join(lines)


def yaml_block(lines: list[str], marker: str) -> tuple[int, int]:
    starts = [i for i, line in enumerate(lines) if line == marker]
    if len(starts) != 1:
        raise RuntimeError(f'Expected one YAML block marker {marker!r}, found {len(starts)}')
    start = starts[0]
    end = len(lines)
    for i in range(start + 1, len(lines)):
        if lines[i].startswith('- id: ') or lines[i].startswith('- legacy_id: '):
            end = i
            break
        if lines[i] and not lines[i].startswith((' ', '-')) and lines[i].endswith(':'):
            end = i
            break
    return start, end


def yaml_set_field(lines: list[str], marker: str, field: str, value: str) -> None:
    start, end = yaml_block(lines, marker)
    prefix = f'  {field}:'
    matches = [i for i in range(start + 1, end) if lines[i].startswith(prefix)]
    if len(matches) != 1:
        raise RuntimeError(f'{marker}: expected one field {field!r}, found {len(matches)}')
    lines[matches[0]] = f'  {field}: {value}'


def yaml_set_or_insert_field(lines: list[str], marker: str, field: str, value: str, before_field: str) -> None:
    start, end = yaml_block(lines, marker)
    prefix = f'  {field}:'
    matches = [i for i in range(start + 1, end) if lines[i].startswith(prefix)]
    if len(matches) == 1:
        lines[matches[0]] = f'  {field}: {value}'
        return
    if matches:
        raise RuntimeError(f'{marker}: duplicate field {field!r}')
    before_prefix = f'  {before_field}:'
    before = [i for i in range(start + 1, end) if lines[i].startswith(before_prefix)]
    if len(before) != 1:
        raise RuntimeError(f'{marker}: cannot insert {field!r}; before-field {before_field!r} count={len(before)}')
    lines.insert(before[0], f'  {field}: {value}')


def yaml_replace_line_in_block(lines: list[str], marker: str, old: str, new: str) -> None:
    start, end = yaml_block(lines, marker)
    matches = [i for i in range(start + 1, end) if lines[i] == old]
    if len(matches) != 1:
        raise RuntimeError(f'{marker}: expected one line {old!r}, found {len(matches)}')
    lines[matches[0]] = new


def reconcile_batch_architecture() -> None:
    path, text, newline = read_preserving_newline('09_Development/Planning/BATCH_ARCHITECTURE.md')
    text = replace_required(text, 'Version: 1.2.0', 'Version: 1.3.0')
    text = replace_required(text, 'Last Updated: 2026-08-02', 'Last Updated: 2026-09-01')
    text = replace_table_row(
        text,
        '| BATCH-010 | RBATCH-010 |',
        '| BATCH-010 | RBATCH-010 | MERGED — pending Railway/public verification | M-005 / E-011 | 09_Development/Planning/BATCH_ARCHITECTURE.md | 09_Development/Implementation_Preparation/IMPLEMENTATION_BATCH_PLAN.md |',
    )
    text = replace_table_row(
        text,
        '| BATCH-010b | RBATCH-011 |',
        '| BATCH-010b | RBATCH-011 | Draft PR #254 — pending independent review | M-005 / E-012 | 09_Development/Planning/BATCH_ARCHITECTURE.md | 09_Development/Implementation_Preparation/IMPLEMENTATION_BATCH_PLAN.md |',
    )
    text = replace_table_row(
        text,
        '| RBATCH-010 | 1 | M-005 | E-011 | HUD + Notifications |',
        '| RBATCH-010 | 1 | M-005 | E-011 | HUD + Notifications | MERGED — pending Railway/public verification | RBATCH-007, RBATCH-009 | BATCH-010 | — |',
    )
    text = replace_table_row(
        text,
        '| RBATCH-011 | 1 | M-005 | E-012 | MainMenu Flow |',
        '| RBATCH-011 | 1 | M-005 | E-012 | MainMenu Flow | Draft PR #254 — pending independent review | RBATCH-002 | BATCH-010b | — |',
    )
    write_preserving_newline(path, text, newline)


def reconcile_issue_catalog() -> None:
    path, text, newline = read_preserving_newline('09_Development/Planning/ISSUE_CATALOG.md')
    text = replace_required(text, 'Version: 1.2.0', 'Version: 1.3.0')
    text = replace_required(text, 'Last Updated: 2026-08-02', 'Last Updated: 2026-09-01')
    text = replace_table_row(
        text,
        '| ISSUE-005 |',
        '| ISSUE-005 | Implement active-order HUD panel | RBATCH-010 | E-011 | M-005 | implementation | MERGED in PR #253 — pending Railway/public verification | type:implementation, phase:1, batch:rbatch-010, epic:hud-notifications, status:in-progress | — | Show destination/status/package state in HUD. | HUD appears only when order active. |',
    )
    text = replace_table_row(
        text,
        '| ISSUE-006 |',
        '| ISSUE-006 | Implement Accept Order button in HUD | RBATCH-010 | E-011 | M-005 | implementation | MERGED in PR #253 — pending Railway/public verification | type:implementation, phase:1, batch:rbatch-010, epic:hud-notifications, status:in-progress | — | Connect HUD button to the shared canonical acceptance path. | Available orders can be accepted once from HUD without world-input side effects. |',
    )
    text = replace_table_row(
        text,
        '| ISSUE-007 |',
        '| ISSUE-007 | Implement delivery status notifications | RBATCH-010 | E-011 | M-005 | implementation | MERGED in PR #253 — pending Railway/public verification | type:implementation, phase:1, batch:rbatch-010, epic:hud-notifications, status:in-progress | — | Show notifications for Accepted/PickedUp/Completed/Failed. | Notification appears once on each canonical state change. |',
    )
    text = replace_table_row(
        text,
        '| ISSUE-008 |',
        '| ISSUE-008 | Implement required MainMenu flow | RBATCH-011 | E-012 | M-005 | implementation | Draft PR #254 implementation exists — pending independent review | type:implementation, phase:1, batch:rbatch-011, epic:mainmenu-gameflow, status:in-progress | — | Implement Start Game, Settings and Information without save-dependent behavior. | MainMenu actions are mobile-friendly, deterministic and persistence-independent. |',
    )
    text = replace_table_row(
        text,
        '| ISSUE-009 |',
        '| ISSUE-009 | Implement new-game overwrite guard | RBATCH-014 | E-015 | M-007 | implementation | Blocked with RBATCH-014 | type:implementation, phase:1, batch:rbatch-014, epic:save-load, status:blocked | ODR-001, ODR-003 | Require confirmation before replacing an existing valid save as part of the canonical save/load path. | No valid save is silently overwritten. |',
    )
    write_preserving_newline(path, text, newline)


def reconcile_implementation_batch_plan() -> None:
    path, text, newline = read_preserving_newline('09_Development/Implementation_Preparation/IMPLEMENTATION_BATCH_PLAN.md')
    text = replace_required(
        text,
        '- Objective: Implement MainMenu Start/Continue/new-game guard flow.',
        '- Objective: Implement MainMenu Start Game, Settings and Information flow without save-dependent behavior.',
    )
    text = replace_required(
        text,
        '- Requirements: REQ-088, REQ-111, REQ-118, REQ-119, REQ-120.',
        '- Requirements: REQ-088 flow completion only. REQ-111 and REQ-118..REQ-120 remain owned by BATCH-013 per the canonical traceability matrix.',
    )
    text = replace_required(
        text,
        '- Artifacts: scene entry flow, overwrite confirmation guard.',
        '- Artifacts: scene entry flow, Settings/Information surfaces, mobile input isolation.',
    )
    text = replace_required(
        text,
        '- Non-goals: no save serializer implementation.',
        '- Non-goals: no Continue/load behavior, valid-save detection, overwrite confirmation, save serializer, or save validation implementation.',
    )
    text = replace_required(
        text,
        '- Validation: Continue and Start rules align with save policy.',
        '- Validation: Start/Settings/Information flow is deterministic, mobile-friendly, and does not implement BATCH-013 persistence semantics.',
    )
    write_preserving_newline(path, text, newline)


def reconcile_project_status() -> None:
    path, text, newline = read_preserving_newline('00_Project/PROJECT_STATUS.md')
    text = replace_required(
        text,
        'Last Updated: 2026-08-02 (RBATCH-010 HUD + NOTIFICATIONS — CORRECTION PASS 4)',
        'Last Updated: 2026-09-01 (RBATCH-010 merged; RBATCH-011 MainMenu Flow draft PR)',
    )
    text = replace_required(
        text,
        'Prototype v0.1 — RBATCH-009 Economy and Reputation Outcomes COMPLETED (merged PR #86, Railway-verified 2026-08-02); RBATCH-010 HUD + Notifications Implemented on Draft PR Pending Independent Review',
        'Prototype v0.1 — RBATCH-010 HUD + Notifications MERGED in PR #253 pending Railway/public verification; RBATCH-011 MainMenu Flow implemented on Draft PR #254 pending independent review',
    )
    text = replace_required(
        text,
        'Keep the verified public web runtime stable, preserve all merged batch evidence, and complete the correction and independent review of PR #253 (RBATCH-010 HUD + Notifications — existing draft implementation) before merging.',
        'Keep the merged RBATCH-010 runtime stable while completing independent review of PR #254 (RBATCH-011 MainMenu Flow) without entering RBATCH-014 Save/Load scope early.',
    )
    text = replace_required(
        text,
        'RBATCH-010 HUD + NOTIFICATIONS DRAFT PR #253 OPEN — PENDING INDEPENDENT REVIEW',
        'RBATCH-010 HUD + NOTIFICATIONS MERGED IN PR #253 — PENDING RAILWAY/PUBLIC VERIFICATION; RBATCH-011 MAINMENU FLOW DRAFT PR #254 OPEN — PENDING INDEPENDENT REVIEW',
    )
    text = replace_required(
        text,
        '- E-011 status: Draft PR implementation exists — pending independent review',
        '- E-011 status: MERGED in PR #253 — pending Railway/public verification\n- E-012 status: Draft PR #254 — pending independent review',
    )
    text = replace_required(
        text,
        '- RBATCH-010 status: Draft PR — Pending Independent Review',
        '- RBATCH-010 status: MERGED — pending Railway/public verification\n- RBATCH-011 status: Draft PR #254 — pending independent review',
    )
    text = replace_required(
        text,
        '- ISSUE-005/ISSUE-006/ISSUE-007 status: Draft PR implementation exists — pending independent review',
        '- ISSUE-005/ISSUE-006/ISSUE-007 status: merged through PR #253; GitHub issues closed; Railway/public verification still pending at RBATCH-010 level\n- ISSUE-008 status: Draft PR #254 implementation exists — pending independent review\n- ISSUE-009 moved to RBATCH-014 / E-015 / M-007 and remains blocked with Save/Load',
    )
    write_preserving_newline(path, text, newline)


def reconcile_changelog() -> None:
    path, text, newline = read_preserving_newline('09_Development/CHANGELOG.md')
    text = replace_required(
        text,
        'Last Updated: 2026-08-02 (RBATCH-010 HUD + NOTIFICATIONS IMPLEMENTATION)',
        'Last Updated: 2026-09-01 (RBATCH-010 MERGE + RBATCH-011 MAINMENU FLOW)',
    )
    marker = '# [2026-08-02] - RBATCH-009 ECONOMY AND REPUTATION OUTCOMES IMPLEMENTATION'
    entry = '''# [2026-09-01] - RBATCH-010 MERGE AND RBATCH-011 MAINMENU FLOW\n\n## Added\n\n- PR #253 / RBATCH-010 merged into `main` as `2ee6b60000aa0729c1795c51ce4764043ad59fac` after final-head GitHub Actions validation succeeded. Railway/public gameplay verification remains pending and is not claimed.\n- RBATCH-011 implementation branch `openai/rbatch-011-mainmenu-flow` and Draft PR #254.\n- `game-web/src/ui/MainMenuViewModel.ts` pure MainMenu modal-state model and player-facing Settings/Information content.\n- `game-web/tests/mainmenu.test.ts` deterministic MainMenu and RBATCH-014 exclusion coverage.\n\n## Changed\n\n- `MainMenuScene.ts` now exposes the canonical first-launch actions Start Game, Settings and Information with mobile-friendly modal interaction and single input ownership.\n- Planning scope corrected so save-dependent Continue/load and overwrite requirements remain in RBATCH-014; ISSUE-009 moved intact to the Save & Load batch.\n\n## Verified\n\n- PR #254 CI after strict-TypeScript correction: 182/182 automated tests passed; TypeScript/Vite build, production HTTP smoke, CRLF-aware diff check and archived `Game/` guard passed in GitHub Actions run `33551889000`.\n- No localStorage, Continue loading, overwrite confirmation, save serialization or save validation was implemented by RBATCH-011.\n\n'''
    text = replace_required(text, marker, entry + marker)
    write_preserving_newline(path, text, newline)


def reconcile_yaml() -> None:
    path, text, newline = read_preserving_newline('09_Development/Planning/github_creation_plan.yaml')
    lines = text.split('\n')

    yaml_set_field(lines, '- id: E-011', 'status', 'MERGED — pending Railway/public verification')
    yaml_set_field(lines, '- id: E-012', 'status', "'Draft PR #254 — pending independent review'")

    yaml_set_field(lines, '- id: RBATCH-010', 'status', 'MERGED — pending Railway/public verification')
    yaml_set_field(lines, '- id: RBATCH-011', 'status', "'Draft PR #254 — pending independent review'")

    for issue_id in ('ISSUE-005', 'ISSUE-006', 'ISSUE-007'):
        marker = f'- id: {issue_id}'
        yaml_set_field(lines, marker, 'status', 'MERGED in PR #253 — pending Railway/public verification')
        yaml_replace_line_in_block(lines, marker, '  - status:in-progress', '  - status:in-progress')

    yaml_set_field(lines, '- id: ISSUE-008', 'title', 'Implement required MainMenu flow')
    yaml_set_field(lines, '- id: ISSUE-008', 'status', "'Draft PR #254 implementation exists — pending independent review'")
    yaml_set_field(lines, '- id: ISSUE-008', 'description', 'Implement Start Game, Settings and Information without save-dependent behavior.')
    yaml_set_field(lines, '- id: ISSUE-008', 'acceptance_criteria', 'MainMenu actions are mobile-friendly, deterministic and persistence-independent.')
    yaml_replace_line_in_block(lines, '- id: ISSUE-008', '  - status:ready', '  - status:in-progress')

    yaml_set_field(lines, '- id: ISSUE-009', 'batch_id', 'RBATCH-014')
    yaml_set_field(lines, '- id: ISSUE-009', 'epic_id', 'E-015')
    yaml_set_field(lines, '- id: ISSUE-009', 'milestone_id', 'M-007')
    yaml_set_field(lines, '- id: ISSUE-009', 'status', 'Blocked with RBATCH-014')
    yaml_set_field(lines, '- id: ISSUE-009', 'description', 'Require confirmation before replacing an existing valid save as part of the canonical save/load path.')
    yaml_set_field(lines, '- id: ISSUE-009', 'acceptance_criteria', 'No valid save is silently overwritten.')
    yaml_set_or_insert_field(lines, '- id: ISSUE-009', 'blocked_or_owner_gate', 'ODR-001, ODR-003', 'description')
    yaml_replace_line_in_block(lines, '- id: ISSUE-009', '  - batch:rbatch-011', '  - batch:rbatch-014')
    yaml_replace_line_in_block(lines, '- id: ISSUE-009', '  - epic:mainmenu-gameflow', '  - epic:save-load')
    yaml_replace_line_in_block(lines, '- id: ISSUE-009', '  - status:ready', '  - status:blocked')

    yaml_set_field(lines, '- legacy_id: BATCH-010', 'historical_status', 'MERGED — pending Railway/public verification')
    yaml_set_field(lines, '- legacy_id: BATCH-010b', 'historical_status', "'Draft PR #254 — pending independent review'")

    text = '\n'.join(lines)
    text = replace_required(text, '  plan_version: 1.2.0', '  plan_version: 1.3.0')
    write_preserving_newline(path, text, newline)


def main() -> None:
    reconcile_batch_architecture()
    reconcile_issue_catalog()
    reconcile_implementation_batch_plan()
    reconcile_project_status()
    reconcile_changelog()
    reconcile_yaml()
    print('RBATCH-011 planning reconciliation applied successfully.')


if __name__ == '__main__':
    main()
