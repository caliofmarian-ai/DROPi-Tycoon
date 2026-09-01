from __future__ import annotations

from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
PR_STATUS = 'PR #263 — validation complete; pending merge'
ISSUE_STATUS = 'PR #263 implementation validated — pending merge'
ISSUE_IDS = ('ISSUE-018', 'ISSUE-019')


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
        raise RuntimeError(f'Expected one row starting {prefix!r}, found {len(matches)}')
    idx = matches[0]
    cells = [cell.strip() for cell in lines[idx].strip().strip('|').split('|')]
    transform(cells)
    lines[idx] = '| ' + ' | '.join(cells) + ' |'
    return '\n'.join(lines) + ('\n' if text.endswith('\n') else '')


def yaml_block(text: str, item_id: str) -> tuple[int, int, str]:
    marker = f'- id: {item_id}\n'
    start = text.find(marker)
    if start < 0:
        raise RuntimeError(f'Missing YAML block {item_id}')
    next_item = text.find('\n- id: ', start + len(marker))
    end = len(text) if next_item < 0 else next_item + 1
    return start, end, text[start:end]


def yaml_set_field(text: str, item_id: str, field: str, value: str) -> str:
    start, end, block = yaml_block(text, item_id)
    pattern = rf'(^  {re.escape(field)}: ).+$'
    updated, count = re.subn(pattern, rf"\1'{value}'", block, count=1, flags=re.MULTILINE)
    if count != 1:
        raise RuntimeError(f'Cannot update {field} for {item_id}')
    return text[:start] + updated + text[end:]


def yaml_replace_label(text: str, item_id: str, old: str, new: str) -> str:
    start, end, block = yaml_block(text, item_id)
    if block.count(old) != 1:
        raise RuntimeError(f'Expected one {old!r} in {item_id}, found {block.count(old)}')
    return text[:start] + block.replace(old, new, 1) + text[end:]


# Milestone architecture: M-008 begins with RBATCH-015 but remains open for RBATCH-016/017.
path, text, nl = load('09_Development/Planning/MILESTONE_ARCHITECTURE.md')
text = update_table_line(text, '| M-008 |', lambda cells: cells.__setitem__(3, 'In Progress'))
save(path, text, nl)

# Batch architecture including legacy crosswalk status.
path, text, nl = load('09_Development/Planning/BATCH_ARCHITECTURE.md')
text = update_table_line(text, '| BATCH-014 | RBATCH-015 |', lambda cells: cells.__setitem__(2, PR_STATUS))
text = update_table_line(text, '| RBATCH-015 |', lambda cells: cells.__setitem__(5, PR_STATUS))
save(path, text, nl)

# Epic catalog.
path, text, nl = load('09_Development/Planning/EPIC_CATALOG.md')
text = update_table_line(text, '| E-016 |', lambda cells: cells.__setitem__(4, PR_STATUS))
save(path, text, nl)

# Issue catalog.
path, text, nl = load('09_Development/Planning/ISSUE_CATALOG.md')
for issue_id in ISSUE_IDS:
    def update_issue(cells: list[str]) -> None:
        cells[6] = ISSUE_STATUS
        cells[7] = cells[7].replace('status:ready', 'status:in-progress')
    text = update_table_line(text, f'| {issue_id} |', update_issue)
save(path, text, nl)

# Machine-readable planning package.
path, text, nl = load('09_Development/Planning/github_creation_plan.yaml')
text = yaml_set_field(text, 'M-008', 'status', 'In Progress')
text = yaml_set_field(text, 'E-016', 'status', PR_STATUS)
text = yaml_set_field(text, 'RBATCH-015', 'status', PR_STATUS)
for issue_id in ISSUE_IDS:
    text = yaml_set_field(text, issue_id, 'status', ISSUE_STATUS)
    text = yaml_replace_label(text, issue_id, 'status:ready', 'status:in-progress')
save(path, text, nl)

# Roadmap summary only: no new orientation canon or visual scope is added here.
path, text, nl = load('00_Project/ROADMAP.md')
text = update_table_line(text, '| M-008 |', lambda cells: cells.__setitem__(3, 'In Progress'))
save(path, text, nl)

