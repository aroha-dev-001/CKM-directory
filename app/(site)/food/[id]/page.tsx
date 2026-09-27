import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FoodCard } from "@/components/food/FoodCard";
import { PageShell } from "@/components/site/PageShell";
import { Learn } from "@/components/ui/chevrons";
import { CKM } from "@/lib/data";

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return CKM.malnadFoods.map((dish) => ({ id: dish.id }));
}

function dishById(id: string) {
  return CKM.malnadFoods.find((dish) => dish.id === id);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const dish = dishById((await params).id);
  return { title: dish ? `${dish.name} · Malnad kitchen` : "Malnad kitchen" };
}

export default async function DishPage({ params }: Props) {
  const dish = dishById((await params).id);
  if (!dish) notFound();
  return (
    <PageShell page="food">
      <section className="page-hero">
        <div className="wrap">
          <p className="kicker">{dish.kicker}</p>
          <h1>{dish.name}</h1>
          <p className="hero-kn" lang="kn">
            {dish.kannada}
          </p>
          <p>
            <Link className="text-link t-learn" href="/food">
              <Learn>All Malnad dishes</Learn>
            </Link>
          </p>
        </div>
      </section>
      <section className="story-longread">
        <div className="wrap food-story">
          <figure className="food-story-media">
            <img src={dish.image} alt={dish.name} width={1800} height={1200} />
            <figcaption>Companion photograph, {dish.name}. Not a restaurant listing.</figcaption>
          </figure>
          <div className="food-story-copy">
            <p className="kicker">The story</p>
            <p className="food-story-text">{dish.story}</p>
            <p className="pop-source">
              Regional kitchen tradition. Read more:{" "}
              <a href={dish.source.url} rel="noopener noreferrer">
                {dish.source.label}
              </a>
            </p>
          </div>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="section-head">
            <p className="kicker">Also from these hills</p>
            <h2>More Malnad plates.</h2>
          </div>
          <div className="pop-grid food-grid">
            {CKM.malnadFoods
              .filter((item) => item.id !== dish.id)
              .map((item) => (
                <FoodCard dish={item} compact key={item.id} />
              ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
