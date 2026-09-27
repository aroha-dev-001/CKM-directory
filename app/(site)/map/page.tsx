import type { Metadata } from "next";
import { DistrictExplorer } from "@/components/map/DistrictExplorer";
import { PageShell } from "@/components/site/PageShell";
import { buildMapModel } from "@/lib/map-model";

export const metadata: Metadata = { title: "District map" };

export default function MapPage() {
  return (
    <PageShell page="map">
      <DistrictExplorer model={buildMapModel()} mode="page" />
    </PageShell>
  );
}
