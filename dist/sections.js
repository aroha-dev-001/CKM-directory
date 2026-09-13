(function (global) {
  const CATEGORY_COLOR = {
    peaks: "#c4a36a",
    waterfalls: "#7aa3b8",
    dams: "#3f6f7c",
    lakes: "#4d7c8a",
    wildlife: "#3d6b4f",
    temples: "#b08968",
    heritage: "#8a6a4b",
    "hill-station": "#6b8f71",
  };

  function t(lang, key) {
    const pack = (global.CKM.i18n[lang] || global.CKM.i18n.en);
    return pack[key] || global.CKM.i18n.en[key] || key;
  }

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function catLabel(id, lang) {
    const found = global.CKM.categories.find((c) => c.id === id);
    if (!found) return id;
    return lang === "kn" ? found.kn : found.label;
  }

  function seasonImage(id) {
    const map = {
      winter: "assets/mullayanagiri.jpg",
      summer: "assets/kemmanagundi.jpg",
      monsoon: "assets/hebbe-falls.jpg",
      "post-monsoon": "assets/coffee-hills.jpg",
    };
    return map[id] || "assets/mullayanagiri.jpg";
  }

  function placeCard(place, lang) {
    return `
      <article class="place-card-wrap">
        <button class="place-card" type="button" data-open-place="${esc(place.id)}">
          <div class="media">
            <img src="${esc(place.image)}" alt="${esc(place.name)}" width="1800" height="1200" loading="lazy" />
          </div>
          <div class="place-card-meta">
            <span>${esc(catLabel(place.category, lang))}</span>
            <span>${esc(place.taluk)}</span>
          </div>
          <h3>${esc(place.name)}<span class="kn">${esc(place.kannada)}</span></h3>
          <p>${esc(place.blurb)}</p>
        </button>
      </article>`;
  }

  function fragments(lang) {
    const d = global.CKM;
    const tx = (key) => t(lang, key);
    const interests = d.categories
      .filter((c) => c.id !== "all" && c.image)
      .map(
        (c) => `
        <a class="interest-tile" href="places.html?category=${esc(c.id)}">
          <div class="media">
            <img src="${esc(c.image)}" alt="${esc(lang === "kn" ? c.kn : c.label)}" width="1800" height="1200" loading="lazy" />
          </div>
          <span class="interest-copy">
            <strong>${esc(lang === "kn" ? c.kn : c.label)}</strong>
            <span>${c.count || 0} places</span>
          </span>
        </a>`
      )
      .join("");
    const featured = (d.featured || [])
      .map((id) => d.destinations.find((p) => p.id === id))
      .filter(Boolean)
      .map(
        (p) => `
        <a class="feature-card tilt-card" href="places.html?id=${esc(p.id)}" data-tilt>
          <div class="media">
            <img src="${esc(p.image)}" alt="${esc(p.name)}" width="1800" height="1200" loading="lazy" />
          </div>
          <span class="feature-copy">
            <span class="kicker">${esc(catLabel(p.category, lang))}</span>
            <h3>${esc(p.name)}</h3>
            <p>${esc(p.blurb)}</p>
          </span>
        </a>`
      )
      .join("");
    const talukBtns = (d.taluks || [])
      .map(
        (t) =>
          `<button class="filter-btn" type="button" data-taluk="${esc(t.id)}" aria-pressed="false">${esc(t.name)} · ${t.count}</button>`
      )
      .join("");
    const circuits = (d.circuits || [])
      .map((c) => {
        const names = c.places
          .map((id) => d.destinations.find((p) => p.id === id))
          .filter(Boolean)
          .map((p) => p.name)
          .join(" · ");
        return `
          <article class="circuit-card">
            <div class="circuit-media">
              <img src="${esc(c.image)}" alt="${esc(c.title)}" width="1800" height="1200" loading="lazy" />
            </div>
            <div class="pad">
              <p class="kicker">${esc(c.kicker)}</p>
              <h3>${esc(c.title)}</h3>
              <p>${esc(c.text)}</p>
              <p class="section-lead">${esc(names)}</p>
              <a class="btn btn-dark" href="plan.html?circuit=${esc(c.id)}">Use this sketch</a>
            </div>
          </article>`;
      })
      .join("");
    const faqs = (d.faqs || []).map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("");
    const packing = (d.packing || []).map((item) => `<li>${esc(item)}</li>`).join("");
    const dos = (d.conduct?.do || []).map((item) => `<li>${esc(item)}</li>`).join("");
    const donts = (d.conduct?.dont || []).map((item) => `<li>${esc(item)}</li>`).join("");
    const about = d.about || { title: "", kicker: "", image: "", paragraphs: [] };
    const filters = d.categories
      .map(
        (c) =>
          `<button class="filter-btn" type="button" data-filter="${esc(c.id)}" aria-pressed="${c.id === "all" ? "true" : "false"}">${esc(lang === "kn" ? c.kn : c.label)}</button>`
      )
      .join("");
    const places = d.destinations.map((p) => placeCard(p, lang)).join("");
    const season = d.seasons[0];
    const seasonMonths = d.seasons
      .map((s, i) => `<button type="button" class="season-month" data-season-index="${i}">${esc(s.months.split("–")[0].trim())}</button>`)
      .join("");
    const stories = d.stories
      .map(
        (s) => `
        <article class="story-block" id="story-${esc(s.id)}">
          <div class="story-media">
            <img src="${esc(s.image)}" alt="${esc(s.title)}" width="1800" height="1200" loading="lazy" />
          </div>
          <div>
            <p class="kicker">${esc(s.kicker)}</p>
            <h3>${esc(s.title)}</h3>
            ${s.paragraphs.map((p) => `<p>${esc(p)}</p>`).join("")}
          </div>
        </article>`
      )
      .join("");
    const essentials = Object.values(d.essentials)
      .map((block) => {
        const items = block.items.map((item) => `<h4>${esc(item.title)}</h4><p>${esc(item.text)}</p>`).join("");
        return `<article class="essential-card"><h3>${esc(block.title)}</h3>${items}</article>`;
      })
      .join("");
    const guide = d.guide.cards.map((c) => `<article class="guide-card"><h3>${esc(c.title)}</h3><p>${esc(c.text)}</p></article>`).join("");
    const gallery = d.gallery
      .map(
        (g) => `
        <figure class="gallery-item">
          <img src="${esc(g.image)}" alt="${esc(g.caption)}" width="1800" height="1200" loading="lazy" />
          <figcaption>${esc(g.caption)} — ${esc(g.credit)}</figcaption>
        </figure>`
      )
      .join("");
    const tickerItems = d.destinations
      .map((p) => `<span>${esc(p.name)} <i>${esc(p.kannada)}</i></span>`)
      .join("");
    const seasonCards = d.seasons
      .map(
        (s) => `
        <a class="season-card tilt-card" href="stories.html#seasons" data-tilt>
          <div class="media">
            <img src="${esc(seasonImage(s.id))}" alt="${esc(s.title)}" width="1800" height="1200" loading="lazy" />
          </div>
          <span class="season-card-copy">
            <span class="kicker">${esc(lang === "kn" ? s.kn : s.months)}</span>
            <strong>${esc(s.title)}</strong>
            <span>${esc(s.experiences[0] || "")}</span>
          </span>
        </a>`
      )
      .join("");
    const whyCards = d.stories
      .filter((s) => ["coffee", "culture", "responsible"].includes(s.id))
      .map(
        (s) => `
        <a class="why-card tilt-card" href="stories.html#story-${esc(s.id)}" data-tilt>
          <div class="media">
            <img src="${esc(s.image)}" alt="${esc(s.title)}" width="1800" height="1200" loading="lazy" />
          </div>
          <span class="why-card-copy">
            <span class="kicker">${esc(s.kicker)}</span>
            <h3>${esc(s.title)}</h3>
            <p>${esc(s.paragraphs[0])}</p>
            <span class="text-link">Read on</span>
          </span>
        </a>`
      )
      .join("");
    const homeCircuits = (d.circuits || [])
      .map((c) => {
        const names = c.places
          .map((id) => d.destinations.find((p) => p.id === id))
          .filter(Boolean)
          .map((p) => p.name)
          .slice(0, 4)
          .join(" · ");
        return `
          <a class="home-circuit tilt-card" href="plan.html?circuit=${esc(c.id)}" data-tilt>
            <div class="media">
              <img src="${esc(c.image)}" alt="${esc(c.title)}" width="1800" height="1200" loading="lazy" />
            </div>
            <span class="home-circuit-copy">
              <span class="kicker">${esc(c.kicker)}</span>
              <h3>${esc(c.title)}</h3>
              <p>${esc(c.text)}</p>
              <p class="home-circuit-stops">${esc(names)}</p>
              <span class="text-link">Use this sketch</span>
            </span>
          </a>`;
      })
      .join("");
    const homeGallery = (d.gallery || [])
      .slice(0, 6)
      .map(
        (g) => `
        <figure class="gallery-item">
          <img src="${esc(g.image)}" alt="${esc(g.caption)}" width="1800" height="1200" loading="lazy" />
          <figcaption>${esc(g.caption)}</figcaption>
        </figure>`
      )
      .join("");
    const fieldNotes = (d.guide?.cards || [])
      .slice(0, 3)
      .map((c) => `<article class="guide-card"><h3>${esc(c.title)}</h3><p>${esc(c.text)}</p></article>`)
      .join("");
    const popularCards = (d.popularPlaces || [])
      .map((item) => {
        const place = d.destinations.find((p) => p.id === item.id);
        if (!place) return "";
        const panelId = `pop-panel-${esc(item.id)}`;
        return `
          <article class="pop-card" data-pop-card="${esc(item.id)}">
            <button class="pop-face" type="button" data-pop-toggle="${esc(item.id)}" aria-expanded="false" aria-controls="${panelId}">
              <div class="media">
                <img src="${esc(place.image)}" alt="${esc(place.name)}" width="1800" height="1200" loading="lazy" />
              </div>
              <span class="pop-face-copy">
                <span class="kicker">${esc(item.kicker)}</span>
                <strong>${esc(place.name)}</strong>
                <span class="pop-hours">${esc(item.hours)}</span>
                <span class="pop-why-line">${esc(item.why)}</span>
              </span>
            </button>
            <div class="pop-panel" id="${panelId}" hidden>
              <p class="kicker">Typical hours</p>
              <p>${esc(item.hoursDetail)}</p>
              <p class="kicker" style="margin-top:0.9rem">Why people come</p>
              <p>${esc(item.why)}</p>
              <p class="pop-source">Hours and access change. Confirm on <a href="${esc(item.hoursSource.url)}" rel="noopener noreferrer">${esc(item.hoursSource.label)}</a> — this companion does not list fees.</p>
              <div class="pop-actions">
                <button class="btn btn-dark" type="button" data-open-place="${esc(place.id)}">Open this place</button>
                <a class="btn btn-line" href="places.html?id=${esc(place.id)}">Go to places</a>
              </div>
            </div>
          </article>`;
      })
      .join("");
    const origin = d.coffeeOrigin || {};
    const originChapters = (origin.chapters || [])
      .map(
        (ch) => `<article class="origin-chapter">
          <h3>${esc(ch.title)}</h3>
          <p>${esc(ch.text)}</p>
        </article>`
      )
      .join("");
    const originSources = (origin.sources || [])
      .map((s) => `<li><a href="${esc(s.url)}" rel="noopener noreferrer">${esc(s.label)}</a></li>`)
      .join("");
    const credits = d.credits
      .map(
        (c) =>
          `<p>${esc(c.place)} — ${esc(c.artist)} — ${esc(c.license)}, via <a href="${esc(c.url)}" rel="noopener noreferrer">Wikimedia Commons</a></p>`
      )
      .join("");
    const talukOrder = ["chikkamagaluru", "tarikere", "kadur", "mudigere", "koppa", "nrpura", "sringeri", "kalasa", "ajjampura"];
    const talukById = Object.fromEntries((d.taluks || []).map((t) => [t.id, t]));
    const talukIndex = talukOrder
      .map((id) => talukById[id])
      .filter(Boolean)
      .map((t) => {
        const label = lang === "kn" ? t.kannada : t.listName || t.name;
        return `<li>
          <a class="taluk-index-row" href="places.html?taluk=${esc(t.id)}" data-select-taluk="${esc(t.id)}" aria-current="false">
            <span class="taluk-index-name">${esc(label)}</span>
            <span class="taluk-index-count">${t.count}</span>
            <span class="taluk-index-go" aria-hidden="true">→</span>
          </a>
        </li>`;
      })
      .join("");
    const placeJump = d.categories
      .filter((c) => c.id !== "all")
      .map((c) => `<a class="place-jump-link" href="#section-${esc(c.id)}" data-jump-category="${esc(c.id)}">${esc(lang === "kn" ? c.kn : c.label)}</a>`)
      .join("");
    return {
      d, tx, interests, featured, talukBtns, circuits, faqs, packing, dos, donts, about,
      filters, places, season, seasonMonths, stories, essentials, guide, gallery, credits,
      talukIndex, placeJump, official: d.official, tickerItems, seasonCards, whyCards,
      homeCircuits, homeGallery, fieldNotes, popularCards, origin, originChapters, originSources,
    };
  }

  function renderPlaceSections(lang, list) {
    const cats = global.CKM.categories.filter((c) => c.id !== "all");
    return cats
      .map((cat) => {
        const items = list.filter((p) => p.category === cat.id);
        if (!items.length) return "";
        const title = lang === "kn" ? cat.kn : cat.label;
        const lead = lang === "kn" ? cat.leadKn : cat.lead;
        return `
          <section class="place-section" id="section-${esc(cat.id)}" data-place-section="${esc(cat.id)}">
            <div class="place-section-head">
              <div>
                <p class="kicker">${esc(title)}</p>
                <h2>${esc(title)}</h2>
                <p class="section-lead">${esc(lead || "")}</p>
              </div>
              <span class="place-section-count">${items.length}</span>
            </div>
            <div class="place-grid">${items.map((p) => placeCard(p, lang)).join("")}</div>
          </section>`;
      })
      .join("");
  }

  function footer(f) {
    return `
      <footer class="site-footer">
        <div class="wrap">
          <div class="footer-grid">
            <div>
              <p class="wordmark-en">Chikkamagaluru</p>
              <p class="wordmark-kn">ಚಿಕ್ಕಮಗಳೂರು</p>
              <p style="margin-top:0.8rem;color:rgba(243,238,228,.7)">${esc(f.tx("disclaimer"))}</p>
            </div>
            <div>
              <h2 class="kicker">${esc(f.tx("official"))}</h2>
              <ul>
                <li><a href="${esc(f.official.district_en)}" rel="noopener noreferrer">chikkamagaluru.nic.in — tourism</a></li>
                <li><a href="${esc(f.official.district_kn)}" rel="noopener noreferrer">ಕನ್ನಡ ಪ್ರವಾಸೋದ್ಯಮ ಪುಟ</a></li>
                <li><a href="${esc(f.official.karnataka_tourism)}" rel="noopener noreferrer">Karnataka Tourism</a></li>
                <li><a href="${esc(f.official.forest)}" rel="noopener noreferrer">Karnataka Forest Department</a></li>
              </ul>
            </div>
            <div>
              <h2 class="kicker">Pages</h2>
              <ul>
                <li><a href="places.html">Places</a></li>
                <li><a href="map.html">District map</a></li>
                <li><a href="plan.html">Plan</a></li>
                <li><a href="visit.html">Visitor information</a></li>
              </ul>
            </div>
          </div>
          <p class="fineprint">Independent static companion. Source links remain the authority for access, fees, permits and announcements. Map boundaries © OpenStreetMap contributors (ODbL).</p>
        </div>
      </footer>`;
  }

  function renderHome(lang) {
    const f = fragments(lang);
    return `
      <section class="hero" aria-labelledby="hero-title">
        <div class="hero-media" aria-hidden="true">
          <img src="assets/hero.jpg" alt="" width="2400" height="1350" fetchpriority="high" />
        </div>
        <div class="hero-scrim"></div>
        <p class="hero-ghost" aria-hidden="true">CHIKKAMAGALURU</p>
        <div class="hero-bottom">
          <div class="hero-copy">
            <p class="eyebrow shimmer">Chikkamagaluru · Karnataka</p>
            <h1 id="hero-title" class="reveal-lines">
              <span><i>Above the</i></span>
              <span><i>cloud line.</i></span>
            </h1>
            <p class="hero-kn" lang="kn">ಮೇಘರೇಖೆಯ ಮೇಲೆ</p>
            <p class="lede">Good coffee, quieter journeys. A district companion for peaks, temples, forests and the working shade of Malnad — not a booking desk.</p>
            <div class="hero-actions">
              <a class="btn btn-light" href="places.html">Explore all places</a>
              <a class="btn btn-ghost" href="map.html">Open the district map</a>
              <a class="btn btn-ghost" href="#popular-places">Popular places</a>
            </div>
            <dl class="hero-stats">
              <div>
                <dt>Places mapped</dt>
                <dd><span data-count="${f.d.destinations.length}">${f.d.destinations.length}</span></dd>
              </div>
              <div>
                <dt>Taluks</dt>
                <dd><span data-count="9">9</span></dd>
              </div>
              <div>
                <dt>Highest peak</dt>
                <dd>1,930 m</dd>
              </div>
            </dl>
            <a class="hero-scroll" href="#district-pulse">Scroll into the district</a>
          </div>
        </div>
      </section>
      <section class="ribbon" id="district-pulse" aria-label="At a glance">
        <div class="wrap ribbon-grid">
          <p><strong data-count="${f.d.destinations.length}">${f.d.destinations.length}</strong> places to read</p>
          <p><strong data-count="9">9</strong> taluks on the map</p>
          <p><strong data-count="3">3</strong> trip sketches</p>
          <p><a href="https://chikkamagaluru.nic.in/en/tourism/" rel="noopener noreferrer">Official district tourism</a></p>
        </div>
      </section>
      <div class="name-ticker" aria-hidden="true">
        <div class="name-ticker-track">
          <div class="name-ticker-set">${f.tickerItems}</div>
          <div class="name-ticker-set">${f.tickerItems}</div>
        </div>
      </div>
      <section class="section pop-section reveal-on-scroll" id="popular-places">
        <div class="wrap">
          <div class="section-head">
            <p class="kicker">Popular places</p>
            <h2>Open a card. See why it draws a crowd.</h2>
            <p class="section-lead">Typical hours from temple sites and the district desk — not a live board. Tap a card for the longer note, then confirm on the linked page before you travel. No fees are listed here.</p>
          </div>
          <div class="pop-grid reveal-stagger">${f.popularCards}</div>
        </div>
      </section>
      <section class="coffee-origin reveal-on-scroll" id="coffee-origin" aria-labelledby="origin-title">
        <div class="wrap coffee-origin-head">
          <figure class="origin-figure">
            <img src="${esc(f.origin.image)}" alt="${esc(f.origin.caption || f.origin.title)}" width="1800" height="1200" />
            <figcaption>${esc(f.origin.caption || "")}</figcaption>
          </figure>
          <div>
            <p class="kicker">${esc(f.origin.kicker)}</p>
            <h2 id="origin-title">${esc(f.origin.title)}</h2>
            <p class="section-lead">${esc(f.origin.lede)}</p>
          </div>
        </div>
        <div class="wrap origin-chapters">${f.originChapters}</div>
        <div class="wrap origin-sources">
          <p class="kicker">Sources</p>
          <ul>${f.originSources}</ul>
        </div>
      </section>
      <section class="section why-section reveal-on-scroll">
        <div class="wrap">
          <div class="section-head-row">
            <div class="section-head">
              <p class="kicker">Why this district</p>
              <h2>Coffee, stone, and a living forest.</h2>
              <p class="section-lead">Three ways of reading Chikkamagaluru before you pick a road: the working shade of arabica, Hoysala and Malnad pilgrimage, and a Western Ghats hotspot that is not a backdrop.</p>
            </div>
            <a class="text-link" href="stories.html">All stories</a>
          </div>
          <div class="why-grid reveal-stagger">${f.whyCards}</div>
        </div>
      </section>
      <section class="section reveal-on-scroll" style="padding-top:0" id="seasons-home">
        <div class="wrap">
          <div class="section-head-row">
            <div class="section-head">
              <p class="kicker">${esc(f.tx("nav_seasons"))}</p>
              <h2>Four weathers, four districts.</h2>
              <p class="section-lead">Clear ridges in winter, thinner falls by summer, a monsoon that turns the ghats to water, and an October still dripping green. Come for the season you can actually walk.</p>
            </div>
            <a class="text-link" href="stories.html#seasons">Season notes</a>
          </div>
          <div class="season-card-grid reveal-stagger">${f.seasonCards}</div>
        </div>
      </section>
      <section class="section reveal-on-scroll" id="explore" style="padding-top:0">
        <div class="wrap">
          <div class="section-head">
            <p class="kicker">Browse by interest</p>
            <h2>What do you love?</h2>
            <p class="section-lead">Peaks, water, stone and forest — the same kinds of country a tourism desk would point you toward, without a stay to sell.</p>
          </div>
          <div class="interest-grid">${f.interests}</div>
        </div>
      </section>
      <section class="section circuits-home reveal-on-scroll">
        <div class="wrap">
          <div class="section-head-row">
            <div class="section-head">
              <p class="kicker">Trip sketches</p>
              <h2>Three ways through the hills.</h2>
              <p class="section-lead">Coffee ridges, temple terraces, and permit country. Load a sketch into a private notebook in this browser — no account, no payment.</p>
            </div>
            <a class="text-link" href="plan.html">Open the planner</a>
          </div>
          <div class="home-circuit-grid reveal-stagger">${f.homeCircuits}</div>
        </div>
      </section>
      <section class="district-explorer-section" id="explore-district">
        <div class="wrap wrap-wide">
          <div class="district-explorer">
            <div class="district-copy">
              <p class="kicker">Explore the district</p>
              <h2>Nine taluks, endless experiences.</h2>
              <p class="section-lead">From Mullayanagiri’s cloud line to the temples of Sringeri and the tiger forests of Bhadra — Chikkamagaluru is a district of contrasts. Click a taluk to open it.</p>
              <a class="btn btn-dark" data-map-cta href="map.html">View district map <span aria-hidden="true">→</span></a>
            </div>
            <div class="district-map-stage">
              <div class="choropleth" id="district-svg" data-map-root data-map-mode="home"></div>
              <span class="map-north" aria-hidden="true"><small>N</small><i></i></span>
            </div>
            <aside class="district-index">
              <div class="district-index-head">
                <span>The district</span>
                <span>${f.d.destinations.length} places</span>
              </div>
              <ul class="taluk-index" id="taluk-index">${f.talukIndex}</ul>
              <p class="taluk-summary" id="taluk-summary"></p>
              <p class="taluk-footnote">Kalasa and Ajjampura were carved out of Mudigere and Tarikere after older maps were drawn. Each is shown here with its current OSM boundary.</p>
            </aside>
          </div>
        </div>
      </section>
      <section class="section reveal-on-scroll" id="home-gallery">
        <div class="wrap">
          <div class="section-head-row">
            <div class="section-head">
              <p class="kicker">Field photographs</p>
              <h2>A quieter look.</h2>
              <p class="section-lead">Ridges, shade coffee, falling water and the Tunga terrace — stills from people who walked here, credited on the visit page.</p>
            </div>
            <a class="text-link" href="stories.html#gallery">Full gallery</a>
          </div>
          <div class="home-gallery reveal-stagger">${f.homeGallery}</div>
        </div>
      </section>
      <section class="section close-band reveal-on-scroll">
        <div class="wrap">
          <div class="section-head">
            <p class="kicker">Before you leave town</p>
            <h2>Give the peaks a morning.</h2>
            <p class="section-lead">${esc(f.d.guide.intro)}</p>
          </div>
          <div class="guide-grid">${f.fieldNotes}</div>
          <div class="close-actions">
            <a class="btn btn-dark" href="plan.html">Sketch a private trip</a>
            <a class="btn btn-line" href="visit.html">Visitor information</a>
            <a class="btn btn-line" href="${esc(f.official.district_en)}" rel="noopener noreferrer">District tourism</a>
          </div>
        </div>
      </section>
      ${footer(f)}`;
  }

  function renderPlacesPage(lang) {
    const f = fragments(lang);
    return `
      <section class="page-hero">
        <div class="wrap">
          <p class="kicker" id="places-kicker">Places</p>
          <h1 id="places-title">Places worth the climb</h1>
          <p class="section-lead" id="places-lead">Waterfalls, temples, dams, lakes, hill stations, peaks and forests — grouped the way you look for them. Nothing here is a live fee, permit or opening-hour notice.</p>
          <p class="taluk-context" id="places-taluk-bar" hidden>
            <a href="places.html">All taluks</a>
            <a href="map.html" id="places-map-link">Back to the district map</a>
          </p>
        </div>
      </section>
      <section class="section" style="padding-top:0">
        <div class="wrap">
          <div class="toolbar">
            <label class="search-label">${esc(f.tx("search"))}
              <input id="place-search" type="search" placeholder="${esc(f.tx("search_ph"))}" autocomplete="off" />
            </label>
            <nav class="place-jump" aria-label="Jump to a kind of place">${f.placeJump}</nav>
            <div class="taluk-row" role="group" aria-label="Taluks">
              <button class="filter-btn" type="button" data-taluk="all" aria-pressed="true">All taluks</button>
              ${f.talukBtns}
            </div>
          </div>
          <p class="results-meta"><span id="result-count">${f.d.destinations.length}</span> ${esc(f.tx("results"))}</p>
          <div id="place-sections">${renderPlaceSections(lang, f.d.destinations)}</div>
          <p class="empty-state" id="place-empty" hidden>${esc(f.tx("empty"))}</p>
        </div>
      </section>
      ${footer(f)}`;
  }

  function renderMapPage(lang) {
    const f = fragments(lang);
    return `
      <section class="district-explorer-section district-explorer-page">
        <div class="wrap wrap-wide">
          <div class="district-explorer">
            <div class="district-copy">
              <p class="kicker">The district</p>
              <h1>Nine taluks, endless experiences.</h1>
              <p class="section-lead">Click a taluk on the map or in the list to open its places — waterfalls, temples, dams and the rest, already grouped. Boundaries are OpenStreetMap reference, not a survey.</p>
              <a class="btn btn-dark" id="taluk-places-cta" href="places.html">Browse places in this taluk <span aria-hidden="true">→</span></a>
            </div>
            <div class="district-map-stage">
              <div class="choropleth choropleth-lg" id="district-svg" data-map-root data-map-mode="page" role="application" aria-label="Interactive Chikkamagaluru taluk map"></div>
              <span class="map-north" aria-hidden="true"><small>N</small><i></i></span>
            </div>
            <aside class="district-index">
              <div class="district-index-head">
                <span>The district</span>
                <span>${f.d.destinations.length} places</span>
              </div>
              <ul class="taluk-index" id="taluk-index">${f.talukIndex}</ul>
              <p class="taluk-summary" id="taluk-summary"></p>
              <p class="taluk-footnote">${esc(f.d.mapNote || "")}</p>
            </aside>
          </div>
        </div>
      </section>
      <section class="section" style="padding-top:0">
        <div class="wrap">
          <div class="section-head">
            <p class="kicker" id="taluk-places-kicker">Places in this taluk</p>
            <h2 id="taluk-places-heading">Choose a taluk</h2>
            <p class="section-lead" id="taluk-places-lead">The map lists what this companion holds — not a complete gazetteer.</p>
          </div>
          <div id="taluk-places" class="place-grid"></div>
          <p class="empty-state" id="taluk-places-empty" hidden>This companion does not yet list a destination in that taluk. Try a neighbour, or browse all places.</p>
        </div>
      </section>
      ${footer(f)}`;
  }

  function renderStoriesPage(lang) {
    const f = fragments(lang);
    return `
      <section class="page-hero">
        <div class="wrap">
          <p class="kicker">Stories</p>
          <h1>Coffee, culture, care</h1>
          <p class="section-lead">A slower reading of the district — seasons, shade-grown hills, Hoysala stone and how to walk lightly.</p>
        </div>
      </section>
      <section class="section" style="padding-top:0">
        <div class="wrap">
          <div class="season-layout" id="seasons">
            <div class="season-media">
              <img id="season-image" src="assets/mullayanagiri.jpg" alt="Seasonal landscape" width="1800" height="1200" />
            </div>
            <div class="season-copy" id="season-copy">
              <p class="kicker">${esc(f.season.months)}</p>
              <h3>${esc(f.season.title)}</h3>
              <p>${esc(f.season.text)}</p>
              <ul class="season-list">${f.season.experiences.map((e) => `<li>${esc(e)}</li>`).join("")}</ul>
              <p class="season-watch">${esc(f.season.watch)}</p>
              <input class="season-slider" id="season-slider" type="range" min="0" max="${f.d.seasons.length - 1}" value="0" aria-label="Season" />
              <div class="season-months">${f.seasonMonths}</div>
            </div>
          </div>
          ${f.stories}
          <div class="section-head" id="gallery" style="margin-top:2.5rem">
            <p class="kicker">Field photographs</p>
            <h2>A quieter look</h2>
          </div>
          <div class="gallery-grid">${f.gallery}</div>
        </div>
      </section>
      ${footer(f)}`;
  }

  function renderPlanPage(lang) {
    const f = fragments(lang);
    return `
      <section class="page-hero">
        <div class="wrap">
          <p class="kicker">${esc(f.tx("nav_plan"))}</p>
          <h1>${esc(f.tx("itinerary"))}</h1>
          <p class="section-lead">A private notebook stored in this browser. Load a sketch, then drag days. No account. No payment.</p>
        </div>
      </section>
      <section class="section" style="padding-top:0">
        <div class="wrap">
          <div class="circuit-grid">${f.circuits}</div>
          <div class="plan-layout" style="margin-top:2.4rem">
            <div>
              <div class="day-board" id="day-board"></div>
              <div class="plan-actions">
                <button class="btn btn-dark" type="button" id="add-day">${esc(f.tx("add_day"))}</button>
                <button class="btn btn-line" type="button" id="download-pack">${esc(f.tx("download"))}</button>
                <button class="btn btn-line" type="button" id="clear-trip">${esc(f.tx("clear_trip"))}</button>
              </div>
            </div>
            <aside class="passport" aria-labelledby="passport-title">
              <h2 id="passport-title">${esc(f.tx("passport"))}</h2>
              <p>${esc(f.tx("passport_blurb"))}</p>
              <p><span id="stamp-count">0</span> / ${f.d.destinations.length}</p>
              <div class="stamp-grid" id="stamp-grid"></div>
              <div class="progress" aria-hidden="true"><span id="stamp-bar" style="width:0%"></span></div>
            </aside>
          </div>
        </div>
      </section>
      ${footer(f)}`;
  }

  function renderVisitPage(lang) {
    const f = fragments(lang);
    const about = f.about;
    return `
      <section class="page-hero">
        <div class="wrap">
          <p class="kicker">Visitor information</p>
          <h1>Arrive, move, ask permission</h1>
          <p class="section-lead">The practical desk: access, transport, forests, packing and questions. Fees and live closures live on official pages.</p>
        </div>
      </section>
      <section class="section" style="padding-top:0">
        <div class="wrap">
          <div class="about-layout">
            <div class="about-media">
              <img src="${esc(about.image)}" alt="${esc(about.title)}" width="1800" height="1200" loading="lazy" />
            </div>
            <div>
              <p class="kicker">${esc(about.kicker)}</p>
              <h2>${esc(about.title)}</h2>
              ${about.paragraphs.map((p) => `<p class="section-lead" style="margin-top:0.9rem">${esc(p)}</p>`).join("")}
            </div>
          </div>
          <div class="essential-grid" style="margin-top:2.4rem">${f.essentials}</div>
          <div class="link-row">
            <a href="${esc(f.official.district_en)}" rel="noopener noreferrer">District tourism (English)</a>
            <a href="${esc(f.official.district_kn)}" rel="noopener noreferrer">ಜಿಲ್ಲಾ ಪ್ರವಾಸೋದ್ಯಮ (ಕನ್ನಡ)</a>
            <a href="${esc(f.official.how_to_reach)}" rel="noopener noreferrer">How to reach</a>
            <a href="${esc(f.official.helpline)}" rel="noopener noreferrer">Helpline</a>
            <a href="${esc(f.official.forest)}" rel="noopener noreferrer">Forest department</a>
            <a href="${esc(f.official.ksrtc)}" rel="noopener noreferrer">KSRTC</a>
            <a href="${esc(f.official.karnataka_tourism)}" rel="noopener noreferrer">Karnataka Tourism</a>
          </div>
          <div class="section-head" style="margin-top:2.6rem">
            <p class="kicker">What to carry</p>
            <h2>A hill bag</h2>
          </div>
          <ul class="pack-list">${f.packing}</ul>
          <div class="conduct-grid" style="margin-top:2rem">
            <article class="conduct-card"><h3>Do</h3><ul>${f.dos}</ul></article>
            <article class="conduct-card"><h3>Don’t</h3><ul>${f.donts}</ul></article>
          </div>
          <div class="section-head" style="margin-top:2.6rem">
            <p class="kicker">Questions</p>
            <h2>Before you set out</h2>
          </div>
          <div class="faq-list">${f.faqs}</div>
          <div class="section-head" style="margin-top:2.6rem">
            <p class="kicker">Local visitor guide</p>
            <h2>${esc(f.d.guide.title)}</h2>
          </div>
          <div class="guide-grid">${f.guide}</div>
          <div class="section-head" style="margin-top:2.6rem">
            <p class="kicker">${esc(f.tx("credits"))}</p>
            <h2>Wikimedia Commons, named</h2>
          </div>
          <div class="credit-list">${f.credits}</div>
        </div>
      </section>
      ${footer(f)}`;
  }

  function renderPage(page, lang) {
    const pages = {
      home: renderHome,
      places: renderPlacesPage,
      map: renderMapPage,
      stories: renderStoriesPage,
      plan: renderPlanPage,
      visit: renderVisitPage,
    };
    return (pages[page] || renderHome)(lang);
  }

  function renderSeason(index, lang) {
    const season = global.CKM.seasons[index];
    if (!season) return;
    const root = document.getElementById("season-copy");
    const img = document.getElementById("season-image");
    if (img) {
      img.src = seasonImage(season.id);
      img.alt = season.title;
    }
    if (!root) return;
    const months = global.CKM.seasons
      .map((s, i) => `<button type="button" class="season-month" data-season-index="${i}" ${i === index ? 'style="color:var(--ink);font-weight:600"' : ""}>${esc(s.months.split("–")[0].trim())}</button>`)
      .join("");
    root.innerHTML = `
      <p class="kicker">${esc(season.months)}</p>
      <h3>${esc(season.title)}</h3>
      <p>${esc(season.text)}</p>
      <ul class="season-list">${season.experiences.map((e) => `<li>${esc(e)}</li>`).join("")}</ul>
      <p class="season-watch">${esc(season.watch)}</p>
      <input class="season-slider" id="season-slider" type="range" min="0" max="${global.CKM.seasons.length - 1}" value="${index}" aria-label="Season" />
      <div class="season-months">${months}</div>
    `;
  }

  global.CKMSections = {
    renderPage,
    placeCard,
    t,
    esc,
    catLabel,
    renderSeason,
    renderPlaceSections,
    CATEGORY_COLOR,
  };
})(window);
