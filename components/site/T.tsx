"use client";

import { t } from "@/lib/data";
import { useLang } from "@/lib/lang";
import type { Lang } from "@/lib/types";

/** A translated UI string from data/ckm.json `i18n`, for use inside server components. */
export function T({ k }: { k: string }) {
  return <>{t(useLang(), k)}</>;
}

/** Picks the English or Kannada copy, for use inside server components. */
export function Bi({ en, kn }: { en: string; kn: string }) {
  const lang: Lang = useLang();
  return <>{lang === "kn" ? kn : en}</>;
}
