(function (global) {
  function prefersReduced() {
    return Boolean(global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  function mount(root) {
    if (!root) return { destroy() {} };
    const track = root.querySelector("[data-origin-track]");
    const slides = Array.from(root.querySelectorAll("[data-origin-slide]"));
    const tabs = Array.from(root.querySelectorAll("[data-origin-tab]"));
    const status = root.querySelector("[data-origin-status]");
    if (!track || !slides.length) return { destroy() {} };

    let index = 0;
    let startX = 0;
    let dragging = false;
    const max = slides.length - 1;

    function hashIndex() {
      const id = String(location.hash || "").replace("#", "");
      if (!id) return 0;
      const found = slides.findIndex((el) => el.id === id);
      return found >= 0 ? found : 0;
    }

    function paint(immediate) {
      const x = -index * 100;
      track.style.transition = immediate || prefersReduced() ? "none" : "transform 520ms cubic-bezier(0.22, 1, 0.36, 1)";
      track.style.transform = `translate3d(${x}%, 0, 0)`;
      slides.forEach((slide, i) => {
        slide.setAttribute("aria-hidden", i === index ? "false" : "true");
      });
      tabs.forEach((tab, i) => {
        const on = i === index;
        tab.classList.toggle("is-active", on);
        tab.setAttribute("aria-selected", on ? "true" : "false");
      });
      if (status) status.textContent = `${String(index + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
      root.querySelectorAll("[data-origin-prev]").forEach((btn) => {
        btn.disabled = index === 0;
      });
      root.querySelectorAll("[data-origin-next]").forEach((btn) => {
        btn.disabled = index === max;
        btn.hidden = index === max;
      });
      root.querySelectorAll("[data-origin-end]").forEach((el) => {
        el.hidden = index !== max;
      });
    }

    function go(next, fromUser) {
      index = Math.max(0, Math.min(max, next));
      paint(false);
      const id = slides[index].id;
      if (fromUser && id && history.replaceState) {
        history.replaceState(null, "", `#${id}`);
      }
    }

    function onKey(event) {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        go(index + 1, true);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        go(index - 1, true);
      }
    }

    function onPointerDown(event) {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      dragging = true;
      startX = event.clientX;
    }

    function onPointerUp(event) {
      if (!dragging) return;
      dragging = false;
      const dx = event.clientX - startX;
      if (dx < -48) go(index + 1, true);
      else if (dx > 48) go(index - 1, true);
    }

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => go(Number(tab.getAttribute("data-origin-tab")), true));
    });
    root.querySelectorAll("[data-origin-next]").forEach((btn) => {
      btn.addEventListener("click", () => go(index + 1, true));
    });
    root.querySelectorAll("[data-origin-prev]").forEach((btn) => {
      btn.addEventListener("click", () => go(index - 1, true));
    });
    root.addEventListener("keydown", onKey);
    track.addEventListener("pointerdown", onPointerDown);
    track.addEventListener("pointerup", onPointerUp);
    track.addEventListener("pointercancel", onPointerUp);

    index = hashIndex();
    paint(true);
    root.tabIndex = 0;

    return {
      destroy() {
        root.removeEventListener("keydown", onKey);
        track.removeEventListener("pointerdown", onPointerDown);
        track.removeEventListener("pointerup", onPointerUp);
        track.removeEventListener("pointercancel", onPointerUp);
      },
    };
  }

  global.CKMOriginSlider = { mount };
})(typeof window !== "undefined" ? window : globalThis);
