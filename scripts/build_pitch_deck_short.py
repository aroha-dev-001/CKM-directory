#!/usr/bin/env python3
"""Six-slide pitch deck for the Chikkamagaluru Companion."""
from pathlib import Path

from lxml import etree
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN
from pptx.oxml.ns import qn
from pptx.util import Inches, Pt

INK = RGBColor(0x0C, 0x1F, 0x13)
FOREST = RGBColor(0x14, 0x36, 0x1F)
GOLD = RGBColor(0xC8, 0xAE, 0x6E)
GOLD_DIM = RGBColor(0xA8, 0x8C, 0x4A)
IVORY = RGBColor(0xF5, 0xF1, 0xE8)
WHITE = RGBColor(0xFC, 0xFB, 0xF8)
MUTED = RGBColor(0x5A, 0x6B, 0x5E)
LINE = RGBColor(0xD9, 0xD3, 0xC4)
CREAM = RGBColor(0xFB, 0xFA, 0xF5)
DARK_CARD = RGBColor(0x0A, 0x18, 0x10)

SERIF = "Noto Serif Display"
SANS = "Inter"
SHOTS = Path("/tmp/pitch-shots")
OUT = Path("/workspace/pitch/Chikkamagaluru-Companion-Pitch-6.pptx")
ART = Path("/opt/cursor/artifacts/Chikkamagaluru-Companion-Pitch-6.pptx")
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


def add_text(box, lines, align=PP_ALIGN.LEFT):
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
        run = p.add_run()
        run.text = item["t"]
        set_run(run, item.get("s", 14), item.get("c", INK), item.get("b", False), item.get("i", False), item.get("f", SANS))


def rect(slide, l, t, w, h, fill):
    sh = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, l, t, w, h)
    sh.fill.solid()
    sh.fill.fore_color.rgb = fill
    sh.line.fill.background()
    return sh


def card(slide, l, t, w, h, fill=WHITE):
    sh = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, l, t, w, h)
    sh.fill.solid()
    sh.fill.fore_color.rgb = fill
    sh.line.color.rgb = LINE
    sh.adjustments[0] = 0.08
    return sh


def kicker(slide, text, l, t):
    box = slide.shapes.add_textbox(l, t, Inches(12), Inches(0.3))
    add_text(box, [{"t": text.upper(), "s": 11, "c": GOLD, "b": True}])


def footer(slide, n, total, dark=False):
    c = GOLD if dark else MUTED
    box = slide.shapes.add_textbox(Inches(0.55), Inches(7.18), Inches(10), Inches(0.22))
    add_text(box, [{"t": "Chikkamagaluru Companion  ·  Pitch", "s": 10, "c": c}])
    num = slide.shapes.add_textbox(Inches(11.5), Inches(7.18), Inches(1.3), Inches(0.22))
    add_text(num, [{"t": f"{n} / {total}", "s": 10, "c": c, "a": PP_ALIGN.RIGHT}])


def ivory(prs):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    rect(s, 0, 0, W, H, IVORY)
    rect(s, 0, 0, Inches(0.12), H, FOREST)
    return s


def photo(slide, name, l, t, w, h):
    p = SHOTS / name
    if p.exists():
        slide.shapes.add_picture(str(p), l, t, w, h)


def table_slide(slide, rows, left, top, width, col_w):
    r, c = len(rows), len(rows[0])
    tbl = slide.shapes.add_table(r, c, left, top, width, Inches(0.42 * r)).table
    for i, w in enumerate(col_w):
        tbl.columns[i].width = w
    for i, row in enumerate(rows):
        for j, val in enumerate(row):
            cell = tbl.cell(i, j)
            cell.text = ""
            p = cell.text_frame.paragraphs[0]
            run = p.add_run()
            run.text = val
            is_h = i == 0
            set_run(run, 12, WHITE if is_h else INK, bold=is_h or j == 0)
            cell.text_frame.word_wrap = True
            cell.fill.solid()
            cell.fill.fore_color.rgb = FOREST if is_h else (CREAM if i % 2 == 0 else WHITE)


