#!/usr/bin/env python3
"""Patch the restored Kage walk into a Baba Budan 3D story without stretching stills."""
from pathlib import Path

p = Path("/workspace/dist/bean-to-cup.html")
t = p.read_text(encoding="utf-8")

t = t.replace(
    "<title>Bean to Cup — Chikkamagaluru</title>",
    "<title>Baba Budan — a Kage walk — Chikkamagaluru</title>",
)
t = t.replace(
    'content="Shade path, cherry, seed, roast, filter and cup — a six-still walk through Chikkamagaluru coffee, inside the live Three.js sanctuary from ThreeUI Kage."',
    'content="A 3D night walk through Baba Budan’s coffee story: seven Mocha seeds, Chandra Drona, then shade to davara. Live Three.js sanctuary. Not a shop."',
)

t = t.replace(
    """    <div class="pre-jp jp">ಬೀನ್ ಟು ಕಪ್</div>
    <div class="pre-bar"><i id="pre-fill"></i></div>
    <div class="pre-meta">
      <span>Raising the shade canopy</span><b><span id="pre-pct">0</span>%</b>""",
    """    <div class="pre-jp jp">ಬಾಬಾ ಬುದನ್</div>
    <div class="pre-bar"><i id="pre-fill"></i></div>
    <div class="pre-meta">
      <span>Raising the ridge</span><b><span id="pre-pct">0</span>%</b>""",
)

t = t.replace("<b>BEAN TO CUP</b><i>CHIKKAMAGALURU</i>", "<b>BABA BUDAN</b><i>BEAN TO CUP</i>")
t = t.replace(
    """    <a class="nav-link" href="index.html" data-cursor><span>Companion</span><span class="alt">ಮನೆ</span></a>
    <a class="nav-link" href="#gate" data-cursor><span>Shade</span><span class="alt">ನೆರಳು</span></a>
    <a class="nav-link" href="#pathways" data-cursor><span>Cherry</span><span class="alt">ಹಣ್ಣು</span></a>
    <a class="nav-link" href="#lessons" data-cursor><span>Fire</span><span class="alt">ಬೆಂಕಿ</span></a>
    <a class="nav-link" href="#eternity" data-cursor><span>Cup</span><span class="alt">ಕಪ್</span></a>""",
    """    <a class="nav-link" href="index.html" data-cursor><span>Companion</span><span class="alt">ಮನೆ</span></a>
    <a class="nav-link" href="#gate" data-cursor><span>Saint</span><span class="alt">ಸಂತ</span></a>
    <a class="nav-link" href="#pathways" data-cursor><span>Ridge</span><span class="alt">ಬೆಟ್ಟ</span></a>
    <a class="nav-link" href="#lessons" data-cursor><span>Crop</span><span class="alt">ಬೆಳೆ</span></a>
    <a class="nav-link" href="#eternity" data-cursor><span>Cup</span><span class="alt">ಕಪ್</span></a>""",
)

t = t.replace(
    """    <div class="eyebrow" data-rv="fade"><span class="dot"></span> Chapter 00 — From shade to the davara</div>
    <h1 class="display h-hero">
      <span class="mask-line"><span>From shade,</span></span>
      <span class="mask-line"><span>a living</span></span>
      <span class="mask-line"><span>cup.</span></span>
    </h1>
    <p class="hero-sub body" data-rv="up">A six-still walk through Chikkamagaluru coffee: path, cherry, seed,
      roast, filter, first sip. Not a shop. Not a booking.</p>""",
    """    <div class="eyebrow" data-rv="fade"><span class="dot"></span> Chapter 00 — Baba Budan, then the cup</div>
    <h1 class="display h-hero">
      <span class="mask-line"><span>From seven</span></span>
      <span class="mask-line"><span>seeds, a</span></span>
      <span class="mask-line"><span>living cup.</span></span>
    </h1>
    <p class="hero-sub body" data-rv="up">A night walk through the live sanctuary: the saint, Mocha, Chandra Drona,
      then shade, cherry, roast, filter, davara. Hover a plate. Scroll the camera. Not a shop. Lore is labelled lore.</p>""",
)

