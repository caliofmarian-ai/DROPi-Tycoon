from PIL import Image, ImageDraw, ImageFont
import math, os, subprocess

W,H,FPS,DURATION=1280,720,24,42
OUT=os.environ.get('DT23_FILM_OUT','artifacts/dt23/full-target-canon-v1/DROPi_Tycoon_Full_Target_Canon_Film_v1.mp4')
os.makedirs(os.path.dirname(OUT),exist_ok=True)

SKY=(190,224,235); GRASS=(127,182,123); ROAD=(86,95,103); ROAD_L=(122,130,136)
SIDE=(194,191,178); DEEP=(22,45,67); CYAN=(38,188,215); BLUE=(39,116,175)
GREEN=(69,158,99); GOLD=(232,167,57); ORANGE=(223,126,62); CREAM=(235,224,196)
WHITE=(246,248,248); INK=(29,40,49); RIVER=(78,160,191)
FONT='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'; BOLD='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
fc={}
def F(s,b=False):
    k=(s,b)
    if k not in fc: fc[k]=ImageFont.truetype(BOLD if b else FONT,s)
    return fc[k]
def clamp(v,a=0,b=1): return max(a,min(b,v))
def smooth(v): v=clamp(v); return v*v*(3-2*v)
def lerp(a,b,t): return a+(b-a)*t
def mix(a,b,t): return tuple(int(lerp(x,y,t)) for x,y in zip(a,b))
def rr(d,b,r,fill,outline=None,w=1): d.rounded_rectangle(b,radius=r,fill=fill,outline=outline,width=w)
def tc(d,xy,s,font,fill): d.text(xy,s,font=font,fill=fill,anchor='mm')

