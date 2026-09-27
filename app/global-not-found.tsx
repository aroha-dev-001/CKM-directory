import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Learn } from "@/components/ui/chevrons";
import { siteFontVariables } from "@/lib/fonts";
import "@/styles/site/style.css";

// The app has two root layouts ((site) and (walk)), so unmatched URLs are
// served this standalone page, which brings its own <html>, styles and fonts.
export const metadata: Metadata = {
  title: "Page not found · Chikkamagaluru",
  icons: { icon: { url: "/assets/favicon.svg", type: "image/svg+xml" } },
};

export default function GlobalNotFound() {
  return (
    <html lang="en" className={siteFontVariables}>
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="page-enter" data-page="not-found">
          <section className="page-hero">
            <div className="wrap">
              <p className="kicker">Not on this map</p>
              <h1>That page is not in the companion</h1>
              <p className="section-lead">
                The address may be from an older version of this site. Every place, taluk and story is still reachable from
                the district map or the places list.
              </p>
              <p>
                <Link className="btn btn-dark shine t-learn" href="/">
                  <Learn>Back to the companion</Learn>
                </Link>{" "}
                <Link className="btn btn-line" href="/places">
                  Browse places
                </Link>{" "}
                <Link className="btn btn-line" href="/map">
                  District map
                </Link>
              </p>
            </div>
          </section>
          <SiteFooter />
        </main>
      </body>
    </html>
  );
}
