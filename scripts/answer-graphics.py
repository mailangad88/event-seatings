# Regenerates the infographics in public/answers/. Run: python3 scripts/answer-graphics.py public/answers
import sys, os
out = sys.argv[1]
BG="#1a1713"; INK="#efe4cf"; MUTED="#a89d87"; GOLD="#c9a96a"; LINE="#3a3024"; SOFT="#2b2318"
SERIF="Cormorant Garamond, Georgia, 'Times New Roman', serif"
SANS="Jost, 'Helvetica Neue', Arial, sans-serif"
def esc(t): return t.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;")
def svg(w,h,title,body):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" role="img" aria-labelledby="t"><title id="t">{esc(title)}</title>
<rect width="{w}" height="{h}" fill="{BG}"/><rect x="12" y="12" width="{w-24}" height="{h-24}" fill="none" stroke="{GOLD}" stroke-opacity=".45"/>
{body}</svg>'''
def text(x,y,t,size=18,fill=INK,font=SANS,anchor="start",weight=400,ls=0,italic=False):
    st=' font-style="italic"' if italic else ''
    return f'<text x="{x}" y="{y}" font-family="{font}" font-size="{size}" fill="{fill}" text-anchor="{anchor}" font-weight="{weight}" letter-spacing="{ls}"{st}>{esc(t)}</text>'
def eyebrow(x,y,t,anchor="start"): return text(x,y,t.upper(),13,GOLD,SANS,anchor,500,3)
def chair(x,y,s=1,c=GOLD):
    # tiny chair icon, origin at bottom-left
    return (f'<g transform="translate({x},{y}) scale({s})" fill="none" stroke="{c}" stroke-width="2.2" stroke-linecap="round">'
            '<path d="M4 -34 V0 M22 -34 V0 M4 -16 H24 M24 -16 V0 M4 -34 H22 M4 -26 H22"/></g>')
def write(name,content):
    open(os.path.join(out,name),"w").write(content)

# 1. Chair count formula
b=[eyebrow(600,70,"How to count chairs","middle"),
   text(600,122,"One chair per guest is only the start",40,INK,SERIF,"middle",300)]
boxes=[("Guests","Confirmed RSVPs"),("+ Vendors","Who sit to eat"),("+ Buffer","Late RSVPs, a few %"),("= Reception","Chairs to order")]
for i,(h,s) in enumerate(boxes):
    x=70+i*275
    fill=SOFT if i<3 else GOLD
    b.append(f'<rect x="{x}" y="170" width="245" height="150" fill="{fill}" stroke="{GOLD}" stroke-opacity=".6"/>')
    tc= "#0a0806" if i==3 else INK
    b.append(text(x+122,240,h,30,tc,SERIF,"middle",400))
    b.append(text(x+122,278,s,16,"#0a0806" if i==3 else MUTED,SANS,"middle"))
rows=[("Ceremony","Seat everyone, or flip reception chairs during cocktail hour"),
      ("Cocktail hour","Seats for a portion of guests, older relatives first"),
      ("Head table","One statement pair or a row for the wedding party")]
for i,(h,s) in enumerate(rows):
    y=390+i*62
    b.append(chair(80,y+8,0.8))
    b.append(text(120,y,h.upper(),14,GOLD,SANS,"start",500,2.5))
    b.append(text(330,y,s,19,INK))
    b.append(f'<line x1="70" y1="{y+22}" x2="1130" y2="{y+22}" stroke="{LINE}"/>')
b.append(text(600,612,"Free planner with exact counts at /seating-planner",15,MUTED,SANS,"middle",400,1))
write("chair-count-formula.svg",svg(1200,650,"How to count event chairs: guests plus vendors plus a buffer equals reception chairs, with separate counts for ceremony, cocktail hour and head table","\n".join(b)))

# 2. Chicago seasons
b=[eyebrow(600,70,"Chicago event seating by season","middle"),
   text(600,122,"Plan the chairs around the weather",40,INK,SERIF,"middle",300)]
seasons=[("Winter","Dec – Mar",["Indoor or heated tent","Padded or velvet seats","Salt and slush at load-in","Mats at the entrance"]),
         ("Spring","Apr – May",["Rain plan on hold","Soft ground on lawns","Wipe-clean finishes","Cool evenings"]),
         ("Summer","Jun – Aug",["Shade for ceremonies","Level chairs on grass","Light colors stay cooler","Peak dates book early"]),
         ("Fall","Sep – Nov",["Wind off the lake","Throws on chair backs","Earlier sunsets","Second peak season"])]
for i,(n,m,items) in enumerate(seasons):
    x=60+i*275
    b.append(f'<rect x="{x}" y="165" width="255" height="380" fill="{SOFT}" stroke="{GOLD}" stroke-opacity=".5"/>')
    b.append(text(x+127,225,n,34,INK,SERIF,"middle",400))
    b.append(text(x+127,255,m.upper(),13,GOLD,SANS,"middle",500,2.5))
    b.append(f'<line x1="{x+60}" y1="277" x2="{x+195}" y2="277" stroke="{GOLD}" stroke-opacity=".6"/>')
    for j,it in enumerate(items):
        b.append(f'<circle cx="{x+28}" cy="{318+j*56}" r="3" fill="{GOLD}"/>')
        b.append(text(x+42,324+j*56,it,17,INK))
b.append(text(600,600,"General planning guidance. Always confirm your venue's weather and tent rules.",15,MUTED,SANS,"middle"))
write("chicago-seasons-seating.svg",svg(1200,640,"Chicago event seating by season: winter, spring, summer and fall planning notes","\n".join(b)))

# 3. Venue load-in checklist
b=[eyebrow(600,70,"Venue rules to ask about","middle"),
   text(600,122,"What Chicago venues usually want from a rental company",36,INK,SERIF,"middle",300)]
steps=[("1","Insurance","Certificate of insurance (COI) naming the venue"),
       ("2","Access","Loading dock, freight elevator and parking for the truck"),
       ("3","Timing","Load-in and load-out windows, often tight"),
       ("4","Floors","Protection for wood floors, carpet or lawn"),
       ("5","Strike","When chairs must be stacked and gone")]
for i,(n,h,s) in enumerate(steps):
    y=185+i*82
    b.append(f'<circle cx="110" cy="{y+20}" r="26" fill="none" stroke="{GOLD}"/>')
    b.append(text(110,y+30,n,28,GOLD,SERIF,"middle"))
    if i<4: b.append(f'<line x1="110" y1="{y+46}" x2="110" y2="{y+76}" stroke="{GOLD}" stroke-opacity=".5"/>')
    b.append(text(170,y+14,h.upper(),14,GOLD,SANS,"start",500,2.5))
    b.append(text(170,y+42,s,22,INK))
b.append(text(600,618,"Ask your venue coordinator for their vendor packet before you book rentals.",15,MUTED,SANS,"middle"))
write("venue-load-in-checklist.svg",svg(1200,660,"Five venue rules to ask about: insurance, access, timing, floors and strike","\n".join(b)))

# 4. Booking timeline
b=[eyebrow(600,70,"When to book event chairs","middle"),
   text(600,122,"The earlier the date, the more styles you can choose from",36,INK,SERIF,"middle",300)]
pts=[("9–12 mo","Peak Saturdays","June–October weddings"),("4–6 mo","Most events","Pick styles, hold a quote"),
     ("6–8 wk","Final count","Confirm guests and layout"),("1–2 wk","Last minute","Classic styles, ask fast")]
b.append(f'<line x1="120" y1="260" x2="1080" y2="260" stroke="{GOLD}" stroke-width="2"/>')
for i,(t,h,s) in enumerate(pts):
    x=180+i*280
    b.append(f'<circle cx="{x}" cy="260" r="12" fill="{GOLD if i==0 else BG}" stroke="{GOLD}" stroke-width="2"/>')
    b.append(text(x,225,t,30,INK,SERIF,"middle"))
    b.append(text(x,310,h.upper(),14,GOLD,SANS,"middle",500,2.5))
    b.append(text(x,342,s,17,MUTED,SANS,"middle"))
b.append(text(600,420,"Typical planning guidance, not a guarantee. Availability depends on your date.",15,MUTED,SANS,"middle"))
write("booking-timeline.svg",svg(1200,470,"When to book event chairs: 9 to 12 months for peak Saturdays, 4 to 6 months for most events, final count 6 to 8 weeks out, last minute 1 to 2 weeks","\n".join(b)))

# 5. Cost ladder (our catalog estimates) for 150 guests
b=[eyebrow(600,70,"What 150 chairs can cost","middle"),
   text(600,122,"Per-chair price times guests, before delivery and setup",36,INK,SERIF,"middle",300)]
tiers=[("Teak garden folding",5,7),("Cross-back",8,11),("Bentwood bistro",9,12),("Ghost",10,14),("Velvet dining",18,25),("Louis medallion",20,30)]
maxv=30*150; x0=330; wbar=640
for i,(n,lo,hi) in enumerate(tiers):
    y=180+i*66
    b.append(text(x0-20,y+26,n,20,INK,SANS,"end"))
    b.append(f'<rect x="{x0}" y="{y+6}" width="{wbar}" height="30" fill="{SOFT}"/>')
    b.append(f'<rect x="{x0}" y="{y+6}" width="{wbar*lo*150/maxv:.0f}" height="30" fill="{GOLD}"/>')
    b.append(f'<rect x="{x0+wbar*lo*150/maxv:.0f}" y="{y+6}" width="{wbar*(hi-lo)*150/maxv:.0f}" height="30" fill="{GOLD}" fill-opacity=".45"/>')
    b.append(text(x0+wbar*hi*150/maxv+12,y+28,f"${lo*150:,}–${hi*150:,}",18,MUTED))
b.append(text(600,600,"Based on our estimated per-chair ranges for the 2027 season. Final quotes are itemized.",15,MUTED,SANS,"middle"))
write("chair-cost-150-guests.svg",svg(1200,640,"Estimated cost of 150 rental chairs by style, from teak garden folding to Louis medallion","\n".join(b)))

# 6. Service area schematic
b=[eyebrow(600,70,"Where we deliver","middle"),
   text(600,122,"From the Fox Valley to the city",40,INK,SERIF,"middle",300)]
cx,cy=600,400
for r,lab in [(70,"Home base"),(165,"Fox Valley & west suburbs"),(260,"Chicago & beyond")]:
    b.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{GOLD}" stroke-opacity=".45" stroke-dasharray="4 6"/>')
b.append(f'<circle cx="{cx}" cy="{cy}" r="8" fill="{GOLD}"/>')
b.append(text(cx,cy-22,"St. Charles",20,INK,SERIF,"middle"))
places=[("Geneva",90,75),("Batavia",150,105),("Elgin",115,-60),("Aurora",245,92),("Naperville",215,50),("Wheaton",195,10),("Schaumburg",215,-40),("Oak Brook",255,22),("Chicago",300,5)]
import math
for n,r,ang in places:
    a=math.radians(ang); x=cx+r*math.cos(a)*1.0; y=cy+r*math.sin(a)*0.75
    if n=="Chicago": x=cx+330; y=cy-10
    b.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="5" fill="{INK}"/>')
    b.append(text(x+10,y+5,n,17,INK))
b.append(text(140,240,"Schematic, not to scale",14,MUTED,SANS,"start",400,1,True))
write("service-area.svg",svg(1200,720,"Schematic of the delivery area from St. Charles across the Fox Valley, west suburbs and Chicago","\n".join(b)))
# 7. Quinceanera seating plan (schematic)
b=[eyebrow(600,70,"Quinceañera seating plan","middle"),
   text(600,122,"Four kinds of seats, one room",40,INK,SERIF,"middle",300)]
# room outline
b.append(f'<rect x="60" y="160" width="700" height="500" fill="none" stroke="{GOLD}" stroke-opacity=".5"/>')
# stage + throne
b.append(f'<rect x="250" y="180" width="320" height="70" fill="{SOFT}" stroke="{GOLD}"/>')
b.append(f'<rect x="395" y="192" width="30" height="46" fill="{GOLD}"/>')
b.append(text(410,272,"STAGE + THRONE",13,GOLD,SANS,"middle",500,2.5))
# court table either side
for x in (90,590):
    b.append(f'<rect x="{x}" y="190" width="140" height="34" fill="{SOFT}" stroke="{GOLD}" stroke-opacity=".7"/>')
    for k in range(5):
        b.append(f'<circle cx="{x+18+k*26}" cy="236" r="6" fill="none" stroke="{GOLD}"/>')
b.append(text(160,180,"COURT",12,MUTED,SANS,"middle",500,2))
b.append(text(660,180,"COURT",12,MUTED,SANS,"middle",500,2))
# dance floor
b.append(f'<rect x="300" y="300" width="220" height="150" fill="none" stroke="{GOLD}" stroke-dasharray="5 6"/>')
b.append(text(410,382,"Dance floor",22,INK,SERIF,"middle"))
# family tables near floor
for (x,y) in [(230,330),(590,330),(230,420),(590,420)]:
    b.append(f'<circle cx="{x}" cy="{y}" r="30" fill="{SOFT}" stroke="{GOLD}"/>')
b.append(text(230,470,"FAMILY + PADRINOS",11,GOLD,SANS,"middle",500,1.5))
# guest rounds
for row in range(2):
    for col in range(6):
        x=120+col*116; y=530+row*66
        b.append(f'<circle cx="{x}" cy="{y}" r="24" fill="none" stroke="{GOLD}" stroke-opacity=".7"/>')
b.append(text(410,650,"GUEST ROUNDS",12,MUTED,SANS,"middle",500,2))
# legend / count column
rows=[("1","Throne chair","For the quinceañera, on the stage"),
      ("2","Court of honor","Damas, chambelanes and escort"),
      ("3","Family + padrinos","Closest to the floor for the dances"),
      ("4","Guests","Everyone else, plus a small buffer")]
for i,(n,h,sub) in enumerate(rows):
    y=200+i*110
    b.append(f'<circle cx="810" cy="{y}" r="18" fill="{GOLD}"/>')
    b.append(text(810,y+6,n,18,"#0a0806",SANS,"middle",500))
    b.append(text(842,y-2,h,26,INK,SERIF))
    b.append(text(842,y+26,sub,15,MUTED))
b.append(text(600,700,"Schematic, not to scale. Every venue layout is different.",14,MUTED,SANS,"middle",400,1,True))
write("quinceanera-seating-plan.svg",svg(1200,730,"Schematic quinceañera seating plan: a throne chair on the stage, court of honor tables beside it, family and padrinos tables near the dance floor, and guest round tables behind","\n".join(b)))
# 8. Restaurant buyout chair swap timeline
b=[eyebrow(600,70,"Restaurant buyout chair swap","middle"),
   text(600,122,"The tight window between service and your guests",36,INK,SERIF,"middle",300)]
steps=[("Weeks before","Confirm the plan","Where house chairs go, load-in door, COI"),
       ("Service ends","Clear the room","Restaurant stacks or stores its chairs"),
       ("Load-in","Swap and set","Rental chairs in, tables dressed"),
       ("Your event","Guests arrive","Ceremony rows flip to dinner if needed"),
       ("Close","Strike","Rentals out, house chairs back for tomorrow")]
x0,x1=120,1080
b.append(f'<line x1="{x0}" y1="260" x2="{x1}" y2="260" stroke="{GOLD}" stroke-opacity=".6" stroke-width="2"/>')
b.append(f'<rect x="{x0+(x1-x0)/4-40:.0f}" y="236" width="{(x1-x0)/4+80:.0f}" height="48" fill="{GOLD}" fill-opacity=".12"/>')
b.append(text((x0+x1)/2-(x1-x0)/8,226,"THE CRUNCH: OFTEN JUST A FEW HOURS",12,GOLD,SANS,"middle",500,2))
for i,(t,h,sub) in enumerate(steps):
    x=x0+i*(x1-x0)/4
    b.append(f'<circle cx="{x:.0f}" cy="260" r="12" fill="{GOLD if i in (1,2) else BG}" stroke="{GOLD}" stroke-width="2"/>')
    b.append(text(x,330,t.upper(),13,GOLD,SANS,"middle",500,2.5))
    b.append(text(x,370,h,26,INK,SERIF,"middle"))
    words=sub.split(); lines=[];cur=""
    for w in words:
        if len(cur)+len(w)>22: lines.append(cur.strip()); cur=""
        cur+=w+" "
    lines.append(cur.strip())
    for j,l in enumerate(lines):
        b.append(text(x,404+j*24,l,16,MUTED,SANS,"middle"))
b.append(text(600,520,"Typical sequence. Every restaurant sets its own access times, so confirm yours in writing.",15,MUTED,SANS,"middle"))
write("restaurant-buyout-chair-swap.svg",svg(1200,570,"Restaurant buyout chair swap timeline: confirm the plan weeks before, clear the room after service, swap in rental chairs, host the event, then strike and return the house chairs","\n".join(b)))
# 9. Graduation ceremony field layout (schematic)
b=[eyebrow(600,70,"Graduation ceremony on a field","middle"),
   text(600,122,"Graduates in the middle, guests around them",38,INK,SERIF,"middle",300)]
# field
b.append(f'<rect x="60" y="160" width="760" height="500" fill="{SOFT}" stroke="{GOLD}" stroke-opacity=".5"/>')
for k in range(1,6):
    x=60+k*760/6
    b.append(f'<line x1="{x:.0f}" y1="160" x2="{x:.0f}" y2="660" stroke="{LINE}"/>')
# stage
b.append(f'<rect x="300" y="178" width="280" height="56" fill="{GOLD}"/>')
b.append(text(440,212,"STAGE + PLATFORM PARTY",13,"#0a0806",SANS,"middle",500,2))
# faculty row
for k in range(14):
    b.append(f'<rect x="{262+k*26}" y="262" width="16" height="14" fill="none" stroke="{GOLD}"/>')
b.append(text(440,298,"FACULTY",12,MUTED,SANS,"middle",500,2))
# graduate block with center aisle
for r in range(8):
    for c in range(16):
        x=230+c*26+(30 if c>=8 else 0); y=320+r*24
        b.append(f'<rect x="{x}" y="{y}" width="16" height="14" fill="{GOLD}" fill-opacity=".85"/>')
b.append(text(440,530,"GRADUATES (CENTER AISLE)",12,GOLD,SANS,"middle",500,2))
# guest blocks on sides
for side in (80,700):
    for r in range(10):
        for c in range(4):
            b.append(f'<rect x="{side+c*24}" y="{320+r*24}" width="14" height="14" fill="none" stroke="{INK}" stroke-opacity=".6"/>')
b.append(text(128,310,"GUESTS",12,MUTED,SANS,"middle",500,2))
b.append(text(748,310,"GUESTS",12,MUTED,SANS,"middle",500,2))
# ADA zone
b.append(f'<rect x="230" y="580" width="420" height="48" fill="none" stroke="{GOLD}" stroke-dasharray="5 5"/>')
b.append(text(440,610,"ACCESSIBLE SEATING + COMPANION CHAIRS",12,GOLD,SANS,"middle",500,1.5))
rows=[("1","Stage","Speakers, diplomas, platform party"),
      ("2","Faculty","Row facing the graduates"),
      ("3","Graduates","Rows in walk order, center aisle"),
      ("4","Guests","Field chairs or bleachers"),
      ("5","Accessible","Level spot, companion seats")]
for i,(n,h,sub) in enumerate(rows):
    y=200+i*92
    b.append(f'<circle cx="870" cy="{y}" r="17" fill="{GOLD}"/>')
    b.append(text(870,y+6,n,17,"#0a0806",SANS,"middle",500))
    b.append(text(900,y-2,h,25,INK,SERIF))
    b.append(text(900,y+24,sub,15,MUTED))
b.append(text(600,700,"Schematic, not to scale. Your school sets the ticket limit and the rain plan.",14,MUTED,SANS,"middle",400,1,True))
write("graduation-ceremony-field-layout.svg",svg(1200,730,"Schematic graduation ceremony layout on a football field: stage and platform party at one end, a faculty row, graduates in rows with a center aisle, guest chairs on both sides and an accessible seating area","\n".join(b)))
print("ok")
