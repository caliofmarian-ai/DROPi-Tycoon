#!/usr/bin/env python3
import argparse
import json
import pathlib
import re
import unicodedata
import urllib.request

import pycountry

from country_geometry_identity import load_geometry_id_registry, topology_names
from country_semantics import load_country_semantics

ROOT = pathlib.Path(__file__).resolve().parents[1]
CATALOG = ROOT / 'game-web/public/data/country-representative-localities-v1.json'
TOPOLOGY = ROOT / 'game-web/public/data/world-atlas-countries-110m.json'
OUT_ROOT = ROOT / '04_World/Country_Catalog'
REVIEW_REGISTRY = OUT_ROOT / 'COUNTRY_REVIEW_REGISTRY.json'
SRC_COMMIT = 'ca96624a56bd078437bca8184e78163e5039ad19'
ADMIN0_URL = f'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/{SRC_COMMIT}/geojson/ne_10m_admin_0_countries.geojson'
CONTINENTS = ('Europe', 'Africa', 'Asia', 'North America', 'South America', 'Oceania', 'Special')


def norm(value):
    value = unicodedata.normalize('NFKD', str(value or ''))
    return ''.join(ch for ch in value.lower() if not unicodedata.combining(ch) and ch.isalnum())


def slug(value):
    text = re.sub(r'[^a-z0-9]+', '-', norm(value))
    return text.strip('-') or 'country'


def prop(properties, *names):
    lowered = {str(k).lower(): v for k, v in (properties or {}).items()}
    for name in names:
        value = lowered.get(name.lower())
        if value not in (None, '', '-99', '-9'):
            return value
    return None


def load_json(path):
    return json.loads(path.read_text())


def fetch_admin0():
    with urllib.request.urlopen(ADMIN0_URL, timeout=60) as response:
        return json.load(response)


def numeric_country_id(properties, valid_ids, name_to_id):
    numeric = str(prop(properties, 'ISO_N3', 'iso_n3') or '').strip()
    if numeric.isdigit():
        numeric = numeric.zfill(3)
        if numeric in valid_ids:
            return numeric

    alpha2 = str(prop(properties, 'ISO_A2', 'iso_a2') or '').upper()
    if len(alpha2) == 2:
        hit = pycountry.countries.get(alpha_2=alpha2)
        if hit and hit.numeric in valid_ids:
            return hit.numeric

    alpha3 = str(prop(properties, 'ADM0_A3', 'adm0_a3') or '').upper()
    if len(alpha3) == 3:
        hit = pycountry.countries.get(alpha_3=alpha3)
        if hit and hit.numeric in valid_ids:
            return hit.numeric

    for key in ('ADMIN', 'NAME', 'NAME_LONG', 'BRK_NAME', 'FORMAL_EN'):
        hit = name_to_id.get(norm(prop(properties, key)))
        if hit:
            return hit
    return None


def continent_name(properties):
    raw = str(prop(properties, 'CONTINENT', 'continent') or '').strip()
    normalized = raw.casefold()
    aliases = {
        'europe': 'Europe',
        'africa': 'Africa',
        'asia': 'Asia',
        'north america': 'North America',
        'south america': 'South America',
        'oceania': 'Oceania',
        'antarctica': 'Special',
        'seven seas (open ocean)': 'Special',
    }
    return aliases.get(normalized, 'Special')


def build_continent_map(admin0, rendered):
    valid_ids = set(rendered)
    name_to_id = {norm(name): cid for cid, name in rendered.items() if name}
    mapping = {}
    for feature in admin0.get('features', []):
        properties = feature.get('properties') or {}
        cid = numeric_country_id(properties, valid_ids, name_to_id)
        if cid and cid not in mapping:
            mapping[cid] = continent_name(properties)
    return {cid: mapping.get(cid, 'Special') for cid in valid_ids}


def node_key(node):
    return (
        str(node.get('name') or ''),
        round(float(node.get('longitude') or 0), 6),
        round(float(node.get('latitude') or 0), 6),
    )


def expected_capital_count(semantic):
    semantic = semantic or {}
    mode = str(semantic.get('capitalMode') or 'single')
    if mode in {'none', 'status-sensitive'}:
        return 0
    if semantic.get('demoteSourceCapital') and not semantic.get('primaryCapital'):
        return 0
    return 1