t = t.replace(
    """      <div class="chip" data-chip="0" data-rv="up" data-cursor><span class="num">01</span>
        <span class="tx"><b>Shade</b><p>The estate path at first light, under silver oak and coffee.</p></span></div>
      <div class="chip" data-chip="1" data-rv="up" data-cursor><span class="num">02</span>
        <span class="tx"><b>Cherry</b><p>Red fruit on a living shrub — the bean still dressed as a berry.</p></span></div>
      <div class="chip" data-chip="2" data-rv="up" data-cursor><span class="num">03</span>
        <span class="tx"><b>Seed</b><p>Cherry, parchment, green bean: three names for one seed.</p></span></div>
      <div class="chip" data-chip="3" data-rv="up" data-cursor><span class="num">04</span>
        <span class="tx"><b>Fire</b><p>The drum that turns green into the smell of a Malnad morning.</p></span></div>""",
    """      <div class="chip" data-chip="0" data-rv="up" data-cursor><span class="num">I</span>
        <span class="tx"><b>Saint</b><p>Baba Budan, seven Mocha seeds, the harbour that sold the cup.</p></span></div>
      <div class="chip" data-chip="1" data-rv="up" data-cursor><span class="num">II</span>
        <span class="tx"><b>Ridge</b><p>Chandra Drona, a garden before it was a crop, walk as a guest.</p></span></div>
      <div class="chip" data-chip="2" data-rv="up" data-cursor><span class="num">III</span>
        <span class="tx"><b>Crop</b><p>Shade path, cherry, seed, the drum that names the cup.</p></span></div>
      <div class="chip" data-chip="3" data-rv="up" data-cursor><span class="num">IV</span>
        <span class="tx"><b>Cup</b><p>Two steel barrels, then a davara with the hill still in the window.</p></span></div>""",
)

t = t.replace(
    '<span class="peek-cap"><b class="jp">ನೆರಳು</b><i>Shade — before the cherry</i></span>',
    '<span class="peek-cap"><b class="jp">ಸಂತ</b><i>Baba Budan — before the crop</i></span>',
)
t = t.replace('<div class="word-fb" aria-hidden="true">CUP</div>', '<div class="word-fb" aria-hidden="true">SEED</div>')
t = t.replace("  const word = 'KAGE', gl = [];", "  const word = 'SEED', gl = [];")

# Image quality: never cover-crop stills
t = t.replace(
    """.card-fr{
  position:relative; aspect-ratio:4/5; background:transparent;
  outline:1px solid var(--line-soft); outline-offset:-1px;
  transition:outline-color .5s var(--ease);
}
.card:hover .card-fr{ outline-color:rgba(223,231,224,.30); }
.card:nth-child(1) .card-fr{
  background:
    linear-gradient(180deg,rgba(3,6,9,.04) 36%,rgba(3,6,9,.72) 100%),
    url('assets/bean-to-cup/02-cherry.webp') center / cover no-repeat;
}
.card:nth-child(2) .card-fr{
  background:
    linear-gradient(180deg,rgba(3,6,9,.06) 36%,rgba(3,6,9,.74) 100%),
    url('assets/bean-to-cup/03-seed.webp') center / cover no-repeat;
}
.card:nth-child(3) .card-fr{
  background:
    linear-gradient(180deg,rgba(3,6,9,.05) 36%,rgba(3,6,9,.74) 100%),
    url('assets/bean-to-cup/04-roast.webp') center / cover no-repeat;
}""",
    """.card-fr{
  position:relative; aspect-ratio:16/9; background:#080c10;
  outline:1px solid var(--line-soft); outline-offset:-1px;
  transition:outline-color .5s var(--ease), transform .7s var(--ease);
  overflow:hidden;
}
.card:hover .card-fr{ outline-color:rgba(223,231,224,.30); transform:translateZ(18px) rotateX(-4deg); }
.card-fr img.still{
  position:absolute; inset:0; width:100%; height:100%;
  object-fit:contain; object-position:center; display:block;
  background:#080c10;
}""",
)

t = t.replace(
    """.cup-stills img{
  width:100%; height:auto; aspect-ratio:16/10; object-fit:cover;
  outline:1px solid var(--line-soft); outline-offset:-1px;
}""",
    """.cup-stills img{
  width:100%; height:auto; aspect-ratio:16/9; object-fit:contain;
  background:#080c10; display:block;
  outline:1px solid var(--line-soft); outline-offset:-1px;
}
.lore{
  display:inline-block; margin-left:.55rem; padding:.12rem .48rem; border-radius:999px;
  border:1px solid rgba(224,35,28,.45); font-size:9px; letter-spacing:.16em; text-transform:uppercase; color:#e0231c;
}
.story-note{ max-width:46ch; color:var(--muted); font-size:14px; line-height:1.65; }""",
)

