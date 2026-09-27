import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Chikku } from "@/components/chikku/Chikku";
import { PlaceModalProvider } from "@/components/site/PlaceModal";
import { SiteEffects } from "@/components/site/SiteEffects";
import { SiteHeader } from "@/components/site/SiteHeader";
import { siteFontVariables } from "@/lib/fonts";
import "@/styles/site/style.css";
import "@/styles/site/carousel.css";
import "@/styles/site/drift-wall.css";
import "@/styles/site/accordion-gallery.css";
import "@/styles/site/planner.css";
import "@/styles/chikku.css";

export const metadata: Metadata = {
  title: {
    default: "Visit Chikkamagaluru - Land of Coffee",
    template: "%s · Chikkamagaluru",
  },
  description:
    "An independent companion for discovering Chikkamagaluru: peaks, waterfalls, temples, forests and seasons. Not a government site. Not a booking service. Nothing here is downloadable.",
  icons: { icon: { url: "/assets/favicon.svg", type: "image/svg+xml" } },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0c1f13",
};

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={siteFontVariables}>
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <PlaceModalProvider>
          <SiteHeader />
          {children}
        </PlaceModalProvider>
        <SiteEffects />
        <Chikku />
      </body>
    </html>
  );
}
