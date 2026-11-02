#!/usr/bin/env python3
"""Draws the journal's topic hero art (public/blog/art/<topic>.svg).

Each piece is a brass-on-espresso line illustration in the site's hotel-lobby palette,
800 x 1000 (4:5, the hero frame). Every file carries <title> and <desc> so the art is
described to search engines and screen readers even when used as an <img>.
Run: python3 scripts/journal-art.py
"""
import math, os

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "blog", "art")
BG, BG2, GOLD, IVORY, MUTED, LINE = "#12100d", "#221d17", "#c9a96a", "#efe4cf", "#a89d87", "#3a3024"


def frame(title, desc, body):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" role="img" aria-labelledby="t d">
<title id="t">{title}</title>
<desc id="d">{desc}</desc>
<defs>
<radialGradient id="spot" cx="50%" cy="38%" r="70%"><stop offset="0" stop-color="#3a2f22"/><stop offset=".55" stop-color="{BG2}"/><stop offset="1" stop-color="{BG}"/></radialGradient>
<linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c1813"/><stop offset="1" stop-color="#0d0b09"/></linearGradient>
<linearGradient id="brass" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="800" y2="1000"><stop offset="0" stop-color="#e6cf98"/><stop offset=".5" stop-color="{GOLD}"/><stop offset="1" stop-color="#8a6d3b"/></linearGradient>
<linearGradient id="cloth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3ead8"/><stop offset="1" stop-color="#cfc3aa"/></linearGradient>
</defs>
<rect width="800" height="1000" fill="url(#spot)"/>
<rect y="760" width="800" height="240" fill="url(#floor)"/>
<line x1="0" y1="760" x2="800" y2="760" stroke="{LINE}" stroke-width="2"/>
<rect x="28" y="28" width="744" height="944" fill="none" stroke="{GOLD}" stroke-opacity=".35"/>
{body}
</svg>
'''


def ellipse_shadow(cx, cy, rx, ry=18):
    return f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="#000" opacity=".45"/>'


def round_table(cx, top, w, drop, cloth="url(#cloth)"):
    # A draped round table seen slightly from above.
    h = drop
    return (ellipse_shadow(cx, top + h + 8, w * 0.62)
            + f'<path d="M{cx-w/2} {top} Q{cx-w/2-14} {top+h*0.6} {cx-w/2-8} {top+h} L{cx+w/2+8} {top+h} Q{cx+w/2+14} {top+h*0.6} {cx+w/2} {top} Z" fill="{cloth}"/>'
            + "".join(f'<path d="M{cx-w/2+i*w/8} {top+8} Q{cx-w/2+i*w/8+6} {top+h*0.6} {cx-w/2+i*w/8} {top+h}" stroke="#b8ab90" stroke-width="2" fill="none" opacity=".6"/>' for i in range(1, 8))
            + f'<ellipse cx="{cx}" cy="{top}" rx="{w/2}" ry="{w*0.16}" fill="#f7f0e2"/>')


def plate(cx, cy, r, rim=True):
    s = f'<ellipse cx="{cx}" cy="{cy}" rx="{r}" ry="{r*0.38}" fill="#fbf7ee" stroke="#d9cdb3" stroke-width="2"/>'
    if rim:
        s += f'<ellipse cx="{cx}" cy="{cy}" rx="{r*0.98}" ry="{r*0.37}" fill="none" stroke="{GOLD}" stroke-width="3"/>'
    s += f'<ellipse cx="{cx}" cy="{cy}" rx="{r*0.62}" ry="{r*0.23}" fill="none" stroke="#e3d8c2" stroke-width="2"/>'
    return s


def wine_glass(x, base, h=110, w=34):
    bowl_top = base - h
    return (f'<path d="M{x-w/2} {bowl_top} Q{x-w/2} {bowl_top+h*0.45} {x} {bowl_top+h*0.5} Q{x+w/2} {bowl_top+h*0.45} {x+w/2} {bowl_top} Z" fill="{IVORY}" fill-opacity=".14" stroke="{IVORY}" stroke-opacity=".8" stroke-width="2.5"/>'
            f'<line x1="{x}" y1="{bowl_top+h*0.5}" x2="{x}" y2="{base}" stroke="{IVORY}" stroke-opacity=".8" stroke-width="2.5"/>'
            f'<ellipse cx="{x}" cy="{base}" rx="{w*0.45}" ry="5" fill="none" stroke="{IVORY}" stroke-opacity=".8" stroke-width="2.5"/>')


def flute(x, base, h=150):
    return (f'<path d="M{x-12} {base-h} L{x-9} {base-h*0.45} Q{x} {base-h*0.38} {x+9} {base-h*0.45} L{x+12} {base-h} Z" fill="{GOLD}" fill-opacity=".35" stroke="{IVORY}" stroke-opacity=".85" stroke-width="2.5"/>'
            f'<line x1="{x}" y1="{base-h*0.4}" x2="{x}" y2="{base}" stroke="{IVORY}" stroke-opacity=".85" stroke-width="2.5"/>'
            f'<ellipse cx="{x}" cy="{base}" rx="16" ry="4" fill="none" stroke="{IVORY}" stroke-opacity=".85" stroke-width="2.5"/>')


def chair_back(x, seat_y, scale=1.0, kind="cross"):
    # A simple side-on chair in brass line.
    s = scale
    out = f'<g stroke="url(#brass)" stroke-width="{5*s}" fill="none" stroke-linecap="round">'
    out += f'<line x1="{x}" y1="{seat_y-160*s}" x2="{x}" y2="{seat_y+120*s}"/>'
    out += f'<line x1="{x+90*s}" y1="{seat_y}" x2="{x+90*s}" y2="{seat_y+120*s}"/>'
    out += f'<line x1="{x}" y1="{seat_y}" x2="{x+95*s}" y2="{seat_y}" stroke-width="{9*s}"/>'
    if kind == "cross":
        out += f'<line x1="{x}" y1="{seat_y-150*s}" x2="{x+8*s}" y2="{seat_y-20*s}"/><line x1="{x+8*s}" y1="{seat_y-150*s}" x2="{x}" y2="{seat_y-20*s}"/>'
    out += "</g>"
    return out


def front_chair(cx, s):
    # Front view of a cross-back chair standing on the floor line.
    w, seat, top, floor = 150 * s, 760 - 200 * s, 760 - 470 * s, 760 + 60 * s
    l, r = cx - w / 2, cx + w / 2
    g = f'<g stroke="url(#brass)" stroke-linecap="round" fill="none">'
    g += f'<line x1="{l}" y1="{top}" x2="{l}" y2="{floor}" stroke-width="{12*s}"/><line x1="{r}" y1="{top}" x2="{r}" y2="{floor}" stroke-width="{12*s}"/>'
    g += f'<line x1="{l}" y1="{top+10*s}" x2="{r}" y2="{top+10*s}" stroke-width="{16*s}"/>'
    g += f'<line x1="{l+8*s}" y1="{top+30*s}" x2="{r-8*s}" y2="{seat-30*s}" stroke-width="{8*s}"/><line x1="{r-8*s}" y1="{top+30*s}" x2="{l+8*s}" y2="{seat-30*s}" stroke-width="{8*s}"/>'
    g += f'<line x1="{l}" y1="{seat+60*s}" x2="{r}" y2="{seat+60*s}" stroke-width="{6*s}"/>'
    g += '</g>'
    g += f'<rect x="{l-10*s}" y="{seat-14*s}" width="{w+20*s}" height="{30*s}" rx="{10*s}" fill="#efe4cf"/><rect x="{l-10*s}" y="{seat+12*s}" width="{w+20*s}" height="{8*s}" fill="#8a6d3b"/>'
    return ellipse_shadow(cx, floor + 4, w * 0.75, 12 * s) + g


def string_lights(x1, y1, x2, y2, sag, n):
    mx, my = (x1 + x2) / 2, max(y1, y2) + sag
    s = f'<path d="M{x1} {y1} Q{mx} {my} {x2} {y2}" stroke="{MUTED}" stroke-width="2" fill="none"/>'
    for i in range(1, n):
        t = i / n
        x = (1 - t) ** 2 * x1 + 2 * (1 - t) * t * mx + t ** 2 * x2
        y = (1 - t) ** 2 * y1 + 2 * (1 - t) * t * my + t ** 2 * y2
        s += f'<circle cx="{x:.1f}" cy="{y+9:.1f}" r="16" fill="#f6d58b" opacity=".18"/><circle cx="{x:.1f}" cy="{y+9:.1f}" r="6" fill="#f9e3a8"/>'
    return s


def tent(cx, base, w, h):
    peak = base - h
    eave = base - h * 0.45
    s = f'<path d="M{cx-w/2} {eave} L{cx} {peak} L{cx+w/2} {eave} Z" fill="{IVORY}" fill-opacity=".92"/>'
    s += f'<path d="M{cx-w/2} {eave} L{cx+w/2} {eave} L{cx+w/2} {base} L{cx-w/2} {base} Z" fill="{IVORY}" fill-opacity=".14" stroke="{IVORY}" stroke-opacity=".6" stroke-width="2"/>'
    for i in range(0, 5):
        x = cx - w / 2 + i * w / 4
        s += f'<line x1="{x}" y1="{eave}" x2="{x}" y2="{base}" stroke="{IVORY}" stroke-width="5"/>'
    s += f'<path d="M{cx-w/2} {eave} ' + " ".join(f'Q{cx-w/2+(i+0.5)*w/6} {eave+22} {cx-w/2+(i+1)*w/6} {eave}' for i in range(6)) + f'" fill="{IVORY}"/>'
    return s


def pieces():
    yield "chairs", "Brass cross-back chairs lined up under a spotlight", "Three front-facing cross-back event chairs with ivory seat cushions, drawn in brass on a dark lobby background.", (
        "".join(front_chair(x, 1.0 if x == 400 else 0.82) for x in (190, 400, 610)))

    yield "tables", "Draped round reception tables set for dinner", "Two round tables with ivory floor-length cloths and a long banquet table behind them, lit by a warm overhead glow.", (
        f'<rect x="150" y="520" width="500" height="20" fill="#e9dfcb"/><rect x="150" y="540" width="500" height="120" fill="#cfc3aa" opacity=".6"/>'
        + round_table(250, 640, 300, 210) + round_table(560, 660, 260, 190)
        + plate(210, 655, 34) + plate(300, 660, 34) + plate(540, 672, 30) + plate(610, 676, 30)
        + f'<path d="M250 600 l0 -50 m-14 22 q14 -36 28 0" stroke="{GOLD}" stroke-width="3" fill="none"/>')

    yield "linens-and-napkins", "Ivory linens draped to the floor with a folded napkin", "A round table dressed in an ivory floor-length tablecloth with a gold runner, a folded dinner napkin standing on a plate in front.", (
        round_table(400, 560, 520, 300)
        + f'<path d="M330 560 L470 560 L520 860 L280 860 Z" fill="{GOLD}" opacity=".55"/>'
        + plate(400, 575, 70)
        + f'<path d="M400 470 L440 568 L360 568 Z" fill="#fbf7ee" stroke="#d9cdb3" stroke-width="2"/><line x1="400" y1="470" x2="400" y2="568" stroke="#d9cdb3" stroke-width="2"/>')

    yield "dinnerware", "A formal place setting with gold-rim china", "Top-down place setting: a gold charger, dinner plate and salad plate in the center, forks on the left, knife and spoon on the right, bread plate and glasses above.", (
        f'<circle cx="400" cy="500" r="190" fill="none" stroke="url(#brass)" stroke-width="14"/>'
        f'<circle cx="400" cy="500" r="160" fill="#fbf7ee"/><circle cx="400" cy="500" r="156" fill="none" stroke="{GOLD}" stroke-width="4"/>'
        f'<circle cx="400" cy="500" r="110" fill="#f3ecdd" stroke="#dcd0b8" stroke-width="2"/><circle cx="400" cy="500" r="70" fill="#fbf7ee" stroke="{GOLD}" stroke-width="3"/>'
        + "".join(f'<rect x="{x}" y="380" width="10" height="250" rx="5" fill="url(#brass)"/><rect x="{x-6}" y="380" width="22" height="60" rx="6" fill="url(#brass)"/>' for x in (150, 185))
        + f'<rect x="610" y="370" width="12" height="270" rx="6" fill="url(#brass)"/><rect x="645" y="400" width="10" height="240" rx="5" fill="url(#brass)"/><ellipse cx="650" cy="400" rx="16" ry="24" fill="url(#brass)"/>'
        + f'<circle cx="210" cy="250" r="55" fill="#fbf7ee" stroke="{GOLD}" stroke-width="3"/><line x1="185" y1="250" x2="240" y2="235" stroke="url(#brass)" stroke-width="7" stroke-linecap="round"/>'
        + "".join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{IVORY}" fill-opacity=".12" stroke="{IVORY}" stroke-opacity=".7" stroke-width="3"/>' for x, y, r in ((560, 250, 40), (630, 280, 34), (690, 320, 28))))

    yield "glassware-and-bar", "Champagne flutes and wine glasses on a brass bar", "A bar counter with a row of champagne flutes and wine glasses, bottles on a back shelf, under warm light.", (
        f'<rect x="120" y="230" width="560" height="10" fill="url(#brass)"/>'
        + "".join(f'<rect x="{x}" y="{150-h}" width="34" height="{h+80}" rx="10" fill="{c}" opacity=".85"/><rect x="{x+11}" y="{120-h}" width="12" height="36" fill="{c}" opacity=".85"/>' for x, h, c in ((150, 30, "#4b5b3a"), (210, 10, "#6b2d2d"), (270, 40, "#3d3528"), (460, 20, "#6b2d2d"), (520, 35, "#4b5b3a"), (590, 15, "#3d3528")))
        + f'<rect x="90" y="620" width="620" height="24" fill="url(#brass)"/><rect x="110" y="644" width="580" height="116" fill="#2a231b" stroke="{GOLD}" stroke-opacity=".5"/>'
        + "".join(flute(x, 618) for x in (180, 240, 300, 360))
        + "".join(wine_glass(x, 618, 130, 46) for x in (450, 530, 610)))

    yield "tents", "A white frame tent glowing at dusk", "A white peaked frame tent with scalloped valance and open sides, string lights glowing inside, on a lawn at dusk.", (
        f'<circle cx="640" cy="170" r="46" fill="#f3e2b5" opacity=".18"/><circle cx="640" cy="170" r="30" fill="#f3e2b5" opacity=".5"/>'
        + tent(400, 790, 600, 470)
        + string_lights(140, 560, 660, 560, 70, 12)
        + "".join(f'<rect x="{x}" y="700" width="70" height="80" fill="{IVORY}" opacity=".25"/>' for x in (220, 365, 510)))

    yield "lighting-and-power", "Bistro string lights over a dinner table", "Three swags of glowing bistro string lights hang over a long dinner table, with a warm uplight wash on the wall behind.", (
        f'<path d="M80 760 L200 140 L260 140 L240 760 Z" fill="#f6d58b" opacity=".07"/><path d="M720 760 L600 140 L540 140 L560 760 Z" fill="#f6d58b" opacity=".07"/>'
        + string_lights(40, 160, 760, 160, 120, 14) + string_lights(40, 260, 760, 260, 110, 14) + string_lights(40, 360, 760, 360, 100, 14)
        + f'<rect x="130" y="640" width="540" height="18" fill="#e9dfcb"/><rect x="130" y="658" width="540" height="100" fill="#cfc3aa" opacity=".5"/>'
        + "".join(f'<rect x="{x}" y="590" width="10" height="50" fill="{IVORY}"/><path d="M{x+5} 576 q-8 10 0 16 q8 -6 0 -16" fill="#f6d58b"/><circle cx="{x+5}" cy="584" r="22" fill="#f6d58b" opacity=".15"/>' for x in (200, 330, 460, 590)))

    yield "dance-floors-and-decor", "A parquet dance floor beneath a draped ceiling", "A diamond parquet dance floor seen in perspective under swags of ceiling draping and a round floral arch.", (
        "".join(f'<path d="M{80+i*80} 120 Q{120+i*80} 220 {160+i*80} 120" fill="none" stroke="{IVORY}" stroke-opacity=".5" stroke-width="3"/>' for i in range(8))
        + f'<circle cx="400" cy="470" r="200" fill="none" stroke="url(#brass)" stroke-width="10"/>'
        + "".join(f'<circle cx="{400+200*math.cos(a)}" cy="{470+200*math.sin(a)}" r="{18+((i*7)%14)}" fill="{c}" opacity=".85"/>' for i, (a, c) in enumerate(((math.radians(d), ["#f3ead8", "#d9a6a0", "#e8d3a9"][i % 3]) for i, d in enumerate(range(150, 300, 15)))))
        + f'<path d="M140 960 L260 760 L540 760 L660 960 Z" fill="#6b4a2c"/>'
        + "".join(f'<line x1="{260+i*35}" y1="760" x2="{140+i*65}" y2="960" stroke="#3b2816" stroke-width="2"/>' for i in range(9))
        + "".join(f'<line x1="{260-(i*30)}" y1="{760+i*50}" x2="{540+(i*30)}" y2="{760+i*50}" stroke="#3b2816" stroke-width="2"/>' for i in range(1, 4)))

    yield "catering-equipment", "Polished chafing dishes on a buffet line", "A buffet table with three brass chafing dishes with domed lids, a beverage dispenser with citrus slices and stacked plates.", (
        f'<rect x="80" y="560" width="640" height="20" fill="#e9dfcb"/><rect x="80" y="580" width="640" height="180" fill="#cfc3aa" opacity=".55"/>'
        + "".join(f'<rect x="{x-80}" y="490" width="160" height="60" rx="8" fill="url(#brass)"/><path d="M{x-78} 492 Q{x} 400 {x+78} 492 Z" fill="url(#brass)" opacity=".9"/><circle cx="{x}" cy="440" r="9" fill="{IVORY}"/><rect x="{x-60}" y="550" width="8" height="12" fill="{GOLD}"/><rect x="{x+52}" y="550" width="8" height="12" fill="{GOLD}"/>' for x in (190, 400))
        + f'<rect x="560" y="320" width="110" height="200" rx="14" fill="{IVORY}" fill-opacity=".2" stroke="{IVORY}" stroke-opacity=".8" stroke-width="3"/>'
        + "".join(f'<circle cx="{x}" cy="{y}" r="16" fill="#e9b949" opacity=".8"/><circle cx="{x}" cy="{y}" r="9" fill="none" stroke="#fff3c4" stroke-width="2"/>' for x, y in ((590, 400), (630, 440), (600, 470), (640, 380)))
        + f'<rect x="575" y="520" width="80" height="40" fill="url(#brass)"/>')

    yield "lounge-and-specialty", "A velvet lounge set with a rug and side table", "A cocktail-hour lounge: an emerald velvet sofa, two armchairs and a round brass side table on a patterned rug.", (
        f'<ellipse cx="400" cy="830" rx="330" ry="70" fill="#5a2e2e" opacity=".75" stroke="{GOLD}" stroke-opacity=".6" stroke-width="3"/>'
        f'<rect x="210" y="560" width="380" height="150" rx="40" fill="#1f5e4a"/><rect x="230" y="500" width="340" height="120" rx="40" fill="#25705a"/>'
        f'<rect x="180" y="580" width="70" height="140" rx="30" fill="#1b5241"/><rect x="550" y="580" width="70" height="140" rx="30" fill="#1b5241"/>'
        + "".join(f'<line x1="{x}" y1="720" x2="{x}" y2="770" stroke="url(#brass)" stroke-width="8"/>' for x in (230, 570))
        + f'<ellipse cx="400" cy="780" rx="70" ry="16" fill="url(#brass)"/><line x1="400" y1="780" x2="400" y2="840" stroke="url(#brass)" stroke-width="8"/>'
        + "".join(f'<rect x="{x}" y="640" width="120" height="110" rx="30" fill="#d9a6a0"/><rect x="{x+10}" y="590" width="100" height="80" rx="30" fill="#e3b5b0"/>' for x in (50, 630)))

    yield "weddings", "A ceremony aisle lined with chairs and an arch", "A wedding ceremony seen down the aisle: rows of chairs on both sides, petals on a runner, leading to a round floral arch.", (
        f'<circle cx="400" cy="440" r="150" fill="none" stroke="url(#brass)" stroke-width="9"/>'
        + "".join(f'<circle cx="{400+150*math.cos(math.radians(d))}" cy="{440+150*math.sin(math.radians(d))}" r="{20+(d%3)*4}" fill="{["#f3ead8", "#e3b5b0", "#e8d3a9"][d % 3]}"/>' for d in range(160, 290, 13))
        + f'<path d="M370 600 L430 600 L520 960 L280 960 Z" fill="{IVORY}" opacity=".85"/>'
        + "".join(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="url(#brass)" opacity=".9"/>' for row in range(5) for x, y, w, h in [
            (330 - 40 - row * 60 - k * (40 + row * 12), 610 + row * 70, 30 + row * 10, 40 + row * 14) for k in range(3)] + [
            (470 + 10 + row * 60 + k * (40 + row * 12), 610 + row * 70, 30 + row * 10, 40 + row * 14) for k in range(3)]))

    yield "cultural-celebrations", "A decorated stage with paired throne chairs", "A celebration stage framed by draped fabric and marigold garlands, with two ornate gold throne chairs at center and lanterns on either side.", (
        f'<rect x="120" y="640" width="560" height="120" fill="#5a2e2e"/><rect x="120" y="630" width="560" height="14" fill="url(#brass)"/>'
        + "".join(f'<path d="M{120+i*70} 120 Q{155+i*70} 260 {190+i*70} 120" fill="none" stroke="#e9a23b" stroke-width="10" stroke-dasharray="2 10" stroke-linecap="round"/>' for i in range(8))
        + f'<path d="M120 120 Q160 400 130 630" stroke="#d9a6a0" stroke-width="30" fill="none" opacity=".7"/><path d="M680 120 Q640 400 670 630" stroke="#d9a6a0" stroke-width="30" fill="none" opacity=".7"/>'
        + "".join(f'<path d="M{x} 630 L{x} 470 Q{x} 360 {x+60} 350 Q{x+120} 360 {x+120} 470 L{x+120} 630 Z" fill="url(#brass)"/><rect x="{x+15}" y="460" width="90" height="120" rx="20" fill="#f3ead8"/><rect x="{x-5}" y="560" width="130" height="40" rx="10" fill="#e8d3a9"/>' for x in (250, 430))
        + "".join(f'<rect x="{x}" y="500" width="40" height="70" rx="8" fill="#e9a23b" opacity=".85"/><circle cx="{x+20}" cy="535" r="40" fill="#f6d58b" opacity=".15"/>' for x in (160, 600)))

    yield "parties", "A backyard party table with balloons and lights", "A backyard party: a long table with a striped runner, a cake stand, balloons clustered at one end and string lights overhead.", (
        string_lights(40, 150, 760, 150, 110, 12)
        + "".join(f'<line x1="{x}" y1="{y+46}" x2="{x+(620-x)*0.1}" y2="600" stroke="{MUTED}" stroke-width="1.5"/><ellipse cx="{x}" cy="{y}" rx="38" ry="46" fill="{c}"/>' for x, y, c in ((600, 330, "#e3b5b0"), (660, 300, "#c9a96a"), (630, 400, "#efe4cf"), (690, 380, "#d9a6a0"), (560, 410, "#c9a96a")))
        + f'<rect x="90" y="600" width="620" height="18" fill="#e9dfcb"/><rect x="90" y="618" width="620" height="140" fill="#cfc3aa" opacity=".5"/>'
        + "".join(f'<rect x="{90+i*40}" y="600" width="20" height="158" fill="{GOLD}" opacity=".35"/>' for i in range(16))
        + f'<rect x="260" y="540" width="90" height="60" fill="#f3ead8"/><rect x="270" y="500" width="70" height="40" fill="#e3b5b0"/><ellipse cx="305" cy="600" rx="70" ry="8" fill="url(#brass)"/>')

    yield "corporate-and-nonprofit", "A gala ballroom with a stage and round tables", "A gala room: a stage with a lectern and screen at the back, rows of round tables with tall centerpieces in front.", (
        f'<rect x="200" y="160" width="400" height="230" fill="{IVORY}" fill-opacity=".12" stroke="{IVORY}" stroke-opacity=".6" stroke-width="3"/>'
        f'<rect x="140" y="400" width="520" height="40" fill="#2a231b" stroke="{GOLD}" stroke-opacity=".6"/><rect x="380" y="330" width="40" height="70" fill="url(#brass)"/>'
        f'<path d="M300 260 l40 -40 l40 30 l60 -70 l60 50" stroke="{GOLD}" stroke-width="5" fill="none"/>'
        + "".join(round_table(x, y, w, w * 0.5) + f'<line x1="{x}" y1="{y}" x2="{x}" y2="{y-w*0.6}" stroke="{GOLD}" stroke-width="3"/><circle cx="{x}" cy="{y-w*0.6}" r="{w*0.1}" fill="#e8d3a9"/>' for x, y, w in ((200, 560, 140), (400, 560, 140), (600, 560, 140), (130, 720, 180), (400, 720, 180), (670, 720, 180))))

    yield "chicago-planning", "A city skyline behind a rooftop dinner table", "A rooftop dinner table with string lights in front of a city skyline of towers, including a tall tower with twin antennas, at dusk.", (
        "".join(f'<rect x="{x}" y="{y}" width="{w}" height="{560-y}" fill="#2a231b" stroke="{GOLD}" stroke-opacity=".35"/>' for x, y, w in ((60, 380, 70), (140, 300, 60), (210, 420, 80), (300, 140, 90), (400, 260, 70), (480, 340, 60), (550, 220, 80), (640, 400, 90)))
        + f'<line x1="320" y1="140" x2="320" y2="80" stroke="{GOLD}" stroke-width="4"/><line x1="370" y1="140" x2="370" y2="80" stroke="{GOLD}" stroke-width="4"/>'
        + "".join(f'<rect x="{x}" y="{y}" width="8" height="10" fill="#f6d58b" opacity=".6"/>' for x in range(310, 385, 18) for y in range(170, 540, 30))
        + f'<rect x="0" y="560" width="800" height="200" fill="#16130f"/><line x1="0" y1="600" x2="800" y2="600" stroke="url(#brass)" stroke-width="5"/>'
        + "".join(f'<line x1="{x}" y1="600" x2="{x}" y2="690" stroke="url(#brass)" stroke-width="3"/>' for x in range(40, 800, 60))
        + string_lights(40, 430, 760, 430, 90, 13)
        + f'<rect x="160" y="690" width="480" height="16" fill="#e9dfcb"/><rect x="160" y="706" width="480" height="54" fill="#cfc3aa" opacity=".5"/>')

    yield "suburb-guides", "A tree-lined suburban backyard set for a party", "A suburban backyard: a house roofline and mature trees behind a lawn with a small frame tent and a round table.", (
        f'<path d="M80 520 L250 380 L420 520 Z" fill="#2a231b" stroke="{GOLD}" stroke-opacity=".5" stroke-width="3"/><rect x="110" y="520" width="280" height="240" fill="#221d17" stroke="{GOLD}" stroke-opacity=".5" stroke-width="3"/>'
        + "".join(f'<rect x="{x}" y="570" width="50" height="60" fill="#f6d58b" opacity=".55"/>' for x in (150, 300))
        + "".join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="#3e4a33" opacity=".9"/>' for x, y, r in ((560, 360, 110), (660, 420, 90), (500, 440, 80), (720, 330, 70)))
        + f'<rect x="590" y="460" width="18" height="300" fill="#3b2a20"/>'
        + tent(540, 860, 300, 230) + round_table(540, 820, 120, 50))

    yield "budget-and-booking", "A rental quote, calendar and pen on a desk", "A desk with a printed rental quote showing line items and a total, a month calendar with a date circled in gold, and a brass pen.", (
        f'<rect x="120" y="160" width="330" height="460" fill="#fbf7ee" transform="rotate(-4 285 390)"/>'
        + f'<g transform="rotate(-4 285 390)"><rect x="150" y="190" width="160" height="22" fill="{GOLD}"/>' + "".join(f'<rect x="150" y="{250+i*45}" width="{150+(i*37)%90}" height="10" fill="#cfc3aa"/><rect x="380" y="{250+i*45}" width="40" height="10" fill="#cfc3aa"/>' for i in range(6)) + f'<line x1="150" y1="540" x2="420" y2="540" stroke="#b8ab90" stroke-width="2"/><rect x="330" y="560" width="90" height="16" fill="{GOLD}"/></g>'
        + f'<rect x="420" y="300" width="290" height="300" fill="#f3ead8" transform="rotate(5 565 450)"/>'
        + f'<g transform="rotate(5 565 450)"><rect x="420" y="300" width="290" height="50" fill="#5a2e2e"/>' + "".join(f'<rect x="{440+c*38}" y="{370+r*44}" width="28" height="28" fill="#e3d8c2"/>' for r in range(5) for c in range(7)) + f'<circle cx="{454+5*38}" cy="{384+3*44}" r="24" fill="none" stroke="{GOLD}" stroke-width="5"/></g>'
        + f'<rect x="250" y="690" width="380" height="16" rx="8" fill="url(#brass)" transform="rotate(-12 440 698)"/>')

    yield "layouts-and-floor-plans", "A top-down floor plan of a reception room", "A brass-line floor plan seen from above: round tables with chairs, a dance floor in the center, a head table, a bar and the entrance.", (
        f'<rect x="90" y="120" width="620" height="760" fill="none" stroke="url(#brass)" stroke-width="6"/>'
        f'<rect x="260" y="380" width="280" height="200" fill="{GOLD}" opacity=".25" stroke="{GOLD}" stroke-width="3"/>'
        f'<rect x="230" y="160" width="340" height="50" fill="none" stroke="{IVORY}" stroke-width="3"/>'
        + "".join(f'<circle cx="{x}" cy="{y}" r="42" fill="none" stroke="{IVORY}" stroke-width="3"/>' + "".join(f'<circle cx="{x+58*math.cos(math.radians(a))}" cy="{y+58*math.sin(math.radians(a))}" r="9" fill="{GOLD}"/>' for a in range(0, 360, 45)) for x, y in ((170, 320), (170, 500), (170, 680), (630, 320), (630, 500), (630, 680), (310, 720), (490, 720)))
        + f'<rect x="300" y="830" width="200" height="30" fill="none" stroke="{IVORY}" stroke-width="3"/><path d="M90 820 a60 60 0 0 1 60 60" fill="none" stroke="{MUTED}" stroke-width="2"/>')

    yield "seasons-and-venues", "One table through four Chicago seasons", "A window-like frame split into four panels showing spring blossoms, summer sun, autumn leaves and winter snow, each above the same dinner table.", (
        "".join(f'<rect x="{x}" y="{y}" width="300" height="320" fill="{c}" opacity=".9" stroke="url(#brass)" stroke-width="4"/>' for x, y, c in ((90, 110, "#2d3a2a"), (410, 110, "#3a3220"), (90, 450, "#3a2618"), (410, 450, "#1e2530")))
        + "".join(f'<circle cx="{150+i*45}" cy="{180+(i%2)*30}" r="14" fill="#e3b5b0"/>' for i in range(5))
        + f'<circle cx="560" cy="220" r="55" fill="#f3d27a"/>'
        + "".join(f'<path d="M{130+i*50} {510+(i%3)*30} q14 -18 28 0 q-14 18 -28 0" fill="{["#c46a2b", "#e9a23b", "#8a3b1d"][i % 3]}"/>' for i in range(5))
        + "".join(f'<circle cx="{440+i*42}" cy="{500+(i*37)%100}" r="5" fill="{IVORY}"/>' for i in range(6))
        + "".join(f'<rect x="{x+50}" y="{y+240}" width="200" height="12" fill="#e9dfcb"/><rect x="{x+60}" y="{y+252}" width="180" height="50" fill="#cfc3aa" opacity=".5"/>' for x, y in ((90, 110), (410, 110), (90, 450), (410, 450))))

    yield "planning", "A planner's notebook with a seating sketch", "An open notebook with a hand-drawn seating sketch of round tables, a checklist with gold ticks and a brass pen.", (
        f'<rect x="110" y="200" width="290" height="520" fill="#fbf7ee"/><rect x="400" y="200" width="290" height="520" fill="#f3ead8"/><line x1="400" y1="200" x2="400" y2="720" stroke="#b8ab90" stroke-width="3"/>'
        + "".join(f'<circle cx="{x}" cy="{y}" r="34" fill="none" stroke="#6c6256" stroke-width="3"/>' for x, y in ((190, 300), (320, 300), (190, 450), (320, 450), (255, 600)))
        + "".join(f'<path d="M440 {280+i*70} l12 14 l22 -26" stroke="{GOLD}" stroke-width="5" fill="none"/><rect x="490" y="{285+i*70}" width="{140-(i*17)%60}" height="10" fill="#cfc3aa"/>' for i in range(6))
        + f'<rect x="300" y="760" width="360" height="16" rx="8" fill="url(#brass)" transform="rotate(-8 480 768)"/>')


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for slug, title, desc, body in pieces():
        with open(os.path.join(OUT, f"{slug}.svg"), "w") as f:
            f.write(frame(title, desc, body))
        print("wrote", slug)
