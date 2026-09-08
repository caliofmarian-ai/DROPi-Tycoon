"""Map-inspired playable layout: retained OSM centerlines + governed gameplay entities.

node scripts/export_legacy_city.cjs /tmp/city-seed.json
python scripts/build_map_inspired_city.py --config 04_World/City_Plans/BRAILA_CONFIG.json --seed /tmp/city-seed.json

No network, random coordinates or country-specific generation rules. OSM-derived
street data is distributed under ODbL; the generated business placement is game fiction.
"""
import argparse
from collections import defaultdict, deque
import hashlib
import heapq
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def distance(point, a, b):
    dx, dy = b['x'] - a['x'], b['y'] - a['y']
    t = max(0, min(1, ((point['x'] - a['x']) * dx + (point['y'] - a['y']) * dy) / (dx * dx + dy * dy or 1)))
    return math.hypot(point['x'] - a['x'] - t * dx, point['y'] - a['y'] - t * dy)


def build(config_path, seed_path):
    config = json.loads(config_path.read_text())
    raw = (ROOT / config['retainedStreetSource']).read_bytes()
    assert hashlib.sha256(raw).hexdigest() == config['streetSourceSha256']
    source, seed = json.loads(raw), json.loads(seed_path.read_text())
    regional = json.loads((ROOT / config['localityCatalog']).read_text())
    unit = next(u for u in regional['units'] if u['representativeLocality']['localityId'] == config['localityId'])
    place = unit['representativeLocality']
    west, south, east, north = source['bounds']
    # View margin includes the river beside the retained street extent. This is a camera extent.
    west -= .002; south -= .002; east += .014; north += .002
    units_per_metre = 2
    metres_lon = 111320 * math.cos(math.radians(place['latitude']))
    project = lambda p: {'x': round((p[0] - west) * metres_lon * units_per_metre, 1), 'y': round((north - p[1]) * 111320 * units_per_metre, 1)}
    width, height = math.ceil((east - west) * metres_lon * units_per_metre), math.ceil((north - south) * 111320 * units_per_metre)
    in_bounds = lambda p: 60 <= p['x'] <= width - 60 and 60 <= p['y'] <= height - 60
    roads = []
    for way in source['ways']:
        kind = way['tags'].get('highway')
        if kind not in ['primary', 'secondary', 'tertiary', 'primary_link', 'residential', 'unclassified', 'living_street', 'pedestrian']:
            continue
        points = [project(p) for p in way['coordinates']]
        # Keep contiguous in-bounds source runs; never connect across a missing/outside interval.
        runs, run = [], []
        for p in points:
            if in_bounds(p): run.append(p)
            else:
                if len(run) > 1: runs.append(run)
                run = []
        if len(run) > 1: runs.append(run)
        for i, line in enumerate(runs):
            road_width = 50 if kind.startswith('primary') else 42 if kind in ['secondary', 'tertiary'] else 32
            xs, ys = [p['x'] for p in line], [p['y'] for p in line]
            roads.append({'id': f'osm:{way["id"]}:{i}', 'sourceWayId': way['id'], 'name': way['tags'].get('name', ''),
                          'x': (min(xs) + max(xs)) / 2, 'y': (min(ys) + max(ys)) / 2,
                          'width': max(xs) - min(xs) + road_width, 'height': max(ys) - min(ys) + road_width,
                          'roadWidth': road_width, 'centerline': line})
    # Retain the connected street component. Shared source vertices encode actual junctions.
    memberships = defaultdict(list)
    for i, road in enumerate(roads):
        for p in road['centerline']: memberships[(p['x'], p['y'])].append(i)
    adjacency = defaultdict(set)
    for ids in memberships.values():
        for i in ids: adjacency[i].update(ids)
    remaining, components = set(range(len(roads))), []
    while remaining:
        seen, queue = set(), deque([min(remaining)])
        while queue:
            i = queue.popleft()
            if i in seen: continue
            seen.add(i); queue.extend(adjacency[i] - seen)
        remaining -= seen; components.append(seen)
    component = max(components, key=len)
    roads = [road for i, road in enumerate(roads) if i in component]
    print('Connected source roads:', len(roads), flush=True)
    segments = [(road, a, b) for road in roads for a, b in zip(road['centerline'], road['centerline'][1:]) if math.hypot(a['x']-b['x'], a['y']-b['y']) > .1]
    candidates = []
    for road, a, b in segments:
        length = math.hypot(b['x']-a['x'], b['y']-a['y'])
        if abs(b['x']-a['x']) < abs(b['y']-a['y']): continue
        for i in range(max(1, int(length / 35))):
            t = (i + .5) / max(1, int(length / 35))
            candidates.append((road, {'x': round(a['x']+(b['x']-a['x'])*t, 1), 'y': round(a['y']+(b['y']-a['y'])*t, 1)}, (a, b)))
    point_key = lambda p: (p['x'], p['y'])
    graph = defaultdict(list)
    for road, a, b in segments:
        length = math.hypot(a['x']-b['x'], a['y']-b['y'])
        graph[point_key(a)].append((point_key(b), length)); graph[point_key(b)].append((point_key(a), length))
    def nearby_distances(anchor):
        road, a, b = min((seg for seg in segments if seg[0]['id']==anchor['roadId']), key=lambda seg: distance(anchor,seg[1],seg[2]))
        dist = {point_key(p): math.hypot(p['x']-anchor['x'],p['y']-anchor['y']) for p in [a,b]}
        queue = [(d,k) for k,d in dist.items()]; heapq.heapify(queue)
        while queue:
            d,k = heapq.heappop(queue)
            if d != dist[k]: continue
            for other, length in graph[k]:
                nd = d + length
                if nd < dist.get(other, float('inf')) and nd <= 1800:
                    dist[other]=nd; heapq.heappush(queue,(nd,other))
        return dist, (a,b)
    zones = []
    for original in seed['zones']:
        anchor = config['zoneStreetAnchors'][original['id']]
        matching = [r for r in roads if r['name'] == anchor['street']]
        if not matching: raise ValueError(f'Missing source street: {anchor["street"]}')
        pts = [p for r in matching for p in r['centerline']]
        x, y = sum(p['x'] for p in pts)/len(pts), sum(p['y'] for p in pts)/len(pts)
        zones.append({**original, 'label': anchor['label'], 'x': max(20, min(width-900, x-430)),
                      'y': max(20, min(height-900, y-430)), 'width': 860, 'height': 860})
    built, frontages = [], {}
    # Gameplay-critical entities claim safe frontages first.
    route_ids = {r['buildingId'] for r in seed['routes']} | {'main-hq', 'business-1'}
    priority = {id:i for i,id in enumerate(config.get('frontagePlacementPriority', []))}
    buildings = sorted(seed['buildings'], key=lambda b: (priority.get(b['id'], 100), b['id'] not in route_ids, b['id']))
    for item in buildings:
        zone = next(z for z in zones if z['id'] == item['zoneId'])
        target = {'x': zone['x']+430, 'y': zone['y']+430}
        placed = False
        near = config.get('frontageNearBuilding', {}).get(item['id'])
        distances, anchor_segment = nearby_distances(frontages[near]) if near else (None,None)
        def candidate_distance(candidate):
            road, point, ends = candidate
            if distances is None: return math.hypot(point['x']-target['x'],point['y']-target['y'])
            if ends == anchor_segment: return math.hypot(point['x']-frontages[near]['x'],point['y']-frontages[near]['y'])
            return min(distances.get(point_key(p),float('inf')) + math.hypot(p['x']-point['x'],p['y']-point['y']) for p in ends)
        for road, point, ends in sorted(candidates, key=candidate_distance):
            if distances is not None and candidate_distance((road,point,ends)) > 1700: continue
            for side in [-1, 1]:
                footprint_scale = config.get('buildingFootprintScale', {}).get(item['id'], 1)
                w, h = round(item['width'] * footprint_scale), round(item['height'] * footprint_scale)
                a, b = ends
                length = math.hypot(b['x']-a['x'], b['y']-a['y'])
                sine, cosine = abs(b['y']-a['y']) / length, abs(b['x']-a['x']) / length
                frontage_depth = math.ceil((road['roadWidth']/2 + 12 + w/2 * sine) / cosine)
                if frontage_depth > 96: continue
                x, y = point['x'], point['y'] + side * (h/2 + frontage_depth)
                if x-w/2<20 or x+w/2>width-20 or y-h/2<20 or y+h/2>height-20: continue
                if any(abs(x-b['x']) < (w+b['width'])/2+12 and abs(y-b['y']) < (h+b['height'])/2+12 for b in built): continue
                probes = [{'x':x+dx,'y':y+dy} for dx in [-w/2,0,w/2] for dy in [-h/2,0,h/2]]
                if any(min(distance(p,a,b) for p in probes) < r['roadWidth']/2+10 for r,a,b in segments
                       if abs(r['x']-x) < (r['width']+w)/2+15 and abs(r['y']-y) < (r['height']+h)/2+15): continue
                facing = 'up' if side>0 else 'down'
                built.append({**item,'width':w,'height':h,'x':x,'y':round(y,1),'entranceFacing':facing,'door':{'x':x,'y':round(y-side*h/2,1)}})
                frontages[item['id']]={'x':point['x'],'y':point['y'],'roadId':road['id']}
                placed=True; break
            if placed: break
        if not placed: raise ValueError(f'No collision-free street frontage for {item["id"]}; placed={len(built)}')
    routes = [{**r, **frontages[r['buildingId']]} for r in seed['routes']]
    water = [{'id': 'osm:'+w['id'], 'name': w['tags'].get('name',''), 'kind': w['tags'].get('waterway') or 'park',
              'points': [project(p) for p in w['coordinates']]} for w in source['ways']
             if w['tags'].get('waterway') == 'river' or w['tags'].get('leisure') == 'park']
    layout = {'version':'1.0.0','cityId':config['cityId'],'name':config['name'],'width':width,'height':height,'worldUnitsPerMetre':units_per_metre,
              'geoBounds':[west,south,east,north], 'streetsLicense': source['license'], 'streetSourceSha256': config['streetSourceSha256'],
              'roads':roads,'zones':zones,'buildings':sorted(built,key=lambda b:b['id']),'routes':routes,
              'playerStart':frontages['main-hq'], 'marketplace':frontages['business-1'], 'landscape':water}
    out = ROOT / 'game-web/src/world/brailaLayout.generated.json'
    out.write_text(json.dumps(layout,ensure_ascii=False,separators=(',',':'))+'\n')
    anchor = {k: config[k] for k in ['cityId','name','countryId','countryName','continent','localityId','countySourceRef','regionName','regionCountyNames']}
    anchor.update({'latitude':place['latitude'],'longitude':place['longitude'],'sourceRef':place['sourceRef'],
                   'geoBounds':layout['geoBounds'],'width':width,'height':height,'sourceCatalog':config['localityCatalog']})
    (ROOT / 'game-web/public/data/playable-city-location-v1.json').write_text(json.dumps(anchor,ensure_ascii=False,indent=2)+'\n')
    print('PASS',len(roads),'connected streets;',len(built),'safe buildings;',len(routes),'delivery locations;',width,'x',height)


if __name__ == '__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--config',required=True,type=Path)
    parser.add_argument('--seed',required=True,type=Path)
    args=parser.parse_args()
    build(args.config,args.seed)