# Chapter I copy
t = t.replace(
    """    <span class="k"><b>01</b> — The shade path</span><span class="rule"></span><span class="k jp">ನೆರಳು</span>
  </div>
  <div class="gate-grid">
    <h2 class="display h-sec" data-rv="up">Silver oak, red cherry, one path left open.</h2>
    <div class="gate-copy">
      <p class="lead" data-rv="up">Bean to cup begins where the tar road stops: a dirt line through shade-grown
        arabica, mist still in the valley, the first sun in the canopy. The path is not decoration. It is how
        a shrub is taught to survive a hundred monsoon seasons, and the first thing this district asks you to
        understand.</p>
      <p class="body" data-rv="up">Walk it and the cherries lift out of the dark leaves. Nothing here is a café
        list. Neither, for the next six stills, are you buying a bag. You are only watching a seed travel from
        hill to metal cup.</p>
      <a class="arrowlink" href="#pathways" data-rv="fade" data-cursor>
        <span>Follow the cherry</span>""",
    """    <span class="k"><b>01</b> — The saint</span><span class="rule"></span><span class="k jp">ಸಂತ</span>
  </div>
  <div class="gate-grid">
    <h2 class="display h-sec" data-rv="up">Seven Mocha seeds, one courtyard on this ridge.</h2>
    <div class="gate-copy">
      <p class="lead" data-rv="up">Coffee did not arrive here as a cup. It arrived as a story about a Sufi:
        Baba Budan, seven live seeds from Mocha, set in courtyard earth on Chandra Drona. The years disagree.
        The ridge does not.</p>
      <p class="body" data-rv="up">The plates hanging in the hall are the stills — full frame, never cropped to
        fill. Hover one and it lifts, the way a considered object does. Scroll and the camera walks. This is
        not a shop. Treat the beard as lore.</p>
      <a class="arrowlink" href="#pathways" data-rv="fade" data-cursor>
        <span>Walk the ridge</span>""",
)

