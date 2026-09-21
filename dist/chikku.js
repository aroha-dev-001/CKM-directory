/* Ask Chikku: page-mascot tiger + district-only answers from this companion. */
(function () {
  "use strict";

  const DIRECTIONS = ["up-left", "up", "up-right", "left", "center", "right", "down-left", "down", "down-right"];
  const REACTIONS = ["blink", "heart", "sparkle", "surprised", "wink", "bashful", "sleepy", "dizzy", "delighted"];
  const CLOCKWISE = ["right", "down-right", "down", "down-left", "left", "up-left", "up", "up-right"];
  const SECTOR = (Math.PI * 2) / CLOCKWISE.length;
  const HYSTERESIS = 0.12;
  const DEAD_ZONE = 70;
  const PAYOFFS = ["heart", "sparkle", "delighted"];
  const CHIPS = ["Mullayanagiri", "How to reach", "Hebbe Falls", "Coffee", "Best months", "Sringeri"];

  const ON_TOPIC =
    /\b(chikka?magalur[ua]?|chikku|malnad|malanadu|karnataka coffee|baba budan|mullayanagiri|kemman|hebbe|sringeri|horanadu|kudremukh|bhadra|datta peetha|jhari|z[\s-]?point|charmadi|ayyanakere|hirekolale|kalasa|koppa|mudigere|kadur|tarikere|nr[\s.]?pura|ajjampura|western ghats|ghat|waterfall|temple|peak|trek|hill station|coffee|davara|filter coffee|permit|forest|shola|hoysala|taluk|monsoon|when to (go|visit)|how to (reach|go)|best time|food|neer dosa|akki|pathrode)\b/i;
  const OFF_TOPIC =
    /\b(python|javascript|react|bitcoin|crypto|stock market|ipl|premier league|netflix|iphone|android|recipe for pasta|capital of france|who is messi|taylor swift|chatgpt prompt|write (me )?code|homework)\b/i;

  const GREET = /^(hi|hello|hey|yo|namaste|namaskara|vanakkam)\b/i;

  function cell(index) {
    const i = Math.max(0, index);
    return `${(i % 3) * 50}% ${Math.floor(i / 3) * 50}%`;
  }

  function wrap(angle) {
    return Math.atan2(Math.sin(angle), Math.cos(angle));
  }

  function fold(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[’']/g, "")
      .replace(/[^a-z0-9\u0c80-\u0cff]+/g, " ")
      .trim();
  }

  function tokens(value) {
    return fold(value)
      .split(/\s+/)
      .filter((w) => w && w.length > 2 && !/^(the|and|for|from|with|what|where|when|how|best|tell|about)$/.test(w));
  }

  function esc(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function dataReady() {
    if (window.CKM) return Promise.resolve(window.CKM);
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "data.js?v=sage24";
      s.onload = () => resolve(window.CKM);
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function scorePlace(place, qTokens, raw) {
    const hay = fold([place.name, place.kannada, place.id, place.taluk, place.blurb, ...(place.tags || [])].join(" "));
    let score = 0;
    qTokens.forEach((t) => {
      if (hay.includes(t)) score += t.length > 5 ? 3 : 2;
    });
    if (fold(place.name).includes(raw) || fold(place.id.replace(/-/g, " ")).includes(raw)) score += 8;
    return score;
  }

  function placeAnswer(place) {
    const href = `places.html?id=${encodeURIComponent(place.id)}`;
    const bits = [
      `<p><strong>${esc(place.name)}</strong> sits in ${esc(place.taluk)} taluk${place.elevation ? `, ${esc(place.elevation)}` : ""}.</p>`,
      `<p>${esc(place.summary || place.blurb || "")}</p>`,
    ];
    if (place.visit) bits.push(`<p>${esc(place.visit)}</p>`);
    if (place.bestTime) bits.push(`<p>Typical visiting window named here: ${esc(place.bestTime)}. Confirm on the ground.</p>`);
    bits.push(`<p><a href="${esc(href)}">Open this place</a></p>`);
    return bits.join("");
  }

  function blockAnswer(title, items) {
    const rows = (items || [])
      .slice(0, 3)
      .map((item) => `<p><strong>${esc(item.title)}</strong> ${esc(item.text)}</p>`)
      .join("");
    return `<p><strong>${esc(title)}</strong></p>${rows}`;
  }

  function refuse() {
    return {
      refuse: true,
      html: "<p>I only talk about Chikkamagaluru. Ask me about peaks, coffee, temples, falls, food, seasons, or how to reach this district. I will not answer anything outside that.</p>",
    };
  }

  function inDistrict(q, qTokens, ckm) {
    if (OFF_TOPIC.test(q) && !ON_TOPIC.test(q)) return false;
    if (GREET.test(q) || ON_TOPIC.test(q)) return true;
    if ((ckm.destinations || []).some((p) => scorePlace(p, qTokens, fold(q)) >= 4)) return true;
    if ((ckm.malnadFoods || []).some((d) => fold(d.name + " " + d.id).split(/\s+/).some((t) => qTokens.includes(t)))) return true;
    if (qTokens.length <= 2 && /^(help|hi|hello)$/.test(fold(q))) return true;
    return ON_TOPIC.test(q);
  }

  function answer(raw, ckm) {
    const q = String(raw || "").trim();
    const qTokens = tokens(q);
    if (!q) return { html: "<p>Ask me a Chikkamagaluru question.</p>" };
    if (!inDistrict(q, qTokens, ckm)) return refuse();

    if (GREET.test(q) && qTokens.length < 3) {
      return {
        html: "<p>Namaskara. I am <strong>Chikku</strong>, the companion tiger for this district. Ask about Mullayanagiri, coffee, Hebbe, Sringeri, seasons, or how to reach Chikkamagaluru. I stay on this map.</p>",
      };
    }

    if (/\b(who are you|your name|what are you)\b/i.test(q)) {
      return {
        html: "<p>I am Ask Chikku. I read this independent companion, not a booking desk and not a government counter. I answer only Chikkamagaluru questions.</p>",
      };
    }

    if (/\b(hotel|homestay|resort|book a room|airbnb|stay options)\b/i.test(q)) {
      return {
        html: "<p>This companion does not sell rooms or list homestays. For hill air, read Kemmanagundi on the Hill air page. For a bed, use official or on-the-ground sources, not me.</p><p><a href=\"stay.html\">Open Hill air</a></p>",
      };
    }

    if (/\b(fee|ticket price|how much)\b/i.test(q)) {
      return {
        html: "<p>I do not quote fees. Permits, jeeps and garden tickets change. Check the district tourism page or the forest counter that day.</p><p><a href=\"visit.html\">Visitor notes</a></p>",
      };
    }

    const scored = (ckm.destinations || [])
      .map((p) => ({ p, s: scorePlace(p, qTokens, fold(q)) }))
      .filter((row) => row.s >= 4)
      .sort((a, b) => b.s - a.s);
    if (scored[0] && scored[0].s >= 5) {
      return { html: placeAnswer(scored[0].p) };
    }

    if (/\b(coffee|mocha|baba budan|davara|bean to cup|arabica)\b/i.test(q)) {
      return {
        html: "<p>Coffee did not arrive here as a cup. Lore says Baba Budan brought seven Mocha seeds to this ridge. Shade, cherry, roast, filter, davara is the walk this companion tells. Not a shop.</p><p><a href=\"bean-to-cup.html\">Bean to cup</a> · <a href=\"coffee.html\">Coffee chapter</a></p>",
      };
    }

    if (/\b(best time|when to (go|visit)|season|monsoon|winter|weather)\b/i.test(q)) {
      const seasons = ckm.seasons || [];
      const html = seasons
        .slice(0, 4)
        .map((s) => `<p><strong>${esc(s.title)}</strong> (${esc(s.months)}). ${esc(s.text)}</p>`)
        .join("");
      return { html: html || "<p>Winter ridges are the classic window. Confirm weather on the day.</p>" };
    }

    if (/\b(how to (reach|go)|get there|from bangalore|from bengaluru|train|airport|ksrtc)\b/i.test(q)) {
      const access = ckm.essentials && ckm.essentials.access;
      return { html: blockAnswer(access ? access.title : "How to arrive", access ? access.items : []) + '<p><a href="visit.html">Visitor information</a></p>' };
    }

    if (/\b(permit|safari|kudremukh|bhadra tiger|forest)\b/i.test(q)) {
      const permits = ckm.essentials && ckm.essentials.permits;
      return { html: blockAnswer(permits ? permits.title : "Permits", permits ? permits.items : []) + '<p><a href="visit.html">Visitor information</a></p>' };
    }

    if (/\b(food|eat|dosa|akki|pathrode|kadubu|cuisine|kitchen)\b/i.test(q)) {
      const dishes = (ckm.malnadFoods || []).slice(0, 4);
      const rows = dishes.map((d) => `<p><strong>${esc(d.name)}</strong>. ${esc((d.story || "").split(". ").slice(0, 2).join(". "))}.</p>`).join("");
      return { html: `<p>Malnad cooking is rice-first, not a restaurant list.</p>${rows}<p><a href="food.html">Food hub</a></p>` };
    }

    if (scored[0]) return { html: placeAnswer(scored[0].p) };

    return {
      html: "<p>That still sounds like this district, but I need a place or a topic I hold: a peak, a fall, a temple, coffee, food, a season, or how to reach Chikkamagaluru.</p>",
    };
  }

  function mount() {
    if (document.getElementById("chikku")) return;
    const root = document.createElement("aside");
    root.id = "chikku";
    root.className = "chikku";
    root.innerHTML = `
      <div class="chikku-panel" id="chikku-panel" role="dialog" aria-labelledby="chikku-title" hidden>
        <div class="chikku-head">
          <div>
            <h2 id="chikku-title">Ask Chikku</h2>
            <p>Chikkamagaluru only</p>
          </div>
          <button class="chikku-x" type="button" data-chikku-close aria-label="Close Ask Chikku">×</button>
        </div>
        <div class="chikku-log" id="chikku-log" aria-live="polite"></div>
        <div class="chikku-chips" id="chikku-chips"></div>
        <form class="chikku-form" id="chikku-form">
          <label class="sr-only" for="chikku-q">Ask Chikku</label>
          <input id="chikku-q" name="q" type="text" maxlength="240" autocomplete="off" placeholder="Ask about this district…" />
          <button type="submit">Ask</button>
        </form>
      </div>
      <div class="chikku-dock">
        <p class="chikku-tag">Ask Chikku</p>
        <button class="chikku-mascot" type="button" id="chikku-mascot" aria-expanded="false" aria-controls="chikku-panel" aria-label="Boop Chikku, open Ask Chikku">
          <span class="chikku-squash" id="chikku-squash">
            <span class="chikku-sheet is-dir" id="chikku-dir"></span>
            <span class="chikku-sheet is-react" id="chikku-react"></span>
          </span>
        </button>
      </div>
    `;
    document.body.appendChild(root);

    const panel = root.querySelector("#chikku-panel");
    const log = root.querySelector("#chikku-log");
    const form = root.querySelector("#chikku-form");
    const input = root.querySelector("#chikku-q");
    const mascot = root.querySelector("#chikku-mascot");
    const dirEl = root.querySelector("#chikku-dir");
    const reactEl = root.querySelector("#chikku-react");
    const squash = root.querySelector("#chikku-squash");
    const chips = root.querySelector("#chikku-chips");

    chips.innerHTML = CHIPS.map((c) => `<button class="chikku-chip" type="button" data-chip="${esc(c)}">${esc(c)}</button>`).join("");

    let direction = "center";
    let reaction = null;
    let sector = -1;
    let pointer = null;
    let open = false;
    const timers = [];
    const boops = { count: 0, at: 0 };
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    function setDir(name) {
      direction = name;
      dirEl.style.backgroundPosition = cell(DIRECTIONS.indexOf(name));
    }
    function setReact(name) {
      reaction = name;
      const on = Boolean(name);
      reactEl.classList.toggle("is-on", on);
      dirEl.classList.toggle("is-off", on);
      reactEl.style.backgroundPosition = cell(REACTIONS.indexOf(name || "blink"));
    }
    setDir("center");
    setReact(null);

    function later(ms, fn) {
      timers.push(window.setTimeout(fn, ms));
    }
    function clearTimers() {
      timers.splice(0).forEach(clearTimeout);
    }

    function boop() {
      clearTimers();
      const now = Date.now();
      boops.count = now - boops.at < 1600 ? boops.count + 1 : 1;
      boops.at = now;
      if (boops.count >= 4) {
        boops.count = 0;
        setReact("dizzy");
        later(1100, () => setReact(null));
      } else {
        setReact("blink");
        later(120, () => setReact(PAYOFFS[(boops.count - 1) % PAYOFFS.length]));
        later(560, () => setReact(null));
      }
      if (!reduced && squash.animate) {
        squash.animate(
          [
            { transform: "scale(1, 1)", easing: "ease-in" },
            { transform: "scale(1.10, 0.86)", offset: 0.18, easing: "ease-out" },
            { transform: "scale(0.95, 1.08)", offset: 0.45 },
            { transform: "scale(1, 1)" },
          ],
          { duration: 420, easing: "linear" }
        );
      }
    }

    function aim() {
      if (!pointer) return;
      const box = mascot.getBoundingClientRect();
      const dx = pointer.x - (box.left + box.width / 2);
      const dy = pointer.y - (box.top + box.height / 2);
      if (Math.hypot(dx, dy) < DEAD_ZONE) {
        sector = -1;
        setDir("center");
        return;
      }
      const angle = Math.atan2(dy, dx);
      if (sector !== -1 && Math.abs(wrap(angle - sector * SECTOR)) < SECTOR / 2 + HYSTERESIS) return;
      sector = (Math.round(angle / SECTOR) + CLOCKWISE.length) % CLOCKWISE.length;
      setDir(CLOCKWISE[sector]);
    }

    if (fine && !reduced) {
      window.addEventListener("pointermove", (event) => {
        pointer = { x: event.clientX, y: event.clientY };
        aim();
      }, { passive: true });
      window.addEventListener("scroll", aim, { passive: true });
    }

    function push(role, html, extra) {
      const div = document.createElement("div");
      div.className = `chikku-msg is-${role}${extra ? ` ${extra}` : ""}`;
      div.innerHTML = html;
      log.appendChild(div);
      log.scrollTop = log.scrollHeight;
    }

    function setOpen(next) {
      open = next;
      root.classList.toggle("is-open", open);
      panel.hidden = !open;
      mascot.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) {
        if (!log.children.length) {
          push(
            "bot",
            "<p>Namaskara. I am <strong>Chikku</strong>. I answer questions about Chikkamagaluru, peaks, coffee, temples, falls, food and how to reach. Nothing else.</p>"
          );
        }
        input.focus();
      }
    }

    async function ask(text) {
      const q = String(text || "").trim();
      if (!q) return;
      push("user", `<p>${esc(q)}</p>`);
      input.value = "";
      try {
        const ckm = await dataReady();
        const out = answer(q, ckm || {});
        push("bot", out.html, out.refuse ? "is-refuse" : "");
        setReact(out.refuse ? "surprised" : "delighted");
        later(700, () => setReact(null));
      } catch (err) {
        push("bot", "<p>I could not open the companion notes just then. Try again.</p>", "is-refuse");
      }
    }

    mascot.addEventListener("click", () => {
      boop();
      setOpen(!open);
    });
    root.querySelector("[data-chikku-close]").addEventListener("click", () => setOpen(false));
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      ask(input.value);
    });
    chips.addEventListener("click", (event) => {
      const chip = event.target.closest("[data-chip]");
      if (chip) ask(chip.getAttribute("data-chip"));
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
