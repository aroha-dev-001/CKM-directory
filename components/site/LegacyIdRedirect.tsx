"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { QuerySync } from "./QuerySync";

/**
 * The static site used `taluk.html?id=kadur` and `food.html?id=neer-dosa`.
 * Those pages now live at `/taluk/kadur` and `/food/neer-dosa`; forward old links
 * (hash included) when the id is one we know.
 */
export function LegacyIdRedirect({ base, ids }: { base: string; ids: string[] }) {
  const router = useRouter();
  const onChange = useCallback(
    (params: URLSearchParams) => {
      const id = params.get("id");
      if (id && ids.includes(id)) router.replace(`${base}/${encodeURIComponent(id)}${window.location.hash}`);
    },
    [base, ids, router]
  );
  return <QuerySync onChange={onChange} />;
}
