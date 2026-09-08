import json, math, pathlib, re, urllib.request, unicodedata
import pycountry

from country_geometry_identity import load_geometry_id_registry, topology_names

ROOT = pathlib.Path(__file__).resolve().parents[1]
SRC_COMMIT = 'ca96624a56bd078437bca8184e78163e5039ad19'
SRC_URL = f'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/{SRC_COMMIT}/geojson/ne_10m_populated_places_simple.geojson'
OUT = ROOT / 'game-web/public/data/country-representative-localities-v1.json'
TOPOLOGY = ROOT / 'game-web/public/data/world-atlas-countries-110m.json'
ROLE_OVERRIDES = ROOT / '04_World/Country_Catalog/COUNTRY_LOCALITY_ROLE_OVERRIDES.json'
AUTHORITATIVE_SUPPLEMENTS = ROOT / '04_World/Country_Catalog/COUNTRY_LOCALITY_AUTHORITATIVE_SUPPLEMENTS.json'
W, H = 1440.0, 720.0


def norm(v):
    v = unicodedata.normalize('NFKD', str(v or ''))
    return ''.join(ch for ch in v.lower() if not unicodedata.combining(ch) and ch.isalnum())


def parse_dms_coordinate_text(value):
    text = str(value or '').strip()
    matches = re.findall(r'(\d{1,3})°(\d{1,2})[′\'](\d{1,2}(?:\.\d+)?)[″\"]([NSEW])', text)
    if len(matches) != 2:
        raise ValueError(f'expected latitude/longitude DMS pair, got {text!r}')

    latitude = None
    longitude = None
    for degrees, minutes, seconds, hemisphere in matches:
        decimal = float(degrees) + float(minutes) / 60.0 + float(seconds) / 3600.0
        if hemisphere in {'S', 'W'}:
            decimal *= -1
        if hemisphere in {'N', 'S'}:
            if latitude is not None:
                raise ValueError(f'duplicate latitude in {text!r}')
            latitude = decimal
        else:
            if longitude is not None:
                raise ValueError(f'duplicate longitude in {text!r}')
            longitude = decimal
    if latitude is None or longitude is None:
        raise ValueError(f'coordinate text must contain one latitude and one longitude: {text!r}')
    return longitude, latitude


with urllib.request.urlopen(SRC_URL, timeout=60) as r:
    source = json.load(r)
topology = json.loads(TOPOLOGY.read_text())
identity_registry, identity_by_name = load_geometry_id_registry()
role_override_registry = json.loads(ROLE_OVERRIDES.read_text())
supplement_registry = json.loads(AUTHORITATIVE_SUPPLEMENTS.read_text())
if role_override_registry.get('source', {}).get('upstreamCommit') != SRC_COMMIT:
    raise RuntimeError('COUNTRY_LOCALITY_ROLE_OVERRIDES.json must target the pinned populated-place source commit')
role_overrides = role_override_registry.get('entries') or {}
supplement_sources = supplement_registry.get('sources') or {}
supplements = supplement_registry.get('entries') or {}
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


def point(p):
    return ((p['lon'] + 180) / 360 * W, (90 - p['lat']) / 180 * H)


def place_key(p):
    return (round(p['lon'], 6), round(p['lat'], 6), p['name'])


def unique_source_place(places, source_names, country_id_value, purpose):
    wanted = {norm(name) for name in source_names if norm(name)}
    hits = [p for p in places if norm(p['name']) in wanted]
    if len(hits) != 1:
        available = sorted({p['name'] for p in places if p['name']})
        raise RuntimeError(
            f'{country_id_value} {purpose}: expected exactly one pinned-source locality '
            f'for {source_names!r}, found {len(hits)}. Available names: {available!r}'
        )
    return hits[0]


