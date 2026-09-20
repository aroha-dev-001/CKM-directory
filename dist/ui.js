(function (global) {
  const esc = (value) =>
    String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  function countLabel(n, word) {
    if (!n) return "";
    return `${n} ${word}${n === 1 ? "" : "s"}`;
  }

  function formatDuration(min) {
    if (!min) return "";
    if (min < 60) return `${min} min`;
    const h = Math.round(min / 60);
    return `${h} h typical stop`;
  }

  function SectionIntro({ kicker, title, lead, href, linkLabel }) {
    return `
      <div class="section-intro">
        <p class="kicker">${esc(kicker)}</p>
        <h2>${esc(title)}</h2>
        ${lead ? `<p class="section-lead">${esc(lead)}</p>` : ""}
        ${href ? `<a class="text-link t-learn" href="${esc(href)}">${esc(linkLabel || "Open")}</a>` : ""}
      </div>`;
  }

  function SourceStatus({ label, url, reviewedAt, status }) {
    if (!label && !url) return "";
    return `
      <p class="source-status">
        ${status ? `<span class="source-status-flag">${esc(status)}</span>` : ""}
        ${
          url
            ? `<a href="${esc(url)}" rel="noopener noreferrer">${esc(label || "Source")}</a>`
            : `<span>${esc(label || "")}</span>`
        }
        ${reviewedAt ? `<time datetime="${esc(reviewedAt)}">Reviewed ${esc(reviewedAt)}</time>` : ""}
      </p>`;
  }

  function AddToTripButton(placeId, label) {
    if (!placeId) return "";
    return `<button class="btn btn-line add-trip-btn" type="button" data-add-day="0" data-place="${esc(placeId)}">${esc(
      label || "Add to trip"
    )}</button>`;
  }

  function InterestCard(item) {
    const count = countLabel(item.count, "place");
    return `
      <a class="interest-card-ed" href="${esc(item.href)}">
        <span class="interest-card-ed-media">
          <img src="${esc(item.image)}" alt="" width="1200" height="800" loading="lazy" />
        </span>
        <span class="interest-card-ed-copy">
          <strong>${esc(item.label)}</strong>
          ${item.kn ? `<span class="kn">${esc(item.kn)}</span>` : ""}
          <span class="interest-card-ed-lead">${esc(item.lead)}</span>
          ${count ? `<span class="meta-count">${esc(count)}</span>` : ""}
        </span>
      </a>`;
  }

  function DestinationCard(place, opts) {
    const o = opts || {};
    const size = o.size || "compact";
    if (!place) return "";
    return `
      <article class="dest-card dest-card--${esc(size)}">
        <a class="dest-card-media" href="places.html?id=${esc(place.id)}">
          <img src="${esc(place.image)}" alt="${esc(place.name)}" width="1800" height="1200" ${
            o.priority ? `fetchpriority="high"` : `loading="lazy"`
          } />
        </a>
        <div class="dest-card-body">
          <p class="kicker">${esc(place.categoryLabel || place.category)} · ${esc(place.taluk)}</p>
          <h3><a href="places.html?id=${esc(place.id)}">${esc(place.name)}</a></h3>
          <p>${esc(place.blurb || place.summary || "")}</p>
          <p class="dest-meta">
            ${place.duration ? `<span>${esc(place.duration)}</span>` : ""}
            ${place.difficulty ? `<span>${esc(place.difficulty)}</span>` : ""}
            ${place.bestTime ? `<span>${esc(place.bestTime)}</span>` : ""}
          </p>
          ${AddToTripButton(place.id)}
        </div>
      </article>`;
  }

  function ItineraryCard(circuit, extras) {
    const x = extras || {};
    const stops = (x.stops || []).filter(Boolean);
    const route = stops.map((s) => esc(s.name)).join(" → ");
    return `
      <article class="itinerary-card">
        <div class="itinerary-card-media">
          <img src="${esc(circuit.image)}" alt="" width="1800" height="1200" loading="lazy" />
        </div>
        <div class="itinerary-card-body">
          <p class="kicker">${esc(circuit.kicker || "")}</p>
          <h3>${esc(circuit.title)}</h3>
          <p>${esc(circuit.text)}</p>
          ${route ? `<p class="route-line">${route}</p>` : ""}
          ${x.drive ? `<p class="dest-meta">${esc(x.drive)}</p>` : ""}
          ${x.caveat ? `<p class="itinerary-caveat">${esc(x.caveat)}</p>` : ""}
          <a class="btn btn-dark" href="plan.html?circuit=${esc(circuit.id)}">Use this trip</a>
        </div>
      </article>`;
  }

  function SeasonPanel(season, index, source) {
    return `
      <article class="season-panel" id="season-panel-${esc(season.id)}">
        <p class="kicker">${esc(season.months)}</p>
        <h3>${esc(season.title)}</h3>
        <p>${esc(season.text)}</p>
        <p class="season-suit"><strong>Suits</strong> ${esc((season.experiences || []).join(" · "))}</p>
        <p class="season-watch">${esc(season.watch)}</p>
        ${SourceStatus({
          label: source.label,
          url: source.url,
          reviewedAt: source.reviewedAt,
          status: "Seasonal guidance — not live weather",
        })}
      </article>`;
  }

  function HeroMedia(slide, index) {
    const poster = esc(slide.poster);
    const label = esc(slide.label);
    const video = slide.videoWebm || slide.videoMp4;
    if (!video) {
      return `
        <figure class="hero-slide-media" data-hero-slide="${index}" ${index === 0 ? "" : "hidden"}>
          <img src="${poster}" alt="${label}" width="2400" height="1350" ${
            index === 0 ? `fetchpriority="high"` : `loading="lazy"`
          } />
        </figure>`;
    }
    return `
      <figure class="hero-slide-media" data-hero-slide="${index}" ${index === 0 ? "" : "hidden"}>
        <video
          data-hero-video
          poster="${poster}"
          muted
          playsinline
          loop
          preload="${index === 0 ? "metadata" : "none"}"
          aria-label="${label}"
        >
          ${slide.videoWebm ? `<source src="${esc(slide.videoWebm)}" type="video/webm" />` : ""}
          ${slide.videoMp4 ? `<source src="${esc(slide.videoMp4)}" type="video/mp4" />` : ""}
        </video>
        <img class="hero-poster-fallback" src="${poster}" alt="${label}" width="2400" height="1350" />
      </figure>`;
  }

  function HeroSlider(slides) {
    const media = slides.map((s, i) => HeroMedia(s, i)).join("");
    const dots = slides
      .map(
        (s, i) =>
          `<button type="button" class="hero-dot" data-hero-to="${i}" aria-label="${esc(s.title)}" aria-current="${
            i === 0 ? "true" : "false"
          }"></button>`
      )
      .join("");
    return `
      <div class="hero-slider" data-hero-slider>
        ${media}
        <div class="hero-progress" role="tablist" aria-label="Hero scenes">${dots}</div>
        <button class="hero-pause" type="button" data-hero-pause aria-pressed="false">Pause</button>
      </div>`;
  }

  function ResponsibleTravelBand(items, href) {
    const lis = items.map((t) => `<li>${esc(t)}</li>`).join("");
    return `
      <section class="responsible-band" aria-labelledby="responsible-title">
        <div class="wrap">
          <p class="kicker">Travel with care</p>
          <h2 id="responsible-title">These hills are not a backdrop.</h2>
          <ul class="responsible-list">${lis}</ul>
          <a class="text-link t-learn" href="${esc(href)}">Visitor information</a>
        </div>
      </section>`;
  }

  function ClosingPlannerCTA() {
    return `
      <section class="closing-cta">
        <div class="wrap">
          <h2>Give the hills more than a checklist.</h2>
          <p class="section-lead">Build a realistic journey around distance, daylight, season and the places you care about.</p>
          <div class="hero-actions">
            <a class="btn btn-dark shine" href="plan.html">Start planning</a>
            <a class="btn btn-line" href="places.html">Browse all places</a>
          </div>
        </div>
      </section>`;
  }

  global.CKMUI = {
    esc,
    countLabel,
    formatDuration,
    SectionIntro,
    SourceStatus,
    AddToTripButton,
    InterestCard,
    DestinationCard,
    ItineraryCard,
    SeasonPanel,
    HeroMedia,
    HeroSlider,
    ResponsibleTravelBand,
    ClosingPlannerCTA,
  };
})(window);
