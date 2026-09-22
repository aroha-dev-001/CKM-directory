#!/usr/bin/env python3
"""Build the Chikkamagaluru Companion sales pitch deck."""
from pathlib import Path

from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.oxml.ns import nsmap
from pptx.oxml.ns import qn
from pptx.util import Emu, Inches, Pt
from lxml import etree

INK = RGBColor(0x0C, 0x1F, 0x13)
FOREST = RGBColor(0x14, 0x36, 0x1F)
MOSS = RGBColor(0x20, 0x49, 0x2C)
GOLD = RGBColor(0xC8, 0xAE, 0x6E)
GOLD_DIM = RGBColor(0xA8, 0x8C, 0x4A)
IVORY = RGBColor(0xF5, 0xF1, 0xE8)
CREAM = RGBColor(0xFB, 0xFA, 0xF5)
WHITE = RGBColor(0xFC, 0xFB, 0xF8)
MUTED = RGBColor(0x5A, 0x6B, 0x5E)
LINE = RGBColor(0xD9, 0xD3, 0xC4)
DARK_CARD = RGBColor(0x0A, 0x18, 0x10)

SERIF = "Noto Serif Display"
SANS = "Inter"
SHOTS = Path("/tmp/pitch-shots")
OUT = Path("/workspace/pitch/Chikkamagaluru-Companion-Sales-Pitch.pptx")
ART = Path("/opt/cursor/artifacts/Chikkamagaluru-Companion-Sales-Pitch.pptx")

W, H = Inches(13.333), Inches(7.5)


def set_run(run, size, color, bold=False, italic=False, name=SANS):
    run.font.size = Pt(size)
    run.font.color.rgb = color
    run.font.bold = bold
    run.font.italic = italic
    run.font.name = name
    rPr = run._r.get_or_add_rPr()
    for tag in ("latin", "ea", "cs"):
        el = rPr.find(qn(f"a:{tag}"))
        if el is None:
            el = etree.SubElement(rPr, qn(f"a:{tag}"))
        el.set("typeface", name)


def add_text(box, lines, default_size=16, default_color=INK, align=PP_ALIGN.LEFT):
    tf = box.text_frame
    tf.word_wrap = True
    tf.clear()
    first = True
    for item in lines:
        if isinstance(item, str):
            item = {"t": item}
        p = tf.paragraphs[0] if first else tf.add_paragraph()
        first = False
        p.alignment = item.get("a", align)
        p.space_after = Pt(item.get("sa", 6))
        p.space_before = Pt(item.get("sb", 0))
        p.level = item.get("lv", 0)
        run = p.add_run()
        run.text = item["t"]
        set_run(
            run,
            item.get("s", default_size),
            item.get("c", default_color),
            item.get("b", False),
            item.get("i", False),
            item.get("f", SANS),
        )
    return tf


def rect(slide, l, t, w, h, fill):
    sh = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, l, t, w, h)
    sh.fill.solid()
    sh.fill.fore_color.rgb = fill
    sh.line.fill.background()
    return sh


def kicker(slide, text, l, t, dark=False):
    box = slide.shapes.add_textbox(l, t, Inches(10), Inches(0.32))
    add_text(
        box,
        [{"t": text.upper(), "s": 11, "c": GOLD if not dark else GOLD, "b": True, "f": SANS}],
    )


def footer(slide, n, total, dark=False):
    box = slide.shapes.add_textbox(Inches(0.6), Inches(7.18), Inches(9), Inches(0.24))
    add_text(
        box,
        [{"t": "Chikkamagaluru Companion  ·  Confidential pitch", "s": 10, "c": GOLD if dark else MUTED}],
    )
    num = slide.shapes.add_textbox(Inches(11.6), Inches(7.18), Inches(1.2), Inches(0.24))
    add_text(num, [{"t": f"{n:02d} / {total:02d}", "s": 10, "c": GOLD if dark else MUTED, "a": PP_ALIGN.RIGHT}])


def notes(slide, text):
    slide.notes_slide.notes_text_frame.text = text


def ivory(prs):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    rect(s, 0, 0, W, H, IVORY)
    rect(s, 0, 0, Inches(0.12), H, FOREST)
    return s


def dark(prs):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    rect(s, 0, 0, W, H, INK)
    rect(s, 0, 0, Inches(0.12), H, GOLD)
    return s


def title_block(slide, k, h, sub=None, dark_mode=False, top=0.38):
    kicker(slide, k, Inches(0.6), Inches(top), dark=dark_mode)
    tb = slide.shapes.add_textbox(Inches(0.6), Inches(top + 0.28), Inches(12.1), Inches(1.15))
    add_text(tb, [{"t": h, "s": 32, "c": WHITE if dark_mode else INK, "b": True, "f": SERIF, "sa": 4}])
    if sub:
        sb = slide.shapes.add_textbox(Inches(0.6), Inches(top + 1.22), Inches(12.1), Inches(0.55))
        add_text(sb, [{"t": sub, "s": 15, "c": GOLD if dark_mode else MUTED, "sa": 0}])


