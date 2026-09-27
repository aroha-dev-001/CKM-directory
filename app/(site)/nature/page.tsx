import type { Metadata } from "next";
import Link from "next/link";
import { PlaceSections } from "@/components/places/PlaceSections";
import { ExploreHubNav } from "@/components/site/ExploreHubNav";
import { PageShell } from "@/components/site/PageShell";
import { Bi, T } from "@/components/site/T";
import { Learn } from "@/components/ui/chevrons";
import { TiltLink } from "@/components/ui/motion";
import { CKM, seasonImage } from "@/lib/data";

export const metadata: Metadata = { title: "Nature" };

const NATURE = ["waterfalls", "lakes", "dams", "peaks", "viewpoints", "treks", "wildlife"];

export default function NaturePage() {
  const responsible = CKM.stories.find((s) => s.id === "responsible");
  return (
    <PageShell page="nature">
      <section className="page-hero">
        <div className="wrap">
          <p className="kicker">Explore · Nature</p>
          <h1>Ridges, water, and a living forest</h1>
          <p className="section-lead">
            Peaks, falls, lakes and notified forests. Enter Kudremukh and Bhadra only with a permit. Nothing here is a live
            gate.
          </p>
          <ExploreHubNav active="nature" />
        </div>
      </section>
      <section className="section" id="seasons-home" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="section-head-row">
            <div className="section-head">
              <p className="kicker">
                <T k="nav_seasons" />
              </p>
              <h2>Four weathers, four districts.</h2>
              <p className="section-lead">Come for the season you can actually walk.</p>
            </div>
            <Link className="text-link t-learn" href="/stories#seasons">
              <Learn>Season notes</Learn>
            </Link>
          </div>
          <div className="season-card-grid">
            {CKM.seasons.map((s) => (
              <Link className="season-card" href="/stories#seasons" key={s.id}>
                <div className="media">
                  <img src={seasonImage(s.id)} alt={s.title} width={1800} height={1200} loading="lazy" />
                </div>
                <span className="season-card-copy">
                  <span className="kicker">
                    <Bi en={s.months} kn={s.kn} />
                  </span>
                  <strong>{s.title}</strong>
                  <span>{s.experiences[0] || ""}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="section-head">
            <p className="kicker">In the open</p>
            <h2>Water, ridge, and forest.</h2>
            <p className="section-lead">The outdoor catalogue from this companion, grouped the way you look for them.</p>
          </div>
          <PlaceSections categories={NATURE} />
          <p>
            <Link className="text-link t-learn" href="/places">
              <Learn>All places</Learn>
            </Link>
          </p>
        </div>
      </section>
      {responsible && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <TiltLink className="story-entry-card tilt-card shine-card" href="/stories#story-responsible">
              <span className="media">
                <img src={responsible.image} alt={responsible.title} width={1800} height={1200} />
              </span>
              <span className="story-entry-copy">
                <span className="kicker">{responsible.kicker}</span>
                <h2>{responsible.title}</h2>
                <p>{responsible.paragraphs[0]}</p>
                <span className="text-link t-learn">
                  <Learn>Read on</Learn>
                </span>
              </span>
            </TiltLink>
          </div>
        </section>
      )}
      <section className="section" id="home-gallery">
        <div className="wrap">
          <div className="section-head-row">
            <div className="section-head">
              <p className="kicker">Field photographs</p>
              <h2>A quieter look.</h2>
            </div>
            <Link className="text-link t-learn" href="/stories#gallery">
              <Learn>Full gallery</Learn>
            </Link>
          </div>
          <div className="home-gallery">
            {CKM.gallery.slice(0, 6).map((g) => (
              <figure className="gallery-item" key={g.image}>
                <img src={g.image} alt={g.caption} width={1800} height={1200} loading="lazy" />
                <figcaption>{g.caption}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
