"""Build bounded map artwork from checksum-verified physical geography. Requires Pillow.

python scripts/build_visual_geography.py --source-dir /path/to/downloads
The source directory contains the names in Physical_Geography/SOURCES.json.
No moving upstream is downloaded or accepted implicitly.
"""
import argparse
import hashlib
import json
import pathlib
import zipfile

from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parents[1]


def build(source_dir, vectors_only=False):
    registry = json.loads((ROOT / '04_World/Physical_Geography/SOURCES.json').read_text())
    for name, record in registry['files'].items():
        if hashlib.sha256((source_dir / name).read_bytes()).hexdigest() != record['sha256']:
            raise ValueError(f'Source checksum mismatch: {name}')
    out = ROOT / 'game-web/public/data/physical-geography-v1'
    out.mkdir(parents=True, exist_ok=True)
    features = []
    for name, kind in [('ne_50m_lakes', 'lake'), ('ne_50m_rivers_lake_centerlines', 'river'),
                       ('ne_10m_geography_regions_polys', 'landform')]:
        source = json.loads((source_dir / name).read_text())
        for index, feature in enumerate(source['features']):
            props = {k.lower(): v for k, v in feature['properties'].items()}
            geometry = feature['geometry']
            title = props.get('name_en') or props.get('name')
            if not title:
                continue
            # Physical labels only: do not reinterpret island or continent outlines as mountains.
            if kind == 'landform' and props.get('featurecla') not in (
                    'Range/mtn', 'Plateau', 'Desert', 'Plain', 'Basin', 'Tundra', 'Peninsula'):
                continue
            if geometry['type'] == 'LineString':
                paths = [geometry['coordinates']]
            elif geometry['type'] == 'MultiLineString':
                paths = geometry['coordinates']
            elif geometry['type'] == 'Polygon':
                paths = geometry['coordinates'][:1]
            elif geometry['type'] == 'MultiPolygon':
                paths = [poly[0] for poly in geometry['coordinates']]
            else:
                continue
            paths = [[[round(x, 4), round(y, 4)] for x, y, *_ in path] for path in paths]
            points = [p for path in paths for p in path]
            if not points:
                continue
            west, east = min(p[0] for p in points), max(p[0] for p in points)
            south, north = min(p[1] for p in points), max(p[1] for p in points)
            mid = max(paths, key=len)[len(max(paths, key=len)) // 2]
            features.append({'id': f'{name}:{props.get("ne_id") or index}', 'kind': kind,
                             'name': title, 'class': props.get('featurecla'),
                             'rank': props.get('scalerank', 5),
                             'bounds': [west, south, east, north],
                             'label': mid if kind == 'river' else [(west + east) / 2, (south + north) / 2],
                             'paths': [] if kind == 'landform' else paths})
    (out / 'features.json').write_text(json.dumps({'version': '1.0.0', 'features': features}, separators=(',', ':'), ensure_ascii=False) + '\n')
    admin_source = json.loads((source_dir / 'ne_10m_admin_1_states_provinces').read_text())
    for extract in registry['administrativeExtracts']:
        counties = []
        for feature in admin_source['features']:
            props, geometry = feature['properties'], feature['geometry']
            if props['adm0_a3'] != extract['sourceCode']: continue
            polygons = [geometry['coordinates']] if geometry['type'] == 'Polygon' else geometry['coordinates']
            counties.append({'name': props.get('name_en') or props['name'], 'regionSourceRef': 'geonames:' + str(int(props['gn_id'])),
                'paths': [[[round(x, 5), round(y, 5)] for x, y, *_ in polygon[0]] for polygon in polygons]})
        (out / extract['output']).write_text(json.dumps({'sourceCommit': registry['vectorCommit'],
            'sourceSha256': registry['files']['ne_10m_admin_1_states_provinces']['sha256'], 'license': registry['license'],
            'features': counties}, ensure_ascii=False, separators=(',', ':')) + '\n')
    if vectors_only:
        print('Verified vector layers and administrative extracts'); return
    with zipfile.ZipFile(source_dir / 'NE1_50M_SR.zip') as archive:
        with archive.open('NE1_50M_SR/NE1_50M_SR.tif') as raw:
            relief = Image.open(raw).convert('RGB')
    assert relief.size == (10800, 5400)
    relief.resize((2048, 1024), Image.Resampling.LANCZOS).save(out / 'relief-overview.webp', quality=85, method=6)
    tiles = []
    for row in range(5):
        for col in range(10):
            filename = f'relief-{col}-{row}.webp'
            relief.crop((col * 1080, row * 1080, (col + 1) * 1080, (row + 1) * 1080)).save(out / filename, quality=85, method=6)
            tiles.append({'id': f'{col}-{row}', 'url': f'data/physical-geography-v1/{filename}',
                          'bounds': [col * 36 - 180, 90 - (row + 1) * 36, (col + 1) * 36 - 180, 90 - row * 36]})
    manifest = {'version': '1.0.0', 'projection': 'equirectangular', 'sourceRegistry': '04_World/Physical_Geography/SOURCES.json',
                'overviewUrl': 'data/physical-geography-v1/relief-overview.webp', 'tilePixels': 1080,
                'maximumActiveTiles': 6, 'tiles': tiles,
                'counts': {kind: sum(f['kind'] == kind for f in features) for kind in ['river', 'lake', 'landform']}}
    (out / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
    print(json.dumps(manifest['counts']), 'tiles=', len(tiles))


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--source-dir', required=True, type=pathlib.Path)
    parser.add_argument('--vectors-only', action='store_true')
    args = parser.parse_args()
    build(args.source_dir, args.vectors_only)