def authoritative_supplement(ref, country_id_value):
    entry = supplements.get(ref)
    if not entry:
        raise RuntimeError(f'{country_id_value}: unknown authoritative supplement {ref!r}')
    if str(entry.get('countryId')) != country_id_value:
        raise RuntimeError(f'{country_id_value}: supplement {ref!r} targets countryId {entry.get("countryId")!r}')
    source_ref = str(entry.get('sourceRef') or '')
    source_meta = supplement_sources.get(source_ref)
    if (
        not source_meta
        or not str(source_meta.get('publisher') or '').strip()
        or not str(source_meta.get('url') or '').startswith('https://')
    ):
        raise RuntimeError(f'{country_id_value}: supplement {ref!r} has invalid institutional source {source_ref!r}')
    source_coordinate_text = str(entry.get('sourceCoordinateText') or '').strip()
    if not source_coordinate_text or not entry.get('issue'):
        raise RuntimeError(f'{country_id_value}: supplement {ref!r} lacks coordinate/review provenance')
    if not str(entry.get('name') or '').strip():
        raise RuntimeError(f'{country_id_value}: supplement {ref!r} lacks a canonical locality name')
    try:
        lon = float(entry['longitude'])
        lat = float(entry['latitude'])
    except Exception as exc:
        raise RuntimeError(f'{country_id_value}: supplement {ref!r} has invalid coordinates') from exc
    if not (-180 <= lon <= 180 and -90 <= lat <= 90):
        raise RuntimeError(f'{country_id_value}: supplement {ref!r} coordinates are out of range')
    try:
        source_lon, source_lat = parse_dms_coordinate_text(source_coordinate_text)
    except ValueError as exc:
        raise RuntimeError(f'{country_id_value}: supplement {ref!r} has invalid source coordinate text') from exc
    if not math.isclose(lon, source_lon, rel_tol=0.0, abs_tol=1e-12) or not math.isclose(lat, source_lat, rel_tol=0.0, abs_tol=1e-12):
        raise RuntimeError(
            f'{country_id_value}: supplement {ref!r} decimal coordinates do not match '
            f'the exact DMS conversion of {source_coordinate_text!r}'
        )
    return {
        'name': str(entry.get('name') or '').strip(),
        'lon': lon,
        'lat': lat,
        'population': 0,
        'scalerank': 0,
        'featureClass': str(entry.get('featureClass') or 'Authoritative locality supplement'),
        'admin1': str(entry.get('admin1') or '').strip(),
        'isCapital': True,
        'isAdmin1': False,
        'sourceKind': 'authoritative-supplement',
        'supplementRef': ref,
        'sourceRef': source_ref,
        'sourceCoordinateText': source_coordinate_text,
        'effectiveOn': str(entry.get('effectiveOn') or ''),
    }


def choose(places, country_id_value, override=None):
    current_capital = (override or {}).get('currentCapital') or {}
    supplement_ref = str(current_capital.get('supplementRef') or '')
    if not places and not supplement_ref:
        if override:
            raise RuntimeError(f'{country_id_value}: governed role override has no pinned-source locality pool')
        return []

    extent_places = list(places)
    if supplement_ref:
        extent_places.append(authoritative_supplement(supplement_ref, country_id_value))
    xs, ys = zip(*(point(p) for p in extent_places))
    cx, cy = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2
    hw, hh = max(8, (max(xs) - min(xs)) / 2), max(8, (max(ys) - min(ys)) / 2)

    def vec(p):
        x, y = point(p)
        dx, dy = (x - cx) / hw, (y - cy) / hh
        mag = max(1e-9, math.hypot(dx, dy))
        return dx / mag, dy / mag, min(2.5, mag)

    if override:
        if supplement_ref:
            capital = authoritative_supplement(supplement_ref, country_id_value)
        else:
            capital = unique_source_place(
                places,
                current_capital.get('sourceNames') or [],
                country_id_value,
                'currentCapital',
            )
        capital_display_name = str(current_capital.get('displayName') or capital['name']).strip()
    else:
        capitals = [p for p in places if p['isCapital']]
        capitals.sort(key=lambda p: (p['scalerank'], -p['population'], p['name']))
        capital = capitals[0] if capitals else max(places, key=lambda p: (p['population'], -p['scalerank']))
        capital_display_name = capital['name']

    selected = []
    used = set()
    used_sectors = set()

    def add(p, role, sector, display_name=None):
        k = place_key(p)
        if k in used or sector in used_sectors:
            return False
        used.add(k)
        used_sectors.add(sector)
        node = {
            'name': str(display_name or p['name']).strip(),
            'role': role,
            'sector': sector,
            'longitude': round(p['lon'], 6),
            'latitude': round(p['lat'], 6),
            'populationReference': p['population'],
            'admin1': p['admin1'],
            'sourceFeatureClass': p['featureClass'],
        }
        if p.get('sourceKind') == 'authoritative-supplement':
            node.update({
                'sourceKind': p['sourceKind'],
                'supplementRef': p['supplementRef'],
                'sourceRef': p['sourceRef'],
                'sourceCoordinateText': p['sourceCoordinateText'],
                'effectiveOn': p['effectiveOn'],
            })
        selected.append(node)
        return True

    add(capital, 'capital', 'CAPITAL', capital_display_name)

    def ranked_sectors(p):
        dx, dy, _distance = vec(p)
        return sorted(
            directions,
            key=lambda sector: (dx * directions[sector][0] + dy * directions[sector][1], sector),
            reverse=True,
        )

    if override:
        for required in override.get('requiredRepresentatives') or []:
            representative = unique_source_place(
                places,
                required.get('sourceNames') or [],
                country_id_value,
                'requiredRepresentative',
            )
            sector = next((value for value in ranked_sectors(representative) if value not in used_sectors), None)
            if not sector:
                raise RuntimeError(f'{country_id_value}: no sector available for required representative {required!r}')
            role = str(required.get('role') or 'urban')
            if role not in {'urban', 'secondary'}:
                raise RuntimeError(f'{country_id_value}: invalid required representative role {role!r}')
            if not add(representative, role, sector, required.get('displayName')):
                raise RuntimeError(f'{country_id_value}: failed to add required representative {required!r}')

    def significant(p):
        return p['isAdmin1'] or p['population'] >= 15000

    def best(sector, secondary):
        ux, uy = directions[sector]
        winner = None
        best_score = -1e9
        for p in places:
            if place_key(p) in used or p is capital:
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
        if sector in used_sectors:
            continue
        p = best(sector, False)
        if p:
            add(p, 'urban', sector)
    for sector in ('NE', 'SE', 'SW', 'NW'):
        if sector in used_sectors:
            continue
        p = best(sector, True)
        if p:
            add(p, 'secondary', sector)
    return selected[:9]


