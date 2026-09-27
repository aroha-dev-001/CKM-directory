import type { Metadata } from "next";
import { preload } from "react-dom";
import { BeanCursor } from "@/components/walk/BeanCursor";
import { BeanToCupWalk } from "@/components/walk/BeanToCupWalk";

export const metadata: Metadata = {
  title: "Baba Budan, then the cup · Chikkamagaluru",
  description:
    "How coffee reached Chikkamagaluru: Baba Budan’s seven Mocha seeds, shade planting, cherry, roast, filter coffee. Scroll the walk. Not a shop.",
};

/** Bean to cup: a sticky full-viewport flight through fifteen stills, saint first, then the crop. */
export default function BeanToCupPage() {
  preload("/assets/bean-to-cup/story-00-baba-budan.webp", { as: "image", fetchPriority: "high" });
  return (
    <>
      <BeanToCupWalk />
      <BeanCursor />
    </>
  );
}