def card(slide, l, t, w, h, fill=WHITE):
    sh = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, l, t, w, h)
    sh.fill.solid()
    sh.fill.fore_color.rgb = fill
    sh.line.color.rgb = LINE
    sh.adjustments[0] = 0.08
    return sh


def photo(slide, path, l, t, w, h):
    if Path(path).exists():
        slide.shapes.add_picture(str(path), l, t, w, h)


def table_slide(slide, rows, left, top, width, col_w, header=True):
    r, c = len(rows), len(rows[0])
    tbl_shape = slide.shapes.add_table(r, c, left, top, width, Inches(0.38 * r))
    tbl = tbl_shape.table
    for i, w in enumerate(col_w):
        tbl.columns[i].width = w
    for i, row in enumerate(rows):
        for j, val in enumerate(row):
            cell = tbl.cell(i, j)
            cell.text = ""
            p = cell.text_frame.paragraphs[0]
            p.alignment = PP_ALIGN.LEFT
            run = p.add_run()
            run.text = val
            is_h = header and i == 0
            set_run(run, 11 if is_h else 11, WHITE if is_h else INK, bold=is_h or j == 0, name=SANS)
            cell.text_frame.word_wrap = True
            fill = cell.fill
            fill.solid()
            if is_h:
                fill.fore_color.rgb = FOREST
            elif i % 2 == 0:
                fill.fore_color.rgb = CREAM
            else:
                fill.fore_color.rgb = WHITE
    return tbl