def iso_box(d,x,y,w,h,dep,top):
    l=mix(top,(0,0,0),.16); r=mix(top,(0,0,0),.28)
    d.polygon([(x-w//2,y),(x,y+h//2),(x,y+h//2+dep),(x-w//2,y+dep)],fill=l)
    d.polygon([(x+w//2,y),(x,y+h//2),(x,y+h//2+dep),(x+w//2,y+dep)],fill=r)
    d.polygon([(x,y-h//2),(x+w//2,y),(x,y+h//2),(x-w//2,y)],fill=top)

def building(d,x,y,s=1,kind='home',accent=BLUE,label=''):
    if kind=='hq': w,h,dep,top=int(150*s),int(86*s),int(85*s),mix(BLUE,WHITE,.22)
    elif kind=='shop': w,h,dep,top=int(125*s),int(72*s),int(62*s),mix(accent,WHITE,.28)
    else: w,h,dep,top=int(110*s),int(65*s),int(56*s),mix(CREAM,accent,.18)
    iso_box(d,x,y,w,h,dep,top); fy=y+h//2+dep//2
    rr(d,(x-25*s,fy-4*s,x-5*s,fy+20*s),4,mix(CYAN,WHITE,.3)); rr(d,(x+7*s,fy-4*s,x+27*s,fy+20*s),4,mix(CYAN,WHITE,.3))
    rr(d,(x-7*s,fy+16*s,x+9*s,fy+44*s),3,mix(DEEP,WHITE,.14))
    if kind=='shop':
        rr(d,(x-44*s,fy-30*s,x+44*s,fy-12*s),7,accent)
        if label: tc(d,(x,fy-21*s),label,F(max(10,int(12*s)),True),WHITE)
    if kind=='hq':
        rr(d,(x-46*s,fy-34*s,x+46*s,fy-12*s),7,CYAN); tc(d,(x,fy-23*s),'DROPi HQ',F(max(10,int(14*s)),True),DEEP)

def tree(d,x,y,s=1):
    d.rectangle((x-4*s,y,x+4*s,y+28*s),fill=(112,82,56)); d.ellipse((x-23*s,y-28*s,x+8*s,y+6*s),fill=(75,150,86)); d.ellipse((x-5*s,y-35*s,x+24*s,y+3*s),fill=(88,169,98))

def person(d,x,y,s=1,shirt=BLUE,carry=False,phase=0):
    leg=math.sin(phase*2*math.pi)*5*s
    d.ellipse((x-13*s,y+30*s,x+13*s,y+39*s),fill=(30,40,40,45))
    d.line((x-6*s,y+15*s,x-9*s-leg,y+34*s),fill=DEEP,width=max(2,int(5*s))); d.line((x+6*s,y+15*s,x+9*s+leg,y+34*s),fill=DEEP,width=max(2,int(5*s)))
    rr(d,(x-12*s,y-6*s,x+12*s,y+19*s),8*s,shirt); d.line((x-9*s,y,x-16*s,y+13*s),fill=(202,155,116),width=max(2,int(5*s))); d.line((x+9*s,y,x+16*s,y+13*s),fill=(202,155,116),width=max(2,int(5*s)))
    d.ellipse((x-9*s,y-24*s,x+9*s,y-6*s),fill=(211,165,125)); d.pieslice((x-9*s,y-26*s,x+9*s,y-8*s),180,360,fill=(72,56,45))
    if carry:
        rr(d,(x+10*s,y+9*s,x+29*s,y+23*s),3*s,(187,135,79),outline=(119,82,45),w=max(1,int(2*s))); d.line((x+19*s,y+9*s,x+19*s,y+23*s),fill=(238,194,95),width=max(1,int(2*s)))

def package(d,x,y,s=1):
    rr(d,(x-15*s,y-12*s,x+15*s,y+12*s),4*s,(186,133,78),outline=(112,75,42),w=max(1,int(2*s))); d.rectangle((x-3*s,y-12*s,x+3*s,y+12*s),fill=(237,193,89))

def road(d,pts,w):
    d.line(pts,fill=ROAD,width=w,joint='curve'); d.line(pts,fill=ROAD_L,width=max(2,w//15))
    for i in range(len(pts)-1):
        x1,y1=pts[i]; x2,y2=pts[i+1]; dist=math.hypot(x2-x1,y2-y1)
        if not dist: continue
        ux,uy=(x2-x1)/dist,(y2-y1)/dist; p=0
        while p<dist:
            q=min(p+18,dist); d.line((x1+ux*p,y1+uy*p,x1+ux*q,y1+uy*q),fill=(218,218,206),width=2); p+=42

def city(d,px=0,py=0):
    d.rectangle((0,0,W,H),fill=SKY); d.polygon([(0,120),(W,50),(W,H),(0,H)],fill=GRASS)
    d.polygon([(930+px,0),(W,0),(W,H),(1040+px,H)],fill=RIVER); d.polygon([(900+px,0),(938+px,0),(1047+px,H),(1009+px,H)],fill=(180,188,175))
    road(d,[(-100+px,560+py),(330+px,390+py),(790+px,450+py),(1100+px,250+py)],76); road(d,[(180+px,720+py),(360+px,440+py),(500+px,150+py)],64); road(d,[(610+px,720+py),(690+px,440+py),(760+px,120+py)],60)
    for x,y in [(210,470),(430,345),(650,415),(820,350),(330,530),(745,510)]: iso_box(d,x+px,y+py,96,34,8,SIDE)
    building(d,180+px,325+py,.82,'home',GREEN); building(d,325+px,275+py,.84,'shop',GREEN,'MARA'); building(d,535+px,330+py,1.05,'hq',BLUE); building(d,740+px,260+py,.9,'home',ORANGE); building(d,830+px,440+py,.8,'shop',GOLD,'BAKERY'); building(d,230+px,610+py,.82,'home',CYAN); building(d,660+px,600+py,.9,'home',GREEN)
    for x,y,s in [(100,450,.75),(270,395,.65),(465,245,.7),(615,250,.65),(840,190,.65),(875,560,.75),(450,580,.7),(150,650,.6)]: tree(d,x+px,y+py,s)
    person(d,465+px,480+py,.68,GREEN); person(d,760+px,525+py,.66,ORANGE)

def badge(d,text,col=CYAN): rr(d,(52,42,330,83),14,DEEP); d.ellipse((66,54,84,72),fill=col); d.text((94,53),text,font=F(16,True),fill=WHITE)
def cap(d,top,bottom=''):
    tw=d.textbbox((0,0),top,font=F(42,True))[2]; rr(d,(56,H-145,92+tw,H-82),18,DEEP); d.text((75,H-132),top,font=F(42,True),fill=WHITE)
    if bottom: d.text((76,H-73),bottom,font=F(20),fill=WHITE)

def phone(d,p,result=False):
    x=lerp(W+50,845,1-(1-clamp(p))**3); y=86; w,h=330,545
    d.rectangle((0,0,W,H),fill=(7,18,28,95)); rr(d,(x,y,x+w,y+h),38,(22,29,36),outline=(70,84,94),w=3); rr(d,(x+15,y+18,x+w-15,y+h-18),28,(240,244,241)); rr(d,(x+120,y+9,x+210,y+22),8,(16,20,24)); d.text((x+32,y+55),'DROPi',font=F(16,True),fill=BLUE)
    if not result:
        d.text((x+32,y+105),'FIRST SHIFT',font=F(15,True),fill=GREEN); d.text((x+32,y+143),'Local delivery',font=F(28,True),fill=INK); d.text((x+32,y+198),'Pickup',font=F(15,True),fill=(90,98,103)); d.text((x+32,y+226),"Mara's Market",font=F(20,True),fill=INK); d.text((x+32,y+276),'Destination',font=F(15,True),fill=(90,98,103)); d.text((x+32,y+304),'Local customer',font=F(20,True),fill=INK); rr(d,(x+28,y+365,x+w-28,y+430),18,BLUE); tc(d,(x+w/2,y+398),'VIEW ROUTE',F(18,True),WHITE)
    else:
        tc(d,(x+w/2,y+130),'DELIVERY COMPLETE',F(23,True),GREEN); d.ellipse((x+130,y+160,x+200,y+230),fill=GREEN); d.line((x+151,y+196,x+166,y+211,x+187,y+179),fill=WHITE,width=6,joint='curve')
        items=[('PERSONAL MONEY','credited',GOLD),('XP','progressed',CYAN),('LOYALTY','increased',GREEN)]; yy=y+275
        for a,b,c in items:
            d.ellipse((x+34,yy-2,x+58,yy+22),fill=c); d.text((x+75,yy-6),a,font=F(15,True),fill=INK); d.text((x+75,yy+17),b,font=F(14),fill=(75,86,92)); yy+=70
        rr(d,(x+28,y+486,x+w-28,y+535),16,DEEP); tc(d,(x+w/2,y+511),'YOUR WORK LEAVES A MARK.',F(14,True),WHITE)

def frame(t):
    im=Image.new('RGB',(W,H),SKY); d=ImageDraw.Draw(im)
    if t<5:
        p=smooth(t/5); city(d,int(lerp(30,-15,p)),int(lerp(20,0,p))); person(d,lerp(480,535,p),lerp(520,470,p),1.05,BLUE,False,t*1.8); badge(d,'BRĂILA · FIRST SHIFT'); cap(d,'START SMALL.','One useful job can become something larger.')
    elif t<9:
        city(d,-10,0); person(d,535,470,1.05); phone(d,(t-5)/.8); badge(d,'PLAYER PHONE · JOB')
    elif t<14:
        p=smooth((t-9)/5); city(d,int(lerp(0,-110,p)),int(lerp(0,20,p))); path=[(360,545),(430,500),(505,475),(585,455)]; z=p*3; i=min(2,int(z)); f=z-i; person(d,lerp(path[i][0],path[i+1][0],f)-110*p,lerp(path[i][1],path[i+1][1],f)+20*p,1.03,BLUE,False,(t-9)*2.5); badge(d,'MOVE THROUGH THE CITY'); cap(d,'YOUR ROUTE.','A living city, readable at a glance.')
    elif t<18:
        d.rectangle((0,0,W,H),fill=mix(DEEP,(53,68,77),.35)); d.polygon([(80,630),(1180,630),(1020,215),(250,215)],fill=(184,187,179)); d.polygon([(250,215),(1020,215),(920,100),(350,100)],fill=(64,77,87)); iso_box(d,640,430,380,120,86,mix(BLUE,WHITE,.18)); rr(d,(480,228,800,350),20,(24,38,48),outline=CYAN,w=3); tc(d,(640,260),'PARCEL OPERATIONS',F(22,True),WHITE); d.text((522,295),'Route ready',font=F(18),fill=(188,219,225)); d.text((522,322),'Local delivery · Walking',font=F(17),fill=(188,219,225)); person(d,735,450,.95,GREEN); person(d,480,500,1.05,BLUE,False,(t-14)*1.5); package(d,640,405,1.2); badge(d,'DROPi HQ · PARCEL OPERATIONS'); cap(d,'TAKE THE JOB.','Work becomes responsibility.')
    elif t<23:
        p=smooth((t-18)/5); city(d,120,45); person(d,lerp(600,440,p),lerp(520,410,p),1.03,BLUE,p>.72,(t-18)*2.2); person(d,395,385,.95,GREEN); badge(d,"MARA'S MARKET · PICKUP"); cap(d,'PICK IT UP.','A merchant is waiting. The parcel is real.')
    elif t<31:
        p=smooth((t-23)/8); px=int(lerp(80,-140,p)); py=int(lerp(35,-15,p)); city(d,px,py); path=[(420,455),(510,500),(635,475),(750,420),(860,360)]; z=p*4; i=min(3,int(z)); f=z-i; person(d,lerp(path[i][0],path[i+1][0],f)+px*.15,lerp(path[i][1],path[i+1][1],f)+py*.15,1.03,BLUE,True,(t-23)*2.8); badge(d,'DELIVERY ROUTE · BRĂILA'); cap(d,'DELIVER.','Your work connects people.')
    elif t<35:
        p=smooth((t-31)/4); city(d,-130,-10); person(d,850,395,.96,ORANGE); person(d,lerp(700,790,p),lerp(470,425,p),1.03,BLUE,True,(t-31)*1.8); badge(d,'CUSTOMER · HANDOFF'); cap(d,'ONE DELIVERY.','One person received what they were waiting for.')
    elif t<39:
        city(d,-120,-10); person(d,790,425,1.03,BLUE); person(d,850,395,.96,ORANGE); phone(d,(t-35)/.7,True); badge(d,'RESULT · EXACT-ONCE SETTLEMENT',GREEN)
    else:
        p=smooth((t-39)/3); city(d,int(lerp(-120,-20,p)),int(lerp(-10,30,p))); d.rectangle((0,0,W,H),fill=(11,28,42,)); tc(d,(W/2,260),'DROPi TYCOON',F(58,True),WHITE); tc(d,(W/2,330),'YOUR WORK LEAVES A MARK.',F(30,True),CYAN); tc(d,(W/2,385),'Start with work. Build capability. Grow from there.',F(21),WHITE); rr(d,(W/2-135,440,W/2+135,494),18,CYAN); tc(d,(W/2,467),'TARGET CANON FILM',F(17,True),DEEP); d.text((W-34,H-24),'CINEMATIC / NON-GAMEPLAY — TARGET CANON',font=F(12,True),fill=WHITE,anchor='rs')
    return im

cmd=['ffmpeg','-y','-loglevel','error','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-','-f','lavfi','-i','anullsrc=channel_layout=stereo:sample_rate=48000','-t',str(DURATION),'-c:v','libx264','-preset','veryfast','-crf','19','-pix_fmt','yuv420p','-c:a','aac','-b:a','96k','-movflags','+faststart','-shortest',OUT]
p=subprocess.Popen(cmd,stdin=subprocess.PIPE)
for i in range(FPS*DURATION): p.stdin.write(frame(i/FPS).tobytes())
p.stdin.close()
if p.wait()!=0: raise SystemExit('ffmpeg failed')
print(OUT)
