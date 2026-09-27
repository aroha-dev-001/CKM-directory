"use client";

import { useState } from "react";
import { AccChevron } from "@/components/ui/chevrons";

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="t-acc faq-item" data-open={open}>
      <button className="t-acc-head" type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        {q}
        <AccChevron />
      </button>
      <div className="t-acc-panel">
        <div className="t-acc-panel-inner">
          <p>{a}</p>
        </div>
      </div>
    </div>
  );
}

/** Visitor questions as a transitions.dev accordion; each answer opens on its own. */
export function FaqList({ faqs }: { faqs: { q: string; a: string }[] }) {
  return (
    <div className="faq-list">
      {faqs.map((f) => (
        <FaqItem key={f.q} q={f.q} a={f.a} />
      ))}
    </div>
  );
}