def build():
    prs = Presentation()
    prs.slide_width = W
    prs.slide_height = H
    slides_meta = []

    # 01 cover
    s = dark(prs)
    rect(s, 0, 0, W, H, INK)
    photo(s, SHOTS / "hero.png", Inches(6.4), Inches(0), Inches(6.95), Inches(7.5))
    rect(s, Inches(6.4), 0, Inches(0.8), H, INK)  # blend
    kicker(s, "Confidential  ·  District companion  ·  2026", Inches(0.7), Inches(1.55), dark=True)
    tb = s.shapes.add_textbox(Inches(0.7), Inches(1.95), Inches(6.3), Inches(2.4))
    add_text(
        tb,
        [
            {"t": "Not another hotel list.", "s": 36, "c": WHITE, "b": True, "f": SERIF, "sa": 8},
            {"t": "A companion for Chikkamagaluru.", "s": 22, "c": GOLD, "f": SERIF, "i": True, "sa": 12},
        ],
    )
    bb = s.shapes.add_textbox(Inches(0.7), Inches(4.55), Inches(5.8), Inches(1.6))
    add_text(
        bb,
        [
            {"t": "Live product pitch for DTPC, coffee board, and destination partners.", "s": 14, "c": IVORY, "sa": 8},
            {"t": "chikkamagaluru-companion.vercel.app", "s": 13, "c": GOLD, "b": True, "sa": 4},
            {"t": "List ₹9.9L   ·   Close ₹8.5L   ·   Walk-away ₹7.5L   + GST", "s": 13, "c": WHITE, "sa": 0},
        ],
    )
    notes(s, "Open on the live URL. Do not start with price. Start with Nature, then the map, then Bean to Cup.")
    slides_meta.append(s)

    # 02 agenda
    s = ivory(prs)
    title_block(s, "Agenda", "Forty minutes. Then a number.")
    items = [
        ("01", "The problem", "Blogs, OTAs, and a missing district OS"),
        ("02", "Live product", "Nature, map, popular, coffee, Chikku"),
        ("03", "Why it is unique", "Eleven capabilities agencies do not ship"),
        ("04", "Market prices", "What Bangalore / tourism agencies actually charge"),
        ("05", "The offer", "₹8.5L close, extras, AMC, second district"),
        ("06", "Close", "Objections, handover, who signs"),
    ]
    for i, (n, h, p) in enumerate(items):
        x = Inches(0.6 + (i % 3) * 4.15)
        y = Inches(2.15 + (i // 3) * 2.15)
        card(s, x, y, Inches(3.95), Inches(1.9))
        box = s.shapes.add_textbox(x + Inches(0.22), y + Inches(0.22), Inches(3.5), Inches(1.5))
        add_text(
            box,
            [
                {"t": n, "s": 12, "c": GOLD, "b": True, "sa": 6},
                {"t": h, "s": 18, "c": INK, "b": True, "f": SERIF, "sa": 6},
                {"t": p, "s": 12, "c": MUTED, "sa": 0},
            ],
        )
    slides_meta.append(s)

    # 03 problem
    s = ivory(prs)
    title_block(s, "The problem", "The district is famous. The web is not useful.")
    probs = [
        ("OTA clones", "Book-now buttons, fake availability, 18% take rates. A department cannot stand behind this."),
        ("Template tourism", "Five sliders, 12 SEO pages, Instagram embed. No taluk, no permit, no season you can walk."),
        ("Pin salad maps", "Google Map dumps mix Hassan, Kodagu, and this district. Visitors get lost on the ghat."),
        ("ChatGPT boxes", "Generic bots invent homestays and jeep fees. Legal and forest-department risk."),
    ]
    for i, (h, p) in enumerate(probs):
        y = Inches(1.95 + i * 1.15)
        card(s, Inches(0.6), y, Inches(12.1), Inches(1.05), WHITE)
        box = s.shapes.add_textbox(Inches(0.85), y + Inches(0.18), Inches(11.6), Inches(0.75))
        add_text(box, [{"t": h, "s": 16, "c": INK, "b": True, "f": SERIF, "sa": 2}, {"t": p, "s": 13, "c": MUTED, "sa": 0}])
    slides_meta.append(s)

    # 04 what it is not
    s = dark(prs)
    title_block(s, "Positioning", "Sell the companion. Not a marketplace.", dark_mode=True)
    cols = [
        ("This is", ["A district OS for visitors", "English + Kannada", "Sourced hours, official links", "Coffee origin as brand film", "Mascot that stays on this map"]),
        ("This is not", ["A booking engine", "A government gazette", "A hotel / homestay list", "A downloadable trip pack", "A generic ChatGPT widget"]),
        ("Why that wins", ["Dept and mathas can endorse it", "No OTA scandal", "Forest permits stay theirs", "Coffee Board has a story", "Credibility on the hairpin"]),
    ]
    for i, (h, pts) in enumerate(cols):
        x = Inches(0.55 + i * 4.2)
        card(s, x, Inches(2.15), Inches(4.0), Inches(4.5), DARK_CARD)
        box = s.shapes.add_textbox(x + Inches(0.25), Inches(2.35), Inches(3.5), Inches(4.1))
        lines = [{"t": h, "s": 18, "c": GOLD, "b": True, "f": SERIF, "sa": 10}]
        for p in pts:
            lines.append({"t": "  ·  " + p, "s": 14, "c": IVORY, "sa": 8})
        add_text(box, lines)
    slides_meta.append(s)

    # 05 30 second pitch
    s = ivory(prs)
    title_block(s, "The 30-second pitch", "Say this. Then open the URL.")
    card(s, Inches(0.6), Inches(1.95), Inches(12.1), Inches(4.7), WHITE)
    box = s.shapes.add_textbox(Inches(0.9), Inches(2.15), Inches(11.5), Inches(4.35))
    add_text(
        box,
        [
            {
                "t": "Chikkamagaluru does not need another hotel list. It needs a companion a visitor can open on the hairpin: which taluk they are in, which peak or fall is actually in this district, when Hebbe is a jeep problem, that Kudremukh is a permit, and that coffee here is a story from seven Mocha seeds to filter coffee — not a café menu.",
                "s": 16,
                "c": INK,
                "f": SERIF,
                "sa": 14,
            },
            {
                "t": "That companion is already live. English and Kannada. Nine taluks. Nature, heritage, food. A cinematic Bean-to-Cup walk. A tiger, Chikku, who only answers this district.",
                "s": 15,
                "c": FOREST,
                "sa": 12,
            },
            {
                "t": "We do not book rooms. That is how you stay credible with the district, the forest department, and the mathas.",
                "s": 15,
                "c": MUTED,
                "i": True,
                "sa": 0,
            },
        ],
    )
    notes(s, "Memorise this paragraph. Do not read the whole deck. This is the spoken core.")
    slides_meta.append(s)

    # 06 live URL
    s = ivory(prs)
    title_block(s, "Live product", "Not a mock. Production.", sub="Hard-refresh if they saw an older hero overlay.")
    urls = [
        ("Home", "chikkamagaluru-companion.vercel.app", "Hero stills, map, Explore, popular, Bean to cup"),
        ("Nature", "/nature", "Seasons you can walk, outdoor catalogue, forest care"),
        ("Map", "/map", "Nine taluks, OSM, Kalasa & Ajjampura current"),
        ("Bean to cup", "/bean-to-cup", "15-beat coffee walk, filter coffee close"),
        ("Places", "/places", "Full catalogue by kind"),
        ("Popular", "/popular", "30 recurring visitor stops + sourced hours"),
    ]
    for i, (h, u, p) in enumerate(urls):
        x = Inches(0.6 + (i % 3) * 4.15)
        y = Inches(2.2 + (i // 3) * 2.2)
        card(s, x, y, Inches(3.95), Inches(2.0))
        box = s.shapes.add_textbox(x + Inches(0.22), y + Inches(0.22), Inches(3.5), Inches(1.6))
        add_text(box, [{"t": h, "s": 16, "c": INK, "b": True, "f": SERIF, "sa": 4}, {"t": u, "s": 12, "c": GOLD_DIM, "b": True, "sa": 6}, {"t": p, "s": 12, "c": MUTED, "sa": 0}])
    slides_meta.append(s)

    # 07 hero snippet
    s = ivory(prs)
    title_block(s, "Snippet  ·  Home", "Editorial type on a still that moves every two seconds.")
    photo(s, SHOTS / "hero.png", Inches(0.6), Inches(2.05), Inches(8.4), Inches(4.85))
    card(s, Inches(9.2), Inches(2.05), Inches(3.5), Inches(4.85), WHITE)
    box = s.shapes.add_textbox(Inches(9.4), Inches(2.25), Inches(3.1), Inches(4.5))
    add_text(
        box,
        [
            {"t": "What to say", "s": 13, "c": GOLD, "b": True, "sa": 8},
            {"t": "Five graded stills: Kudremukh, Mullayanagiri, Ayyanakere, Kemmanagundi sunset, Hebbe. Slow dissolve. No carnival overlay.", "s": 13, "c": INK, "sa": 10},
            {"t": "Cormorant display type. Chikkamagaluru stays on one line on a phone.", "s": 13, "c": INK, "sa": 10},
            {"t": "Reduced-motion visitors see the first still only.", "s": 13, "c": MUTED, "sa": 0},
        ],
    )
    slides_meta.append(s)

    # 08 nature
    s = ivory(prs)
    title_block(s, "Snippet  ·  Nature", "The page a monsoon visitor actually needs.")
    photo(s, SHOTS / "nature.png", Inches(0.6), Inches(2.05), Inches(8.4), Inches(4.85))
    card(s, Inches(9.2), Inches(2.05), Inches(3.5), Inches(4.85), WHITE)
    box = s.shapes.add_textbox(Inches(9.4), Inches(2.25), Inches(3.1), Inches(4.5))
    add_text(
        box,
        [
            {"t": "Show this first to forest / eco buyers.", "s": 13, "c": GOLD, "b": True, "sa": 8},
            {"t": "Four seasons you can walk — not a weather widget.", "s": 13, "c": INK, "sa": 8},
            {"t": "Peaks, falls, lakes, notified forests grouped the way people search.", "s": 13, "c": INK, "sa": 8},
            {"t": "Kudremukh and Bhadra named as permit country. Nothing here is a live gate.", "s": 13, "c": INK, "sa": 8},
            {"t": "Field photographs + forest-care story in the same breath.", "s": 13, "c": MUTED, "sa": 0},
        ],
    )
    slides_meta.append(s)

    # 09 map
    s = ivory(prs)
    title_block(s, "Snippet  ·  Map", "Nine current taluks. Not a pin dump.")
    photo(s, SHOTS / "map.png", Inches(0.6), Inches(2.05), Inches(8.4), Inches(4.85))
    card(s, Inches(9.2), Inches(2.05), Inches(3.5), Inches(4.85), WHITE)
    box = s.shapes.add_textbox(Inches(9.4), Inches(2.25), Inches(3.1), Inches(4.5))
    add_text(
        box,
        [
            {"t": "OSM choropleth", "s": 13, "c": GOLD, "b": True, "sa": 8},
            {"t": "Home: taluks only. Click through: that taluk’s places.", "s": 13, "c": INK, "sa": 8},
            {"t": "Kalasa and Ajjampura shown as current units, not 1990s Mudigere/Tarikere.", "s": 13, "c": INK, "sa": 8},
            {"t": "Orientation only — not a survey. ODbL credited.", "s": 13, "c": MUTED, "sa": 0},
        ],
    )
    slides_meta.append(s)

    # 10 popular
    s = ivory(prs)
    title_block(s, "Snippet  ·  Popular", "Eight featured stops with why — not a dump.")
    photo(s, SHOTS / "popular.png", Inches(0.6), Inches(2.05), Inches(8.4), Inches(4.85))
    card(s, Inches(9.2), Inches(2.05), Inches(3.5), Inches(4.85), WHITE)
    box = s.shapes.add_textbox(Inches(9.4), Inches(2.25), Inches(3.1), Inches(4.5))
    add_text(
        box,
        [
            {"t": "Featured now", "s": 13, "c": GOLD, "b": True, "sa": 8},
            {"t": "Deviramma Temple, Mallenahalli sits in the home carousel. Kalaseshwara stays on the full popular list.", "s": 13, "c": INK, "sa": 10},
            {"t": "Why people come + sourced hours (district, forest, matha).", "s": 13, "c": INK, "sa": 8},
            {"t": "Full popular page: ~30 in-district stops from Tripadvisor / district loops.", "s": 13, "c": MUTED, "sa": 0},
        ],
    )
    slides_meta.append(s)

    # 11 bean to cup
    s = dark(prs)
    title_block(s, "Snippet  ·  Bean to cup", "The closer for Coffee Board and estates.", dark_mode=True)
    photo(s, SHOTS / "btc.png", Inches(0.6), Inches(2.05), Inches(8.4), Inches(4.85))
    card(s, Inches(9.2), Inches(2.05), Inches(3.5), Inches(4.85), DARK_CARD)
    box = s.shapes.add_textbox(Inches(9.4), Inches(2.25), Inches(3.1), Inches(4.5))
    add_text(
        box,
        [
            {"t": "15 beats, one still at a time", "s": 13, "c": GOLD, "b": True, "sa": 8},
            {"t": "Baba Budan → Mocha → courtyard → shade → cherry → roast → filter coffee.", "s": 13, "c": IVORY, "sa": 10},
            {"t": "Not a shop. Lore labelled lore.", "s": 13, "c": IVORY, "sa": 8},
            {"t": "Reduced-motion: same stills as a longread.", "s": 13, "c": GOLD, "sa": 0},
        ],
    )
    slides_meta.append(s)

    # 12 unique features
    s = ivory(prs)
    title_block(s, "Unique now", "Eleven things a ₹2L agency site will not include.")
    feats = [
        ("01  Honest scope", "No rooms, carts, or fake Book now. Official links stay the authority."),
        ("02  Nine-taluk map", "Current OSM units, places on the taluk page only."),
        ("03  Real catalogue", "Peaks, falls, temples, lakes, wildlife, treks, coffee country."),
        ("04  Nature OS", "Seasons, outdoor groups, forest care, field photos."),
        ("05  Bean to Cup", "Brand film + encyclopedia for the crop."),
        ("06  Ask Chikku", "District-only Q&A, 1–5 day sketches, iOS-safe, streams text."),
        ("07  EN + Kannada", "Toggle on every shell."),
        ("08  Sourced popular", "Hours from district, forest, Sringeri, Horanadu."),
        ("09  Tourism numbers", "Published visits, seasonal planner, taluk counts."),
        ("10  Motion + restraint", "Carousel, DriftWall, accordion; freeze on reduced-motion."),
        ("11  Licences", "Commons / CC stills, named artists. Defensible in a legal review."),
        ("12  Phone first", "Titles do not snap. Chikku survives the iOS keyboard."),
    ]
    for i, (h, p) in enumerate(feats):
        x = Inches(0.5 + (i % 3) * 4.2)
        y = Inches(1.85 + (i // 3) * 1.25)
        card(s, x, y, Inches(4.05), Inches(1.15), WHITE)
        box = s.shapes.add_textbox(x + Inches(0.16), y + Inches(0.12), Inches(3.75), Inches(0.95))
        add_text(box, [{"t": h, "s": 13, "c": INK, "b": True, "sa": 3}, {"t": p, "s": 11, "c": MUTED, "sa": 0}])
    slides_meta.append(s)

    # 13 market
    s = ivory(prs)
    title_block(
        s,
        "Market  ·  India 2025–26",
        "What other agencies actually charge for tourism sites.",
        sub="Blended quotes from typical Bangalore / Mysuru / national hospitality vendors. Not a tender scrape.",
    )
    rows = [
        ["Tier", "Typical vendor", "What they ship", "Fee (INR)"],
        ["Freelance brochure", "Fiverr, Justdial, 1–2 person shops", "5–8 WP pages, slider, form", "₹25k – ₹80k"],
        ["Local digital agency", "5–15 person Bengaluru shops", "10–20 pages, enquiry, WhatsApp", "₹1.5L – ₹4L"],
        ["Tourism boutique", "Hotel / destination specialists", "Custom UI, photo pack, MMT iframe", "₹4L – ₹8L"],
        ["Premium studio", "National creative + tech", "Motion, CMS, multilingual campaign", "₹10L – ₹25L"],
        ["DTPC / govt tender", "Empanelled IT vendors", "Portal, bilingual, AMC, often ugly", "₹8L – ₹40L"],
        ["OTA / marketplace", "Product companies", "Inventory, payments, 10–18% take", "₹15L+ plus rev share"],
    ]
    table_slide(
        s,
        rows,
        Inches(0.5),
        Inches(2.15),
        Inches(12.3),
        [Inches(2.3), Inches(3.1), Inches(4.3), Inches(2.6)],
    )
    cap = s.shapes.add_textbox(Inches(0.6), Inches(6.55), Inches(12), Inches(0.45))
    add_text(cap, [{"t": "AMC in this market is usually 15–25% of build. Booking widgets look cheap until legal and chargebacks arrive.", "s": 12, "c": MUTED, "sa": 0}])
    slides_meta.append(s)

    # 14 where we sit
    s = dark(prs)
    title_block(s, "Where this sits", "Boutique depth, studio craft, tender honesty — without the OTA.", dark_mode=True)
    box = s.shapes.add_textbox(Inches(0.6), Inches(1.95), Inches(12.1), Inches(0.7))
    add_text(
        box,
        [{"t": "Rebuild from scratch at a mid-agency blended rate (₹10–15k/day, two people, 16–20 weeks) is ₹12–20 lakh. You are buying finished inventory, not a kickoff.", "s": 15, "c": IVORY, "sa": 0}],
    )
    comps = [
        ("vs ₹80k brochure", "They get a template. You get a taluk map, catalogue, coffee film, mascot that will not invent a homestay."),
        ("vs ₹3L agency", "They get 15 pages and a form. You get 15+ surfaces, bilingual, sourced hours, Nature as a product."),
        ("vs ₹12L studio", "They start in month four. You are live on a phone in the ghats this week. Brand pass is 14 days."),
        ("vs ₹20L tender portal", "They ship CMS + ugliness. You ship editorial OS the department can actually show a minister."),
    ]
    for i, (h, p) in enumerate(comps):
        x = Inches(0.55 + (i % 2) * 6.35)
        y = Inches(2.8 + (i // 2) * 1.85)
        card(s, x, y, Inches(6.1), Inches(1.7), DARK_CARD)
        tb = s.shapes.add_textbox(x + Inches(0.25), y + Inches(0.2), Inches(5.6), Inches(1.35))
        add_text(tb, [{"t": h, "s": 16, "c": GOLD, "b": True, "f": SERIF, "sa": 6}, {"t": p, "s": 13, "c": IVORY, "sa": 0}])
    slides_meta.append(s)

    # 15 SOW comparison
    s = ivory(prs)
    title_block(s, "Scope comparison", "Same meeting, three quotes.")
    rows = [
        ["Capability", "₹3L agency", "₹10L studio", "This companion"],
        ["Bilingual EN + Kannada", "Often English only", "Paid extra", "In every shell"],
        ["Taluk map (current 9)", "Google iframe", "Custom if scoped", "OSM choropleth, live"],
        ["Place catalogue depth", "12–20 SEO pages", "CMS empty until content", "District set, sourced"],
        ["Sourced temple/forest hours", "Rare", "If content team hired", "Yes, with links"],
        ["Coffee origin film-walk", "No", "Campaign extra ₹3–6L", "Bean to Cup 00–14"],
        ["Grounded mascot Q&A", "Tawk.to / GPT", "Custom bot extra", "Chikku, district-only"],
        ["No fake booking", "Usually Book now", "Depends", "By design"],
        ["Nature season logic", "Gallery", "Microsite extra", "Own hub"],
        ["Time to useful URL", "8–14 weeks", "16–24 weeks", "14-day brand handover"],
        ["Indicative fee", "₹1.5–4L", "₹10–25L", "Close ₹8.5L + GST"],
    ]
    table_slide(
        s,
        rows,
        Inches(0.4),
        Inches(1.85),
        Inches(12.5),
        [Inches(3.3), Inches(2.9), Inches(3.2), Inches(3.1)],
    )
    slides_meta.append(s)

    # 16 commercials
    s = ivory(prs)
    title_block(s, "Commercials", "One number to close. Three numbers to remember.")
    deals = [
        ("List", "₹9.9 lakh", "Open the meeting here. Turnkey district OS on their domain."),
        ("Close", "₹8.5 lakh", "Target. Light brand, 90-day hypercare, this district."),
        ("Walk-away", "₹7.5 lakh", "As-live handover. Below this you are selling a brochure."),
        ("Floor", "₹5.0 lakh", "Do not. It trains the buyer to treat this as freelance hours."),
    ]
    for i, (k, n, p) in enumerate(deals):
        x = Inches(0.5 + i * 3.2)
        card(s, x, Inches(1.95), Inches(3.05), Inches(2.35), FOREST if k == "Close" else WHITE)
        box = s.shapes.add_textbox(x + Inches(0.18), Inches(2.1), Inches(2.7), Inches(2.1))
        hc, nc, pc = (GOLD, WHITE, IVORY) if k == "Close" else (GOLD_DIM, INK, MUTED)
        add_text(box, [{"t": k.upper(), "s": 11, "c": hc, "b": True, "sa": 6}, {"t": n, "s": 22, "c": nc, "b": True, "f": SERIF, "sa": 8}, {"t": p, "s": 12, "c": pc, "sa": 0}])
    card(s, Inches(0.5), Inches(4.5), Inches(12.3), Inches(2.15), WHITE)
    box = s.shapes.add_textbox(Inches(0.75), Inches(4.65), Inches(11.8), Inches(1.9))
    add_text(
        box,
        [
            {"t": "Included in the close  ·  GST extra", "s": 13, "c": GOLD, "b": True, "sa": 6},
            {"t": "Domain + Vercel production  ·  wordmark / colour pass in 14 days  ·  90-day hypercare  ·  featured-eight and Chikku line edits  ·  bilingual as shipped  ·  training (1 session).", "s": 14, "c": INK, "sa": 8},
            {"t": "AMC ₹1.8 lakh / year  ·  copy, photos, Chikku answers, stats, small UX. Typical market AMC on an ₹8.5L build would be ₹1.3–2.1L (15–25%).", "s": 14, "c": MUTED, "sa": 0},
        ],
    )
    slides_meta.append(s)

    # 17 extras
    s = ivory(prs)
    title_block(s, "Extras  ·  second invoice", "Do not bundle these into ₹8.5L.")
    rows = [
        ["Extra", "Buyer reason", "Add (INR)"],
        ["Live LLM Chikku, still grounded", "Ask anything without leaving the district", "₹1.5 – 2.5L"],
        ["CMS for hours / closures / festivals", "Dept updates without a developer", "₹2.0 – 2.5L"],
        ["Hero film + stills production", "3–5s clips, licensed crew", "₹1.5 – 4.0L"],
        ["Second district (Kodagu, Hassan…)", "Same OS, new map + catalogue", "60–70% of first (~₹5–7L)"],
        ["Hindi or Tulu layer", "Statewide tourism", "₹0.8 – 1.2L / language"],
        ["WhatsApp / voice Chikku", "Drivers and pilgrims", "₹2.0 – 3.0L"],
        ["Analytics + monthly PDF", "What opened: Hebbe, Sringeri…", "₹0.6L + ₹25k/mo"],
        ["Bean-to-Cup studio (passworded)", "They tweak the coffee walk", "₹0.8L"],
        ["A11y + performance report", "Tender checkbox", "₹0.4L"],
    ]
    table_slide(
        s,
        rows,
        Inches(0.5),
        Inches(1.85),
        Inches(12.3),
        [Inches(4.0), Inches(5.1), Inches(3.2)],
    )
    slides_meta.append(s)

    # 18 who buys
    s = ivory(prs)
    title_block(s, "Who this is for", "One product, three buyers, three proofs.")
    buyers = [
        ("DTPC / district / Karnataka Tourism", "Proof: Nature + map + sourced hours. Close ₹12–16L tender-shaped (GST, training, year-1 AMC).", "Do not lead with Bean to Cup."),
        ("Coffee Board / estate association", "Proof: Bean to Cup → filter coffee. Close ₹8.5L private.", "Do not offer booking."),
        ("Private DMO / responsible operator", "Proof: Chikku 2-day sketch + popular hours. Close ₹8.5L.", "If they demand OTA, walk."),
    ]
    for i, (h, p, n) in enumerate(buyers):
        card(s, Inches(0.6), Inches(1.95 + i * 1.55), Inches(12.1), Inches(1.42), WHITE)
        box = s.shapes.add_textbox(Inches(0.85), Inches(2.08 + i * 1.55), Inches(11.6), Inches(1.2))
        add_text(box, [{"t": h, "s": 16, "c": INK, "b": True, "f": SERIF, "sa": 4}, {"t": p, "s": 13, "c": MUTED, "sa": 3}, {"t": n, "s": 12, "c": GOLD_DIM, "i": True, "sa": 0}])
    slides_meta.append(s)

    # 19 demo
    s = ivory(prs)
    title_block(s, "Room script", "40 minutes. URL on the table.")
    steps = [
        ("1:30", "Home hero", "Not a booking site. A companion."),
        ("2:00", "Map → taluk", "This is the district, not a pin salad."),
        ("2:00", "Nature", "The page a monsoon visitor needs."),
        ("2:00", "Popular → Deviramma", "Featured stops with why."),
        ("3:00", "Bean to Cup beat 14", "Coffee-board buyer is done."),
        ("1:00", "Chikku: Hebbe / 2 days", "Show off-topic refusal."),
        ("3:00", "Price slide", "₹9.9 list / ₹8.5 close / ₹1.8 AMC."),
        ("1:00", "Ask", "If we put your wordmark on this URL in 14 days, who signs?"),
    ]
    for i, (t, h, p) in enumerate(steps):
        x = Inches(0.5 + (i % 4) * 3.2)
        y = Inches(1.95 + (i // 4) * 2.35)
        card(s, x, y, Inches(3.05), Inches(2.15))
        box = s.shapes.add_textbox(x + Inches(0.18), y + Inches(0.18), Inches(2.7), Inches(1.85))
        add_text(box, [{"t": t, "s": 12, "c": GOLD, "b": True, "sa": 6}, {"t": h, "s": 15, "c": INK, "b": True, "f": SERIF, "sa": 6}, {"t": p, "s": 12, "c": MUTED, "sa": 0}])
    slides_meta.append(s)

    # 20 objections
    s = ivory(prs)
    title_block(s, "Objections", "Answer once. Then wait.")
    objs = [
        ("We can get a site for ₹80,000.", "You can get a brochure. You cannot get a taluk map, a sourced catalogue, a coffee film, and a mascot that will not invent a homestay."),
        ("Can it book rooms?", "No. That is the point. A booking engine is a second product and a second legal stack."),
        ("Udupi Tourism looks free.", "That is a department site. You are buying the editorial + product layer they still do not have."),
        ("We need changes.", "Brand, domain, featured eight, Chikku lines: inside ₹8.5L. CMS, LLM, film, second district: rate card."),
        ("Send a PDF.", "The demo is the PDF. One-pager and 14-day checklist after you confirm the close number."),
        ("Our nephew does websites.", "Ask him to ship nine current taluks, Bean to Cup, and a bot that refuses Coorg. Then compare."),
    ]
    for i, (q, a) in enumerate(objs):
        x = Inches(0.5 + (i % 2) * 6.4)
        y = Inches(1.85 + (i // 2) * 1.65)
        card(s, x, y, Inches(6.2), Inches(1.52), WHITE)
        box = s.shapes.add_textbox(x + Inches(0.2), y + Inches(0.14), Inches(5.8), Inches(1.28))
        add_text(box, [{"t": q, "s": 13, "c": INK, "b": True, "sa": 4}, {"t": a, "s": 12, "c": MUTED, "sa": 0}])
    slides_meta.append(s)

    # 21 handover
    s = ivory(prs)
    title_block(s, "14-day handover", "They own a live URL, not a Figma.")
    days = [
        ("Day 1–2", "Access, domain, wordmark, colour tokens."),
        ("Day 3–7", "Header, featured eight, Chikku greeting, footer legal line."),
        ("Day 8–10", "Training: update flow, what not to add (bookings)."),
        ("Day 11–14", "Go-live on their domain, 90-day hypercare clock starts."),
        ("Day 30", "First stats + broken-link pass."),
        ("Day 90", "Handover review. Convert to AMC ₹1.8L."),
    ]
    for i, (h, p) in enumerate(days):
        x = Inches(0.5 + (i % 3) * 4.2)
        y = Inches(1.95 + (i // 3) * 2.2)
        card(s, x, y, Inches(4.0), Inches(2.0), WHITE)
        box = s.shapes.add_textbox(x + Inches(0.22), y + Inches(0.28), Inches(3.55), Inches(1.5))
        add_text(box, [{"t": h, "s": 16, "c": GOLD_DIM, "b": True, "sa": 8}, {"t": p, "s": 14, "c": INK, "sa": 0}])
    slides_meta.append(s)

    # 22 ask
    s = dark(prs)
    kicker(s, "The ask", Inches(0.7), Inches(1.7), dark=True)
    tb = s.shapes.add_textbox(Inches(0.7), Inches(2.05), Inches(12), Inches(1.5))
    add_text(tb, [{"t": "Put your wordmark on this URL in 14 days.", "s": 32, "c": WHITE, "b": True, "f": SERIF, "sa": 0}])
    nums = [
        ("Close", "₹8.5 lakh + GST"),
        ("Care", "₹1.8 lakh / year"),
        ("Next district", "~60% of year one"),
    ]
    for i, (k, v) in enumerate(nums):
        x = Inches(0.7 + i * 4.1)
        card(s, x, Inches(3.8), Inches(3.85), Inches(1.7), DARK_CARD)
        box = s.shapes.add_textbox(x + Inches(0.25), Inches(3.98), Inches(3.4), Inches(1.4))
        add_text(box, [{"t": k.upper(), "s": 12, "c": GOLD, "b": True, "sa": 8}, {"t": v, "s": 20, "c": WHITE, "b": True, "f": SERIF, "sa": 0}])
    ask = s.shapes.add_textbox(Inches(0.7), Inches(5.75), Inches(12), Inches(0.9))
    add_text(ask, [{"t": "Who signs?  ·  chikkamagaluru-companion.vercel.app  ·  Not for sale as rooms. For sale as a companion.", "s": 15, "c": GOLD, "sa": 0}])
    notes(
        s,
        "If we put your wordmark on this URL in 14 days, who signs? Then silence.",
    )
    slides_meta.append(s)

    # 23 appendix
    s = ivory(prs)
    title_block(s, "Appendix", "One-pager after they confirm the number.")
    card(s, Inches(0.6), Inches(1.95), Inches(12.1), Inches(4.7), WHITE)
    box = s.shapes.add_textbox(Inches(0.9), Inches(2.15), Inches(11.5), Inches(4.35))
    add_text(
        box,
        [
            {"t": "Product  ·  Chikkamagaluru Companion (live)", "s": 16, "c": INK, "b": True, "f": SERIF, "sa": 10},
            {"t": "Handover  ·  domain, Vercel, wordmark, 14-day brand pass, 90-day hypercare", "s": 14, "c": MUTED, "sa": 8},
            {"t": "Investment  ·  ₹8,50,000 + GST", "s": 14, "c": INK, "b": True, "sa": 8},
            {"t": "Care  ·  ₹1,80,000 / year", "s": 14, "c": INK, "sa": 8},
            {"t": "Next district  ·  quoted separately, ~60% of year-one", "s": 14, "c": INK, "sa": 8},
            {"t": "Not included  ·  booking, live LLM, film production, CMS", "s": 14, "c": MUTED, "sa": 8},
            {"t": "Nature  ·  chikkamagaluru-companion.vercel.app/nature", "s": 14, "c": GOLD_DIM, "b": True, "sa": 0},
        ],
    )
    slides_meta.append(s)

    total = len(prs.slides)
    for i, sl in enumerate(prs.slides, 1):
        bg = sl.shapes[0].fill.fore_color.rgb
        dark_mode = bg == INK
        footer(sl, i, total, dark=dark_mode)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    prs.save(str(OUT))
    ART.parent.mkdir(parents=True, exist_ok=True)
    prs.save(str(ART))
    print("wrote", OUT, "slides", total)


if __name__ == "__main__":
    build()