def build():
    prs = Presentation()
    prs.slide_width, prs.slide_height = W, H

    # 1 Cover
    s = prs.slides.add_slide(prs.slide_layouts[6])
    rect(s, 0, 0, W, H, INK)
    photo(s, "hero.png", Inches(6.5), 0, Inches(6.85), H)
    rect(s, Inches(6.5), 0, Inches(0.7), H, INK)
    kicker(s, "Live district OS  ·  Not a booking site", Inches(0.65), Inches(1.7))
    tb = s.shapes.add_textbox(Inches(0.65), Inches(2.05), Inches(6.2), Inches(2.4))
    add_text(
        tb,
        [
            {"t": "A companion for Chikkamagaluru.", "s": 32, "c": WHITE, "b": True, "f": SERIF, "sa": 10},
            {"t": "Map, nature, coffee walk, grounded mascot. Already live.", "s": 16, "c": GOLD, "i": True, "f": SERIF, "sa": 0},
        ],
    )
    bb = s.shapes.add_textbox(Inches(0.65), Inches(5.15), Inches(5.9), Inches(1.4))
    add_text(
        bb,
        [
            {"t": "chikkamagaluru-companion.vercel.app", "s": 14, "c": GOLD, "b": True, "sa": 8},
            {"t": "Close  ₹8.5L + GST     AMC  ₹1.8L / year", "s": 15, "c": WHITE, "sa": 0},
        ],
    )
    footer(s, 1, 6, dark=True)

    # 2 Product proof
    s = ivory(prs)
    kicker(s, "01  ·  Live product", Inches(0.55), Inches(0.28))
    title = s.shapes.add_textbox(Inches(0.55), Inches(0.52), Inches(12), Inches(0.55))
    add_text(title, [{"t": "Open these. The deck is the demo.", "s": 26, "c": INK, "b": True, "f": SERIF}])
    shots = [
        ("hero.png", "Home", "Five stills, editorial type"),
        ("nature.png", "Nature", "Seasons you can walk"),
        ("map.png", "Map", "Nine current taluks"),
        ("btc.png", "Bean to cup", "Filter coffee close"),
    ]
    for i, (fn, h, p) in enumerate(shots):
        x = Inches(0.45 + i * 3.2)
        photo(s, fn, x, Inches(1.25), Inches(3.05), Inches(3.55))
        box = s.shapes.add_textbox(x, Inches(4.88), Inches(3.05), Inches(0.85))
        add_text(box, [{"t": h, "s": 14, "c": INK, "b": True, "f": SERIF, "sa": 2}, {"t": p, "s": 12, "c": MUTED, "sa": 0}])
    note = s.shapes.add_textbox(Inches(0.55), Inches(5.85), Inches(12.2), Inches(1.1))
    add_text(
        note,
        [
            {
                "t": "Also: popular carousel (Deviramma Temple, Mallenahalli)  ·  Ask Chikku (district-only, 1–5 day sketches, iOS-safe)  ·  EN + Kannada  ·  no rooms, no fake Book now.",
                "s": 13,
                "c": MUTED,
                "sa": 0,
            }
        ],
    )
    footer(s, 2, 6)

    # 3 Why unique
    s = ivory(prs)
    kicker(s, "02  ·  Why this is not a ₹3L brochure", Inches(0.55), Inches(0.28))
    title = s.shapes.add_textbox(Inches(0.55), Inches(0.52), Inches(12), Inches(0.55))
    add_text(title, [{"t": "Already built. Agencies charge extra for each row.", "s": 26, "c": INK, "b": True, "f": SERIF}])
    feats = [
        ("Taluk map", "Nine current OSM taluks. Places open on the taluk page, not a pin salad."),
        ("Nature hub", "Seasons, ridges, water, permit forests. Kudremukh / Bhadra are not a live gate."),
        ("Bean to Cup", "15-beat walk: Baba Budan → Mocha → shade → filter coffee. Not a shop."),
        ("Ask Chikku", "Tiger mascot. Stays on this district. Refuses off-topic. Streams answers."),
        ("Sourced hours", "District, forest, Sringeri, Horanadu links. Fees stay on their pages."),
        ("Bilingual + licences", "EN / Kannada. Commons stills with named artists. Defensible in review."),
    ]
    for i, (h, p) in enumerate(feats):
        x = Inches(0.5 + (i % 3) * 4.2)
        y = Inches(1.25 + (i // 3) * 2.7)
        card(s, x, y, Inches(4.0), Inches(2.45))
        box = s.shapes.add_textbox(x + Inches(0.22), y + Inches(0.28), Inches(3.55), Inches(2.0))
        add_text(box, [{"t": h, "s": 16, "c": INK, "b": True, "f": SERIF, "sa": 8}, {"t": p, "s": 13, "c": MUTED, "sa": 0}])
    footer(s, 3, 6)

    # 4 Market
    s = ivory(prs)
    kicker(s, "03  ·  India market 2025–26", Inches(0.55), Inches(0.28))
    title = s.shapes.add_textbox(Inches(0.55), Inches(0.52), Inches(12), Inches(0.55))
    add_text(title, [{"t": "What other agencies charge vs this live OS.", "s": 26, "c": INK, "b": True, "f": SERIF}])
    rows = [
        ["Tier", "What they ship", "Typical fee", "Time"],
        ["Freelance WordPress", "5–8 pages, slider, contact form", "₹25k – ₹80k", "2–4 weeks"],
        ["Local Bengaluru agency", "10–20 pages, enquiry, WhatsApp", "₹1.5L – ₹4L", "8–14 weeks"],
        ["Tourism boutique", "Custom UI + booking iframe", "₹4L – ₹8L", "10–16 weeks"],
        ["Premium studio", "Motion, CMS, campaign site", "₹10L – ₹25L", "16–24 weeks"],
        ["DTPC / govt tender", "Portal, bilingual, AMC, often ugly", "₹8L – ₹40L", "Tender cycle"],
        ["This companion", "Map, catalogue, coffee walk, Chikku, EN+KN", "Close ₹8.5L + GST", "14-day handover"],
    ]
    table_slide(s, rows, Inches(0.5), Inches(1.25), Inches(12.3), [Inches(2.6), Inches(4.4), Inches(2.8), Inches(2.5)])
    cap = s.shapes.add_textbox(Inches(0.55), Inches(6.35), Inches(12.2), Inches(0.65))
    add_text(
        cap,
        [
            {
                "t": "Rebuild from scratch at ₹10–15k/day × 2 people × 16–20 weeks is ₹12–20L. You are buying finished inventory. AMC in this market is 15–25% of build (here: ₹1.8L).",
                "s": 13,
                "c": MUTED,
                "sa": 0,
            }
        ],
    )
    footer(s, 4, 6)

    # 5 Offer
    s = ivory(prs)
    kicker(s, "04  ·  The offer", Inches(0.55), Inches(0.28))
    title = s.shapes.add_textbox(Inches(0.55), Inches(0.52), Inches(12), Inches(0.55))
    add_text(title, [{"t": "One number to close. Extras on a second invoice.", "s": 26, "c": INK, "b": True, "f": SERIF}])
    deals = [
        ("List", "₹9.9L", "Open here", False),
        ("Close", "₹8.5L", "Target + GST", True),
        ("Walk-away", "₹7.5L", "As-live only", False),
        ("AMC", "₹1.8L/yr", "Copy, Chikku, stats", False),
    ]
    for i, (k, n, p, on) in enumerate(deals):
        x = Inches(0.5 + i * 3.2)
        card(s, x, Inches(1.25), Inches(3.05), Inches(2.15), FOREST if on else WHITE)
        box = s.shapes.add_textbox(x + Inches(0.18), Inches(1.4), Inches(2.7), Inches(1.9))
        add_text(
            box,
            [
                {"t": k.upper(), "s": 11, "c": GOLD if on else GOLD_DIM, "b": True, "sa": 6},
                {"t": n, "s": 24, "c": WHITE if on else INK, "b": True, "f": SERIF, "sa": 6},
                {"t": p, "s": 12, "c": IVORY if on else MUTED, "sa": 0},
            ],
        )
    inc = s.shapes.add_textbox(Inches(0.55), Inches(3.55), Inches(12.2), Inches(0.55))
    add_text(inc, [{"t": "In the close: domain, Vercel, 14-day wordmark pass, featured eight + Chikku lines, 90-day hypercare, one training session. Floor ₹5L — do not.", "s": 13, "c": MUTED}])
    extras = [
        ("Live LLM Chikku", "₹1.5–2.5L"),
        ("Hours CMS", "₹2–2.5L"),
        ("Film / stills", "₹1.5–4L"),
        ("Second district", "~60% of first"),
        ("Hindi / Tulu", "₹0.8–1.2L each"),
        ("WhatsApp Chikku", "₹2–3L"),
    ]
    for i, (h, p) in enumerate(extras):
        x = Inches(0.5 + (i % 6) * 2.1)
        card(s, x, Inches(4.25), Inches(2.0), Inches(2.4))
        box = s.shapes.add_textbox(x + Inches(0.12), Inches(4.4), Inches(1.76), Inches(2.1))
        add_text(box, [{"t": h, "s": 12, "c": INK, "b": True, "sa": 8}, {"t": p, "s": 14, "c": GOLD_DIM, "b": True, "sa": 0}])
    footer(s, 5, 6)

    # 6 Ask
    s = prs.slides.add_slide(prs.slide_layouts[6])
    rect(s, 0, 0, W, H, INK)
    rect(s, 0, 0, Inches(0.12), H, GOLD)
    kicker(s, "05  ·  The ask", Inches(0.65), Inches(1.15))
    tb = s.shapes.add_textbox(Inches(0.65), Inches(1.5), Inches(12), Inches(1.5))
    add_text(tb, [{"t": "If we put your wordmark on this URL in 14 days, who signs?", "s": 28, "c": WHITE, "b": True, "f": SERIF}])
    points = [
        ("Private / coffee / DMO", "Close ₹8.5L + GST. Proof: Bean to Cup, then Chikku “2-day sketch”."),
        ("DTPC / tender", "Shape as ₹12–16L all-in (GST, training, year-1 AMC). Proof: Nature + map."),
        ("Do not sell", "Booking engine, fake fees, OTA clone. That is a different product."),
    ]
    for i, (h, p) in enumerate(points):
        x = Inches(0.65 + i * 4.15)
        card(s, x, Inches(3.35), Inches(3.95), Inches(2.35), DARK_CARD)
        box = s.shapes.add_textbox(x + Inches(0.22), Inches(3.5), Inches(3.5), Inches(2.05))
        add_text(box, [{"t": h, "s": 14, "c": GOLD, "b": True, "sa": 8}, {"t": p, "s": 13, "c": IVORY, "sa": 0}])
    foot = s.shapes.add_textbox(Inches(0.65), Inches(5.95), Inches(12), Inches(0.7))
    add_text(foot, [{"t": "Then stop talking.  ·  chikkamagaluru-companion.vercel.app/nature", "s": 14, "c": GOLD}])
    footer(s, 6, 6, dark=True)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    prs.save(str(OUT))
    ART.parent.mkdir(parents=True, exist_ok=True)
    prs.save(str(ART))
    print("wrote", OUT, "slides", len(prs.slides))


if __name__ == "__main__":
    build()
