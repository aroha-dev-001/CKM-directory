(function (global) {
  const DEFAULT_SPRING = { stiffness: 260, damping: 20 };
  const MOBILE_BREAKPOINT = 768;

  function prefersReduced() {
    return Boolean(global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  function esc(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function gsapLib() {
    return global.gsap;
  }

  function mount(root, options) {
    if (!root) return { destroy() {} };
    const cards = Array.isArray(options.cards) ? options.cards.slice() : [];
    if (!cards.length) return { destroy() {} };

    const randomRotation = Boolean(options.randomRotation);
    const sensitivity = options.sensitivity ?? 180;
    const sendToBackOnClick = options.sendToBackOnClick !== false;
    const autoplay = options.autoplay !== false && !prefersReduced();
    const autoplayDelay = options.autoplayDelay ?? 3000;
    const pauseOnHover = options.pauseOnHover !== false;
    const mobileClickOnly = options.mobileClickOnly !== false;
    const mobileBreakpoint = options.mobileBreakpoint ?? MOBILE_BREAKPOINT;
    const onChange = typeof options.onChange === "function" ? options.onChange : null;
    const spring = options.animationConfig || DEFAULT_SPRING;

    const rotations = cards.map(() => (randomRotation && !prefersReduced() ? Math.random() * 10 - 5 : 0));
    let order = cards.map((_, i) => i).reverse();
    let isPaused = false;
    let isMobile = global.innerWidth < mobileBreakpoint;
    let autoplayTimer = null;
    let destroyed = false;
    let drag = null;
    let skipClick = false;

    root.className = "ckm-stack";
    root.setAttribute("role", "group");
    root.setAttribute("aria-label", options.label || "Illustration stack");
    root.innerHTML = cards
      .map(
        (card, i) => `
      <div class="ckm-stack-rotate" data-stack-index="${i}">
        <div class="ckm-stack-card">
          <img class="ckm-stack-image" src="${esc(card.src)}" alt="${esc(card.alt || card.kicker || "")}" draggable="false" width="800" height="800" />
        </div>
      </div>`
      )
      .join("");

    const wraps = Array.from(root.querySelectorAll(".ckm-stack-rotate"));
    const cardEls = Array.from(root.querySelectorAll(".ckm-stack-card"));

    function topIndex() {
      return order[order.length - 1];
    }

    function emit() {
      const i = topIndex();
      if (onChange) onChange(cards[i], i);
    }

    function layout(immediate) {
      const n = order.length;
      const gsap = gsapLib();
      order.forEach((cardIndex, visualIndex) => {
        const wrap = wraps[cardIndex];
        const card = cardEls[cardIndex];
        const rotateZ = (n - visualIndex - 1) * 4 + (rotations[cardIndex] || 0);
        const scale = 1 + visualIndex * 0.06 - n * 0.06;
        wrap.style.zIndex = String(visualIndex + 1);
        wrap.classList.toggle("is-top", visualIndex === n - 1);
        wrap.setAttribute("aria-hidden", visualIndex === n - 1 ? "false" : "true");
        const props = {
          rotateZ: prefersReduced() ? 0 : rotateZ,
          scale: prefersReduced() ? 1 : scale,
          transformOrigin: "90% 90%",
          x: 0,
          y: 0,
          rotateX: 0,
          rotateY: 0,
        };
        if (gsap && !immediate && !prefersReduced()) {
          gsap.to(card, {
            ...props,
            duration: 0.5,
            ease: "power3.out",
            overwrite: "auto",
          });
          gsap.to(wrap, { x: 0, y: 0, rotateX: 0, rotateY: 0, duration: 0.35, ease: "power3.out", overwrite: "auto" });
        } else if (gsap) {
          gsap.set(card, props);
          gsap.set(wrap, { x: 0, y: 0, rotateX: 0, rotateY: 0 });
        } else {
          card.style.transformOrigin = "90% 90%";
          card.style.transform = `rotate(${props.rotateZ}deg) scale(${props.scale})`;
          wrap.style.transform = "none";
        }
      });
    }

    function sendToBack(cardIndex) {
      const pos = order.indexOf(cardIndex);
      if (pos < 0) return;
      order.splice(pos, 1);
      order.unshift(cardIndex);
      layout(false);
      emit();
    }

    function sendTopToBack() {
      sendToBack(topIndex());
    }

    function stopAutoplay() {
      if (autoplayTimer) {
        global.clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    }

    function startAutoplay() {
      stopAutoplay();
      if (!autoplay || cards.length < 2 || destroyed) return;
      autoplayTimer = global.setInterval(() => {
        if (isPaused || drag) return;
        sendTopToBack();
      }, autoplayDelay);
    }

    function disableDrag() {
      return mobileClickOnly && isMobile;
    }

    function onPointerDown(event) {
      if (disableDrag() || prefersReduced()) return;
      if (event.pointerType === "mouse" && event.button !== 0) return;
      const wrap = event.currentTarget;
      const cardIndex = Number(wrap.getAttribute("data-stack-index"));
      if (cardIndex !== topIndex()) return;
      drag = {
        id: event.pointerId,
        cardIndex,
        wrap,
        startX: event.clientX,
        startY: event.clientY,
        x: 0,
        y: 0,
      };
      wrap.setPointerCapture?.(event.pointerId);
    }

    function onPointerMove(event) {
      if (!drag || event.pointerId !== drag.id) return;
      drag.x = event.clientX - drag.startX;
      drag.y = event.clientY - drag.startY;
      const gsap = gsapLib();
      const rotateX = Math.max(-60, Math.min(60, (-drag.y / 100) * 60));
      const rotateY = Math.max(-60, Math.min(60, (drag.x / 100) * 60));
      if (gsap) gsap.set(drag.wrap, { x: drag.x, y: drag.y, rotateX, rotateY });
      else drag.wrap.style.transform = `translate(${drag.x}px, ${drag.y}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    }

    function onPointerUp(event) {
      if (!drag || event.pointerId !== drag.id) return;
      const { cardIndex, x, y } = drag;
      const moved = Math.abs(x) > 8 || Math.abs(y) > 8;
      drag = null;
      if (Math.abs(x) > sensitivity || Math.abs(y) > sensitivity) {
        skipClick = true;
        sendToBack(cardIndex);
        return;
      }
      layout(false);
      if (moved) skipClick = true;
    }

    function onClick(event) {
      if (skipClick) {
        skipClick = false;
        return;
      }
      if (!sendToBackOnClick && !disableDrag()) return;
      const wrap = event.currentTarget;
      const cardIndex = Number(wrap.getAttribute("data-stack-index"));
      if (cardIndex !== topIndex()) return;
      sendToBack(cardIndex);
    }

    function onKey(event) {
      if (event.key === "Enter" || event.key === " " || event.key === "ArrowRight") {
        event.preventDefault();
        sendTopToBack();
      }
    }

    function onResize() {
      isMobile = global.innerWidth < mobileBreakpoint;
    }

    wraps.forEach((wrap) => {
      wrap.addEventListener("pointerdown", onPointerDown);
      wrap.addEventListener("pointermove", onPointerMove);
      wrap.addEventListener("pointerup", onPointerUp);
      wrap.addEventListener("pointercancel", onPointerUp);
      wrap.addEventListener("click", onClick);
    });
    root.tabIndex = 0;
    root.addEventListener("keydown", onKey);
    if (pauseOnHover) {
      root.addEventListener("mouseenter", () => {
        isPaused = true;
      });
      root.addEventListener("mouseleave", () => {
        isPaused = false;
      });
    }
    global.addEventListener("resize", onResize);

    layout(true);
    emit();
    startAutoplay();

    return {
      destroy() {
        destroyed = true;
        stopAutoplay();
        wraps.forEach((wrap) => {
          wrap.removeEventListener("pointerdown", onPointerDown);
          wrap.removeEventListener("pointermove", onPointerMove);
          wrap.removeEventListener("pointerup", onPointerUp);
          wrap.removeEventListener("pointercancel", onPointerUp);
          wrap.removeEventListener("click", onClick);
        });
        root.removeEventListener("keydown", onKey);
        global.removeEventListener("resize", onResize);
      },
    };
  }

  global.CKMStack = { mount };
})(typeof window !== "undefined" ? window : globalThis);
