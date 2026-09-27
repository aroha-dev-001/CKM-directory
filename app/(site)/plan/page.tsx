import type { Metadata } from "next";
import { TripPlanner } from "@/components/plan/TripPlanner";
import { PageShell } from "@/components/site/PageShell";
import { T } from "@/components/site/T";
import { Learn } from "@/components/ui/chevrons";
import { MagneticLink } from "@/components/ui/motion";
import { CKM, placeById } from "@/lib/data";

export const metadata: Metadata = {
  title: "Plan a trip",
  description:
    "Tell the companion how many days you have and what you want to see. It picks the places, orders them into the shortest drive and maps each day. Places only, no rooms or bookings.",
};

/** Each written sketch, as the planner answers that reproduce it. */
const SKETCH_ROUTE: Record<string, string> = {
  "coffee-hills": "days=3&who=couple&love=coffee,peaks&from=chikkamagaluru",
  "temple-terrace": "days=3&who=couple&love=temples&from=sringeri&stay=move",
  "forest-edge": "days=2&who=friends&love=wildlife,peaks&from=tarikere",
};

export default function PlanPage() {
  return (
    <PageShell page="plan">
      <section className="page-hero pl-hero">
        <div className="wrap">
          <p className="kicker">
            <T k="nav_plan" />
          </p>
          <h1>Plan your days in Chikkamagaluru</h1>
          <p className="section-lead">
            Tell us how long you have and what you want to see. We pick the places, put them in the shortest driving order and
            draw each day on the map. Places only: no rooms, no bookings.
          </p>
        </div>
      </section>

      <TripPlanner />

      <section className="section pl-sketches">
        <div className="wrap">
          <div className="section-head">
            <h2>Or start from a sketch</h2>
            <p className="section-lead">Three written routes through the district. Each one opens as a planned route you can change.</p>
          </div>
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
                  <MagneticLink
                    className="btn btn-dark shine t-learn"
                    href={SKETCH_ROUTE[c.id] ? `/plan?${SKETCH_ROUTE[c.id]}` : "/places"}
                    scroll={false}
                  >
                    <Learn>{SKETCH_ROUTE[c.id] ? "Plan this route" : "Open places"}</Learn>
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