def audit_country(cid, name, nodes, coverage_gap=False, manual_review=None, project_owned_ids=None, semantic=None):
    project_owned_ids = project_owned_ids or set()
    semantic = semantic or {}
    reasons = []
    if manual_review:
        issue = manual_review.get('issue')
        reason = str(manual_review.get('reason') or 'manual semantic review required')
        reasons.append(f"#{issue}: {reason}" if issue else reason)
    if not str(cid).isdigit() and cid not in project_owned_ids:
        reasons.append('unstable/non-numeric geometry ID')
    if len(nodes) > 9:
        reasons.append('more than 9 nodes')
    if len({node_key(node) for node in nodes}) != len(nodes):
        reasons.append('duplicate locality')

    capitals = [node for node in nodes if node.get('role') == 'capital']
    expected_capitals = expected_capital_count(semantic)
    if nodes and len(capitals) != expected_capitals:
        reasons.append(f'capital count={len(capitals)} expected={expected_capitals}')

    used_slots = set()
    for node in nodes:
        role = str(node.get('role') or '')
        sector = str(node.get('sector') or '')
        slot = (role, sector)
        if slot in used_slots:
            reasons.append(f'duplicate role/sector {role}:{sector}')
        used_slots.add(slot)

        try:
            lon = float(node.get('longitude'))
            lat = float(node.get('latitude'))
        except (TypeError, ValueError):
            reasons.append(f'invalid coordinate for {node.get("name")}')
            continue
        if not (-180 <= lon <= 180 and -90 <= lat <= 90):
            reasons.append(f'out-of-range coordinate for {node.get("name")}')

        if role == 'urban':
            population = int(node.get('populationReference') or 0)
            feature_class = str(node.get('sourceFeatureClass') or '')
            functions = set(node.get('functions') or [])
            governance_node = bool(functions & {
                'government-seat', 'administrative-centre', 'administrative-capital',
                'legislative-capital', 'judicial-capital', 'legislative-seat',
                'economic-capital', 'commercial-capital',
            })
            if population < 15000 and 'Admin-1 capital' not in feature_class and not governance_node:
                reasons.append(f'urban significance rule failed for {node.get("name")}')

    if not nodes:
        return {
            'id': cid,
            'name': semantic.get('displayName') or name,
            'capital': semantic.get('capitalSummary') or '—',
            'nodeCount': 0,
            'slots': '—',
            'status': 'GAP' if coverage_gap else 'REVIEW',
            'notes': 'documented source coverage gap' if coverage_gap else 'no representative nodes',
        }

    capital = semantic.get('capitalSummary') or (capitals[0].get('name') if capitals else '—')
    slots = ', '.join(str(node.get('sector') or node.get('role') or '?') for node in nodes)
    return {
        'id': cid,
        'name': semantic.get('displayName') or name,
        'capital': capital,
        'nodeCount': len(nodes),
        'slots': slots,
        'status': 'PASS' if not reasons else 'REVIEW',
        'notes': '; '.join(sorted(set(reasons))) if reasons else ('structural/source/semantic checks passed' if semantic else 'structural/source checks passed'),
    }


def markdown_for_continent(continent, rows, catalog):
    total_nodes = sum(row['nodeCount'] for row in rows)
    passes = sum(row['status'] == 'PASS' for row in rows)
    reviews = sum(row['status'] == 'REVIEW' for row in rows)
    gaps = sum(row['status'] == 'GAP' for row in rows)
    lines = [
        f'# Country Catalog Chapter — {continent}',
        '',
        'Status: Generated audit manifest; country-by-country maintenance surface.',
        '',
        'Parent: #446',
        '',
        '## Source contract',
        f'- runtime catalog version: `{catalog.get("version", "unknown")}`',
        f'- semantics registry version: `{catalog.get("semanticsVersion", "none")}`',
        f'- Natural Earth upstream commit: `{catalog.get("source", {}).get("upstreamCommit", SRC_COMMIT)}`',
        '- every node coordinate remains a source coordinate; this manifest does not reposition places.',
        '',
        '## Chapter summary',
        f'- countries/territories: **{len(rows)}**',
        f'- representative nodes: **{total_nodes}**',
        f'- structural PASS: **{passes}**',
        f'- REVIEW: **{reviews}**',
        f'- documented GAP: **{gaps}**',
        '',
        '## Country-by-country manifest',
        '',
        '| ID | Country / territory | Capital / governance | Nodes | Slots | State | Notes |',
        '|---:|---|---|---:|---|---|---|',
    ]
    for row in sorted(rows, key=lambda item: item['name'].casefold()):
        safe = lambda value: str(value).replace('|', '/')
        lines.append(
            f"| {safe(row['id'])} | {safe(row['name'])} | {safe(row['capital'])} | {row['nodeCount']} | "
            f"{safe(row['slots'])} | **{row['status']}** | {safe(row['notes'])} |"
        )
    lines.extend([
        '',
        '## Interpretation',
        '- `PASS` means structural, pinned-source and declared semantic checks pass; it does not assert that a disputed political status is settled.',
        '- `REVIEW` requires a dedicated country-level investigation before correction.',
        '- `GAP` means the pinned source has no truthful representative locality and no place is invented to fill the pattern.',
        '',
    ])
    return '\n'.join(lines)