# Current project checkpoint.
path, text, nl = load('00_Project/PROJECT_STATUS.md')
text = re.sub(
    r'Last Updated: .*',
    'Last Updated: 2026-09-01 (RBATCH-015 Mobile Optimization validated on PR #263; pending merge)',
    text,
    count=1,
)
text = re.sub(
    r'Prototype v0\.1 — .*?\n\n---',
    'Prototype v0.1 — RBATCH-010/011/012/013/014 MERGED pending Railway/public verification; RBATCH-015 Mobile Optimization validated on PR #263 pending merge\n\n---',
    text,
    count=1,
    flags=re.DOTALL,
)
text = re.sub(
    r'# Current Objective\n\n.*?\n\n---',
    '# Current Objective\n\nComplete final validation and merge of PR #263 (RBATCH-015 Mobile Optimization), then perform public/mobile verification before advancing its merged checkpoint. Preserve viewport/rendering independence so later high-fidelity visual evolution remains unconstrained.\n\n---',
    text,
    count=1,
    flags=re.DOTALL,
)
text = re.sub(
    r'# Next Steps\n\n.*?\n\n---',
    '# Next Steps\n\n1. Complete final-head CI and merge PR #263 for RBATCH-015 Mobile Optimization.\n2. Verify responsive viewport fit and comfortable touch interaction on the public Railway runtime using representative Android portrait and landscape sizes.\n3. Proceed to RBATCH-016 Full-Loop Integration Verification after the RBATCH-015 merge checkpoint is reconciled.\n\n---',
    text,
    count=1,
    flags=re.DOTALL,
)
checkpoint = '''\n- M-008 status: In Progress\n- E-016 status: PR #263 — validation complete; pending merge\n- RBATCH-015 status: PR #263 — validation complete; pending merge\n- ISSUE-018/ISSUE-019 status: PR #263 implementation validated — pending merge\n- RBATCH-015 validation run `33562041087`: 274/274 tests passed across 9 files, including 32/32 mobile viewport/touch tests; TypeScript/Vite build, HTTP smoke, whitespace, archived `Game/` guard, YAML syntax/counts and planning crosswalk passed\n- Mobile implementation supports representative portrait and landscape Android viewports without declaring either orientation permanent canon\n- Touch comfort is enforced in actual screen-space canvas pixels through an implementation-level threshold; the threshold is not canonical gameplay design\n'''
marker = '- ODR-002 reclassified (not an owner decision)'
if checkpoint.strip() not in text:
    text = one(text, marker, checkpoint + marker)
save(path, text, nl)

# Changelog entry.
path, text, nl = load('09_Development/CHANGELOG.md')
text = re.sub(
    r'Last Updated: .*',
    'Last Updated: 2026-09-01 (RBATCH-015 MOBILE OPTIMIZATION VALIDATION)',
    text,
    count=1,
)
section = '''# [2026-09-01] - RBATCH-015 MOBILE OPTIMIZATION VALIDATION\n\n## Added\n\n- Responsive viewport layout primitives for representative Android portrait and landscape sizes.\n- Screen-space touch-comfort enforcement for Main Menu, modal, Company Management, GameWorld navigation and HUD acceptance controls.\n- 32 deterministic mobile viewport/touch tests.\n\n## Changed\n\n- Active runtime scaling moved from fixed-canvas FIT to viewport-sized RESIZE so touch targets remain physical screen-space pixels.\n- Prototype-only portrait rotation blocker removed; orientation remains an implementation target matrix rather than permanent canon.\n- Main Menu, Company Management, GameWorld navigation, HUD and notifications now derive layout from the active viewport.\n- M-008 advanced to In Progress; E-016/RBATCH-015 and ISSUE-018/019 advanced to PR #263 validated state.\n\n## Verified\n\n- GitHub Actions run `33562041087`: 274/274 tests passed across 9 files.\n- New mobile viewport/touch suite: 32/32 passed.\n- TypeScript + Vite production build: PASS.\n- Production HTTP smoke: PASS.\n- PR-range whitespace validation: PASS.\n- Archived `Game/` guard: PASS.\n- Canonical planning YAML syntax/count validation: PASS.\n\n---\n\n'''
marker = '# [2026-09-01] - RBATCH-014 MERGE CHECKPOINT'
if section.strip() not in text:
    text = one(text, marker, section + marker)
save(path, text, nl)

print('RBATCH-015 canonical planning reconciliation prepared: PASS')
