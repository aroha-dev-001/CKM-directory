import type { Metadata } from "next";
import Link from "next/link";
import { PlaceSections } from "@/components/places/PlaceSections";
import { ExploreHubNav } from "@/components/site/ExploreHubNav";
import { PageShell } from "@/components/site/PageShell";
import { Learn } from "@/components/ui/chevrons";
import { MagneticLink, TiltLink } from "@/components/ui/motion";
import { CKM, placeById } from "@/lib/data";

export const metadata: Metadata = { title: "Hill air" };

export default function StayPage() {
  return (
    <PageShell page="stay">
      <section className="page-hero">
        <div className="wrap">
          <p className="kicker">Explore · Stays</p>
          <h1>Hill air, not a room list</h1>
          <p className="section-lead">
            Kemmanagundi’s garden hills, visitor notes, and a private trip sketch stored in this browser. Homestays, hotels
            and payments are intentionally absent.
          </p>
          <ExploreHubNav active="stay" />
        </div>
      </section>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="section-head">
            <p className="kicker">Hill station</p>
            <h2>Where the old garden still holds the night air.</h2>
            <p className="section-lead">
              A hill station is not a booking desk. Kemmanagundi is the Wodeyar summer ground this companion actually
              describes.
            </p>
          </div>
          <PlaceSections categories={["hill-station"]} />
        </div>
      </section>
      <section className="section circuits-home" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="section-head-row">
            <div className="section-head">
              <p className="kicker">Trip sketches</p>
              <h2>Three ways through the hills.</h2>
              <p className="section-lead">
                Three quiet loops through peaks, water and living shrines. This companion does not download a file or sell a
                tour.
              </p>
            </div>
            <Link className="text-link t-learn" href="/places">
              <Learn>All places</Learn>
            </Link>
          </div>
          <div className="home-circuit-grid">
            {CKM.circuits.map((c) => (
              <TiltLink className="home-circuit tilt-card shine-card" href="/places" key={c.id}>
                <div className="media">
                  <img src={c.image} alt={c.title} width={1800} height={1200} loading="lazy" />
                </div>
                <span className="home-circuit-copy">
                  <span className="kicker">{c.kicker}</span>
                  <h3>{c.title}</h3>
                  <p>{c.text}</p>
                  <p className="home-circuit-stops">
                    {c.places
                      .map((id) => placeById(id)?.name)
                      .filter(Boolean)
                      .slice(0, 4)
                      .join(" · ")}
                  </p>
                  <span className="text-link t-learn">
                    <Learn>Browse places</Learn>
                  </span>
                </span>
              </TiltLink>
            ))}
          </div>
        </div>
      </section>
      <section className="section close-band" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="section-head">
            <p className="kicker">Before you leave town</p>
            <h2>{CKM.guide.title}</h2>
            <p className="section-lead">{CKM.guide.intro}</p>
          </div>
          <div className="guide-grid">
            {CKM.guide.cards.map((c) => (
              <article className="guide-card" key={c.title}>
                <h3>{c.title}</h3>
                <p>{c.text}</p>
              </article>
            ))}
          </div>
          <div className="close-actions">
            <MagneticLink className="btn btn-dark shine t-learn" href="/visit">
              <Learn>Visitor information</Learn>
            </MagneticLink>
            <Link className="btn btn-line" href="/places">
              Browse places
            </Link>
            <a className="btn btn-line" href={CKM.official.district_en} rel="noopener noreferrer">
              District tourism
            </a>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
