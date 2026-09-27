import Link from "next/link";
import { Learn } from "@/components/ui/chevrons";
import { firstSentence } from "@/lib/data";
import type { MalnadFood } from "@/lib/types";

/** A Malnad kitchen plate linking to its story. `compact` drops the teaser. */
export function FoodCard({ dish, compact = false }: { dish: MalnadFood; compact?: boolean }) {
  return (
    <Link className="pop-card food-card food-card-link shine-card" href={`/food/${dish.id}`}>
      <span className="pop-face">
        <span className="media">
          <img src={dish.image} alt={dish.name} width={1800} height={1200} loading="lazy" />
        </span>
        <span className="pop-face-copy">
          <span className="kicker">{dish.kicker}</span>
          <strong>
            {dish.name}
            <span className="kn">{dish.kannada}</span>
          </strong>
          {!compact && (
            <>
              <span className="pop-why-line">{firstSentence(dish.story)}</span>
              <span className="text-link t-learn">
                <Learn>Read the story</Learn>
              </span>
            </>
          )}
        </span>
      </span>
    </Link>
  );
}
