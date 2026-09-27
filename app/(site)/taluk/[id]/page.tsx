import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TalukView } from "@/components/map/TalukView";
import { PageShell } from "@/components/site/PageShell";
import { CKM, talukById } from "@/lib/data";
import { buildMapModel } from "@/lib/map-model";

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return CKM.taluks.map((t) => ({ id: t.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const taluk = talukById((await params).id);
  return {
    title: taluk ? taluk.listName || taluk.name : "Taluk guide",
    description: taluk?.blurb,
  };
}

export default async function TalukPage({ params }: Props) {
  const { id } = await params;
  if (!talukById(id)) notFound();
  return (
    <PageShell page="taluk">
      <TalukView id={id} model={buildMapModel(id)} />
    </PageShell>
  );
}
