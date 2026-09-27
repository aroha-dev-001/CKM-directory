import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { FoodCard } from "@/components/food/FoodCard";
import { PageShell } from "@/components/site/PageShell";
import { T } from "@/components/site/T";
import { SeasonExplorer } from "@/components/stories/SeasonExplorer";
import { StoryIndex } from "@/components/stories/StoryIndex";
import { Learn } from "@/components/ui/chevrons";
import { CKM, pad2 } from "@/lib/data";
import type { Story } from "@/lib/types";

export const metadata: Metadata = { title: "Coffee, culture and seasons" };

function CoffeeBeats() {
  return CKM.coffeeOrigin.chapters.map((ch, j) => {
    const n = pad2(j + 1);
    return (
      <article className="story-beat story-beat-scene" key={n}>
        <Link className="story-beat-thumb" href={`/coffee#origin-${n}`}>
          <img src={ch.image} alt={ch.caption || ch.title} width={900} height={600} loading="lazy" />
        </Link>
        <div>
          <p className="story-beat-num">{n}</p>
          <h3>{ch.title}</h3>
          <p>{String(ch.text || "").split(/\n\n/)[0]}</p>
        </div>
      </article>
    );
  });
}

function StoryChapter({ story, num, flip }: { story: Story; num: string; flip: boolean }) {
  const coffee = story.id === "coffee";
  const origin = CKM.coffeeOrigin;
  return (
    <section
      className={`story-chapter${flip ? " is-flip" : " is-band"}`}
      id={`story-${story.id}`}
      aria-labelledby={`story-title-${story.id}`}
    >
      <div className="wrap story-chapter-inner">
        {coffee ? (
          <figure className="story-media story-media-mosaic">
            {origin.chapters.slice(0, 4).map((ch, j) => (
              <Link href={`/coffee#origin-${pad2(j + 1)}`} key={j}>
                <img src={ch.image} alt={ch.caption || ch.title} width={900} height={600} loading="lazy" />
              </Link>
            ))}
            <figcaption>{origin.caption || ""}</figcaption>
          </figure>
        ) : (
          <figure className="story-media">
            <img src={story.image} alt={story.title} width={1800} height={1200} loading="lazy" />
          </figure>
        )}
        <div className="story-chapter-copy">
          <p className="story-num">{num}</p>
          <p className="kicker">{story.kicker}</p>
          <h2 id={`story-title-${story.id}`}>{story.title}</h2>
          <div className="story-beats">
            {coffee ? (
              <CoffeeBeats />
            ) : (
              story.paragraphs.map((p) => (
                <article className="story-beat" key={p}>
                  <p>{p}</p>
                </article>
              ))
            )}
          </div>
          {coffee && (
            <>
              <p style={{ marginTop: "1.1rem" }}>
                <Link className="text-link t-learn" href="/coffee">
                  <Learn>Open the full coffee story</Learn>
                </Link>
              </p>
              <div className="origin-sources">
                <p className="kicker">Sources</p>
                <ul>
                  {origin.sources.map((src) => (
                    <li key={src.url}>
                      <a href={src.url} rel="noopener noreferrer">
                        {src.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function FoodsChapter({ num }: { num: string }) {
  return (
    <section className="story-chapter story-chapter--foods" id="malnad-foods" aria-labelledby="foods-title">
      <div className="wrap">
        <p className="story-num">{num}</p>
        <p className="kicker">Malnad kitchen</p>
        <h2 id="foods-title">Rice, leaf, and a cup from the hill</h2>
        <p className="section-lead">
          Six dishes the ghats still cook. Open a card for the full origin note on its own page. Photographs are companion
          stills, this page does not sell a meal.
        </p>
        <div className="pop-grid food-grid">
          {CKM.malnadFoods.map((dish) => (
            <FoodCard dish={dish} key={dish.id} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function StoriesPage() {
  // Chapter 01 is Seasons; stories follow, with Malnad kitchen right after Food.
  const index = [{ href: "#seasons", label: "Seasons" }];
  const chapters: ReactNode[] = [];
  let chapter = 2;
  CKM.stories.forEach((story, i) => {
    index.push({ href: `#story-${story.id}`, label: story.kicker });
    chapters.push(<StoryChapter story={story} num={pad2(chapter++)} flip={i % 2 === 1} key={story.id} />);
    if (story.id === "food") {
      index.push({ href: "#malnad-foods", label: "Malnad kitchen" });
      chapters.push(<FoodsChapter num={pad2(chapter++)} key="malnad-foods" />);
    }
  });
  index.push({ href: "#gallery", label: "Photographs" });

  return (
    <PageShell page="stories">
      <section className="page-hero">
        <div className="wrap">
          <p className="kicker">Stories</p>
          <h1>Coffee, culture, kitchen, care</h1>
          <p className="section-lead">
            Separate readings of the district, seasons, coffee, stone, a Malnad kitchen, and the forest that is not a
            backdrop. Each chapter stands on its own.
          </p>
          <StoryIndex items={index} />
        </div>
      </section>
      <section className="story-chapter story-chapter--seasons" id="seasons" aria-labelledby="seasons-title">
        <div className="wrap">
          <p className="story-num">01</p>
          <p className="kicker">
            <T k="nav_seasons" />
          </p>
          <h2 id="seasons-title">Four weathers, four districts</h2>
          <p className="section-lead">
            Clear ridges in winter, thinner falls by summer, a monsoon that turns the ghats to water, and an October still
            dripping green.
          </p>
          <SeasonExplorer />
        </div>
      </section>
      {chapters}
      <section className="story-chapter" id="gallery" aria-labelledby="gallery-title">
        <div className="wrap">
          <p className="story-num">{pad2(chapter)}</p>
          <p className="kicker">Field photographs</p>
          <h2 id="gallery-title">A quieter look</h2>
          <p className="section-lead">Stills from people who walked here, credited on the visit page.</p>
          <div className="gallery-grid">
            {CKM.gallery.map((g) => (
              <figure className="gallery-item" key={g.image}>
                <img src={g.image} alt={g.caption} width={1800} height={1200} loading="lazy" />
                <figcaption>
                  {g.caption}, {g.credit}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
