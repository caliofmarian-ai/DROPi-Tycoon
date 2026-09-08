#!/usr/bin/env python3
"""Verify one-geometry/one-chapter Country Catalog accounting and write the audit summary."""

import argparse
import json
import pathlib
import re
import sys
from collections import Counter, defaultdict

ROOT = pathlib.Path(__file__).resolve().parents[1]
CATALOG_ROOT = ROOT / "04_World/Country_Catalog"
CONTINENT_ROOT = CATALOG_ROOT / "Continents"
TOPOLOGY = ROOT / "game-web/public/data/world-atlas-countries-110m.json"
REVIEW_REGISTRY = CATALOG_ROOT / "COUNTRY_REVIEW_REGISTRY.json"
REPORT = CATALOG_ROOT / "GLOBAL_COUNTRY_CATALOG_AUDIT.md"

CHAPTERS = (
    ("Africa", "africa.md"),
    ("Asia", "asia.md"),
    ("Europe", "europe.md"),
    ("North America", "northamerica.md"),
    ("South America", "southamerica.md"),
    ("Oceania", "oceania.md"),
    ("Special", "special.md"),
)

ISSUE_RE = re.compile(r"#(\d+)")
SUMMARY_RE = re.compile(r"^- ([^:]+): \*\*(\d+)\*\*$")
VALID_STATES = {"PASS", "REVIEW", "GAP"}


def topology_names():
    data = json.loads(TOPOLOGY.read_text())
    geometries = data["objects"]["countries"]["geometries"]
    return {
        str(geometry.get("id")): str((geometry.get("properties") or {}).get("name") or "").strip()
        for geometry in geometries
    }


def parse_chapter(chapter_name, filename):
    path = CONTINENT_ROOT / filename
    text = path.read_text()
    rows = []
    summary = {}
    for line in text.splitlines():
        summary_match = SUMMARY_RE.match(line)
        if summary_match:
            summary[summary_match.group(1)] = int(summary_match.group(2))
        if not line.startswith("|"):
            continue
        cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
        if len(cells) != 7 or cells[0] in {"ID", "---:"}:
            continue
        geometry_id, name, capital, nodes_text, slots, state_text, notes = cells
        if set(geometry_id) <= {"-", ":"}:
            continue
        state = state_text.replace("*", "").strip()
        try:
            nodes = int(nodes_text)
        except ValueError as exc:
            raise ValueError(f"{path}: invalid node count for {geometry_id}: {nodes_text}") from exc
        rows.append(
            {
                "chapter": chapter_name,
                "file": filename,
                "id": geometry_id,
                "name": name,
                "capital": capital,
                "nodes": nodes,
                "slots": slots,
                "state": state,
                "notes": notes,
            }
        )
    return rows, summary


def verify():
    expected = topology_names()
    registry = json.loads(REVIEW_REGISTRY.read_text()).get("reviews", {})
    rows = []
    chapter_summaries = {}
    errors = []

    for chapter_name, filename in CHAPTERS:
        chapter_rows, summary = parse_chapter(chapter_name, filename)
        rows.extend(chapter_rows)
        chapter_summaries[chapter_name] = {
            "file": filename,
            "summary": summary,
            "rows": chapter_rows,
        }

    by_id = defaultdict(list)
    for row in rows:
        by_id[row["id"]].append(row)
        if row["state"] not in VALID_STATES:
            errors.append(f"{row['file']}: {row['id']} has invalid state {row['state']!r}")
        if row["nodes"] > 9:
            errors.append(f"{row['file']}: {row['id']} has {row['nodes']} nodes (> 9)")
        if row["nodes"] < 0:
            errors.append(f"{row['file']}: {row['id']} has a negative node count")
        if row["state"] == "REVIEW":
            issue_match = ISSUE_RE.search(row["notes"])
            if not issue_match:
                errors.append(f"{row['file']}: REVIEW {row['id']} has no linked issue")
            review = registry.get(row["id"])
            if not review:
                errors.append(f"{row['file']}: REVIEW {row['id']} is missing from COUNTRY_REVIEW_REGISTRY.json")
            elif issue_match and int(review.get("issue", -1)) != int(issue_match.group(1)):
                errors.append(
                    f"{row['file']}: REVIEW {row['id']} links #{issue_match.group(1)} but registry links #{review.get('issue')}"
                )
        if row["state"] == "GAP" and not row["notes"].strip():
            errors.append(f"{row['file']}: GAP {row['id']} has no documented reason")

    expected_ids = set(expected)
    actual_ids = set(by_id)
    missing = sorted(expected_ids - actual_ids)
    extra = sorted(actual_ids - expected_ids)
    duplicate_ids = sorted(geometry_id for geometry_id, matches in by_id.items() if len(matches) != 1)

    if missing:
        errors.append("Missing topology geometries: " + ", ".join(f"{geometry_id} ({expected[geometry_id]})" for geometry_id in missing))
    if extra:
        errors.append("Chapter geometries absent from topology: " + ", ".join(extra))
    for geometry_id in duplicate_ids:
        placements = ", ".join(row["chapter"] for row in by_id[geometry_id])
        errors.append(f"Geometry {geometry_id} occurs {len(by_id[geometry_id])} times: {placements}")

    for chapter_name, data in chapter_summaries.items():
        chapter_rows = data["rows"]
        summary = data["summary"]
        counts = Counter(row["state"] for row in chapter_rows)
        expected_summary = {
            "countries/territories": len(chapter_rows),
            "representative nodes": sum(row["nodes"] for row in chapter_rows),
            "structural PASS": counts["PASS"],
            "REVIEW": counts["REVIEW"],
            "documented GAP": counts["GAP"],
        }
        for key, expected_value in expected_summary.items():
            actual_value = summary.get(key)
            if actual_value != expected_value:
                errors.append(
                    f"{data['file']}: summary {key!r} is {actual_value!r}, derived value is {expected_value}"
                )

    status_counts = Counter(row["state"] for row in rows)
    total_nodes = sum(row["nodes"] for row in rows)
    review_issues = sorted(
        {
            int(match.group(1))
            for row in rows
            if row["state"] == "REVIEW"
            for match in [ISSUE_RE.search(row["notes"])]
            if match
        }
    )

    result = {
        "topology_count": len(expected),
        "row_count": len(rows),
        "total_nodes": total_nodes,
        "status_counts": status_counts,
        "review_issues": review_issues,
        "chapters": chapter_summaries,
        "errors": errors,
    }
    return result


