from __future__ import annotations

from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
ISSUES = ('ISSUE-009', 'ISSUE-014', 'ISSUE-015', 'ISSUE-016', 'ISSUE-017')
PR_STATUS = 'PR #259 — validation complete; pending merge'
ISSUE_STATUS = 'PR #259 implementation validated — pending merge'


def load(path_str: str) -> tuple[Path, str, str]:
    path = ROOT / path_str
    raw = path.read_bytes().decode('utf-8')
    newline = '\r\n' if '\r\n' in raw else '\n'
    return path, raw.replace('\r\n', '\n'), newline


def save(path: Path, text: str, newline: str) -> None:
    path.write_bytes(text.replace('\n', newline).encode('utf-8'))


def one(text: str, old: str, new: str) -> str:
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f'Expected exactly one occurrence of {old!r}, found {count}')
    return text.replace(old, new, 1)


def update_table_line(text: str, prefix: str, transform) -> str:
    lines = text.splitlines()
    matches = [i for i, line in enumerate(lines) if line.startswith(prefix)]
    if len(matches) != 1:
        raise RuntimeError(f'Expected one table row starting {prefix!r}, found {len(matches)}')
    idx = matches[0]
    lines[idx] = transform(lines[idx])
    return '\n'.join(lines) + ('\n' if text.endswith('\n') else '')


def table_cells(line: str) -> list[str]:
    return [cell.strip() for cell in line.strip().strip('|').split('|')]


def render_cells(cells: list[str]) -> str:
    return '| ' + ' | '.join(cells) + ' |'


def yaml_block(text: str, item_id: str) -> tuple[int, int, str]:
    marker = f'- id: {item_id}\n'
    start = text.find(marker)
    if start < 0:
        raise RuntimeError(f'Could not locate YAML block for {item_id}')
    next_item = text.find('\n- id: ', start + len(marker))
    end = len(text) if next_item < 0 else next_item + 1
    return start, end, text[start:end]


def yaml_set_field(text: str, item_id: str, field: str, value: str) -> str:
    start, end, block = yaml_block(text, item_id)
    pattern = rf'(^  {re.escape(field)}: ).+$'
    replacement = rf"\1'{value}'"
    updated, count = re.subn(pattern, replacement, block, count=1, flags=re.MULTILINE)
    if count != 1:
        raise RuntimeError(f'Could not update {field} for {item_id}')
    return text[:start] + updated + text[end:]


def yaml_replace_label(text: str, item_id: str, old: str, new: str) -> str:
    start, end, block = yaml_block(text, item_id)
    if block.count(old) != 1:
        raise RuntimeError(f'Expected one {old!r} label in {item_id}, found {block.count(old)}')
    return text[:start] + block.replace(old, new, 1) + text[end:]


# MILESTONE_ARCHITECTURE.md
path, text, nl = load('09_Development/Planning/MILESTONE_ARCHITECTURE.md')
def milestone_transform(line: str) -> str:
    cells = table_cells(line)
    cells[3] = 'In Progress'
    cells[7] = 'Resolved 2026-09-01 — ODR-001=A; ODR-003=B'
    return render_cells(cells)
text = update_table_line(text, '| M-007 |', milestone_transform)
save(path, text, nl)

# BATCH_ARCHITECTURE.md
path, text, nl = load('09_Development/Planning/BATCH_ARCHITECTURE.md')
def legacy_transform(line: str) -> str:
    cells = table_cells(line)
    cells[2] = PR_STATUS
    return render_cells(cells)
text = update_table_line(text, '| BATCH-013 | RBATCH-014 |', legacy_transform)
def batch_transform(line: str) -> str:
    cells = table_cells(line)
    cells[5] = PR_STATUS
    cells[8] = 'Resolved 2026-09-01 — ODR-001=A; ODR-003=B'
    return render_cells(cells)
text = update_table_line(text, '| RBATCH-014 |', batch_transform)
save(path, text, nl)

