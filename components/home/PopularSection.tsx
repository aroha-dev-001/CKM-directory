"use client";

import Link from "next/link";
import { useState } from "react";
import { OpenPlaceButton } from "@/components/places/PlaceSections";
import { Learn } from "@/components/ui/chevrons";
import { Reveal } from "@/components/ui/motion";
import { CKM, placeById } from "@/lib/data";
import { Carousel, type CarouselItem } from "./Carousel";

/** The first eight featured popular places, joined with their catalogue entries. */
const FEATURED = CKM.popularPlaces
  .filter((item) => item.featured)
  .slice(0, 8)
  .flatMap((item) => {
    const place = placeById(item.id);
    return place ? [{ ...item, place }] : [];
  });

const SLIDES: CarouselItem[] = FEATURED.map(({ place, kicker, hours }) => ({
  id: place.id,
  image: place.image,
  alt: place.name,
  kicker: kicker || "",
  title: place.name,
  description: hours || "",
  link: `/places?id=${place.id}`,
}));

export function PopularSection() {
  const [index, setIndex] = useState(0);
  const item = FEATURED[index];

  return (
    <Reveal className="section pop-section" id="popular-places">
      <div className="wrap">
        <div className="section-head">
          <p className="kicker">Popular places</p>
          <h2>Open a card. See why it draws a crowd.</h2>
          <p className="section-lead">
            Eight stops that show up first on visitor lists, typical hours from temple and district pages, not a live board.
            The full set lives on the popular page.
          </p>
          <Link className="text-link t-learn" href="/popular">
            <Learn>All popular places</Learn>
          </Link>
        </div>
        <div className="pop-carousel-layout">
          <div className="pop-carousel-stage">
            <Carousel items={SLIDES} onChange={setIndex} />
          </div>
          <div className="pop-depth-note">
            {item && (
              <>
                <p className="kicker">{item.kicker || ""}</p>
                <h3>{item.place.name}</h3>
                <p>
                  <span className="pop-hours">{item.hours || ""}</span>
                </p>
                <p>{item.hoursDetail || ""}</p>
                <p className="kicker" style={{ marginTop: "0.9rem" }}>
                  Why people come
                </p>
                <p>{item.why || ""}</p>
                <p className="pop-source">
                  Hours and access change. Confirm on{" "}
                  <a href={item.hoursSource?.url || "#"} rel="noopener noreferrer">
                    {item.hoursSource?.label || "the official page"}
                  </a>
                  , this companion does not list fees.
                </p>
                <div className="pop-actions">
                  <OpenPlaceButton className="btn btn-dark shine" placeId={item.place.id}>
                    Open this place
                  </OpenPlaceButton>
                  <Link className="btn btn-line t-learn" href={`/places?id=${item.place.id}`}>
                    Go to places
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Reveal>
  );
}
