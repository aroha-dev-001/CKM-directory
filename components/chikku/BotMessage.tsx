"use client";

import Link from "next/link";
import { Fragment, type ReactNode, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Answer, Segment } from "@/lib/chikku";
import { prefersReduced } from "@/components/ui/motion";

/**
 * One word of a streamed answer. It mounts hidden (`is-wait`), is revealed at
 * opacity 0, and gains `is-in` after a forced reflow so the transitions.dev
 * cross-blur actually runs instead of snapping in.
 */
function StreamWord({ text, visible }: { text: string; visible: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!visible || !el) return;
    void el.offsetWidth;
    el.classList.add("is-in");
  }, [visible]);
  return (
    <span ref={ref} className={`t-stream-w${visible ? "" : " is-wait"}`}>
      {text}
    </span>
  );
}

function segmentText(segment: Segment): string {
  return typeof segment === "string" ? segment : "b" in segment ? segment.b : segment.a;
}

/** A Chikku answer, streamed word by word at the page's --stream-gap. */
export function BotMessage({ answer, onGrow }: { answer: Answer; onGrow: () => void }) {
  const total = useMemo(
    () => answer.paras.flat().reduce((n, seg) => n + segmentText(seg).split(/\s+/).filter(Boolean).length, 0),
    [answer]
  );
  const [shown, setShown] = useState(() => (prefersReduced() ? total : 0));

  useEffect(() => {
    if (shown >= total) return;
    const gap = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--stream-gap")) || 60;
    const timer = window.setTimeout(() => setShown((n) => n + 1), shown === 0 ? 0 : gap);
    return () => window.clearTimeout(timer);
  }, [shown, total]);

  useEffect(() => onGrow(), [shown, onGrow]);

  let index = 0;
  const words = (text: string): ReactNode[] =>
    text.split(/(\s+)/).map((part, i) => {
      if (!part) return null;
      if (/^\s+$/.test(part)) return part;
      const n = index++;
      return <StreamWord key={i} text={part} visible={n < shown} />;
    });

  return (
    <div className={`chikku-msg is-bot t-stream${answer.refuse ? " is-refuse" : ""}`}>
      {answer.paras.map((para, p) => {
        const first = index;
        const body = para.map((segment, s) => {
          if (typeof segment === "string") return <Fragment key={s}>{words(segment)}</Fragment>;
          if ("b" in segment) return <strong key={s}>{words(segment.b)}</strong>;
          return (
            <Link key={s} href={segment.href}>
              {words(segment.a)}
            </Link>
          );
        });
        // A paragraph appears with its first word, as in the original stream.
        return (
          <p key={p} className={first < shown && index > first ? "is-live" : undefined}>
            {body}
          </p>
        );
      })}
    </div>
  );
}
