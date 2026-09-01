from __future__ import annotations

from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]


def read(path: str) -> tuple[Path, str, str]:
    target = ROOT / path
    raw = target.read_bytes().decode('utf-8')
    newline = '\r\n' if '\r\n' in raw else '\n'
    return target, raw.replace('\r\n', '\n'), newline


def write(target: Path, text: str, newline: str) -> None:
    target.write_bytes(text.replace('\n', newline).encode('utf-8'))


def required_replace(text: str, old: str, new: str, expected: int = 1) -> str:
    count = text.count(old)
    if count != expected:
        raise RuntimeError(f'Expected {expected} occurrence(s) of {old!r}, found {count}')
    return text.replace(old, new)


def set_yaml_status(text: str, item_id: str, value: str) -> str:
    pattern = rf"(^- id: {re.escape(item_id)}\n(?:(?!^- id: ).*\n)*?^  status: ).+$"
    replacement = rf"\1'{value}'"
    updated, count = re.subn(pattern, replacement, text, count=1, flags=re.MULTILINE)
    if count != 1:
        raise RuntimeError(f'Could not update YAML status for {item_id}')
    return updated


def set_yaml_issue_label_status(text: str, issue_id: str, old: str, new: str) -> str:
    pattern = rf"(^- id: {re.escape(issue_id)}\n(?:(?!^- id: ).*\n)*?^  label_names:\n(?:(?!^- id: ).*\n)*?)"
    match = re.search(pattern, text, flags=re.MULTILINE)
    if not match:
        raise RuntimeError(f'Could not locate YAML issue block for {issue_id}')
    block = match.group(1)
    if block.count(old) != 1:
        raise RuntimeError(f'Expected one {old} label in {issue_id}, found {block.count(old)}')
    updated_block = block.replace(old, new)
    return text[: match.start(1)] + updated_block + text[match.end(1) :]


# Batch architecture.
path, text, nl = read('09_Development/Planning/BATCH_ARCHITECTURE.md')
text = required_replace(
    text,
    '| BATCH-011 | RBATCH-012 | PR #256 — validation complete; pending merge | M-006 / E-013 |',
    '| BATCH-011 | RBATCH-012 | MERGED in PR #256 — pending Railway/public verification | M-006 / E-013 |',
)
text = required_replace(
    text,
    '| BATCH-012 | RBATCH-013 | NEVER STARTED | M-006 / E-014 |',
    '| BATCH-012 | RBATCH-013 | PR #257 — validation complete; pending merge | M-006 / E-014 |',
)
text = required_replace(
    text,
    '| RBATCH-012 | 1 | M-006 | E-013 | CompanyManagement + Upgrade Purchase Flow | PR #256 — validation complete; pending merge |',
    '| RBATCH-012 | 1 | M-006 | E-013 | CompanyManagement + Upgrade Purchase Flow | MERGED in PR #256 — pending Railway/public verification |',
)
text = required_replace(
    text,
    '| RBATCH-013 | 1 | M-006 | E-014 | Bicycle Ownership + Speed Increase | Planned — Not Started |',
    '| RBATCH-013 | 1 | M-006 | E-014 | Bicycle Ownership + Speed Increase | PR #257 — validation complete; pending merge |',
)
write(path, text, nl)

# Epic catalog.
path, text, nl = read('09_Development/Planning/EPIC_CATALOG.md')
text = required_replace(
    text,
    '| E-013 | 1 | M-006 | Company Management Scene | PR #256 — validation complete; pending merge |',
    '| E-013 | 1 | M-006 | Company Management Scene | MERGED in PR #256 — pending Railway/public verification |',
)
text = required_replace(
    text,
    '| E-014 | 1 | M-006 | Bicycle Ownership System | Planned — Not Started |',
    '| E-014 | 1 | M-006 | Bicycle Ownership System | PR #257 — validation complete; pending merge |',
)
write(path, text, nl)

# Issue catalog.
path, text, nl = read('09_Development/Planning/ISSUE_CATALOG.md')
for issue_id, title in (
    ('ISSUE-010', 'Implement upgrade purchase flow'),
    ('ISSUE-011', 'Implement CompanyManagement scene navigation'),
):
    text = required_replace(
        text,
        f'| {issue_id} | {title} | RBATCH-012 | E-013 | M-006 | implementation | PR #256 implementation validated — pending merge | type:implementation, phase:1, batch:rbatch-012, epic:company-management, status:in-progress |',
        f'| {issue_id} | {title} | RBATCH-012 | E-013 | M-006 | implementation | COMPLETED — merged PR #256; Railway/public verification pending at RBATCH-012 level | type:implementation, phase:1, batch:rbatch-012, epic:company-management, status:done |',
    )