# EPIC_CATALOG.md
path, text, nl = load('09_Development/Planning/EPIC_CATALOG.md')
def epic_transform(line: str) -> str:
    cells = table_cells(line)
    cells[4] = PR_STATUS
    return render_cells(cells)
text = update_table_line(text, '| E-015 |', epic_transform)
save(path, text, nl)

# ISSUE_CATALOG.md
path, text, nl = load('09_Development/Planning/ISSUE_CATALOG.md')
for issue_id in ISSUES:
    def issue_transform(line: str) -> str:
        cells = table_cells(line)
        cells[6] = ISSUE_STATUS
        cells[7] = cells[7].replace('status:blocked', 'status:in-progress')
        cells[8] = 'Resolved 2026-09-01 — ODR-001=A; ODR-003=B'
        return render_cells(cells)
    text = update_table_line(text, f'| {issue_id} |', issue_transform)
save(path, text, nl)

# github_creation_plan.yaml
path, text, nl = load('09_Development/Planning/github_creation_plan.yaml')
text = yaml_set_field(text, 'M-007', 'status', 'In Progress')
text = yaml_set_field(text, 'M-007', 'owner_gates', 'RESOLVED 2026-09-01 — ODR-001=A; ODR-003=B')
text = yaml_set_field(text, 'E-015', 'status', PR_STATUS)
text = yaml_set_field(text, 'RBATCH-014', 'status', PR_STATUS)
text = yaml_set_field(text, 'RBATCH-014', 'owner_gates', 'RESOLVED 2026-09-01 — ODR-001=A; ODR-003=B')
for issue_id in ISSUES:
    text = yaml_set_field(text, issue_id, 'status', ISSUE_STATUS)
    text = yaml_replace_label(text, issue_id, 'status:blocked', 'status:in-progress')
    text = yaml_set_field(
        text,
        issue_id,
        'blocked_or_owner_gate',
        'RESOLVED 2026-09-01 — ODR-001=A; ODR-003=B',
    )
save(path, text, nl)

# Canonical SAVE_SYSTEM technology boundary: keep semantics, remove archived-engine coupling.
path, text, nl = load('06_Technical/SAVE_SYSTEM.md')
text = one(
    text,
    '- GDevelop local storage APIs are used for persistence.',
    '- The active web runtime uses browser-local storage through a replaceable adapter; future packaged mobile runtimes must provide equivalent device-local storage behind the same canonical save contract.',
)
text = one(text, '# GDevelop Implementation Boundary', '# Platform-Local Implementation Boundary')
text = one(
    text,
    "The Save System is implemented using GDevelop's built-in local storage or variable persistence mechanisms.",
    'The Save System is implemented through a replaceable platform-local storage adapter. The active web runtime uses browser-local storage; future Android packaging may substitute an equivalent device-local adapter without changing the save schema or domain logic.',
)
save(path, text, nl)

