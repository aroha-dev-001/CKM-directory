"use client";

import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { QuerySync } from "@/components/site/QuerySync";
import { prefersReduced } from "@/components/ui/motion";
import { buildPlan, type Plan, type PlanInput } from "@/lib/planner/plan";
import { DEFAULT_INPUT, inputFromParams, paramsFromInput, sameInput } from "@/lib/planner/query";
import { formatKm } from "@/lib/planner/route";
import { baseById, seasonFor, WHENS } from "@/lib/planner/vocab";
import { DayPlan } from "./DayPlan";
import { IconLink } from "./icons";
import { PlannerForm } from "./PlannerForm";

const scrollBehavior = (): ScrollBehavior => (prefersReduced() ? "auto" : "smooth");

/**
 * The planner lives in the URL. Submitting pushes the answers into the query
 * string; the query string, read back through QuerySync, is the only thing
 * that produces a plan. So a shared link, a reload and the back button all
 * land on exactly the same route, and the page prerenders as plain HTML.
 */
export function TripPlanner() {
  const [applied, setApplied] = useState<PlanInput | null>(null);
  const [draft, setDraft] = useState<PlanInput>(DEFAULT_INPUT);
  const [copied, setCopied] = useState<"" | "done" | "failed">("");
  const results = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const reveal = useRef<"" | "scroll" | "focus">("");

  const onQuery = useCallback((params: URLSearchParams) => {
    const next = inputFromParams(params);
    setApplied((prev) => (prev && next && sameInput(prev, next) ? prev : next));
    if (next) {
      setDraft(next);
      if (!reveal.current) reveal.current = "scroll";
    } else {
      setDraft(DEFAULT_INPUT);
    }
  }, []);

  const plan = useMemo(() => (applied ? buildPlan(applied) : null), [applied]);
  const planKey = applied ? paramsFromInput(applied) : "";

  /** `asked`: the visitor pressed the button, so glide there and move focus. */
  const showResults = useCallback((asked: boolean) => {
    results.current?.scrollIntoView({ behavior: asked ? scrollBehavior() : "auto", block: "start" });
    if (asked) heading.current?.focus({ preventScroll: true });
  }, []);

  // Once a new plan has rendered, bring it into view: a jump for a shared
  // link or the back button, a glide plus focus when the visitor asked.
  useEffect(() => {
    if (!plan || !reveal.current) return;
    const asked = reveal.current === "focus";
    reveal.current = "";
    showResults(asked);
  }, [plan, showResults]);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(""), 2600);
    return () => window.clearTimeout(timer);
  }, [copied]);

  function submit() {
    if (applied && sameInput(applied, draft)) {
      showResults(true);
      return;
    }
    reveal.current = "focus";
    window.history.pushState(null, "", `${window.location.pathname}?${paramsFromInput(draft)}`);
  }

  function startOver() {
    window.history.pushState(null, "", window.location.pathname);
    document.getElementById("planner")?.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied("done");
    } catch {
      setCopied("failed");
    }
  }

  const pending = Boolean(applied && !sameInput(applied, draft));

  return (
    <>
      <QuerySync onChange={onQuery} />
      <section className="pl-planner" aria-label="Trip planner">
        <div className="wrap">
          <PlannerForm
            draft={draft}
            onChange={setDraft}
            onSubmit={submit}
            pending={pending}
            submitLabel={applied ? (pending ? "Update my route" : "Show my route") : "Plan my route"}
          />
        </div>
      </section>

      {plan && applied ? (
        <section className="pl-results" ref={results} aria-labelledby="pl-results-title">
          <div className="wrap">
            <header className="pl-results-head">
              <div>
                <h2 id="pl-results-title" ref={heading} tabIndex={-1}>
                  {plan.days.length ? `Your ${plan.days.length}-day route` : "No route fits those answers"}
                </h2>
                {plan.days.length ? <p className="pl-results-sub">{summary(plan, applied)}</p> : null}
              </div>
              <div className="pl-results-tools">
                <button className="btn btn-line" type="button" onClick={copyLink}>
                  <IconLink />
                  {copied === "done" ? "Link copied" : "Copy link to this route"}
                </button>
                <button className="btn btn-line" type="button" onClick={startOver}>
                  Start over
                </button>
                <p className="sr-only" aria-live="polite">
                  {copied === "done" ? "Link copied." : copied === "failed" ? "Could not copy. Copy the address from the browser bar instead." : ""}
                </p>
              </div>
            </header>
            {copied === "failed" ? (
              <p className="pl-note pl-note-warn">Could not copy the link. Copy the address from the browser bar instead.</p>
            ) : null}

            {plan.days.length ? (
              <>
                <Notes plan={plan} input={applied} />
                <nav className="pl-overview" aria-label="Days at a glance">
                  <ol>
                    {plan.days.map((d) => (
                      <li key={d.day}>
                        <a href={`#day-${d.day}`}>
                          <span className="pl-ov-day">Day {d.day}</span>
                          <span className="pl-ov-title">{d.title}</span>
                          <span className="pl-ov-route">
                            {[d.start.label, ...d.stops.map((s) => s.place.name), ...(d.end ? [d.end.label] : [])].join(" → ")}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
                <div className="pl-days">
                  {plan.days.map((d, i) => (
                    <DayPlan key={`${planKey}-${d.day}`} day={d} isLastDay={i === plan.days.length - 1} stay={applied.stay} />
                  ))}
                </div>
                <p className="pl-disclaimer">
                  Drive times come from Google Maps once a day&apos;s map has loaded, and are estimates until then. Opening hours,
                  jeep tracks, forest permits and monsoon closures change, so check locally before you set out. This companion does
                  not book rooms, vehicles or tickets.
                </p>
              </>
            ) : (
              <p className="pl-note">
                Nothing on the list fits a day from {baseById(applied.base).name} at this pace. Try another base town, add an
                interest, or choose a different group.
              </p>
            )}
          </div>
        </section>
      ) : null}
    </>
  );
}

function summary(plan: Plan, input: PlanInput): string {
  const base = baseById(input.base).name;
  const stops = plan.days.reduce((sum, d) => sum + d.stops.length, 0);
  const km = plan.days.reduce((sum, d) => sum + d.legs.reduce((a, l) => a + l.km, 0), 0);
  const where = input.stay === "base" ? `From ${base} and back each evening.` : `Starting in ${base} and moving on each night.`;
  return `${where} ${stops} ${stops === 1 ? "place" : "places"}, about ${formatKm(km)} of driving in all.`;
}

function Notes({ plan, input }: { plan: Plan; input: PlanInput }) {
  const season = seasonFor(input.when);
  const months = WHENS.find((w) => w.id === input.when)?.label;
  const notes: { key: string; warn?: boolean; body: ReactNode }[] = [];

  if (season) {
    notes.push({
      key: "season",
      body: (
        <>
          <strong>
            {months}: {season.title.toLowerCase()}.
          </strong>{" "}
          {season.watch}
        </>
      ),
    });
  }
  if (plan.days.length < input.days) {
    notes.push({
      key: "short",
      warn: true,
      body: (
        <>
          <strong>
            Your answers fill {plan.days.length} of {input.days} days.
          </strong>{" "}
          Add another interest or pick a different base town to plan the rest.
        </>
      ),
    });
  }
  if (plan.toppedUp) {
    notes.push({
      key: "fill",
      body: "Fewer places matched your interests than the trip has room for, so a few district favourites fill the gaps. Their cards say so.",
    });
  }
  if (plan.tooLong.length) {
    notes.push({
      key: "long",
      body: (
        <>
          Left out as longer than a day at this pace: {plan.tooLong.map((p) => p.name).join(", ")}. Plan those separately, with a
          local guide.
        </>
      ),
    });
  }
  if (plan.effortCapped) {
    notes.push({ key: "effort", body: "Some strenuous climbs are left out to suit this group's pace." });
  }
  if (!notes.length) return null;

  return (
    <ul className="pl-notes">
      {notes.map((n) => (
        <li key={n.key} className={n.warn ? "pl-note pl-note-warn" : "pl-note"}>
          {n.body}
        </li>
      ))}
    </ul>
  );
}
