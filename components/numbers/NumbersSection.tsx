"use client";

import Link from "next/link";
import { type CSSProperties, useState } from "react";
import { CKM, orderedTaluks } from "@/lib/data";
import {
  MONTHS,
  SOURCE,
  type VisitSort,
  accommodation,
  districtTotals,
  formatCompact,
  formatIndian,
  monthPlan,
  placesForSeason,
  publishedDestinations,
  sortDestinationRows,
  talukMetrics,
} from "@/lib/statistics";

const SORTS: [VisitSort, string][] = [
  ["visits", "2025 visits"],
  ["increase", "Largest increase"],
  ["name", "Destination name"],
];

function VisitorBoard({ sort }: { sort: VisitSort }) {
  const rows = sortDestinationRows(sort);
  const max = Math.max(...rows.flatMap((row) => [row.visits2024, row.visits2025]));
  return (
    <div data-visitor-board>
      <div className="num-legend" aria-hidden="false">
        <span>
          <i className="num-swatch num-swatch--24" /> 2024 recorded visits
        </span>
        <span>
          <i className="num-swatch num-swatch--25" /> 2025 recorded visits
        </span>
      </div>
      <div className="num-chart" data-visitor-chart>
        {rows.map((row) => {
          const arrow = row.direction === "up" ? "▲" : row.direction === "down" ? "▼" : "–";
          const words = row.direction === "up" ? "increase" : row.direction === "down" ? "decrease" : "little change";
          return (
            <div className="num-dest" key={row.id}>
              <div className="num-dest-head">
                <h4>{row.name}</h4>
                <p className={`num-change num-change--${row.direction}`} aria-label={`${row.name} ${words} ${row.changeLabel}`}>
                  <span aria-hidden="true">{arrow}</span> {row.changeLabel}
                </p>
              </div>
              <div
                className="num-bars"
                role="img"
                aria-label={`${row.name}: 2024 ${row.visits2024Label} visits; 2025 ${row.visits2025Label} visits`}
              >
                {(
                  [
                    ["2024", row.visits2024, row.visits2024Label, "24"],
                    ["2025", row.visits2025, row.visits2025Label, "25"],
                  ] as const
                ).map(([year, value, valueLabel, suffix]) => (
                  <div className="num-bar" key={year}>
                    <span className="num-bar-year">{year}</span>
                    <span className="num-bar-track">
                      <span
                        className={`num-bar-fill num-bar-fill--${suffix}`}
                        style={{ "--w": `${((value / max) * 100).toFixed(2)}%` } as CSSProperties}
                      />
                    </span>
                    <span className="num-bar-val">{valueLabel}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="num-table-wrap">
        <table className="num-table">
          <caption>Published destination visits, 2024 and 2025</caption>
          <thead>
            <tr>
              <th scope="col">Destination</th>
              <th scope="col">2024 visits</th>
              <th scope="col">2025 visits</th>
              <th scope="col">Change</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <th scope="row">{row.name}</th>
                <td>{row.visits2024Label}</td>
                <td>{row.visits2025Label}</td>
                <td>
                  {row.changeLabel} {row.direction === "up" ? "up" : row.direction === "down" ? "down" : "unchanged"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SeasonPanel({ monthId }: { monthId: number }) {
  const plan = monthPlan(monthId);
  return (
    <>
      <p className="num-season-name">{plan.seasonName}</p>
      <p className="section-lead">{plan.shortDescription}</p>
      <p className="num-chips-label">Suitable experiences</p>
      <div className="num-chips">
        {CKM.categories
          .filter((c) => plan.suitableCategoryIds.includes(c.id))
          .map((c) => (
            <span className="num-chip" key={c.id}>
              {c.label}
            </span>
          ))}
      </div>
      <p className="num-chips-label">Three places for this weather</p>
      <div className="num-places">
        {placesForSeason(plan.month.seasonId, 3).map((place) => (
          <Link className="num-place" href={`/places?id=${place.id}`} key={place.id}>
            <img src={place.image} alt="" width={400} height={260} loading="lazy" />
            <span>{place.name}</span>
          </Link>
        ))}
      </div>
      <p className="num-consider">
        <strong>On the road and in forest.</strong> {plan.considerations}
      </p>
      <p className="num-pack">
        <strong>Packing note.</strong> {plan.packingNote}
      </p>
      <p className="num-rain-slot" hidden>
        Future rainfall observations will sit here once a multi-year climate series is sourced.
      </p>
      <Link className="text-link t-learn" href={plan.sourceUrl}>
        Complete seasonal guidance
      </Link>
      <p className="num-editorial">
        Editorial month groups, not a live weather board. No rainfall averages or temperature ranges are shown until a
        verified climate series is added.
      </p>
    </>
  );
}

function TalukPanel({ id }: { id: string }) {
  const m = talukMetrics(id);
  if (!m.taluk) return <p>Choose a taluk.</p>;
  const name = m.taluk.listName || m.taluk.name;
  return (
    <>
      <p className="num-taluk-count">
        <strong>{m.places.length}</strong> places documented in {name}
      </p>
      <ul className="num-cat-list">
        {m.categories.length ? (
          m.categories.map((c) => (
            <li key={c.id}>
              {c.label} · {c.count}
            </li>
          ))
        ) : (
          <li>No categories yet.</li>
        )}
      </ul>
      {m.featured.length > 0 && (
        <>
          <p className="num-chips-label">Featured in this taluk</p>
          <ul className="num-featured">
            {m.featured.map((p) => (
              <li key={p.id}>
                <Link href={`/places?id=${p.id}`}>{p.name}</Link>
              </li>
            ))}
          </ul>
        </>
      )}
      <p>
        {m.permitCount > 0
          ? `${m.permitCount} documented ${m.permitCount === 1 ? "place notes a" : "places note a"} forest permit.`
          : "No permit-tagged places in this taluk in the current catalogue."}
      </p>
      <Link className="btn btn-line" href={`/taluk/${m.taluk.id}`}>
        Explore {name}
      </Link>
    </>
  );
}

/** Tourism figures: district totals, the five published destination rows, a month planner and taluk counts. */
export function NumbersSection() {
  const totals = districtTotals();
  const taluks = orderedTaluks();
  const [infoOpen, setInfoOpen] = useState(false);
  const [sort, setSort] = useState<VisitSort>("visits");
  const [month, setMonth] = useState(MONTHS[0].id);
  const [taluk, setTaluk] = useState(taluks[0]?.id || "chikkamagaluru");

  return (
    <section className="num-section" id="chikkamagaluru-in-numbers" aria-label="Tourism statistics">
      <div className="wrap">
        <p className="num-tooltip-line">
          <button
            type="button"
            className="num-info"
            aria-expanded={infoOpen}
            aria-controls="num-info-panel"
            onClick={() => setInfoOpen((open) => !open)}
          >
            About these visits
          </button>
        </p>
        <div className="num-info-panel" id="num-info-panel" hidden={!infoOpen}>
          <p>Recorded visits are destination entries, not necessarily unique travellers.</p>
        </div>
        <ul className="num-metrics">
          <li className="num-card">
            <p className="num-card-value">{formatCompact(totals.y25.visits)}</p>
            <p className="num-card-label">Recorded destination visits</p>
            <p className="num-card-note">Across Chikkamagaluru district in 2025</p>
          </li>
          <li className="num-card">
            <p className="num-card-value">{totals.annualIncreaseDisplay}</p>
            <p className="num-card-label">Annual increase</p>
            <p className="num-card-note">Compared with the reported 2024 district total of {formatIndian(totals.y24.visits)}</p>
          </li>
          <li className="num-card">
            <p className="num-card-value">{publishedDestinations().length}</p>
            <p className="num-card-label">Places documented</p>
            <p className="num-card-note">Destinations currently published in this guide</p>
          </li>
        </ul>
        <p className="num-district-note">
          District totals are the published district figures ({formatIndian(totals.y24.visits)} in 2024;{" "}
          {formatIndian(totals.y25.visits)} in 2025). The five destination rows below do not add up to those totals, other
          locations are included in the district count.
        </p>
      </div>

      <div className="wrap num-block">
        <p className="kicker">Visitor patterns</p>
        <h3>Where recorded visits changed</h3>
        <p className="section-lead">
          Compare published destination visits for 2024 and 2025. These figures measure entries at destinations and may count
          one traveller more than once.
        </p>
        <div className="num-sort" role="group" aria-label="Sort destinations">
          {SORTS.map(([id, label]) => (
            <button type="button" className="num-sort-btn" aria-pressed={sort === id} key={id} onClick={() => setSort(id)}>
              {label}
            </button>
          ))}
        </div>
        <VisitorBoard sort={sort} />
        <p className="num-summary">
          Among the five published destination rows, Datta Peetha recorded the most visits in 2025. Kemmannugundi had the
          largest percentage increase, while Sringeri and Horanadu recorded declines.
        </p>
        <p className="num-source">
          Source:{" "}
          <a href={SOURCE.sourceUrl} rel="noopener noreferrer">
            {SOURCE.sourceTitle}
          </a>
          , Kannada Prabha, published 14 January 2026. Last reviewed 20 September 2026.
        </p>
        <details className="num-read">
          <summary>How to read this data</summary>
          <ul>
            <li>Visits are not necessarily unique travellers.</li>
            <li>The five destination rows do not sum to the complete district total.</li>
            <li>No cause is assigned to increases or decreases.</li>
            <li>Figures are historical, not live.</li>
          </ul>
          <p>{SOURCE.methodologyNote}</p>
        </details>
      </div>

      <div className="wrap num-block">
        <p className="kicker">Travel through the seasons</p>
        <h3>The hills change every month</h3>
        <p className="section-lead">
          Editorial notes from this companion’s seasonal chapter, not a rainfall graph, and not today’s weather.
        </p>
        <div className="num-months" role="tablist" aria-label="Month">
          {MONTHS.map((m) => (
            <button
              type="button"
              className="num-month"
              role="tab"
              id={`num-month-${m.id}`}
              aria-selected={month === m.id}
              aria-controls="num-season-panel"
              key={m.id}
              onClick={() => setMonth(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="num-season-panel" id="num-season-panel" role="tabpanel" aria-labelledby={`num-month-${month}`}>
          <SeasonPanel monthId={month} />
        </div>
      </div>

      <div className="wrap num-block">
        <p className="kicker">Explore the district</p>
        <h3>Nine current taluks, one map.</h3>
        <p className="section-lead">
          Catalogue counts below are from this guide’s published places. The nine-taluk choropleth lives on the homepage and
          the map page, it is not drawn twice here. Kalasa and Ajjampura were carved from Mudigere and Tarikere after older
          maps; the OSM boundaries used there are the current nine taluks, not a historical grouping.
        </p>
        <p>
          <Link className="text-link t-learn" href="/map">
            Open the district map
          </Link>
        </p>
        <div className="num-taluk-layout">
          <div className="num-taluk-list" role="group" aria-label="Taluks">
            {taluks.map((t) => (
              <button
                type="button"
                className="num-taluk-btn"
                aria-pressed={taluk === t.id}
                key={t.id}
                onClick={() => setTaluk(t.id)}
              >
                {t.listName || t.name}
              </button>
            ))}
          </div>
          <div className="num-taluk-panel">
            <TalukPanel id={taluk} />
          </div>
        </div>
      </div>

      <div className="wrap num-block">
        <p className="kicker">Stay notes</p>
        <h3>{accommodation.title}</h3>
        <div className="num-pending">
          <svg className="num-pending-icon" viewBox="0 0 48 48" width="40" height="40" aria-hidden="true">
            <path fill="none" stroke="currentColor" strokeWidth="1.6" d="M8 22 L24 10 L40 22 V40 H8 Z M18 40 V28 H30 V40" />
          </svg>
          <p className="num-pending-kicker">{accommodation.headline}</p>
          <p>{accommodation.supporting}</p>
          <p className="num-pending-note">{accommodation.note}</p>
        </div>
      </div>
    </section>
  );
}
