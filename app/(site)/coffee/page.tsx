import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/site/PageShell";
import { Learn } from "@/components/ui/chevrons";
import { MagneticLink } from "@/components/ui/motion";
import { CKM, pad2 } from "@/lib/data";

export const metadata: Metadata = { title: "Seven seeds from Mocha" };

/** Eight illustrated scenes, Mocha to shade canopy, as one long read. */
export default function CoffeePage() {
  const origin = CKM.coffeeOrigin;
  return (
    <PageShell page="coffee">
      <section className="page-hero">
        <div className="wrap">
          <p className="kicker">{origin.kicker || "How coffee reached these hills"}</p>
          <h1>{origin.title || "Seven seeds from Mocha"}</h1>
          <p className="section-lead">{origin.lede || ""}</p>
          <p>
            <Link className="text-link t-learn" href="/bean-to-cup">
              <Learn>Open Baba Budan, then the cup</Learn>
            </Link>{" "}
            <Link className="text-link t-learn" href="/heritage">
              <Learn>Back to heritage</Learn>
            </Link>
          </p>
        </div>
      </section>
      <section className="story-longread coffee-longread">
        <div className="wrap">
          <div className="origin-scenes">
            {origin.chapters.map((ch, i) => {
              const n = pad2(i + 1);
              return (
                <article className={`origin-scene${i % 2 === 1 ? " is-flip" : ""}`} id={ch.id || `origin-${n}`} key={n}>
                  {ch.image && (
                    <figure className="origin-scene-media">
                      <img
                        src={ch.image}
                        alt={ch.caption || ch.title}
                        width={1800}
                        height={1200}
                        decoding="async"
                        loading={i < 2 ? undefined : "lazy"}
                      />
                      <figcaption>{ch.caption || ""}</figcaption>
                    </figure>
                  )}
                  <div className="origin-chapter">
                    <p className="story-beat-num">{n}</p>
                    {ch.kicker && <p className="kicker origin-kicker">{ch.kicker}</p>}
                    <h3>{ch.title}</h3>
                    {String(ch.text || "")
                      .split(/\n\n/)
                      .filter(Boolean)
                      .map((p) => (
                        <p key={p}>{p}</p>
                      ))}
                  </div>
                </article>
              );
            })}
          </div>
          <div className="origin-sources">
            <p className="kicker">Sources</p>
            <ul>
              {origin.sources.map((s) => (
                <li key={s.url}>
                  <a href={s.url} rel="noopener noreferrer">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <p className="section-lead" style={{ marginTop: "2rem" }}>
            The ridge that holds his shrine is still walked as Baba Budangiri / Datta Peetha. Hours and crowd rules belong to
            the shrine, not to this page.
          </p>
          <p>
            <MagneticLink className="btn btn-dark shine t-learn" href="/places?id=baba-budangiri">
              <Learn>Open Baba Budangiri</Learn>
            </MagneticLink>{" "}
            <Link className="btn btn-line" href="/stories#story-coffee">
              Coffee chapter on Stories
            </Link>
          </p>
        </div>
      </section>
    </PageShell>
  );
}
