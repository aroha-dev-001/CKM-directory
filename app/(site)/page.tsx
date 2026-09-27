import Link from "next/link";
import { DriftWallSection } from "@/components/home/DriftWallSection";
import { ExploreSection } from "@/components/home/ExploreSection";
import { HeroSlides } from "@/components/home/HeroSlides";
import { PopularSection } from "@/components/home/PopularSection";
import { DistrictExplorer } from "@/components/map/DistrictExplorer";
import { PageShell } from "@/components/site/PageShell";
import { Learn } from "@/components/ui/chevrons";
import { CountUp, MagneticLink, Reveal, TiltLink } from "@/components/ui/motion";
import { CKM } from "@/lib/data";
import { buildMapModel } from "@/lib/map-model";

export default function HomePage() {
  const origin = CKM.coffeeOrigin;
  const ticker = CKM.destinations.map((p) => (
    <span key={p.id}>
      {p.name} <i>{p.kannada}</i>
    </span>
  ));

  return (
    <PageShell page="home">
      <section className="hero" aria-labelledby="hero-title">
        <HeroSlides />
        <div className="hero-scrim" />
        <div className="hero-stage">
          <div className="hero-copy">
            <p className="eyebrow">Chikkamagaluru · Karnataka</p>
            <h1 id="hero-title">
              <span className="hero-kicker">Visit</span>
              <span className="hero-place">Chikkamagaluru</span>
              <span className="hero-tag">Land of Coffee</span>
            </h1>
            <p className="hero-kn" lang="kn">
              ಕಾಫಿ ನಾಡು
            </p>
          </div>
        </div>
      </section>

      <DistrictExplorer model={buildMapModel()} mode="home" />

      <section className="ribbon" id="district-pulse" aria-label="At a glance">
        <div className="wrap ribbon-grid">
          <p>
            <CountUp to={CKM.destinations.length} /> places to read
          </p>
          <p>
            <CountUp to={9} /> taluks on the map
          </p>
          <p>
            <CountUp to={3} /> trip sketches
          </p>
          <p>
            <a href="https://chikkamagaluru.nic.in/en/tourism/" rel="noopener noreferrer">
              Official district tourism
            </a>
          </p>
        </div>
      </section>

      <div className="name-ticker" aria-hidden="true">
        <div className="name-ticker-track">
          <div className="name-ticker-set">{ticker}</div>
          <div className="name-ticker-set">{ticker}</div>
        </div>
      </div>

      <ExploreSection />
      <DriftWallSection />

      <section className="coffee-origin coffee-origin--home" id="bean-to-cup" aria-labelledby="bean-to-cup-title">
        <div className="wrap">
          <div className="section-head">
            <p className="kicker">Bean to cup</p>
            <h2 id="bean-to-cup-title">Baba Budan, then the cup.</h2>
            <p className="section-lead">
              Two acts on one walk: the saint who brought seven Mocha seeds, then shade, cherry, roast, filter coffee. Not a
              shop. Not a booking. Lore is labelled lore.
            </p>
          </div>
          <TiltLink className="story-entry-card tilt-card shine-card" href="/bean-to-cup">
            <span className="media">
              <img
                src={origin.saint?.image || origin.image}
                alt={origin.saint?.caption || origin.title}
                width={1800}
                height={1200}
              />
            </span>
            <span className="story-entry-copy">
              <span className="kicker">{origin.kicker}</span>
              <h2 id="origin-title">{origin.title}</h2>
              <p>{origin.lede}</p>
              <span className="text-link t-learn">
                <Learn>Open the full story</Learn>
              </span>
            </span>
          </TiltLink>
        </div>
      </section>

      <PopularSection />

      <Reveal className="section close-band">
        <div className="wrap">
          <div className="section-head">
            <p className="kicker">Before you leave town</p>
            <h2>Give the peaks a morning.</h2>
            <p className="section-lead">{CKM.guide.intro}</p>
          </div>
          <div className="guide-grid">
            {CKM.guide.cards.slice(0, 3).map((c) => (
              <article className="guide-card" key={c.title}>
                <h3>{c.title}</h3>
                <p>{c.text}</p>
              </article>
            ))}
          </div>
          <div className="close-actions">
            <MagneticLink className="btn btn-dark shine t-learn" href="/places">
              <Learn>Browse places</Learn>
            </MagneticLink>
            <Link className="btn btn-line" href="/visit">
              Visitor information
            </Link>
            <a className="btn btn-line" href={CKM.official.district_en} rel="noopener noreferrer">
              District tourism
            </a>
          </div>
        </div>
      </Reveal>
    </PageShell>
  );
}
