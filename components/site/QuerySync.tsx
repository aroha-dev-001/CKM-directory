"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function Reader({ onChange }: { onChange: (params: URLSearchParams) => void }) {
  const key = useSearchParams().toString();
  useEffect(() => onChange(new URLSearchParams(key)), [key, onChange]);
  return null;
}

/**
 * Reports the URL query (?id=, ?category=…) after hydration and on every
 * client-side change. It sits in its own Suspense boundary, so the page around
 * it still prerenders in full.
 */
export function QuerySync({ onChange }: { onChange: (params: URLSearchParams) => void }) {
  return (
    <Suspense fallback={null}>
      <Reader onChange={onChange} />
    </Suspense>
  );
}
