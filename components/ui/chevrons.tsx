import type { ReactNode } from "react";

/** "Learn more" label with the transitions.dev chevron that opens on hover. */
export function Learn({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <span className="t-learn-chevron" aria-hidden="true">
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path className="t-learn-arm t-learn-arm-top" d="M6 4L10 8" />
          <path className="t-learn-arm t-learn-arm-bot" d="M10 8L6 12" />
        </svg>
      </span>
    </>
  );
}

export function AccChevron() {
  return (
    <span className="t-acc-chevron" aria-hidden="true">
      <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M4 6.5L8 10.5L12 6.5" vectorEffect="non-scaling-stroke" />
      </svg>
    </span>
  );
}
