(function (global) {
  function gsapLib() {
    return global.gsap;
  }

  function mount(root, options) {
    if (!root) return { destroy() {} };
    const items = Array.isArray(options.items) ? options.items : [];
    const count = items.length;
    if (!count) return { destroy() {} };

    const defaultIndex = Math.min(Math.max(options.defaultIndex ?? 2, 0), count - 1);
    const accentColor = options.accentColor ?? "#c8ae6e";
    const overlayColor = options.overlayColor ?? "#0c1f13";
    const textColor = options.textColor ?? "#fcfbf8";
    const height = options.height ?? 460;
    const gap = options.gap ?? 10;
    const radius = options.radius ?? 16;
    const expandRatio = options.expandRatio ?? 0.52;
    const orientation = options.orientation ?? "horizontal";
    const duration = options.duration ?? 0.6;
    const ease = options.ease ?? "power3.out";
    const parallax = options.parallax ?? 0.5;
    const tilt = options.tilt ?? 8;
    const stagger = options.stagger ?? 0.06;
    const trigger = options.trigger ?? "hover";
    const showLabels = options.showLabels !== false;
    const grayscale = options.grayscale !== false;
    const vertical = orientation === "vertical";
    const prefersReduced =
      typeof window !== "undefined" && window.matchMedia
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false;

    const esc = (s) =>
      String(s ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

    let active = defaultIndex;
    let firstRun = true;
    let mediaSize = 320;
    let tl = null;

    root.className = `accordion-gallery${vertical ? " accordion-gallery--vertical" : ""}${options.className ? ` ${options.className}` : ""}`;
    root.style.setProperty("--ag-accent", accentColor);
    root.style.setProperty("--ag-overlay", overlayColor);
    root.style.setProperty("--ag-text", textColor);
    root.style.setProperty("--ag-gap", `${gap}px`);
    root.style.setProperty("--ag-radius", `${radius}px`);
    root.style.height = vertical ? `${Math.round(height * 1.6)}px` : `${height}px`;
    root.setAttribute("role", "list");
    root.setAttribute("aria-label", options.label || "Popular places");

    root.innerHTML = items
      .map((item, i) => {
        const href = item.link ? ` href="${esc(item.link)}"` : "";
        const tagOpen = item.link ? `<a${href}` : "<div";
        const tagClose = item.link ? "</a>" : "</div>";
        const label = showLabels
          ? `<span class="ag-panel__label" aria-hidden="true"><span class="ag-panel__bar"></span><span class="ag-panel__text">${esc(item.label || "")}</span></span>`
          : "";
        return `${tagOpen} class="ag-panel" style="border-radius:${radius}px" role="listitem" tabindex="0" data-ag-index="${i}" aria-label="${esc(item.label || "")}">
          <span class="ag-panel__frame">
            <span class="ag-panel__media">
              <img src="${esc(item.image)}" alt="${esc(item.alt || item.label || "")}" draggable="false" />
            </span>
            <span class="ag-panel__overlay" aria-hidden="true"></span>
          </span>
          ${label}
        ${tagClose}`;
      })
      .join("");

    const panels = Array.from(root.querySelectorAll(".ag-panel"));
    const medias = Array.from(root.querySelectorAll(".ag-panel__media"));
    const bars = Array.from(root.querySelectorAll(".ag-panel__bar"));
    const texts = Array.from(root.querySelectorAll(".ag-panel__text"));

    function applyLayout(animate) {
      const gsap = gsapLib();
      const r = Math.min(Math.max(expandRatio, 0.2), 0.9);
      const grow = count > 1 ? (r * (count - 1)) / (1 - r) : 1;
      const dur = animate && !prefersReduced ? duration : 0;
      tl?.kill();
      if (gsap) tl = gsap.timeline();

      panels.forEach((panel, i) => {
        const isActive = i === active;
        panel.classList.toggle("ag-panel--active", isActive);
        if (isActive) panel.setAttribute("aria-current", "true");
        else panel.removeAttribute("aria-current");
        const rot = isActive ? 0 : i < active ? tilt : -tilt;
        const rotProp = vertical ? { rotateX: -rot } : { rotateY: rot };
        const media = medias[i];
        const bar = bars[i];
        const text = texts[i];
        const drift = Math.max(-1.5, Math.min(1.5, active - i));
        const shift = drift * parallax * mediaSize * 0.06;
        const gray = grayscale ? (isActive ? 0 : 1) : 0;

        if (gsap && tl) {
          tl.to(
            panel,
            { flexGrow: isActive ? grow : 1, ...rotProp, "--ag-dim": isActive ? 0 : 0.35, duration: dur, ease },
            0
          );
          if (media) {
            tl.to(
              media,
              {
                xPercent: -50,
                yPercent: -50,
                x: vertical ? 0 : isActive ? 0 : shift,
                y: vertical ? (isActive ? 0 : shift) : 0,
                "--ag-gray": gray,
                "--ag-dim": isActive ? 0 : 0.35,
                duration: dur,
                ease,
              },
              0
            );
          }
          if (showLabels && bar && text) {
            if (isActive) {
              tl.to([bar, text], { opacity: 1, x: 0, duration: dur, ease, stagger: prefersReduced ? 0 : stagger }, 0);
            } else {
              tl.to([bar, text], { opacity: 0, x: -14, duration: dur * 0.6, ease }, 0);
            }
          }
        } else {
          panel.style.flexGrow = String(isActive ? grow : 1);
          if (media) {
            media.style.setProperty("--ag-gray", String(gray));
            media.style.setProperty("--ag-dim", isActive ? "0" : "0.35");
          }
        }
      });
    }

    function setActive(i) {
      const next = ((i % count) + count) % count;
      if (next === active && !firstRun) return;
      active = next;
      applyLayout(!firstRun);
      options.onChange?.(active, items[active]);
    }

    function measure() {
      const rect = root.getBoundingClientRect();
      const total = vertical ? rect.height : rect.width;
      const usable = Math.max(total - gap * (count - 1), 120);
      const size = Math.max(140, usable * Math.min(Math.max(expandRatio, 0.2), 0.9) * 1.22);
      mediaSize = size;
      root.style.setProperty("--ag-media-size", `${size}px`);
      applyLayout(!firstRun);
    }

    panels.forEach((panel, i) => {
      panel.addEventListener("mouseenter", () => {
        if (trigger === "hover") setActive(i);
      });
      panel.addEventListener("focus", () => setActive(i));
      panel.addEventListener("click", (e) => {
        if (i !== active) {
          e.preventDefault();
          setActive(i);
        }
      });
      panel.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          e.preventDefault();
          setActive(i + 1);
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          e.preventDefault();
          setActive(i - 1);
        }
      });
    });

    const ro = new ResizeObserver(measure);
    ro.observe(root);
    measure();
    firstRun = false;
    options.onChange?.(active, items[active]);

    return {
      destroy() {
        tl?.kill();
        ro.disconnect();
      },
    };
  }

  global.CKMAccordionGallery = { mount };
})(window);