text = required_replace(
    text,
    '| ISSUE-012 | Implement bicycle ownership through purchased-upgrade persistence | RBATCH-013 | E-014 | M-006 | implementation | Ready for implementation | type:implementation, phase:1, batch:rbatch-013, epic:bicycle-ownership, status:ready |',
    '| ISSUE-012 | Implement bicycle ownership through purchased-upgrade persistence | RBATCH-013 | E-014 | M-006 | implementation | PR #257 implementation validated — pending merge | type:implementation, phase:1, batch:rbatch-013, epic:bicycle-ownership, status:in-progress |',
)
text = required_replace(
    text,
    '| ISSUE-013 | Implement bicycle movement-speed increase after purchase | RBATCH-013 | E-014 | M-006 | implementation | Ready for implementation | type:implementation, phase:1, batch:rbatch-013, epic:bicycle-ownership, status:ready |',
    '| ISSUE-013 | Implement bicycle movement-speed increase after purchase | RBATCH-013 | E-014 | M-006 | implementation | PR #257 implementation validated — pending merge | type:implementation, phase:1, batch:rbatch-013, epic:bicycle-ownership, status:in-progress |',
)
write(path, text, nl)

# Machine-readable plan: update by exact item ID without reformatting the file.
path, text, nl = read('09_Development/Planning/github_creation_plan.yaml')
text = set_yaml_status(text, 'RBATCH-012', 'MERGED in PR #256 — pending Railway/public verification')
text = set_yaml_status(text, 'RBATCH-013', 'PR #257 — validation complete; pending merge')
text = set_yaml_status(text, 'E-013', 'MERGED in PR #256 — pending Railway/public verification')
text = set_yaml_status(text, 'E-014', 'PR #257 — validation complete; pending merge')
text = set_yaml_status(text, 'ISSUE-010', 'COMPLETED — merged PR #256; Railway/public verification pending at RBATCH-012 level')
text = set_yaml_status(text, 'ISSUE-011', 'COMPLETED — merged PR #256; Railway/public verification pending at RBATCH-012 level')
text = set_yaml_status(text, 'ISSUE-012', 'PR #257 implementation validated — pending merge')
text = set_yaml_status(text, 'ISSUE-013', 'PR #257 implementation validated — pending merge')
text = set_yaml_issue_label_status(text, 'ISSUE-010', 'status:in-progress', 'status:done')
text = set_yaml_issue_label_status(text, 'ISSUE-011', 'status:in-progress', 'status:done')
text = set_yaml_issue_label_status(text, 'ISSUE-012', 'status:ready', 'status:in-progress')
text = set_yaml_issue_label_status(text, 'ISSUE-013', 'status:ready', 'status:in-progress')
write(path, text, nl)

# Project status: reconcile current objective and high-level state only.
path, text, nl = read('00_Project/PROJECT_STATUS.md')
text = required_replace(
    text,
    'Last Updated: 2026-09-01 (RBATCH-011 merged; RBATCH-012 CompanyManagement validated on PR #256)',
    'Last Updated: 2026-09-01 (RBATCH-012 merged; RBATCH-013 Bicycle ownership/speed validated on PR #257)',
)
text = required_replace(
    text,
    'Prototype v0.1 — RBATCH-010 HUD + Notifications and RBATCH-011 MainMenu Flow MERGED pending Railway/public verification; RBATCH-012 CompanyManagement + Upgrade Purchase Flow validated on PR #256 pending merge',
    'Prototype v0.1 — RBATCH-010/011/012 MERGED pending Railway/public verification; RBATCH-013 Bicycle Ownership + Speed Increase validated on PR #257 pending merge',
)
text = required_replace(
    text,
    'Complete final review and merge of PR #256 (RBATCH-012 CompanyManagement + Upgrade Purchase Flow), preserving the merged RBATCH-010/011 runtime and excluding RBATCH-013 speed effects and RBATCH-014 persistent Save/Load.',
    'Complete final review and merge of PR #257 (RBATCH-013 Bicycle Ownership + Speed Increase), preserving the merged RBATCH-010/011/012 runtime and excluding RBATCH-014 persistent Save/Load.',
)
# Safe best-effort replacements for repeated status summaries lower in the document.
text = text.replace('RBATCH-012 status: PR #256 — validation complete; pending merge', 'RBATCH-012 status: MERGED in PR #256 — pending Railway/public verification')
text = text.replace('E-013 status: PR #256 — validation complete; pending merge', 'E-013 status: MERGED in PR #256 — pending Railway/public verification')
text = text.replace('ISSUE-010/ISSUE-011 status: PR #256 implementation validated — pending merge', 'ISSUE-010/ISSUE-011 status: COMPLETED — merged PR #256; Railway/public verification pending at RBATCH-012 level')
write(path, text, nl)

