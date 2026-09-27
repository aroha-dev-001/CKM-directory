import type { Metadata } from "next";
import { PageShell } from "@/components/site/PageShell";
import { T } from "@/components/site/T";
import { Learn } from "@/components/ui/chevrons";
import { MagneticLink } from "@/components/ui/motion";
import { CKM, placeById } from "@/lib/data";

export const metadata: Metadata = { title: "Plan a trip" };

export default function PlanPage() {
  return (
    <PageShell page="plan">
      <section className="page-hero">
        <div className="wrap">
          <p className="kicker">
            <T k="nav_plan" />
          </p>
          <h1>Three ways through the district</h1>
          <p className="section-lead">
            Read the sketches here. This companion does not download a trip pack, stamp a passport, or keep a file on your
            phone.
          </p>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="circuit-grid">
            {CKM.circuits.map((c) => (
              <article className="circuit-card" key={c.id}>
                <div className="circuit-media">
                  <img src={c.image} alt={c.title} width={1800} height={1200} loading="lazy" />
                </div>
                <div className="pad">
                  <p className="kicker">{c.kicker}</p>
                  <h3>{c.title}</h3>
                  <p>{c.text}</p>
                  <p className="section-lead">
                    {c.places
                      .map((id) => placeById(id)?.name)
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <MagneticLink className="btn btn-dark shine t-learn" href="/places">
                    <Learn>Open places</Learn>
                  </MagneticLink>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
