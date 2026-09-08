import json, math, pathlib, urllib.request, unicodedata
import pycountry

from country_geometry_identity import load_geometry_id_registry, topology_names
from country_semantics import load_country_semantics, runtime_semantics, semantic_functions, source_place_for_spec

ROOT = pathlib.Path(__file__).resolve().parents[1]
SRC_COMMIT = 'ca96624a56bd078437bca8184e78163e5039ad19'
SRC_URL = f'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/{SRC_COMMIT}/geojson/ne_10m_populated_places_simple.geojson'
OUT = ROOT / 'game-web/public/data/country-representative-localities-v1.json'
TOPOLOGY = ROOT / 'game-web/public/data/world-atlas-countries-110m.json'
W, H = 1440.0, 720.0


def norm(v):
    v = unicodedata.normalize('NFKD', str(v or ''))
    return ''.join(ch for ch in v.lower() if not unicodedata.combining(ch) and ch.isalnum())


with urllib.request.urlopen(SRC_URL, timeout=60) as r:
    source = json.load(r)
topology = json.loads(TOPOLOGY.read_text())
identity_registry, identity_by_name = load_geometry_id_registry()
semantics_registry, semantics_by_id = load_country_semantics()
rendered = topology_names(topology, identity_by_name)
ids = set(rendered)
name_to_id = {norm(name): cid for cid, name in rendered.items() if name}


def country_id(props):
    iso2 = str(props.get('iso_a2') or '').upper()
    if len(iso2) == 2 and iso2 != '-9':
        hit = pycountry.countries.get(alpha_2=iso2)
        if hit and hit.numeric in ids:
            return hit.numeric

    # `adm0name` identifies the local administrative country/territory of the place.
    # Do not fall back to `sov0name`: doing so attributes overseas-territory places to
    # the sovereign mainland geometry (e.g. Hamilton/Bermuda -> United Kingdom).
    hit = name_to_id.get(norm(props.get('adm0name')))
    if hit:
        return hit
    return None


grouped = {cid: [] for cid in ids}
for f in source.get('features', []):
    p = f.get('properties') or {}
    coords = (f.get('geometry') or {}).get('coordinates') or []
    cid = country_id(p)
    if cid not in grouped or len(coords) < 2:
        continue
    try:
        lon, lat = float(coords[0]), float(coords[1])
    except Exception:
        continue
    fc = str(p.get('featurecla') or '')
    grouped[cid].append({
        'name': str(p.get('nameascii') or p.get('name') or '').strip(),
        'lon': lon,
        'lat': lat,
        'population': int(float(p.get('pop_max') or 0)),
        'scalerank': int(float(p.get('scalerank') or 99)),
        'featureClass': fc,
        'admin1': str(p.get('adm1name') or '').strip(),
        'isCapital': bool(float(p.get('adm0cap') or 0)) or 'Admin-0 capital' in fc,
        'isAdmin1': 'Admin-1 capital' in fc,
    })


directions = {
    'N': (0, -1), 'NE': (.7071, -.7071), 'E': (1, 0), 'SE': (.7071, .7071),
    'S': (0, 1), 'SW': (-.7071, .7071), 'W': (-1, 0), 'NW': (-.7071, -.7071),
}
DIRECTION_ORDER = ('N', 'E', 'S', 'W', 'NE', 'SE', 'SW', 'NW')


def point(p):
    return ((p['lon'] + 180) / 360 * W, (90 - p['lat']) / 180 * H)


def place_key(p):
    return (round(p['lon'], 6), round(p['lat'], 6), p['name'])


