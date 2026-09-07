#!/usr/bin/env python3
"""Extract governed Batch 001 review candidates from approved DROPi Tycoon boards.

This tool creates review/selection thumbnails only. Output is CANDIDATE state and must
not be treated as production-ready runtime art. Exact runtime derivatives are produced
later from approved sources according to WORLD_ASSET_BIBLE.md.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import shutil
from pathlib import Path

import numpy as np
from PIL import Image

HUMAN_BOARD = "human-diversity-seed.webp"
PRODUCT_BOARD = "products-cargo-seed.webp"
BUILDING_BOARD = "building-company-foundations.webp"

HUMAN_ROWS = [
    ["construction_male","construction_female","courier_male","delivery_rider_female","warehouse_worker_male","mechanic_male","mechanic_female","farmer_male","farmer_female","chef_male","chef_female","doctor_male","medical_assistant_female","nurse_female","paramedic_female","police_male","police_female","security_officer"],
    ["businessman","businesswoman","office_worker_male","office_worker_female","entrepreneur_male","it_specialist_female","call_center_operator_female","manager_male","manager_female","teacher_female","student_male","student_female","tourist_male","tourist_female","senior_male","senior_female","citizen_male","citizen_female"],
    ["merchant_male","seller_female","cashier_female","waiter_male","waiter_female","airport_ground_staff_male","cabin_crew_female","pilot_male","rail_staff_male","rail_agent_female","port_worker_male","mariner_male","mariner_female","fisher_male","fisher_female","diver_male","harbor_specialist_female","logistics_specialist_male"],
    ["industrial_worker_male","industrial_worker_female","engineer_male","engineer_female","architect_male","architect_female","urbanist_male","environment_specialist_female","firefighter_male","firefighter_female","sanitation_worker_male","recycling_worker_female","driver_male","driver_female","food_inspector_female","food_inspector_male","researcher_male","researcher_female"],
]
HUMAN_Y = [(82,273),(306,495),(529,692),(725,891)]

BUILDING_NAMES = [
    "small_house","apartment_building","townhouses","grocery_store","supermarket","bakery","coffee_shop","restaurant",
    "pharmacy","electronics_store","furniture_store","clothing_store","hardware_store","pet_store","gas_station","car_service",
    "clinic","hospital","school","police_station","fire_station","post_office","bank","city_hall",
    "office_building","tech_company","startup_hub","courier_depot","cold_chain_depot","warehouse","logistics_hub","factory",
    "construction_supplier","farm","greenhouse","food_processing_plant","recycling_plant","water_treatment","power_plant","telecom_tower",
]
BUILDING_Y = [77,248,419,590,761,931]

PRODUCT_PANELS = [
    ("fresh_produce",(8,79,833,219),10),("bakery_staples",(837,79,1664,219),10),
    ("dairy_eggs",(8,228,480,372),6),("beverages",(486,228,959,372),7),("packaged_food",(965,228,1664,372),9),
    ("chilled_meat_fish",(8,380,501,524),6),("household",(506,380,900,524),7),("clothing_footwear",(906,380,1263,524),6),("electronics_it",(1268,380,1664,524),5),
    ("medical",(8,532,403,671),6),("tools",(408,532,807,671),7),("construction_materials",(812,532,1255,671),6),("industrial_parts",(1261,532,1664,671),6),
    ("agriculture_inputs",(8,679,402,817),6),("packaging_pallets",(407,679,845,817),6),("barrels_sacks",(850,679,1257,817),6),("cargo_containers",(1262,679,1664,817),4),
    ("office_products",(8,824,406,937),7),("furniture_decor",(412,824,846,937),7),("parcels_cargo",(851,824,1255,937),5),("special_cargo",(1260,824,1664,937),4),
]


def clean_alpha(im: Image.Image, threshold: int = 247) -> Image.Image:
    arr = np.array(im.convert("RGBA"), dtype=np.uint8)
    rgb = arr[:, :, :3]
    mx = rgb.max(axis=2)
    alpha = arr[:, :, 3].astype(np.int16)
    hard = (rgb[:, :, 0] > threshold) & (rgb[:, :, 1] > threshold) & (rgb[:, :, 2] > threshold)
    soft = (rgb[:, :, 0] > 238) & (rgb[:, :, 1] > 238) & (rgb[:, :, 2] > 238) & (~hard)
    alpha[hard] = 0
    alpha[soft] = np.minimum(alpha[soft], np.clip((255 - mx[soft].astype(np.int16)) * 15, 0, 255))
    arr[:, :, 3] = alpha.astype(np.uint8)
    return Image.fromarray(arr, "RGBA")


def fit(im: Image.Image, size: tuple[int,int], pad: int = 3) -> Image.Image:
    bbox = im.getchannel("A").getbbox()
    if bbox:
        l,t,r,b = bbox
        im = im.crop((max(0,l-pad),max(0,t-pad),min(im.width,r+pad),min(im.height,b+pad)))
    w,h = size
    scale = min((w-2*pad)/max(1,im.width),(h-2*pad)/max(1,im.height))
    nw,nh = max(1,round(im.width*scale)),max(1,round(im.height*scale))
    im = im.resize((nw,nh),Image.Resampling.LANCZOS)
    out = Image.new("RGBA",size,(255,255,255,0))
    out.alpha_composite(im,((w-nw)//2,(h-nh)//2))
    return out


def save(im: Image.Image, path: Path, quality: int) -> None:
    path.parent.mkdir(parents=True,exist_ok=True)
    im.save(path,"WEBP",quality=quality,method=2,lossless=False)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--sources",type=Path,required=True,help="Directory containing approved source boards")
    ap.add_argument("--out",type=Path,required=True)
    args = ap.parse_args()
    if args.out.exists(): shutil.rmtree(args.out)
    for d in ("humans","buildings","products"): (args.out/d).mkdir(parents=True,exist_ok=True)

    assets=[]
    human=Image.open(args.sources/HUMAN_BOARD)
    for r,(y0,y1) in enumerate(HUMAN_Y):
        for c,name in enumerate(HUMAN_ROWS[r]):
            x0=round(c*human.width/18); x1=round((c+1)*human.width/18)
            im=fit(clean_alpha(human.crop((x0,y0,x1,y1))),(96,128),3)
            idx=r*18+c+1
            rel=Path("humans")/f"human_{idx:03d}_{name}.webp"
            save(im,args.out/rel,74)
            assets.append({"id":f"HUM-{idx:03d}","family":"human","name":name,"file":rel.as_posix(),"source":"SRC-HUMAN-001","state":"CANDIDATE","review_size":"96x128"})

    building=Image.open(args.sources/BUILDING_BOARD)
    for r in range(5):
        for c in range(8):
            idx=r*8+c
            x0=round(c*building.width/8); x1=round((c+1)*building.width/8)
            im=fit(clean_alpha(building.crop((x0+4,BUILDING_Y[r]+28,x1-4,BUILDING_Y[r+1]-7))),(160,128),4)
            name=BUILDING_NAMES[idx]
            rel=Path("buildings")/f"building_{idx+1:03d}_{name}.webp"
            save(im,args.out/rel,76)
            assets.append({"id":f"BLD-{idx+1:03d}","family":"building","name":name,"file":rel.as_posix(),"source":"SRC-BUILDING-001","state":"CANDIDATE","review_size":"160x128"})

    product=Image.open(args.sources/PRODUCT_BOARD)
    pid=0
    for category,(x0,y0,x1,y1),count in PRODUCT_PANELS:
        oy0,oy1=y0+31,max(y0+51,y1-22)
        for i in range(count):
            pid+=1
            ix0=round(x0+i*(x1-x0)/count)+2; ix1=round(x0+(i+1)*(x1-x0)/count)-2
            im=fit(clean_alpha(product.crop((ix0,oy0,ix1,oy1))),(96,96),4)
            name=f"{category}_{i+1:02d}"
            rel=Path("products")/category/f"product_{pid:03d}_{name}.webp"
            save(im,args.out/rel,74)
            assets.append({"id":f"PRD-{pid:03d}","family":"product","category":category,"name":name,"file":rel.as_posix(),"source":"SRC-PRODUCT-001","state":"CANDIDATE","review_size":"96x96"})

    manifest={"version":"1.0.0","status":"CANDIDATE","counts":{"humans":72,"buildings":40,"products":pid,"total":112+pid},"assets":assets}
    raw=json.dumps(manifest,indent=2,ensure_ascii=False)+"\n"
    (args.out/"manifest.json").write_text(raw,encoding="utf-8")
    (args.out/"manifest.sha256").write_text(hashlib.sha256(raw.encode()).hexdigest()+"  manifest.json\n",encoding="utf-8")
    print(json.dumps(manifest["counts"]))


if __name__ == "__main__":
    main()