t = t.replace(
    """    <span class="k"><b>02</b> — Cherry, seed, fire</span><span class="rule"></span><span class="k jp">ಹಣ್ಣು</span>
  </div>
  <div class="cards" id="cards">
    <article class="card" data-rv="up" data-view="0" data-cursor>
      <div class="card-fr" data-frame>
                <span class="card-ar"><svg viewBox="0 0 14 14" fill="none"><path d="M3 11 11 3M5 3h6v6" stroke="#dfe7e0" stroke-width="1.3"/></svg></span>
        <i class="glow" style="--gx:80.2%; --gy:23.9%; --gr:22%; --gt:6.1s; --gt2:9.7s; --gc1:rgba(255,142,108,.50); --gc2:rgba(212,56,38,.24)"></i>
        <div class="card-lab"><b>Cherry</b><span class="jp">ಹಣ್ಣು</span></div>
      </div>
      <div class="card-meta"><span>On the shrub</span><span>01 / 03</span></div>
    </article>
    <article class="card" data-rv="up" data-view="1" data-cursor>
      <div class="card-fr" data-frame>
                <span class="card-ar"><svg viewBox="0 0 14 14" fill="none"><path d="M3 11 11 3M5 3h6v6" stroke="#dfe7e0" stroke-width="1.3"/></svg></span>
        <i class="glow glow--flame" style="--gx:70.5%; --gy:47.2%; --gr:14%; --gt:3.7s; --gt2:5.3s; --gc1:rgba(255,198,124,.62); --gc2:rgba(226,118,40,.30)"></i>
        <div class="card-lab"><b>Seed</b><span class="jp">ಬೀಜ</span></div>
      </div>
      <div class="card-meta"><span>Three names</span><span>02 / 03</span></div>
    </article>
    <article class="card" data-rv="up" data-view="2" data-cursor>
      <div class="card-fr" data-frame>
                <span class="card-ar"><svg viewBox="0 0 14 14" fill="none"><path d="M3 11 11 3M5 3h6v6" stroke="#dfe7e0" stroke-width="1.3"/></svg></span>
        <i class="glow" style="--gx:48.0%; --gy:16.8%; --gr:20%; --gt:7.3s; --gt2:11.2s; --gc1:rgba(255,138,104,.52); --gc2:rgba(208,54,36,.24)"></i>
        <div class="card-lab"><b>Roast</b><span class="jp">ಹುರಿ</span></div>
      </div>
      <div class="card-meta"><span>The drum</span><span>03 / 03</span></div>
    </article>
  </div>""",
    """    <span class="k"><b>02</b> — The ridge</span><span class="rule"></span><span class="k jp">ಬೆಟ್ಟ</span>
  </div>
  <div class="cards" id="cards">
    <article class="card" data-rv="up" data-view="0" data-cursor>
      <div class="card-fr" data-frame>
        <img class="still" src="assets/bean-to-cup/story-00-baba-budan.webp" alt="Baba Budan on Chandra Drona with seven cherries. Companion still, not a historical likeness." width="1280" height="720" decoding="async">
        <span class="card-ar"><svg viewBox="0 0 14 14" fill="none"><path d="M3 11 11 3M5 3h6v6" stroke="#dfe7e0" stroke-width="1.3"/></svg></span>
        <i class="glow" style="--gx:80.2%; --gy:23.9%; --gr:22%; --gt:6.1s; --gt2:9.7s; --gc1:rgba(255,142,108,.50); --gc2:rgba(212,56,38,.24)"></i>
        <div class="card-lab"><b>Saint</b><span class="jp">ಸಂತ</span></div>
      </div>
      <div class="card-meta"><span>Hover to lift</span><span>00 / 14</span></div>
    </article>
    <article class="card" data-rv="up" data-view="1" data-cursor>
      <div class="card-fr" data-frame>
        <img class="still" src="assets/bean-to-cup/story-02-mocha.webp" alt="Mocha harbour, dhows, sacks of cherry. Companion still, not a survey of the port." width="1280" height="720" decoding="async">
        <span class="card-ar"><svg viewBox="0 0 14 14" fill="none"><path d="M3 11 11 3M5 3h6v6" stroke="#dfe7e0" stroke-width="1.3"/></svg></span>
        <i class="glow glow--flame" style="--gx:70.5%; --gy:47.2%; --gr:14%; --gt:3.7s; --gt2:5.3s; --gc1:rgba(255,198,124,.62); --gc2:rgba(226,118,40,.30)"></i>
        <div class="card-lab"><b>Mocha</b><span class="jp">ಮೋಚಾ</span></div>
      </div>
      <div class="card-meta"><span>The harbour</span><span>02 / 14</span></div>
    </article>
    <article class="card" data-rv="up" data-view="2" data-cursor>
      <div class="card-fr" data-frame>
        <img class="still" src="assets/bean-to-cup/story-03-seeds.webp" alt="Seven coffee seeds planted in courtyard earth." width="1280" height="720" decoding="async">
        <span class="card-ar"><svg viewBox="0 0 14 14" fill="none"><path d="M3 11 11 3M5 3h6v6" stroke="#dfe7e0" stroke-width="1.3"/></svg></span>
        <i class="glow" style="--gx:48.0%; --gy:16.8%; --gr:20%; --gt:7.3s; --gt2:11.2s; --gc1:rgba(255,138,104,.52); --gc2:rgba(208,54,36,.24)"></i>
        <div class="card-lab"><b>Seven seeds</b><span class="jp">ಏಳು</span></div>
      </div>
      <div class="card-meta"><span>Courtyard earth</span><span>03 / 14</span></div>
    </article>
  </div>""",
)

t = t.replace(
    """    <span class="k"><b>03</b> — Filter and fire</span><span class="rule"></span><span class="k jp">ಬೆಂಕಿ</span>
  </div>
  <div class="cur-head">
    <h2 class="display h-sec" data-rv="up">Six stills. One seed. A metal cup.</h2>
    <p class="body-lg" data-rv="up">Each still is a walk, not a lecture. You arrive on the path, pick the
      cherry with your eyes, sit with the drum, and leave with the filter’s first bloom.</p>
  </div>""",
    """    <span class="k"><b>03</b> — The crop</span><span class="rule"></span><span class="k jp">ಬೆಳೆ</span>
  </div>
  <div class="cur-head">
    <h2 class="display h-sec" data-rv="up">Fifteen beats. One walk. A metal cup.</h2>
    <p class="body-lg" data-rv="up">Act I hangs in the fog as plates. Act II is the living crop — path, cherry,
      seed, drum, filter, davara — shown contain, never stretched to fill the frame.</p>
  </div>""",
)