# PROJECT_STATUS.md — replace stale top-level state and append a current implementation checkpoint.
path, text, nl = load('00_Project/PROJECT_STATUS.md')
text = re.sub(
    r'Last Updated: .*',
    'Last Updated: 2026-09-01 (RBATCH-014 Save/Load validated on PR #259; owner gates resolved)',
    text,
    count=1,
)
text = re.sub(
    r'Prototype v0\.1 — .*?\n\n---',
    'Prototype v0.1 — RBATCH-010/011/012/013 MERGED pending Railway/public verification; RBATCH-014 Save/Load validated on PR #259 pending merge\n\n---',
    text,
    count=1,
    flags=re.DOTALL,
)
text = re.sub(
    r'# Current Objective\n\n.*?\n\n---',
    '# Current Objective\n\nComplete final review and merge of PR #259 (RBATCH-014 Save/Load), preserving engine-independent persistence and the resolved ODR-001=A / ODR-003=B scope.\n\n---',
    text,
    count=1,
    flags=re.DOTALL,
)
text = text.replace(
    '- ISSUE-009 moved to RBATCH-014 / E-015 / M-007 and remains blocked with Save/Load',
    '- ISSUE-009 is implemented on PR #259 with an explicit in-game overwrite confirmation guard',
)
text = text.replace(
    '- Active owner decisions: ODR-001 (player position persistence), ODR-003 (GameSettings persistence scope)',
    '- Owner decisions resolved 2026-09-01: ODR-001=A (do not persist player position); ODR-003=B (persist only TutorialStatus from GameSettings)',
)
checkpoint = '''\n- M-007 status: In Progress\n- E-015 status: PR #259 — validation complete; pending merge\n- RBATCH-014 status: PR #259 — validation complete; pending merge\n- ISSUE-009/ISSUE-014/ISSUE-015/ISSUE-016/ISSUE-017 status: PR #259 implementation validated — pending merge\n- RBATCH-014 validation run `33559283892`: 242/242 tests passed across 8 files; TypeScript/Vite build, HTTP smoke, whitespace, archived `Game/` guard, YAML syntax/counts and pre-reconciliation planning crosswalk passed\n- Save/Load v1 persists company progression and TutorialStatus only; player position, active order, WorldData and other GameSettings are excluded by the resolved owner decisions\n- Current prototype visuals are explicitly temporary; persistence and gameplay state remain decoupled from rendering/assets so later high-fidelity visual evolution does not require Save/Load rewrites\n'''
marker = '- ODR-002 reclassified (not an owner decision)'
if checkpoint.strip() not in text:
    text = one(text, marker, checkpoint + marker)
save(path, text, nl)

# CHANGELOG.md — add RBATCH-014 validation entry once.
path, text, nl = load('09_Development/CHANGELOG.md')
text = re.sub(
    r'Last Updated: .*',
    'Last Updated: 2026-09-01 (RBATCH-014 SAVE/LOAD VALIDATION)',
    text,
    count=1,
)
section = '''# [2026-09-01] - RBATCH-014 SAVE/LOAD VALIDATION\n\n## Owner Decisions\n\n- ODR-001 resolved as A: Prototype v0.1 does not persist player position.\n- ODR-003 resolved as B: Prototype v0.1 persists only TutorialStatus from GameSettings.\n- The owner clarified that current prototype visuals are temporary and are not the final quality target; core persistence remains decoupled from rendering/assets for later high-fidelity evolution.\n\n## Added\n\n- Versioned one-slot local save contract with staging-first write recovery.\n- Pure Save/Load serializer, decoder, schema validation and session restoration independent from Phaser.\n- Save-aware MainMenu Continue / Start New Game behavior with in-game overwrite confirmation.\n- Best-effort unreadable-save backup before confirmed replacement.\n- Canonical autosave enforcement for delivery completion, upgrade purchase, progression change and tutorial-step completion.\n- 20 deterministic Save/Load tests plus save-aware MainMenu coverage.\n\n## Changed\n\n- Canonical `SAVE_SYSTEM.md` platform boundary updated from archived GDevelop-specific wording to a replaceable platform-local storage adapter while preserving the same save semantics.\n- M-007 / E-015 / RBATCH-014 and ISSUE-009/014/015/016/017 advanced from owner-blocked to PR #259 validated state.\n\n## Verified\n\n- GitHub Actions run `33559283892`: 242/242 tests passed across 8 files.\n- TypeScript + Vite production build: PASS.\n- Production HTTP smoke: PASS.\n- PR-range whitespace validation: PASS.\n- Archived `Game/` guard: PASS.\n- Canonical planning YAML syntax/count validation: PASS.\n\n---\n\n'''
marker = '# [2026-09-01] - RBATCH-011 MERGE AND RBATCH-012 COMPANY MANAGEMENT'
if section.strip() not in text:
    text = one(text, marker, section + marker)
save(path, text, nl)

print('RBATCH-014 canonical planning reconciliation prepared: PASS')
