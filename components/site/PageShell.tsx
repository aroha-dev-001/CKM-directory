import type { ReactNode } from "react";
import { SiteFooter } from "./SiteFooter";

/**
 * Every companion page: the main landmark (with the entry fade) and the footer.
 * `page` is exposed as `data-page` for the few page-scoped rules in style.css.
 */
export function PageShell({ page, children }: { page: string; children: ReactNode }) {
  return (
    <main id="main" className="page-enter" data-page={page}>
      {children}
      <SiteFooter />
    </main>
  );
}
