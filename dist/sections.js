(function (global) {
  const CATEGORY_COLOR = {
    peaks: "#c4a36a",
    waterfalls: "#7aa3b8",
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

  function render(lang) {
    const d = global.CKM;
    const tx = (key) => t(lang, key);

    const interests = d.categories
      .filter((c) => c.id !== "all" && c.image)
      .map(
        (c) => `
        <button class="interest-tile" type="button" data-filter="${esc(c.id)}">
          <div class="media">
            <img src="${esc(c.image)}" alt="${esc(lang === "kn" ? c.kn : c.label)}" width="1800" height="1200" loading="lazy" />
          </div>
          <span class="interest-copy">
            <strong>${esc(lang === "kn" ? c.kn : c.label)}</strong>
            <span>${c.count || 0} places</span>
          </span>
        </button>`
      )
      .join("");

    const featured = (d.featured || [])
      .map((id) => d.destinations.find((p) => p.id === id))
      .filter(Boolean)
      .map(
        (p) => `
        <button class="feature-card" type="button" data-open-place="${esc(p.id)}">
          <div class="media">
            <img src="${esc(p.image)}" alt="${esc(p.name)}" width="1800" height="1200" loading="lazy" />
          </div>
          <span class="feature-copy">
            <span class="kicker">${esc(catLabel(p.category, lang))}</span>
            <h3>${esc(p.name)}</h3>
            <p>${esc(p.blurb)}</p>
          </span>
        </button>`
      )
      .join("");

    const taluks = (d.taluks || [])
      .map(
        (t) =>
          `<button class="filter-btn" type="button" data-taluk="${esc(t.id)}" aria-pressed="false">${esc(t.id)} · ${t.count}</button>`
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
              <button class="btn btn-dark" type="button" data-load-circuit="${esc(c.id)}">Use this sketch</button>
            </div>
          </article>`;
      })
      .join("");

    const faqs = (d.faqs || [])
      .map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`)
      .join("");

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

    const legend = d.categories
      .filter((c) => c.id !== "all")
      .map((c) => {
        const color = CATEGORY_COLOR[c.id] || "#c4a36a";
        return `<span><i class="dot" style="background:${color}"></i>${esc(lang === "kn" ? c.kn : c.label)}</span>`;
      })
      .join("");

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

    const highlights = d.highlights
      .map(
        (h) => `
        <article class="highlight-card">
          <div class="highlight-media">
            <img src="${esc(h.image)}" alt="${esc(h.season)}" width="1800" height="1200" loading="lazy" />
          </div>
          <h3>${esc(h.season)}</h3>
          <p>${esc(h.text)}</p>
        </article>`
      )
      .join("");

    const essentials = Object.values(d.essentials)
      .map((block) => {
        const items = block.items
          .map((item) => `<h4>${esc(item.title)}</h4><p>${esc(item.text)}</p>`)
          .join("");
        return `<article class="essential-card"><h3>${esc(block.title)}</h3>${items}</article>`;
      })
      .join("");

    const guide = d.guide.cards
      .map((c) => `<article class="guide-card"><h3>${esc(c.title)}</h3><p>${esc(c.text)}</p></article>`)
      .join("");

    const gallery = d.gallery
      .map(
        (g) => `
        <figure class="gallery-item">
          <img src="${esc(g.image)}" alt="${esc(g.caption)}" width="1800" height="1200" loading="lazy" />
          <figcaption>${esc(g.caption)} — ${esc(g.credit)}</figcaption>
        </figure>`
      )
      .join("");

    const credits = d.credits
      .map(
        (c) =>
          `<p>${esc(c.place)} — ${esc(c.artist)} — ${esc(c.license)}, via <a href="${esc(c.url)}" rel="noopener noreferrer">Wikimedia Commons</a></p>`
      )
      .join("");

    const official = d.official;

    return `
      <section class="section" id="explore">
        <div class="wrap">
          <div class="section-head">
            <p class="kicker">Browse by interest</p>
            <h2>What do you love?</h2>
            <p class="section-lead">Peaks, water, stone and forest — the same kinds of country a district tourism desk would point you toward, without a stay to sell.</p>
          </div>
          <div class="interest-grid">${interests}</div>
        </div>
      </section>

      <section class="section" id="landmarks" style="padding-top:0">
        <div class="wrap">
          <div class="section-head">
            <p class="kicker">Not to be missed</p>
            <h2>The landmarks</h2>
          </div>
          <div class="feature-grid">${featured}</div>
        </div>
      </section>

      <section class="section" id="about">
        <div class="wrap about-layout">
          <div class="about-media">
            <img src="${esc(about.image)}" alt="${esc(about.title)}" width="1800" height="1200" loading="lazy" />
          </div>
          <div>
            <p class="kicker">${esc(about.kicker)}</p>
            <h2>${esc(about.title)}</h2>
            ${about.paragraphs.map((p) => `<p class="section-lead" style="margin-top:0.9rem">${esc(p)}</p>`).join("")}
          </div>
        </div>
      </section>

      <section class="section" id="places">
        <div class="wrap">
          <div class="section-head">
            <p class="kicker">The district</p>
            <h2>Places worth the climb</h2>
            <p class="section-lead">Reference notes for peaks, water, stone and forest. Tap a photograph for the longer reading. Nothing here is a live fee, permit or opening-hour notice.</p>
          </div>
          <div class="toolbar">
            <label class="search-label">${esc(tx("search"))}
              <input id="place-search" type="search" placeholder="${esc(tx("search_ph"))}" autocomplete="off" />
            </label>
            <div class="filters" role="group" aria-label="${esc(tx("filters"))}">${filters}</div>
            <div class="taluk-row" role="group" aria-label="Taluks">
              <button class="filter-btn" type="button" data-taluk="all" aria-pressed="true">All taluks</button>
              ${taluks}
            </div>
          </div>
          <p class="results-meta"><span id="result-count">${d.destinations.length}</span> ${esc(tx("results"))}</p>
          <div class="place-grid" id="place-grid">${places}</div>
          <p class="empty-state" id="place-empty" hidden>${esc(tx("empty"))}</p>
        </div>
      </section>

      <section class="section map-section" id="map">
        <div class="wrap">
          <div class="section-head">
            <p class="kicker">${esc(tx("nav_map"))}</p>
            <h2>Nine taluks, one ridge line</h2>
            <p class="section-lead">OpenStreetMap for orientation only. Markers are approximate. Forest boundaries and jeep tracks change; confirm on the ground.</p>
          </div>
          <div class="map-frame"><div id="district-map" role="img" aria-label="Map of Chikkamagaluru destinations"></div></div>
          <div class="map-legend">${legend}</div>
        </div>
      </section>

      <section class="section" id="seasons">
        <div class="wrap">
          <div class="section-head">
            <p class="kicker">${esc(tx("nav_seasons"))}</p>
            <h2>What the year does to the ghats</h2>
            <p class="section-lead">A seasonal reading, not a calendar of events. Festival dates belong on temple and district pages.</p>
          </div>
          <div class="season-layout">
            <div class="season-media">
              <img id="season-image" src="assets/mullayanagiri.jpg" alt="Seasonal landscape" width="1800" height="1200" />
            </div>
            <div class="season-copy" id="season-copy">
              <p class="kicker">${esc(season.months)}</p>
              <h3>${esc(season.title)}</h3>
              <p>${esc(season.text)}</p>
              <ul class="season-list">${season.experiences.map((e) => `<li>${esc(e)}</li>`).join("")}</ul>
              <p class="season-watch">${esc(season.watch)}</p>
              <input class="season-slider" id="season-slider" type="range" min="0" max="${d.seasons.length - 1}" value="0" aria-label="Season" />
              <div class="season-months">${seasonMonths}</div>
            </div>
          </div>
        </div>
      </section>

      <section class="section" id="stories">
        <div class="wrap">
          <div class="section-head">
            <p class="kicker">${esc(tx("nav_stories"))}</p>
            <h2>Coffee, culture, care</h2>
          </div>
          ${stories}
        </div>
      </section>

      <section class="section" id="circuits">
        <div class="wrap">
          <div class="section-head">
            <p class="kicker">Suggested sketches</p>
            <h2>Three ways through the district</h2>
            <p class="section-lead">Planning notes, not packages and not bookings. Load a sketch into your private itinerary, then move days around.</p>
          </div>
          <div class="circuit-grid">${circuits}</div>
        </div>
      </section>

      <section class="section essentials" id="essentials">
        <div class="wrap">
          <div class="section-head">
            <p class="kicker">Visitor information</p>
            <h2>Arrive, move, ask permission, stay safe</h2>
            <p class="section-lead">The same practical desk a tourism office would keep: access, transport, forests and help. Fees and live closures live on official pages.</p>
          </div>
          <div class="essential-grid">${essentials}</div>
          <div class="link-row">
            <a href="${esc(official.district_en)}" rel="noopener noreferrer">District tourism (English)</a>
            <a href="${esc(official.district_kn)}" rel="noopener noreferrer">ಜಿಲ್ಲಾ ಪ್ರವಾಸೋದ್ಯಮ (ಕನ್ನಡ)</a>
            <a href="${esc(official.how_to_reach)}" rel="noopener noreferrer">How to reach</a>
            <a href="${esc(official.helpline)}" rel="noopener noreferrer">Helpline</a>
            <a href="${esc(official.forest)}" rel="noopener noreferrer">Forest department</a>
            <a href="${esc(official.ksrtc)}" rel="noopener noreferrer">KSRTC</a>
            <a href="${esc(official.karnataka_tourism)}" rel="noopener noreferrer">Karnataka Tourism</a>
          </div>
          <div class="section-head" style="margin-top:2.6rem">
            <p class="kicker">What to carry</p>
            <h2>A hill bag, not a packing list from a shop</h2>
          </div>
          <ul class="pack-list">${packing}</ul>
          <div class="conduct-grid" style="margin-top:2rem">
            <article class="conduct-card">
              <h3>Do</h3>
              <ul>${dos}</ul>
            </article>
            <article class="conduct-card">
              <h3>Don’t</h3>
              <ul>${donts}</ul>
            </article>
          </div>
          <div class="section-head" style="margin-top:2.6rem">
            <p class="kicker">Questions</p>
            <h2>Before you set out</h2>
          </div>
          <div class="faq-list">${faqs}</div>
        </div>
      </section>

      <section class="section" id="plan">
        <div class="wrap">
          <div class="section-head">
            <p class="kicker">${esc(tx("nav_plan"))}</p>
            <h2>${esc(tx("itinerary"))}</h2>
            <p class="section-lead">A private, day-by-day notebook stored in this browser. Drag a stamped chip between days, or add a place from its card. No account. No payment.</p>
          </div>
          <div class="plan-layout">
            <div>
              <div class="day-board" id="day-board"></div>
              <div class="plan-actions">
                <button class="btn btn-dark" type="button" id="add-day">${esc(tx("add_day"))}</button>
                <button class="btn btn-line" type="button" id="download-pack">${esc(tx("download"))}</button>
                <button class="btn btn-line" type="button" id="clear-trip">${esc(tx("clear_trip"))}</button>
              </div>
            </div>
            <aside class="passport" aria-labelledby="passport-title">
              <h2 id="passport-title">${esc(tx("passport"))}</h2>
              <p>${esc(tx("passport_blurb"))}</p>
              <p><span id="stamp-count">0</span> / ${d.destinations.length}</p>
              <div class="stamp-grid" id="stamp-grid"></div>
              <div class="progress" aria-hidden="true"><span id="stamp-bar" style="width:0%"></span></div>
            </aside>
          </div>
        </div>
      </section>

      <section class="section" id="gallery">
        <div class="wrap">
          <div class="section-head">
            <p class="kicker">Field photographs</p>
            <h2>A quieter look</h2>
          </div>
          <div class="gallery-grid">${gallery}</div>
        </div>
      </section>

      <section class="section" id="guide">
        <div class="wrap">
          <div class="section-head">
            <p class="kicker">Local visitor guide</p>
            <h2>${esc(d.guide.title)}</h2>
            <p class="section-lead">${esc(d.guide.intro)}</p>
          </div>
          <div class="guide-grid">${guide}</div>
        </div>
      </section>

      <section class="section" id="credits">
        <div class="wrap">
          <div class="section-head">
            <p class="kicker">${esc(tx("credits"))}</p>
            <h2>Wikimedia Commons, named</h2>
            <p class="section-lead">Photographs are reused under the licences named below. File pages carry the full attribution.</p>
          </div>
          <div class="credit-list">${credits}</div>
        </div>
      </section>

      <footer class="site-footer">
        <div class="wrap">
          <div class="footer-grid">
            <div>
              <p class="wordmark-en">Chikkamagaluru</p>
              <p class="wordmark-kn">ಚಿಕ್ಕಮಗಳೂರು</p>
              <p style="margin-top:0.8rem;color:rgba(243,238,228,.7)">${esc(tx("disclaimer"))}</p>
            </div>
            <div>
              <h2 class="kicker">${esc(tx("official"))}</h2>
              <ul>
                <li><a href="${esc(official.district_en)}" rel="noopener noreferrer">chikkamagaluru.nic.in — tourism</a></li>
                <li><a href="${esc(official.district_kn)}" rel="noopener noreferrer">ಕನ್ನಡ ಪ್ರವಾಸೋದ್ಯಮ ಪುಟ</a></li>
                <li><a href="${esc(official.karnataka_tourism)}" rel="noopener noreferrer">Karnataka Tourism</a></li>
                <li><a href="${esc(official.forest)}" rel="noopener noreferrer">Karnataka Forest Department</a></li>
              </ul>
            </div>
            <div>
              <h2 class="kicker">On this page</h2>
              <ul>
                <li><a href="#places">${esc(tx("nav_places"))}</a></li>
                <li><a href="#plan">${esc(tx("nav_plan"))}</a></li>
                <li><a href="#credits">${esc(tx("credits"))}</a></li>
              </ul>
            </div>
          </div>
          <p class="fineprint">Built as a static companion. Source links remain the authority for access, fees, permits and announcements.</p>
        </div>
      </footer>
    `;
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
    render,
    placeCard,
    t,
    esc,
    catLabel,
    renderSeason,
    CATEGORY_COLOR,
  };
})(window);
