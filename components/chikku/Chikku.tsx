"use client";

/* Ask Chikku: a page-mascot tiger docked bottom-right. The head follows the
   pointer (on phones it idles through small gestures); a boop blinks, then opens
   a chat that answers Chikkamagaluru questions only. Tiger sheets: page-mascot / koboyo (MIT). */
import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";
import type { Answer } from "@/lib/chikku";
import { prefersReduced, useMediaQuery } from "@/components/ui/motion";
import { BotMessage } from "./BotMessage";

const DIRECTIONS = ["up-left", "up", "up-right", "left", "center", "right", "down-left", "down", "down-right"];
const REACTIONS = ["blink", "heart", "sparkle", "surprised", "wink", "bashful", "sleepy", "dizzy", "delighted"];
const CLOCKWISE = ["right", "down-right", "down", "down-left", "left", "up-left", "up", "up-right"];
const SECTOR = (Math.PI * 2) / CLOCKWISE.length;
const HYSTERESIS = 0.12;
const DEAD_ZONE = 32;
const PAYOFFS = ["heart", "sparkle", "delighted"];
const CHIPS = ["Mullayanagiri", "Bengaluru distance", "2-day sketch", "Hebbe Falls", "Coffee", "Best months", "Sringeri"];
const MOBILE_QUERY = "(max-width: 820px), (hover: none), (pointer: coarse)";

const GREETING: Answer = {
  paras: [
    [
      "Namaskara. I am ",
      { b: "Chikku" },
      ". I answer questions about Chikkamagaluru, peaks, coffee, temples, falls, food and how to reach. Nothing else.",
    ],
  ],
};

type NewMessage = { role: "user"; text: string } | { role: "bot"; answer: Answer };
type Message = NewMessage & { id: number };

/** Background position of cell `index` in a 3×3 sprite sheet. */
function cell(index: number): string {
  const i = Math.max(0, index);
  return `${(i % 3) * 50}% ${Math.floor(i / 3) * 50}%`;
}

function wrapAngle(angle: number): number {
  return Math.atan2(Math.sin(angle), Math.cos(angle));
}

