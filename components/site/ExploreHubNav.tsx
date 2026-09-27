"use client";

import Link from "next/link";
import { useLang } from "@/lib/lang";

const HUBS = [
  { id: "food", href: "/food", en: "Food", kn: "ಆಹಾರ" },
  { id: "nature", href: "/nature", en: "Nature", kn: "ಪ್ರಕೃತಿ" },
  { id: "stay", href: "/stay", en: "Stays", kn: "ಗಿರಿಧಾಮ" },
  { id: "heritage", href: "/heritage", en: "Heritage", kn: "ಪರಂಪರೆ" },
  { id: "tourism", href: "/tourism", en: "Tourism", kn: "ಪ್ರವಾಸೋದ್ಯಮ" },
];

export function ExploreHubNav({ active }: { active: string }) {
  const lang = useLang();
  return (
    <nav className="explore-hub-nav" aria-label="Explore Chikkamagaluru">
      {HUBS.map((hub) => {
        const on = hub.id === active;
        return (
          <Link key={hub.id} href={hub.href} aria-current={on ? "page" : undefined} className={on ? "is-active" : undefined}>
            {lang === "kn" ? hub.kn : hub.en}
          </Link>
        );
      })}
    </nav>
  );
}
