"use client";

import { useRef, useState } from "react";
import { useTabsPill } from "@/components/ui/motion";
import { pad2 } from "@/lib/data";

/** Numbered chapter links under the Stories hero; the pill follows the last one picked (aria-current, as these are links, not tabs). */
export function StoryIndex({ items }: { items: { href: string; label: string }[] }) {
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLElement>(null);
  useTabsPill(ref, active);
  return (
    <nav className="t-tabs story-tabs" aria-label="Chapters on this page" ref={ref}>
      <span className="t-tabs-pill" aria-hidden="true" />
      {items.map((item, i) => (
        <a className="t-tab" href={item.href} aria-current={i === active ? "true" : undefined} key={item.href} onClick={() => setActive(i)}>
          <span>{pad2(i + 1)}</span>
          {item.label}
        </a>
      ))}
    </nav>
  );
}
