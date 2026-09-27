import { Learn } from "@/components/ui/chevrons";
import { TiltLink } from "@/components/ui/motion";
import { CKM } from "@/lib/data";
import type { Story } from "@/lib/types";

/** A tilting card that leads into one Stories chapter (coffee goes to its own page). */
export function WhyCard({ story }: { story: Story }) {
  const coffee = story.id === "coffee";
  const image = coffee && CKM.coffeeOrigin.saint?.image ? CKM.coffeeOrigin.saint.image : story.image;
  return (
    <TiltLink className="why-card tilt-card shine-card" href={coffee ? "/coffee" : `/stories#story-${story.id}`}>
      <div className="media">
        <img src={image} alt={story.title} width={1800} height={1200} loading="lazy" />
      </div>
      <span className="why-card-copy">
        <span className="kicker">{story.kicker}</span>
        <h3>{story.title}</h3>
        <p>{story.paragraphs[0]}</p>
        <span className="text-link t-learn">
          <Learn>Read on</Learn>
        </span>
      </span>
    </TiltLink>
  );
}
