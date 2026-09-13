(function () {
  const STORAGE_TRIP = "ckm-itinerary";
  const STORAGE_PASS = "ckm-explorer-passport";
  const STORAGE_LANG = "ckm-lang";

  const state = {
    lang: localStorage.getItem(STORAGE_LANG) || "en",
    filter: "all",
    taluk: "all",
    query: "",
    trip: loadTrip(),
    passport: loadPassport(),
    map: null,
    markers: {},
    lastFocus: null,
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
    el.hidden = false;
    el.textContent = message;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => {
      el.hidden = true;
    }, 2200);
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

  function matches(place) {
    if (state.filter !== "all" && place.category !== state.filter) return false;
    if (state.taluk !== "all" && place.taluk !== state.taluk) return false;
    const q = state.query.trim().toLowerCase();
    if (!q) return true;
    const blob = [place.name, place.kannada, place.taluk, place.category, place.blurb, ...(place.tags || [])]
      .join(" ")
      .toLowerCase();
    return blob.includes(q);
  }

  function renderPlaces() {
    const grid = document.getElementById("place-grid");
    const empty = document.getElementById("place-empty");
    const count = document.getElementById("result-count");
    if (!grid) return;
    const list = CKM.destinations.filter(matches);
    grid.innerHTML = list.map((p) => CKMSections.placeCard(p, state.lang)).join("");
    if (count) count.textContent = String(list.length);
    if (empty) empty.hidden = list.length > 0;
  }

  function syncTripCount() {
    const n = state.trip.days.reduce((sum, day) => sum + day.length, 0);
    document.querySelectorAll("[data-trip-count]").forEach((el) => {
      el.textContent = String(n);
    });
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
    const stamped = state.passport.includes(place.id);
    body.innerHTML = `
      <p class="kicker">${CKMSections.esc(CKMSections.catLabel(place.category, state.lang))} · ${CKMSections.esc(place.taluk)}${place.elevation ? " · " + CKMSections.esc(place.elevation) : ""}</p>
      <h2 id="modal-title">${CKMSections.esc(place.name)}</h2>
      <p class="kn">${CKMSections.esc(place.kannada)}</p>
      <p>${CKMSections.esc(place.summary)}</p>
      <h3 class="kicker" style="margin-top:1.1rem">${t("visit_notes")}</h3>
      <p>${CKMSections.esc(place.visit)}</p>
      <div class="modal-actions">
        <button class="btn btn-dark" type="button" data-stamp="${place.id}">${stamped ? t("stamped") : t("stamp")}</button>
        <button class="btn btn-line" type="button" data-focus-map="${place.id}">${t("open_map")}</button>
      </div>
      <p class="kicker">${t("add")}</p>
      <div class="day-pick">${dayBtns}</div>
      <div class="source-list">${sources}</div>
    `;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    modal.querySelector(".modal-panel").focus();
    if (state.markers[place.id] && state.map) {
      state.markers[place.id].openPopup();
    }
  }

  function closeModal() {
    const modal = document.getElementById("place-modal");
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = "";
    if (state.lastFocus && typeof state.lastFocus.focus === "function") state.lastFocus.focus();
  }

  function initMap() {
    const el = document.getElementById("district-map");
    if (!el || typeof L === "undefined") return;
    if (state.map) {
      state.map.remove();
      state.map = null;
      state.markers = {};
    }
    const map = L.map(el, {
      scrollWheelZoom: false,
      attributionControl: true,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 16,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    const bounds = [];
    CKM.destinations.forEach((place) => {
      const color = CKMSections.CATEGORY_COLOR[place.category] || "#c4a36a";
      const icon = L.divIcon({
        className: "pin",
        html: `<span class="pin-dot" style="background:${color}"></span>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      const marker = L.marker([place.lat, place.lng], { icon, title: place.name }).addTo(map);
      marker.bindPopup(
        `<strong>${CKMSections.esc(place.name)}</strong><br>${CKMSections.esc(place.blurb)}<br><button type="button" class="btn btn-dark" data-open-place="${place.id}" style="margin-top:.6rem">${CKMSections.esc(place.name)}</button>`
      );
      marker.on("click", () => marker.openPopup());
      state.markers[place.id] = marker;
      bounds.push([place.lat, place.lng]);
    });
    if (bounds.length) map.fitBounds(bounds, { padding: [28, 28] });
    map.on("popupopen", (e) => {
      const btn = e.popup.getElement() && e.popup.getElement().querySelector("[data-open-place]");
      if (btn) {
        btn.addEventListener("click", () => openModal(btn.getAttribute("data-open-place")));
      }
    });
    state.map = map;
    setTimeout(() => map.invalidateSize(), 80);
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

  function bindUi() {
    if (bindUi.done) return;
    bindUi.done = true;
    const root = document.getElementById("app-root");

    root.addEventListener("click", (event) => {
      const open = event.target.closest("[data-open-place]");
      if (open) {
        openModal(open.getAttribute("data-open-place"));
        return;
      }
      const filter = event.target.closest("[data-filter]");
      if (filter) {
        state.filter = filter.getAttribute("data-filter");
        document.querySelectorAll("[data-filter]").forEach((btn) => {
          btn.setAttribute("aria-pressed", btn.getAttribute("data-filter") === state.filter ? "true" : "false");
        });
        renderPlaces();
        if (filter.classList.contains("interest-tile")) {
          document.getElementById("places")?.scrollIntoView({ behavior: prefersReduced() ? "auto" : "smooth" });
        }
        return;
      }
      const taluk = event.target.closest("[data-taluk]");
      if (taluk) {
        state.taluk = taluk.getAttribute("data-taluk");
        document.querySelectorAll("[data-taluk]").forEach((btn) => {
          btn.setAttribute("aria-pressed", btn === taluk ? "true" : "false");
        });
        renderPlaces();
        document.getElementById("places")?.scrollIntoView({ behavior: prefersReduced() ? "auto" : "smooth" });
        return;
      }
      const circuit = event.target.closest("[data-load-circuit]");
      if (circuit) {
        const found = (CKM.circuits || []).find((c) => c.id === circuit.getAttribute("data-load-circuit"));
        if (found) {
          state.trip.days = [[], [], []];
          found.places.forEach((id, i) => {
            const day = Math.min(Math.floor(i / 2), 2);
            if (!state.trip.days[day].includes(id)) state.trip.days[day].push(id);
          });
          saveTrip();
          renderDays();
          document.getElementById("plan")?.scrollIntoView({ behavior: prefersReduced() ? "auto" : "smooth" });
          toast("Trip sketch loaded");
        }
        return;
      }
      const seasonBtn = event.target.closest("[data-season-index]");
      if (seasonBtn) {
        const idx = Number(seasonBtn.getAttribute("data-season-index"));
        CKMSections.renderSeason(idx, state.lang);
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

    root.addEventListener("input", (event) => {
      if (event.target.id === "place-search") {
        state.query = event.target.value;
        renderPlaces();
      }
      if (event.target.id === "season-slider") {
        CKMSections.renderSeason(Number(event.target.value), state.lang);
      }
    });

    root.addEventListener("dragstart", (event) => {
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

    root.addEventListener("dragover", (event) => {
      const col = event.target.closest("[data-day-index]");
      if (!col) return;
      event.preventDefault();
      col.classList.add("dragover");
    });

    root.addEventListener("dragleave", (event) => {
      const col = event.target.closest("[data-day-index]");
      if (col) col.classList.remove("dragover");
    });

    root.addEventListener("drop", (event) => {
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
        return;
      }
      const mapBtn = event.target.closest("[data-focus-map]");
      if (mapBtn) {
        const id = mapBtn.getAttribute("data-focus-map");
        closeModal();
        document.getElementById("map")?.scrollIntoView({ behavior: prefersReduced() ? "auto" : "smooth" });
        const marker = state.markers[id];
        if (marker && state.map) {
          state.map.setView(marker.getLatLng(), 12);
          marker.openPopup();
        }
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeModal();
    });
  }

  function prefersReduced() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function initHeader() {
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

  function paint() {
    const root = document.getElementById("app-root");
    root.innerHTML = CKMSections.render(state.lang);
    applyI18n();
    const search = document.getElementById("place-search");
    if (search) search.value = state.query;
    document.querySelectorAll("[data-filter]").forEach((btn) => {
      btn.setAttribute("aria-pressed", btn.getAttribute("data-filter") === state.filter ? "true" : "false");
    });
    document.querySelectorAll("[data-taluk]").forEach((btn) => {
      btn.setAttribute("aria-pressed", btn.getAttribute("data-taluk") === state.taluk ? "true" : "false");
    });
    renderPlaces();
    renderDays();
    renderPassport();
    initMap();
    bindUi();
  }

  function start() {
    if (!window.CKM || !window.CKMSections) return;
    applyI18n();
    initHeader();
    paint();
    registerWebMCP();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