countries = {}
for cid in sorted(ids):
    nodes = choose(grouped.get(cid, []), cid, role_overrides.get(cid))
    if nodes:
        countries[cid] = nodes
missing = [{'id': cid, 'name': rendered[cid]} for cid in sorted(ids) if cid not in countries]


def capital(cid):
    return next((n['name'] for n in countries.get(cid, []) if n['role'] == 'capital'), None)


def node(cid, name):
    return next((n for n in countries.get(cid, []) if n['name'] == name), None)


assert capital('642') in {'Bucharest', 'Bucuresti'}
assert capital('372') == 'Dublin'
assert capital('826') == 'London'
assert capital('XKX') == 'Pristina'
assert capital('392') == 'Tokyo'
assert capital('104') == 'Nay Pyi Taw'
assert capital('144') == 'Sri Jayewardenepura Kotte'
assert capital('152') == 'Santiago'
assert capital('226') == 'Ciudad de la Paz'
assert node('392', 'Kyoto') and node('392', 'Kyoto')['role'] != 'capital'
assert node('104', 'Yangon') and node('104', 'Yangon')['role'] != 'capital'
assert node('144', 'Colombo') and node('144', 'Colombo')['role'] != 'capital'
assert node('152', 'Valparaíso') and node('152', 'Valparaíso')['role'] != 'capital'
assert node('226', 'Malabo') and node('226', 'Malabo')['role'] != 'capital'
assert node('226', 'Ciudad de la Paz')['sourceKind'] == 'authoritative-supplement'
assert node('226', 'Ciudad de la Paz')['effectiveOn'] == '2026-01-02'
assert all(n['name'] != 'Hamilton' for n in countries.get('826', []))
assert all(len(v) <= 9 for v in countries.values())
ireland_n = next((n for n in countries['372'] if n['role'] == 'urban' and n['sector'] == 'N'), None)
assert ireland_n is None or ireland_n['populationReference'] >= 15000 or 'Admin-1 capital' in ireland_n['sourceFeatureClass']

used_supplements = sorted({
    str((override.get('currentCapital') or {}).get('supplementRef'))
    for override in role_overrides.values()
    if (override.get('currentCapital') or {}).get('supplementRef')
})

payload = {
    'version': '1.4.0',
    'source': {
        'name': 'Natural Earth 1:10m populated places simple',
        'upstreamCommit': SRC_COMMIT,
        'license': 'Public Domain',
    },
    'geometryIdentity': {
        'registryVersion': identity_registry.get('version', 'unknown'),
        'byRenderedName': identity_by_name,
    },
    'localityRoleOverrides': {
        'registryVersion': role_override_registry.get('version', 'unknown'),
        'sourceCommit': role_override_registry.get('source', {}).get('upstreamCommit'),
        'countryIds': sorted(role_overrides),
    },
    'localityAuthoritativeSupplements': {
        'registryVersion': supplement_registry.get('version', 'unknown'),
        'refs': used_supplements,
    },
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
for cid in sorted(role_overrides):
    print('OVERRIDE', cid, json.dumps(countries[cid], ensure_ascii=False))
