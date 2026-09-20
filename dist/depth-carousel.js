(function (global) {
  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
  const normalizeItem = (it) => (typeof it === "string" ? { image: it, alt: "" } : it || {});

  function gsapTo(proxy, vars) {
    if (global.gsap && typeof global.gsap.to === "function") {
      return global.gsap.to(proxy, vars);
    }
    proxy.p = vars.p;
    vars.onUpdate?.();
    vars.onComplete?.();
    return { kill() {} };
  }

  function mount(root, options) {
    if (!root) return { destroy() {} };
    const cfg = {
      items: options.items || [],
      cardWidth: options.cardWidth ?? 300,
      cardHeight: options.cardHeight ?? 380,
      radius: options.radius ?? 17,
      tint: options.tint ?? "#7e5678",
      depth: options.depth ?? 220,
      spread: options.spread ?? 90,
      tilt: options.tilt ?? 10,
      tiltDirection: options.tiltDirection ?? "right",
      perspective: options.perspective ?? 1400,
      visibleCards: options.visibleCards ?? 5,
      falloff: options.falloff ?? 0.2,
      blur: options.blur ?? 6,
      duration: options.duration ?? 700,
      ease: options.ease ?? "power3.out",
      autoplay: Boolean(options.autoplay),
      autoplayDelay: options.autoplayDelay ?? 3200,
      loop: options.loop !== false,
      showControls: options.showControls !== false,
      showIndicators: options.showIndicators !== false,
      onChange: options.onChange,
    };

    const data = (Array.isArray(cfg.items) ? cfg.items : []).map(normalizeItem);
    const count = data.length;
    const esc = (s) =>
      String(s ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

    const cardsHtml = data
      .map((item, i) => {
        const meta = item.name
          ? `<span class="depth-carousel__meta"><span class="kicker">${esc(item.kicker || "")}</span><strong>${esc(item.name)}</strong></span>`
          : "";
        return `<div class="depth-carousel__card" style="width:${cfg.cardWidth}px;height:${cfg.cardHeight}px;border-radius:${cfg.radius}px" aria-roledescription="slide" aria-label="${i + 1} of ${count}" data-dc-index="${i}">
          <img class="depth-carousel__img" src="${esc(item.image)}" alt="${esc(item.alt || item.name || "")}" draggable="false" width="800" height="1000" />
          <span class="depth-carousel__tint" style="background:${esc(cfg.tint)}"></span>
          ${meta}
        </div>`;
      })
      .join("");

    const arrows =
      cfg.showControls && count > 1
        ? `<button type="button" class="depth-carousel__arrow depth-carousel__arrow--prev" aria-label="Previous slide">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <button type="button" class="depth-carousel__arrow depth-carousel__arrow--next" aria-label="Next slide">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>`
        : "";

    const dots =
      cfg.showIndicators && count > 1
        ? `<div class="depth-carousel__dots" role="tablist" aria-label="Slides">${data
            .map(
              (_, i) =>
                `<button type="button" role="tab" aria-selected="${i === 0 ? "true" : "false"}" aria-label="Go to slide ${i + 1}" class="depth-carousel__dot${i === 0 ? " is-active" : ""}" data-dc-dot="${i}"></button>`
            )
            .join("")}</div>`
        : "";

    root.className = `depth-carousel ${options.className || ""}`.trim();
    root.style.setProperty("--dc-perspective", `${cfg.perspective}px`);
    root.setAttribute("role", "group");
    root.setAttribute("aria-roledescription", "carousel");
    root.setAttribute("aria-label", options.label || "Popular places");
    root.tabIndex = 0;
    root.innerHTML = `<div class="depth-carousel__stage">${cardsHtml}</div>${arrows}${dots}`;

    const cardEls = Array.from(root.querySelectorAll(".depth-carousel__card"));
    const overlayEls = Array.from(root.querySelectorAll(".depth-carousel__tint"));
    const dotEls = Array.from(root.querySelectorAll("[data-dc-dot]"));

    const posRef = { current: 0 };
    const focusRef = { current: 0 };
    const scaleRef = { current: 1 };
    const dragRef = { current: null };
    let tween = null;
    let wheelTimer = null;
    let autoTimer = null;
    const reduced =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function layout(pos) {
      if (!count) return;
      const dir = cfg.tiltDirection === "left" ? -1 : 1;
      const sc = scaleRef.current;
      cardEls.forEach((el, i) => {
        let d = i - pos;
        if (cfg.loop && count > 1) {
          d = ((d % count) + count) % count;
          if (d > count / 2) d -= count;
        }
        const back = Math.max(0, d);
        const az = Math.abs(d);
        const shown = az <= cfg.visibleCards + 0.5;
        const tz = -cfg.depth * d;
        const tx = dir * cfg.spread * d;
        const ry = dir * cfg.tilt * clamp(d, 0, 1);
        let opacity = d < 0 ? Math.max(0, 1 + d) : 1;
        if (!shown) opacity = 0;
        const brightness = Math.max(0.15, 1 - back * cfg.falloff);
        const blurPx = cfg.blur > 0 ? Math.min(cfg.blur, (back / Math.max(1, cfg.visibleCards)) * cfg.blur) : 0;
        const zi = Math.round(2000 - d * 20);
        el.style.transform = `translate(-50%, -50%) scale(${sc}) translateX(${tx.toFixed(2)}px) translateZ(${tz.toFixed(2)}px) rotateY(${ry.toFixed(3)}deg)`;
        el.style.opacity = opacity.toFixed(3);
        el.style.filter = `brightness(${brightness.toFixed(3)}) blur(${blurPx.toFixed(2)}px)`;
        el.style.zIndex = String(zi);
        el.style.pointerEvents = shown && opacity > 0.05 ? "auto" : "none";
        el.setAttribute("aria-hidden", focusRef.current !== i ? "true" : "false");
        const ov = overlayEls[i];
        if (ov) ov.style.opacity = clamp(back * cfg.falloff * 1.25, 0, 0.86).toFixed(3);
      });
    }

    function notify(idx) {
      dotEls.forEach((dot, i) => {
        const on = i === idx;
        dot.classList.toggle("is-active", on);
        dot.setAttribute("aria-selected", on ? "true" : "false");
      });
      cfg.onChange?.(idx, data[idx]);
    }

    function tweenTo(target, animate) {
      tween?.kill();
      const proxy = { p: posRef.current };
      const dur = animate && !reduced ? cfg.duration / 1000 : 0;
      tween = gsapTo(proxy, {
        p: target,
        duration: dur,
        ease: cfg.ease,
        onUpdate: () => {
          posRef.current = proxy.p;
          layout(proxy.p);
        },
        onComplete: () => {
          if (count > 0) posRef.current = ((posRef.current % count) + count) % count;
          layout(posRef.current);
        },
      });
    }

    function setFocus(rawIndex, animate = true) {
      if (!count) return;
      const idx = cfg.loop ? ((rawIndex % count) + count) % count : clamp(rawIndex, 0, count - 1);
      let delta = idx - posRef.current;
      if (cfg.loop && count > 1) {
        delta = ((delta % count) + count) % count;
        if (delta > count / 2) delta -= count;
      }
      tweenTo(posRef.current + delta, animate);
      if (idx !== focusRef.current) {
        focusRef.current = idx;
        notify(idx);
      }
    }

    const navigateBy = (step) => setFocus(focusRef.current + step, true);

    const ro = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width;
      const needed = cfg.cardWidth + Math.abs(cfg.spread) * 2 + 120;
      scaleRef.current = clamp(w / needed, 0.4, 1);
      layout(posRef.current);
    });
    ro.observe(root);

    const onWheel = (e) => {
      if (count < 2) return;
      e.preventDefault();
      tween?.kill();
      const raw = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      const delta = e.deltaMode === 1 ? raw * 24 : raw;
      const step = clamp(delta / (cfg.cardWidth * 0.9), -0.6, 0.6);
      posRef.current += step;
      layout(posRef.current);
      if (wheelTimer) clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => setFocus(Math.round(posRef.current), true), 130);
    };
    root.addEventListener("wheel", onWheel, { passive: false });

    const onPointerDown = (e) => {
      if (count < 2) return;
      tween?.kill();
      dragRef.current = {
        x: e.clientX,
        startPos: posRef.current,
        lastX: e.clientX,
        lastT: performance.now(),
        v: 0,
        moved: false,
        id: e.pointerId,
      };
    };
    const onPointerMove = (e) => {
      const drag = dragRef.current;
      if (!drag) return;
      const stepPx = Math.max(cfg.cardWidth * 0.55 * scaleRef.current, 40);
      const dx = e.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) > 4) {
        drag.moved = true;
        root.setPointerCapture(drag.id);
      }
      if (!drag.moved) return;
      const now = performance.now();
      const dt = Math.max(now - drag.lastT, 1);
      drag.v = (e.clientX - drag.lastX) / dt;
      drag.lastX = e.clientX;
      drag.lastT = now;
      posRef.current = drag.startPos - dx / stepPx;
      layout(posRef.current);
    };
    const onPointerEnd = () => {
      const drag = dragRef.current;
      if (!drag) return;
      dragRef.current = null;
      if (!drag.moved) return;
      const stepPx = Math.max(cfg.cardWidth * 0.55 * scaleRef.current, 40);
      const projected = posRef.current - (drag.v * 180) / stepPx;
      setFocus(Math.round(projected), true);
    };
    const onKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        navigateBy(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        navigateBy(1);
      }
    };

    root.addEventListener("pointerdown", onPointerDown);
    root.addEventListener("pointermove", onPointerMove);
    root.addEventListener("pointerup", onPointerEnd);
    root.addEventListener("pointercancel", onPointerEnd);
    root.addEventListener("keydown", onKeyDown);

    cardEls.forEach((el, i) => {
      el.addEventListener("click", () => {
        if (dragRef.current?.moved) return;
        setFocus(i, true);
      });
    });
    root.querySelector(".depth-carousel__arrow--prev")?.addEventListener("click", () => navigateBy(-1));
    root.querySelector(".depth-carousel__arrow--next")?.addEventListener("click", () => navigateBy(1));
    dotEls.forEach((dot) => {
      dot.addEventListener("click", () => setFocus(Number(dot.getAttribute("data-dc-dot")), true));
    });

    if (cfg.autoplay && !reduced && count >= 2) {
      let hovered = false;
      let focused = false;
      const stop = () => {
        if (autoTimer) clearInterval(autoTimer);
        autoTimer = null;
      };
      const start = () => {
        stop();
        autoTimer = window.setInterval(() => {
          if (!hovered && !focused) navigateBy(1);
        }, Math.max(cfg.autoplayDelay, 600));
      };
      root.addEventListener("mouseenter", () => {
        hovered = true;
      });
      root.addEventListener("mouseleave", () => {
        hovered = false;
      });
      root.addEventListener("focusin", () => {
        focused = true;
      });
      root.addEventListener("focusout", () => {
        focused = false;
      });
      start();
    }

    layout(0);
    notify(0);

    return {
      destroy() {
        tween?.kill();
        if (wheelTimer) clearTimeout(wheelTimer);
        if (autoTimer) clearInterval(autoTimer);
        ro.disconnect();
      },
    };
  }

  global.CKMDepthCarousel = { mount };
})(window);
