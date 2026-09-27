import type { Metadata } from "next";
import Link from "next/link";
import { LegacyIdRedirect } from "@/components/site/LegacyIdRedirect";
import { PageShell } from "@/components/site/PageShell";
import { Learn } from "@/components/ui/chevrons";
import { CKM } from "@/lib/data";

export const metadata: Metadata = { title: "Taluk guide" };

export default function TalukIndexPage() {
  return (
    <PageShell page="taluk">
      <LegacyIdRedirect base="/taluk" ids={CKM.taluks.map((t) => t.id)} />
      <section className="page-hero">
        <div className="wrap">
          <p className="kicker">Taluk guide</p>
          <h1>Choose a taluk</h1>
          <p className="section-lead">
            This page needs a taluk in the address. Open the district map and click one of the nine.
          </p>
          <Link className="btn btn-dark shine" href="/map">
            <Learn>Nine-taluk map</Learn>
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
