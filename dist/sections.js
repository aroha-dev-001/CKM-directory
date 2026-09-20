(function (global) {
  const CATEGORY_COLOR = {
    peaks: "#c4a36a",
    viewpoints: "#8a9a6b",
    waterfalls: "#7aa3b8",
    dams: "#3f6f7c",
    lakes: "#4d7c8a",
    wildlife: "#3d6b4f",
    temples: "#b08968",
    heritage: "#8a6a4b",
    "hill-station": "#6b8f71",
    treks: "#5f7a4a",
    forts: "#8a6f55",
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

  function learnChevron() {
    return `<span class="t-learn-chevron" aria-hidden="true"><svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6"><path class="t-learn-arm t-learn-arm-top" d="M6 4L10 8"/><path class="t-learn-arm t-learn-arm-bot" d="M10 8L6 12"/></svg></span>`;
  }

  function learn(label) {
    return `${esc(label)}${learnChevron()}`;
  }

  function accChevron() {
    return `<span class="t-acc-chevron" aria-hidden="true"><svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 6.5L8 10.5L12 6.5" vector-effect="non-scaling-stroke"/></svg></span>`;
  }

  function catLabel(id, lang) {
    const found = global.CKM.categories.find((c) => c.id === id);
    if (!found) return id;
    return lang === "kn" ? found.kn : found.label;
  }

  function seasonImage(id) {
    const map = {
      winter: "assets/hero.jpg",
      summer: "assets/mullayanagiri.jpg",
      monsoon: "assets/jhari-falls.jpg",
      "post-monsoon": "assets/kudremukh.jpg",
    };
    return map[id] || "assets/hero.jpg";
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
        <a class="interest-card" href="places.html?category=${esc(c.id)}" data-interest-card>
          <span class="interest-card-media">
            <img src="${esc(c.image)}" alt="${esc(lang === "kn" ? c.kn : c.label)}" width="1800" height="1200" />
          </span>
          <span class="interest-card-copy">
            <span class="kicker">${esc(lang === "kn" ? c.label : "Kind of country")}</span>
            <strong>${esc(lang === "kn" ? c.kn : c.label)}</strong>
            <span class="kn">${esc(lang === "kn" ? c.label : c.kn)}</span>
            <span class="interest-lead">${esc(lang === "kn" ? c.leadKn || c.lead : c.lead)}</span>
            <span class="interest-meta">
              <span>${c.count || 0} places</span>
              <span class="text-link t-learn">${learn("Open")}</span>
            </span>
          </span>
          <span class="interest-progress" aria-hidden="true"></span>
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
          `<button class="t-tab" type="button" role="tab" data-taluk="${esc(t.id)}" aria-selected="false">${esc(t.name)} · ${t.count}</button>`
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
              <a class="btn btn-dark shine t-learn" href="plan.html?circuit=${esc(c.id)}" data-magnetic>${learn("Use this sketch")}</a>
            </div>
          </article>`;
      })
      .join("");
    const faqs = (d.faqs || [])
      .map(
        (f) => `
        <div class="t-acc faq-item" data-open="false">
          <button class="t-acc-head" type="button" aria-expanded="false">${esc(f.q)}${accChevron()}</button>
          <div class="t-acc-panel"><div class="t-acc-panel-inner"><p>${esc(f.a)}</p></div></div>
        </div>`
      )
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
    const season = d.seasons[0];
    const seasonMonths = `
      <div class="t-tabs season-tabs" role="tablist" aria-label="Seasons" data-tabs>
        <span class="t-tabs-pill" aria-hidden="true"></span>
        ${d.seasons
          .map(
            (s, i) =>
              `<button type="button" class="t-tab season-month" role="tab" data-season-index="${i}" aria-selected="${i === 0 ? "true" : "false"}">${esc(
                s.months.split("–")[0].trim()
              )}</button>`
          )
          .join("")}
      </div>`;
    const foodCards = (d.malnadFoods || [])
      .map((item) => {
        const teaser = String(item.story || "").split(/(?<=\.)\s/)[0] || "";
        return `
          <a class="pop-card food-card food-card-link shine-card" href="food.html?id=${esc(item.id)}">
            <span class="pop-face">
              <span class="media">
                <img src="${esc(item.image)}" alt="${esc(item.name)}" width="1800" height="1200" loading="lazy" />
              </span>
              <span class="pop-face-copy">
                <span class="kicker">${esc(item.kicker)}</span>
                <strong>${esc(item.name)}<span class="kn">${esc(item.kannada)}</span></strong>
                <span class="pop-why-line">${esc(teaser)}</span>
                <span class="text-link t-learn">${learn("Read the story")}</span>
              </span>
            </span>
          </a>`;
      })
      .join("");
    const foodsChapter = (num) => `
        <section class="story-chapter story-chapter--foods" id="malnad-foods" aria-labelledby="foods-title">
          <div class="wrap">
            <p class="story-num">${num}</p>
            <p class="kicker">Malnad kitchen</p>
            <h2 id="foods-title">Rice, leaf, and a cup from the hill</h2>
            <p class="section-lead">Six dishes the ghats still cook. Open a card for the full origin note on its own page. Photographs are companion stills — this page does not sell a meal.</p>
            <div class="pop-grid food-grid">${foodCards}</div>
          </div>
        </section>`;
    const storyIndexItems = [{ href: "#seasons", label: "Seasons" }];
    d.stories.forEach((s) => {
      storyIndexItems.push({ href: `#story-${s.id}`, label: s.kicker });
      if (s.id === "food") storyIndexItems.push({ href: "#malnad-foods", label: "Malnad kitchen" });
    });
    storyIndexItems.push({ href: "#gallery", label: "Photographs" });
    const storyIndex = `
      <nav class="t-tabs story-tabs" aria-label="Chapters on this page" data-tabs>
        <span class="t-tabs-pill" aria-hidden="true"></span>
        ${storyIndexItems
          .map((item, i) => {
            const num = String(i + 1).padStart(2, "0");
            return `<a class="t-tab" href="${esc(item.href)}" aria-selected="${i === 0 ? "true" : "false"}"><span>${esc(num)}</span>${esc(item.label)}</a>`;
          })
          .join("")}
      </nav>`;
    let chapter = 2;
    const stories = d.stories
      .map((s, i) => {
        const num = String(chapter).padStart(2, "0");
        chapter += 1;
        const isCoffee = s.id === "coffee" && d.coffeeOrigin;
        const beats = isCoffee
          ? d.coffeeOrigin.chapters
              .map((ch, j) => {
                const n = String(j + 1).padStart(2, "0");
                const teaser = String(ch.text || "").split(/\n\n/)[0] || "";
                return `
            <article class="story-beat story-beat-scene">
              <a class="story-beat-thumb" href="coffee.html#origin-${n}">
                <img src="${esc(ch.image)}" alt="${esc(ch.caption || ch.title)}" width="900" height="600" loading="lazy" />
              </a>
              <div>
                <p class="story-beat-num">${n}</p>
                <h3>${esc(ch.title)}</h3>
                <p>${esc(teaser)}</p>
              </div>
            </article>`;
              })
              .join("")
          : s.paragraphs
              .map(
                (p) => `
            <article class="story-beat">
              <p>${esc(p)}</p>
            </article>`
              )
              .join("");
        const sources = isCoffee
          ? `<div class="origin-sources">
              <p class="kicker">Sources</p>
              <ul>${(d.coffeeOrigin.sources || [])
                .map((src) => `<li><a href="${esc(src.url)}" rel="noopener noreferrer">${esc(src.label)}</a></li>`)
                .join("")}</ul>
            </div>`
          : "";
        const coffeeMedia = isCoffee
          ? `<figure class="story-media story-media-mosaic">
              ${(d.coffeeOrigin.chapters || [])
                .slice(0, 4)
                .map(
                  (ch, j) =>
                    `<a href="coffee.html#origin-${String(j + 1).padStart(2, "0")}"><img src="${esc(ch.image)}" alt="${esc(ch.caption || ch.title)}" width="900" height="600" loading="lazy" /></a>`
                )
                .join("")}
              <figcaption>${esc(d.coffeeOrigin.caption || "")}</figcaption>
            </figure>`
          : `<figure class="story-media">
              <img src="${esc(s.image)}" alt="${esc(s.title)}" width="1800" height="1200" loading="lazy" />
            </figure>`;
        const section = `
        <section class="story-chapter${i % 2 ? " is-flip" : " is-band"}" id="story-${esc(s.id)}" aria-labelledby="story-title-${esc(s.id)}">
          <div class="wrap story-chapter-inner">
            ${coffeeMedia}
            <div class="story-chapter-copy">
              <p class="story-num">${num}</p>
              <p class="kicker">${esc(s.kicker)}</p>
              <h2 id="story-title-${esc(s.id)}">${esc(s.title)}</h2>
              <div class="story-beats">${beats}</div>
              ${isCoffee ? `<p style="margin-top:1.1rem"><a class="text-link t-learn" href="coffee.html">${learn("Open the full coffee story")}</a></p>` : ""}
              ${sources}
            </div>
          </div>
        </section>`;
        if (s.id === "food") {
          const foodNum = String(chapter).padStart(2, "0");
          chapter += 1;
          return section + foodsChapter(foodNum);
        }
        return section;
      })
      .join("");
    const galleryNum = String(chapter).padStart(2, "0");
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
        <a class="season-card" href="stories.html#seasons">
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
        (s) => {
          const href = s.id === "coffee" ? "coffee.html" : `stories.html#story-${esc(s.id)}`;
          const img = s.id === "coffee" && d.coffeeOrigin?.saint?.image ? d.coffeeOrigin.saint.image : s.image;
          return `
        <a class="why-card tilt-card shine-card" href="${href}" data-tilt data-spotlight>
          <div class="media">
            <img src="${esc(img)}" alt="${esc(s.title)}" width="1800" height="1200" loading="lazy" />
          </div>
          <span class="why-card-copy">
            <span class="kicker">${esc(s.kicker)}</span>
            <h3>${esc(s.title)}</h3>
            <p>${esc(s.paragraphs[0])}</p>
            <span class="text-link t-learn">${learn("Read on")}</span>
          </span>
        </a>`;
        }
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
          <a class="home-circuit tilt-card shine-card" href="plan.html?circuit=${esc(c.id)}" data-tilt>
            <div class="media">
              <img src="${esc(c.image)}" alt="${esc(c.title)}" width="1800" height="1200" loading="lazy" />
            </div>
            <span class="home-circuit-copy">
              <span class="kicker">${esc(c.kicker)}</span>
              <h3>${esc(c.title)}</h3>
              <p>${esc(c.text)}</p>
              <p class="home-circuit-stops">${esc(names)}</p>
              <span class="text-link t-learn">${learn("Use this sketch")}</span>
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
    const exploreCards = (d.explore || [])
      .map((item, i) => {
        const title = lang === "kn" ? item.titleKn || item.title : item.title;
        const lede = lang === "kn" ? item.ledeKn || item.lede : item.lede;
        const label = lang === "kn" ? item.labelKn || item.label : item.label;
        return `
        <a class="explore-card${i === 0 ? " explore-card--lead" : ""}" href="${esc(item.href)}">
          <span class="explore-card-media">
            <img src="${esc(item.image)}" alt="${esc(title)}" width="1800" height="1200" />
          </span>
          <span class="explore-card-scrim" aria-hidden="true"></span>
          <span class="explore-card-copy">
            <span class="explore-card-label">${esc(label)}</span>
            <h3>${esc(title)}</h3>
            <p>${esc(lede)}</p>
            <span class="explore-more">${lang === "kn" ? "ಇನ್ನಷ್ಟು ನೋಡಿ" : "View more"} <span aria-hidden="true">→</span></span>
          </span>
        </a>`;
      })
      .join("");
    const fieldNotes = (d.guide?.cards || [])
      .slice(0, 3)
      .map((c) => `<article class="guide-card"><h3>${esc(c.title)}</h3><p>${esc(c.text)}</p></article>`)
      .join("");
    const popularCarousel = (d.popularPlaces || [])
      .filter((item) => item.featured)
      .map((item) => {
        const place = d.destinations.find((p) => p.id === item.id);
        if (!place) return null;
        return {
          id: place.id,
          image: place.image,
          alt: place.name,
          kicker: item.kicker,
          name: place.name,
          kannada: place.kannada,
          hours: item.hours,
          hoursDetail: item.hoursDetail,
          why: item.why,
          hoursSource: item.hoursSource,
        };
      })
      .filter(Boolean);
    const popularCards = (d.popularPlaces || [])
      .filter((item) => item.featured)
      .map((item) => {
        const place = d.destinations.find((p) => p.id === item.id);
        if (!place) return "";
        const panelId = `pop-panel-${esc(item.id)}`;
        return `
          <article class="pop-card t-acc shine-card" data-pop-card="${esc(item.id)}" data-open="false">
            <button class="pop-face t-acc-head" type="button" data-pop-toggle="${esc(item.id)}" aria-expanded="false" aria-controls="${panelId}">
              <span>
              <div class="media">
                <img src="${esc(place.image)}" alt="${esc(place.name)}" width="1800" height="1200" loading="lazy" />
              </div>
              <span class="pop-face-copy">
                <span class="kicker">${esc(item.kicker)}</span>
                <strong>${esc(place.name)}</strong>
                <span class="t-tt-wrap">
                  <span class="pop-hours t-tt-trigger">${esc(item.hours)}</span>
                  <span class="t-tt" role="tooltip">Typical hours — confirm on the linked official page</span>
                </span>
                <span class="pop-why-line">${esc(item.why)}</span>
              </span>
              </span>
              ${accChevron()}
            </button>
            <div class="t-acc-panel">
              <div class="t-acc-panel-inner pop-panel" id="${panelId}">
              <p class="kicker">Typical hours</p>
              <p>${esc(item.hoursDetail)}</p>
              <p class="kicker" style="margin-top:0.9rem">Why people come</p>
              <p>${esc(item.why)}</p>
              <p class="pop-source">Hours and access change. Confirm on <a href="${esc(item.hoursSource.url)}" rel="noopener noreferrer">${esc(item.hoursSource.label)}</a> — this companion does not list fees.</p>
              <div class="pop-actions">
                <button class="btn btn-dark shine" type="button" data-open-place="${esc(place.id)}" data-magnetic>Open this place</button>
                <a class="btn btn-line t-learn" href="places.html?id=${esc(place.id)}">${learn("Go to places")}</a>
              </div>
              </div>
            </div>
          </article>`;
      })
      .join("");
    const origin = d.coffeeOrigin || {};
    const originChapters = (origin.chapters || [])
      .map((ch, i) => {
        const paras = String(ch.text || "").split(/\n\n/).filter(Boolean);
        const n = String(i + 1).padStart(2, "0");
        const id = ch.id || `origin-${n}`;
        const flip = i % 2 === 1 ? " is-flip" : "";
        const kicker = ch.kicker ? `<p class="kicker origin-kicker">${esc(ch.kicker)}</p>` : "";
        const media = ch.image
          ? `<figure class="origin-scene-media">
              <img src="${esc(ch.image)}" alt="${esc(ch.caption || ch.title)}" width="1800" height="1200" decoding="async" ${i < 2 ? "" : 'loading="lazy"'} />
              <figcaption>${esc(ch.caption || "")}</figcaption>
            </figure>`
          : "";
        return `<article class="origin-scene${flip}" id="${esc(id)}">
          ${media}
          <div class="origin-chapter">
            <p class="story-beat-num">${n}</p>
            ${kicker}
            <h3>${esc(ch.title)}</h3>
            ${paras.map((p) => `<p>${esc(p)}</p>`).join("")}
          </div>
        </article>`;
      })
      .join("");
    const originSources = (origin.sources || [])
      .map((s) => `<li><a href="${esc(s.url)}" rel="noopener noreferrer">${esc(s.label)}</a></li>`)
      .join("");
    const credits = d.credits
      .map((c) => {
        const commons = String(c.url || "").includes("commons.wikimedia.org");
        const via = commons
          ? `${esc(c.license)}, via <a href="${esc(c.url)}" rel="noopener noreferrer">Wikimedia Commons</a>`
          : esc(c.license);
        return `<p>${esc(c.place)} — ${esc(c.artist)} — ${via}</p>`;
      })
      .join("");
    const talukOrder = ["chikkamagaluru", "tarikere", "kadur", "mudigere", "koppa", "nrpura", "sringeri", "kalasa", "ajjampura"];
    const talukById = Object.fromEntries((d.taluks || []).map((t) => [t.id, t]));
    const talukIndex = talukOrder
      .map((id) => talukById[id])
      .filter(Boolean)
      .map((t) => {
        const label = lang === "kn" ? t.kannada : t.listName || t.name;
        return `<li>
          <a class="taluk-index-row" href="taluk.html?id=${esc(t.id)}" data-select-taluk="${esc(t.id)}">
            <span class="taluk-index-name">${esc(label)}</span>
            <span class="taluk-index-dots" aria-hidden="true"></span>
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
      filters, places, season, seasonMonths, stories, storyIndex, essentials, guide, gallery, credits,
      talukIndex, placeJump, official: d.official, tickerItems, seasonCards, whyCards,
      origin, originChapters, originSources,
      foodCards, galleryNum, homeCircuits, homeGallery, fieldNotes, popularCards, popularCarousel,
      exploreCards,
    };
  }

  function renderPlaceSections(lang, list, catIds) {
    const cats = global.CKM.categories.filter((c) => c.id !== "all" && (!catIds || catIds.includes(c.id)));
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
                <li><a href="index.html#explore-chikmagaluru">Explore</a></li>
                <li><a href="food.html">Food</a></li>
                <li><a href="nature.html">Nature</a></li>
                <li><a href="stay.html">Hill air</a></li>
                <li><a href="heritage.html">Heritage</a></li>
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

  function exploreHubNav(active, lang) {
    const items = [
      ["food", "food.html", "Food", "ಆಹಾರ"],
      ["nature", "nature.html", "Nature", "ಪ್ರಕೃತಿ"],
      ["stay", "stay.html", "Stays", "ಗಿರಿಧಾಮ"],
      ["heritage", "heritage.html", "Heritage", "ಪರಂಪರೆ"],
    ];
    const links = items
      .map(([id, href, en, kn]) => {
        const on = id === active;
        return `<a href="${href}"${on ? ' aria-current="page" class="is-active"' : ""}>${lang === "kn" ? kn : en}</a>`;
      })
      .join("");
    return `<nav class="explore-hub-nav" aria-label="Explore Chikkamagaluru">${links}</nav>`;
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
              <a class="btn btn-light shine t-learn" href="places.html" data-magnetic>${learn("Explore all places")}</a>
              <a class="btn btn-ghost" href="map.html">Open the district map</a>
              <a class="btn btn-ghost" href="popular.html">Popular places</a>
              <a class="btn btn-ghost" href="#explore-chikmagaluru">Explore Chikkamagaluru</a>
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
            <a class="hero-scroll" href="#explore-district">Scroll into the district</a>
          </div>
        </div>
      </section>
      <section class="district-explorer-section" id="explore-district">
        <div class="wrap wrap-wide">
          <div class="district-explorer">
            <div class="district-copy">
              <p class="kicker">Explore the district</p>
              <h2>Nine taluks, endless experiences.</h2>
              <p class="section-lead">From Mullayanagiri’s cloud line to the temples of Sringeri and the tiger forests of Bhadra — Chikkamagaluru is a district of contrasts. Explore by taluk to see what awaits you.</p>
              <a class="btn btn-dark shine t-learn" data-map-cta href="map.html" data-magnetic>${learn("View district map")}</a>
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
              <p class="taluk-summary" id="taluk-summary">Click a taluk to open its places.</p>
              <p class="taluk-footnote">Kalasa and Ajjampura were carved out of Mudigere and Tarikere after older maps were drawn. Each is shown here with its current OSM boundary.</p>
            </aside>
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
      <section class="explore-section reveal-on-scroll" id="explore-chikmagaluru" aria-labelledby="explore-title">
        <div class="wrap">
          <p class="kicker explore-kicker">Welcome</p>
          <h2 id="explore-title">Explore Chikkamagaluru</h2>
          <p class="explore-wave" aria-hidden="true">∿</p>
          <p class="section-lead explore-lead">Food, nature, hill air and heritage — four ways into a district companion. No rooms, no restaurants, no tickets.</p>
        </div>
        <div class="explore-rail-wrap">
          <button class="explore-nav" type="button" data-explore-prev aria-label="Previous explore card">‹</button>
          <div class="explore-rail" data-explore-rail tabindex="0" aria-label="Explore Chikkamagaluru">
            ${f.exploreCards}
          </div>
          <button class="explore-nav" type="button" data-explore-next aria-label="Next explore card">›</button>
        </div>
      </section>
      <section class="places-drift-band" aria-labelledby="places-drift-title">
        <div class="wrap places-drift-intro">
          <p class="kicker">The wall</p>
          <h2 id="places-drift-title">Still drifting through the district.</h2>
          <p class="section-lead">Click a photograph to pause the wall and flip it. Two or three lines of place notes are on the back — visitor hours live in Places.</p>
        </div>
        <div class="places-drift-stage">
          <div data-drift-wall></div>
        </div>
      </section>
      <section class="section pop-section reveal-on-scroll" id="popular-places">
        <div class="wrap">
          <div class="section-head">
            <p class="kicker">Popular places</p>
            <h2>Open a card. See why it draws a crowd.</h2>
            <p class="section-lead">Eight stops that show up first on visitor lists — typical hours from temple and district pages, not a live board. The full set lives on the popular page.</p>
            <a class="text-link t-learn" href="popular.html">${learn("All popular places")}</a>
          </div>
          <div class="pop-carousel-layout">
            <div class="pop-carousel-stage">
              <div data-popular-carousel></div>
            </div>
            <div class="pop-depth-note" data-pop-depth-note></div>
          </div>
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
            <a class="btn btn-dark shine t-learn" href="plan.html" data-magnetic>${learn("Sketch a private trip")}</a>
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
      <section class="section">
        <div class="wrap">
          <div class="toolbar">
            <label class="search-label">${esc(f.tx("search"))}
              <input id="place-search" type="search" placeholder="${esc(f.tx("search_ph"))}" autocomplete="off" />
            </label>
            <nav class="place-jump" aria-label="Jump to a kind of place">${f.placeJump}</nav>
            <div class="t-tabs taluk-tabs" role="tablist" aria-label="Taluks" data-tabs>
              <span class="t-tabs-pill" aria-hidden="true"></span>
              <button class="t-tab" type="button" role="tab" data-taluk="all" aria-selected="true">All taluks</button>
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

  function listedLabel(key) {
    return (
      {
        tripadvisor: "Tripadvisor Things to Do",
        "travel-chikmagalur": "District place lists",
        "weekend-lists": "Typical 2-day loops",
      }[key] || key
    );
  }

  function renderPopularPage(lang) {
    const f = fragments(lang);
    const groups = [
      ["all", "All popular"],
      ["peaks", "Peaks"],
      ["waterfalls", "Waterfalls"],
      ["hills", "Hills & ghats"],
      ["temples", "Temples"],
      ["lakes", "Lakes & dams"],
      ["forest", "Forest"],
      ["heritage", "Coffee & heritage"],
    ];
    const filters = groups
      .map(
        ([id, label], i) =>
          `<button class="t-tab" type="button" role="tab" data-popular-group="${esc(id)}" aria-selected="${i === 0 ? "true" : "false"}">${esc(label)}</button>`
      )
      .join("");
    const cards = (f.d.popularPlaces || [])
      .map((item) => {
        const place = f.d.destinations.find((p) => p.id === item.id);
        if (!place) return "";
        const chips = (item.listed || [])
          .map((k) => `<span class="pop-listed">${esc(listedLabel(k))}</span>`)
          .join("");
        const km =
          place.distanceKm != null ? `<span>${esc(String(place.distanceKm))} km from town</span>` : "";
        const dur =
          place.durationMin != null
            ? `<span>${esc(String(Math.round(place.durationMin / 60) || 1))} h typical stop</span>`
            : "";
        return `
          <article class="popular-card" data-popular-card data-popular-group="${esc(item.group || "all")}" data-name="${esc(place.name)} ${esc(place.kannada)}">
            <button class="popular-card-media" type="button" data-open-place="${esc(place.id)}">
              <img src="${esc(place.image)}" alt="${esc(place.name)}" width="1800" height="1200" loading="lazy" />
            </button>
            <div class="popular-card-body">
              <p class="kicker">${esc(item.kicker || catLabel(place.category, lang))}</p>
              <h2>${esc(place.name)}</h2>
              <p class="kn">${esc(place.kannada)}</p>
              <p class="popular-why">${esc(item.why || place.blurb)}</p>
              <p class="popular-hours"><strong>${esc(item.hours || "Daylight")}</strong> — ${esc(item.hoursDetail || place.visit)}</p>
              <p class="popular-meta">${km}${dur}<span>${esc(place.taluk)}</span></p>
              <div class="popular-chips">${chips}</div>
              <div class="popular-actions">
                <button class="btn btn-dark" type="button" data-open-place="${esc(place.id)}">Visitor notes</button>
                <a class="btn btn-line" href="taluk.html?id=${esc(place.talukId || "")}#place-${esc(place.id)}">Show on map</a>
              </div>
              ${
                item.hoursSource
                  ? `<p class="visitor-source"><a href="${esc(item.hoursSource.url)}" rel="noopener noreferrer">${esc(item.hoursSource.label)}</a></p>`
                  : ""
              }
            </div>
          </article>`;
      })
      .join("");
    const nearby = (f.d.nearbyPlaces || [])
      .map(
        (n) => `
        <article class="nearby-card">
          <p class="kicker">${esc(n.district)}</p>
          <h3>${esc(n.name)}</h3>
          <p>${esc(n.blurb)}</p>
          <a href="${esc(n.url)}" rel="noopener noreferrer">Karnataka Tourism</a>
        </article>`
      )
      .join("");
    return `
      <section class="page-hero popular-hero">
        <div class="wrap">
          <p class="kicker">Popular tourist places</p>
          <h1>What visitors actually queue for</h1>
          <p class="section-lead">Thirty stops that keep showing up on Tripadvisor’s Chikmagalur Things to Do, on district-oriented place lists, and on typical 2-day hill loops. Copy here is this companion’s — not those sites’. Hours are published hints, not a live gate. No fees, rooms or packages.</p>
          <p class="popular-count" data-popular-count>${(f.d.popularPlaces || []).length} popular places in the district</p>
        </div>
      </section>
      <section class="section" style="padding-top:0">
        <div class="wrap">
          <div class="toolbar popular-toolbar">
            <label class="search-label">${esc(f.tx("search"))}
              <input id="popular-search" type="search" placeholder="Mullayanagiri, Hebbe, Sringeri…" autocomplete="off" />
            </label>
            <div class="t-tabs" role="tablist" aria-label="Kind of popular place" data-tabs>
              <span class="t-tabs-pill" aria-hidden="true"></span>
              ${filters}
            </div>
          </div>
          <div class="popular-stack" id="popular-stack">${cards}</div>
          <p class="empty-state" id="popular-empty" hidden>Nothing in that slice. Clear the search or pick another group.</p>
        </div>
      </section>
      <section class="section nearby-band">
        <div class="wrap">
          <div class="section-head">
            <p class="kicker">Often bundled, not in this district</p>
            <h2>Hassan is next door.</h2>
            <p class="section-lead">2-day blogs add Belur, Halebidu and Yagachi because they sit on the same Bangalore road. They are Hassan district sights. This companion will not pretend they are taluks of Chikkamagaluru.</p>
          </div>
          <div class="nearby-grid">${nearby}</div>
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
              <p class="kicker">Explore the district</p>
              <h1>Nine taluks, endless experiences.</h1>
              <p class="section-lead">Sage fills follow how many places this companion holds in each taluk. Click a shape — or a name — to open that taluk’s page. Places are marked only there. Boundaries are OpenStreetMap reference, not a survey.</p>
              <a class="btn btn-dark shine t-learn" id="taluk-places-cta" href="places.html" data-magnetic>${learn("Browse all places")}</a>
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
              <p class="taluk-summary" id="taluk-summary">Nine taluks. Places wait on each taluk’s own page.</p>
              <p class="taluk-footnote">${esc(f.d.mapNote || "")}</p>
            </aside>
          </div>
        </div>
      </section>
      ${footer(f)}`;
  }

  function talukPlaceArticle(place, lang) {
    const extra = (global.CKM.popularPlaces || []).find((p) => p.id === place.id);
    const title = lang === "kn" ? place.kannada : place.name;
    const sources = []
      .concat(place.sources || [])
      .concat(extra && extra.hoursSource ? [extra.hoursSource] : [])
      .filter((s, i, arr) => s && s.url && arr.findIndex((x) => x.url === s.url) === i)
      .map((s) => `<li><a href="${esc(s.url)}" rel="noopener noreferrer">${esc(s.label)}</a></li>`)
      .join("");
    const why = extra
      ? `<p class="taluk-place-why">${esc(extra.why)}</p>
         <p class="taluk-place-hours"><strong>${esc(extra.hours)}</strong> — ${esc(extra.hoursDetail)}</p>`
      : "";
    return `
      <article class="taluk-place" id="place-${esc(place.id)}">
        <figure class="taluk-place-media">
          <img src="${esc(place.image)}" alt="${esc(place.name)}" width="1800" height="1200" loading="lazy" />
        </figure>
        <div class="taluk-place-body">
          <p class="kicker">${esc(catLabel(place.category, lang))} · ${esc(place.taluk)}</p>
          <h2>${esc(title)}</h2>
          <p class="kn">${esc(place.kannada)}</p>
          <p>${esc(place.summary || place.blurb)}</p>
          ${why}
          <p>${esc(place.visit)}</p>
          <p class="taluk-place-meta">${esc(place.bestTime || "")}${place.elevation ? " · " + esc(place.elevation) : ""}</p>
          ${sources ? `<ul class="taluk-sources">${sources}</ul>` : ""}
          <div class="taluk-place-actions">
            <button class="btn btn-dark" type="button" data-open-place="${esc(place.id)}">${learn("Open visitor notes")}</button>
            <button class="btn btn-line" type="button" data-add-day="0" data-place="${esc(place.id)}">Add to trip</button>
          </div>
        </div>
      </article>`;
  }

  function renderTalukPage(lang) {
    const f = fragments(lang);
    const id = new URLSearchParams(location.search).get("id") || "";
    const taluk = (f.d.taluks || []).find((t) => t.id === id);
    if (!taluk) {
      return `
        <section class="page-hero">
          <div class="wrap">
            <p class="kicker">Taluk guide</p>
            <h1>Choose a taluk</h1>
            <p class="section-lead">This page needs a taluk in the address. Open the district map and click one of the nine.</p>
            <a class="btn btn-dark shine" href="map.html">${learn("Nine-taluk map")}</a>
          </div>
        </section>
        ${footer(f)}`;
    }
    const places = (f.d.destinations || []).filter((p) => p.talukId === taluk.id);
    const label = lang === "kn" ? taluk.kannada : taluk.listName || taluk.name;
    const articles = places.map((p) => talukPlaceArticle(p, lang)).join("");
    const empty = places.length
      ? ""
      : `<p class="empty-state" id="taluk-places-empty">This companion does not yet list a destination in ${esc(label)}. The OSM boundary is shown so the nine-taluk map stays complete. Neighbour taluks still have full guides.</p>`;
    const grouped = (f.d.categories || [])
      .filter((c) => c.id !== "all")
      .map((c) => {
        const n = places.filter((p) => p.category === c.id).length;
        return n ? `<span class="taluk-chip">${esc(lang === "kn" ? c.kn : c.label)} · ${n}</span>` : "";
      })
      .join("");
    return `
      <section class="page-hero taluk-hero">
        <div class="wrap">
          <p class="kicker"><a href="map.html">The district</a> · ${esc(label)}</p>
          <h1>${esc(label)}</h1>
          <p class="kn">${esc(taluk.kannada)}</p>
          <p class="section-lead">${esc(taluk.blurb)}</p>
          <div class="taluk-chips">${grouped}</div>
          <p class="taluk-place-meta">${places.length} place${places.length === 1 ? "" : "s"} in this companion — descriptions from district tourism, temple and forest pages already on the public web. Not a complete gazetteer.</p>
        </div>
      </section>
      <section class="district-explorer-section taluk-focus-section">
        <div class="wrap wrap-wide">
          <div class="taluk-focus-grid">
            <div class="district-copy">
              <p class="kicker">This taluk</p>
              <h2>Places on the map.</h2>
              <p class="section-lead">The district overview hid every pin. Here the listed sights sit on ${esc(label)}’s OSM polygon. Click a marker to jump to its notes below.</p>
              <a class="btn btn-line" href="map.html">${learn("Back to nine taluks")}</a>
            </div>
            <div class="district-map-stage">
              <div class="choropleth choropleth-lg" id="district-svg" data-map-root data-map-mode="taluk" data-focus-taluk="${esc(taluk.id)}" role="img" aria-label="Places in ${esc(label)}"></div>
            </div>
          </div>
        </div>
      </section>
      <section class="section taluk-guide">
        <div class="wrap">
          <div class="section-head">
            <p class="kicker">Visitor notes</p>
            <h2>Every listed place in ${esc(label)}.</h2>
            <p class="section-lead">Hours, approach and “why people stop” come from public pages — the district, Karnataka Forest Department, mathas — not from a booking desk. Confirm before you go.</p>
          </div>
          <div class="taluk-place-list">${articles}</div>
          ${empty}
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
          <h1>Coffee, culture, kitchen, care</h1>
          <p class="section-lead">Separate readings of the district — seasons, coffee, stone, a Malnad kitchen, and the forest that is not a backdrop. Each chapter stands on its own.</p>
          ${f.storyIndex}
        </div>
      </section>
      <section class="story-chapter story-chapter--seasons" id="seasons" aria-labelledby="seasons-title">
        <div class="wrap">
          <p class="story-num">01</p>
          <p class="kicker">${esc(f.tx("nav_seasons"))}</p>
          <h2 id="seasons-title">Four weathers, four districts</h2>
          <p class="section-lead">Clear ridges in winter, thinner falls by summer, a monsoon that turns the ghats to water, and an October still dripping green.</p>
          <div class="season-layout">
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
        </div>
      </section>
      ${f.stories}
      <section class="story-chapter" id="gallery" aria-labelledby="gallery-title">
        <div class="wrap">
          <p class="story-num">${esc(f.galleryNum)}</p>
          <p class="kicker">Field photographs</p>
          <h2 id="gallery-title">A quieter look</h2>
          <p class="section-lead">Stills from people who walked here, credited on the visit page.</p>
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
                <button class="btn btn-dark shine" type="button" id="add-day" data-magnetic>${esc(f.tx("add_day"))}</button>
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
            <h2>Photographs &amp; licences</h2>
          </div>
          <div class="credit-list">${f.credits}</div>
        </div>
      </section>
      ${footer(f)}`;
  }

  function renderCoffeePage(lang) {
    const f = fragments(lang);
    const origin = f.origin || {};
    return `
      <section class="page-hero">
        <div class="wrap">
          <p class="kicker">${esc(origin.kicker || "How coffee reached these hills")}</p>
          <h1>${esc(origin.title || "Seven seeds from Mocha")}</h1>
          <p class="section-lead">${esc(origin.lede || "")}</p>
          <p><a class="text-link t-learn" href="heritage.html">${learn("Back to heritage")}</a></p>
        </div>
      </section>
      <section class="story-longread coffee-longread">
        <div class="wrap">
          <div class="origin-scenes">${f.originChapters}</div>
          <div class="origin-sources">
            <p class="kicker">Sources</p>
            <ul>${f.originSources}</ul>
          </div>
          <p class="section-lead" style="margin-top:2rem">The ridge that holds his shrine is still walked as Baba Budangiri / Datta Peetha. Hours and crowd rules belong to the shrine, not to this page.</p>
          <p><a class="btn btn-dark shine t-learn" href="places.html?id=baba-budangiri" data-magnetic>${learn("Open Baba Budangiri")}</a>
             <a class="btn btn-line" href="stories.html#story-coffee">Coffee chapter on Stories</a></p>
        </div>
      </section>
      ${footer(f)}`;
  }

  function renderFoodPage(lang) {
    const f = fragments(lang);
    const foods = f.d.malnadFoods || [];
    const id = new URLSearchParams(location.search).get("id");
    const foodStory = (f.d.stories || []).find((s) => s.id === "food");
    if (!id) {
      return `
      <section class="page-hero">
        <div class="wrap">
          <p class="kicker">Explore · Food</p>
          <h1>Rice, leaf, and a cup from the hill</h1>
          <p class="section-lead">${esc(foodStory?.paragraphs?.[0] || "Malnad cooking is rice-first. This page does not sell a meal.")}</p>
          ${exploreHubNav("food", lang)}
        </div>
      </section>
      <section class="section food-section" id="malnad-foods" aria-labelledby="foods-hub-title" style="padding-top:0">
        <div class="wrap">
          <div class="section-head">
            <p class="kicker">Malnad kitchen</p>
            <h2 id="foods-hub-title">Open a plate for the origin story.</h2>
            <p class="section-lead">Photographs are companion stills, not a restaurant list.</p>
          </div>
          <div class="pop-grid food-grid">${f.foodCards}</div>
        </div>
      </section>
      ${footer(f)}`;
    }
    const found = foods.find((item) => item.id === id);
    const dish = found;
    if (!dish) {
      return `
        <section class="page-hero">
          <div class="wrap">
            <p class="kicker">Malnad kitchen</p>
            <h1>No dish listed yet</h1>
            <p class="section-lead">This companion does not yet hold that plate.</p>
            <p><a class="text-link t-learn" href="food.html">${learn("Back to the kitchen")}</a></p>
          </div>
        </section>
        ${footer(f)}`;
    }
    const others = foods
      .filter((item) => item.id !== dish.id)
      .map(
        (item) => `
          <a class="pop-card food-card food-card-link shine-card" href="food.html?id=${esc(item.id)}">
            <span class="pop-face">
              <span class="media">
                <img src="${esc(item.image)}" alt="${esc(item.name)}" width="1800" height="1200" loading="lazy" />
              </span>
              <span class="pop-face-copy">
                <span class="kicker">${esc(item.kicker)}</span>
                <strong>${esc(item.name)}<span class="kn">${esc(item.kannada)}</span></strong>
              </span>
            </span>
          </a>`
      )
      .join("");
    return `
      <section class="page-hero">
        <div class="wrap">
          <p class="kicker">${esc(dish.kicker)}</p>
          <h1>${esc(dish.name)}</h1>
          <p class="hero-kn" lang="kn">${esc(dish.kannada)}</p>
          <p><a class="text-link t-learn" href="food.html">${learn("All Malnad dishes")}</a></p>
        </div>
      </section>
      <section class="story-longread">
        <div class="wrap food-story">
          <figure class="food-story-media">
            <img src="${esc(dish.image)}" alt="${esc(dish.name)}" width="1800" height="1200" />
            <figcaption>Companion photograph — ${esc(dish.name)}. Not a restaurant listing.</figcaption>
          </figure>
          <div class="food-story-copy">
            <p class="kicker">The story</p>
            <p class="food-story-text">${esc(dish.story)}</p>
            <p class="pop-source">Regional kitchen tradition. Read more: <a href="${esc(dish.source.url)}" rel="noopener noreferrer">${esc(dish.source.label)}</a></p>
          </div>
        </div>
      </section>
      <section class="section" style="padding-top:0">
        <div class="wrap">
          <div class="section-head">
            <p class="kicker">Also from these hills</p>
            <h2>More Malnad plates.</h2>
          </div>
          <div class="pop-grid food-grid">${others}</div>
        </div>
      </section>
      ${footer(f)}`;
  }

  function renderNaturePage(lang) {
    const f = fragments(lang);
    const natureCats = ["waterfalls", "lakes", "dams", "peaks", "viewpoints", "treks", "wildlife"];
    const responsible = (f.d.stories || []).find((s) => s.id === "responsible");
    return `
      <section class="page-hero">
        <div class="wrap">
          <p class="kicker">Explore · Nature</p>
          <h1>Ridges, water, and a living forest</h1>
          <p class="section-lead">Peaks, falls, lakes and notified forests. Enter Kudremukh and Bhadra only with a permit. Nothing here is a live gate.</p>
          ${exploreHubNav("nature", lang)}
        </div>
      </section>
      <section class="section" id="seasons-home" style="padding-top:0">
        <div class="wrap">
          <div class="section-head-row">
            <div class="section-head">
              <p class="kicker">${esc(f.tx("nav_seasons"))}</p>
              <h2>Four weathers, four districts.</h2>
              <p class="section-lead">Come for the season you can actually walk.</p>
            </div>
            <a class="text-link t-learn" href="stories.html#seasons">${learn("Season notes")}</a>
          </div>
          <div class="season-card-grid">${f.seasonCards}</div>
        </div>
      </section>
      <section class="section" style="padding-top:0">
        <div class="wrap">
          <div class="section-head">
            <p class="kicker">In the open</p>
            <h2>Water, ridge, and forest.</h2>
            <p class="section-lead">The outdoor catalogue from this companion — grouped the way you look for them.</p>
          </div>
          <div id="place-sections">${renderPlaceSections(lang, f.d.destinations, natureCats)}</div>
          <p><a class="text-link t-learn" href="places.html">${learn("All places")}</a></p>
        </div>
      </section>
      ${
        responsible
          ? `<section class="section" style="padding-top:0">
        <div class="wrap">
          <a class="story-entry-card tilt-card shine-card" href="stories.html#story-responsible" data-tilt>
            <span class="media">
              <img src="${esc(responsible.image)}" alt="${esc(responsible.title)}" width="1800" height="1200" />
            </span>
            <span class="story-entry-copy">
              <span class="kicker">${esc(responsible.kicker)}</span>
              <h2>${esc(responsible.title)}</h2>
              <p>${esc(responsible.paragraphs[0])}</p>
              <span class="text-link t-learn">${learn("Read on")}</span>
            </span>
          </a>
        </div>
      </section>`
          : ""
      }
      <section class="section" id="home-gallery">
        <div class="wrap">
          <div class="section-head-row">
            <div class="section-head">
              <p class="kicker">Field photographs</p>
              <h2>A quieter look.</h2>
            </div>
            <a class="text-link t-learn" href="stories.html#gallery">${learn("Full gallery")}</a>
          </div>
          <div class="home-gallery">${f.homeGallery}</div>
        </div>
      </section>
      ${footer(f)}`;
  }

  function renderHeritagePage(lang) {
    const f = fragments(lang);
    const heritageCats = ["temples", "forts", "heritage"];
    const cultureWhy = (f.d.stories || [])
      .filter((s) => s.id === "culture" || s.id === "coffee")
      .map((s) => {
        const href = s.id === "coffee" ? "coffee.html" : `stories.html#story-${esc(s.id)}`;
        const img = s.id === "coffee" && f.d.coffeeOrigin?.saint?.image ? f.d.coffeeOrigin.saint.image : s.image;
        return `
        <a class="why-card tilt-card shine-card" href="${href}" data-tilt>
          <div class="media">
            <img src="${esc(img)}" alt="${esc(s.title)}" width="1800" height="1200" loading="lazy" />
          </div>
          <span class="why-card-copy">
            <span class="kicker">${esc(s.kicker)}</span>
            <h3>${esc(s.title)}</h3>
            <p>${esc(s.paragraphs[0])}</p>
            <span class="text-link t-learn">${learn("Read on")}</span>
          </span>
        </a>`;
      })
      .join("");
    return `
      <section class="page-hero">
        <div class="wrap">
          <p class="kicker">Explore · Heritage</p>
          <h1>Stone, matha, and seven Mocha seeds</h1>
          <p class="section-lead">Hoysala east, living shrines on the Tunga, and the coffee story the district still tells.</p>
          ${exploreHubNav("heritage", lang)}
        </div>
      </section>
      <section class="coffee-origin" id="coffee-origin" aria-labelledby="origin-title">
        <div class="wrap">
          <a class="story-entry-card tilt-card shine-card" href="coffee.html" data-tilt>
            <span class="media">
              <img src="${esc(f.origin.saint?.image || f.origin.image)}" alt="${esc(f.origin.saint?.caption || f.origin.title)}" width="1800" height="1200" />
            </span>
            <span class="story-entry-copy">
              <span class="kicker">${esc(f.origin.kicker)}</span>
              <h2 id="origin-title">${esc(f.origin.title)}</h2>
              <p>${esc(f.origin.lede)}</p>
              <span class="text-link t-learn">${learn("Read the full story")}</span>
            </span>
          </a>
        </div>
      </section>
      <section class="section why-section" style="padding-top:0">
        <div class="wrap">
          <div class="section-head">
            <p class="kicker">Why this district</p>
            <h2>Coffee and stone.</h2>
          </div>
          <div class="why-grid">${cultureWhy}</div>
        </div>
      </section>
      <section class="section" style="padding-top:0">
        <div class="wrap">
          <div class="section-head">
            <p class="kicker">Shrines and working country</p>
            <h2>Temples, forts, coffee hills.</h2>
          </div>
          <div id="place-sections">${renderPlaceSections(lang, f.d.destinations, heritageCats)}</div>
          <p><a class="text-link t-learn" href="places.html">${learn("All places")}</a></p>
        </div>
      </section>
      ${footer(f)}`;
  }

  function renderStayPage(lang) {
    const f = fragments(lang);
    const stayCats = ["hill-station"];
    return `
      <section class="page-hero">
        <div class="wrap">
          <p class="kicker">Explore · Stays</p>
          <h1>Hill air, not a room list</h1>
          <p class="section-lead">Kemmanagundi’s garden hills, visitor notes, and a private trip sketch stored in this browser. Homestays, hotels and payments are intentionally absent.</p>
          ${exploreHubNav("stay", lang)}
        </div>
      </section>
      <section class="section" style="padding-top:0">
        <div class="wrap">
          <div class="section-head">
            <p class="kicker">Hill station</p>
            <h2>Where the old garden still holds the night air.</h2>
            <p class="section-lead">A hill station is not a booking desk. Kemmanagundi is the Wodeyar summer ground this companion actually describes.</p>
          </div>
          <div id="place-sections">${renderPlaceSections(lang, f.d.destinations, stayCats)}</div>
        </div>
      </section>
      <section class="section circuits-home" style="padding-top:0">
        <div class="wrap">
          <div class="section-head-row">
            <div class="section-head">
              <p class="kicker">Trip sketches</p>
              <h2>Three ways through the hills.</h2>
              <p class="section-lead">Load a sketch into a private notebook — no account, no payment.</p>
            </div>
            <a class="text-link t-learn" href="plan.html">${learn("Open the planner")}</a>
          </div>
          <div class="home-circuit-grid">${f.homeCircuits}</div>
        </div>
      </section>
      <section class="section close-band" style="padding-top:0">
        <div class="wrap">
          <div class="section-head">
            <p class="kicker">Before you leave town</p>
            <h2>${esc(f.d.guide.title)}</h2>
            <p class="section-lead">${esc(f.d.guide.intro)}</p>
          </div>
          <div class="guide-grid">${f.guide}</div>
          <div class="close-actions">
            <a class="btn btn-dark shine t-learn" href="visit.html" data-magnetic>${learn("Visitor information")}</a>
            <a class="btn btn-line" href="plan.html">Sketch a private trip</a>
            <a class="btn btn-line" href="${esc(f.official.district_en)}" rel="noopener noreferrer">District tourism</a>
          </div>
        </div>
      </section>
      ${footer(f)}`;
  }

  function renderPage(page, lang) {
    const pages = {
      home: renderHome,
      places: renderPlacesPage,
      popular: renderPopularPage,
      map: renderMapPage,
      taluk: renderTalukPage,
      stories: renderStoriesPage,
      coffee: renderCoffeePage,
      food: renderFoodPage,
      nature: renderNaturePage,
      heritage: renderHeritagePage,
      stay: renderStayPage,
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
    const months = `
      <div class="t-tabs season-tabs" role="tablist" aria-label="Seasons" data-tabs>
        <span class="t-tabs-pill" aria-hidden="true"></span>
        ${global.CKM.seasons
          .map(
            (s, i) =>
              `<button type="button" class="t-tab season-month" role="tab" data-season-index="${i}" aria-selected="${
                i === index ? "true" : "false"
              }">${esc(s.months.split("–")[0].trim())}</button>`
          )
          .join("")}
      </div>`;
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
