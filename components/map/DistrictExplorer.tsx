"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Learn } from "@/components/ui/chevrons";
import { useMagnetic } from "@/components/ui/motion";
import { CKM, orderedTaluks, placesInTaluk, talukById, talukLabel } from "@/lib/data";
import { useLang } from "@/lib/lang";
import type { MapModel } from "@/lib/map-model";
import { talukMetrics } from "@/lib/statistics";
import { DistrictMap } from "./DistrictMap";

/**
 * Nine-taluk choropleth with the district index beside it. The homepage band
 * (`home`) and the /map page (`page`) share it; selecting a taluk updates the
 * summary and the call to action, clicking one opens its taluk page.
 */
export function DistrictExplorer({ model, mode }: { model: MapModel; mode: "home" | "page" }) {
  const lang = useLang();
  const router = useRouter();
  const magnetic = useMagnetic<HTMLAnchorElement>();
  const [selected, setSelected] = useState("");
  const [hovered, setHovered] = useState("");

  const home = mode === "home";
  const taluk = talukById(selected);
  const label = talukLabel(taluk, lang);
  const count = selected ? placesInTaluk(selected).length : 0;
  const summary = !taluk
    ? home
      ? "Click a taluk to open its places."
      : "Nine taluks. Places wait on each taluk’s own page."
    : count === 0
      ? `${label}, no places in this companion yet. Open the taluk page for the boundary.`
      : `${label}, ${count} place${count === 1 ? "" : "s"}. Click to open the taluk page.`;

  const choose = (id: string, activate: boolean) => {
    setSelected(id);
    if (activate) router.push(`/taluk/${id}`);
  };

  const copy = home ? (
    <div className="district-copy">
      <p className="kicker">Explore the district</p>
      <h2>Nine taluks, endless experiences.</h2>
      <p className="section-lead">
        From Mullayanagiri’s cloud line to the temples of Sringeri and the tiger forests of Bhadra · Chikkamagaluru is a
        district of contrasts. Explore by taluk to see what awaits you.
      </p>
      <Link className="btn btn-dark shine t-learn" ref={magnetic} href={selected ? `/taluk/${selected}` : "/map"}>
        <Learn>View district map</Learn>
      </Link>
    </div>
  ) : (
    <div className="district-copy">
      <p className="kicker">Explore the district</p>
      <h1>Nine taluks, endless experiences.</h1>
      <p className="section-lead">
        Sage fills follow how many places this companion holds in each taluk. Click a shape, or a name, to open that
        taluk’s page. Places are marked only there. Boundaries are OpenStreetMap reference, not a survey.
      </p>
      <Link
        className="btn btn-dark shine t-learn"
        id="taluk-places-cta"
        ref={magnetic}
        href={selected ? `/taluk/${selected}` : "/places"}
      >
        <Learn>Browse all places</Learn>
      </Link>
    </div>
  );

  return (
    <section
      className={`district-explorer-section${home ? "" : " district-explorer-page"}`}
      id={home ? "explore-district" : undefined}
    >
      <div className="wrap wrap-wide">
        <div className="district-explorer">
          {copy}
          <div className="district-map-stage">
            <DistrictMap
              model={model}
              mode={mode}
              selected={selected}
              hovered={hovered}
              onHover={setHovered}
              onChoose={choose}
              className={home ? "choropleth" : "choropleth choropleth-lg"}
              role={home ? undefined : "application"}
              label={home ? undefined : "Interactive Chikkamagaluru taluk map"}
            />
            <span className="map-north" aria-hidden="true">
              <small>N</small>
              <i />
            </span>
          </div>
          <aside className="district-index">
            <div className="district-index-head">
              <span>The district</span>
              <span>{CKM.destinations.length} places</span>
            </div>
            <ul className="taluk-index" id="taluk-index">
              {orderedTaluks().map((t) => {
                const on = t.id === selected;
                return (
                  <li key={t.id} className={on ? "is-active" : undefined}>
                    <Link
                      className="taluk-index-row"
                      href={`/taluk/${t.id}`}
                      aria-current={selected ? on : undefined}
                      onClick={() => setSelected(t.id)}
                      onMouseEnter={() => setHovered(t.id)}
                      onMouseLeave={() => setHovered("")}
                    >
                      <span className="taluk-index-name">{talukLabel(t, lang)}</span>
                      <span className="taluk-index-dots" aria-hidden="true" />
                      <span className="taluk-index-count">{t.count}</span>
                      <span className="taluk-index-go" aria-hidden="true">
                        →
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <p className="taluk-summary" id="taluk-summary">
              {summary}
            </p>
            {home && <TalukMetrics id={selected} />}
            <p className="taluk-footnote">
              {home
                ? "Kalasa and Ajjampura were carved out of Mudigere and Tarikere after older maps were drawn. Each is shown here with its current OSM boundary. The map uses nine current administrative taluks, not a historical grouping."
                : CKM.mapNote}
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}

function TalukMetrics({ id }: { id: string }) {
  if (!id) return <div id="taluk-metrics" className="taluk-metrics" hidden />;
  const m = talukMetrics(id);
  const cats = m.categories
    .slice(0, 4)
    .map((c) => `${c.label} ${c.count}`)
    .join(" · ");
  const featured = m.featured.map((p) => p.name).join(", ");
  return (
    <div id="taluk-metrics" className="taluk-metrics">
      <p>
        {m.places.length} documented{cats ? `, ${cats}` : ""}.{m.permitCount ? ` ${m.permitCount} permit-noted.` : ""}
      </p>
      {featured && <p>Featured: {featured}.</p>}
    </div>
  );
}
