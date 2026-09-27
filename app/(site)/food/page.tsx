import type { Metadata } from "next";
import { FoodCard } from "@/components/food/FoodCard";
import { ExploreHubNav } from "@/components/site/ExploreHubNav";
import { LegacyIdRedirect } from "@/components/site/LegacyIdRedirect";
import { PageShell } from "@/components/site/PageShell";
import { CKM } from "@/lib/data";

export const metadata: Metadata = { title: "Malnad kitchen" };

export default function FoodPage() {
  const foodStory = CKM.stories.find((s) => s.id === "food");
  return (
    <PageShell page="food">
      <LegacyIdRedirect base="/food" ids={CKM.malnadFoods.map((d) => d.id)} />
      <section className="page-hero">
        <div className="wrap">
          <p className="kicker">Explore · Food</p>
          <h1>Rice, leaf, and a cup from the hill</h1>
          <p className="section-lead">
            {foodStory?.paragraphs?.[0] || "Malnad cooking is rice-first. This page does not sell a meal."}
          </p>
          <ExploreHubNav active="food" />
        </div>
      </section>
      <section className="section food-section" id="malnad-foods" aria-labelledby="foods-hub-title" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="section-head">
            <p className="kicker">Malnad kitchen</p>
            <h2 id="foods-hub-title">Open a plate for the origin story.</h2>
            <p className="section-lead">Photographs are companion stills, not a restaurant list.</p>
          </div>
          <div className="pop-grid food-grid">
            {CKM.malnadFoods.map((dish) => (
              <FoodCard dish={dish} key={dish.id} />
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
