(function () {
  const STORAGE_TRIP = "ckm-itinerary";
  const STORAGE_PASS = "ckm-explorer-passport";
  const STORAGE_LANG = "ckm-lang";
  const PAGE = document.body.getAttribute("data-page") || "home";

  const state = {
    lang: localStorage.getItem(STORAGE_LANG) || "en",
    filter: "all",
    taluk: "all",
    query: "",
    selectedTaluk: "",
    trip: loadTrip(),
    passport: loadPassport(),
    lastFocus: null,
    mapApi: null,
    queryApplied: false,
  };

  function loadTrip() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_TRIP) || "null");
      if (raw && Array.isArray(raw.days) && raw.days.length) return raw;
    } catch (err) {
      /* ignore */
    }
    return { days: [[], [], []] };
  }

  function loadPassport() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_PASS) || "[]");
      return Array.isArray(raw) ? raw : [];
    } catch (err) {
      return [];
    }
  }

  function saveTrip() {
    localStorage.setItem(STORAGE_TRIP, JSON.stringify(state.trip));
    syncTripCount();
  }

  function savePassport() {
    localStorage.setItem(STORAGE_PASS, JSON.stringify(state.passport));
    renderPassport();
  }

  function placeById(id) {
    return CKM.destinations.find((p) => p.id === id);
  }

  function toast(message) {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = message;
    el.classList.remove("is-open");
    void el.offsetWidth;
    el.classList.add("is-open");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => {
      el.classList.remove("is-open");
    }, 2400);
  }

  function t(key) {
    return CKMSections.t(state.lang, key);
  }

  function applyI18n() {
    document.documentElement.lang = state.lang === "kn" ? "kn" : "en";
    document.querySelectorAll("[data-i18n]").forEach((node) => {
      node.textContent = t(node.getAttribute("data-i18n"));
    });
    const toggle = document.querySelector("[data-lang-toggle]");
    if (toggle) toggle.textContent = t("lang");
  }

  function markNav() {
    document.querySelectorAll("[data-nav]").forEach((link) => {
      const nav = link.getAttribute("data-nav");
      const pageKey =
        PAGE === "coffee"
          ? "stories"
          : PAGE === "food" || PAGE === "nature" || PAGE === "stay" || PAGE === "heritage"
            ? "explore"
            : PAGE === "taluk"
              ? "map"
              : PAGE;
      const on = nav === pageKey;
      link.classList.toggle("is-active", on);
      if (on) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }

  function applyQuery() {
    if (state.queryApplied) return;
    state.queryApplied = true;
    const q = new URLSearchParams(location.search);
    if (PAGE === "places") {
      state.jumpTo = q.get("category") || "";
      state.taluk = q.get("taluk") || "all";
      state.query = q.get("q") || "";
      const id = q.get("id");
      if (id) window.setTimeout(() => openModal(id), 80);
    }
    if (PAGE === "popular") {
      const id = q.get("id");
      if (id) window.setTimeout(() => openModal(id), 80);
    }
    if (PAGE === "map") {
      state.selectedTaluk = "";
    }
    if (PAGE === "taluk") {
      state.selectedTaluk = q.get("id") || "";
    }
    if (PAGE === "plan") {
      const circuitId = q.get("circuit");
      const found = (CKM.circuits || []).find((c) => c.id === circuitId);
      if (found) loadCircuit(found, false);
    }
  }

  function matches(place) {
    if (state.filter !== "all" && place.category !== state.filter) return false;
    if (state.taluk !== "all" && place.talukId !== state.taluk && place.taluk !== state.taluk) return false;
    const q = state.query.trim().toLowerCase();
    if (!q) return true;
    const blob = [place.name, place.kannada, place.taluk, place.category, place.blurb, ...(place.tags || [])]
      .join(" ")
      .toLowerCase();
    return blob.includes(q);
  }

  function renderPlaces() {
    if (PAGE !== "places") return;
    const root = document.getElementById("place-sections");
    const empty = document.getElementById("place-empty");
    const count = document.getElementById("result-count");
    if (!root) return;
    const list = CKM.destinations.filter(matches);
    root.innerHTML = CKMSections.renderPlaceSections(state.lang, list);
    if (count) count.textContent = String(list.length);
    if (empty) empty.hidden = list.length > 0;
    renderTalukContext();
    initPlacesDrift(list);
  }

  function initPlacesDrift(list) {
    if (PAGE !== "places" || !window.CKMDriftWall) return;
    const el = document.querySelector("[data-drift-wall]");
    if (!el) return;
    if (el._ckmDrift) {
      el._ckmDrift.destroy();
      el._ckmDrift = null;
    }
    const items = (list || []).map((place) => ({
      placeId: place.id,
      image: place.image,
      title: state.lang === "kn" ? place.kannada : place.name,
      kannada: state.lang === "kn" ? place.name : place.kannada,
      blurb: place.blurb || place.summary || "",
    }));
    if (!items.length) return;
    const narrow = window.innerWidth < 720;
    el._ckmDrift = window.CKMDriftWall.mount(el, {
      items,
      columns: narrow ? 3 : 5,
      tileWidth: narrow ? 168 : 200,
      tileHeight: narrow ? 112 : 132,
      gap: 16,
      radius: 14,
      tilt: 14,
      turn: -12,
      perspective: 1200,
      depth: 120,
      speed: 38,
      direction: "up",
      variance: 0.45,
      parallax: 0.55,
      pauseOnHover: false,
      lift: 56,
      fade: 0.55,
      dim: 0.58,
      overlayColor: "#0c1f13",
      onOpenPlace(id) {
        openModal(id);
      },
    });
  }

  function renderTalukContext() {
    const title = document.getElementById("places-title");
    const kicker = document.getElementById("places-kicker");
    const lead = document.getElementById("places-lead");
    const bar = document.getElementById("places-taluk-bar");
    const mapLink = document.getElementById("places-map-link");
    if (!title) return;
    const taluk = (CKM.taluks || []).find((t) => t.id === state.taluk);
    if (!taluk || state.taluk === "all") {
      if (bar) bar.hidden = true;
      return;
    }
    const name = state.lang === "kn" ? taluk.kannada : taluk.listName || taluk.name;
    if (kicker) kicker.textContent = name;
    title.textContent = `Places in ${name}`;
    if (lead) lead.textContent = taluk.blurb || "";
    if (bar) bar.hidden = false;
    if (mapLink) mapLink.setAttribute("href", `taluk.html?id=${encodeURIComponent(taluk.id)}`);
  }

  function setDigits(group, str) {
    const prev = group.getAttribute("data-value");
    if (!group.classList.contains("t-digit-group")) {
      group.textContent = str;
      return;
    }
    group.classList.remove("is-animating");
    group.replaceChildren();
    const chars = String(str).split("");
    chars.forEach((ch, i) => {
      const span = document.createElement("span");
      span.className = "t-digit";
      span.textContent = ch;
      if (i === chars.length - 2) span.dataset.stagger = "1";
      else if (i === chars.length - 1) span.dataset.stagger = "2";
      group.appendChild(span);
    });
    group.setAttribute("data-value", str);
    void group.offsetHeight;
    if (prev != null && prev !== str && !prefersReduced()) group.classList.add("is-animating");
  }

  function syncTripCount() {
    const n = state.trip.days.reduce((sum, day) => sum + day.length, 0);
    const badge = document.querySelector(".header-trip .t-badge");
    if (badge) badge.setAttribute("data-open", "true");
    document.querySelectorAll("[data-trip-count]").forEach((el) => setDigits(el, String(n)));
  }

  function renderDays() {
    const board = document.getElementById("day-board");
    if (!board) return;
    board.innerHTML = state.trip.days
      .map((ids, index) => {
        const chips = ids
          .map((id) => {
            const place = placeById(id);
            if (!place) return "";
            return `
              <div class="trip-chip" draggable="true" data-chip-id="${place.id}" data-from-day="${index}">
                <img src="${place.image}" alt="" width="96" height="64" />
                <span>${CKMSections.esc(place.name)}</span>
                <button class="icon-btn" type="button" data-remove-chip="${place.id}" data-from-day="${index}" aria-label="${t("remove")} ${place.name}">×</button>
              </div>`;
          })
          .join("");
        return `
          <div class="day-col" data-day-index="${index}">
            <div class="day-head">
              <h3>Day ${index + 1}</h3>
              ${
                state.trip.days.length > 1
                  ? `<button class="icon-btn" type="button" data-remove-day="${index}" aria-label="Remove day ${index + 1}">×</button>`
                  : ""
              }
            </div>
            <div class="chip-list">${chips || `<p class="section-lead">${t("empty_day")}</p>`}</div>
          </div>`;
      })
      .join("");
    syncTripCount();
  }

  function renderPassport() {
    const grid = document.getElementById("stamp-grid");
    const count = document.getElementById("stamp-count");
    const bar = document.getElementById("stamp-bar");
    if (!grid) return;
    grid.innerHTML = CKM.destinations
      .map((p) => {
        const on = state.passport.includes(p.id);
        return `<div class="passport-stamp ${on ? "is-stamped" : ""}" title="${CKMSections.esc(p.name)}">
          <img src="${p.image}" alt="${CKMSections.esc(p.name)}" width="1800" height="1200" />
          <span>${CKMSections.esc(p.name)}</span>
        </div>`;
      })
      .join("");
    if (count) count.textContent = String(state.passport.length);
    if (bar) bar.style.width = `${Math.round((state.passport.length / CKM.destinations.length) * 100)}%`;
  }

  function addToDay(placeId, dayIndex) {
    if (!placeById(placeId)) return false;
    state.trip.days.forEach((day) => {
      const i = day.indexOf(placeId);
      if (i >= 0) day.splice(i, 1);
    });
    const idx = Math.max(0, Math.min(dayIndex, state.trip.days.length - 1));
    state.trip.days[idx].push(placeId);
    saveTrip();
    renderDays();
    return true;
  }

  function loadCircuit(found, announce) {
    state.trip.days = [[], [], []];
    found.places.forEach((id, i) => {
      const day = Math.min(Math.floor(i / 2), 2);
      if (!state.trip.days[day].includes(id)) state.trip.days[day].push(id);
    });
    saveTrip();
    renderDays();
    if (announce) toast("Trip sketch loaded");
  }

  function stamp(placeId) {
    if (!state.passport.includes(placeId)) {
      state.passport.push(placeId);
      savePassport();
      toast("Passport stamped");
    }
  }

  function openModal(placeId) {
    const place = placeById(placeId);
    const modal = document.getElementById("place-modal");
    const img = document.getElementById("modal-image");
    const body = document.getElementById("modal-body");
    if (!place || !modal || !img || !body) return;
    state.lastFocus = document.activeElement;
    img.src = place.image;
    img.alt = place.name;
    const sources = (place.sources || [])
      .map((s) => `<a href="${CKMSections.esc(s.url)}" rel="noopener noreferrer">${CKMSections.esc(s.label)}</a>`)
      .join("");
    const dayBtns = state.trip.days
      .map((_, i) => `<button class="btn btn-line" type="button" data-add-day="${i}" data-place="${place.id}">Day ${i + 1}</button>`)
      .join("");
    const extra = (CKM.popularPlaces || []).find((p) => p.id === place.id);
    const hoursBlock = extra
      ? `<div class="visitor-card">
           <h3 class="kicker">Published visitor hours</h3>
           <p><strong>${CKMSections.esc(extra.hours)}</strong></p>
           <p>${CKMSections.esc(extra.hoursDetail)}</p>
           ${
             extra.hoursSource
               ? `<p class="visitor-source"><a href="${CKMSections.esc(extra.hoursSource.url)}" rel="noopener noreferrer">${CKMSections.esc(extra.hoursSource.label)}</a></p>`
               : ""
           }
         </div>
         <h3 class="kicker" style="margin-top:1.1rem">Why travellers stop here</h3>
         <p>${CKMSections.esc(extra.why)}</p>`
      : "";
    const stamped = state.passport.includes(place.id);
    body.innerHTML = `
      <p class="kicker">${CKMSections.esc(CKMSections.catLabel(place.category, state.lang))} · ${CKMSections.esc(place.taluk)}${place.elevation ? " · " + CKMSections.esc(place.elevation) : ""}</p>
      <h2 id="modal-title">${CKMSections.esc(place.name)}</h2>
      <p class="kn">${CKMSections.esc(place.kannada)}</p>
      <p>${CKMSections.esc(place.summary)}</p>
      ${hoursBlock}
      <h3 class="kicker" style="margin-top:1.1rem">${t("visit_notes")}</h3>
      <p>${CKMSections.esc(place.visit)}</p>
      <p class="visitor-disclaimer">Public notes only — not a ticket, permit, fee table or live gate status. Confirm on the official page before you go.</p>
      <div class="modal-actions">
        <button class="btn btn-dark" type="button" data-stamp="${place.id}">${stamped ? t("stamped") : t("stamp")}</button>
        <a class="btn btn-line" href="taluk.html?id=${encodeURIComponent(place.talukId || "")}#place-${encodeURIComponent(place.id)}">${t("open_map")}</a>
      </div>
      <p class="kicker">${t("add")}</p>
      <div class="day-pick">${dayBtns}</div>
      <div class="source-list">${sources}</div>
    `;
    modal.hidden = false;
    modal.classList.add("is-open");
    const panel = modal.querySelector(".modal-panel");
    panel?.classList.remove("is-closing");
    requestAnimationFrame(() => panel?.classList.add("is-open"));
    document.body.style.overflow = "hidden";
    panel?.focus();
  }

  function closeModal() {
    const modal = document.getElementById("place-modal");
    if (!modal || modal.hidden) return;
    const panel = modal.querySelector(".modal-panel");
    panel?.classList.remove("is-open");
    panel?.classList.add("is-closing");
    modal.classList.remove("is-open");
    const closeMs = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--modal-close-dur")) || 150;
    window.setTimeout(() => {
      panel?.classList.remove("is-closing");
      modal.hidden = true;
      document.body.style.overflow = "";
      if (state.lastFocus && typeof state.lastFocus.focus === "function") state.lastFocus.focus();
    }, prefersReduced() ? 0 : closeMs);
  }

  function talukLabel(taluk) {
    if (!taluk) return "";
    if (state.lang === "kn") return taluk.kannada;
    return taluk.listName || taluk.name;
  }

  function updateTalukUi(id) {
    const taluk = CKMMap.talukById(id);
    if (!taluk) return;
    state.selectedTaluk = id;
    const places = CKMMap.placesInTaluk(id);
    const label = talukLabel(taluk);
    const summary = document.getElementById("taluk-summary");
    if (summary) {
      summary.textContent =
        places.length === 0
          ? `${label} — no places in this companion yet. Open the taluk page for the boundary.`
          : `${label} — ${places.length} place${places.length === 1 ? "" : "s"}. Click to open the taluk page.`;
    }
    document.querySelectorAll("[data-select-taluk]").forEach((btn) => {
      const on = btn.getAttribute("data-select-taluk") === id;
      btn.setAttribute("aria-current", on ? "true" : "false");
      btn.closest("li")?.classList.toggle("is-active", on);
    });
    const cta = document.querySelector("[data-map-cta]");
    if (cta) cta.setAttribute("href", `taluk.html?id=${encodeURIComponent(id)}`);
    const browse = document.getElementById("taluk-places-cta");
    if (browse && id) browse.setAttribute("href", `taluk.html?id=${encodeURIComponent(id)}`);
  }

  function initDistrictMap() {
    const root = document.querySelector("[data-map-root]");
    if (!root || !window.CKMMap) return;
    const focus = root.getAttribute("data-focus-taluk") || (PAGE === "taluk" ? state.selectedTaluk : "");
    state.mapApi = CKMMap.mount(root, {
      selected: focus || "",
      focus,
      onSelect: (id) => updateTalukUi(id),
      onActivate: (id) => {
        location.href = `taluk.html?id=${encodeURIComponent(id)}`;
      },
      onPlace: (id) => {
        const target = document.getElementById(`place-${id}`);
        if (target) {
          target.scrollIntoView({ behavior: prefersReduced() ? "auto" : "smooth", block: "start" });
          return;
        }
        openModal(id);
      },
    });
    if (focus) updateTalukUi(focus);
  }

  function downloadPack() {
    const days = state.trip.days
      .map((ids, i) => {
        const items = ids
          .map((id) => {
            const p = placeById(id);
            if (!p) return "";
            return `<li><strong>${p.name}</strong> (${p.kannada}) — ${p.blurb}<br><em>${p.visit}</em></li>`;
          })
          .join("");
        return `<h2>Day ${i + 1}</h2><ul>${items || "<li>Open day</li>"}</ul>`;
      })
      .join("");
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Chikkamagaluru trip pack</title>
      <style>body{font-family:Georgia,serif;max-width:40rem;margin:2rem auto;padding:0 1rem;line-height:1.5;color:#1a2319;background:#f3eee4}
      a{color:#6a4126}</style></head><body>
      <h1>Chikkamagaluru trip pack</h1>
      <p>Private notes from the Western Ghats companion. Not a ticket, permit or booking. Confirm access with official sources.</p>
      ${days}
      <h2>Official pages</h2>
      <ul>
        <li><a href="${CKM.official.district_en}">District tourism</a></li>
        <li><a href="${CKM.official.forest}">Karnataka Forest Department</a></li>
        <li><a href="${CKM.official.helpline}">District helpline</a></li>
      </ul>
      <p>Emergency in India: 112</p>
      </body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chikkamagaluru-trip-pack.html";
    a.click();
    URL.revokeObjectURL(url);
    toast("Trip pack downloaded");
  }

  function prefersReduced() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function movePill(bar, tab, animate) {
    const pill = bar?.querySelector(".t-tabs-pill");
    if (!pill || !tab) return;
    const apply = () => {
      pill.style.transform = `translateX(${tab.offsetLeft}px)`;
      pill.style.width = `${tab.offsetWidth}px`;
    };
    if (!animate || prefersReduced()) {
      const prev = pill.style.transition;
      pill.style.transition = "none";
      apply();
      void pill.offsetWidth;
      pill.style.transition = prev;
    } else {
      apply();
    }
  }

  function filterPopular() {
    const stack = document.getElementById("popular-stack");
    if (!stack) return;
    const q = (document.getElementById("popular-search")?.value || "").trim().toLowerCase();
    const group =
      document.querySelector("[data-popular-group][aria-selected='true']")?.getAttribute("data-popular-group") || "all";
    let n = 0;
    stack.querySelectorAll("[data-popular-card]").forEach((card) => {
      const g = card.getAttribute("data-popular-group");
      const name = (card.getAttribute("data-name") || "").toLowerCase();
      const show = (group === "all" || g === group) && (!q || name.includes(q));
      card.hidden = !show;
      card.classList.toggle("is-alt", show && n % 2 === 1);
      if (show) n += 1;
    });
    const empty = document.getElementById("popular-empty");
    if (empty) empty.hidden = n > 0;
    const count = document.querySelector("[data-popular-count]");
    if (count) count.textContent = `${n} popular place${n === 1 ? "" : "s"} in this slice`;
  }

  function selectTab(tab) {
    const bar = tab?.closest("[data-tabs]");
    if (!bar || !tab) return;
    bar.querySelectorAll(".t-tab").forEach((item) => {
      item.setAttribute("aria-selected", item === tab ? "true" : "false");
    });
    movePill(bar, tab, true);
  }

  function initTabs() {
    document.querySelectorAll("[data-tabs]").forEach((bar) => {
      const tabs = [...bar.querySelectorAll(".t-tab")];
      const active = tabs.find((tab) => tab.getAttribute("aria-selected") === "true") || tabs[0];
      requestAnimationFrame(() => movePill(bar, active, false));
    });
    if (!initTabs.bound) {
      initTabs.bound = true;
      window.addEventListener("resize", () => initTabs());
    }
  }

  function initMagnetic() {
    if (prefersReduced() || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    document.querySelectorAll("[data-magnetic]").forEach((btn) => {
      btn.addEventListener("pointermove", (event) => {
        const box = btn.getBoundingClientRect();
        const x = event.clientX - box.left - box.width / 2;
        const y = event.clientY - box.top - box.height / 2;
        btn.style.transform = `translate(${x * 0.22}px, ${y * 0.22}px)`;
      });
      btn.addEventListener("pointerleave", () => {
        btn.style.transform = "";
      });
    });
  }

  function initSpotlight() {
    if (prefersReduced() || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    document.querySelectorAll("[data-spotlight]").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const box = card.getBoundingClientRect();
        card.style.setProperty("--spot-x", `${((event.clientX - box.left) / box.width) * 100}%`);
        card.style.setProperty("--spot-y", `${((event.clientY - box.top) / box.height) * 100}%`);
      });
    });
  }

  function initMotion() {
    const reduce = prefersReduced();
    initInterestRail();
    initTabs();
    initMagnetic();
    initSpotlight();
    document.querySelectorAll(".reveal-on-scroll").forEach((el) => {
      if (reduce) {
        el.classList.add("is-in");
        return;
      }
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
      );
      io.observe(el);
    });

    document.querySelectorAll("[data-count]").forEach((el) => {
      const target = Number(el.getAttribute("data-count"));
      if (!Number.isFinite(target)) return;
      if (reduce) {
        el.textContent = String(target);
        return;
      }
      const start = performance.now();
      const dur = 880;
      const tick = (now) => {
        const t = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = String(Math.round(target * eased));
        if (t < 1) requestAnimationFrame(tick);
      };
      el.textContent = "0";
      requestAnimationFrame(tick);
    });

    if (reduce || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    document.querySelectorAll("[data-tilt]").forEach((card) => {
      let glare = card.querySelector(".tilt-glare");
      if (!glare) {
        glare = document.createElement("span");
        glare.className = "tilt-glare";
        glare.setAttribute("aria-hidden", "true");
        card.appendChild(glare);
      }
      card.addEventListener("pointermove", (event) => {
        const box = card.getBoundingClientRect();
        const x = (event.clientX - box.left) / box.width;
        const y = (event.clientY - box.top) / box.height;
        card.style.transform = `perspective(920px) rotateX(${(0.5 - y) * 7}deg) rotateY(${(x - 0.5) * 9}deg) translateY(-5px)`;
        glare.style.opacity = "1";
        glare.style.background = `radial-gradient(420px circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.32), transparent 56%)`;
      });
      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
        glare.style.opacity = "0";
      });
    });
  }

  let interestCleanup = null;

  function initInterestRail() {
    if (interestCleanup) {
      interestCleanup();
      interestCleanup = null;
    }
    const rail = document.querySelector("[data-interest-rail]");
    if (!rail) return;
    const track = rail.querySelector(".interest-track");
    const dotsRoot = document.querySelector("[data-interest-dots]");
    const cards = track ? [...track.querySelectorAll("[data-interest-card]")] : [];
    if (!cards.length) return;

    let index = 0;
    let timer = 0;
    let paused = false;
    const dwell = 3000;
    const reduce = prefersReduced();

    if (dotsRoot) {
      dotsRoot.innerHTML = cards
        .map(
          (card, i) =>
            `<button type="button" class="interest-dot" data-interest-dot="${i}" aria-label="${card.querySelector("strong")?.textContent || `Card ${i + 1}`}"></button>`
        )
        .join("");
    }

    function shown() {
      const n = Number.parseFloat(getComputedStyle(track).getPropertyValue("--interest-shown"));
      return Number.isFinite(n) && n > 0 ? n : 3;
    }

    function step() {
      const gap = Number.parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
      return cards[0].getBoundingClientRect().width + gap;
    }

    function mark() {
      cards.forEach((card, i) => {
        const on = i === index;
        card.classList.toggle("is-active", on);
        card.setAttribute("aria-current", on ? "true" : "false");
        const bar = card.querySelector(".interest-progress");
        if (bar) {
          bar.classList.remove("is-running");
          void bar.offsetWidth;
          if (on && !paused && !reduce) bar.classList.add("is-running");
        }
      });
      dotsRoot?.querySelectorAll("[data-interest-dot]").forEach((dot, i) => {
        const on = i === index;
        dot.classList.toggle("is-active", on);
        dot.setAttribute("aria-current", on ? "true" : "false");
      });
    }

    function go(n, instant) {
      const max = Math.max(0, cards.length - shown());
      if (n > max) index = 0;
      else if (n < 0) index = max;
      else index = n;
      const x = index * step();
      track.style.transition = instant || reduce ? "none" : "";
      track.style.transform = `translate3d(-${x}px, 0, 0)`;
      mark();
    }

    function stop() {
      window.clearTimeout(timer);
      timer = 0;
      cards.forEach((card) => card.querySelector(".interest-progress")?.classList.remove("is-running"));
    }

    function play() {
      stop();
      if (reduce || paused || document.hidden) {
        mark();
        return;
      }
      mark();
      timer = window.setTimeout(() => {
        go(index + 1);
        play();
      }, dwell);
    }

    function pause() {
      paused = true;
      stop();
      mark();
    }

    function resume() {
      paused = false;
      play();
    }

    const onPrev = (event) => {
      if (!event.target.closest("[data-interest-prev]")) return;
      event.preventDefault();
      go(index - 1);
      play();
    };
    const onNext = (event) => {
      if (!event.target.closest("[data-interest-next]")) return;
      event.preventDefault();
      go(index + 1);
      play();
    };
    const onDot = (event) => {
      const dot = event.target.closest("[data-interest-dot]");
      if (!dot) return;
      event.preventDefault();
      go(Number(dot.getAttribute("data-interest-dot")) || 0);
      play();
    };
    const onKey = (event) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        go(index + 1);
        play();
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        go(index - 1);
        play();
      }
    };

    const section = rail.closest(".interest-section") || document.getElementById("main");
    section.addEventListener("click", onPrev);
    section.addEventListener("click", onNext);
    dotsRoot?.addEventListener("click", onDot);
    rail.addEventListener("keydown", onKey);
    rail.addEventListener("mouseenter", pause);
    rail.addEventListener("mouseleave", resume);
    rail.addEventListener("focusin", pause);
    rail.addEventListener("focusout", (event) => {
      if (!rail.contains(event.relatedTarget)) resume();
    });
    const onVis = () => (document.hidden ? pause() : resume());
    document.addEventListener("visibilitychange", onVis);

    go(0, true);
    play();
    const onResize = () => go(index, true);
    window.addEventListener("resize", onResize);

    interestCleanup = () => {
      stop();
      section.removeEventListener("click", onPrev);
      section.removeEventListener("click", onNext);
      dotsRoot?.removeEventListener("click", onDot);
      rail.removeEventListener("keydown", onKey);
      rail.removeEventListener("mouseenter", pause);
      rail.removeEventListener("mouseleave", resume);
      rail.removeEventListener("focusin", pause);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", onResize);
    };
  }

  function bindUi() {
    if (bindUi.done) return;
    bindUi.done = true;
    const main = document.getElementById("main");

    main.addEventListener("click", (event) => {
      const explorePrev = event.target.closest("[data-explore-prev]");
      const exploreNext = event.target.closest("[data-explore-next]");
      if (explorePrev || exploreNext) {
        const rail = document.querySelector("[data-explore-rail]");
        if (rail) {
          const reduce = prefersReduced();
          const dir = exploreNext ? 1 : -1;
          rail.scrollBy({ left: dir * Math.min(rail.clientWidth * 0.86, 720), behavior: reduce ? "auto" : "smooth" });
        }
        return;
      }
      const popToggle = event.target.closest("[data-pop-toggle]");
      if (popToggle) {
        const card = popToggle.closest(".t-acc, .pop-card");
        const willOpen = card && card.getAttribute("data-open") !== "true";
        document.querySelectorAll(".pop-card.t-acc").forEach((openCard) => {
          if (openCard === card) return;
          openCard.setAttribute("data-open", "false");
          openCard.classList.remove("is-open");
          openCard.querySelector("[data-pop-toggle]")?.setAttribute("aria-expanded", "false");
        });
        if (card) {
          card.setAttribute("data-open", willOpen ? "true" : "false");
          card.classList.toggle("is-open", Boolean(willOpen));
          popToggle.setAttribute("aria-expanded", willOpen ? "true" : "false");
        }
        return;
      }
      const accHead = event.target.closest(".t-acc-head");
      if (accHead) {
        const acc = accHead.closest(".t-acc");
        if (acc) {
          const willOpen = acc.getAttribute("data-open") !== "true";
          acc.setAttribute("data-open", String(willOpen));
          accHead.setAttribute("aria-expanded", String(willOpen));
        }
        return;
      }
      const tab = event.target.closest(".t-tab");
      if (tab && tab.closest("[data-tabs]")) {
        selectTab(tab);
        filterPopular();
        return;
      }
      const open = event.target.closest("[data-open-place]");
      if (open) {
        openModal(open.getAttribute("data-open-place"));
        return;
      }
      const jump = event.target.closest("[data-jump-category]");
      if (jump) {
        const id = jump.getAttribute("data-jump-category");
        const section = document.getElementById(`section-${id}`);
        if (section) {
          event.preventDefault();
          section.scrollIntoView({ behavior: prefersReduced() ? "auto" : "smooth", block: "start" });
        }
        return;
      }
      const talukFilter = event.target.closest("[data-taluk]");
      if (talukFilter) {
        state.taluk = talukFilter.getAttribute("data-taluk");
        document.querySelectorAll("[data-taluk]").forEach((btn) => {
          btn.setAttribute("aria-pressed", btn === talukFilter ? "true" : "false");
        });
        renderPlaces();
        return;
      }
      const selectTaluk = event.target.closest("[data-select-taluk]");
      if (selectTaluk) {
        const id = selectTaluk.getAttribute("data-select-taluk");
        if (selectTaluk.tagName === "A") {
          if (state.mapApi) state.mapApi.choose(id, false);
          return;
        }
        event.preventDefault();
        if (state.mapApi) state.mapApi.choose(id, true);
        else location.href = `taluk.html?id=${encodeURIComponent(id)}`;
        return;
      }
      const seasonBtn = event.target.closest("[data-season-index]");
      if (seasonBtn) {
        CKMSections.renderSeason(Number(seasonBtn.getAttribute("data-season-index")), state.lang);
        initTabs();
        return;
      }
      const removeChip = event.target.closest("[data-remove-chip]");
      if (removeChip) {
        const day = Number(removeChip.getAttribute("data-from-day"));
        const id = removeChip.getAttribute("data-remove-chip");
        state.trip.days[day] = state.trip.days[day].filter((x) => x !== id);
        saveTrip();
        renderDays();
        return;
      }
      const removeDay = event.target.closest("[data-remove-day]");
      if (removeDay) {
        const i = Number(removeDay.getAttribute("data-remove-day"));
        if (state.trip.days.length > 1) {
          state.trip.days.splice(i, 1);
          saveTrip();
          renderDays();
        }
        return;
      }
      if (event.target.closest("#add-day")) {
        if (state.trip.days.length >= 8) return;
        state.trip.days.push([]);
        saveTrip();
        renderDays();
        return;
      }
      if (event.target.closest("#clear-trip")) {
        state.trip = { days: [[], [], []] };
        saveTrip();
        renderDays();
        return;
      }
      if (event.target.closest("#download-pack")) downloadPack();
    });

    main.addEventListener("mouseover", (event) => {
      const row = event.target.closest("[data-select-taluk]");
      if (row && state.mapApi) state.mapApi.hover(row.getAttribute("data-select-taluk"), true);
    });
    main.addEventListener("mouseout", (event) => {
      const row = event.target.closest("[data-select-taluk]");
      if (row && state.mapApi) state.mapApi.hover(row.getAttribute("data-select-taluk"), false);
    });

    main.addEventListener("input", (event) => {
      if (event.target.id === "place-search") {
        state.query = event.target.value;
        renderPlaces();
      }
      if (event.target.id === "popular-search") filterPopular();
      if (event.target.id === "season-slider") {
        CKMSections.renderSeason(Number(event.target.value), state.lang);
        initTabs();
      }
    });

    main.addEventListener("dragstart", (event) => {
      const chip = event.target.closest("[data-chip-id]");
      if (!chip || !event.dataTransfer) return;
      event.dataTransfer.setData(
        "text/plain",
        JSON.stringify({
          id: chip.getAttribute("data-chip-id"),
          from: Number(chip.getAttribute("data-from-day")),
        })
      );
      event.dataTransfer.effectAllowed = "move";
    });

    main.addEventListener("dragover", (event) => {
      const col = event.target.closest("[data-day-index]");
      if (!col) return;
      event.preventDefault();
      col.classList.add("dragover");
    });

    main.addEventListener("dragleave", (event) => {
      const col = event.target.closest("[data-day-index]");
      if (col) col.classList.remove("dragover");
    });

    main.addEventListener("drop", (event) => {
      const col = event.target.closest("[data-day-index]");
      if (!col) return;
      event.preventDefault();
      col.classList.remove("dragover");
      try {
        const payload = JSON.parse(event.dataTransfer.getData("text/plain"));
        addToDay(payload.id, Number(col.getAttribute("data-day-index")));
      } catch (err) {
        /* ignore */
      }
    });

    const modal = document.getElementById("place-modal");
    modal.addEventListener("click", (event) => {
      if (event.target.closest("[data-close-modal]")) {
        closeModal();
        return;
      }
      const stampBtn = event.target.closest("[data-stamp]");
      if (stampBtn) {
        stamp(stampBtn.getAttribute("data-stamp"));
        stampBtn.textContent = t("stamped");
        return;
      }
      const addDay = event.target.closest("[data-add-day]");
      if (addDay) {
        addToDay(addDay.getAttribute("data-place"), Number(addDay.getAttribute("data-add-day")));
        toast("Added to itinerary");
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeModal();
    });
  }

  function initHeader() {
    if (initHeader.done) return;
    initHeader.done = true;
    const toggle = document.querySelector(".nav-toggle");
    const header = document.querySelector(".site-header");
    toggle?.addEventListener("click", () => {
      const open = header.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    header.querySelectorAll(".site-nav a").forEach((a) => {
      a.addEventListener("click", () => {
        header.classList.remove("is-open");
        toggle?.setAttribute("aria-expanded", "false");
      });
    });
    document.querySelector("[data-lang-toggle]")?.addEventListener("click", () => {
      state.lang = state.lang === "en" ? "kn" : "en";
      localStorage.setItem(STORAGE_LANG, state.lang);
      paint();
    });
  }

  function registerWebMCP() {
    const ctx = document.modelContext || navigator.modelContext;
    if (!ctx || typeof ctx.registerTool !== "function") return;
    const envelope = (text) => ({ content: [{ type: "text", text }] });
    ctx.registerTool({
      name: "search_destinations",
      description: "Search Chikkamagaluru reference destinations by name, taluk, Kannada name or category.",
      inputSchema: {
        type: "object",
        properties: { query: { type: "string", description: "Search text" } },
        required: ["query"],
      },
      execute: async ({ query }) => {
        const q = String(query || "").toLowerCase();
        const hits = CKM.destinations.filter((p) =>
          [p.name, p.kannada, p.taluk, p.category, p.blurb].join(" ").toLowerCase().includes(q)
        );
        return envelope(JSON.stringify(hits.map((p) => ({ id: p.id, name: p.name, taluk: p.taluk, category: p.category })), null, 2));
      },
    });
    ctx.registerTool({
      name: "add_place_to_trip",
      description: "Add a destination to the visitor's local itinerary stored in this browser. Does not book anything.",
      inputSchema: {
        type: "object",
        properties: {
          placeId: { type: "string", description: "Destination id such as mullayanagiri" },
          day: { type: "integer", description: "1-based day number", default: 1 },
        },
        required: ["placeId"],
      },
      execute: async ({ placeId, day }) => {
        const ok = addToDay(placeId, (Number(day) || 1) - 1);
        return envelope(ok ? `Added ${placeId} to day ${day || 1}.` : `Unknown place ${placeId}.`);
      },
    });
  }

  function popularDepthItems() {
    return (CKM.popularPlaces || [])
      .filter((item) => item.featured)
      .slice(0, 8)
      .map((item) => {
        const place = (CKM.destinations || []).find((p) => p.id === item.id);
        if (!place) return null;
        return {
          id: place.id,
          image: place.image,
          alt: place.name,
          kicker: item.kicker,
          name: place.name,
          hours: item.hours,
          hoursDetail: item.hoursDetail,
          why: item.why,
          hoursSource: item.hoursSource,
        };
      })
      .filter(Boolean);
  }

  function renderPopDepthNote(item) {
    const note = document.querySelector("[data-pop-depth-note]");
    if (!note || !item) return;
    const src = item.hoursSource || {};
    note.innerHTML = `
      <p class="kicker">${CKMSections.esc(item.kicker || "")}</p>
      <h3>${CKMSections.esc(item.name || "")}</h3>
      <p><span class="pop-hours">${CKMSections.esc(item.hours || "")}</span></p>
      <p>${CKMSections.esc(item.hoursDetail || "")}</p>
      <p class="kicker" style="margin-top:0.9rem">Why people come</p>
      <p>${CKMSections.esc(item.why || "")}</p>
      <p class="pop-source">Hours and access change. Confirm on <a href="${CKMSections.esc(src.url || "#")}" rel="noopener noreferrer">${CKMSections.esc(src.label || "the official page")}</a> — this companion does not list fees.</p>
      <div class="pop-actions">
        <button class="btn btn-dark shine" type="button" data-open-place="${CKMSections.esc(item.id)}" data-magnetic>Open this place</button>
        <a class="btn btn-line t-learn" href="places.html?id=${CKMSections.esc(item.id)}">Go to places</a>
      </div>`;
  }

  function initPopularGallery() {
    const el = document.querySelector("[data-popular-carousel]");
    if (!el || !window.CKMCarousel) return;
    if (el._ckmCarousel && typeof el._ckmCarousel.destroy === "function") {
      el._ckmCarousel.destroy();
    }
    const items = popularDepthItems().map((item) => ({
      ...item,
      title: item.name,
      description: item.hours || "",
      link: `places.html?id=${item.id}`,
    }));
    if (!items.length) return;
    renderPopDepthNote(items[0]);
    el._ckmCarousel = window.CKMCarousel.mount(el, {
      items,
      baseWidth: 380,
      autoplay: true,
      autoplayDelay: 2800,
      pauseOnHover: true,
      loop: true,
      round: false,
      onChange(item) {
        renderPopDepthNote(item);
      },
    });
  }

  function paint() {
    const main = document.getElementById("main");
    main.innerHTML = CKMSections.renderPage(PAGE, state.lang);
    applyI18n();
    markNav();
    applyQuery();
    const search = document.getElementById("place-search");
    if (search) search.value = state.query;
    document.querySelectorAll("[data-taluk]").forEach((btn) => {
      const on = btn.getAttribute("data-taluk") === state.taluk;
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
    renderPlaces();
    renderDays();
    renderPassport();
    initDistrictMap();
    syncTripCount();
    bindUi();
    initMotion();
    initPopularGallery();
    filterPopular();
    if (PAGE === "taluk" && state.selectedTaluk) {
      const taluk = CKMMap.talukById(state.selectedTaluk);
      if (taluk) document.title = `${taluk.listName || taluk.name} — Chikkamagaluru`;
    }
    if (PAGE === "taluk" && location.hash.startsWith("#place-")) {
      window.setTimeout(() => {
        document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: prefersReduced() ? "auto" : "smooth", block: "start" });
      }, 80);
    }
    if (PAGE === "places" && state.jumpTo) {
      window.setTimeout(() => {
        document.getElementById(`section-${state.jumpTo}`)?.scrollIntoView({ behavior: prefersReduced() ? "auto" : "smooth", block: "start" });
      }, 60);
    }
  }

  function start() {
    if (!window.CKM || !window.CKMSections) return;
    initHeader();
    paint();
    registerWebMCP();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
