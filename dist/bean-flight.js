/* Bean to cup, worldflight controller.
   Scroll engine: scrollcraft.js (same runtime as the Bloom Biotech landing).
   This file owns what Bloom's World component owned: the chapter rail,
   glide-snap between stops, keyboard stepping, the veil cut for long jumps,
   scrim mirroring, the aperture entrance, plus the companion's own chrome
   (nav, language toggle, walk progress). */
(function () {
  "use strict";

  var DATA = window.BEAN_FLIGHT || { BEATS: [], UI: { en: {}, kn: {} } };
  var BEATS = DATA.BEATS, UI = DATA.UI;
  var LEG_W = 1.2;                  // viewport-heights of scroll per beat
  var ACT_II = BEATS.findIndex(function (b) { return b.act === "II"; });

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (x, a, b) { return x < a ? a : x > b ? b : x; };
  var reduced = function () { return matchMedia("(prefers-reduced-motion: reduce)").matches; };

  // ---- language ----------------------------------------------------------
  var lang = "en";
  try { lang = localStorage.getItem("ckm-lang") || "en"; } catch (e) {}
  function copyOf(b) { return b[lang === "kn" ? "kn" : "en"] || b.en; }
  function dict() { return UI[lang === "kn" ? "kn" : "en"] || UI.en; }

  function applyLang() {
    var d = dict();
    $$("[data-i]").forEach(function (el) {
      var k = el.getAttribute("data-i");
      if (k && d[k]) el.textContent = d[k];
    });
    $$("[data-beat]").forEach(function (el) {
      var b = BEATS[+el.getAttribute("data-beat")];
      if (!b) return;
      var c = copyOf(b);
      var set = function (sel, v) { var n = $(sel, el); if (n && v != null) n.textContent = v; };
      set(".wk", c.k); set(".wtitle", c.h); set(".wbody:not(.wbody--more)", c.p1);
      set(".wbody--more", c.p2); set(".wcap", c.cap);
    });
    $$(".wrail__name").forEach(function (el, i) {
      var b = BEATS[i]; if (!b) return;
      var k = copyOf(b).k.split("·");
      el.innerHTML = "<small>" + k[0].trim() + "</small>" + (k[1] || k[0]).trim();
    });
    var tog = $("[data-lang-toggle]");
    if (tog) {
      tog.textContent = lang === "kn" ? "English" : "ಕನ್ನಡ";
      tog.setAttribute("aria-pressed", lang === "kn" ? "true" : "false");
    }
    document.documentElement.lang = lang === "kn" ? "kn" : "en";
    paintAct(curLeg);
  }

  // ---- geometry: stops are where the glide comes to rest ----------------
  // Every beat's stop sits at the middle of its leg (copy at full strength),
  // except the first (the hero is up from pixel 0) and the last (the finale
  // holds at the end of the track).
  var TOTAL = BEATS.length * LEG_W;
  var STOPS = BEATS.map(function (_, i) {
    if (i === 0) return 0;
    if (i === BEATS.length - 1) return TOTAL;
    return (i + 0.5) * LEG_W;
  });
  var worldTop = 0;
  function E(i) {
    var y = worldTop + STOPS[i] * innerHeight;
    return Math.min(Math.round(y), Math.max(0, document.documentElement.scrollHeight - innerHeight));
  }
  var flightEnd = function () { return worldTop + TOTAL * innerHeight; };
  var inFlight = function (y) { return y <= flightEnd() + 4; };

  // ---- glide-snap (Bloom's hermite glide, ported as-is) -----------------
  var glide = null, snapTimer = 0, target = -1, dir = 0, lastY = 0, touching = false, cutting = 0, veil = null;
  var go = function (y) { window.scrollTo({ top: y, behavior: "instant" }); };

  function nearest(y) {
    var t = 0;
    for (var r = 1; r < STOPS.length; r++) if (Math.abs(E(r) - y) < Math.abs(E(t) - y)) t = r;
    return t;
  }
  function stopGlide() { if (glide) cancelAnimationFrame(glide.raf); glide = null; }
  function glideTo(i) {
    var from = window.scrollY, to = E(i), d = to - from;
    target = i;
    if (Math.abs(d) <= 1) return stopGlide();
    var dur = clamp(500 + (480 * Math.abs(d)) / innerHeight, 560, 1400);
    var now = performance.now(), m0 = 0;
    if (glide) {
      var e = clamp((now - glide.start) / glide.dur, 0, 1);
      m0 = clamp((((glide.to - glide.from) * (glide.m0 * (3 * e * e - 4 * e + 1) + 6 * e - 6 * e * e)) / glide.dur) * dur / d, 0, 2);
      cancelAnimationFrame(glide.raf);
    }
    glide = { from: from, to: to, start: now, dur: dur, m0: m0, last: from, raf: 0 };
    glide.raf = requestAnimationFrame(step);
  }
  function step(ts) {
    var g = glide; if (!g) return;
    var y = window.scrollY;
    if (Math.abs(y - g.last) > 2) { dir = Math.sign(y - g.last); stopGlide(); snapSoon(); return; } // reader took over
    var a = clamp((ts - g.start) / g.dur, 0, 1);
    var n = Math.round(g.from + (g.to - g.from) * (g.m0 * (a * a * a - 2 * a * a + a) + (3 * a * a - 2 * a * a * a)));
    go(n); g.last = n;
    if (a < 1) g.raf = requestAnimationFrame(step); else glide = null;
  }
  function settle() {
    clearTimeout(snapTimer);
    if (glide || cutting || touching || reduced()) return;
    var y = window.scrollY;
    if (!inFlight(y)) { dir = 0; return; }            // free scroll after the flight
    var i = pick(y, dir);
    dir = 0;
    if (Math.abs(E(i) - y) > 1) glideTo(i);
  }
  function pick(y, d) {
    var r = nearest(y);
    if (!d || Math.abs(E(r) - y) <= 2) return r;
    var a = -1;
    for (var t = 0; t < STOPS.length; t++) if (E(t) <= y) a = t;
    if (a < 0) return 0;
    if (a >= STOPS.length - 1) return STOPS.length - 1;
    var lo = E(a), hi = E(a + 1), th = Math.min(0.2 * (hi - lo), 0.06 * innerHeight);
    return d > 0 ? (y - lo > th ? a + 1 : a) : (hi - y > th ? a : a + 1);
  }
  function snapSoon(ms) { clearTimeout(snapTimer); snapTimer = setTimeout(settle, ms == null ? 180 : ms); }

  // Long jumps (rail clicks far away) cut behind a veil instead of flying
  // through ten chapters at speed.
  function cutTo(i) {
    stopGlide(); target = i;
    var id = ++cutting;
    if (veil) veil.setAttribute("data-on", "");
    setTimeout(function () {
      if (id !== cutting) return;
      go(E(i)); lastY = window.scrollY;
      setTimeout(function () {
        if (id !== cutting) return;
        if (veil) veil.removeAttribute("data-on");
        cutting = 0;
      }, 180);
    }, 240);
  }
  function jump(i, mode) {
    i = clamp(i, 0, STOPS.length - 1);
    clearTimeout(snapTimer);
    if (mode === "instant" || reduced()) { stopGlide(); target = i; go(E(i)); return; }
    var far = Math.abs(E(i) - window.scrollY) / innerHeight > 2.4;
    if ((mode === "auto" && far) || cutting) cutTo(i); else glideTo(i);
  }

  function wireSnap() {
    var hasEnd = "onscrollend" in window;
    lastY = window.scrollY;
    addEventListener("scroll", function () {
      var y = window.scrollY;
      if (glide || cutting) { lastY = y; return; }
      if (Math.abs(y - lastY) > 0.5) dir = Math.sign(y - lastY);
      lastY = y;
      clearTimeout(snapTimer);
      if (!hasEnd) snapSoon();
    }, { passive: true });
    if (hasEnd) addEventListener("scrollend", function () { if (!glide && !cutting) settle(); });
    addEventListener("touchstart", function () { touching = true; stopGlide(); clearTimeout(snapTimer); }, { passive: true });
    var up = function (e) { if (!e.touches.length) { touching = false; snapSoon(); } };
    addEventListener("touchend", up, { passive: true });
    addEventListener("touchcancel", up, { passive: true });
    var w = innerWidth;
    addEventListener("resize", function () { if (innerWidth !== w) { w = innerWidth; stopGlide(); snapSoon(260); } }, { passive: true });

    addEventListener("keydown", function (e) {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      var el = e.target instanceof Element ? e.target : null;
      if (el && el.closest("input, textarea, select, [contenteditable]")) return;
      if (!inFlight(window.scrollY) && e.key !== "Home") return;
      var cur = target >= 0 && (glide || cutting) ? target : nearest(window.scrollY), to, mode = "glide";
      switch (e.key) {
        case "ArrowDown": case "PageDown": to = cur + 1; break;
        case "ArrowUp": case "PageUp": to = cur - 1; break;
        case " ": if (el && el.closest("a, button, summary, [role='button']")) return; to = cur + (e.shiftKey ? -1 : 1); break;
        case "Home": to = 0; mode = "auto"; break;
        case "End": to = STOPS.length - 1; mode = "auto"; break;
        default: return;
      }
      if (to > STOPS.length - 1) return;               // let the page carry on to the close
      e.preventDefault(); jump(to, mode);
    });

    // Tabbing into a copy block that is not on screen lands on its stop.
    document.addEventListener("focusin", function (e) {
      var t = e.target && e.target.closest && e.target.closest("[data-stop]");
      if (t && parseFloat(getComputedStyle(t).opacity || "0") <= 0.9) jump(+t.getAttribute("data-stop"), "instant");
    });
  }

  // ---- rail --------------------------------------------------------------
  var curLeg = 0, flashT = 0;
  function buildRail() {
    var nav = $(".wrail"); if (!nav) return;
    var ol = document.createElement("ol");
    BEATS.forEach(function (b, i) {
      var li = document.createElement("li");
      var btn = document.createElement("button");
      btn.type = "button";
      btn.innerHTML = '<span class="wrail__tick" aria-hidden="true"></span><span class="wrail__name"></span>';
      btn.addEventListener("click", function () { jump(i, "auto"); });
      li.appendChild(btn);
      if (i === ACT_II - 1) {
        var g = document.createElement("span"); g.className = "wrail__ground"; g.setAttribute("aria-hidden", "true");
        li.appendChild(g);
      }
      ol.appendChild(li);
    });
    nav.appendChild(ol);
  }
  function flash() {
    var nav = $(".wrail"); if (!nav) return;
    nav.setAttribute("data-flash", "");
    clearTimeout(flashT);
    flashT = setTimeout(function () { nav.removeAttribute("data-flash"); }, 2200);
  }
  function paintRail(k) {
    $$(".wrail button").forEach(function (b, i) {
      if (i === k) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current");
    });
  }
  function paintAct(k) {
    var el = $(".wact"); if (!el) return;
    el.textContent = dict()[k >= ACT_II ? "actII" : "actI"] || "";
  }

  // ---- chrome that follows scroll ---------------------------------------
  function wireChrome() {
    var nav = $(".nav"), burger = $(".nav-burger"), rail = $(".wrail"), act = $(".wact"), hint = $(".whint");
    var bar = $("#walk-progress-bar"), wrap = $(".walk-progress");
    var prevY = 0, hinted = false;
    if (burger && nav) burger.addEventListener("click", function () {
      var open = nav.classList.toggle("menu-open");
      burger.classList.toggle("active", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      document.documentElement.classList.toggle("nav-open", open);
    });
    function onScroll() {
      var y = window.scrollY;
      if (nav) {
        nav.classList.toggle("stuck", y > 16);
        if (!nav.classList.contains("menu-open")) nav.classList.toggle("hide", y > prevY + 2 && y > 140);
        if (y < prevY - 2) nav.classList.remove("hide");
      }
      prevY = y;
      var off = !inFlight(y - innerHeight * 0.25);
      if (rail) rail.classList.toggle("is-off", off);
      if (act) act.classList.toggle("is-off", off);
      if (!hinted && y > 40 && hint) { hinted = true; hint.classList.add("is-off"); }
      var pr = clamp((y - worldTop) / Math.max(1, TOTAL * innerHeight), 0, 1);
      if (bar) bar.style.width = (pr * 100).toFixed(2) + "%";
      if (wrap) {
        wrap.setAttribute("aria-valuenow", String(Math.round(pr * 100)));
        wrap.setAttribute("aria-valuetext", "Beat " + String(curLeg).padStart(2, "0") + " of " + String(BEATS.length - 1).padStart(2, "0"));
      }
    }
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    document.documentElement.style.setProperty("--vw", innerWidth + "px");
    addEventListener("resize", function () { document.documentElement.style.setProperty("--vw", innerWidth + "px"); }, { passive: true });
  }

  // Scrims track their copy block's opacity frame by frame, so the darkening
  // arrives and leaves with the words instead of sitting on the picture.
  function wireScrims(root) {
    var pairs = $$("[data-scrim-for]", root).map(function (s) {
      return { s: s, c: $('[data-copy-id="' + s.getAttribute("data-scrim-for") + '"]', root), last: "" };
    });
    (function loop() {
      requestAnimationFrame(loop);
      for (var i = 0; i < pairs.length; i++) {
        var p = pairs[i], o = (p.c && p.c.style.opacity) || "0";
        if (o !== p.last) { p.s.style.opacity = o; p.last = o; }
      }
    })();
  }

  // ---- entrance ----------------------------------------------------------
  function entrance() {
    var html = document.documentElement;
    if (!html.classList.contains("entering")) return;
    var img = $(".ap-img");
    var open = function () {
      if (html.classList.contains("lens-open")) return;
      html.classList.add("lens-open");
      setTimeout(function () { html.classList.remove("entering", "lens-open"); flash(); }, 2300);
    };
    if (!img || (img.complete && img.naturalWidth)) open();
    else { img.addEventListener("load", open, { once: true }); img.addEventListener("error", open, { once: true }); }
    setTimeout(open, 1600);                              // never hold the page hostage to one image
  }

  // ---- boot ----------------------------------------------------------------
  function boot() {
    var root = $(".world");
    veil = $(".wveil");
    buildRail();
    applyLang();
    entrance();
    var tog = $("[data-lang-toggle]");
    if (tog) tog.addEventListener("click", function () {
      lang = lang === "kn" ? "en" : "kn";
      try { localStorage.setItem("ckm-lang", lang); } catch (e) {}
      applyLang();
    });

    document.addEventListener("sc:waypoint", function (e) {
      var k = e.detail.index;
      if (k === curLeg) return;
      curLeg = k; paintRail(k); paintAct(k); flash();
    });
    paintRail(0);

    if (!window.ScrollCraft) { console.warn("[bean-flight] scrollcraft.js missing"); return; }
    var api = window.ScrollCraft.mount(root);
    var measure = function () {
      var W = api.worlds && api.worlds[0];
      worldTop = W ? W.top : 0;
    };
    measure();
    var relayout = function () { dispatchEvent(new Event("resize")); api.layout(); measure(); snapSoon(0); };
    if (document.readyState === "complete") relayout(); else addEventListener("load", relayout, { once: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
    addEventListener("resize", measure, { passive: true });

    wireScrims(root);
    wireSnap();
    wireChrome();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