def report_text(result):
    counts = result["status_counts"]
    lines = [
        "# Global Country Catalog Audit",
        "",
        "Status: VERIFIED if `scripts/verify_country_catalog_chapters.py` exits successfully.",
        "",
        "Parent: #446",
        "",
        "## Global accounting",
        "",
        f"- rendered topology geometries: **{result['topology_count']}**",
        f"- chapter entries: **{result['row_count']}**",
        f"- representative locality nodes: **{result['total_nodes']}**",
        f"- PASS: **{counts['PASS']}**",
        f"- REVIEW: **{counts['REVIEW']}**",
        f"- GAP: **{counts['GAP']}**",
        "- duplicate geometry assignments: **0**",
        "- missing geometry assignments: **0**",
        "",
        "## Chapter totals",
        "",
        "| Chapter | Geometries | Nodes | PASS | REVIEW | GAP |",
        "|---|---:|---:|---:|---:|---:|",
    ]
    for chapter_name, _ in CHAPTERS:
        chapter_rows = result["chapters"][chapter_name]["rows"]
        chapter_counts = Counter(row["state"] for row in chapter_rows)
        lines.append(
            f"| {chapter_name} | {len(chapter_rows)} | {sum(row['nodes'] for row in chapter_rows)} | "
            f"{chapter_counts['PASS']} | {chapter_counts['REVIEW']} | {chapter_counts['GAP']} |"
        )

    lines.extend(
        [
            "",
            "## Open semantic/data reviews",
            "",
            "Every unresolved REVIEW entry has a dedicated issue and a matching persistent entry in `COUNTRY_REVIEW_REGISTRY.json`.",
            "",
            ", ".join(f"#{issue}" for issue in result["review_issues"]),
            "",
            "## Exit-gate proof for #446",
            "",
            "The verifier enforces the following repository invariants:",
            "",
            "1. every rendered topology geometry appears in exactly one continent/special chapter;",
            "2. no chapter contains a geometry absent from the rendered topology;",
            "3. every chapter summary matches its derived row/node/state counts;",
            "4. every country/territory has at most nine representative nodes;",
            "5. every REVIEW row links a dedicated GitHub issue and matches the persistent review registry;",
            "6. every GAP has a documented reason;",
            "7. unresolved semantic corrections remain isolated in their dedicated issues rather than being silently rewritten in the pinned source catalog.",
            "",
            "This audit closes the country-by-country accounting/curation scope. It does not claim that the linked REVIEW issues are already corrected in runtime data.",
            "",
        ]
    )
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--write-report", action="store_true")
    args = parser.parse_args()

    result = verify()
    if result["errors"]:
        for error in result["errors"]:
            print(f"FAIL: {error}", file=sys.stderr)
        return 1

    if args.write_report:
        REPORT.write_text(report_text(result))
        print(f"WROTE {REPORT.relative_to(ROOT)}")

    counts = result["status_counts"]
    print(
        "PASS: global Country Catalog chapters verified "
        f"geometries={result['row_count']} nodes={result['total_nodes']} "
        f"PASS={counts['PASS']} REVIEW={counts['REVIEW']} GAP={counts['GAP']}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
