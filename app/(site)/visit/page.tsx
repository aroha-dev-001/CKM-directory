import type { Metadata } from "next";
import { Fragment, type ReactNode } from "react";
import { PageShell } from "@/components/site/PageShell";
import { T } from "@/components/site/T";
import { FaqList } from "@/components/visit/FaqList";
import { CKM } from "@/lib/data";

export const metadata: Metadata = { title: "Visitor information" };

const LINKS: [keyof typeof CKM.official, string][] = [
  ["district_en", "District tourism (English)"],
  ["district_kn", "ಜಿಲ್ಲಾ ಪ್ರವಾಸೋದ್ಯಮ (ಕನ್ನಡ)"],
  ["how_to_reach", "How to reach"],
  ["helpline", "Helpline"],
  ["forest", "Forest department"],
  ["ksrtc", "KSRTC"],
  ["karnataka_tourism", "Karnataka Tourism"],
];

function SectionHead({ kicker, title }: { kicker: ReactNode; title: string }) {
  return (
    <div className="section-head" style={{ marginTop: "2.6rem" }}>
      <p className="kicker">{kicker}</p>
      <h2>{title}</h2>
    </div>
  );
}

export default function VisitPage() {
  const { about } = CKM;
  return (
    <PageShell page="visit">
      <section className="page-hero">
        <div className="wrap">
          <p className="kicker">Visitor information</p>
          <h1>Arrive, move, ask permission</h1>
          <p className="section-lead">
            The practical desk: access, transport, forests, packing and questions. Fees and live closures live on official
            pages.
          </p>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="about-layout">
            <div className="about-media">
              <img src={about.image} alt={about.title} width={1800} height={1200} loading="lazy" />
            </div>
            <div>
              <p className="kicker">{about.kicker}</p>
              <h2>{about.title}</h2>
              {about.paragraphs.map((p) => (
                <p className="section-lead" style={{ marginTop: "0.9rem" }} key={p}>
                  {p}
                </p>
              ))}
            </div>
          </div>
          <div className="essential-grid" style={{ marginTop: "2.4rem" }}>
            {Object.entries(CKM.essentials).map(([key, block]) => (
              <article className="essential-card" key={key}>
                <h3>{block.title}</h3>
                {block.items.map((item) => (
                  <Fragment key={item.title}>
                    <h4>{item.title}</h4>
                    <p>{item.text}</p>
                  </Fragment>
                ))}
              </article>
            ))}
          </div>
          <div className="link-row">
            {LINKS.map(([key, label]) => (
              <a href={CKM.official[key]} rel="noopener noreferrer" key={key}>
                {label}
              </a>
            ))}
          </div>
          <SectionHead kicker="What to carry" title="A hill bag" />
          <ul className="pack-list">
            {CKM.packing.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="conduct-grid" style={{ marginTop: "2rem" }}>
            <article className="conduct-card">
              <h3>Do</h3>
              <ul>
                {CKM.conduct.do.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <article className="conduct-card">
              <h3>Don’t</h3>
              <ul>
                {CKM.conduct.dont.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </div>
          <SectionHead kicker="Questions" title="Before you set out" />
          <FaqList faqs={CKM.faqs} />
          <SectionHead kicker="Local visitor guide" title={CKM.guide.title} />
          <div className="guide-grid">
            {CKM.guide.cards.map((c) => (
              <article className="guide-card" key={c.title}>
                <h3>{c.title}</h3>
                <p>{c.text}</p>
              </article>
            ))}
          </div>
          <SectionHead kicker={<T k="credits" />} title="Photographs & licences" />
          <div className="credit-list">
            {CKM.credits.map((c, i) => (
              <p key={`${c.place}-${i}`}>
                {c.place}, {c.artist},{" "}
                {c.url?.includes("commons.wikimedia.org") ? (
                  <>
                    {c.license}, via{" "}
                    <a href={c.url} rel="noopener noreferrer">
                      Wikimedia Commons
                    </a>
                  </>
                ) : (
                  c.license
                )}
              </p>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
