import type { Metadata } from "next";
import { NumbersSection } from "@/components/numbers/NumbersSection";
import { ExploreHubNav } from "@/components/site/ExploreHubNav";
import { PageShell } from "@/components/site/PageShell";

export const metadata: Metadata = { title: "Tourism figures" };

export default function TourismPage() {
  return (
    <PageShell page="tourism">
      <section className="page-hero">
        <div className="wrap">
          <p className="kicker">Explore · Tourism</p>
          <h1>How the hills were counted</h1>
          <p className="section-lead">
            Published destination entries for 2024 and 2025, set beside the places this companion actually documents. These
            are historical records, not a live gate.
          </p>
          <ExploreHubNav active="tourism" />
        </div>
      </section>
      <NumbersSection />
    </PageShell>
  );
}