def choose(places, semantic=None):
    if not places:
        return []
    semantic = semantic or {}
    xs, ys = zip(*(point(p) for p in places))
    cx, cy = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2
    hw, hh = max(8, (max(xs) - min(xs)) / 2), max(8, (max(ys) - min(ys)) / 2)

    def vec(p):
        x, y = point(p)
        dx, dy = (x - cx) / hw, (y - cy) / hh
        mag = max(1e-9, math.hypot(dx, dy))
        return dx / mag, dy / mag, min(2.5, mag)

    capitals = [p for p in places if p['isCapital']]
    capitals.sort(key=lambda p: (p['scalerank'], -p['population'], p['name']))
    source_capital = capitals[0] if capitals else max(places, key=lambda p: (p['population'], -p['scalerank']))
    selected = []
    used = set()
    used_sectors = set()
    selected_by_place = {}

    def add(p, role, sector, display_name=None, functions=None):
        k = place_key(p)
        existing = selected_by_place.get(k)
        if existing is not None:
            merged = sorted(set(existing.get('functions', [])) | set(functions or []))
            if merged:
                existing['functions'] = merged
            if display_name:
                existing['name'] = display_name
            return existing
        if sector != 'CAPITAL' and sector in used_sectors:
            return None
        node = {
            'name': display_name or p['name'],
            'role': role,
            'sector': sector,
            'longitude': round(p['lon'], 6),
            'latitude': round(p['lat'], 6),
            'populationReference': p['population'],
            'admin1': p['admin1'],
            'sourceFeatureClass': p['featureClass'],
        }
        fn = sorted(set(functions or []))
        if fn:
            node['functions'] = fn
        used.add(k)
        if sector != 'CAPITAL':
            used_sectors.add(sector)
        selected_by_place[k] = node
        selected.append(node)
        return node

    primary_spec = semantic.get('primaryCapital')
    capital_mode = str(semantic.get('capitalMode') or 'single')
    demote_source_capital = bool(semantic.get('demoteSourceCapital'))
    if primary_spec:
        resolved = source_place_for_spec(places, primary_spec)
        add(
            resolved,
            'capital',
            'CAPITAL',
            primary_spec.get('displayName'),
            semantic_functions(primary_spec),
        )
    elif not demote_source_capital and capital_mode not in {'none', 'status-sensitive'}:
        add(source_capital, 'capital', 'CAPITAL')

    def best_sector_for_required(p):
        dx, dy, _ = vec(p)
        candidates = []
        for sector in DIRECTION_ORDER:
            if sector in used_sectors:
                continue
            ux, uy = directions[sector]
            candidates.append((dx * ux + dy * uy, sector))
        candidates.sort(reverse=True)
        return candidates[0][1] if candidates else None

    for spec in semantic.get('requiredCenters', []):
        resolved = source_place_for_spec(places, spec)
        k = place_key(resolved)
        if k in selected_by_place:
            add(resolved, 'urban', selected_by_place[k]['sector'], spec.get('displayName'), semantic_functions(spec))
            continue
        sector = best_sector_for_required(resolved)
        if sector:
            add(resolved, 'urban', sector, spec.get('displayName'), semantic_functions(spec))

    def significant(p):
        return p['isAdmin1'] or p['population'] >= 15000

    def best(sector, secondary):
        ux, uy = directions[sector]
        winner = None
        best_score = -1e9
        for p in places:
            if place_key(p) in used:
                continue
            dx, dy, distance = vec(p)
            alignment = dx * ux + dy * uy
            if secondary:
                if alignment < .30:
                    continue
                pop = math.log10(max(10, p['population']))
                small_bonus = max(0, 6.0 - pop)
                big_penalty = 1.4 if p['population'] > 250000 else 0
                score = alignment * 5.0 + distance * .7 + small_bonus * .42 - big_penalty
            else:
                if not significant(p) or alignment < .12:
                    continue
                pop = math.log10(max(100, p['population']))
                importance = max(0, min(1, (12 - p['scalerank']) / 12))
                score = alignment * 4.0 + distance * .45 + pop * .78 + importance * 1.0 + (1.0 if p['isAdmin1'] else 0)
            if score > best_score:
                winner, best_score = p, score
        return winner

    for sector in ('N', 'E', 'S', 'W'):
        if sector in used_sectors or len(selected) >= 9:
            continue
        p = best(sector, False)
        if p:
            add(p, 'urban', sector)
    for sector in ('NE', 'SE', 'SW', 'NW'):
        if sector in used_sectors or len(selected) >= 9:
            continue
        p = best(sector, True)
        if p:
            add(p, 'secondary', sector)
    return selected[:9]


countries = {}
for cid in sorted(ids):
    nodes = choose(grouped.get(cid, []), semantics_by_id.get(cid))
    if nodes:
        countries[cid] = nodes
missing = [{'id': cid, 'name': rendered[cid]} for cid in sorted(ids) if cid not in countries]


def capital(cid):
    return next((n['name'] for n in countries.get(cid, []) if n['role'] == 'capital'), None)


assert capital('642') in {'Bucharest', 'Bucuresti'}
assert capital('372') == 'Dublin'
assert capital('826') == 'London'
assert capital('XKX') == 'Pristina'
assert capital('204') == 'Porto-Novo'
assert capital('108') == 'Gitega'
assert capital('384') == 'Yamoussoukro'
assert capital('226') == 'Ciudad de la Paz'
assert capital('710') == 'Pretoria'
assert capital('834') == 'Dodoma'
assert capital('392') == 'Tokyo'
assert capital('104') == 'Nay Pyi Taw'
assert capital('144') == 'Sri Jayewardenepura Kotte'
assert capital('068') == 'Sucre'
assert capital('152') == 'Santiago'
for no_capital_id in ('376', '275', '732', '238', '010', 'XSL'):
    assert capital(no_capital_id) is None
assert all(n['name'] != 'Hamilton' for n in countries.get('826', []))
assert all(len(v) <= 9 for v in countries.values())
ireland_n = next((n for n in countries['372'] if n['role'] == 'urban' and n['sector'] == 'N'), None)
assert ireland_n is None or ireland_n['populationReference'] >= 15000 or 'Admin-1 capital' in ireland_n['sourceFeatureClass']

payload = {
    'version': '1.3.0',
    'source': {
        'name': 'Natural Earth 1:10m populated places simple',
        'upstreamCommit': SRC_COMMIT,
        'license': 'Public Domain',
    },
    'geometryIdentity': {
        'registryVersion': identity_registry.get('version', 'unknown'),
        'byRenderedName': identity_by_name,
    },
    'semanticsVersion': semantics_registry.get('version', 'unknown'),
    'semantics': runtime_semantics(semantics_by_id),
    'stats': {
        'renderedCountries': len(ids),
        'countriesWithRepresentativeNodes': len(countries),
        'capitalNodes': sum(1 for v in countries.values() for n in v if n['role'] == 'capital'),
        'totalRepresentativeNodes': sum(map(len, countries.values())),
        'maxNodesPerCountry': max(map(len, countries.values())),
    },
    'coverageGaps': missing,
    'countries': countries,
}
OUT.write_text(json.dumps(payload, ensure_ascii=False, separators=(',', ':')) + '\n')
print('STATS', json.dumps(payload['stats'], sort_keys=True))
print('MISSING', json.dumps(missing, ensure_ascii=False))
print('ROMANIA', json.dumps(countries['642'], ensure_ascii=False))
print('IRELAND', json.dumps(countries['372'], ensure_ascii=False))
print('UNITED_KINGDOM', json.dumps(countries['826'], ensure_ascii=False))
print('KOSOVO', json.dumps(countries['XKX'], ensure_ascii=False))
