(function () {
  "use strict";

  var LABEL = "Pollen drifting over the Kudremukh hills";
  var SRC = "sylva-living-world/living-green.html?v=sylva3";

  function lite() {
    return window.matchMedia("(max-width: 720px)").matches || window.matchMedia("(pointer: coarse)").matches;
  }

  function reduced() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function startPollen(host) {
    var canvas = document.createElement("canvas");
    canvas.className = "hero-pollen";
    canvas.setAttribute("aria-hidden", "true");
    host.appendChild(canvas);
    var ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) {
      host.setAttribute("data-state", "ready");
      return;
    }

    var dots = [];
    var w = 0;
    var h = 0;
    var dpr = 1;
    var running = true;
    var last = 0;

    function resize() {
      var rect = host.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(90, Math.max(48, (w * h) / 9000)));
      dots = [];
      for (var i = 0; i < n; i++) {
        dots.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: 1.1 + Math.random() * 2.4,
          a: 0.28 + Math.random() * 0.45,
          vx: 4 + Math.random() * 10,
          vy: -6 - Math.random() * 10,
          wob: Math.random() * Math.PI * 2,
        });
      }
    }

    function tick(now) {
      if (!running) return;
      var dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
      last = now;
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < dots.length; i++) {
        var p = dots[i];
        if (!reduced()) {
          p.wob += dt * 1.4;
          p.x += (p.vx + Math.sin(p.wob) * 8) * dt;
          p.y += p.vy * dt;
          if (p.y < -8) {
            p.y = h + 6;
            p.x = Math.random() * w;
          }
          if (p.x > w + 8) p.x = -6;
          if (p.x < -8) p.x = w + 6;
        }
        ctx.beginPath();
        ctx.fillStyle = "rgba(255,255,245," + p.a + ")";
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!reduced()) requestAnimationFrame(tick);
    }

    resize();
    host.setAttribute("data-state", "ready");
    requestAnimationFrame(tick);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) running = false;
      else if (!running) {
        running = true;
        last = 0;
        requestAnimationFrame(tick);
      }
    });
  }

  function startIframe(host) {
    var iframe = null;
    var hostVisible = true;
    var documentVisible = !document.hidden;

    function sync() {
      var mounted = hostVisible && documentVisible;
      if (mounted && !iframe) {
        iframe = document.createElement("iframe");
        iframe.className = "sylva-living-world-frame";
        iframe.title = LABEL;
        iframe.setAttribute("sandbox", "allow-scripts allow-same-origin");
        iframe.setAttribute("loading", "eager");
        iframe.src = SRC;
        iframe.addEventListener("load", function () {
          host.setAttribute("data-state", "ready");
        });
        host.appendChild(iframe);
        host.setAttribute("data-state", "loading");
      } else if (!mounted && iframe) {
        iframe.remove();
        iframe = null;
        host.setAttribute("data-state", "loading");
      }
    }

    if (typeof IntersectionObserver !== "undefined") {
      var observer = new IntersectionObserver(
        function (entries) {
          hostVisible = entries[0] ? entries[0].isIntersecting : true;
          sync();
        },
        { root: null, rootMargin: "40% 0px", threshold: 0 }
      );
      observer.observe(host);
    }

    document.addEventListener("visibilitychange", function () {
      documentVisible = !document.hidden;
      sync();
    });

    sync();
  }

  function mount() {
    var host = document.getElementById("sylva-hero");
    if (!host) return;
    if (lite()) startPollen(host);
    else startIframe(host);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
