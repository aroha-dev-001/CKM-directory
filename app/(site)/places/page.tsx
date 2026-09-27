import type { Metadata } from "next";
import { PlacesView } from "@/components/places/PlacesView";
import { PageShell } from "@/components/site/PageShell";

export const metadata: Metadata = { title: "Places to visit" };

export default function PlacesPage() {
  return (
    <PageShell page="places">
      <PlacesView />
    </PageShell>
  );
}
