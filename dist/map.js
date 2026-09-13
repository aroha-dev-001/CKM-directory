(function (global) {
  const GEOJSON = "assets/taluks.geojson";
  const VB = { w: 640, h: 720, pad: 28 };
  const SELECTED = "#2f5c3c";
  const HOVER = "#8eaa86";
  const LABEL_IDLE = "#3d5344";
  const LABEL_ON = "#f7f4ec";
  const FILLS = {
    chikkamagaluru: "#d5e1cc",
    tarikere: "#e4ece0",
    kadur: "#dce6d4",
    mudigere: "#b7cbb2",
    koppa: "#d2deca",
    nrpura: "#e8efe4",
    sringeri: "#c9d8c4",
    kalasa: "#c3d4be",
    ajjampura: "#dce6d4",
  };
  const LABEL_AT = {
    chikkamagaluru: [75.78, 13.36],
    tarikere: [75.78, 13.705],
    kadur: [76.14, 13.53],
    mudigere: [75.59, 13.06],
    koppa: [75.29, 13.47],
    nrpura: [75.5, 13.69],
    sringeri: [75.175, 13.385],
    kalasa: [75.275, 13.185],
    ajjampura: [76.1, 13.81],
  };
  const MAP_LABEL = {
    chikkamagaluru: "Chikmagalur",
    tarikere: "Tarikere",
    kadur: "Kadur",
    mudigere: "Mudigere",
    koppa: "Koppa",
    nrpura: "N.R. Pura",
    sringeri: "Sringeri",
    kalasa: "Kalasa",
    ajjampura: "Ajjampura",
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

  function boundsOf(fc) {
    let minLon = Infinity,
      minLat = Infinity,
      maxLon = -Infinity,
      maxLat = -Infinity;
    fc.features.forEach((f) => {
      const rings = f.geometry.type === "Polygon" ? f.geometry.coordinates : f.geometry.coordinates.flat();
      rings.forEach((ring) => {
        ring.forEach(([lon, lat]) => {
          if (lon < minLon) minLon = lon;
          if (lat < minLat) minLat = lat;
          if (lon > maxLon) maxLon = lon;
          if (lat > maxLat) maxLat = lat;
        });
      });
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
    return simplifyRing(ring, 0.0035)
      .map((pt, i) => {
        const [x, y] = project(pt[0], pt[1], b);
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ") + " Z";
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
    if (text.length <= 10 || !text.includes(" ")) return [text];
    const parts = text.split(" ");
    if (parts.length === 2) return parts;
    return [parts.slice(0, -1).join(" "), parts[parts.length - 1]];
  }

  function mount(root, options) {
    if (!root) return null;
    const opts = options || {};
    const state = {
      root,
      selected: opts.selected || "chikkamagaluru",
      onSelect: opts.onSelect,
      onActivate: opts.onActivate,
      reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    };

    root.innerHTML = `<p class="map-loading">Drawing the district…</p>`;

    loadGeo()
      .then((fc) => {
        const b = boundsOf(fc);
        const features = fc.features.slice().sort((a, c) => featureArea(c) - featureArea(a));
        const paths = features
          .map((feature) => {
            const id = feature.properties.id;
            const name = MAP_LABEL[id] || feature.properties.name;
            const d = featurePath(feature, b);
            const fill = FILLS[id] || "#dce6d4";
            const [lx, ly] = project((LABEL_AT[id] || [0, 0])[0], (LABEL_AT[id] || [0, 0])[1], b);
            const lines = splitLabel(name);
            const tspans = lines
              .map((line, i) => `<tspan x="${lx.toFixed(1)}" dy="${i === 0 ? 0 : 13}">${escapeXml(line)}</tspan>`)
              .join("");
            return `
              <g class="taluk-g" data-taluk-shape="${escapeXml(id)}">
                <path d="${d}" fill="${fill}" data-fill="${fill}" tabindex="0" role="button" aria-pressed="false" aria-label="${escapeXml(name)}" />
                <text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="middle" dominant-baseline="middle">${tspans}</text>
              </g>`;
          })
          .join("");

        root.innerHTML = `
          <svg class="choropleth-svg" viewBox="0 0 ${VB.w} ${VB.h}" role="img" aria-label="Chikkamagaluru district taluks">
            <title>Chikkamagaluru taluks</title>
            ${paths}
          </svg>`;

        root.querySelectorAll("[data-taluk-shape]").forEach((g) => {
          const path = g.querySelector("path");
          const id = g.getAttribute("data-taluk-shape");
          const select = () => choose(id, false);
          const activate = () => choose(id, true);
          path.addEventListener("click", activate);
          path.addEventListener("mouseenter", () => hover(id, true));
          path.addEventListener("mouseleave", () => hover(id, false));
          path.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              activate();
            }
          });
        });

        paint();
        instances.add(state);
      })
      .catch(() => {
        root.innerHTML = `<p class="map-error">The taluk map could not load. Check that <code>assets/taluks.geojson</code> is present.</p>`;
      });

    function paint() {
      root.querySelectorAll("[data-taluk-shape]").forEach((g) => {
        const id = g.getAttribute("data-taluk-shape");
        const on = id === state.selected;
        const path = g.querySelector("path");
        const text = g.querySelector("text");
        const idle = path.getAttribute("data-fill");
        path.setAttribute("fill", on ? SELECTED : idle);
        path.setAttribute("aria-pressed", on ? "true" : "false");
        g.classList.toggle("is-selected", on);
        if (text) text.setAttribute("fill", on ? LABEL_ON : LABEL_IDLE);
      });
      const selectedG = root.querySelector(`[data-taluk-shape="${CSS.escape(state.selected)}"]`);
      if (selectedG && selectedG.parentNode) selectedG.parentNode.appendChild(selectedG);
    }

    function choose(id, activate) {
      if (!id) return;
      state.selected = id;
      paint();
      if (typeof state.onSelect === "function") state.onSelect(id);
      if (activate && typeof state.onActivate === "function") state.onActivate(id);
    }

    function setSelected(id) {
      if (!id) return;
      state.selected = id;
      paint();
    }

    function hover(id, on) {
      const g = root.querySelector(`[data-taluk-shape="${CSS.escape(id)}"]`);
      if (!g || id === state.selected) return;
      const path = g.querySelector("path");
      path.setAttribute("fill", on ? HOVER : path.getAttribute("data-fill"));
    }

    return { choose, setSelected, hover, get selected() { return state.selected; } };
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

  global.CKMMap = {
    mount,
    listOrder,
    placesInTaluk,
    talukById,
    MAP_LABEL,
    loadGeo,
  };
})(window);
