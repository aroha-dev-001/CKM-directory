"use client";

import { useSyncExternalStore } from "react";
import type { Lang } from "./types";

/* The reader's language lives in localStorage under the same key the
   Bean to cup walk reads, so a choice made on one page follows to the other. */
const KEY = "ckm-lang";
const listeners = new Set<() => void>();
// Fallback for browsers that refuse storage, so the toggle still works on this page.
let memory: Lang | null = null;

function read(): Lang {
  try {
    const stored = localStorage.getItem(KEY);
    if (stored === "kn" || stored === "en") return stored;
  } catch {
    // Storage blocked: fall through to the in-memory choice.
  }
  return memory ?? "en";
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY) onChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function setLang(lang: Lang) {
  memory = lang;
  try {
    localStorage.setItem(KEY, lang);
  } catch {
    // Storage blocked: `memory` carries the choice for this page.
  }
  listeners.forEach((fn) => fn());
}

/** Static HTML is English; the stored choice applies once the page hydrates. */
export function useLang(): Lang {
  return useSyncExternalStore(subscribe, read, () => "en");
}