t = t.replace(
    """      <h3>The shade path<em class="jp">ನೆರಳು</em></h3>
      <p>Why arabica likes mist, and what a dirt line through silver oak is for.</p>
      <span class="t">still 01</span><i class="bar"></i>""",
    """      <h3>The plant<em class="jp">ಗಿಡ</em></h3>
      <p>A shrub that liked mist long before it saw these ghats.</p>
      <span class="t">still 01</span><i class="bar"></i>""",
)
t = t.replace(
    """      <h3>Red fruit<em class="jp">ಹಣ್ಣು</em></h3>
      <p>The bean still dressed as a berry, dew on the skin, green ones waiting.</p>
      <span class="t">still 02</span><i class="bar"></i>""",
    """      <h3>Hajj lore<em class="jp">ಕಥೆ</em></h3>
      <p>Seven raw beans in a pilgrim’s clothes. No ship’s book. Lore.</p>
      <span class="t">still 04</span><i class="bar"></i>""",
)
t = t.replace(
    """      <h3>Three names<em class="jp">ಬೀಜ</em></h3>
      <p>Cherry, parchment, green bean — one seed counted three ways.</p>
      <span class="t">still 03</span><i class="bar"></i>""",
    """      <h3>Estate country<em class="jp">ಸಾಲು</em></h3>
      <p>When the forest learned rows, and the hermitage tree became labour.</p>
      <span class="t">still 06</span><i class="bar"></i>""",
)

t = t.replace(
    """  <div class="eyebrow" data-rv="fade">Chapter 04 — The cup</div>
  <h2 class="display" data-rv="up">The davara</h2>
  <p class="body-lg" data-rv="up">The path does not close behind you. Take the walk whenever the noise
    gets loud — it is always the same hill, and never the same light in the cup.</p>
  <div class="cup-stills" data-rv="up">
    <figure>
      <img src="assets/bean-to-cup/05-brew.webp" alt="South Indian filter coffee: hot water poured into a steel drip, ground coffee in a bowl on a wooden verandah table." width="1600" height="1000">
      <figcaption>05 — Filter</figcaption>
    </figure>
    <figure>
      <img src="assets/bean-to-cup/06-cup.webp" alt="Steaming decoction in a steel davara on a estate verandah, coffee hills at sunrise beyond the rail." width="1600" height="1000">
      <figcaption>06 — Cup</figcaption>
    </figure>
  </div>""",
    """  <div class="eyebrow" data-rv="fade">Chapter 04 — The crop, then the cup</div>
  <h2 class="display" data-rv="up">The davara</h2>
  <p class="body-lg" data-rv="up">From shade to steel. Each still keeps its own ratio — contained in the frame,
    never forced to cover. The hill is still in the window.</p>
  <div class="cup-stills" data-rv="up">
    <figure>
      <img src="assets/bean-to-cup/01-shade.webp" alt="Shade-grown arabica at first light." width="1600" height="1000">
      <figcaption>09 — Shade</figcaption>
    </figure>
    <figure>
      <img src="assets/bean-to-cup/02-cherry.webp" alt="Ripe arabica cherries on a living shrub." width="1600" height="1000">
      <figcaption>10 — Cherry</figcaption>
    </figure>
    <figure>
      <img src="assets/bean-to-cup/03-seed.webp" alt="Cherry, parchment and green bean." width="1600" height="1000">
      <figcaption>11 — Seed</figcaption>
    </figure>
    <figure>
      <img src="assets/bean-to-cup/04-roast.webp" alt="A roasting drum at work." width="1600" height="1000">
      <figcaption>12 — Fire</figcaption>
    </figure>
    <figure>
      <img src="assets/bean-to-cup/05-brew.webp" alt="South Indian filter coffee on an estate table." width="1600" height="1000">
      <figcaption>13 — Filter</figcaption>
    </figure>
    <figure>
      <img src="assets/bean-to-cup/06-cup.webp" alt="Steaming davara, coffee hills beyond the rail." width="1600" height="1000">
      <figcaption>14 — Cup</figcaption>
    </figure>
  </div>""",
)

