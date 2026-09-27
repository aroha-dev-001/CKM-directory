import type { Metadata } from "next";
import { PopularStack } from "@/components/places/PopularView";
import { PageShell } from "@/components/site/PageShell";
import { CKM } from "@/lib/data";

export const metadata: Metadata = { title: "Popular tourist places" };

export default function PopularPage() {
  return (
    <PageShell page="popular">
      <PopularStack />
      <section className="section nearby-band">
        <div className="wrap">
          <div className="section-head">
            <p className="kicker">Often bundled, not in this district</p>
            <h2>Hassan is next door.</h2>
            <p className="section-lead">
              2-day blogs add Belur, Halebidu and Yagachi because they sit on the same Bangalore road. They are Hassan
              district sights. This companion will not pretend they are taluks of Chikkamagaluru.
            </p>
          </div>
          <div className="nearby-grid">
            {CKM.nearbyPlaces.map((n) => (
              <article className="nearby-card" key={n.id}>
                <p className="kicker">{n.district}</p>
                <h3>{n.name}</h3>
                <p>{n.blurb}</p>
                <a href={n.url} rel="noopener noreferrer">
                  Karnataka Tourism
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
