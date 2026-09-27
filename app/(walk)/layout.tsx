import type { Metadata, Viewport } from "next";
import Script from "next/script";
import type { ReactNode } from "react";
import { Chikku } from "@/components/chikku/Chikku";
import "@/styles/walk/fonts.css";
import "@/styles/walk/seq-walk.css";
import "@/styles/walk/bean-flight.css";
import "@/styles/chikku.css";

/* A separate root layout: the walk has its own design system (Onest, vermilion,
   grain) whose global styles would collide with the companion's. Navigating
   between the two is a full page load, which also resets the scroll engine. */

export const metadata: Metadata = {
  icons: { icon: { url: "/assets/favicon.svg", type: "image/svg+xml" } },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#05070a",
};

// Before first paint: always start the walk at the top, and play the aperture
// entrance once per session (never under reduced motion).
const ENTRANCE = `
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
window.scrollTo(0, 0);
try {
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches && !sessionStorage.getItem("b2c-entered")) {
    sessionStorage.setItem("b2c-entered", "1");
    document.documentElement.classList.add("entering");
  }
} catch (e) {}
`;

export default function WalkLayout({ children }: { children: ReactNode }) {
  return (
    // The entrance script adds a class to <html> before React hydrates.
    <html lang="en" suppressHydrationWarning>
      <body>
        <Script id="walk-entrance" strategy="beforeInteractive">
          {ENTRANCE}
        </Script>
        {children}
        <Chikku />
      </body>
    </html>
  );
}