t = t.replace(
    """      <p>A six-still walk from Chikkamagaluru shade to a steel davara. The Three.js sanctuary is the
        authored Kage landing page; the stills are this district’s bean-to-cup.</p>""",
    """      <p>A 3D night walk: Baba Budan’s seven seeds, then shade to davara. Live Three.js sanctuary
        (Kage). Plates hang in the hall at their true ratio — no cover-crop, no cloth warp. Not a shop.</p>""",
)
t = t.replace(
    """      <li><a href="#gate" data-cursor>The shade path</a></li>
      <li><a href="#pathways" data-cursor>Cherry, seed, fire</a></li>
      <li><a href="#lessons" data-cursor>Filter and fire</a></li>
      <li><a href="#eternity" data-cursor>The cup</a></li>""",
    """      <li><a href="#gate" data-cursor>The saint</a></li>
      <li><a href="#pathways" data-cursor>The ridge</a></li>
      <li><a href="#lessons" data-cursor>The crop</a></li>
      <li><a href="#eternity" data-cursor>The cup</a></li>""",
)
t = t.replace(
    """      <li><a href="#gate" data-cursor>Shade</a></li>
      <li><a href="#pathways" data-cursor>Cherry</a></li>
      <li><a href="#pathways" data-cursor>Seed</a></li>
      <li><a href="#pathways" data-cursor>Roast</a></li>""",
    """      <li><a href="#gate" data-cursor>Baba Budan</a></li>
      <li><a href="#pathways" data-cursor>Mocha</a></li>
      <li><a href="#lessons" data-cursor>Shade work</a></li>
      <li><a href="#eternity" data-cursor>Davara</a></li>""",
)

t = t.replace(
    "const names = ['From shade', 'The shade path', 'Cherry, seed, fire', 'Filter and fire', 'The cup', 'Colophon'];",
    "const names = ['Seven seeds', 'The saint', 'The ridge', 'The crop', 'The cup', 'Colophon'];",
)

# Skip cloth warp (it cover-crops)
t = t.replace("initPost(); buildCards(); buildCardCloth();", "initPost(); buildCards();")

# Aim live card cameras at story plates (Oryzo 3D→2D windows)
t = t.replace(
    """  const defs = [
    { p: [-2.0, 1.60, -2.0], t: [0, 10.0, -34.0], fov: 40 },    /* the long climb */
    { p: [4.2, 2.90, -9.5], t: [6.4, 2.90, -14.4], fov: 40 },   /* lantern court  */
    { p: [3.4, 2.40, 2.0], t: [-1.0, -.60, -6.0], fov: 40 },    /* the wet court  */
    { p: [0.6, 3.40, -12.0], t: [0, 12.0, -40.0], fov: 26 }     /* hero window    */
  ];
  $$('[data-view]').forEach(el => {
    const d = defs[+el.dataset.view]; if (!d) return;
    const c = new THREE.PerspectiveCamera(d.fov, 4 / 5, .3, 200);""",
    """  const defs = [
    { p: [ 3.55, 4.35,  9.4], t: [ 3.55, 4.20,  6.15], fov: 28 }, /* saint plate */
    { p: [-3.85, 4.05,  5.6], t: [-3.70, 3.90,  2.35], fov: 28 }, /* mocha plate */
    { p: [ 3.85, 3.85,  2.2], t: [ 3.70, 3.70, -1.05], fov: 28 }, /* seeds plate */
    { p: [ 0.55, 4.20, 12.2], t: [ 0.20, 4.40,  6.40], fov: 26 }  /* hero peek   */
  ];
  $$('[data-view]').forEach(el => {
    const d = defs[+el.dataset.view]; if (!d) return;
    const c = new THREE.PerspectiveCamera(d.fov, 16 / 9, .3, 200);""",
)