def country_markdown(continent, row, nodes, catalog):
    lines = [
        f"# Country Catalog Entry — {row['name']}",
        '',
        f"Continent chapter: **{continent}**",
        f"Country geometry ID: `{row['id']}`",
        f"Audit state: **{row['status']}**",
        '',
        f"Runtime catalog version: `{catalog.get('version', 'unknown')}`",
        f"Semantics registry version: `{catalog.get('semanticsVersion', 'none')}`",
        '',
        '## Representative nodes',
        '',
        '| Role | Sector | Locality | Functions | Admin-1 | Population reference | Longitude | Latitude |',
        '|---|---|---|---|---|---:|---:|---:|',
    ]
    for node in nodes:
        functions = ', '.join(node.get('functions') or []) or '—'
        lines.append(
            f"| {node.get('role','')} | {node.get('sector','')} | {node.get('name','')} | {functions} | "
            f"{node.get('admin1','')} | {node.get('populationReference',0)} | "
            f"{node.get('longitude','')} | {node.get('latitude','')} |"
        )
    if not nodes:
        lines.append('| — | — | — | — | — | 0 | — | — |')
    lines.extend(['', '## Audit notes', row['notes'], ''])
    return '\n'.join(lines)


def main():
    parser = argparse.ArgumentParser(description='Build continent/country audit chapters from the committed sparse locality catalog.')
    parser.add_argument('--continent', choices=CONTINENTS)
    parser.add_argument('--country', help='Country geometry ID, e.g. 642 for Romania or a registered project-owned ID')
    parser.add_argument('--all', action='store_true', help='Generate all continent manifests')
    args = parser.parse_args()

    if sum(bool(value) for value in (args.continent, args.country, args.all)) != 1:
        parser.error('choose exactly one of --continent, --country, or --all')

    catalog = load_json(CATALOG)
    topology = load_json(TOPOLOGY)
    _, identity_by_name = load_geometry_id_registry()
    _, semantics_by_id = load_country_semantics()
    rendered = topology_names(topology, identity_by_name)
    project_owned_ids = set(identity_by_name.values())
    admin0 = fetch_admin0()
    continents = build_continent_map(admin0, rendered)
    coverage_gap_ids = {str(item.get('id')) for item in catalog.get('coverageGaps', [])}
    countries = catalog.get('countries', {})
    review_registry = load_json(REVIEW_REGISTRY).get('reviews', {}) if REVIEW_REGISTRY.exists() else {}

    rows_by_continent = {name: [] for name in CONTINENTS}
    rows_by_id = {}
    for cid, name in rendered.items():
        nodes = countries.get(cid, [])
        row = audit_country(
            cid,
            name,
            nodes,
            cid in coverage_gap_ids,
            review_registry.get(cid),
            project_owned_ids,
            semantics_by_id.get(cid),
        )
        continent = continents.get(cid, 'Special')
        rows_by_continent.setdefault(continent, []).append(row)
        rows_by_id[cid] = (continent, row, nodes)

    OUT_ROOT.mkdir(parents=True, exist_ok=True)
    (OUT_ROOT / 'Continents').mkdir(parents=True, exist_ok=True)
    (OUT_ROOT / 'Countries').mkdir(parents=True, exist_ok=True)

    if args.all:
        targets = CONTINENTS
    elif args.continent:
        targets = (args.continent,)
    else:
        raw = str(args.country).strip()
        cid = raw.zfill(3) if raw.isdigit() else raw
        if cid not in rows_by_id:
            raise SystemExit(f'country geometry ID not found: {cid}')
        continent, row, nodes = rows_by_id[cid]
        path = OUT_ROOT / 'Countries' / f"{cid}-{slug(row['name'])}.md"
        path.write_text(country_markdown(continent, row, nodes, catalog).rstrip() + '\n')
        print(f'WROTE {path.relative_to(ROOT)} state={row["status"]}')
        return

    for continent in targets:
        rows = rows_by_continent.get(continent, [])
        path = OUT_ROOT / 'Continents' / f"{slug(continent)}.md"
        path.write_text(markdown_for_continent(continent, rows, catalog).rstrip() + '\n')
        print(f'WROTE {path.relative_to(ROOT)} countries={len(rows)}')


if __name__ == '__main__':
    main()
