import type { Metadata } from "next";
import Link from "next/link";
import { WhyCard } from "@/components/explore/StoryCard";
import { PlaceSections } from "@/components/places/PlaceSections";
import { ExploreHubNav } from "@/components/site/ExploreHubNav";
import { PageShell } from "@/components/site/PageShell";
import { Learn } from "@/components/ui/chevrons";
import { CKM } from "@/lib/data";

export const metadata: Metadata = { title: "Heritage" };

export default function HeritagePage() {
  return (
    <PageShell page="heritage">
      <section className="page-hero">
        <div className="wrap">
          <p className="kicker">Explore · Heritage</p>
          <h1>Stone, matha, and seven Mocha seeds</h1>
          <p className="section-lead">Hoysala east, living shrines on the Tunga, and the coffee story the district still tells.</p>
          <ExploreHubNav active="heritage" />
        </div>
      </section>
      <section className="section why-section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="section-head">
            <p className="kicker">Why this district</p>
            <h2>Coffee and stone.</h2>
          </div>
          <div className="why-grid">
            {CKM.stories
              .filter((s) => s.id === "culture" || s.id === "coffee")
              .map((s) => (
                <WhyCard story={s} key={s.id} />
              ))}
          </div>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="section-head">
            <p className="kicker">Shrines and working country</p>
            <h2>Temples, forts, coffee hills.</h2>
          </div>
          <PlaceSections categories={["temples", "forts", "heritage"]} />
          <p>
            <Link className="text-link t-learn" href="/places">
              <Learn>All places</Learn>
            </Link>
          </p>
        </div>
      </section>
    </PageShell>
  );
}