# Inject story plates before JOBS
inject = r'''
/* ================================================= 13b · story plates
   Full-resolution stills as MeshBasic planes. Aspect is true (16:9 or 8:5).
   No cover-crop, no lighting wash, anisotropy on. Hover lifts the plate. */
const STORY_STILLS = [
  { src: 'assets/bean-to-cup/story-00-baba-budan.webp', w: 16, h: 9, x:  3.55, y: 4.20, z:  6.15 },
  { src: 'assets/bean-to-cup/story-01-plant.webp',      w: 16, h: 9, x: -3.70, y: 3.95, z:  4.20 },
  { src: 'assets/bean-to-cup/story-02-mocha.webp',      w: 16, h: 9, x: -3.70, y: 3.90, z:  2.35 },
  { src: 'assets/bean-to-cup/story-03-seeds.webp',      w: 16, h: 9, x:  3.70, y: 3.70, z: -1.05 },
  { src: 'assets/bean-to-cup/story-04-voyage.webp',     w: 16, h: 9, x: -4.10, y: 3.55, z: -3.40 },
  { src: 'assets/bean-to-cup/story-05-hermitage.webp',  w: 16, h: 9, x:  4.20, y: 3.85, z: -6.10 },
  { src: 'assets/bean-to-cup/story-06-estate.webp',     w: 16, h: 9, x: -3.40, y: 3.40, z: -8.20 },
  { src: 'assets/bean-to-cup/story-07-shade-work.webp', w: 16, h: 9, x:  3.20, y: 3.30, z:-10.40 },
  { src: 'assets/bean-to-cup/story-08-guest.webp',      w: 16, h: 9, x: -2.80, y: 3.20, z:-12.20 },
  { src: 'assets/bean-to-cup/01-shade.webp',            w: 16, h: 10,x:  2.90, y: 3.15, z:-14.10 },
  { src: 'assets/bean-to-cup/02-cherry.webp',           w: 16, h: 10,x: -2.60, y: 3.05, z:-15.60 },
  { src: 'assets/bean-to-cup/06-cup.webp',              w: 16, h: 10,x:  0.00, y: 4.80, z:-18.20 }
];
const PLATE_RAY = new THREE.Raycaster();
const PLATE_PTR = new THREE.Vector2();
let plateHover = -1;
function buildStoryPlates() {
  const loader = new THREE.TextureLoader();
  WORLD.plates = [];
  return Promise.all(STORY_STILLS.map((s, i) => new Promise(resolve => {
    loader.load(s.src, tex => {
      tex.encoding = THREE.sRGBEncoding;
      tex.anisotropy = maxAniso;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = true;
      tex.needsUpdate = true;
      const H = 3.28;
      const W = H * (s.w / s.h);
      const mat = new THREE.MeshBasicMaterial({
        map: tex, side: THREE.DoubleSide, toneMapped: false, fog: true
      });
      const m = new THREE.Mesh(new THREE.PlaneGeometry(W, H), mat);
      m.position.set(s.x, s.y, s.z);
      m.renderOrder = 8;
      m.userData = { baseY: s.y, i: i, hover: 0 };
      const frame = new THREE.Mesh(
        new THREE.PlaneGeometry(W + 0.16, H + 0.16),
        new THREE.MeshBasicMaterial({ color: 0x07090c, side: THREE.DoubleSide, fog: true })
      );
      frame.position.set(s.x, s.y, s.z - 0.04);
      frame.renderOrder = 7;
      scene.add(frame);
      scene.add(m);
      WORLD.plates.push(m);
      resolve();
    }, undefined, () => resolve());
  })));
}
function updateStoryPlates(dt) {
  if (!WORLD.plates || !WORLD.plates.length) return;
  PLATE_PTR.set(RIG.tmx || 0, RIG.tmy || 0);
  PLATE_RAY.setFromCamera(PLATE_PTR, camera);
  const hits = PLATE_RAY.intersectObjects(WORLD.plates, false);
  plateHover = hits.length ? hits[0].object.userData.i : -1;
  WORLD.plates.forEach(m => {
    const on = m.userData.i === plateHover ? 1 : 0;
    m.userData.hover += ((on - m.userData.hover) * Math.min(1, dt * 7));
    const h = m.userData.hover;
    m.position.y = m.userData.baseY + h * 0.22;
    m.rotation.y = (RIG.tmx || 0) * 0.18 * h;
    m.rotation.x = -(RIG.tmy || 0) * 0.10 * h;
    m.scale.setScalar(1 + h * 0.045);
  });
}

'''

if "function buildStoryPlates()" not in t:
    t = t.replace("/* ======================================================== 14 · booting */", inject + "/* ======================================================== 14 · booting */")

t = t.replace(
    "  ['Raising the hall', () => buildTemple()],",
    "  ['Raising the hall', () => buildTemple()],\n  ['Hanging the stills', () => buildStoryPlates()],",
)

t = t.replace("  updateLeaves(dt);\n  updateWisps(dt);", "  updateLeaves(dt);\n  updateWisps(dt);\n  updateStoryPlates(dt);")

p.write_text(t, encoding="utf-8")
print("patched", p, "bytes", p.stat().st_size)
# sanity
need = ["buildStoryPlates", "object-fit:contain", "Baba Budan", "SEED", "Hanging the stills", "story-00-baba-budan"]
text = p.read_text()
for n in need:
    print(("OK" if n in text else "MISS"), n)
print("cloth still called?", "buildCardCloth();" in text)
