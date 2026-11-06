"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { t } from "@/lib/data";
import { useLang } from "@/lib/lang";
import { DEFAULT_INPUT, paramsFromInput } from "@/lib/planner/query";
import { DAY_CHOICES, INTERESTS, type InterestId } from "@/lib/planner/vocab";

/* Once dismissed, or once the visitor has reached the planner, the popup is
   done for good: from then on the header button is the way in. */
const KEY = "ckm-plan-nudge";
// Fallback for browsers that refuse storage, so a dismissal holds on this page.
let memory = false;

function settled(): boolean {
  try {
    return memory || localStorage.getItem(KEY) === "done";
  } catch {
    return memory;
  }
}

function settle() {
  memory = true;
  try {
    localStorage.setItem(KEY, "done");
  } catch {
    // Storage blocked: `memory` carries the choice for this page.
  }
}

/** The planner's labels are too long for a corner card. */
const SHORT: Record<InterestId, string> = {
  peaks: "Peaks",
  waterfalls: "Waterfalls",
  temples: "Temples",
  coffee: "Coffee",
  lakes: "Lakes",
  wildlife: "Wildlife",
  treks: "Treks",
};

/** Scrolled this far (in viewport heights) means the visitor is browsing, not landing. */
const AFTER = 0.8;

/** Nudge the header button in the corner of the eye after a dismissal. */
function pointAtHeaderButton() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  document.querySelector(".header-plan")?.animate(
    [
      { boxShadow: "0 0 0 0 rgba(200, 174, 110, 0.75)" },
      { boxShadow: "0 0 0 10px rgba(200, 174, 110, 0)" },
    ],
    { duration: 900, iterations: 2, easing: "ease-out" }
  );
}

/**
 * A corner card that appears once the visitor scrolls into the page: pick the
 * days and interests here and land on /plan with that route already drawn.
 */
export function PlanNudge() {
  const lang = useLang();
  const pathname = usePathname();
  const onPlanner = pathname === "/plan" || pathname.startsWith("/plan/");
  const [phase, setPhase] = useState<"waiting" | "open" | "closed">("waiting");
  const [days, setDays] = useState(DEFAULT_INPUT.days);
  const [love, setLove] = useState<InterestId[]>([]);

  // Arriving on the planner, from this card or the header, closes it.
  if (onPlanner && phase === "open") setPhase("closed");

  useEffect(() => {
    if (onPlanner) settle();
  }, [onPlanner]);

  useEffect(() => {
    if (phase !== "waiting" || onPlanner || settled()) return;
    const onScroll = () => {
      if (window.scrollY > window.innerHeight * AFTER) setPhase("open");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [phase, onPlanner]);

  if (phase === "waiting") return null;

  const toggle = (id: InterestId) => setLove((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id]));
  const href = `/plan?${paramsFromInput({ ...DEFAULT_INPUT, days, interests: love })}`;

  function dismiss() {
    settle();
    setPhase("closed");
    pointAtHeaderButton();
  }

  return (
    <aside className="plan-nudge" data-state={phase} inert={phase === "closed"} aria-labelledby="plan-nudge-title">
      <h2 className="plan-nudge-title" id="plan-nudge-title">
        {t(lang, "plan_cta_hint")}
      </h2>
      <p className="plan-nudge-text">{t(lang, "nudge_text")}</p>

      <fieldset className="plan-nudge-group">
        <legend>{t(lang, "nudge_days")}</legend>
        <div className="plan-nudge-chips">
          {DAY_CHOICES.map((n) => (
            <label className="plan-nudge-chip is-day" key={n}>
              <input type="radio" name="plan-nudge-days" value={n} checked={days === n} onChange={() => setDays(n)} />
              <span>{n}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="plan-nudge-group">
        <legend>{t(lang, "nudge_love")}</legend>
        <div className="plan-nudge-chips is-scroll">
          {INTERESTS.map((i) => (
            <label className="plan-nudge-chip" key={i.id} title={i.label}>
              <input type="checkbox" value={i.id} checked={love.includes(i.id)} onChange={() => toggle(i.id)} />
              <span>{SHORT[i.id]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="plan-nudge-actions">
        <Link className="plan-nudge-go" href={href}>
          {t(lang, "plan_cta")} <span aria-hidden="true">→</span>
        </Link>
        <button className="plan-nudge-dismiss" type="button" onClick={dismiss}>
          {t(lang, "dismiss")}
        </button>
      </div>
    </aside>
  );
}
