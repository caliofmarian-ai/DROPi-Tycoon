"""Geometry review figure from the generated plan; not a Phaser/runtime screenshot. Requires matplotlib."""
import json
from pathlib import Path
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.collections import PolyCollection, LineCollection
ROOT=Path(__file__).resolve().parents[1]
layout=json.loads((ROOT/'game-web/src/world/brailaLayout.generated.json').read_text())
context=json.loads((ROOT/'game-web/src/world/brailaContext.generated.json').read_text())
fig,ax=plt.subplots(figsize=(12,10),facecolor='#073354')
ax.set_facecolor('#bdd293')
ax.set_xlim(0,layout['width']);ax.set_ylim(layout['height'],0);ax.set_aspect('equal')
points=lambda line:[(p['x'],p['y']) for p in line]
world_to_pt=12*72*.90/layout['width']
for f in layout['landscape']:
    if f['kind']=='river':
        ax.add_collection(LineCollection([points(f['points'])],colors='#47acc7',linewidths=820*world_to_pt))
    else:
        ax.add_collection(PolyCollection([points(f['points'])],facecolors='#81b375',edgecolors='none'))
ax.add_collection(PolyCollection([points(b['points']) for b in context['buildings']],facecolors=['#c98862','#a56f58','#cab394','#d9bc90','#9caca3'],edgecolors='#8b775d',linewidths=.11))
roads=[points(r['centerline']) for r in layout['roads']]
ax.add_collection(LineCollection(roads,colors='#e9dbc0',linewidths=[(r['roadWidth']+32)*world_to_pt for r in layout['roads']]))
ax.add_collection(LineCollection(roads,colors='#41657b',linewidths=[r['roadWidth']*world_to_pt for r in layout['roads']]))
for b in layout['buildings']:
    x,y,w,h=b['x'],b['y'],b['width'],b['height']
    color='#ffc650' if b['kind']=='hq' else '#ecd9ad'
    ax.add_patch(plt.Rectangle((x-w/2,y-h/2),w,h,facecolor=color,edgecolor='#725246',linewidth=.7))
start=layout['playerStart'];ax.scatter([start['x']],[start['y']],s=75,c='#ffc650',edgecolors='#073354',zorder=6)
ax.annotate('HQ · eroul', (start['x'],start['y']),xytext=(24,-26),textcoords='offset points',color='#073354',weight='bold',fontsize=10,bbox={'boxstyle':'round,pad=.3','fc':'#ffdc7c','ec':'none'},arrowprops={'arrowstyle':'-','color':'#073354'})
ax.text(.98,.93,'N ↑',transform=ax.transAxes,ha='right',color='#073354',weight='bold',fontsize=12)
ax.text(.99,.04,'DUNĂREA',transform=ax.transAxes,ha='right',color='#075878',weight='bold',fontsize=12)
bar=500*layout['worldUnitsPerMetre'];x,y=350,layout['height']-340
ax.plot([x,x+bar],[y,y],color='#073354',lw=3)
ax.text(x+bar/2,y-70,'500 m în proiecția sursei',ha='center',color='#073354',fontsize=8)
ax.set_xticks([]);ax.set_yticks([])
for spine in ax.spines.values():spine.set_visible(False)
fig.suptitle('BRĂILA · PLANUL ORAȘULUI',fontsize=21,fontweight='bold',color='#f6d186',y=.97)
fig.text(.5,.923,'Trasee și volumetrie din harta reală · clădiri jucabile adaptate stilului DROPi',ha='center',fontsize=10,color='white')
fig.text(.5,.045,'Verificare geometrică a planului generat — nu captură din joc.\n© OpenStreetMap contributors · ODbL 1.0 · surse și transformări incluse în repository',ha='center',fontsize=9,color='#cae8ed',linespacing=1.6)
fig.subplots_adjust(left=.04,right=.96,bottom=.095,top=.90)
out=ROOT/'09_Development/AI_Reports/Assets/braila-plan-535.png';out.parent.mkdir(parents=True,exist_ok=True)
fig.savefig(out,dpi=145,facecolor=fig.get_facecolor())
print(out)
