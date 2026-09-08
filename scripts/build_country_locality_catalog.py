import json, math, pathlib, urllib.request, unicodedata
import pycountry

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
rendered = {str(g.get('id')): g.get('properties', {}).get('name', '') for g in topology['objects']['countries']['geometries']}
ids = set(rendered)
name_to_id = {norm(name): cid for cid, name in rendered.items() if name}

def country_id(props):
    iso2 = str(props.get('iso_a2') or '').upper()
    if len(iso2) == 2 and iso2 != '-9':
        hit = pycountry.countries.get(alpha_2=iso2)
        if hit and hit.numeric in ids:
            return hit.numeric
    for key in ('adm0name', 'sov0name'):
        hit = name_to_id.get(norm(props.get(key)))
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
        'lon': lon, 'lat': lat,
        'population': int(float(p.get('pop_max') or 0)),
        'scalerank': int(float(p.get('scalerank') or 99)),
        'featureClass': fc,
        'admin1': str(p.get('adm1name') or '').strip(),
        'isCapital': bool(float(p.get('adm0cap') or 0)) or 'Admin-0 capital' in fc,
        'isAdmin1': 'Admin-1 capital' in fc,
    })

directions = {
    'N': (0,-1), 'NE': (.7071,-.7071), 'E': (1,0), 'SE': (.7071,.7071),
    'S': (0,1), 'SW': (-.7071,.7071), 'W': (-1,0), 'NW': (-.7071,-.7071),
}
def point(p): return ((p['lon'] + 180) / 360 * W, (90 - p['lat']) / 180 * H)
def place_key(p): return (round(p['lon'], 6), round(p['lat'], 6), p['name'])

def choose(places):
    if not places: return []
    xs, ys = zip(*(point(p) for p in places))
    cx, cy = (min(xs)+max(xs))/2, (min(ys)+max(ys))/2
    hw, hh = max(8, (max(xs)-min(xs))/2), max(8, (max(ys)-min(ys))/2)
    def vec(p):
        x,y = point(p); dx,dy=(x-cx)/hw,(y-cy)/hh; mag=max(1e-9,math.hypot(dx,dy))
        return dx/mag,dy/mag,min(2.5,mag)
    capitals=[p for p in places if p['isCapital']]
    capitals.sort(key=lambda p:(p['scalerank'],-p['population'],p['name']))
    capital=capitals[0] if capitals else max(places,key=lambda p:(p['population'],-p['scalerank']))
    selected=[]; used=set()
    def add(p,role,sector):
        k=place_key(p)
        if k in used: return
        used.add(k)
        selected.append({'name':p['name'],'role':role,'sector':sector,'longitude':round(p['lon'],6),'latitude':round(p['lat'],6),'populationReference':p['population'],'admin1':p['admin1'],'sourceFeatureClass':p['featureClass']})
    add(capital,'capital','CAPITAL')

    def significant(p): return p['isAdmin1'] or p['population'] >= 15000
    def best(sector, secondary):
        ux,uy=directions[sector]; winner=None; best_score=-1e9
        for p in places:
            if place_key(p) in used or p is capital: continue
            dx,dy,distance=vec(p); alignment=dx*ux+dy*uy
            if secondary:
                if alignment < .30: continue
                pop=math.log10(max(10,p['population']))
                small_bonus=max(0,6.0-pop)
                big_penalty=1.4 if p['population']>250000 else 0
                score=alignment*5.0+distance*.7+small_bonus*.42-big_penalty
            else:
                if not significant(p) or alignment < .12: continue
                pop=math.log10(max(100,p['population']))
                importance=max(0,min(1,(12-p['scalerank'])/12))
                score=alignment*4.0+distance*.45+pop*.78+importance*1.0+(1.0 if p['isAdmin1'] else 0)
            if score>best_score: winner,best_score=p,score
        return winner
    for sector in ('N','E','S','W'):
        p=best(sector,False)
        if p: add(p,'urban',sector)
    for sector in ('NE','SE','SW','NW'):
        p=best(sector,True)
        if p: add(p,'secondary',sector)
    return selected[:9]

countries={}
for cid in sorted(ids):
    nodes=choose(grouped.get(cid,[]))
    if nodes: countries[cid]=nodes
missing=[{'id':cid,'name':rendered[cid]} for cid in sorted(ids) if cid not in countries]
def capital(cid):
    return next((n['name'] for n in countries.get(cid,[]) if n['role']=='capital'),None)
assert capital('642') in {'Bucharest','Bucuresti'}
assert capital('372') == 'Dublin'
assert all(len(v)<=9 for v in countries.values())
ireland_n=next((n for n in countries['372'] if n['role']=='urban' and n['sector']=='N'),None)
assert ireland_n is None or ireland_n['populationReference'] >= 15000 or 'Admin-1 capital' in ireland_n['sourceFeatureClass']
payload={
    'version':'1.1.0',
    'source':{'name':'Natural Earth 1:10m populated places simple','upstreamCommit':SRC_COMMIT,'license':'Public Domain'},
    'stats':{'renderedCountries':len(ids),'countriesWithRepresentativeNodes':len(countries),'capitalNodes':sum(1 for v in countries.values() for n in v if n['role']=='capital'),'totalRepresentativeNodes':sum(map(len,countries.values())),'maxNodesPerCountry':max(map(len,countries.values()))},
    'coverageGaps':missing,
    'countries':countries,
}
OUT.write_text(json.dumps(payload,ensure_ascii=False,separators=(',',':'))+'\n')
print('STATS',json.dumps(payload['stats'],sort_keys=True))
print('MISSING',json.dumps(missing,ensure_ascii=False))
print('ROMANIA',json.dumps(countries['642'],ensure_ascii=False))
print('IRELAND',json.dumps(countries['372'],ensure_ascii=False))
