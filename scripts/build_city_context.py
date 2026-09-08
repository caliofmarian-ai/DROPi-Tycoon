"""Project retained OSM building footprints into the active game plan, without runtime requests."""
import argparse, hashlib, json, math
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]

def build(config_path):
    config=json.loads(config_path.read_text())
    raw=(ROOT/config['retainedBuildingSource']).read_bytes()
    if hashlib.sha256(raw).hexdigest()!=config['buildingSourceSha256']: raise ValueError('Building source checksum mismatch')
    source=json.loads(raw)
    layout=json.loads((ROOT/'game-web/src/world/brailaLayout.generated.json').read_text())
    anchor=json.loads((ROOT/'game-web/public/data/playable-city-location-v1.json').read_text())
    west,south,east,north=layout['geoBounds']; scale=layout['worldUnitsPerMetre']
    project=lambda p:{'x':round((p[0]-west)*111320*math.cos(math.radians(anchor['latitude']))*scale,1),'y':round((north-p[1])*111320*scale,1)}
    context=[]
    for w in source['ways']:
        points=[project(p) for p in w['coordinates']]
        xs,ys=[p['x'] for p in points],[p['y'] for p in points]
        x,y=(min(xs)+max(xs))/2,(min(ys)+max(ys))/2
        width,height=max(xs)-min(xs),max(ys)-min(ys)
        if min(xs)<20 or min(ys)<20 or max(xs)>layout['width']-20 or max(ys)>layout['height']-20: continue
        if width<5 or height<5 or width*height>180000: continue
        if any(abs(x-b['x'])<(width+b['width'])/2+40 and abs(y-b['y'])<(height+b['height'])/2+40 for b in layout['buildings']): continue
        # Context massing is drawn below road/pavement art. Playable entrances always take priority.
        context.append({'id':'osm:'+w['id'],'x':x,'y':y,'width':width,'height':height,'points':points})
    output={'license':'ODbL-1.0','sourceSha256':config['buildingSourceSha256'],'buildings':context}
    (ROOT/'game-web/src/world/brailaContext.generated.json').write_text(json.dumps(output,separators=(',',':'))+'\n')
    print('Projected',len(context),'context footprints')
if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--config',required=True,type=Path);build(parser.parse_args().config)