# Changelog: add a new active-state section before the prior 2026-09-01 entry.
path, text, nl = read('09_Development/CHANGELOG.md')
marker = '# [2026-09-01] - RBATCH-010 MERGE AND RBATCH-011 MAINMENU FLOW'
section = '''# [2026-09-01] - RBATCH-012 MERGE AND RBATCH-013 BICYCLE SPEED\n\n## Added\n\n- PR #256 / RBATCH-012 merged into `main` as `1b61399a4f169397d3a1525f50948a76ca84b1e5`; main post-merge CI run `33555819803` succeeded. Railway/public gameplay verification remains pending and is not claimed.\n- RBATCH-013 branch `openai/rbatch-013-bicycle-speed` and PR #257.\n- `game-web/src/systems/bicycleSystem.ts` pure Bicycle ownership and movement-speed resolution through purchased-upgrade state.\n- `game-web/tests/bicycle.test.ts` deterministic ownership, speed and scope-boundary coverage.\n\n## Changed\n\n- Walking baseline is centralized at 150 px/s and Bicycle movement speed at 225 px/s as replaceable implementation balancing values.\n- GameWorld synchronizes `player.movementSpeed` from `purchasedUpgradeLevels.Bicycle` when the active runtime session is entered/resumed.\n- Bicycle ownership remains exclusively in purchased-upgrade state; no parallel ownership field was introduced.\n\n## Verified\n\n- PR #257 initial code validation run `33556490775`: 221/221 automated tests passed across 7 test files, including 17/17 RBATCH-013 tests.\n- TypeScript/Vite build, production HTTP smoke, PR-range whitespace check, archived `Game/` guard, planning YAML validation and active crosswalk passed.\n- Save/Load, localStorage and advanced vehicle mechanics remain excluded from RBATCH-013.\n\n'''
if marker not in text:
    raise RuntimeError('Could not locate changelog insertion marker')
text = text.replace(marker, section + marker, 1)
write(path, text, nl)

# Permanent CI crosswalk: advance assertions through RBATCH-013.
path, text, nl = read('.github/workflows/rbatch-010-ci.yml')
text = required_replace(
    text,
    "          assert batches['RBATCH-012']['status'].startswith('PR #256')\n",
    "          assert 'MERGED' in batches['RBATCH-012']['status']\n          assert batches['RBATCH-013']['status'].startswith('PR #257')\n",
)
text = required_replace(
    text,
    "          assert epics['E-013']['status'].startswith('PR #256')\n",
    "          assert 'MERGED' in epics['E-013']['status']\n          assert epics['E-014']['status'].startswith('PR #257')\n",
)
text = required_replace(
    text,
    "              assert issues[issue_id]['status'].startswith('PR #256')\n              assert 'status:in-progress' in issues[issue_id]['label_names']\n",
    "              assert issues[issue_id]['status'].startswith('COMPLETED')\n              assert 'status:done' in issues[issue_id]['label_names']\n",
)
text = required_replace(
    text,
    "          assert issues['ISSUE-012']['batch_id'] == 'RBATCH-013'\n          assert issues['ISSUE-013']['batch_id'] == 'RBATCH-013'\n",
    "          for issue_id in ('ISSUE-012', 'ISSUE-013'):\n              assert issues[issue_id]['batch_id'] == 'RBATCH-013'\n              assert issues[issue_id]['epic_id'] == 'E-014'\n              assert issues[issue_id]['milestone_id'] == 'M-006'\n              assert issues[issue_id]['status'].startswith('PR #257')\n              assert 'status:in-progress' in issues[issue_id]['label_names']\n",
)
write(path, text, nl)

print('RBATCH-013 planning reconciliation prepared successfully.')