export function Chikku() {
  const mobile = useMediaQuery(MOBILE_QUERY);
  const [open, setOpen] = useState(false);
  const [direction, setDirection] = useState("center");
  const [reaction, setReaction] = useState<string | null>(null);
  const [tilt, setTilt] = useState<"left" | "right" | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");

  const rootRef = useRef<HTMLElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const squashRef = useRef<HTMLSpanElement>(null);
  const mascotRef = useRef<HTMLButtonElement>(null);
  const timers = useRef<number[]>([]);
  const boops = useRef({ count: 0, at: 0 });
  const nextId = useRef(0);

  const later = useCallback((ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

  const clearTimers = useCallback(() => {
    timers.current.splice(0).forEach((id) => window.clearTimeout(id));
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const scrollLog = useCallback(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, []);

  // Desktop: the head turns toward the pointer, one of eight sectors, with a
  // little hysteresis so it does not flicker on a boundary.
  useEffect(() => {
    if (mobile || prefersReduced()) return;
    let sector = -1;
    const onMove = (event: PointerEvent) => {
      const mascot = mascotRef.current;
      if (!mascot) return;
      const box = mascot.getBoundingClientRect();
      const dx = event.clientX - (box.left + box.width / 2);
      const dy = event.clientY - (box.top + box.height / 2);
      if (Math.hypot(dx, dy) < DEAD_ZONE) {
        sector = -1;
        setDirection("center");
        return;
      }
      const angle = Math.atan2(dy, dx);
      if (sector !== -1 && Math.abs(wrapAngle(angle - sector * SECTOR)) < SECTOR / 2 + HYSTERESIS) return;
      sector = (Math.round(angle / SECTOR) + CLOCKWISE.length) % CLOCKWISE.length;
      setDirection(CLOCKWISE[sector]);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [mobile]);

  // Phones: no pointer to follow, so the tiger idles through small gestures.
  useEffect(() => {
    if (!mobile || prefersReduced()) return;
    const flash = (name: string, ms: number) => {
      setReaction(name);
      later(ms, () => setReaction(null));
    };
    const lean = (side: "left" | "right") => {
      setTilt(side);
      later(640, () => setTilt(null));
    };
    const acts = [
      () => flash("blink", 220),
      () => setDirection("left"),
      () => setDirection("center"),
      () => lean("left"),
      () => setDirection("right"),
      () => flash("wink", 280),
      () => setDirection("up-left"),
      () => setDirection("up-right"),
      () => lean("right"),
      () => setDirection("center"),
      () => flash("sleepy", 480),
      () => setDirection("down-left"),
      () => setDirection("down-right"),
      () => setDirection("center"),
    ];
    let i = 0;
    let timer = 0;
    const tick = () => {
      if (document.hidden) {
        timer = window.setTimeout(tick, 1800);
        return;
      }
      setTilt(null);
      acts[i % acts.length]();
      i += 1;
      timer = window.setTimeout(tick, 1500 + Math.floor(Math.random() * 1400));
    };
    timer = window.setTimeout(tick, 500);
    return () => window.clearTimeout(timer);
  }, [mobile, later]);

  const boop = () => {
    clearTimers();
    const now = Date.now();
    const b = boops.current;
    b.count = now - b.at < 1600 ? b.count + 1 : 1;
    b.at = now;
    if (b.count >= 4) {
      b.count = 0;
      setReaction("dizzy");
      later(1100, () => setReaction(null));
    } else {
      const payoff = PAYOFFS[(b.count - 1) % PAYOFFS.length];
      setReaction("blink");
      later(120, () => setReaction(payoff));
      later(560, () => setReaction(null));
    }
    if (!prefersReduced()) {
      squashRef.current?.animate(
        [
          { transform: "scale(1, 1)", easing: "ease-in" },
          { transform: "scale(1.10, 0.86)", offset: 0.18, easing: "ease-out" },
          { transform: "scale(0.95, 1.08)", offset: 0.45 },
          { transform: "scale(1, 1)" },
        ],
        { duration: 420, easing: "linear" }
      );
    }
  };

  const push = (message: NewMessage) => {
    nextId.current += 1;
    const id = nextId.current;
    setMessages((list) => [...list, { ...message, id }]);
  };

  const setOpenState = (next: boolean) => {
    setOpen(next);
    if (next && !messages.length) push({ role: "bot", answer: GREETING });
  };

  // Open: focus the composer (after the sheet slides up on phones).
  useEffect(() => {
    if (!open) return;
    scrollLog();
    const timer = window.setTimeout(() => inputRef.current?.focus({ preventScroll: true }), mobile ? 320 : 0);
    return () => window.clearTimeout(timer);
  }, [open, mobile, scrollLog]);

  // Phones: pin the sheet to the visual viewport so the iOS keyboard cannot push it off screen.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const html = document.documentElement;
    const sheet = open && mobile;
    html.classList.toggle("chikku-sheet-open", sheet);
    const pin = () => {
      const vv = window.visualViewport;
      root.style.top = `${Math.round(vv?.offsetTop ?? 0)}px`;
      root.style.left = `${Math.round(vv?.offsetLeft ?? 0)}px`;
      root.style.width = `${Math.round(vv?.width ?? window.innerWidth)}px`;
      root.style.height = `${Math.round(vv?.height ?? window.innerHeight)}px`;
      root.style.right = "auto";
      root.style.bottom = "auto";
    };
    if (!sheet) return;
    pin();
    window.visualViewport?.addEventListener("resize", pin);
    window.visualViewport?.addEventListener("scroll", pin);
    window.addEventListener("resize", pin);
    return () => {
      html.classList.remove("chikku-sheet-open");
      window.visualViewport?.removeEventListener("resize", pin);
      window.visualViewport?.removeEventListener("scroll", pin);
      window.removeEventListener("resize", pin);
      for (const prop of ["top", "left", "width", "height", "right", "bottom"] as const) root.style[prop] = "";
    };
  }, [open, mobile]);

  const ask = async (text: string) => {
    const q = text.trim();
    if (!q) return;
    push({ role: "user", text: q });
    setDraft("");
    // The answer engine (and the place catalogue it reads) loads on the first question.
    const { answer } = await import("@/lib/chikku");
    const out = answer(q);
    push({ role: "bot", answer: out });
    setReaction(out.refuse ? "surprised" : "delighted");
    later(700, () => setReaction(null));
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void ask(draft);
  };

  return (
    <aside id="chikku" className={`chikku${open ? " is-open" : ""}`} ref={rootRef}>
      <button className="chikku-scrim" type="button" aria-label="Close Ask Chikku" onClick={() => setOpenState(false)} />
      <div className="chikku-panel" id="chikku-panel" role="dialog" aria-modal="true" aria-labelledby="chikku-title" hidden={!open}>
        <div className="chikku-head">
          <div className="chikku-head-copy">
            <span className="chikku-head-face" aria-hidden="true">
              <span className="chikku-sheet is-dir" />
            </span>
            <div>
              <h2 id="chikku-title">Ask Chikku</h2>
              <p>Chikkamagaluru only</p>
            </div>
          </div>
          <button className="chikku-x" type="button" aria-label="Close Ask Chikku" onClick={() => setOpenState(false)}>
            ×
          </button>
        </div>
        <div className="chikku-log" id="chikku-log" aria-live="polite" ref={logRef}>
          {messages.map((m) =>
            m.role === "user" ? (
              <div className="chikku-msg is-user" key={m.id}>
                <p>{m.text}</p>
              </div>
            ) : (
              <BotMessage key={m.id} answer={m.answer} onGrow={scrollLog} />
            )
          )}
        </div>
        <div className="chikku-composer">
          <div className="chikku-chips" id="chikku-chips">
            {CHIPS.map((chip) => (
              <button className="chikku-chip" type="button" key={chip} onClick={() => void ask(chip)}>
                {chip}
              </button>
            ))}
          </div>
          <form className="chikku-form" id="chikku-form" onSubmit={onSubmit}>
            <label className="sr-only" htmlFor="chikku-q">
              Ask Chikku
            </label>
            <input
              ref={inputRef}
              id="chikku-q"
              name="q"
              type="text"
              inputMode="search"
              enterKeyHint="send"
              maxLength={240}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="sentences"
              placeholder="Ask about this district…"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
            <button type="submit">Ask</button>
          </form>
        </div>
      </div>
      <div className="chikku-dock">
        <button
          ref={mascotRef}
          className="chikku-mascot"
          type="button"
          id="chikku-mascot"
          aria-expanded={open}
          aria-controls="chikku-panel"
          aria-label="Boop Chikku, open Ask Chikku"
          onClick={() => {
            boop();
            setOpenState(!open);
          }}
        >
          <span
            className={`chikku-squash${tilt ? ` is-tilt-${tilt}` : ""}`}
            id="chikku-squash"
            ref={squashRef}
          >
            <span
              className={`chikku-sheet is-dir${reaction ? " is-off" : ""}`}
              id="chikku-dir"
              style={{ backgroundPosition: cell(DIRECTIONS.indexOf(direction)) }}
            />
            <span
              className={`chikku-sheet is-react${reaction ? " is-on" : ""}`}
              id="chikku-react"
              style={{ backgroundPosition: cell(REACTIONS.indexOf(reaction || "blink")) }}
            />
          </span>
        </button>
        {/* The name tag is a larger tap target for the same action; the mascot button is the accessible control. */}
        <p
          className="chikku-tag"
          id="chikku-tag"
          onClick={() => {
            boop();
            setOpenState(true);
          }}
        >
          Chikku
        </p>
      </div>
    </aside>
  );
}
