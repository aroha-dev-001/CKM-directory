"use client";

import type { ReactNode } from "react";
import type { PlanInput } from "@/lib/planner/plan";
import { BASES, DAY_CHOICES, INTERESTS, PACES, STAYS, WHENS, type InterestId } from "@/lib/planner/vocab";

/**
 * Five short questions, each answered by tapping. Real radio buttons and
 * checkboxes underneath, so arrow keys, Tab and screen readers all behave
 * as they would on any form. Nothing is required: the defaults already make
 * a sensible two-day plan.
 */
export function PlannerForm({
  draft,
  onChange,
  onSubmit,
  submitLabel,
  pending,
}: {
  draft: PlanInput;
  onChange: (next: PlanInput) => void;
  onSubmit: () => void;
  submitLabel: string;
  /** The answers differ from the route shown below. */
  pending: boolean;
}) {
  const set = <K extends keyof PlanInput>(key: K, value: PlanInput[K]) => onChange({ ...draft, [key]: value });

  const toggleInterest = (id: InterestId) =>
    set("interests", draft.interests.includes(id) ? draft.interests.filter((x) => x !== id) : [...draft.interests, id]);

  return (
    <form
      className="pl-form"
      id="planner"
      aria-labelledby="pl-form-title"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <h2 className="sr-only" id="pl-form-title">
        Plan your trip
      </h2>
      <Question id="days" title="How many days?" hint="Each day is fitted to real driving times.">
        <div className="pl-options pl-options-days">
          {DAY_CHOICES.map((n) => (
            <Choice key={n} type="radio" name="days" value={String(n)} checked={draft.days === n} onChange={() => set("days", n)} className="pl-chip-day">
              <span className="pl-chip-num">{n}</span>
              <span className="pl-chip-sub">{n === 1 ? "day" : "days"}</span>
            </Choice>
          ))}
        </div>
      </Question>

      <Question id="who" title="Who is travelling?" hint="It sets the pace and how hard the walks get.">
        <div className="pl-options pl-options-cards">
          {PACES.map((p) => (
            <Choice key={p.id} type="radio" name="who" value={p.id} checked={draft.pace === p.id} onChange={() => set("pace", p.id)}>
              <span className="pl-chip-label">{p.label}</span>
              <span className="pl-chip-hint">{p.hint}</span>
            </Choice>
          ))}
        </div>
      </Question>

      <Question
        id="love"
        title="What do you want to see?"
        hint={
          draft.interests.length
            ? "Your first pick counts the most. Tap again to remove."
            : "Pick in order of priority, or skip for the district's favourites."
        }
      >
        <div className="pl-options">
          {INTERESTS.map((it) => {
            const order = draft.interests.indexOf(it.id);
            return (
              <Choice key={it.id} type="checkbox" name="love" value={it.id} checked={order >= 0} onChange={() => toggleInterest(it.id)} compact>
                <span className="pl-chip-label">{it.label}</span>
                {order >= 0 ? (
                  <>
                    <span className="pl-chip-order" aria-hidden="true">
                      {order + 1}
                    </span>
                    <span className="sr-only">, priority {order + 1}</span>
                  </>
                ) : null}
              </Choice>
            );
          })}
        </div>
      </Question>

      <Question id="stay" title="Where will you sleep?" hint="Just the town. This companion does not list rooms.">
        <div className="pl-options pl-options-cards">
          {STAYS.map((s) => (
            <Choice key={s.id} type="radio" name="stay" value={s.id} checked={draft.stay === s.id} onChange={() => set("stay", s.id)}>
              <span className="pl-chip-label">{s.label}</span>
              <span className="pl-chip-hint">{s.hint}</span>
            </Choice>
          ))}
        </div>
        <p className="pl-q-sub" id="q-from-label">
          {draft.stay === "base" ? "Base town" : "Starting town"}
        </p>
        <div className="pl-options pl-options-towns" role="radiogroup" aria-labelledby="q-from-label">
          {BASES.map((b) => (
            <Choice key={b.id} type="radio" name="from" value={b.id} checked={draft.base === b.id} onChange={() => set("base", b.id)} compact>
              <span className="pl-chip-label">{b.name}</span>
            </Choice>
          ))}
        </div>
      </Question>

      <Question id="when" title="When are you going?" hint="Places out of season drop down the list.">
        <div className="pl-options">
          {WHENS.map((w) => (
            <Choice key={w.id} type="radio" name="when" value={w.id} checked={draft.when === w.id} onChange={() => set("when", w.id)} compact>
              <span className="pl-chip-label">{w.label}</span>
            </Choice>
          ))}
        </div>
      </Question>

      <div className="pl-submit">
        <button className="btn btn-dark shine pl-submit-btn" type="submit">
          {submitLabel}
        </button>
        <p className="pl-submit-note" aria-live="polite">
          {pending ? "Your answers have changed. Update the route to see them." : ""}
        </p>
      </div>
    </form>
  );
}

function Question({ id, title, hint, children }: { id: string; title: string; hint: string; children: ReactNode }) {
  return (
    <div className="pl-q" role="group" aria-labelledby={`q-${id}-title`} aria-describedby={`q-${id}-hint`}>
      <div className="pl-q-head">
        <h3 className="pl-q-title" id={`q-${id}-title`}>
          {title}
        </h3>
        <p className="pl-q-hint" id={`q-${id}-hint`}>
          {hint}
        </p>
      </div>
      <div className="pl-q-body">{children}</div>
    </div>
  );
}

function Choice({
  type,
  name,
  value,
  checked,
  onChange,
  compact,
  className,
  children,
}: {
  type: "radio" | "checkbox";
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  compact?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`pl-chip${compact ? " pl-chip-compact" : ""}${className ? ` ${className}` : ""}`}>
      <input className="pl-chip-input" type={type} name={name} value={value} checked={checked} onChange={onChange} />
      <span className="pl-chip-face">{children}</span>
    </label>
  );
}
