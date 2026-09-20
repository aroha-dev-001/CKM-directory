(function (global) {
  const GEOJSON = "assets/taluks.geojson";
  const VB = { w: 720, h: 780, pad: 18 };
  const LIME = "#ebfc72";
  const BONE = "#f4f3e8";
  const OBSIDIAN = "#13140e";
  const IRON = "#4a4c40";
  const HOVER = "#2a2d22";
  const FILLS = {
    chikkamagaluru: "#1c1e17",
    tarikere: "#191b14",
    kadur: "#1e2018",
    mudigere: "#171910",
    koppa: "#1a1c15",
    nrpura: "#1d1f18",
    sringeri: "#181a13",
    kalasa: "#161811",
    ajjampura: "#1c1e17",
  };
  const PIN = {
    waterfalls: "#8ec5d4",
    temples: "#f4f3e8",
    dams: "#7a9aa6",
    lakes: "#9bb8c4",
    "hill-station": "#c8d98a",
    peaks: "#ebfc72",
    wildlife: "#9cba7a",
    heritage: "#d4c4a0",
  };
  const LABEL_AT = {
    chikkamagaluru: [75.77, 13.36],
    tarikere: [75.79, 13.70],
    kadur: [76.13, 13.53],
    mudigere: [75.58, 13.07],
    koppa: [75.34, 13.455],
    nrpura: [75.52, 13.68],
    sringeri: [75.20, 13.37],
    kalasa: [75.30, 13.20],
    ajjampura: [76.07, 13.80],
  };
  const MAP_LABEL = {
    chikkamagaluru: "Chikmagalur",
    tarikere: "Tarikere",
    kadur: "Kadur",
    mudigere: "Mudigere",
    koppa: "Koppa",
    nrpura: "NR Pura",
    sringeri: "Sringeri",
    kalasa: "Kalasa",
    ajjampura: "Ajjampura",
  };
  const LABEL_SIZE = {
    chikkamagaluru: 15,
    tarikere: 13,
    kadur: 13,
    mudigere: 13,
    koppa: 11,
    nrpura: 11,
    sringeri: 11,
    kalasa: 11,
    ajjampura: 12,
  };

  let geoCache = null;
  const instances = new Set();

  function listOrder() {
    const preferred = [
      "chikkamagaluru",
      "tarikere",
      "kadur",
      "mudigere",
      "koppa",
      "nrpura",
      "sringeri",
      "kalasa",
      "ajjampura",
    ];
    const byId = Object.fromEntries((global.CKM.taluks || []).map((t) => [t.id, t]));
    return preferred.map((id) => byId[id]).filter(Boolean);
  }

  function loadGeo() {
    if (geoCache) return Promise.resolve(geoCache);
    return fetch(GEOJSON)
      .then((r) => {
        if (!r.ok) throw new Error("Could not load taluk map");
        return r.json();
      })
      .then((json) => {
        geoCache = json;
        return json;
      });
  }

  function walkCoords(feature, fn) {
    const rings = feature.geometry.type === "Polygon" ? feature.geometry.coordinates : feature.geometry.coordinates.flat();
    rings.forEach((ring) => ring.forEach(fn));
  }

  function boundsOf(fc) {
    let minLon = Infinity,
      minLat = Infinity,
      maxLon = -Infinity,
      maxLat = -Infinity;
    fc.features.forEach((f) => {
      walkCoords(f, ([lon, lat]) => {
        if (lon < minLon) minLon = lon;
        if (lat < minLat) minLat = lat;
        if (lon > maxLon) maxLon = lon;
        if (lat > maxLat) maxLat = lat;
      });
    });
    return { minLon, minLat, maxLon, maxLat };
  }

  function featureBounds(feature) {
    let minLon = Infinity,
      minLat = Infinity,
      maxLon = -Infinity,
      maxLat = -Infinity;
    walkCoords(feature, ([lon, lat]) => {
      if (lon < minLon) minLon = lon;
      if (lat < minLat) minLat = lat;
      if (lon > maxLon) maxLon = lon;
      if (lat > maxLat) maxLat = lat;
    });
    return { minLon, minLat, maxLon, maxLat };
  }

  function project(lon, lat, b) {
    const midLat = ((b.minLat + b.maxLat) / 2) * (Math.PI / 180);
    const xRatio = Math.cos(midLat);
    const usableW = VB.w - VB.pad * 2;
    const usableH = VB.h - VB.pad * 2;
    const dx = (b.maxLon - b.minLon) * xRatio;
    const dy = b.maxLat - b.minLat;
    const scale = Math.min(usableW / dx, usableH / dy);
    const ox = (VB.w - dx * scale) / 2;
    const oy = (VB.h - dy * scale) / 2;
    return [(lon - b.minLon) * xRatio * scale + ox, (b.maxLat - lat) * scale + oy];
  }

  function unproject(x, y, b) {
    const midLat = ((b.minLat + b.maxLat) / 2) * (Math.PI / 180);
    const xRatio = Math.cos(midLat);
    const usableW = VB.w - VB.pad * 2;
    const usableH = VB.h - VB.pad * 2;
    const dx = (b.maxLon - b.minLon) * xRatio;
    const dy = b.maxLat - b.minLat;
    const scale = Math.min(usableW / dx, usableH / dy);
    const ox = (VB.w - dx * scale) / 2;
    const oy = (VB.h - dy * scale) / 2;
    const lon = (x - ox) / (xRatio * scale) + b.minLon;
    const lat = b.maxLat - (y - oy) / scale;
    return [lon, lat];
  }

  function perpDist(p, a, b) {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len2 = dx * dx + dy * dy;
    if (!len2) return Math.hypot(p[0] - a[0], p[1] - a[1]);
    const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len2));
    return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
  }

  function simplifyRing(points, epsilon) {
    if (points.length < 8) return points;
    const closed = points[0][0] === points[points.length - 1][0] && points[0][1] === points[points.length - 1][1];
    const line = closed ? points.slice(0, -1) : points.slice();
    function rdp(pts) {
      if (pts.length < 3) return pts;
      const first = pts[0];
      const last = pts[pts.length - 1];
      let maxD = 0;
      let idx = 0;
      for (let i = 1; i < pts.length - 1; i += 1) {
        const d = perpDist(pts[i], first, last);
        if (d > maxD) {
          maxD = d;
          idx = i;
        }
      }
      if (maxD > epsilon) {
        const left = rdp(pts.slice(0, idx + 1));
        const right = rdp(pts.slice(idx));
        return left.slice(0, -1).concat(right);
      }
      return [first, last];
    }
    const simple = rdp(line);
    if (closed) simple.push(simple[0]);
    return simple;
  }

  function ringPath(ring, b) {
    return (
      simplifyRing(ring, 0.0035)
        .map((pt, i) => {
          const [x, y] = project(pt[0], pt[1], b);
          return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
        })
        .join(" ") + " Z"
    );
  }

  function featurePath(feature, b) {
    const rings = feature.geometry.type === "Polygon" ? feature.geometry.coordinates : feature.geometry.coordinates.flat();
    return rings.map((ring) => ringPath(ring, b)).join(" ");
  }

  function featureArea(feature) {
    const bb = feature.bbox;
    if (bb) return (bb[2] - bb[0]) * (bb[3] - bb[1]);
    return 0;
  }

  function splitLabel(text) {
    if (text === "NR Pura") return ["NR Pura"];
    if (text.length <= 10 || !text.includes(" ")) return [text];
    const parts = text.split(" ");
    if (parts.length === 2) return parts;
    return [parts.slice(0, -1).join(" "), parts[parts.length - 1]];
  }

  function fmtCoord(lat, lon) {
    const ns = lat >= 0 ? "N" : "S";
    const ew = lon >= 0 ? "E" : "W";
    return `${Math.abs(lat).toFixed(2)}°${ns}  ${Math.abs(lon).toFixed(2)}°${ew}`;
  }

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function viewBoxForFeature(feature, districtB) {
    const fb = featureBounds(feature);
    const [x0, y1] = project(fb.minLon, fb.minLat, districtB);
    const [x1, y0] = project(fb.maxLon, fb.maxLat, districtB);
    let x = Math.min(x0, x1);
    let y = Math.min(y0, y1);
    let w = Math.abs(x1 - x0);
    let h = Math.abs(y1 - y0);
    const pad = Math.max(w, h) * 0.2 + 18;
    x -= pad;
    y -= pad;
    w += pad * 2;
    h += pad * 2;
    const aspect = VB.w / VB.h;
    if (w / h > aspect) {
      const nh = w / aspect;
      y -= (nh - h) / 2;
      h = nh;
    } else {
      const nw = h * aspect;
      x -= (nw - w) / 2;
      w = nw;
    }
    return { x, y, w, h };
  }

  const DISTRICT_VB = { x: 0, y: 0, w: VB.w, h: VB.h };

  function vbString(vb) {
    return `${vb.x} ${vb.y} ${vb.w} ${vb.h}`;
  }

  function mount(root, options) {
    if (!root) return null;
    const opts = options || {};
    const state = {
      root,
      selected: opts.selected || "chikkamagaluru",
      drilled: !!opts.drill,
      placeId: opts.placeId || "",
      onSelect: opts.onSelect,
      onActivate: opts.onActivate,
      onPlace: opts.onPlace,
      onViewChange: opts.onViewChange,
      reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      districtB: null,
      features: [],
      svg: null,
      tooltip: null,
      hudCoords: null,
      hudZoom: null,
      vb: { ...DISTRICT_VB },
      anim: 0,
    };

    const api = {
      choose,
      setSelected,
      hover,
      showDistrict,
      highlightPlace,
      openPlace,
      get selected() {
        return state.selected;
      },
      get drilled() {
        return state.drilled;
      },
    };

    root.innerHTML = `<p class="map-loading">Acquiring district field…</p>`;

    loadGeo()
      .then((fc) => {
        const b = boundsOf(fc);
        state.districtB = b;
        state.features = fc.features.slice().sort((a, c) => featureArea(c) - featureArea(a));
        const paths = state.features
          .map((feature) => {
            const id = feature.properties.id;
            const name = MAP_LABEL[id] || feature.properties.name;
            const d = featurePath(feature, b);
            const fill = FILLS[id] || "#1c1e17";
            const [lx, ly] = project((LABEL_AT[id] || [0, 0])[0], (LABEL_AT[id] || [0, 0])[1], b);
            const size = LABEL_SIZE[id] || 11;
            const lines = splitLabel(name);
            const lineH = Math.round(size * 1.15);
            const tspans = lines
              .map((line, i) => `<tspan x="${lx.toFixed(1)}" dy="${i === 0 ? 0 : lineH}">${escapeXml(line)}</tspan>`)
              .join("");
            return `
              <g class="taluk-g" data-taluk-shape="${escapeXml(id)}">
                <path d="${d}" fill="${fill}" data-fill="${fill}" tabindex="0" role="button" aria-pressed="false" aria-label="${escapeXml(name)}" />
                <text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="middle" dominant-baseline="middle" font-size="${size}">${tspans}</text>
              </g>`;
          })
          .join("");

        root.innerHTML = `
          <div class="map-shell">
            <div class="map-hud">
              <span class="map-hud-tag" data-map-hud-band>CKM · FIELD</span>
              <span class="map-hud-tag" data-map-hud-coords>${fmtCoord(13.32, 75.77)}</span>
              <button class="map-hud-back" type="button" data-map-zoom-out hidden>All taluks</button>
            </div>
            <div class="map-canvas">
              <svg class="choropleth-svg" viewBox="0 0 ${VB.w} ${VB.h}" aria-label="Chikkamagaluru district taluks">
                ${paths}
                <g class="place-pins" data-place-pins></g>
              </svg>
              <div class="map-tooltip" data-map-tooltip hidden></div>
              <div class="map-scan" aria-hidden="true"></div>
            </div>
          </div>`;

        state.svg = root.querySelector(".choropleth-svg");
        state.tooltip = root.querySelector("[data-map-tooltip]");
        state.hudCoords = root.querySelector("[data-map-hud-coords]");
        state.hudZoom = root.querySelector("[data-map-zoom-out]");

        root.querySelectorAll("[data-taluk-shape]").forEach((g) => {
          const path = g.querySelector("path");
          const id = g.getAttribute("data-taluk-shape");
          path.addEventListener("click", () => choose(id, true));
          path.addEventListener("mouseenter", (event) => {
            hover(id, true);
            showTalukTip(id, event);
          });
          path.addEventListener("mouseleave", () => {
            hover(id, false);
            hideTip();
          });
          path.addEventListener("mousemove", (event) => showTalukTip(id, event));
          path.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              choose(id, true);
            }
            if (event.key === "Escape") {
              event.preventDefault();
              showDistrict();
            }
            if (event.key === "ArrowRight" || event.key === "ArrowDown") {
              event.preventDefault();
              nudgeTaluk(1);
            }
            if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
              event.preventDefault();
              nudgeTaluk(-1);
            }
          });
        });

        state.svg.addEventListener("mousemove", (event) => {
          const pt = svgPoint(event);
          if (!pt || !state.districtB) return;
          const [lon, lat] = unproject(pt.x, pt.y, state.districtB);
          if (state.hudCoords) state.hudCoords.textContent = fmtCoord(lat, lon);
        });

        bindZoomButtons();

        paint();
        if (state.drilled) applyView(true);
        else applyView(false);
        renderPins();
        instances.add(state);
        if (typeof state.onViewChange === "function") state.onViewChange(state);
        if (typeof opts.onReady === "function") opts.onReady(api);
      })
      .catch(() => {
        root.innerHTML = `<p class="map-error">The taluk map could not load. Check that <code>assets/taluks.geojson</code> is present.</p>`;
      });

    function svgPoint(event) {
      if (!state.svg) return null;
      const pt = state.svg.createSVGPoint();
      pt.x = event.clientX;
      pt.y = event.clientY;
      const ctm = state.svg.getScreenCTM();
      if (!ctm) return null;
      return pt.matrixTransform(ctm.inverse());
    }

    function featureById(id) {
      return state.features.find((f) => f.properties.id === id);
    }

    function paint() {
      root.querySelectorAll("[data-taluk-shape]").forEach((g) => {
        const id = g.getAttribute("data-taluk-shape");
        const on = id === state.selected;
        const path = g.querySelector("path");
        const text = g.querySelector("text");
        const idle = path.getAttribute("data-fill");
        path.setAttribute("fill", on ? LIME : idle);
        path.setAttribute("aria-pressed", on ? "true" : "false");
        g.classList.toggle("is-selected", on);
        g.classList.toggle("is-dim", state.drilled && !on);
        if (text) {
          text.setAttribute("fill", on ? OBSIDIAN : BONE);
          text.style.opacity = state.drilled && !on ? "0.35" : "1";
        }
      });
      const selectedG = root.querySelector(`[data-taluk-shape="${CSS.escape(state.selected)}"]`);
      if (selectedG && selectedG.parentNode) selectedG.parentNode.appendChild(selectedG);
      const pins = root.querySelector("[data-place-pins]");
      if (pins && pins.parentNode) pins.parentNode.appendChild(pins);
      syncZoomButtons();
      const band = root.querySelector("[data-map-hud-band]");
      if (band) {
        const taluk = talukById(state.selected);
        band.textContent = state.drilled
          ? `CKM · ${(MAP_LABEL[state.selected] || state.selected).toUpperCase()}`
          : "CKM · FIELD";
        if (taluk && state.hudCoords && !root.matches(":hover")) {
          const c = LABEL_AT[state.selected];
          if (c) state.hudCoords.textContent = fmtCoord(c[1], c[0]);
        }
      }
    }

    function animateViewBox(next) {
      const svg = state.svg;
      if (!svg) return;
      cancelAnimationFrame(state.anim);
      const from = { ...state.vb };
      const to = next;
      if (state.reduced) {
        state.vb = { ...to };
        svg.setAttribute("viewBox", vbString(state.vb));
        renderPins();
        return;
      }
      const start = performance.now();
      const dur = 420;
      function tick(now) {
        const t = Math.min(1, (now - start) / dur);
        const e = easeOut(t);
        state.vb = {
          x: from.x + (to.x - from.x) * e,
          y: from.y + (to.y - from.y) * e,
          w: from.w + (to.w - from.w) * e,
          h: from.h + (to.h - from.h) * e,
        };
        svg.setAttribute("viewBox", vbString(state.vb));
        if (t < 1) state.anim = requestAnimationFrame(tick);
        else renderPins();
      }
      state.anim = requestAnimationFrame(tick);
    }

    function applyView() {
      if (!state.svg || !state.districtB) return;
      let next = DISTRICT_VB;
      if (state.drilled) {
        const feat = featureById(state.selected);
        if (feat) next = viewBoxForFeature(feat, state.districtB);
      }
      animateViewBox(next);
    }

    function pinList() {
      const dests = global.CKM.destinations || [];
      const pop = popularIdSet();
      if (!state.drilled) {
        return dests.filter((p) => pop.has(p.id));
      }
      return dests.filter((p) => p.talukId === state.selected);
    }

    function pinScale() {
      const w = state.vb && state.vb.w ? state.vb.w : VB.w;
      return Math.max(state.drilled ? 0.38 : 1, w / VB.w);
    }

    function renderPins() {
      const layer = root.querySelector("[data-place-pins]");
      if (!layer || !state.districtB) return;
      const pop = popularIdSet();
      const places = pinList();
      const s = pinScale();
      layer.innerHTML = places
        .map((p) => {
          if (typeof p.lat !== "number" || typeof p.lng !== "number") return "";
          const [x, y] = project(p.lng, p.lat, state.districtB);
          const popular = pop.has(p.id);
          const fill = popular ? LIME : PIN[p.category] || BONE;
          const on = p.id === state.placeId;
          const r = (on ? 20 : popular ? 18 : 11) * s;
          const label = escapeXml(p.name);
          const labelSide = x > VB.w * 0.62 ? "end" : "start";
          const lx = labelSide === "end" ? x - 16 * s : x + 16 * s;
          const nameLabel =
            popular && !state.drilled
              ? `<text class="place-pin-label" text-anchor="${labelSide}" x="${lx.toFixed(1)}" y="${(y + 5).toFixed(1)}" font-size="${(15 * s).toFixed(1)}">${label}</text>`
              : "";
          const mark = r * 1.15;
          return `<g class="place-pin${on ? " is-active" : ""}${popular ? " is-popular" : ""}" data-place-pin="${escapeXml(p.id)}">
            <circle class="place-pin-hit" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(r * 1.85).toFixed(1)}" />
            <circle class="place-pin-halo" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(r + 8 * s).toFixed(1)}" />
            ${popular ? `<rect class="place-pin-mark" x="${(x - mark / 2).toFixed(1)}" y="${(y - mark / 2).toFixed(1)}" width="${mark.toFixed(1)}" height="${mark.toFixed(1)}" transform="rotate(45 ${x.toFixed(1)} ${y.toFixed(1)})" fill="${fill}" />` : ""}
            <circle class="place-pin-dot" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${popular ? (r * 0.38).toFixed(1) : r}" fill="${popular ? OBSIDIAN : fill}" tabindex="0" role="button" aria-label="${label}. Open visitor notes." />
            ${nameLabel}
          </g>`;
        })
        .join("");
      layer.querySelectorAll("[data-place-pin]").forEach((g) => {
        const id = g.getAttribute("data-place-pin");
        const dot = g.querySelector(".place-pin-dot");
        const open = () => openPlace(id);
        g.addEventListener("click", (event) => {
          event.stopPropagation();
          event.preventDefault();
          open();
        });
        g.addEventListener("pointerdown", (event) => event.stopPropagation());
        g.addEventListener("mouseenter", (event) => showPlaceTip(id, event));
        g.addEventListener("mouseleave", hideTip);
        g.addEventListener("mousemove", (event) => showPlaceTip(id, event));
        dot.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            open();
          }
        });
      });
    }

    function openPlace(id) {
      const place = (global.CKM.destinations || []).find((p) => p.id === id);
      if (!place) return;
      state.placeId = id;
      if (place.talukId) state.selected = place.talukId;
      paint();
      renderPins();
      hideTip();
      if (typeof state.onSelect === "function") state.onSelect(state.selected);
      if (typeof state.onPlace === "function") state.onPlace(id);
    }

    function placeTip(event) {
      if (!state.tooltip) return;
      const canvas = root.querySelector(".map-canvas");
      if (!canvas) return;
      const box = canvas.getBoundingClientRect();
      let left = event.clientX - box.left + 14;
      let top = event.clientY - box.top + 14;
      state.tooltip.hidden = false;
      const tw = state.tooltip.offsetWidth;
      const th = state.tooltip.offsetHeight;
      if (left + tw > box.width - 8) left = event.clientX - box.left - tw - 12;
      if (top + th > box.height - 8) top = event.clientY - box.top - th - 12;
      state.tooltip.style.left = `${Math.max(8, left)}px`;
      state.tooltip.style.top = `${Math.max(8, top)}px`;
    }

    function showTalukTip(id, event) {
      const taluk = talukById(id);
      if (!taluk || !state.tooltip) return;
      const count = placesInTaluk(id).length;
      const c = LABEL_AT[id] || [0, 0];
      const kn = taluk.kannada || "";
      state.tooltip.innerHTML = `
        <p class="map-tip-kicker">${escapeXml(fmtCoord(c[1], c[0]))}</p>
        <p class="map-tip-name">${escapeXml(MAP_LABEL[id] || taluk.name)}</p>
        <p class="map-tip-kn">${escapeXml(kn)}</p>
        <p class="map-tip-meta">${count} place${count === 1 ? "" : "s"} in this companion</p>
        <p class="map-tip-blurb">${escapeXml(taluk.blurb || "")}</p>`;
      placeTip(event);
    }

    function showPlaceTip(id, event) {
      const p = (global.CKM.destinations || []).find((d) => d.id === id);
      if (!p || !state.tooltip) return;
      const cat = (global.CKM.categories || []).find((c) => c.id === p.category);
      const extra = (global.CKM.popularPlaces || []).find((x) => x.id === p.id);
      state.tooltip.innerHTML = `
        <p class="map-tip-kicker">${escapeXml(extra ? "Popular · click for notes" : (cat && cat.label) || p.category)}</p>
        <p class="map-tip-name">${escapeXml(p.name)}</p>
        <p class="map-tip-kn">${escapeXml(p.kannada || "")}</p>
        ${extra ? `<p class="map-tip-meta">${escapeXml(extra.hours)}</p>` : ""}
        <p class="map-tip-blurb">${escapeXml(p.blurb || "")}</p>`;
      placeTip(event);
    }

    function hideTip() {
      if (state.tooltip) state.tooltip.hidden = true;
    }

    function choose(id, activate) {
      if (!id) return;
      const same = id === state.selected && state.drilled;
      state.selected = id;
      state.drilled = true;
      if (!same) state.placeId = opts.placeId && id === opts.selected ? opts.placeId : "";
      paint();
      applyView();
      renderPins();
      if (typeof state.onSelect === "function") state.onSelect(id);
      if (activate && typeof state.onActivate === "function") state.onActivate(id);
      if (typeof state.onViewChange === "function") state.onViewChange(state);
    }

    function setSelected(id) {
      if (!id) return;
      state.selected = id;
      paint();
      if (state.drilled) {
        applyView();
        renderPins();
      }
    }

    function showDistrict() {
      state.drilled = false;
      state.placeId = "";
      paint();
      applyView();
      renderPins();
      hideTip();
      if (typeof state.onViewChange === "function") state.onViewChange(state);
    }

    function hover(id, on) {
      const g = root.querySelector(`[data-taluk-shape="${CSS.escape(id)}"]`);
      if (!g || id === state.selected) return;
      const path = g.querySelector("path");
      path.setAttribute("fill", on ? HOVER : path.getAttribute("data-fill"));
    }

    function nudgeTaluk(dir) {
      const order = listOrder().map((t) => t.id);
      const i = Math.max(0, order.indexOf(state.selected));
      const next = order[(i + dir + order.length) % order.length];
      choose(next, false);
      const path = root.querySelector(`[data-taluk-shape="${CSS.escape(next)}"] path`);
      path?.focus();
    }

    function highlightPlace(id) {
      const place = (global.CKM.destinations || []).find((p) => p.id === id);
      if (!place) return;
      if (place.talukId) state.selected = place.talukId;
      state.placeId = id;
      state.drilled = true;
      paint();
      applyView();
      renderPins();
      if (typeof state.onSelect === "function") state.onSelect(state.selected);
    }

    return api;
  }

  function escapeXml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function placesInTaluk(id) {
    return (global.CKM.destinations || []).filter((p) => p.talukId === id);
  }

  function talukById(id) {
    return (global.CKM.taluks || []).find((t) => t.id === id);
  }

  function popularIdSet() {
    return new Set((global.CKM.popularPlaces || []).map((p) => p.id));
  }

  global.CKMMap = {
    mount,
    listOrder,
    placesInTaluk,
    talukById,
    MAP_LABEL,
    loadGeo,
  };
})(window);
